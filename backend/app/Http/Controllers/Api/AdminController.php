<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class AdminController extends Controller
{
    // GET /api/admin/approvers — list all users with approver role
    public function approvers()
    {
        $approvers = User::where('role', 'approver')->get(['id', 'name', 'department']);

        return response()->json(['data' => $approvers]);
    }
}
