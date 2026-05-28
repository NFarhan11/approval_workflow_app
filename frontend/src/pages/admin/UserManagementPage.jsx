import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import { Card, CardContent } from '@/components/ui/card'

const roles = ['requester', 'approver', 'admin']

const roleColors = {
    requester: 'bg-gray-100 text-gray-700',
    approver:  'bg-blue-100 text-blue-700',
    admin:     'bg-purple-100 text-purple-700',
}

export default function UserManagementPage() {
    const { user: currentUser } = useAuthStore()
    const queryClient = useQueryClient()

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn:  () => api.get('/admin/users').then(res => res.data.data),
    })

    const { mutate: updateRole } = useMutation({
        mutationFn: ({ userId, role }) =>
            api.patch(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        },
    })

    if (isLoading) return <div className="p-8 text-gray-500">Loading users...</div>
    if (isError)   return <div className="p-8 text-red-500">Failed to load users.</div>

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link to="/dashboard" className="text-sm text-gray-500 hover:underline">
                        ← Back to dashboard
                    </Link>
                    <h1 className="text-2xl font-bold mt-2">User Management</h1>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users?.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                                    <td className="px-4 py-3 text-gray-500">{user.department ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {user.id === currentUser?.id ? (
                                            // Can't change your own role
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[user.role]}`}>
                                                {user.role}
                                            </span>
                                        ) : (
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateRole({ userId: user.id, role: e.target.value })}
                                                className="border rounded px-2 py-1 text-xs"
                                            >
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
