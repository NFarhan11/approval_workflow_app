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
    email:    z.email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [serverError, setServerError] = useState(null)

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data) => {
        setServerError(null)
        try {
            const res = await api.post('/auth/login', data)
            login(res.data.user, res.data.token)
            navigate('/dashboard')
        } catch (err) {
            setServerError(err.response?.data?.message ?? 'Invalid credentials. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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

                        {serverError && (
                            <p className="text-sm text-red-500 text-center">{serverError}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <p className="text-sm text-center text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary underline">
                                Register
                            </Link>
                        </p>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
