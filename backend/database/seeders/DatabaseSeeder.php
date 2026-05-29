<?php

namespace Database\Seeders;

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
    }
}
