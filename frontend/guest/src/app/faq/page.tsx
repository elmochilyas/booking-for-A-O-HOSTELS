'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type FAQCategory = {
  title: string
  questions: { q: string; a: string }[]
}

const faqCategories: Record<string, FAQCategory> = {
  booking: {
    title: 'Booking',
    questions: [
      { q: 'How do I make a booking?', a: 'Use our search bar to find your destination, select your dates, and choose your room type. Follow the steps to complete your booking.' },
      { q: 'Can I modify my booking?', a: 'Yes, you can modify your booking by logging into your account and going to "My Bookings". Changes are subject to availability and cancellation policy.' },
      { q: 'What is the cancellation policy?', a: 'Free cancellation is available until 24 hours before check-in. After that, the first night is non-refundable.' },
      { q: 'How do I use a promo code?', a: 'Enter your promo code in the designated field during the booking process, before payment.' },
    ],
  },
  payment: {
    title: 'Payment',
    questions: [
      { q: 'What payment methods are accepted?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers.' },
      { q: 'Can I pay a deposit now and the rest later?', a: 'Yes! You can choose to pay a 30% deposit now and pay the remaining amount at the hotel during check-in.' },
      { q: 'Is my payment secure?', a: 'Yes, all payments are processed securely through Stripe. We are PCI-DSS compliant.' },
    ],
  },
  checkin: {
    title: 'Check-in & Check-out',
    questions: [
      { q: 'What are the check-in/out times?', a: 'Check-in is from 3:00 PM and check-out is by 10:00 AM. Early check-in and late check-out can be added as extras.' },
      { q: 'What do I need for check-in?', a: 'Valid photo ID (passport or national ID) and a credit card for the security deposit.' },
      { q: 'Can I check in late?', a: 'Yes, our 24/7 reception means you can check in at any time. Just let us know your approximate arrival time.' },
    ],
  },
  rooms: {
    title: 'Rooms & Facilities',
    questions: [
      { q: 'What amenities are included?', a: 'All rooms include free WiFi, bed linens, and access to shared facilities. Some rooms have private bathrooms.' },
      { q: 'Are towels included?', a: 'Towels are available for rent (€2) or you can bring your own. Private rooms include towels.' },
      { q: 'Is breakfast included?', a: 'Breakfast is not included but can be added for €12 per person per day.' },
      { q: 'Can I cook my own food?', a: 'Yes, most of our hostels have shared kitchens available for guest use.' },
    ],
  },
  aoClub: {
    title: 'A&O Club',
    questions: [
      { q: 'How do I join A&O Club?', a: 'Simply create a free account. Membership is free and requires no credit card.' },
      { q: 'What discounts do I get?', a: 'Members get 25% off the best available rate on all bookings.' },
      { q: 'How do I earn points?', a: 'Earn 10 points for every euro spent. Points can be redeemed for discounts or free nights.' },
    ],
  },
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = Object.entries(faqCategories).reduce((acc, [key, category]) => {
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

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Contact us.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {Object.entries(filteredCategories).map(([key, category]) => (
            <div key={key} className="mb-8">
              <h2 className="text-xl font-bold mb-4">{category.title}</h2>
              <Accordion type="single" collapsible className="bg-card rounded-lg border">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`${key}-${index}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a href="/contact">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Contact Us
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}