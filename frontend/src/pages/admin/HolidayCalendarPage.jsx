import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHolidays, useCreateHoliday, useDeleteHoliday } from '@/hooks/useHolidays'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    date: z.string().min(1, 'Date is required'),
})

export default function HolidayCalendarPage() {
    const { data: holidays, isLoading, isError } = useHolidays()
    const { mutate: createHoliday, isPending, error } = useCreateHoliday()
    const { mutate: deleteHoliday } = useDeleteHoliday()

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    })

    const onSubmit = (data) => {
        createHoliday(data, { onSuccess: () => reset({ name: '', date: '' }) })
    }

    if (isLoading) return <div className="p-8 text-gray-500">Loading holidays...</div>
    if (isError)   return <div className="p-8 text-red-500">Failed to load holidays.</div>

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link to="/dashboard" className="text-sm text-gray-500 hover:underline">
                    ← Back to dashboard
                </Link>
                <h1 className="text-2xl font-bold mt-2">Holiday Calendar</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Dates listed here are excluded when counting working days for a leave request.
                </p>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
                        <div className="space-y-1 flex-1">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="e.g. New Year's Day" {...register('name')} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" {...register('date')} />
                            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Adding...' : 'Add Holiday'}
                        </Button>
                    </form>
                    {error && (
                        <p className="text-sm text-red-500 mt-2">
                            {error.response?.data?.message ?? 'Failed to add holiday.'}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {holidays?.map((holiday) => (
                                <tr key={holiday.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{holiday.date}</td>
                                    <td className="px-4 py-3 text-gray-500">{holiday.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="outline" size="sm" onClick={() => deleteHoliday(holiday.id)}>
                                            Remove
                                        </Button>
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
