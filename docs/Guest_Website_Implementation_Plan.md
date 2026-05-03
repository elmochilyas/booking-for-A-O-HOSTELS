# A&O Hostels — Guest Website Implementation Plan

## Overview

**Project:** A&O Hostels — Public Guest Website  
**Location:** `frontend/guest/`  
**Purpose:** Full company-facing website — brand showcase, all properties, city guides, booking, payments, guest accounts, A&O Club  
**Backend:** Laravel 13 API already built at `http://localhost:8000/api`  
**Reference:** Existing admin panel at `frontend/admin/` uses the same stack and API patterns

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for SEO on property/destination pages; same as admin |
| Language | TypeScript | Same as admin, type-safe API contracts |
| Styling | Tailwind CSS + shadcn/ui | Same as admin, fast consistent UI |
| HTTP Client | Axios | Same pattern as `frontend/admin/src/services/api.ts` |
| State | Zustand | Auth state, booking cart, lightweight |
| Server State | TanStack Query (React Query) | Caching, loading states, refetch on focus |
| Forms | React Hook Form + Zod | Validation, same across booking + auth forms |
| Payment UI | @stripe/react-stripe-js | Secure Stripe Elements |
| Maps | @vis.gl/react-google-maps | Property maps, destinations map |
| Calendar | react-day-picker | Date range picker for booking |
| Gallery | embla-carousel-react | Photo galleries, room image sliders |
| Animations | Framer Motion | Hero, page transitions, subtle interactions |
| Icons | Lucide React | Same as admin |
| SEO | Next.js Metadata API | Per-page og tags, structured data |
| i18n | next-intl | English + German minimum |

---

## Project Structure

```
frontend/guest/
├── public/
│   ├── images/           # Static brand assets, fallback images
│   └── icons/            # Favicon, app icons
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout (Navbar + Footer + Providers)
│   │   ├── page.tsx                 # Homepage /
│   │   ├── hostels/
│   │   │   ├── page.tsx             # All properties /hostels
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Property detail /hostels/[slug]
│   │   ├── search/
│   │   │   └── page.tsx             # Search results /search
│   │   ├── book/
│   │   │   ├── [propertyId]/
│   │   │   │   ├── page.tsx         # Step 1: Room selection
│   │   │   │   ├── extras/page.tsx  # Step 2: Add-ons
│   │   │   │   ├── details/page.tsx # Step 3: Guest info
│   │   │   │   └── payment/page.tsx # Step 4: Payment
│   │   │   └── confirmation/
│   │   │       └── [bookingId]/
│   │   │           └── page.tsx     # Confirmation
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── account/
│   │   │   ├── layout.tsx           # Protected account layout
│   │   │   ├── page.tsx             # Dashboard /account
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx         # My bookings list
│   │   │   │   └── [id]/page.tsx    # Booking detail + manage
│   │   │   ├── profile/page.tsx     # Profile settings
│   │   │   └── loyalty/page.tsx     # A&O Club points
│   │   ├── club/
│   │   │   └── page.tsx             # A&O Club landing page
│   │   ├── groups/
│   │   │   └── page.tsx             # Group & corporate bookings
│   │   ├── experiences/
│   │   │   ├── page.tsx             # City guides index
│   │   │   └── [city]/page.tsx      # Individual city guide
│   │   ├── about/
│   │   │   └── page.tsx             # About us
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact page
│   │   ├── faq/
│   │   │   └── page.tsx             # FAQ
│   │   └── legal/
│   │       ├── terms/page.tsx
│   │       └── privacy/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AccountSidebar.tsx
│   │   ├── ui/                      # shadcn/ui base components
│   │   ├── search/
│   │   │   ├── SearchBar.tsx        # Main hero search widget
│   │   │   ├── SearchFilters.tsx
│   │   │   └── PropertyCard.tsx
│   │   ├── property/
│   │   │   ├── PropertyGallery.tsx
│   │   │   ├── PropertyMap.tsx
│   │   │   ├── AmenitiesList.tsx
│   │   │   ├── RoomTypeCard.tsx
│   │   │   └── ReviewsSection.tsx
│   │   ├── booking/
│   │   │   ├── BookingSteps.tsx     # Step indicator
│   │   │   ├── AvailabilityCalendar.tsx
│   │   │   ├── RoomSelector.tsx
│   │   │   ├── ExtrasSelector.tsx
│   │   │   ├── PriceSummary.tsx
│   │   │   ├── GuestDetailsForm.tsx
│   │   │   └── PaymentForm.tsx      # Stripe Elements wrapper
│   │   ├── account/
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingActions.tsx
│   │   │   ├── LoyaltyWidget.tsx
│   │   │   └── ReviewForm.tsx
│   │   ├── club/
│   │   │   └── ClubBenefitsBanner.tsx
│   │   └── common/
│   │       ├── StarRating.tsx
│   │       ├── DateRangePicker.tsx
│   │       ├── ImageSlider.tsx
│   │       ├── MapEmbed.tsx
│   │       └── NewsletterForm.tsx
│   ├── services/
│   │   ├── api.ts                   # Axios instance (mirrors admin pattern)
│   │   ├── auth.service.ts
│   │   ├── properties.service.ts
│   │   ├── bookings.service.ts
│   │   ├── payments.service.ts
│   │   ├── guest.service.ts
│   │   └── reviews.service.ts
│   ├── stores/
│   │   ├── auth.store.ts            # Zustand: guest auth state
│   │   └── booking.store.ts         # Zustand: active booking cart
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProperties.ts
│   │   ├── useBooking.ts
│   │   └── useAvailability.ts
│   ├── types/
│   │   ├── property.types.ts
│   │   ├── booking.types.ts
│   │   ├── payment.types.ts
│   │   └── guest.types.ts
│   └── lib/
│       ├── utils.ts                 # cn(), formatCurrency(), formatDate()
│       ├── constants.ts             # Room types, amenity icons map, extras list
│       └── validations.ts           # Zod schemas for all forms
```

