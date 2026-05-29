<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'       => 'Admin User',
            'email'      => 'admin@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'department' => 'Management',
        ]);

        User::create([
            'name'       => 'Alice Approver',
            'email'      => 'approver1@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'approver',
            'department' => 'HR',
        ]);

        User::create([
            'name'       => 'Bob Approver',
            'email'      => 'approver2@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'approver',
            'department' => 'Finance',
        ]);

        User::create([
            'name'       => 'Charlie Requester',
            'email'      => 'requester1@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Engineering',
        ]);

        User::create([
            'name'       => 'Diana Requester',
            'email'      => 'requester2@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Marketing',
        ]);

        User::create([
            'name'       => 'Eve Requester',
            'email'      => 'requester3@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'requester',
            'department' => 'Engineering',
        ]);
    }
}
