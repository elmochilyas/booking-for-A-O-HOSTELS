'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Check, ArrowRight, ArrowLeft, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { registerSchema } from '@/lib/validations'
import { authService } from '@/services/auth.service'
import { cn } from '@/lib/utils'
import type { z } from 'zod'

type RegisterFormData = z.infer<typeof registerSchema>

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const labels = ['', 'Weak', 'Fair', 'Strong']
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn('h-1.5 flex-1 rounded-full transition-all', level <= strength ? colors[strength] : 'bg-muted')}
          />
        ))}
      </div>
      <p className={cn('text-xs mt-1', strength === 1 ? 'text-red-400' : strength === 2 ? 'text-yellow-500' : 'text-green-600')}>
        {labels[strength]}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const handleNext = async () => {
    const valid = await trigger(['firstName', 'lastName', 'email', 'password', 'confirmPassword'])
    if (valid) setStep(2)
  }

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
    } catch {
      setError('Registration failed. Please try again.')
      setStep(1)
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
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-14 h-14 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-extrabold text-white">A&O</span>
            </div>
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={cn('w-3 h-3 rounded-full transition-all', step >= 1 ? 'bg-primary scale-110' : 'bg-muted')} />
              <div className="w-8 h-0.5 bg-muted" />
              <div className={cn('w-3 h-3 rounded-full transition-all', step >= 2 ? 'bg-primary scale-110' : 'bg-muted')} />
            </div>
            <p className="text-sm text-muted-foreground">Step {step} of 2</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold">Let&apos;s get started</h2>
                    <p className="text-muted-foreground mt-1">Create your free A&O account</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="font-medium">First Name *</Label>
                      <Input id="firstName" placeholder="John" className="h-12 rounded-xl mt-1.5" {...register('firstName')} />
                      {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-medium">Last Name *</Label>
                      <Input id="lastName" placeholder="Doe" className="h-12 rounded-xl mt-1.5" {...register('lastName')} />
                      {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-medium">Email *</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="h-12 rounded-xl mt-1.5" {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password" className="font-medium">Password *</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className="h-12 pr-12 rounded-xl"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="font-medium">Confirm Password *</Label>
                    <Input id="confirmPassword" type="password" placeholder="Repeat password" className="h-12 rounded-xl mt-1.5" {...register('confirmPassword')} />
                    {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full h-12 rounded-xl text-base font-semibold">
                    Next Step
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold">Almost there</h2>
                    <p className="text-muted-foreground mt-1">A few more details (all optional)</p>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className="font-medium">Date of Birth <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="dateOfBirth" type="date" className="h-12 rounded-xl mt-1.5" {...register('dateOfBirth')} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" className="font-medium">Country <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input id="country" placeholder="Germany" className="h-12 rounded-xl mt-1.5" {...register('country')} />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="font-medium">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input id="phone" type="tel" placeholder="+49..." className="h-12 rounded-xl mt-1.5" {...register('phone')} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <Checkbox id="gdprConsent" className="mt-0.5 rounded" {...register('gdprConsent')} />
                    <Label htmlFor="gdprConsent" className="text-sm font-normal leading-relaxed cursor-pointer">
                      I agree to the processing of my personal data per the{' '}
                      <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link> *
                    </Label>
                  </div>
                  {errors.gdprConsent && <p className="text-xs text-destructive">{errors.gdprConsent.message}</p>}

                  {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl text-center">{error}</div>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-2 h-12 rounded-xl text-base font-semibold flex-1" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Free Account'}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