---

## All Pages — Detailed Breakdown

### `/` — Homepage

**Purpose:** Brand first impression, search entry point, company highlights

**Sections:**
1. **Hero** — Full-screen background video/image, tagline, `SearchBar` component (location + dates + guests)
2. **Destinations** — Interactive Europe map (`PropertyMap` in overview mode) + scrollable property cards
3. **Why A&O** — 4 value pillars: Central Location / Budget Friendly / Social Atmosphere / 24h Reception
4. **A&O Club Banner** — "Join free — save 25% on every booking" with CTA
5. **Room Types Showcase** — Horizontal scroll cards: Dorm / Private / Family / Female Only
6. **Guest Reviews Highlight** — 3 featured reviews, overall rating badge
7. **City Experiences** — Cards linking to city guides (Berlin, Hamburg, Vienna...)
8. **Instagram/Social Feed** — Static social proof grid
9. **Newsletter Signup** — Email input, GDPR consent checkbox

**API Calls:**
- `GET /properties` — load all properties for the destinations section
- No auth required

---

### `/hostels` — All Properties

**Purpose:** Browse every A&O location, filter by country/city

**Sections:**
1. **Page Header** — "Our Hostels — 30 Locations Across Europe"
2. **Europe Map** (`PropertyMap`) — pins for each property, click opens property card popup
3. **Filter Bar** — by country, city, amenities (parking, breakfast, bar...)
4. **Properties Grid** — `PropertyCard` for each: photo, city, name, star rating, "from €X/night", key amenities icons
5. **"Coming Soon" cards** — greyed out with "Opening 2026" badge

**API Calls:**
- `GET /properties` — all properties with location, rating, price_from

---

### `/hostels/[slug]` — Property Detail

**Purpose:** Full hostel page — all info a guest needs before booking

**Sections:**
1. **Photo Gallery** (`PropertyGallery`) — full-width hero carousel, thumbnail strip
2. **Property Header** — name, star rating, address, phone, check-in/out times
3. **Quick Booking Widget** — sticky sidebar/bottom bar with condensed `SearchBar` → links to `/book/[id]`
4. **About This Hostel** — rich description, vibe, highlights
5. **Location & Getting There** (`PropertyMap`) — full map, distances table (Central Station, Airport, Landmarks), public transport info, "Get directions" link
6. **Room Types** — cards for each: `RoomTypeCard` with photos, capacity, amenity icons, price, "Book" CTA
7. **Amenities & Facilities** (`AmenitiesList`) — grouped: In-Room / Property / Paid Services
8. **Extras Available** — Towel rental, Breakfast, Parking, Bicycle, Early Check-in, Late Check-out with prices
9. **House Rules & Policies** — check-in time, pet policy, cancellation terms, group policy, ID requirements
10. **Guest Reviews** (`ReviewsSection`) — overall score, category breakdown bar chart, individual reviews with verified badge, filter by rating, sort by date/helpfulness
11. **Nearby Experiences** — link to city guide for that location

