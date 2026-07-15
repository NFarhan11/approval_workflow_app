import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

// Fetch the holiday calendar
export function useHolidays() {
    return useQuery({
        queryKey: ['holidays'],
        queryFn:  () => api.get('/holidays').then(res => res.data.data),
    })
}

// Add a holiday (admin only)
export function useCreateHoliday() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => api.post('/admin/holidays', data).then(res => res.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] })
        },
    })
}

// Remove a holiday (admin only)
export function useDeleteHoliday() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id) => api.delete(`/admin/holidays/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] })
        },
    })
}
