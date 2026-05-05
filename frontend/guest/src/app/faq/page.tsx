'use client'

import { useState, useMemo } from 'react'
import { Search, MessageCircle, CreditCard, Bed, Key, Star, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type FAQCategory = {
  title: string
  icon: any
  color: string
  questions: { q: string; a: string; popular?: boolean }[]
}

const faqCategories: Record<string, FAQCategory> = {
  booking: {
    title: 'Booking',
    icon: Bed,
    color: 'text-blue-600 bg-blue-100',
    questions: [
      { q: 'How do I make a booking?', a: 'Use our search bar to find your destination, select your dates, and choose your room type. Follow the steps to complete your booking.', popular: true },
      { q: 'Can I modify my booking?', a: 'Yes, you can modify your booking by logging into your account and going to "My Bookings". Changes are subject to availability and cancellation policy.' },
      { q: 'What is the cancellation policy?', a: 'Free cancellation is available until 24 hours before check-in. After that, the first night is non-refundable.', popular: true },
      { q: 'How do I use a promo code?', a: 'Enter your promo code in the designated field during the booking process, before payment.' },
    ],
  },
  payment: {
    title: 'Payment',
    icon: CreditCard,
    color: 'text-green-600 bg-green-100',
    questions: [
      { q: 'What payment methods are accepted?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers.' },
      { q: 'Can I pay a deposit now and the rest later?', a: 'Yes! You can choose to pay a 30% deposit now and pay the remaining amount at the hotel during check-in.' },
      { q: 'Is my payment secure?', a: 'Yes, all payments are processed securely through Stripe. We are PCI-DSS compliant.', popular: true },
    ],
  },
  checkin: {
    title: 'Check-in & Check-out',
    icon: Key,
    color: 'text-orange-600 bg-orange-100',
    questions: [
      { q: 'What are the check-in/out times?', a: 'Check-in is from 3:00 PM and check-out is by 10:00 AM. Early check-in and late check-out can be added as extras.' },
      { q: 'What do I need for check-in?', a: 'Valid photo ID (passport or national ID) and a credit card for the security deposit.', popular: true },
      { q: 'Can I check in late?', a: 'Yes, our 24/7 reception means you can check in at any time. Just let us know your approximate arrival time.' },
    ],
  },
  rooms: {
    title: 'Rooms & Facilities',
    icon: Bed,
    color: 'text-purple-600 bg-purple-100',
    questions: [
      { q: 'What amenities are included?', a: 'All rooms include free WiFi, bed linens, and access to shared facilities. Some rooms have private bathrooms.' },
      { q: 'Are towels included?', a: 'Towels are available for rent (€2) or you can bring your own. Private rooms include towels.' },
      { q: 'Is breakfast included?', a: 'Breakfast is not included but can be added for €12 per person per day.' },
      { q: 'Can I cook my own food?', a: 'Yes, most of our hostels have shared kitchens available for guest use.' },
    ],
  },
  aoClub: {
    title: 'A&O Club',
    icon: Star,
    color: 'text-yellow-600 bg-yellow-100',
    questions: [
      { q: 'How do I join A&O Club?', a: 'Simply create a free account. Membership is free and requires no credit card.', popular: true },
      { q: 'What discounts do I get?', a: 'Members get 25% off the best available rate on all bookings.' },
      { q: 'How do I earn points?', a: 'Earn 10 points for every euro spent. Points can be redeemed for discounts or free nights.' },
    ],
  },
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandAll, setExpandAll] = useState(false)

  const filteredCategories = useMemo(() => {
    return Object.entries(faqCategories).reduce((acc, [key, category]) => {
      const filteredQuestions = category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filteredQuestions.length > 0) {
        acc[key] = { ...category, questions: filteredQuestions }
      }
      return acc
    }, {} as typeof faqCategories)
  }, [searchTerm])

  const popularQuestions = useMemo(() => {
    const all = Object.values(faqCategories).flatMap(cat => 
      cat.questions.filter(q => q.popular).map(q => ({ ...q, category: cat.title }))
    )
    return all.slice(0, 5)
  }, [])

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
    )
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">
            Find answers to common questions about bookings, payments, and more.
          </p>
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg rounded-full border-2 focus:border-primary"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Popular Questions */}
        {!searchTerm && (
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Popular Questions
            </h2>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                {popularQuestions.map((item, index) => (
                  <div key={index}>
                    <a
                      href="#"
                      className="block p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <p className="font-medium text-sm">{item.q}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">{item.category}</Badge>
                    </a>
                    {index < popularQuestions.length - 1 && <div className="border-b mx-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {Object.values(filteredCategories).reduce((acc, cat) => acc + cat.questions.length, 0)} questions found
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandAll(!expandAll)}
              className="rounded-full"
            >
              {expandAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expand All
                </>
              )}
            </Button>
          </div>

          {Object.entries(filteredCategories).map(([key, category]) => (
            <div key={key} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">{category.title}</h2>
                <Badge variant="secondary">{category.questions.length}</Badge>
              </div>
              <Accordion type={expandAll ? 'multiple' : 'single'} collapsible className="space-y-2">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`${key}-${index}`} className="bg-card rounded-lg border px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="flex-1">{highlightText(item.q)}</span>
                      {item.popular && (
                        <Badge variant="secondary" className="ml-2 shrink-0">Popular</Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-4">
                        <p className="text-muted-foreground">{highlightText(item.a)}</p>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground mr-2">Was this helpful?</span>
                          <Button variant="outline" size="sm" className="rounded-full h-8">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            Yes
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full h-8">
                            <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                            No
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No results found</h3>
              <p className="text-muted-foreground">Try a different search term or browse all categories.</p>
            </div>
          )}
        </div>

        {/* Still Have Questions */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-2xl max-w-2xl mx-auto">
          <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">Can't find what you're looking for? Our team is here to help.</p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}