**API Calls:**
- `GET /properties/{id}` — property full details
- `GET /properties/{id}/room-types` — all room types with pricing
- `GET /properties/{id}/availability?check_in=&check_out=&guests=` — availability check

---

### `/search` — Search Results

**Purpose:** Results after using the search bar from homepage or navbar

**Sections:**
1. **Search Bar** (pre-filled with query params)
2. **Filters Panel** — room type, price range, amenities, rating minimum
3. **Sort Controls** — Price low-high / Rating / Availability
4. **Results List** — `PropertyCard` components, map toggle (split-view)
5. **Map View Toggle** — side-by-side list + map or full map with pins

**URL params:** `?location=Berlin&check_in=2026-06-01&check_out=2026-06-03&guests=2`

**API Calls:**
- `GET /properties?city=&check_in=&check_out=&guests=` — filtered results

---

### `/book/[propertyId]` — Booking Flow (4 Steps)

**Step indicator at top throughout:** `BookingSteps` — 1 Room → 2 Extras → 3 Details → 4 Payment

#### Step 1: `/book/[propertyId]` — Room Selection
- Date range picker (`AvailabilityCalendar`) — blocked dates greyed out
- Guest count selector
- Available room types listed with price/night + total for selected dates
- Special request text field
- "Continue" → saves to `booking.store`

**API Calls:**
- `GET /properties/{id}/availability?check_in=&check_out=&guests=`
- `GET /properties/{id}/room-types`

#### Step 2: `/book/[propertyId]/extras` — Add-ons
- `ExtrasSelector` — each extra with icon, description, price, quantity selector
  - Towel rental (€2/per)
  - Breakfast (€X/person/day)
  - Parking (€8/night)
  - Bicycle rental (€X/day)
  - Early check-in (€X)
  - Late check-out (€X)
- `PriceSummary` — live updating sidebar: room subtotal + extras + taxes + **total**
- A&O Club 25% discount row (if member, auto-applied)
- Promo code input field

#### Step 3: `/book/[propertyId]/details` — Guest Information
- Pre-filled from guest profile if logged in
- Fields: Full name, Email, Phone, Country, Date of birth, Special requests (pets, dietary, accessibility)
- If not logged in: option to create account or continue as guest
- Cancellation policy shown prominently before proceeding

#### Step 4: `/book/[propertyId]/payment` — Payment
- `PriceSummary` (final, read-only)
- Split payment toggle: "Pay full now" vs "Pay deposit (30%) + rest at hotel"
- Payment methods: Credit/Debit card (Stripe Elements) / PayPal button
- Security badges: PCI-DSS, SSL lock
- "Confirm & Pay" button

**API Calls:**
- `POST /bookings` — create booking (returns booking_id)
- `POST /payments/create-intent` — get Stripe payment intent
- Stripe.js handles card processing client-side

---

### `/book/confirmation/[bookingId]` — Confirmation

**Sections:**
1. **Success banner** — green checkmark, "Booking Confirmed!"
2. **Booking Summary** — Booking ID, property, room type, dates, guest name
3. **Check-in Instructions** — address, check-in time, what to bring (ID + credit card)
4. **Google Maps Link** — "Get directions to A&O Berlin Hauptbahnhof"
5. **WiFi & Access info**
6. **Add to Calendar** button (iCal / Google Calendar)
7. **Download PDF confirmation** link
8. **"Manage this booking"** → links to `/account/bookings/[id]`

**API Calls:**
- `GET /bookings/{id}` — booking full details
- `GET /invoices/{bookingId}` — download link

---

### `/auth/login` — Login
- Email + password form
- "Forgot password?" link
- "Don't have an account?" → register
- On success: redirect to previous page or `/account`

**API Calls:** `POST /auth/login`

---

### `/auth/register` — Register
- Full name, email, password, confirm password
- Date of birth, country, phone (optional)
- GDPR consent checkbox
- "Already have an account?" → login
- Email verification notice after submit

**API Calls:** `POST /auth/register` → `POST /auth/verify-email`

---

### `/auth/forgot-password` & `/auth/reset-password`
- Standard flows, email input → check inbox → new password form

**API Calls:** `POST /auth/forgot-password` / `POST /auth/reset-password`

---

