import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const schema = z.object({
    name:                  z.string().min(1, 'Name is required'),
    email:                 z.email('Please enter a valid email'),
    department:            z.string().optional(),
    password:              z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
})

export default function RegisterPage() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [serverError, setServerError] = useState(null)

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data) => {
        setServerError(null)
        try {
            const res = await api.post('/auth/register', data)
            login(res.data.user, res.data.token)
            navigate('/dashboard')
        } catch (err) {
            setServerError(err.response?.data?.message ?? 'Registration failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Fill in your details to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-1">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="department">Department <span className="text-gray-400">(optional)</span></Label>
                            <Input
                                id="department"
                                placeholder="e.g. Engineering"
                                {...register('department')}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="••••••••"
                                {...register('password_confirmation')}
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>
                            )}
                        </div>

                        {serverError && (
                            <p className="text-sm text-red-500 text-center">{serverError}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </Button>

                        <p className="text-sm text-center text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary underline">
                                Sign in
                            </Link>
                        </p>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
