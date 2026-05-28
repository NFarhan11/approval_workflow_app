import { Link } from 'react-router-dom'
import { useLeaveRequests, useDeleteLeaveRequest } from '@/hooks/useLeaveRequests'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusColors = {
    pending:     'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    approved:    'bg-green-100 text-green-800',
    rejected:    'bg-red-100 text-red-800',
}

export default function RequestListPage() {
    const { user } = useAuthStore()
    const { data: requests, isLoading, isError } = useLeaveRequests()
    const { mutate: deleteRequest } = useDeleteLeaveRequest()

    if (isLoading) return <div className="p-8 text-gray-500">Loading requests...</div>
    if (isError)   return <div className="p-8 text-red-500">Failed to load requests.</div>

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Leave Requests</h1>
                {user?.role === 'requester' && (
                    <Button asChild>
                        <Link to="/requests/new">+ New Request</Link>
                    </Button>
                )}
            </div>

            {requests?.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-400">
                        No leave requests found.
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Requester</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Dates</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Steps</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {requests?.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{req.requester.name}</p>
                                            <p className="text-gray-400 text-xs">{req.requester.department}</p>
                                        </td>
                                        <td className="px-4 py-3 capitalize">{req.leave_type}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {req.start_date} → {req.end_date}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                                                {req.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {req.current_step}/{req.total_steps}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to={`/requests/${req.id}`}>View</Link>
                                            </Button>
                                            {user?.role === 'requester' && req.status === 'pending' && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => deleteRequest(req.id)}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