### `/account` — Guest Dashboard (Protected)

**Layout:** Left sidebar (`AccountSidebar`) with nav: Dashboard / My Bookings / Profile / A&O Club

**Dashboard Page Sections:**
- Welcome banner with guest name + A&O Club status badge
- **Upcoming bookings** — next 2 bookings with "Manage" links
- **Loyalty points widget** — current balance, "X points until free night"
- **Quick actions** — "Find a hostel", "View all bookings", "Invite a friend"

**API Calls:**
- `GET /guest/profile`
- `GET /guest/bookings?status=upcoming`
- `GET /guest/loyalty`

---

### `/account/bookings` — My Bookings

- Tab filter: Upcoming / Past / Cancelled
- `BookingCard` per booking: property photo, dates, room type, status badge, price
- Click → goes to `/account/bookings/[id]`

**API Calls:** `GET /guest/bookings`

---

### `/account/bookings/[id]` — Booking Detail & Management

**Sections:**
1. **Booking summary** — all details
2. **Payment status** — paid amount, balance due at hotel
3. **`BookingActions`** panel:
   - Add extras (if before arrival)
   - Request special accommodation
   - Cancel booking (shows refund amount + policy, confirm modal)
4. **Download invoice** button
5. **Leave a review** (if past booking, not yet reviewed)

**API Calls:**
- `GET /bookings/{id}`
- `GET /payments/booking/{id}`
- `PUT /bookings/{id}` (modify)
- `DELETE /bookings/{id}` (cancel)
- `GET /invoices/download/{bookingId}`

---

### `/account/profile` — Profile Settings

- Edit: name, email, phone, DOB, country, address
- Change password section
- Delete account (GDPR — "right to be forgotten")
- Email notification preferences

**API Calls:** `GET /guest/profile` / `PUT /guest/profile`

---

### `/account/loyalty` — A&O Club Dashboard

- Club membership badge + member since date
- **Points balance** — large display
- **Points history** — table: date, action (booking, review), points earned/redeemed
- **How to earn** — booking, leaving reviews, referring friends
- **Redeem points** — discount voucher generator
- **Secret deals** — members-only offer cards

**API Calls:** `GET /guest/loyalty`

---

### `/club` — A&O Club Landing Page (Public)

**Purpose:** Marketing page converting guests to members

**Sections:**
1. **Hero** — "Save 25% on every stay. Always."
2. **It's free** — emphasise no credit card, no subscription
3. **Benefits grid** — 25% off / Loyalty Points / Secret Deals / Priority Support / Members Newsletter
4. **How it works** — 3 steps: Join → Book → Save
5. **Points table** — how many points per booking, how to redeem
6. **Testimonials** — "I saved €45 on my Berlin trip" quotes
7. **CTA** — "Join free" → `/auth/register` or modal for email-only signup

---

### `/groups` — Group & Corporate Bookings

**Sections:**
1. **Hero** — "Travelling with 10+ people? We've got you."
2. **What we offer** — group rates, dedicated account manager, flexible payment
3. **Facilities for groups** — Seminar rooms (capacity, AV equipment), Teachers Lounge, Conference setup
4. **Group pricing info** — 3+ rooms / 10+ guests policies
5. **How to book** — "Fill out the form, we contact you within 24h"
6. **Group Quote Form** — property, dates, group size, room preferences, name, email, phone, notes
7. **Corporate accounts** — invoice billing, recurring groups

**API Calls:** This page sends a contact/quote request (could be a direct email via backend contact endpoint or a `POST` to a leads table)

---

### `/experiences` — City Guides Index

**Sections:**
- Page header: "Explore Europe with A&O"
- City cards grid: Berlin, Hamburg, Vienna, Prague, Amsterdam, Paris... — each with cover photo, hostel count, "Explore" link

---

### `/experiences/[city]` — City Guide

**Sections:**
1. **City hero** — full-width photo, city name, tagline
2. **Our hostel in [city]** — property card linking to `/hostels/[slug]`
3. **Top Attractions** — 6-8 highlights with distances from hostel
4. **Getting Around** — public transport tips, bike rentals
5. **Eat & Drink** — local spots near the hostel
6. **Tips from our Staff** — quote card from reception team
7. **Book Your Stay CTA** — search widget pre-filled with the city

**Content:** Static MDX files per city (no API needed, but linking to live property data)

---

### `/about` — About Us

