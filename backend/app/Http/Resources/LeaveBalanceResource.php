<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveBalanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'leave_type' => [
                'id'   => $this->leaveType->id,
                'name' => $this->leaveType->name,
                'code' => $this->leaveType->code,
            ],
            'year'            => $this->year,
            'allocated'       => $this->allocated,
            'carried_forward' => $this->carried_forward,
            'used'            => $this->used,
            'remaining'       => $this->allocated + $this->carried_forward - $this->used,
        ];
    }
}
