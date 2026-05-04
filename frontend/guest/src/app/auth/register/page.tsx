'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { registerSchema } from '@/lib/validations'
import { authService } from '@/services/auth.service'
import type { z } from 'zod'

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')
    try {
      await authService.register({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
        date_of_birth: data.dateOfBirth,
        country: data.country,
        phone: data.phone,
      })
      router.push('/auth/login?registered=true')
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    'Save 25% on every booking',
    'Earn loyalty points',
    'Early access to new locations',
    'Exclusive member deals',
  ]

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200"
          alt="A&O Hostel"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/40" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">Join A&O Club</h2>
            <p className="text-xl text-white/80 mb-8">Start saving 25% on every stay and earn points towards free nights!</p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
        <Card className="w-full max-w-lg rounded-2xl border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-extrabold text-white">A&O</span>
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-base">Join A&O Club and save 25% on every stay</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="font-medium">First Name *</Label>
                  <Input id="firstName" placeholder="John" className="h-12 rounded-xl mt-1.5" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1.5">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="font-medium">Last Name *</Label>
                  <Input id="lastName" placeholder="Doe" className="h-12 rounded-xl mt-1.5" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1.5">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="font-medium">Email *</Label>
                <Input id="email" type="email" placeholder="your@email.com" className="h-12 rounded-xl mt-1.5" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="font-medium">Password *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
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
                <div>
                  <Label htmlFor="confirmPassword" className="font-medium">Confirm *</Label>
                  <Input id="confirmPassword" type="password" placeholder="Repeat password" className="h-12 rounded-xl mt-1.5" {...register('confirmPassword')} />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1.5">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="font-medium">Country</Label>
                  <Input id="country" placeholder="Germany" className="h-12 rounded-xl mt-1.5" {...register('country')} />
                </div>
                <div>
                  <Label htmlFor="phone" className="font-medium">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+49..." className="h-12 rounded-xl mt-1.5" {...register('phone')} />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                <Checkbox id="gdprConsent" className="mt-0.5 rounded" {...register('gdprConsent')} />
                <Label htmlFor="gdprConsent" className="text-sm font-normal leading-relaxed cursor-pointer">
                  I agree to the processing of my personal data in accordance with the{' '}
                  <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              {errors.gdprConsent && (
                <p className="text-sm text-destructive">{errors.gdprConsent.message}</p>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Free Account'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}