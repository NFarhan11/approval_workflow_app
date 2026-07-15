<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'name'                   => $this->name,
            'code'                   => $this->code,
            'is_paid'                => $this->is_paid,
            'annual_quota'           => $this->annual_quota,
            'carry_forward_enabled'  => $this->carry_forward_enabled,
            'carry_forward_max_days' => $this->carry_forward_max_days,
            'is_active'              => $this->is_active,
        ];
    }
}
