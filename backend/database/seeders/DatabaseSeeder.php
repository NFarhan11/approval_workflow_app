<?php

namespace Database\Seeders;

use App\Models\Holiday;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@example.com'], [
            'name'       => 'Admin User',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'department' => 'Management',
        ]);

        User::firstOrCreate(['email' => 'approver1@example.com'], [
            'name'       => 'Alice Approver',
            'password'   => Hash::make('password'),
            'role'       => 'approver',
            'department' => 'HR',
        ]);

        User::firstOrCreate(['email' => 'approver2@example.com'], [
            'name'       => 'Bob Approver',
            'password'   => Hash::make('password'),
            'role'       => 'approver',
            'department' => 'Finance',
        ]);

        User::firstOrCreate(['email' => 'requester1@example.com'], [
            'name'       => 'Charlie Requester',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Engineering',
        ]);

        User::firstOrCreate(['email' => 'requester2@example.com'], [
            'name'       => 'Diana Requester',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Marketing',
        ]);

        User::firstOrCreate(['email' => 'requester3@example.com'], [
            'name'       => 'Eve Requester',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Engineering',
        ]);

        LeaveType::firstOrCreate(['code' => 'annual'], [
            'name'                   => 'Annual Leave',
            'is_paid'                => true,
            'annual_quota'           => 14,
            'carry_forward_enabled'  => true,
            'carry_forward_max_days' => 5,
            'is_active'              => true,
        ]);

        LeaveType::firstOrCreate(['code' => 'sick'], [
            'name'                   => 'Sick Leave',
            'is_paid'                => true,
            'annual_quota'           => 10,
            'carry_forward_enabled'  => false,
            'carry_forward_max_days' => null,
            'is_active'              => true,
        ]);

        LeaveType::firstOrCreate(['code' => 'emergency'], [
            'name'                   => 'Emergency Leave',
            'is_paid'                => true,
            'annual_quota'           => 3,
            'carry_forward_enabled'  => false,
            'carry_forward_max_days' => null,
            'is_active'              => true,
        ]);

        LeaveType::firstOrCreate(['code' => 'unpaid'], [
            'name'                   => 'Unpaid Leave',
            'is_paid'                => false,
            'annual_quota'           => null,
            'carry_forward_enabled'  => false,
            'carry_forward_max_days' => null,
            'is_active'              => true,
        ]);

        Holiday::firstOrCreate(['date' => '2026-01-01'], ['name' => "New Year's Day"]);
        Holiday::firstOrCreate(['date' => '2026-08-31'], ['name' => 'Merdeka Day']);
        Holiday::firstOrCreate(['date' => '2026-12-25'], ['name' => 'Christmas Day']);
    }
}
