'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import type { z } from 'zod'

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoggingIn, loginError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        router.push('/account')
      },
    })
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200"
          alt="Hostel interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/40" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-xl text-white/80">Sign in to access your bookings, rewards, and exclusive deals.</p>
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="mt-4 text-white/60">Join 500,000+ happy travelers</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
        <Card className="w-full max-w-md rounded-2xl border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-extrabold text-white">A&O</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">Sign in to your A&O account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="h-12 rounded-xl mt-1.5"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="font-medium">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-12 pr-12"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {loginError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl text-center">
                  Invalid email or password
                </div>
              )}

              <div className="flex items-center justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-primary font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isLoggingIn}>
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                  Sign up free
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link href="/hostels" className="text-sm text-muted-foreground hover:text-foreground">
                ← Continue as guest
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}