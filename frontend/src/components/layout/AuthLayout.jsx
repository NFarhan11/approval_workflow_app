import { CalendarDays, CheckCircle2, GitBranch } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const highlights = [
    { icon: GitBranch, text: 'Multi-step approvals' },
    { icon: CheckCircle2, text: 'Track status in real time' },
    { icon: CalendarDays, text: 'Simple leave requests' },
]

export default function AuthLayout({ title, description, children }) {
    return (
        <div className="min-h-screen lg:grid lg:grid-cols-2">
            <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-10">
                <div
                    className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary-foreground/10"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-24 -left-12 size-80 rounded-full bg-primary-foreground/5"
                    aria-hidden
                />

                <div className="relative">
                    <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
                        <CalendarDays className="size-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Leave Workflow</h1>
                    <p className="mt-3 max-w-sm text-primary-foreground/85">
                        Request and approve leave in one place.
                    </p>
                </div>

                <ul className="relative space-y-4">
                    {highlights.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                                <Icon className="size-4" />
                            </span>
                            {text}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-primary/8 via-background to-muted/40 p-6">
                <div className="mb-8 flex flex-col items-center text-center lg:hidden">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                        <CalendarDays className="size-6" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">Leave Workflow</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Leave request approvals</p>
                </div>

                <Card className="w-full max-w-md border-2 border-border shadow-xl">
                    <CardHeader className="space-y-1 pb-4 text-center">
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    )
}
