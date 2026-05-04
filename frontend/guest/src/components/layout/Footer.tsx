'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/cancellation', label: 'Cancellation Policy' },
  ],
  topDestinations: [
    { href: '/hostels/berlin', label: 'Berlin' },
    { href: '/hostels/hamburg', label: 'Hamburg' },
    { href: '/hostels/vienna', label: 'Vienna' },
    { href: '/hostels/prague', label: 'Prague' },
    { href: '/hostels/munich', label: 'Munich' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="text-4xl font-extrabold text-white group-hover:scale-105 transition-transform">A&O</span>
            </Link>
            <p className="mt-5 text-white/70 max-w-sm leading-relaxed">
              Budget-friendly hostels across Europe since 1999. Central locations, social atmosphere, unbeatable prices.
            </p>

            <div className="mt-6 flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Kreuzberger Str. 36, Berlin, Germany</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+49 30 809 500 50</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@aohostels.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-primary hover:translate-x-1 transition-all inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-primary hover:translate-x-1 transition-all inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-5">Top Destinations</h4>
            <div className="grid grid-cols-2 gap-3">
              {footerLinks.topDestinations.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-white/70 hover:text-primary hover:translate-x-1 transition-all inline-block">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="font-bold text-white mb-4">Download Our App</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-all">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-white/60">Download on the</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-all">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zM5.134 3.045l8.636 8.635L5.134 19.315z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-white/60">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <span className="text-sm text-white/60">Subscribe to newsletter:</span>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 w-64 focus:bg-white/20 transition-all"
                />
                <Button type="submit" size="sm" className="rounded-full px-6">
                  Subscribe
                </Button>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-white/60">
                © {new Date().getFullYear()} A&O Hostels. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}