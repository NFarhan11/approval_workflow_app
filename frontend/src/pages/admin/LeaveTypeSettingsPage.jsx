import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLeaveTypes, useCreateLeaveType, useUpdateLeaveType } from '@/hooks/useLeaveTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'

const schema = z.object({
    name:                    z.string().min(1, 'Name is required'),
    code:                    z.string().min(1, 'Code is required').max(50),
    is_paid:                 z.boolean(),
    annual_quota:            z.string(),
    carry_forward_enabled:   z.boolean(),
    carry_forward_max_days:  z.string(),
    is_active:               z.boolean(),
})

const emptyValues = {
    name: '',
    code: '',
    is_paid: true,
    annual_quota: '',
    carry_forward_enabled: false,
    carry_forward_max_days: '',
    is_active: true,
}

function toFormValues(leaveType) {
    return {
        name:                   leaveType.name,
        code:                   leaveType.code,
        is_paid:                leaveType.is_paid,
        annual_quota:           leaveType.annual_quota?.toString() ?? '',
        carry_forward_enabled:  leaveType.carry_forward_enabled,
        carry_forward_max_days: leaveType.carry_forward_max_days?.toString() ?? '',
        is_active:              leaveType.is_active,
    }
}

function toPayload(data) {
    return {
        name: data.name,
        code: data.code,
        is_paid: data.is_paid,
        annual_quota: data.is_paid && data.annual_quota !== '' ? Number(data.annual_quota) : null,
        carry_forward_enabled: data.is_paid ? data.carry_forward_enabled : false,
        carry_forward_max_days: data.is_paid && data.carry_forward_enabled && data.carry_forward_max_days !== ''
            ? Number(data.carry_forward_max_days)
            : null,
        is_active: data.is_active,
    }
}

export default function LeaveTypeSettingsPage() {
    const { data: leaveTypes, isLoading, isError } = useLeaveTypes()
    const { mutate: createLeaveType, isPending: isCreating } = useCreateLeaveType()
    const { mutate: updateLeaveType, isPending: isUpdating } = useUpdateLeaveType()

    const [editing, setEditing] = useState(null) // null = closed, {} = new, {...} = editing

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: emptyValues,
    })

    const isPaid = watch('is_paid')
    const carryForwardEnabled = watch('carry_forward_enabled')

    const openCreate = () => {
        reset(emptyValues)
        setEditing({})
    }

    const openEdit = (leaveType) => {
        reset(toFormValues(leaveType))
        setEditing(leaveType)
    }

    const onSubmit = (data) => {
        const payload = toPayload(data)

        if (editing?.id) {
            updateLeaveType({ id: editing.id, ...payload }, { onSuccess: () => setEditing(null) })
        } else {
            createLeaveType(payload, { onSuccess: () => setEditing(null) })
        }
    }

    if (isLoading) return <div className="p-8 text-gray-500">Loading leave types...</div>
    if (isError)   return <div className="p-8 text-red-500">Failed to load leave types.</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link to="/dashboard" className="text-sm text-gray-500 hover:underline">
                        ← Back to dashboard
                    </Link>
                    <h1 className="text-2xl font-bold mt-2">Leave Types &amp; Policy</h1>
                </div>
                <Button onClick={openCreate}>+ Add Leave Type</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Paid</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Annual Quota</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Carry Forward</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {leaveTypes?.map((lt) => (
                                <tr key={lt.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{lt.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{lt.is_paid ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-gray-500">{lt.annual_quota ?? '—'} days</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {lt.carry_forward_enabled ? `Up to ${lt.carry_forward_max_days ?? '∞'} days` : 'No'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{lt.is_active ? 'Active' : 'Inactive'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(lt)}>
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing?.id ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="code">Code</Label>
                                <Input id="code" {...register('code')} />
                                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" {...register('is_paid')} />
                            This leave type is paid (tracks a balance)
                        </label>

                        {isPaid && (
                            <>
                                <div className="space-y-1">
                                    <Label htmlFor="annual_quota">Annual Quota (days)</Label>
                                    <Input id="annual_quota" type="number" min="0" {...register('annual_quota')} />
                                </div>

                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" {...register('carry_forward_enabled')} />
                                    Allow unused days to carry forward to next year
                                </label>

                                {carryForwardEnabled && (
                                    <div className="space-y-1">
                                        <Label htmlFor="carry_forward_max_days">Max Carry-Forward Days</Label>
                                        <Input id="carry_forward_max_days" type="number" min="0" {...register('carry_forward_max_days')} />
                                    </div>
                                )}
                            </>
                        )}

                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" {...register('is_active')} />
                            Active (visible when submitting a new request)
                        </label>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {isCreating || isUpdating ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
