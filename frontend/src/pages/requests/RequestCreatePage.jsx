import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useCreateLeaveRequest } from '@/hooks/useLeaveRequests'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
    leave_type:   z.string().min(1, 'Please select a leave type'),
    start_date:   z.string().min(1, 'Start date is required'),
    end_date:     z.string().min(1, 'End date is required'),
    reason:       z.string().min(10, 'Please provide at least 10 characters'),
    approver_ids: z.array(z.string()).min(1, 'Please select at least one approver'),
})

export default function RequestCreatePage() {
    const navigate = useNavigate()
    const { mutate: createRequest, isPending } = useCreateLeaveRequest()

    const { data: approvers } = useQuery({
        queryKey: ['approvers'],
        queryFn:  () => api.get('/admin/approvers').then(res => res.data.data),
    })

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { approver_ids: [] },
    })

    const onSubmit = (data) => {
        createRequest(data, {
            onSuccess: () => navigate('/requests'),
            onError: (err) => console.error(err),
        })
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <Link to="/requests" className="text-sm text-gray-500 hover:underline">
                    ← Back to requests
                </Link>
                <h1 className="text-2xl font-bold mt-2">New Leave Request</h1>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        <div className="space-y-1">
                            <Label htmlFor="leave_type">Leave Type</Label>
                            <select
                                id="leave_type"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                {...register('leave_type')}
                            >
                                <option value="">Select a type...</option>
                                <option value="annual">Annual</option>
                                <option value="sick">Sick</option>
                                <option value="emergency">Emergency</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                            {errors.leave_type && (
                                <p className="text-sm text-red-500">{errors.leave_type.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input id="start_date" type="date" {...register('start_date')} />
                                {errors.start_date && (
                                    <p className="text-sm text-red-500">{errors.start_date.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input id="end_date" type="date" {...register('end_date')} />
                                {errors.end_date && (
                                    <p className="text-sm text-red-500">{errors.end_date.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain the reason for your leave..."
                                rows={4}
                                {...register('reason')}
                            />
                            {errors.reason && (
                                <p className="text-sm text-red-500">{errors.reason.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Approval Chain</Label>
                            <p className="text-xs text-gray-400">Select approvers in order. First selected = first to approve.</p>
                            <div className="space-y-2 mt-1">
                                {approvers?.map((approver) => (
                                    <label key={approver.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={String(approver.id)}
                                            {...register('approver_ids')}
                                        />
                                        <span className="text-sm">{approver.name}</span>
                                        <span className="text-xs text-gray-400">{approver.department}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.approver_ids && (
                                <p className="text-sm text-red-500">{errors.approver_ids.message}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Submitting...' : 'Submit Request'}
                            </Button>
                            <Button variant="outline" type="button" onClick={() => navigate('/requests')}>
                                Cancel
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
