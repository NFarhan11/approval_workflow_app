import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function StatCard({ label, value, color }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-3xl font-bold ${color ?? 'text-gray-800'}`}>{value ?? '—'}</p>
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn:  () => api.get('/dashboard/stats').then(res => res.data.data),
    })

    const handleLogout = async () => {
        await api.post('/auth/logout')
        logout()
        navigate('/login')
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-500 capitalize">Welcome, {user?.name} · {user?.role}</p>
                </div>
                <div className="flex gap-3">
                    {user?.role === 'requester' && (
                        <Button asChild>
                            <Link to="/requests/new">+ New Request</Link>
                        </Button>
                    )}
                    {user?.role === 'admin' && (
                        <Button variant="outline" asChild>
                            <Link to="/admin/users">Manage Users</Link>
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
            </div>

            {/* Requester stats */}
            {user?.role === 'requester' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Requests"  value={stats?.total} />
                    <StatCard label="Pending"         value={stats?.pending}     color="text-yellow-600" />
                    <StatCard label="In Progress"     value={stats?.in_progress} color="text-blue-600" />
                    <StatCard label="Approved"        value={stats?.approved}    color="text-green-600" />
                </div>
            )}

            {/* Approver stats */}
            {user?.role === 'approver' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Assigned"  value={stats?.total_assigned} />
                    <StatCard label="Pending Action"  value={stats?.pending_action} color="text-yellow-600" />
                    <StatCard label="Approved"        value={stats?.approved}       color="text-green-600" />
                    <StatCard label="Rejected"        value={stats?.rejected}       color="text-red-600" />
                </div>
            )}

            {/* Admin stats */}
            {user?.role === 'admin' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Requests"  value={stats?.total_requests} />
                    <StatCard label="Pending"         value={stats?.pending}        color="text-yellow-600" />
                    <StatCard label="In Progress"     value={stats?.in_progress}    color="text-blue-600" />
                    <StatCard label="Approved"        value={stats?.approved}       color="text-green-600" />
                    <StatCard label="Rejected"        value={stats?.rejected}       color="text-red-600" />
                    <StatCard label="Total Users"     value={stats?.total_users} />
                    <StatCard label="Approvers"       value={stats?.total_approvers} />
                </div>
            )}

            <div className="flex gap-3">
                <Button asChild variant="outline">
                    <Link to="/requests">View All Requests</Link>
                </Button>
            </div>
        </div>
    )
}
