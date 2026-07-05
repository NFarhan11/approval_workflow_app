<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Models\ApprovalStep;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Notifications\RequestCreated;
use App\Services\LeaveBalanceService;
use App\Services\WorkingDaysCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class LeaveRequestController extends Controller
{
    public function __construct(
        private WorkingDaysCalculator $workingDays,
        private LeaveBalanceService $balances,
    ) {
    }

    // GET /api/leave-requests
    public function index(Request $request)
    {
        $user = $request->user();

        $requests = match ($user->role) {
            'requester' => LeaveRequest::with(['requester', 'leaveType', 'approvalSteps.approver'])
                                       ->where('requester_id', $user->id)
                                       ->latest()
                                       ->get(),

            'approver'  => LeaveRequest::with(['requester', 'leaveType', 'approvalSteps.approver'])
                                       ->whereHas('approvalSteps', fn ($q) =>
                                           $q->where('approver_id', $user->id)
                                       )
                                       ->latest()
                                       ->get(),

            'admin'     => LeaveRequest::with(['requester', 'leaveType', 'approvalSteps.approver'])
                                       ->latest()
                                       ->get(),
        };

        return LeaveRequestResource::collection($requests);
    }

    // POST /api/leave-requests
    public function store(Request $request)
    {
        $this->authorize('create', LeaveRequest::class);

        $validated = $request->validate([
            'leave_type_id'  => 'required|exists:leave_types,id',
            'start_date'     => 'required|date|after_or_equal:today',
            'end_date'       => 'required|date|after_or_equal:start_date',
            'reason'         => 'required|string|max:1000',
            'approver_ids'   => 'required|array|min:1|max:5',
            'approver_ids.*' => 'exists:users,id',
        ]);

        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $totalDays = $this->workingDays->countBusinessDays($startDate, $endDate);

        if ($leaveType->is_paid) {
            $remaining = $this->balances->remainingDays($request->user(), $leaveType, $startDate->year);

            if ($totalDays > $remaining) {
                return response()->json([
                    'message' => "Insufficient {$leaveType->name} balance. Remaining: {$remaining} day(s), requested: {$totalDays} day(s).",
                ], 422);
            }
        }

        $totalSteps = count($validated['approver_ids']);

        $leaveRequest = LeaveRequest::create([
            'requester_id'  => $request->user()->id,
            'leave_type_id' => $leaveType->id,
            'start_date'    => $validated['start_date'],
            'end_date'      => $validated['end_date'],
            'total_days'    => $totalDays,
            'reason'        => $validated['reason'],
            'status'        => 'pending',
            'current_step'  => 1,
            'total_steps'   => $totalSteps,
        ]);

        // Pre-create all approval steps upfront
        foreach ($validated['approver_ids'] as $index => $approverId) {
            ApprovalStep::create([
                'leave_request_id' => $leaveRequest->id,
                'approver_id'      => $approverId,
                'step_number'      => $index + 1,
                'status'           => 'pending',
            ]);

            // Email notification
            $approver = User::find($approverId);
            $approver->notify(new RequestCreated($leaveRequest));
        }

        $leaveRequest->load(['requester', 'leaveType', 'approvalSteps.approver']);

        return new LeaveRequestResource($leaveRequest);
    }

    // GET /api/leave-requests/{id}
    public function show(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('view', $leaveRequest);

        $leaveRequest->load(['requester', 'leaveType', 'approvalSteps.approver']);

        return new LeaveRequestResource($leaveRequest);
    }

    // DELETE /api/leave-requests/{id}
    public function destroy(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('delete', $leaveRequest);

        $leaveRequest->delete();

        return response()->json(['message' => 'Leave request deleted successfully']);
    }
}
