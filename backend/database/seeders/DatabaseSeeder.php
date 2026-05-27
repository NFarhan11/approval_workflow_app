<?php

namespace Database\Seeders;

use App\Models\ApprovalStep;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // -------------------------------------------------------
        // USERS
        // -------------------------------------------------------

        $admin = User::create([
            'name'       => 'Admin User',
            'email'      => 'admin@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'department' => 'Management',
        ]);

        $approver1 = User::create([
            'name'       => 'Alice Approver',
            'email'      => 'approver1@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'approver',
            'department' => 'HR',
        ]);

        $approver2 = User::create([
            'name'       => 'Bob Approver',
            'email'      => 'approver2@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'approver',
            'department' => 'Finance',
        ]);

        $requester1 = User::create([
            'name'       => 'Charlie Requester',
            'email'      => 'requester1@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Engineering',
        ]);

        $requester2 = User::create([
            'name'       => 'Diana Requester',
            'email'      => 'requester2@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Marketing',
        ]);

        $requester3 = User::create([
            'name'       => 'Eve Requester',
            'email'      => 'requester3@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Engineering',
        ]);

        // -------------------------------------------------------
        // LEAVE REQUESTS
        // -------------------------------------------------------

        // 1. PENDING — just submitted, no one has acted yet
        $pending = LeaveRequest::create([
            'requester_id' => $requester1->id,
            'leave_type'   => 'annual',
            'start_date'   => '2026-06-10',
            'end_date'     => '2026-06-14',
            'reason'       => 'Family vacation planned in advance.',
            'status'       => 'pending',
            'current_step' => 1,
            'total_steps'  => 2,
        ]);
        ApprovalStep::create([
            'leave_request_id' => $pending->id,
            'approver_id'      => $approver1->id,
            'step_number'      => 1,
            'status'           => 'pending',
        ]);
        ApprovalStep::create([
            'leave_request_id' => $pending->id,
            'approver_id'      => $approver2->id,
            'step_number'      => 2,
            'status'           => 'pending',
        ]);

        // 2. IN PROGRESS — Level 1 approved, waiting for Level 2
        $inProgress = LeaveRequest::create([
            'requester_id' => $requester2->id,
            'leave_type'   => 'sick',
            'start_date'   => '2026-06-03',
            'end_date'     => '2026-06-05',
            'reason'       => 'Doctor recommended rest due to flu.',
            'status'       => 'in_progress',
            'current_step' => 2,
            'total_steps'  => 2,
        ]);
        ApprovalStep::create([
            'leave_request_id' => $inProgress->id,
            'approver_id'      => $approver1->id,
            'step_number'      => 1,
            'status'           => 'approved',
            'comment'          => 'Approved. Get well soon.',
            'actioned_at'      => now()->subDay(),
        ]);
        ApprovalStep::create([
            'leave_request_id' => $inProgress->id,
            'approver_id'      => $approver2->id,
            'step_number'      => 2,
            'status'           => 'pending',
        ]);

        // 3. APPROVED — both levels approved
        $approved = LeaveRequest::create([
            'requester_id' => $requester3->id,
            'leave_type'   => 'annual',
            'start_date'   => '2026-05-01',
            'end_date'     => '2026-05-03',
            'reason'       => 'Personal errands.',
            'status'       => 'approved',
            'current_step' => 2,
            'total_steps'  => 2,
        ]);
        ApprovalStep::create([
            'leave_request_id' => $approved->id,
            'approver_id'      => $approver1->id,
            'step_number'      => 1,
            'status'           => 'approved',
            'comment'          => 'Looks good.',
            'actioned_at'      => now()->subDays(5),
        ]);
        ApprovalStep::create([
            'leave_request_id' => $approved->id,
            'approver_id'      => $approver2->id,
            'step_number'      => 2,
            'status'           => 'approved',
            'comment'          => 'Approved by finance.',
            'actioned_at'      => now()->subDays(4),
        ]);

        // 4. REJECTED — Level 1 rejected, short-circuited
        $rejected = LeaveRequest::create([
            'requester_id' => $requester1->id,
            'leave_type'   => 'emergency',
            'start_date'   => '2026-06-20',
            'end_date'     => '2026-06-25',
            'reason'       => 'Need extended time off.',
            'status'       => 'rejected',
            'current_step' => 1,
            'total_steps'  => 2,
        ]);
        ApprovalStep::create([
            'leave_request_id' => $rejected->id,
            'approver_id'      => $approver1->id,
            'step_number'      => 1,
            'status'           => 'rejected',
            'comment'          => 'Insufficient staffing during this period.',
            'actioned_at'      => now()->subDays(2),
        ]);
        ApprovalStep::create([
            'leave_request_id' => $rejected->id,
            'approver_id'      => $approver2->id,
            'step_number'      => 2,
            'status'           => 'pending',
        ]);
    }
}
