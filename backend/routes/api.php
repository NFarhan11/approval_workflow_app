<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\LeaveBalanceController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\LeaveTypeController;
use Illuminate\Support\Facades\Route;

// Public routes — no token needed
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Protected routes — token required
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',     [AuthController::class, 'me']);
    });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Admin
    Route::get('/admin/approvers',           [AdminController::class, 'approvers']);
    Route::get('/admin/users',               [AdminController::class, 'users']);
    Route::patch('/admin/users/{user}/role', [AdminController::class, 'updateRole']);

    // Leave types, holidays, balances — readable by any authenticated user
    Route::get('/leave-types',     [LeaveTypeController::class, 'index']);
    Route::get('/holidays',        [HolidayController::class, 'index']);
    Route::get('/leave-balances/me', [LeaveBalanceController::class, 'mine']);

    // Admin-only management of leave policy
    Route::middleware('admin')->group(function () {
        Route::post('/admin/leave-types',              [LeaveTypeController::class, 'store']);
        Route::patch('/admin/leave-types/{leaveType}',  [LeaveTypeController::class, 'update']);

        Route::post('/admin/holidays',                  [HolidayController::class, 'store']);
        Route::delete('/admin/holidays/{holiday}',      [HolidayController::class, 'destroy']);
    });

    // Leave Requests
    Route::get('/leave-requests',          [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests',         [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests/{leaveRequest}',    [LeaveRequestController::class, 'show']);
    Route::delete('/leave-requests/{leaveRequest}', [LeaveRequestController::class, 'destroy']);

    // Approval actions
    Route::post('/leave-requests/{leaveRequest}/approve', [ApprovalController::class, 'approve']);
    Route::post('/leave-requests/{leaveRequest}/reject',  [ApprovalController::class, 'reject']);
});
