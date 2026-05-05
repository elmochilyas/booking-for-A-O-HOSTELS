'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordSchema } from '@/lib/validations'
import { authService } from '@/services/auth.service'
import { Shield, Key, Check, ArrowLeft, Loader2, Send, X } from 'lucide-react'
import Image from 'next/image'
import type { z } from 'zod'

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setIsSubmitted(true)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
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
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
              <Key className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Forgot Password?</h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Don't worry, it happens. We'll help you reset it.
            </p>
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(5)].map((_, i) => (
                <Shield key={i} className="h-6 w-6 text-white/70" />
              ))}
            </div>
            <p className="mt-4 text-white/60 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Secure password recovery
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-muted/20 to-white">
        <Card className="w-full max-w-md rounded-3xl border-gray-100 shadow-2xl hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Key className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
            <CardDescription className="text-base mt-2">
              {isSubmitted
                ? 'Check your email for reset instructions'
                : 'Enter your email and we\'ll send you a reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isSubmitted ? (
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-sm text-green-700 font-medium">
                    We've sent a password reset link to your email. Please check your inbox.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button variant="outline" className="rounded-full px-8 py-6 text-base">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="font-semibold text-sm">Email</Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="h-12 rounded-xl border-muted-foreground/20"
                      placeholder="your@email.com"
                    />
                  </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      {typeof errors.email?.message === 'string' ? errors.email.message : 'Invalid email'}
                    </p>
                )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
