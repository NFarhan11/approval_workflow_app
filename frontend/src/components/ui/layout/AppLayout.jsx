import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  LogOut,
  CalendarDays,
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

function NavItem({ to, icon: Icon, label, matchPrefix = false }) {
  const location = useLocation()
  const isActive = matchPrefix
    ? location.pathname.startsWith(to)
    : location.pathname === to

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <NavLink to={to}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await api.post('/auth/logout')
    logout()
    navigate('/login')
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="relative overflow-hidden p-4">
          <div
            className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-sidebar-primary-foreground/10"
            aria-hidden
          />
          <div className="relative">
            <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-sidebar-primary-foreground/15 ring-1 ring-sidebar-primary-foreground/20">
              <CalendarDays className="size-5" />
            </div>
            <p className="font-semibold tracking-tight">Leave Workflow</p>
            <p className="mt-1 text-xs text-sidebar-foreground/85">
              Request and approve leave in one place.
            </p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/requests" icon={FileText} label="Requests" matchPrefix />
                {user?.role === 'requester' && (
                  <NavItem to="/requests/new" icon={PlusCircle} label="New Request" />
                )}
                {user?.role === 'admin' && (
                  <NavItem to="/admin/users" icon={Users} label="Users" />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="mb-2 text-xs capitalize text-sidebar-foreground/70">{user?.role}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full cursor-pointer border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-linear-to-br from-primary/8 via-background to-muted/40">
        <header className="flex h-12 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
