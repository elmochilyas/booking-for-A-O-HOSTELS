'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Star, Users, Lock, Loader2, X } from 'lucide-react'
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
      {/* Left Panel - Enhanced */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200"
          alt="Hostel interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/50" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <svg className="h-12 w-12" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 26H4L16 2Z" fill="white" />
                <path d="M16 8L22 22H10L16 8Z" fill="#4159a8" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-xl text-white/90 leading-relaxed">Sign in to access your bookings, rewards, and exclusive deals.</p>
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="mt-4 text-white/70 flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              Join 500,000+ happy travelers
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-muted/20 to-white">
        <Card className="w-full max-w-md rounded-3xl border-gray-100 shadow-2xl hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-6">
              <svg className="h-16 w-16" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 26H4L16 2Z" fill="#293a88" />
                <path d="M16 8L22 22H10L16 8Z" fill="#4159a8" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">Sign in to your A&O account</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email" className="font-semibold text-sm">Email</Label>
                <div className="mt-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="h-12 rounded-xl border-muted-foreground/20"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-12 pr-12 rounded-xl border-muted-foreground/20"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {loginError && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl flex items-center gap-3 border border-destructive/20">
                  <X className="h-5 w-5 shrink-0" />
                  {typeof loginError === 'string' ? loginError : loginError?.message || 'Login failed. Please try again.'}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline font-medium">
                Forgot password?
              </Link>
              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="text-primary font-bold hover:underline">
                    Create one now →
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}