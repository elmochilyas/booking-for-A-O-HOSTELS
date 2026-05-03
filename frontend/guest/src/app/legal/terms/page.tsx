export default function TermsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to A&O Hostels. By accessing and booking through our website, you agree to be bound by
              these Terms and Conditions. Please read them carefully before making any booking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Booking & Payment</h2>
            <p className="text-muted-foreground">
              All bookings are subject to availability. A booking is confirmed when you receive a confirmation
              email. Payment can be made via credit card, debit card, or PayPal. For select bookings, you may
              pay a deposit (30%) with the balance due at the hotel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cancellation Policy</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Free cancellation up to 24 hours before check-in</li>
              <li>Cancellation within 24 hours of check-in: first night non-refundable</li>
              <li>No-show: full booking amount non-refundable</li>
              <li>Early departure: no refund for unused nights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Check-in & Check-out</h2>
            <p className="text-muted-foreground">
              Check-in time is from 3:00 PM. Check-out time is by 10:00 AM. Late check-out may be available
              upon request and is subject to additional charges. A valid photo ID is required at check-in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. House Rules</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Quiet hours: 10:00 PM - 7:00 AM</li>
              <li>No smoking in rooms (smoking areas available)</li>
              <li>No pets allowed (except service animals)</li>
              <li>Guests must behave respectfully to staff and other guests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Liability</h2>
            <p className="text-muted-foreground">
              A&O Hostels is not responsible for any loss, damage, or injury to guests or their property during
              their stay. Guests are responsible for their personal belongings. Lockers are available for
              secure storage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of our website constitutes
              acceptance of any changes.
            </p>
          </section>
        </div>

        <p className="text-sm text-muted-foreground mt-12">
          Last updated: April 30, 2026
        </p>
      </div>
    </div>
  )
}