import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

// Fetch all leave requests (filtered by role on the backend)
export function useLeaveRequests() {
    return useQuery({
        queryKey: ['leave-requests'],
        queryFn:  () => api.get('/leave-requests').then(res => res.data.data),
    })
}

// Fetch a single leave request by ID
export function useLeaveRequest(id) {
    return useQuery({
        queryKey: ['leave-requests', id],
        queryFn:  () => api.get(`/leave-requests/${id}`).then(res => res.data.data),
        enabled:  !!id,
    })
}

// Create a new leave request
export function useCreateLeaveRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => api.post('/leave-requests', data).then(res => res.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
        },
    })
}

// Delete a leave request
export function useDeleteLeaveRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id) => api.delete(`/leave-requests/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
        },
    })
}
