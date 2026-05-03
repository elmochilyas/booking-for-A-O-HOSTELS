'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth.store'
import { profileSchema, changePasswordSchema } from '@/lib/validations'
import type { z } from 'zod'

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof changePasswordSchema>

export default function ProfilePage() {
  const { guest } = useAuthStore()

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: guest?.firstName || '',
      lastName: guest?.lastName || '',
      email: guest?.email || '',
      phone: guest?.phone || '',
      country: guest?.country || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onProfileSubmit = (data: ProfileFormData) => {
    console.log('Update profile:', data)
  }

  const onPasswordSubmit = (data: PasswordFormData) => {
    console.log('Change password:', data)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...registerProfile('firstName')} />
                {profileErrors.firstName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...registerProfile('lastName')} />
                {profileErrors.lastName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...registerProfile('email')} />
                {profileErrors.email && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...registerProfile('phone')} />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...registerProfile('country')} />
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" {...registerPassword('currentPassword')} />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>Permanently delete your account and all data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This action cannot be undone. All your bookings, loyalty points, and personal data will be permanently deleted.
          </p>
          <Button variant="destructive">Delete My Account</Button>
        </CardContent>
      </Card>
    </div>
  )
}