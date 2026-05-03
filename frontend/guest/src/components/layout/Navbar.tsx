'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, User, Menu, X, Heart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/hostels', label: 'Hostels' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/club', label: 'A&O Club' },
  { href: '/groups', label: 'Groups' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { isAuthenticated, guest } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span className="text-3xl font-extrabold text-primary group-hover:scale-110 transition-transform">A&O</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-muted/50',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 hover:bg-muted rounded-full transition-all hover:scale-105"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/account/wishlist" className="hidden sm:flex p-2.5 hover:bg-muted rounded-full transition-all hover:scale-105">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                </Link>
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
                    Join Free
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 hover:bg-muted rounded-full transition-colors lg:hidden"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-4 animate-slide-up">
            <form action="/search" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="location"
                  placeholder="Search destination, city, or hostel..."
                  className="pl-10 h-11 rounded-full border-2 focus:border-primary transition-colors"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-full px-6">
                Search
              </Button>
            </form>
          </div>
        )}

        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t space-y-1 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-muted',
                  pathname === link.href ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t space-y-2">
              {isAuthenticated ? (
                <Link href="/account" className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-primary">
                  My Account
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-primary">
                    Login
                  </Link>
                  <Link href="/auth/register" className="block px-4 py-3 text-base font-medium text-primary hover:underline">
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}