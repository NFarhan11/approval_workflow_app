<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'code',
    'is_paid',
    'annual_quota',
    'carry_forward_enabled',
    'carry_forward_max_days',
    'is_active',
])]
class LeaveType extends Model
{
    protected function casts(): array
    {
        return [
            'is_paid'               => 'boolean',
            'carry_forward_enabled' => 'boolean',
            'is_active'             => 'boolean',
        ];
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function balances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }
}
