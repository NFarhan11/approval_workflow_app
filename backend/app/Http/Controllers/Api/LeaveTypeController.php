<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveTypeResource;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveTypeController extends Controller
{
    // GET /api/leave-types — every authenticated user needs this list (e.g. to submit a request)
    public function index()
    {
        return LeaveTypeResource::collection(LeaveType::orderBy('name')->get());
    }

    // POST /api/admin/leave-types
    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $leaveType = LeaveType::create($validated);

        return new LeaveTypeResource($leaveType);
    }

    // PATCH /api/admin/leave-types/{leaveType}
    public function update(Request $request, LeaveType $leaveType)
    {
        $validated = $this->validated($request, $leaveType);

        $leaveType->update($validated);

        return new LeaveTypeResource($leaveType);
    }

    private function validated(Request $request, ?LeaveType $leaveType = null): array
    {
        return $request->validate([
            'name'                    => 'required|string|max:255',
            'code'                    => ['required', 'string', 'max:50', Rule::unique('leave_types', 'code')->ignore($leaveType?->id)],
            'is_paid'                 => 'required|boolean',
            'annual_quota'            => 'nullable|integer|min:0',
            'carry_forward_enabled'   => 'required|boolean',
            'carry_forward_max_days'  => 'nullable|integer|min:0',
            'is_active'               => 'required|boolean',
        ]);
    }
}
