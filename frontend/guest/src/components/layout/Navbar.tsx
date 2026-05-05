'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, User, Menu, X, Heart, Command, Bell, Globe, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const navLinks = [
  { href: '/hostels', label: 'Hostels' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/club', label: 'A&O Club', badge: '25% OFF' },
  { href: '/groups', label: 'Groups' },
]

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

const currencies = [
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('EUR')
  const { isAuthenticated, guest } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const showWishlist = isAuthenticated
  const notificationCount = 3 // This would come from an API

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-xl border-b',
          scrolled ? 'shadow-md' : 'shadow-none border-transparent'
        )}
      >
        <div className="container mx-auto px-4">
          <div className={cn('flex items-center justify-between transition-all duration-300', scrolled ? 'h-12' : 'h-16')}>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center">
                <svg
                  className={cn('transition-all duration-300 group-hover:scale-110', scrolled ? 'w-6 h-6' : 'w-7 h-7')}
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
<path d="M16 2L28 26H4L16 2Z" fill="#293a88" />
                   <path d="M16 8L22 22H10L16 8Z" fill="#4159a8" />
                </svg>
                <span className={cn('font-bold ml-1 tracking-tight text-secondary transition-all duration-300', scrolled ? 'text-lg' : 'text-xl')}>
                  a&o
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative font-medium transition-all duration-300 hover:text-primary rounded-md hover:bg-muted/50 flex items-center gap-1.5',
                    scrolled ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm',
                    pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                  {link.badge && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 animate-pulse">
                      {link.badge}
                    </Badge>
                  )}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-transparent bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                aria-label="Search (Cmd+K)"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:flex items-center gap-1 text-xs opacity-70">
                  <Command className="h-3 w-3" />K
                </span>
              </button>

              {/* Language & Currency Selector - Desktop */}
              <div className="hidden md:flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-muted transition-colors text-sm">
                      <Globe className="h-4 w-4" />
                      <span className="text-muted-foreground">{languages.find(l => l.code === language)?.flag}</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(language === lang.code && 'bg-muted')}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-muted transition-colors text-sm font-medium">
                      {currencies.find(c => c.code === currency)?.symbol}
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-24">
                    {currencies.map((curr) => (
                      <DropdownMenuItem
                        key={curr.code}
                        onClick={() => setCurrency(curr.code)}
                        className={cn(currency === curr.code && 'bg-muted')}
                      >
                        {curr.symbol} {curr.code}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {showWishlist && (
                    <Link href="/account/wishlist" className="hidden sm:flex p-2.5 hover:bg-muted rounded-full transition-all hover:scale-105 relative">
                      <Heart className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  )}
                  
                  {/* Notification Bell */}
                  <button className="hidden sm:flex p-2.5 hover:bg-muted rounded-full transition-all relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  <Link href="/account">
                    <Button size="sm" className="gap-2 rounded-full px-4 hover:shadow-md transition-all">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{guest?.firstName || 'Account'}</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="font-medium hover:text-primary">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="rounded-full px-5 hover:shadow-lg transition-all">
                      Book Now
                    </Button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-full transition-colors lg:hidden hover:bg-muted"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form action="/search" className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  name="location"
                  placeholder="Where do you want to go?"
                  autoFocus
                  className="pl-12 h-14 text-lg rounded-xl border-0 focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSearchModalOpen(false)
                  }}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Input
                  name="check_in"
                  type="date"
                  className="h-11 rounded-xl"
                  aria-label="Check-in"
                />
                <Input
                  name="check_out"
                  type="date"
                  className="h-11 rounded-xl"
                  aria-label="Check-out"
                />
                <Input
                  name="guests"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="h-11 w-24 rounded-xl"
                  aria-label="Guests"
                />
                <Button type="submit" size="lg" className="rounded-xl px-8">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 w-80 h-full bg-white shadow-xl animate-slide-up overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User Info in Mobile Menu */}
            {isAuthenticated && (
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {guest?.firstName?.[0] || 'G'}
                  </div>
                  <div>
                    <p className="font-semibold">{guest?.firstName} {guest?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{guest?.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-muted',
                    pathname === link.href ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            {/* Language & Currency in Mobile */}
            <div className="p-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <div className="flex gap-1">
                  {languages.slice(0, 4).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        'px-2 py-1 rounded-md text-sm transition-colors',
                        language === lang.code ? 'bg-primary text-white' : 'hover:bg-muted'
                      )}
                    >
                      {lang.flag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Currency</span>
                <div className="flex gap-1">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={cn(
                        'px-2 py-1 rounded-md text-sm font-medium transition-colors',
                        currency === curr.code ? 'bg-primary text-white' : 'hover:bg-muted'
                      )}
                    >
                      {curr.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/account"
                    className="block w-full text-center py-3 text-base font-medium text-primary bg-primary/5 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => { useAuthStore.getState().logout(); setIsMenuOpen(false) }}
                    className="block w-full text-center py-3 text-base font-medium text-destructive"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center py-3 text-base font-medium text-muted-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full text-center py-3 text-base font-medium bg-primary text-white rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}