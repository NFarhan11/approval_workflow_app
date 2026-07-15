import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import RequestListPage from '@/pages/requests/RequestListPage'
import RequestCreatePage from '@/pages/requests/RequestCreatePage'
import RequestDetailPage from '@/pages/requests/RequestDetailPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import UserManagementPage from '@/pages/admin/UserManagementPage'
import LeaveTypeSettingsPage from '@/pages/admin/LeaveTypeSettingsPage'
import HolidayCalendarPage from '@/pages/admin/HolidayCalendarPage'
import AppLayout from '@/components/ui/layout/AppLayout'

// Redirects to /login if not authenticated
function ProtectedRoute() {
    const token = useAuthStore((state) => state.token)
    return token ? <Outlet /> : <Navigate to="/login" replace />
}

// Redirects to /dashboard if already logged in (for login/register pages)
function GuestRoute() {
    const token = useAuthStore((state) => state.token)
    return token ? <Navigate to="/dashboard" replace /> : <Outlet />
}

const router = createBrowserRouter([
    // Guest routes — only accessible when NOT logged in
    {
        element: <GuestRoute />,
        children: [
            { path: '/login',    element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
        ],
    },

    // Protected routes — only accessible when logged in
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/dashboard',        element: <DashboardPage /> },
                    { path: '/requests',         element: <RequestListPage /> },
                    { path: '/requests/new',     element: <RequestCreatePage /> },
                    { path: '/requests/:id',     element: <RequestDetailPage /> },
                    { path: '/admin/users',       element: <UserManagementPage /> },
                    { path: '/admin/leave-types', element: <LeaveTypeSettingsPage /> },
                    { path: '/admin/holidays',    element: <HolidayCalendarPage /> },
                ],
            },
            
        ],
    },

    // Fallback — redirect root to dashboard
    { path: '/', element: <Navigate to="/dashboard" replace /> },
])

export default router
