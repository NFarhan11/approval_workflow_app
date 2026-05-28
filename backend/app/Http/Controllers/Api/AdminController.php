<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // GET /api/admin/approvers — list all users with approver role
    public function approvers()
    {
        $approvers = User::where('role', 'approver')->get(['id', 'name', 'department']);

        return response()->json(['data' => $approvers]);
    }

    // GET /api/admin/users — list all users
    public function users()
    {
        $this->authorizeAdmin();

        $users = User::orderBy('name')->get(['id', 'name', 'email', 'role', 'department', 'created_at']);

        return response()->json(['data' => $users]);
    }

    // PATCH /api/admin/users/{user}/role — update a user's role
    public function updateRole(Request $request, User $user)
    {
        $this->authorizeAdmin();

        $request->validate([
            'role' => 'required|in:requester,approver,admin',
        ]);

        $user->update(['role' => $request->role]);

        return response()->json(['data' => $user]);
    }

    private function authorizeAdmin()
    {
        if (request()->user()->role !== 'admin') {
            abort(403, 'Only admins can perform this action.');
        }
    }
}
