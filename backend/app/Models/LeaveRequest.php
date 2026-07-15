<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'requester_id',
    'leave_type_id',
    'start_date',
    'end_date',
    'total_days',
    'reason',
    'status',
    'current_step',
    'total_steps',
])]
class LeaveRequest extends Model
{
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    // The user who submitted this request
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    // The leave type this request was submitted under
    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    // All approval steps in the chain
    public function approvalSteps(): HasMany
    {
        return $this->hasMany(ApprovalStep::class)->orderBy('step_number');
    }

    // Only the currently active step
    public function currentApprovalStep(): HasMany
    {
        return $this->hasMany(ApprovalStep::class)
                    ->where('step_number', $this->current_step)
                    ->where('status', 'pending');
    }
}
