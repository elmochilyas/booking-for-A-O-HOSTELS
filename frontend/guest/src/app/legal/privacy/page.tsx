export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              At A&O Hostels, we take your privacy seriously. This policy explains how we collect, use, and
              protect your personal information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide when making a booking, creating an account, or contacting us.
              This includes your name, email, phone number, payment details, and booking history.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To process and manage your bookings</li>
              <li>To communicate with you about your reservations</li>
              <li>To provide customer support</li>
              <li>To send promotional emails (with your consent)</li>
              <li>To improve our services and website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Protection</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information. All payment
              transactions are encrypted and processed securely through our payment partners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground">
              Under GDPR, you have the right to access, correct, delete, or port your personal data. You can
              also withdraw consent for marketing communications at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies to enhance your browsing experience. You can manage cookie preferences through
              your browser settings. Essential cookies are required for the website to function.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Third Parties</h2>
            <p className="text-muted-foreground">
              We may share your data with trusted third parties for payment processing, analytics, and
              marketing. These parties are contractually obligated to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related inquiries, please contact us at privacy@ao-hostels.com.
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