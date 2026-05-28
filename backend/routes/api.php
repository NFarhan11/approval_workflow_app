<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveRequestController;
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

    // Admin
    Route::get('/admin/approvers', [AdminController::class, 'approvers']);

    // Leave Requests
    Route::get('/leave-requests',          [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests',         [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests/{leaveRequest}',    [LeaveRequestController::class, 'show']);
    Route::delete('/leave-requests/{leaveRequest}', [LeaveRequestController::class, 'destroy']);

    // Approval actions
    Route::post('/leave-requests/{leaveRequest}/approve', [ApprovalController::class, 'approve']);
    Route::post('/leave-requests/{leaveRequest}/reject',  [ApprovalController::class, 'reject']);
});
