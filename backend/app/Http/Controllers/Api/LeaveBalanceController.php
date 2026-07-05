<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveBalanceResource;
use App\Models\LeaveType;
use App\Services\LeaveBalanceService;
use Illuminate\Http\Request;

class LeaveBalanceController extends Controller
{
    public function __construct(private LeaveBalanceService $balances)
    {
    }

    // GET /api/leave-balances/me — the requester's own balance for every active, paid leave type
    public function mine(Request $request)
    {
        $user = $request->user();
        $year = (int) $request->query('year', now()->year);

        $balances = LeaveType::where('is_active', true)
            ->where('is_paid', true)
            ->get()
            ->map(fn (LeaveType $leaveType) => $this->balances->getOrCreateBalance($user, $leaveType, $year));

        return LeaveBalanceResource::collection($balances);
    }
}
