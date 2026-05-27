<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'leave_request_id',
    'approver_id',
    'step_number',
    'status',
    'comment',
    'actioned_at',
])]

class ApprovalStep extends Model
{
    protected function casts(): array
    {
        return [
            'actioned_at' => 'datetime',
        ];
    }

    // The leave request this step belongs to
    public function leaveRequest(): BelongsTo
    {
        return $this->belongsTo(LeaveRequest::class);
    }

    // The user who is the approver for this step
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
