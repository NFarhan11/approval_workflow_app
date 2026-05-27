<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'leave_type'   => $this->leave_type,
            'start_date'   => $this->start_date->format('Y-m-d'),
            'end_date'     => $this->end_date->format('Y-m-d'),
            'reason'       => $this->reason,
            'status'       => $this->status,
            'current_step' => $this->current_step,
            'total_steps'  => $this->total_steps,
            'created_at'   => $this->created_at->format('Y-m-d H:i'),

            // Nested: who submitted the request
            'requester' => [
                'id'         => $this->requester->id,
                'name'       => $this->requester->name,
                'department' => $this->requester->department,
            ],

            // Nested: all approval steps with their approvers
            'approval_steps' => $this->approvalSteps->map(fn ($step) => [
                'id'          => $step->id,
                'step_number' => $step->step_number,
                'status'      => $step->status,
                'comment'     => $step->comment,
                'actioned_at' => $step->actioned_at?->format('Y-m-d H:i'),
                'approver'    => [
                    'id'         => $step->approver->id,
                    'name'       => $step->approver->name,
                    'department' => $step->approver->department,
                ],
            ]),
        ];
    }
}
