'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/stores/auth.store'
import { profileSchema, changePasswordSchema } from '@/lib/validations'
import { Camera, CheckCircle, AlertTriangle, Mail, Phone, Shield, Trash2, Bell, Globe } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { z } from 'zod'

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof changePasswordSchema>

export default function ProfilePage() {
  const { guest } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailMarketing: false,
    emailReminders: true,
    smsReminders: false,
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
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
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    console.log('Update profile:', data)
    await new Promise(r => setTimeout(r, 1000))
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    console.log('Change password:', data)
    await new Promise(r => setTimeout(r, 1000))
  }

  const handleDeleteAccount = () => {
    console.log('Delete account')
    setShowDeleteDialog(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      {/* Profile Header with Avatar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-3xl">
                {guest?.firstName?.[0] || 'G'}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border-2 border-primary hover:scale-110 transition-transform">
                <Camera className="h-4 w-4 text-primary" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{guest?.firstName} {guest?.lastName}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{guest?.email}</span>
                  {guest?.isEmailVerified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
                {guest?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{guest.phone}</span>
                  </div>
                )}
              </div>
            </div>
            {guest?.aoClubMember && (
              <Badge className="bg-gradient-to-r from-primary to-orange-400 text-white border-0 px-4 py-1.5">
                <Shield className="h-4 w-4 mr-1.5" />
                A&O Club Member
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...registerProfile('firstName')} className="mt-1.5" />
                {profileErrors.firstName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...registerProfile('lastName')} className="mt-1.5" />
                {profileErrors.lastName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...registerProfile('email')} className="mt-1.5" />
                {profileErrors.email && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...registerProfile('phone')} className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...registerProfile('country')} className="mt-1.5" />
            </div>

            <Button type="submit" disabled={isProfileSubmitting}>
              {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Booking Confirmations</p>
                <p className="text-sm text-muted-foreground">Receive email confirmations for bookings</p>
              </div>
              <Switch
                checked={notificationSettings.emailBookings}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailBookings: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">Get updates on deals and offers</p>
              </div>
              <Switch
                checked={notificationSettings.emailMarketing}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailMarketing: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Booking Reminders</p>
                <p className="text-sm text-muted-foreground">Reminders before check-in/out</p>
              </div>
              <Switch
                checked={notificationSettings.emailReminders}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailReminders: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive booking updates via SMS</p>
              </div>
              <Switch
                checked={notificationSettings.smsReminders}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsReminders: checked }))}
              />
            </div>
          </div>
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
              <Input id="currentPassword" type="password" {...registerPassword('currentPassword')} className="mt-1.5" />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...registerPassword('newPassword')} className="mt-1.5" />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} className="mt-1.5" />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isPasswordSubmitting}>
              {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your account and all data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This action cannot be undone. All your bookings, loyalty points, and personal data will be permanently deleted.
          </p>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}