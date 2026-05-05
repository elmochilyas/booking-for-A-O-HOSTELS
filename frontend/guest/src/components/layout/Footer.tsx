'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Star, Send, Check, X, ChevronRight, ChevronUp, Accessibility } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const footerLinks = {
  destinations: [
    { href: '/hostels?city=berlin', label: '🇩🇪 Berlin' },
    { href: '/hostels?city=hamburg', label: '🇩🇪 Hamburg' },
    { href: '/hostels?city=vienna', label: '🇦🇹 Vienna' },
    { href: '/hostels?city=prague', label: '🇨🇿 Prague' },
    { href: '/hostels?city=munich', label: '🇩🇪 Munich' },
    { href: '/hostels?city=budapest', label: '🇭🇺 Budapest' },
    { href: '/hostels?city=rome', label: '🇮🇹 Rome' },
    { href: '/hostels?city=amsterdam', label: '🇳🇱 Amsterdam' },
    { href: '/hostels?city=milan', label: '🇮🇹 Milan' },
    { href: '/hostels?city=paris', label: '🇫🇷 Paris' },
    { href: '/hostels?city=barcelona', label: '🇪🇸 Barcelona' },
    { href: '/hostels?city=copenhagen', label: '🇩🇰 Copenhagen' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/club', label: 'A&O Club' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/groups', label: 'Group Bookings' },
    { href: '/experiences', label: 'Experiences' },
    { href: '/legal/terms', label: 'Terms' },
    { href: '/legal/privacy', label: 'Privacy' },
  ],
}

const socialLinks = [
  { href: 'https://facebook.com', label: 'Facebook', icon: Facebook },
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://tiktok.com', label: 'TikTok', icon: 'tiktok' },
]

const paymentMethods = [
  { name: 'Visa', icon: VisaIcon },
  { name: 'Mastercard', icon: MastercardIcon },
  { name: 'Amex', icon: AmexIcon },
  { name: 'PayPal', icon: PayPalIcon },
  { name: 'Google Pay', icon: GooglePayIcon },
  { name: 'Apple Pay', icon: ApplePayIcon },
]

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.84-4.25V2h-3.44v12a4.84 4.84 0 0 1-8 3.89 4.83 4.83 0 0 1 3.83-4.26V6.5a2.5 2.5 0 1 0-5 0v.19a1.62 1.62 0 0 0-.16.81V15a2 2 0 1 0 4 0V7.5h3z" />
    </svg>
  )
}

function VisaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="24" y="20" fontSize="14" fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="Arial, sans-serif">VISA</text>
    </svg>
  )
}

function MastercardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" />
      <circle cx="18" cy="16" r="10" fill="#EB001B" opacity="0.8" />
      <circle cx="30" cy="16" r="10" fill="#F79E1B" opacity="0.8" />
    </svg>
  )
}

function AmexIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <text x="24" y="20" fontSize="9" fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="Arial, sans-serif">AMEX</text>
    </svg>
  )
}

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" />
      <text x="24" y="14" fontSize="8" fontWeight="bold" fill="#003087" textAnchor="middle" fontFamily="Arial, sans-serif">Pay</text>
      <text x="24" y="24" fontSize="8" fontWeight="bold" fill="#009cde" textAnchor="middle" fontFamily="Arial, sans-serif">Pal</text>
    </svg>
  )
}

function GooglePayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" />
      <text x="24" y="20" fontSize="8" fontWeight="bold" fill="#5F6368" textAnchor="middle" fontFamily="Arial, sans-serif">G Pay</text>
    </svg>
  )
}

function ApplePayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#000" />
      <text x="24" y="20" fontSize="9" fontWeight="600" fill="#fff" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">Pay</text>
    </svg>
  )
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    
    setTimeout(() => {
      if (email.includes('@')) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
        setErrorMsg('Please enter a valid email address')
      }
    }, 1000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-secondary text-white relative">
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 hover:scale-110 transition-all animate-fade-in"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
          {/* Brand & Social */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <svg
                className="w-10 h-10 transition-transform group-hover:scale-110"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
<path d="M16 2L28 26H4L16 2Z" fill="#293a88" />
                 <path d="M16 8L22 22H10L16 8Z" fill="#4159a8" />
              </svg>
              <span className="text-3xl font-bold">a&o</span>
            </Link>
            <p className="mt-4 text-white/70 max-w-sm leading-relaxed">
              Budget hostels across Europe. Central locations, social atmosphere, unbeatable prices.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-white/70">4.7 · 15,000+ reviews</span>
            </div>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 rounded-full hover:bg-primary hover:scale-110 transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon === 'tiktok' ? (
                    <TikTokIcon className="h-5 w-5" />
                  ) : (
                    <social.icon className="h-5 w-5" />
                  )}
                </a>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Kreuzberger Str. 36, Berlin, Germany</span>
              </div>
              <a href="tel:+493080950050" className="flex items-center gap-3 text-white/70 text-sm hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+49 30 809 500 50</span>
              </a>
              <a href="mailto:info@aohostels.com" className="flex items-center gap-3 text-white/70 text-sm hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>info@aohostels.com</span>
              </a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-bold text-white mb-5">Destinations</h4>
            <ul className="space-y-2.5">
              {footerLinks.destinations.slice(0, 8).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/hostels"
              className="group text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
            >
              View all cities
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-5">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-5">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App Downloads */}
          <div>
            <h4 className="font-bold text-white mb-5">Get the App</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-all hover:scale-[1.02]"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/60">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-all hover:scale-[1.02]"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zM5.134 3.045l8.636 8.635L5.134 19.315z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/60">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="text-sm text-white/60 mr-2">We accept:</span>
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.name}
                  className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/80 hover:bg-white/20 transition-colors flex items-center gap-1.5"
                  title={method.name}
                >
                  <Icon className="h-6 w-9" />
                  <span className="sr-only">{method.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Newsletter & Copyright */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Newsletter Form */}
            {status === 'success' ? (
              <div className="flex items-center gap-3 text-green-400 bg-green-400/10 px-4 py-3 rounded-xl">
                <Check className="h-5 w-5" />
                <span>Thanks for subscribing! Check your inbox to confirm.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2 w-full max-w-md">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder="Your email for newsletter"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setStatus('idle')
                      setErrorMsg('')
                    }}
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 transition-all",
                      status === 'error' && "border-red-400"
                    )}
                  />
                  {status === 'error' && (
                    <p className="absolute -bottom-6 left-0 text-red-400 text-xs">{errorMsg}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={status === 'loading'}
                  className="rounded-full px-6 shrink-0"
                >
                  {status === 'loading' ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            )}

            {/* Copyright */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
              <span>© {new Date().getFullYear()} a&o Hotels & Hostels</span>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors flex items-center gap-1">
                <Accessibility className="h-3 w-3" />
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}