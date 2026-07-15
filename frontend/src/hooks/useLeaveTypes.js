import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

// Fetch all leave types
export function useLeaveTypes() {
    return useQuery({
        queryKey: ['leave-types'],
        queryFn:  () => api.get('/leave-types').then(res => res.data.data),
    })
}

// Create a new leave type (admin only)
export function useCreateLeaveType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => api.post('/admin/leave-types', data).then(res => res.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-types'] })
        },
    })
}

// Update an existing leave type (admin only)
export function useUpdateLeaveType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, ...data }) => api.patch(`/admin/leave-types/${id}`, data).then(res => res.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-types'] })
        },
    })
}
