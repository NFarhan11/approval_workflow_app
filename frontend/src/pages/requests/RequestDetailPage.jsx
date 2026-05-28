import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLeaveRequest } from '@/hooks/useLeaveRequests'
import useAuthStore from '@/store/authStore'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'

const statusColors = {
    pending:     'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    approved:    'bg-green-100 text-green-800',
    rejected:    'bg-red-100 text-red-800',
}

const stepColors = {
    pending:  'bg-gray-100 text-gray-600',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
}

export default function RequestDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    const { data: request, isLoading, isError } = useLeaveRequest(id)

    const [dialog, setDialog] = useState(null) // 'approve' | 'reject' | null
    const [comment, setComment] = useState('')

    const { mutate: actOnRequest, isPending } = useMutation({
        mutationFn: ({ action, comment }) =>
            api.post(`/leave-requests/${id}/${action}`, { comment }).then(r => r.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests', id] })
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
            setDialog(null)
            setComment('')
        },
    })

    const isActiveApprover = request
        && ['pending', 'in_progress'].includes(request.status)
        && request.approval_steps.some(
            step => step.step_number === request.current_step
                 && step.status === 'pending'
                 && step.approver.id === user?.id
        )

    if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>
    if (isError)   return <div className="p-8 text-red-500">Failed to load request.</div>

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link to="/requests" className="text-sm text-gray-500 hover:underline">
                    ← Back to requests
                </Link>
                <div className="flex items-center justify-between mt-2">
                    <h1 className="text-2xl font-bold capitalize">{request.leave_type} Leave</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status]}`}>
                        {request.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* Request Details */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">Request Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Requester</p>
                        <p className="font-medium">{request.requester.name}</p>
                        <p className="text-gray-400 text-xs">{request.requester.department}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Dates</p>
                        <p className="font-medium">{request.start_date} → {request.end_date}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-500">Reason</p>
                        <p className="font-medium">{request.reason}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Approval Timeline */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">
                        Approval Chain ({request.current_step}/{request.total_steps})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {request.approval_steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${stepColors[step.status]}`}>
                                    {step.step_number}
                                </div>
                                {step.step_number < request.total_steps && (
                                    <div className="w-px h-8 bg-gray-200 mt-1" />
                                )}
                            </div>
                            <div className="flex-1 pb-2">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">{step.approver.name}</p>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${stepColors[step.status]}`}>
                                        {step.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">{step.approver.department}</p>
                                {step.comment && (
                                    <p className="text-sm text-gray-600 mt-1 italic">"{step.comment}"</p>
                                )}
                                {step.actioned_at && (
                                    <p className="text-xs text-gray-400 mt-0.5">{step.actioned_at}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Approve / Reject buttons — only for the active approver */}
            {isActiveApprover && (
                <div className="flex gap-3">
                    <Button onClick={() => setDialog('approve')}>
                        Approve
                    </Button>
                    <Button variant="destructive" onClick={() => setDialog('reject')}>
                        Reject
                    </Button>
                </div>
            )}

            {/* Comment Dialog */}
            <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialog === 'approve' ? 'Approve Request' : 'Reject Request'}
                        </DialogTitle>
                    </DialogHeader>
                    <Textarea
                        placeholder="Leave a comment (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialog(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant={dialog === 'reject' ? 'destructive' : 'default'}
                            disabled={isPending}
                            onClick={() => actOnRequest({ action: dialog, comment })}
                        >
                            {isPending ? 'Submitting...' : `Confirm ${dialog}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