**Sections:**
1. **Brand story** — founding, mission, "budget travel for everyone"
2. **The network** — "30 locations, 1 community" — mini map
3. **Values** — Social / Sustainable / Affordable / Central
4. **Sustainability** — eco initiatives, energy policies
5. **Press / Media** — logos, press releases, download kit
6. **Join the team** — link to careers (external or `/careers`)

---

### `/contact` — Contact

**Sections:**
1. **General contact form** — name, email, subject, message
2. **Per-property contacts** — accordion list with address, phone, email for each hostel
3. **Europe map** — all locations pinned
4. **Social channels** — Instagram, Facebook, Twitter links
5. **Booking support note** — "For booking issues, log in to your account and go to My Bookings"

---

### `/faq` — FAQ

**Sections:**
- Category tabs: Booking / Payment / Check-in & Check-out / Rooms & Facilities / Groups / A&O Club
- Accordion Q&A per category
- Search bar to filter questions
- "Still have questions?" → contact form link

---

### `/legal/terms` & `/legal/privacy`

- Static markdown-rendered pages
- Privacy policy includes cookie policy
- Cookie consent banner (on first visit, stored in localStorage)

---

## API Service Layer (`src/services/`)

Mirrors the pattern already in `frontend/admin/src/services/api.ts`.

```typescript
// services/api.ts — Axios instance for guest site
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

// Interceptor: attach JWT token from auth.store
// Interceptor: on 401 → clear auth store, redirect to /auth/login
```

```typescript
// services/auth.service.ts
register(data) → POST /auth/register
login(email, password) → POST /auth/login
logout() → POST /auth/logout
verifyEmail(token) → POST /auth/verify-email
forgotPassword(email) → POST /auth/forgot-password
resetPassword(token, password) → POST /auth/reset-password

// services/properties.service.ts
getAll(filters?) → GET /properties
getBySlug(slug) → GET /properties/{id}
getRoomTypes(id) → GET /properties/{id}/room-types
checkAvailability(id, checkIn, checkOut, guests) → GET /properties/{id}/availability

// services/bookings.service.ts
create(data) → POST /bookings
getById(id) → GET /bookings/{id}
update(id, data) → PUT /bookings/{id}
cancel(id, reason) → DELETE /bookings/{id}

// services/payments.service.ts
createIntent(bookingId, amount, depositPct?) → POST /payments/create-intent
getBookingPayments(bookingId) → GET /payments/booking/{bookingId}

// services/guest.service.ts
getProfile() → GET /guest/profile
updateProfile(data) → PUT /guest/profile
getBookings(status?) → GET /guest/bookings
getLoyalty() → GET /guest/loyalty

// services/reviews.service.ts
submit(bookingId, data) → POST /reviews (add endpoint to backend if not yet there)
getForProperty(propertyId) → GET /properties/{id}/reviews
```

---

## State Management (`src/stores/`)

### `auth.store.ts` (Zustand)
```
state: { guest: GuestProfile | null, token: string | null, isLoading: boolean }
actions: setAuth(), clearAuth(), refreshToken()
persist: localStorage (token + guest)
```

### `booking.store.ts` (Zustand)
```
state: {
  propertyId, checkIn, checkOut, guests,
  selectedRoomTypeId, extras: [], promoCode,
  guestDetails, totalPrice, depositAmount
}
actions: setDates(), setRoom(), addExtra(), removeExtra(), setGuestDetails(), clearBooking()
persist: sessionStorage (cleared on confirmation)
```

---

## Build Phases

### Phase 1 — Foundation (Week 1)
**Goal:** Project scaffolded, design system, layouts, API client working

- [ ] `npx create-next-app@14 frontend/guest --typescript --tailwind --app`
- [ ] Install: `axios zustand @tanstack/react-query react-hook-form zod lucide-react framer-motion embla-carousel-react react-day-picker @stripe/react-stripe-js @stripe/stripe-js @vis.gl/react-google-maps next-intl`
- [ ] Install shadcn/ui and init (`npx shadcn-ui@latest init`)
- [ ] Add shadcn components: Button, Input, Card, Badge, Dialog, Tabs, Accordion, Select, Sheet, Skeleton, Toast
- [ ] Set up brand design tokens in `tailwind.config.ts`:
  - Primary: A&O orange/red brand color
  - Neutral grays, success green, error red
  - Font: Inter (already used in admin)
