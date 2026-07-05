import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

// Fetch the current user's own leave balances
export function useLeaveBalances() {
    return useQuery({
        queryKey: ['leave-balances', 'me'],
        queryFn:  () => api.get('/leave-balances/me').then(res => res.data.data),
    })
}
