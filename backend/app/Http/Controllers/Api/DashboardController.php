<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // GET /api/dashboard/stats
    public function stats(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'requester') {
            $requests = LeaveRequest::where('requester_id', $user->id);

            return response()->json(['data' => [
                'total'       => $requests->count(),
                'pending'     => (clone $requests)->where('status', 'pending')->count(),
                'in_progress' => (clone $requests)->where('status', 'in_progress')->count(),
                'approved'    => (clone $requests)->where('status', 'approved')->count(),
                'rejected'    => (clone $requests)->where('status', 'rejected')->count(),
            ]]);
        }

        if ($user->role === 'approver') {
            $stepQuery = \App\Models\ApprovalStep::where('approver_id', $user->id);

            return response()->json(['data' => [
                'total_assigned' => (clone $stepQuery)->count(),
                'pending_action' => (clone $stepQuery)->where('status', 'pending')
                                                      ->whereHas('leaveRequest', fn($q) =>
                                                          $q->whereIn('status', ['pending', 'in_progress'])
                                                            ->whereColumn('current_step', 'approval_steps.step_number')
                                                      )->count(),
                'approved'       => (clone $stepQuery)->where('status', 'approved')->count(),
                'rejected'       => (clone $stepQuery)->where('status', 'rejected')->count(),
            ]]);
        }

        // Admin — global stats
        return response()->json(['data' => [
            'total_requests' => LeaveRequest::count(),
            'pending'        => LeaveRequest::where('status', 'pending')->count(),
            'in_progress'    => LeaveRequest::where('status', 'in_progress')->count(),
            'approved'       => LeaveRequest::where('status', 'approved')->count(),
            'rejected'       => LeaveRequest::where('status', 'rejected')->count(),
            'total_users'    => User::count(),
            'total_approvers'=> User::where('role', 'approver')->count(),
        ]]);
    }
}