- [ ] Build `Navbar.tsx` — logo, links (Hostels, Experiences, Club, Groups), search icon, login/avatar
- [ ] Build `Footer.tsx` — links, social icons, newsletter form, legal links, property list
- [ ] Build `src/services/api.ts` — Axios instance with JWT interceptors
- [ ] Set up Zustand stores (`auth.store.ts`, `booking.store.ts`)
- [ ] Set up TanStack Query provider in root layout
- [ ] `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000/api
  NEXT_PUBLIC_STRIPE_KEY=pk_test_...
  NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
  ```

---

### Phase 2 — Brand & Discovery Pages (Week 2)
**Goal:** Homepage, all hostels, property detail fully working (no booking yet)

- [ ] **Homepage** (`/`)
  - Hero section with `SearchBar` (location dropdown, date pickers, guests)
  - Destinations section pulling from `GET /properties`
  - A&O Club banner (static)
  - Reviews highlight (static/hardcoded initially)
  - Newsletter form (static submit)

- [ ] **All Hostels** (`/hostels`)
  - `PropertyCard` component: photo, city, name, rating, price from, amenity icons
  - Google Maps component with all property pins
  - Country/city filter bar

- [ ] **Property Detail** (`/hostels/[slug]`)
  - `PropertyGallery` — embla-carousel, full photo set
  - `PropertyMap` — single property map with nearby landmarks
  - `AmenitiesList` — grouped icons grid
  - `RoomTypeCard` for each room type with images + "Book now" CTA
  - `ReviewsSection` — star breakdown + individual reviews
  - Sticky booking widget bar (bottom on mobile, sidebar on desktop)

- [ ] **Search Results** (`/search`)
  - Reads URL params, calls availability API
  - `SearchFilters` sidebar
  - Results grid + map toggle

---

### Phase 3 — Booking Flow (Week 3)
**Goal:** Full end-to-end booking with Stripe payment working

- [ ] `BookingSteps` — progress indicator component
- [ ] `AvailabilityCalendar` — react-day-picker range, disabled unavailable dates
- [ ] `RoomSelector` — room type cards with real-time pricing
- [ ] `ExtrasSelector` — extras list with quantity controls, live price update
- [ ] `PriceSummary` — sticky sidebar: per-night × nights + extras + discount + taxes = total
- [ ] `GuestDetailsForm` — React Hook Form + Zod schema
- [ ] `PaymentForm` — Stripe Elements (CardElement), split payment toggle, PayPal button
- [ ] Booking store wiring across all 4 steps
- [ ] `POST /bookings` + `POST /payments/create-intent` + Stripe confirmation
- [ ] **Confirmation page** — booking details, map link, add-to-calendar, invoice download

---

### Phase 4 — Auth & Guest Account (Week 4)
**Goal:** Full auth flow, guest dashboard, booking management

- [ ] Login page — form, JWT storage, redirect
- [ ] Register page — multi-field form, Zod validation, email verification notice
- [ ] Forgot/reset password pages
- [ ] `AccountSidebar` layout for `/account/*`
- [ ] **Dashboard** — welcome, upcoming bookings, loyalty widget
- [ ] **My Bookings** — list with status badges, tab filter
- [ ] **Booking Detail** — full info, modify/cancel actions, invoice download
- [ ] **Profile** — edit form, change password, delete account
- [ ] Route guard: middleware redirecting unauthenticated users from `/account/*` to `/auth/login`

---

### Phase 5 — A&O Club & Reviews (Week 5)
**Goal:** Membership system, loyalty points, review submission, reviews on property pages

- [ ] `/club` marketing page — full layout with benefits, how it works, CTA
- [ ] `/account/loyalty` — points dashboard, history table, secret deals
- [ ] A&O Club join flow — triggered from banner/club page
- [ ] Club discount auto-applied in `PriceSummary` when guest is a member
- [ ] `ReviewForm` component — star selector, category ratings, text, photo upload
- [ ] Review submission from booking detail page + post-stay email link
- [ ] Reviews displayed on property detail page (already component-stubbed in Phase 2)
- [ ] Points awarded on booking confirmation + review submission

---

### Phase 6 — Content & Information Pages (Week 6)
**Goal:** All static/informational pages, city guides, groups, about

- [ ] **City Guides** — `/experiences` index + `/experiences/[city]` pages
  - Static MDX content per city with dynamic property data embedded
  - 5 initial cities: Berlin, Hamburg, Vienna, Prague, Amsterdam
