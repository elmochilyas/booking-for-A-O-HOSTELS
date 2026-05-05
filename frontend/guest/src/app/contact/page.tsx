'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { contactSchema } from '@/lib/validations'
import { useProperties } from '@/hooks/useProperties'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { z } from 'zod'

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const { data: properties } = useProperties()
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      console.log('Contact form:', data)
      await new Promise(r => setTimeout(r, 1000))
      setSubmitted(true)
      reset()
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-secondary text-secondary-foreground py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-orange-400 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">We're Here to Help</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Have questions? We&apos;d love to hear from you. Our team is here to assist.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-full">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" {...register('name')} className="mt-1.5" />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" {...register('email')} className="mt-1.5" />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" {...register('subject')} className="mt-1.5" />
                    {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" {...register('message')} rows={6} className="mt-1.5" />
                    {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
                  </div>

                  {submitError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" size="lg" className="w-full rounded-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Main Contact Info */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <h3 className="text-xl font-bold mb-1">Get in Touch</h3>
                <p className="text-white/80">We're here to help you</p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl shrink-0">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Email Us</p>
                      <a href="mailto:info@aohostels.com" className="text-primary hover:underline">
                        info@aohostels.com
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">For general inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl shrink-0">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Call Us</p>
                      <a href="tel:+493080950050" className="text-primary hover:underline">
                        +49 30 809 500 50
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9am-6pm CET</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-50 rounded-xl shrink-0">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Visit Us</p>
                      <p className="text-muted-foreground">Kreuzberger Str. 36</p>
                      <p className="text-muted-foreground">10965 Berlin, Germany</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl shrink-0">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Office Hours</p>
                      <p className="text-muted-foreground">Monday - Friday: 9am - 6pm</p>
                      <p className="text-muted-foreground">Saturday: 10am - 4pm</p>
                      <p className="text-muted-foreground">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative h-48 bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Interactive Map</p>
                    <p className="text-xs text-muted-foreground">Berlin Headquarters</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { href: '/faq', label: 'Frequently Asked Questions' },
                    { href: '/account/bookings', label: 'Manage My Booking' },
                    { href: '/groups', label: 'Group Booking Inquiry' },
                    { href: '/club', label: 'A&O Club Membership' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> For booking inquiries or modifications, please log in to your
                  account and use the &quot;My Bookings&quot; section for fastest service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
     </div>
   )
}