- [ ] **Group Bookings** (`/groups`) — facilities info + quote request form
- [ ] **About Us** (`/about`) — brand story, network map, sustainability, press
- [ ] **Contact** (`/contact`) — contact form + per-property contact list + map
- [ ] **FAQ** (`/faq`) — accordion by category + search filter
- [ ] **Legal pages** — Terms, Privacy (markdown rendered)
- [ ] **Cookie consent banner** — GDPR, stored preference

---

### Phase 7 — Polish, SEO & Launch Prep (Week 7–8)
**Goal:** Production-ready, fast, accessible, SEO-optimised

- [ ] **SEO**: `generateMetadata()` for every page
  - Homepage: brand keywords
  - Property pages: "A&O Hostel Berlin Hauptbahnhof — Book Direct"
  - JSON-LD structured data (Hotel, Review, BreadcrumbList schemas)
- [ ] **Performance**:
  - `next/image` for all images (lazy load, WebP, responsive sizes)
  - Static generation (`generateStaticParams`) for all property + city guide pages
  - TanStack Query cache configuration (stale times)
- [ ] **Accessibility** (WCAG 2.1 AA):
  - Keyboard navigation on booking flow
  - ARIA labels on all interactive elements
  - Color contrast audit
  - Screen reader testing
- [ ] **Responsive QA** — test every page on mobile (375px), tablet (768px), desktop (1280px)
- [ ] **i18n**: Add German (`de`) translations via next-intl for core pages
- [ ] **Error pages** — custom `not-found.tsx`, `error.tsx`
- [ ] **Loading states** — skeletons on property cards, booking flow, account pages
- [ ] **Environment config for production** — separate `.env.production` values

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# .env.production
NEXT_PUBLIC_API_URL=https://api.ao-hostels.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_SITE_URL=https://ao-hostels.com
```

---

## Key Technical Decisions

### Why Next.js App Router (not Pages Router)?
Property detail pages and city guides benefit from **ISR (Incremental Static Regeneration)** — pre-built at deploy time, refreshed every hour. Fast load, great SEO, no server cost per request.

### Why Zustand for booking cart (not React Query)?
The booking flow is a **multi-step form** where data accumulates across pages and must survive navigation (room selection → extras → details → payment). React Query is for server state; Zustand is the right tool for this client-side wizard state.

### Why sessionStorage for booking cart?
Booking data should survive page refresh within a tab, but not carry over between sessions. `sessionStorage` is cleared when the tab closes — safer than `localStorage` for partially-entered payment context.

### Stripe Elements (not Stripe Checkout redirect)?
Keeping the user on the A&O site during payment maintains brand trust and allows the custom split-payment UI. Stripe Elements are PCI-compliant — card data never touches our servers.

### Static MDX for city guides?
City guide content changes infrequently. MDX files edited by the team are simpler and cheaper than a CMS for the initial launch. A headless CMS (Contentful, Sanity) can replace them in Phase 3 if content editors need it.

---

## Page Count Summary

| Category | Pages |
|---|---|
| Public brand | Homepage, All Hostels, Property Detail, Search Results |
| Booking flow | Room Selection, Extras, Guest Details, Payment, Confirmation |
| Auth | Login, Register, Forgot Password, Reset Password |
| Account | Dashboard, Bookings List, Booking Detail, Profile, Loyalty |
| Club & Groups | A&O Club, Groups & Corporate |
| Content | Experiences Index, 5× City Guides, About, Contact, FAQ |
| Legal | Terms, Privacy |
| **Total** | **~25 pages** |

---

## Timeline Summary

| Phase | Content | Duration |
|---|---|---|
| 1 | Foundation, design system, layouts, API client | Week 1 |
| 2 | Homepage, all hostels, property detail, search | Week 2 |
| 3 | Full booking flow + Stripe payment | Week 3 |
| 4 | Auth, guest dashboard, booking management | Week 4 |
| 5 | A&O Club, loyalty, reviews | Week 5 |
| 6 | City guides, groups, about, contact, FAQ, legal | Week 6 |
| 7–8 | SEO, performance, accessibility, i18n, QA, launch | Weeks 7–8 |

**Total: 8 weeks to production-ready**

---

*Document Version: 1.0 — April 30, 2026*  
*Backend: Laravel 13 at `backend/` — all APIs ready*  
*Related projects: `frontend/admin/` (staff panel), `frontend/mobile/` (React Native app)*
