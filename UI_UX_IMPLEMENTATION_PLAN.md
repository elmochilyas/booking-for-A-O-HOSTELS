# A&O Guest Frontend — UI/UX Implementation Plan

**Date:** 2026-05-04  
**Scope:** Complete visual and UX overhaul of the guest-facing Next.js 14 frontend  
**Freedom level:** Full — everything can be refactored or rebuilt from scratch  
**Design direction:** Premium budget hostel brand. Warm, energetic, trustworthy. Think Airbnb-level polish meets the spirit of youth travel.

---

## Table of Contents

1. [Design System Overhaul](#1-design-system-overhaul)
2. [Bug Fixes (Pre-requisites)](#2-bug-fixes-pre-requisites)
3. [Navigation & Layout](#3-navigation--layout)
4. [Homepage](#4-homepage)
5. [Hostels Listing Page](#5-hostels-listing-page)
6. [Property Detail Page](#6-property-detail-page)
7. [Booking Flow](#7-booking-flow)
8. [Authentication Pages](#8-authentication-pages)
9. [Account Dashboard](#9-account-dashboard)
10. [Static & Marketing Pages](#10-static--marketing-pages)
11. [Missing Pages to Build](#11-missing-pages-to-build)
12. [Global UX Patterns](#12-global-ux-patterns)
13. [Performance & Accessibility](#13-performance--accessibility)
14. [Implementation Order](#14-implementation-order)

---

## 1. Design System Overhaul

### 1.1 Typography Scale
**Current issue:** Only `Inter` is used with no defined type scale — sizes are ad-hoc (text-sm, text-xl, text-4xl scattered inconsistently).

**Plan:**
- Add `Sora` (headings) + keep `Inter` (body) from Google Fonts
- Define a strict type scale as Tailwind config extensions:
  ```
  display-2xl  → 72px / 1.1 lh  (hero headlines)
  display-xl   → 60px / 1.1 lh
  display-lg   → 48px / 1.15 lh
  display-md   → 36px / 1.2 lh  (section headers)
  display-sm   → 30px / 1.25 lh
  body-xl      → 20px / 1.6 lh
  body-lg      → 18px / 1.6 lh
  body-md      → 16px / 1.6 lh  (default)
  body-sm      → 14px / 1.5 lh
  label        → 12px / 1.4 lh uppercase tracked
  ```

### 1.2 Color Tokens
**Current issue:** Primary orange (#E94E1B) and secondary navy (#1E3A5F) are good anchors. Missing surface layers, neutral grays are thin, no amber/warm tones for accents.

**Plan — add to CSS variables:**
```css
/* Surface layers */
--surface-0: 0 0% 100%        /* page bg */
--surface-1: 220 14% 97%      /* card bg */
--surface-2: 220 13% 94%      /* elevated card */
--surface-3: 220 12% 90%      /* input bg, subtle */

/* Brand extensions */
--primary-50:  18 100% 97%    /* lightest orange tint */
--primary-100: 18 100% 94%
--primary-500: 18 87% 49%     /* current primary */
--primary-600: 18 87% 42%     /* hover state */
--primary-700: 18 87% 35%     /* pressed state */

/* Semantic */
--success: 142 71% 45%        (already exists)
--warning: 38 92% 50%         (already exists)
--info: 211 100% 50%          (add)

/* Text hierarchy */
--text-primary:   215 25% 10%
--text-secondary: 215 15% 35%
--text-tertiary:  215 10% 55%
--text-disabled:  215 8% 70%
```

### 1.3 Spacing & Radius System
**Current issue:** `gap-4`, `gap-6`, `gap-8`, `p-5`, `px-4` mixed everywhere. Radii jump between `rounded-xl` and `rounded-2xl` with no rule.

**Plan:**
- Establish a base-8 spacing unit (8px grid)
- Define radius scale in `tailwind.config.ts`:
  ```
  radius-sm:  6px   (badges, tags, chips)
  radius-md:  12px  (buttons, inputs)
  radius-lg:  16px  (cards)
  radius-xl:  24px  (modals, hero cards)
  radius-2xl: 32px  (pill buttons, feature blocks)
  radius-full: 9999px (avatars, indicators)
  ```

### 1.4 Shadow System
**Current issue:** `shadow-md`, `shadow-xl`, `hover:shadow-xl` used ad-hoc with no elevation model.

**Plan — add to Tailwind config:**
```
shadow-xs:   0 1px 2px rgba(0,0,0,0.05)                  (subtle border replacement)
shadow-sm:   0 2px 8px rgba(0,0,0,0.06)                  (resting cards)
shadow-md:   0 4px 16px rgba(0,0,0,0.08)                 (interactive elements)
shadow-lg:   0 8px 30px rgba(0,0,0,0.10)                 (floating panels)
shadow-xl:   0 16px 48px rgba(0,0,0,0.14)                (modals, drawers)
shadow-brand: 0 8px 30px rgba(233,78,27,0.25)            (CTA buttons)
shadow-glow:  0 0 40px rgba(233,78,27,0.15)              (hero accents)
```

### 1.5 Animation Library
**Current issue:** `animate-slide-up` is used in Navbar (line 102, 120) but never defined in `globals.css` — causes a missing animation bug.

**Plan — add to globals.css:**
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes blurIn {
  from { opacity: 0; filter: blur(4px); }
  to   { opacity: 1; filter: blur(0); }
}

.animate-slide-up    { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-slide-down  { animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-scale-in    { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-blur-in     { animation: blurIn 0.4s ease both; }
```

### 1.6 Component Token Standardization
Create `/src/lib/design-tokens.ts` exporting class name presets:
```ts
export const tokens = {
  card: 'bg-surface-1 rounded-lg shadow-sm border border-border/50',
  cardHover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
  input: 'bg-surface-3 border-border rounded-md h-11 px-4 focus:ring-2 focus:ring-primary/20',
  btnPrimary: 'gradient-primary text-white rounded-2xl shadow-brand hover:shadow-brand/80 hover:scale-[1.02] active:scale-[0.98] transition-all',
  btnSecondary: 'bg-surface-2 text-foreground rounded-2xl hover:bg-surface-3 transition-colors',
  section: 'py-20 md:py-28',
  container: 'container mx-auto px-4 md:px-6',
}
```

---

## 2. Bug Fixes (Pre-requisites)

These are blocking bugs that must be fixed before or alongside the UI work.

### 2.1 Missing `animate-slide-up` — `globals.css`
**File:** `src/app/globals.css`  
**Fix:** Add the keyframe definition (see §1.5 above). Currently Navbar dropdown and mobile menu flash without transition.

### 2.2 Wrong `isClubMember` field — `book/[propertyId]/extras/page.tsx` line 27
**File:** `src/app/book/[propertyId]/extras/page.tsx`  
**Current:** `const isClubMember = !!(guest as any)?.isClubMember`  
**Fix:** `const isClubMember = !!guest?.aoClubMember` (per `guest.types.ts` line 12)  
**Impact:** Club members never see their 25% discount applied on the extras step.

### 2.3 Broken slug generation — `properties.service.ts` lines 93–99
**File:** `src/services/properties.service.ts`  
**Current:** `replace(/[^a-z0-9\s&]/g, '')` then later `replace(/&/g, 'and')` → `"a&o Berlin"` becomes `"aando-berlin"` not `"ao-berlin"`.  
**Fix:** Reorder — strip `&` first, then strip non-alphanum:
```ts
const slug = p.name
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9\s]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim()
```

### 2.4 Dead `/account/wishlist` route
**Files:** `Navbar.tsx` line 66, `account/page.tsx`  
**Fix (short-term):** Either build the wishlist page (see §11) or remove the Heart icon link until built. Do not leave a 404 in the main nav.

### 2.5 Search page empty-state logic — `search/page.tsx` line 363
**Current:** Checks `filteredProperties.length === 0` then maps the same array (always empty = no output shown, no empty state rendered either).  
**Fix:** Add a proper "no results" empty state component that renders when `filteredProperties.length === 0`.

### 2.6 API timeout — `services/api.ts`
**Current:** No timeout on the axios instance — requests can hang indefinitely.  
**Fix:** Add `timeout: 10000` (10s) to `axios.create()`.

### 2.7 Password field not required when `createAccount: true` — `validations.ts` line 38
**Fix:** Use `z.discriminatedUnion` or `.superRefine()` to require password only when `createAccount === true`.

---

## 3. Navigation & Layout

### 3.1 Navbar — Full Redesign
**Current problems:**
- Logo is just text, no brand mark
- Search opens below the bar as a full-width input — disruptive
- Mobile menu pushes content rather than overlaying
- No visual distinction between pages
- Transparent-only on scroll (not implemented, just static)

**New design:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [A&O logo mark + wordmark]  [Hostels] [Cities] [Club] [Groups] │
│                               ── sticky, scrolled ──            │
│                                              [🔍] [Login] [Book] │
└─────────────────────────────────────────────────────────────────┘
```

**Specific changes:**
- **Logo:** Replace plain text with an SVG logo mark (orange flame/diamond) + "a&o" wordmark
- **Transparent → frosted on scroll:** Use `useScroll` with `window.scrollY > 60` to toggle between `bg-transparent` (on hero pages) and `bg-white/80 backdrop-blur-xl border-b`
- **Search:** Replace with a compact search trigger that opens a centered modal overlay (Airbnb-style command palette). Triggered by `Cmd+K` or clicking the search icon.
- **Mobile nav:** Full-screen overlay with slide-in animation, not inline expansion
- **CTA button:** "Book Now" in primary orange, always visible on desktop
- **Active state:** Animated underline dot beneath current section, not just color change

### 3.2 Footer — Redesign
**Current:** Four columns of links, newsletter, basic.

**New design — dark footer (secondary navy bg):**
```
┌────────────────────────────────────────────────┐
│  [A&O Logo]  Budget hostels across Europe       │
│  ★★★★★  4.7 · 15,000+ reviews                  │
│                                                 │
│  Destinations | Company | Support | Legal       │
│                                                 │
│  [App Store] [Google Play]  [Insta][TikTok][FB] │
│                                                 │
│  Newsletter: [email input] [Subscribe]          │
│  ─────────────────────────────────────────────  │
│  © 2024 a&o Hotels & Hostels  ·  Privacy · Terms│
└────────────────────────────────────────────────┘
```
- Dark background (`bg-secondary`) with white/muted-foreground text
- App download badges (real badge SVGs, not text buttons)
- Social media row with proper icon buttons
- Country flag emoji beside each destination in the link list
- Remove dead links (careers, press) or replace with "Coming soon" tooltip

### 3.3 Global Error Boundary
**Add:** `src/components/ErrorBoundary.tsx` — wrap each page in it. Show a friendly "Something went wrong" card with a retry button, not a white crash screen.

### 3.4 Toast Notification System
**Current:** No global toast/notification system exists — errors are silently swallowed.  
**Add:** Install `sonner` (already lightweight, works with Next.js). Wrap in `<Toaster />` in `providers.tsx`. Use for: API errors, booking success, auth events.

---

## 4. Homepage

The homepage is the most important page. Current state is good but has a "template" feel. Make it feel alive.

### 4.1 Hero Section — Rework
**Current issues:**
- Static image with no motion
- Search bar is too big and generic-feeling
- "Scroll indicator" animation is janky (CSS only, no real animation)

**New design:**
- **Background:** Video loop or CSS-animated gradient overlay over image. Alternatively use a parallax scroll effect on the image (simple `transform: translateY(scrollY * 0.3)`)
- **Headline:** "Stay Smart. Travel More." — keep but animate words in with stagger delay using CSS keyframes (`animation-delay-100`, etc. already defined)
- **Sub-tagline:** Rotate between 3 cities dynamically: "Right in the heart of **Berlin** · **Vienna** · **Prague**" — cycled with a fade transition every 3s
- **Search bar redesign:**
  ```
  ┌─────────────────────────────────────────────────────┐
  │  📍 Where?    │  📅 Check-in  │  📅 Check-out  │ 👥 │ [Search] │
  └─────────────────────────────────────────────────────┘
  ```
  Pill-style segments, each opens a dropdown/popover. More compact, more modern.
- **Trust bar** below search: Keep the 3 checkmarks, add "4.7★ on Google" with star icons

### 4.2 Stats Band — Add New Section
Insert a new section directly below the hero (before "Our Destinations"):
```
┌──────────────────────────────────────────────────────────┐
│   45+          14           25+          15,000+          │
│  Hostels    Countries      Years       Happy guests       │
└──────────────────────────────────────────────────────────┘
```
- Animated number counters (count up on scroll into view using `IntersectionObserver`)
- Thin dividers between stats
- Light orange tint background or white with subtle border-y

### 4.3 Destinations Section — Replace Card Grid with City Cards
**Current:** Shows property cards (hotel-style). 

**New design — City destination cards:**
- Use the `CITIES` constant from `lib/constants.ts` (has images and hostel counts)
- Horizontal scroll on mobile ("drag to explore"), 4-col grid on desktop
- Card design:
  ```
  ┌────────────────┐
  │   [City image] │  ← Full bleed, rounded-xl
  │ GERMANY        │  ← Country label top-left (badge)
  │                │
  │ Berlin    →    │  ← Bottom: city name + arrow
  │ 4 hostels      │  ← Subtitle
  └────────────────┘
  ```
- Hover: image scales up (already have `image-zoom-hover`), overlay darkens slightly, arrow slides right
- Clicking goes to `/hostels?city=berlin`
- Show 8 cities, "View all 32 cities →" button at bottom

### 4.4 "Why A&O" Section — Upgrade
**Current:** 4 icons in a grid. Serviceable but flat.

**New design:**
- Alternating layout: icon left / text right for first two, then reversed
- Actually: Keep grid but add a large background number (01, 02, 03, 04) in very light orange behind each card — gives depth without complexity
- Add a micro-interaction: on hover, the icon background circle fills with primary and icon turns white

### 4.5 A&O Club Banner — Upgrade
**Current:** Full-width photo with orange gradient overlay and two buttons.

**New design:**
- Split layout: Left side = text + CTA, Right side = illustration/mockup of the membership card
- The membership card is a `div` styled like a credit card: dark navy background, gold "A&O Club" text, member name, star rating
- Add: "Join 500,000+ members" social proof line
- CTA button: "Join Free — No Card Required" (more specific than "Join Free Now")

### 4.6 Room Types — Replace Static Cards
**Current:** 4 static cards with hardcoded Unsplash images.

**New design:**
- Tabs: "Dorm" | "Private" | "Family" | "Female Only"
- Each tab shows: large hero image (left 60%), details + pricing on right
- Details include: capacity, amenities chips, price range from real API data
- "Book this room type →" links to `/hostels` with room type filter pre-applied

### 4.7 Reviews Section — Upgrade
**Current:** 3 static review cards.

**New design:**
- Horizontal scrollable carousel (use `embla-carousel-react` — already installed)
- Each review card: larger, shows flag emoji for country, date of stay
- Add a "Reviews powered by Google" link with Google logo
- Auto-scroll with pause on hover

### 4.8 Explore Our Cities Map — Upgrade
**Current:** Shows a map if API returns data, "0 cities" when API was broken (now fixed).

**New design:**
- Keep the map but add a city list sidebar on the left (desktop) or below (mobile)
- City list: sorted alphabetically, shows hostel count, clicking pans the map to that city and shows a popup
- Map markers: custom orange circle markers with hostel count inside
- On mobile: map stays full-width, city list scrolls horizontally above it

---

## 5. Hostels Listing Page

### 5.1 Header — Redesign
**Current:** Dark blue section with opacity image behind. Looks like a footer mistake.

**New design:**
- Remove the photo background from the header — use a clean white header instead
- Keep the badge + h1 + subtitle
- Add breadcrumb: `Home > Hostels`
- Add a result count: "Showing 45 hostels across Europe"

### 5.2 Filters — Full Redesign
**Current:** Sticky filter bar with selects. Functional but crude.

**New design:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [🔍 Search city...]  [Country ▼]  [City ▼]  [Room Type ▼]       │
│                                       [Price range ──●──────]    │
│ Active filters: Germany ✕  · Clear all                           │
└──────────────────────────────────────────────────────────────────┘
```
- Pill-style filter chips that show active state
- "Active filters" row below that appears only when filters are applied, with ✕ to remove each
- Price range slider (add `@radix-ui/react-slider` — not yet installed)
- Filters collapse to a "Filters" button on mobile that opens a bottom sheet

### 5.3 Results Grid — Redesign
**Current:** Property cards in a 4-col grid. Cards have image, name, stars, price.

**New design:**
- Toggle between grid view (default) and list/map view — 3 view options: `[⊞ Grid] [≡ List] [🗺 Map]`
- **Grid card redesign:**
  ```
  ┌────────────────────────────┐
  │  [Image]          [♡]      │  ← Wishlist toggle button
  │  ┌── BERLIN ──┐            │  ← City badge
  │  │            │            │
  │  └────────────┘            │
  │  A&O Berlin Mitte          │
  │  ★ 4.5  (2,341 reviews)   │
  │  📍 City Centre, 0.3km    │
  │  ─────────────────────    │
  │  Free WiFi · Breakfast    │  ← Amenity chips (max 3)
  │             from €19/night │
  │           [Book Now →]    │
  └────────────────────────────┘
  ```
- **List view:** Full-width rows with image on left (fixed 200px), details on right — better for comparison
- **Map view:** Split screen — map right, scrollable list left. Hover on a card highlights the marker.

### 5.4 Empty State
**Current:** Nothing renders when filters return 0 results (the bug from §2.5).

**New design:**
```
[Illustration of a map pin with a question mark]
  No hostels found in "X"
  Try a different city or clear your filters
  [Clear Filters]    [Browse All]
```

### 5.5 Sort Controls
**Current:** No sorting option.

**Add:** Sort dropdown: "Best Match | Price: Low to High | Price: High to Low | Highest Rated | Most Reviews"

---

## 6. Property Detail Page

### 6.1 Image Gallery — Upgrade
**Current:** Likely a single image or basic grid (not fully audited but backend returns images array).

**New design:**
- Masonry grid: 1 large hero image (left 60%) + 2 smaller images in a 2x1 grid (right 40%)
- "View all X photos" button opens a full-screen lightbox modal
- Lightbox: keyboard navigable, swipe on touch, image counter "3 / 12"

### 6.2 Page Layout — Two-Column
**New design:**
```
┌──────────────────────────────┬──────────────────┐
│  Gallery (full width)        │                  │
├──────────────────────────────┤  BOOKING WIDGET  │
│  Property name + city        │  ┌────────────┐  │
│  ★ Rating   (X reviews)     │  │ Dates      │  │
│  📍 Address + map link       │  │ Guests     │  │
│                              │  │ from €19   │  │
│  [About] [Rooms] [Amenities] │  │ [Check Av] │  │
│  [Location] [Reviews]        │  └────────────┘  │
│  ── tab content ──           │  • Free cancel   │
│                              │  • No fees       │
└──────────────────────────────┴──────────────────┘
```
- Sticky booking widget on desktop (follows scroll)
- Tabs for content sections: scrolls to section anchor on click
- Booking widget becomes a bottom bar on mobile

### 6.3 Room Types Section
**New design:**
- Accordion or card grid showing each room type
- Each card: image, bed type, capacity badge, price, amenities, "Select" button
- Selecting a room type pre-fills the booking widget

### 6.4 Amenities — Visual Grid
**Current:** Likely a text list.

**New design:**
- Category groups: "Sleep", "Bath", "Food", "Facilities", "Connectivity"
- Icon + label chips in a responsive wrap grid
- "Show all X amenities" expander

### 6.5 Location Section
- Embedded Leaflet map (already installed) showing property pin
- Nearby POI chips: "0.3km to Central Station" "0.5km to Old Town" etc.
- "Get Directions" button (Google Maps deep link)

### 6.6 Reviews Section
- Rating breakdown bars (5★ ●●●●● 60%, 4★ ●●●● 25%, etc.)
- Review cards with avatar, date, verified badge
- Sort reviews: "Most Recent | Most Helpful | Highest Rated"

---

## 7. Booking Flow

The booking flow is 4 steps: Room → Extras → Details → Payment. The core logic works but the UI is rough.

### 7.1 Progress Indicator — Add
**Current:** No visual progress indicator — user doesn't know they're on step 2 of 4.

**New design:** Sticky progress bar at the top of booking pages:
```
  ①──────②──────③──────④
  Room   Extras Details Payment
         (current)
```
- Steps are clickable to go back (but not forward if not completed)
- Pill/circle style with connecting line

### 7.2 Room Selection Step — Redesign
**Current:** Basic cards with room info and price.

**New design:**
- Date picker prominently at the top: "When are you staying? [Check-in ▼] → [Check-out ▼]"
- Guest count selector: "How many guests? [−] 2 [+]"
- Room cards below: show real-time availability badge ("Only 2 left!", "Available", "Sold Out")
- Selected room card gets a primary orange ring + checkmark

### 7.3 Extras Step — Fix + Redesign
**Fix:** isClubMember bug (§2.2). Club members should see "Member price: €9 (25% off)" crossed-out original.

**New design:**
- Extra items as card tiles with quantity selector
- Summary sidebar (desktop) / sticky bottom bar (mobile) shows running total
- "Club member savings" highlighted in green if applicable
- Upsell message: "Add breakfast for all 3 nights for just €36 (€12/night)"

### 7.4 Guest Details Step — Redesign
**Current:** Long form on a single page.

**New design:**
- Two sections: "Primary Guest" and "Optional: Create Account"
- Account creation fields only appear (animated slide-down) when checkbox is checked
- **Fix the password validation** when `createAccount` is true (§2.7)
- Real-time field validation (show green checkmark when field is valid)
- "Why create an account?" tooltip with 3 bullet points

### 7.5 Payment Step — Redesign
**Current:** Stripe Elements embedded in a card.

**New design:**
- Order summary sticky on right (desktop)
- Payment section on left: Stripe card element styled to match design system
- Accepted cards row: Visa, Mastercard, Amex icons
- Price breakdown table:
  ```
  Room (3 nights × €19)     €57.00
  Breakfast × 3             €36.00
  Club discount (−25%)     −€23.25
  ─────────────────────────────────
  Total                     €69.75
  ```
- "Pay & Confirm" CTA button — large, primary, shows total amount in button text: "Pay €69.75"

### 7.6 Confirmation Page — Redesign
**Current:** Functional but bare.

**New design:**
- Confetti animation on arrival (CSS keyframe burst — no library)
- Booking confirmation card styled like an airline boarding pass:
  - Dashed border between sections
  - QR code placeholder (barcode pattern SVG)
  - Tear-off style top with "CONFIRMED" stamp
- Next steps: "Add to calendar" | "Download PDF" | "View booking" buttons
- "Book another hostel →" CTA at bottom

---

## 8. Authentication Pages

### 8.1 Login Page — Redesign
**Current:** A centered card with email/password fields.

**New design — split layout:**
```
┌──────────────────┬──────────────────────────────┐
│                  │  Welcome back               │
│  [City image     │                              │
│   with A&O       │  Email                       │
│   properties     │  Password              [👁]  │
│   overlay]       │                              │
│                  │  [Login] ← large orange btn  │
│  "Join 500,000+  │                              │
│  travelers"      │  ─── or continue with ───    │
│                  │  [Google] [Apple]            │
│                  │                              │
│                  │  Don't have an account?      │
│                  │  Join Free →                 │
└──────────────────┴──────────────────────────────┘
```
- Left panel: rotating city images with a dark overlay showing a trust stat
- Right panel: clean form
- "Forgot password?" inline link under password field
- Show/hide password toggle

### 8.2 Register Page — Redesign
**Current:** Long form with many fields.

**New design — 2-step flow:**
- Step 1: "Let's get started" — First name, Last name, Email, Password
- Step 2: "Almost there" — Date of birth (optional), Marketing consent, Terms
- Progress dots between steps
- Password strength indicator bar
- GDPR checkboxes clearly styled (not small print)

### 8.3 Forgot/Reset Password Pages
**Currently exist but not fully audited.** Ensure:
- Forgot password: email input + "We'll send a link" copy + success state showing "Check your inbox"
- Reset password: password + confirm password + strength indicator

---

## 9. Account Dashboard

### 9.1 Account Layout — Redesign
**Current:** Sidebar on desktop, presumably collapses on mobile.

**New design:**
- Desktop: Left sidebar (240px) with avatar, name, member level (Basic/Club), nav links
- Mobile: Bottom tab bar with 4 tabs: Home | Bookings | Profile | More
- Sidebar links: Overview, My Bookings, Wishlist (build it — §11), Profile, A&O Club, Logout

### 9.2 Account Overview Page — Redesign
**Current:** Cards for quick stats.

**New design:**
- Top: Welcome card with avatar, name, member since date, Club status badge
- Club status progress bar: "X points to next tier" (if tiered system is planned)
- Recent booking card (the latest one, compact)
- Quick actions: "Book Again" to their most visited city, "View All Bookings"
- A&O Club upsell (if not a member): gradient card with "Save 25% on every booking — Join Free"

### 9.3 Bookings Page — Upgrade
**Current:** List of bookings in cards.

**New design:**
- Tabs: "Upcoming" | "Past" | "Cancelled"
- Upcoming bookings: larger cards with countdown ("In 12 days"), check-in/out times prominent, "Manage" button
- Past bookings: compact list rows, "Leave a Review" CTA if not yet reviewed
- Empty state per tab: friendly illustration + action button

### 9.4 Profile Page — Build Out
**Current issue:** Profile edit form is incomplete.

**Build:**
- Editable fields: First name, Last name, Email (with re-verify flow), Phone, Date of birth, Nationality
- Password change section (separate from profile fields)
- Danger zone: "Delete Account" (confirmation required)
- Profile photo upload (avatar initials fallback)

### 9.5 Loyalty/A&O Club Page — Upgrade
**New design:**
- Member card (styled like a physical card — dark navy gradient, gold A&O logo, name, "CLUB MEMBER" chip)
- Points balance prominently
- Benefits grid (4 tiles: Discount, Points, Deals, Support)
- Points history table (date, property, points earned/spent)
- How to earn more: "Earn 100 points per night stayed" etc.

---

## 10. Static & Marketing Pages

### 10.1 About Page — Redesign
**Current:** Has "cities across Europe" count and presumably some copy.

**New design:**
- Hero: Large headline "We believe travel should be for everyone"
- Timeline: Company history (founded 1996 in Berlin) with year markers
- Stats band: Same as homepage stats
- Team values section: 4 cards with icons
- "Work with us" careers CTA at bottom

### 10.2 Club Page — Upgrade
**Current:** Marketing page for A&O Club.

**New design:**
- Full-page hero with the membership card illustration
- How it works: 3-step visual (Sign up → Book → Save)
- Benefits grid
- "Save calculator": interactive slider "I stay X nights/year → you save €X"
- Testimonials from club members
- Final CTA: Large "Join 500,000+ members. It's free."

### 10.3 FAQ Page — Upgrade
**Current:** Static FAQ list.

**New design:**
- Category tabs: "Booking" | "Check-In" | "Rooms" | "Payment" | "Club"
- Accordion within each category (already have `@radix-ui/react-accordion`)
- Search bar that filters questions in real time
- "Still have questions? Contact us →" at bottom

### 10.4 Contact Page — Upgrade
**New design:**
- Split: Contact form left, info right (phone, email, address, map)
- Department selector in form: "Booking issue | Complaint | Press | Other"
- Expected response time shown: "We typically respond within 2 hours"

### 10.5 Experiences Page — Build Out
**Current:** Page exists but "incomplete" — likely a placeholder.

**New design:**
- Hero section with city imagery
- Category filters: Food & Drink | Culture | Outdoor | Nightlife
- Experience cards: Image, category badge, title, duration, price-from, city
- These should link to third-party experiences or be generated per-city

### 10.6 Groups Page — Build Out
**Current:** Page exists but incomplete.

**New design:**
- Hero: "Traveling with 10+? We've got you."
- Benefits: Group discount, dedicated contact, flexible booking
- Quote request form: Group size, dates, preferred cities, contact details
- Trust logos: Schools, sports teams, corporate clients

---

## 11. Missing Pages to Build

| Page | Route | Priority | Description |
|------|--------|----------|-------------|
| Wishlist | `/account/wishlist` | High | Grid of favorited properties, uses local storage or API |
| Experiences detail | `/experiences/[city]` | Medium | Experiences specific to one city |
| Search results | `/search` (fix) | High | Fix empty state + add map toggle |
| 404 page | `not-found.tsx` | High | Custom friendly 404 — "Lost? Let us help." |
| 500 page | `error.tsx` | High | Custom error page with retry button |
| Groups | `/groups` (build out) | Medium | Group booking request form |
| Careers | `/careers` | Low | "We're hiring" — link to external if no jobs |
| Press | `/press` | Low | Media kit download, press contact |

### 11.1 Wishlist Page — Design
```
┌──────────────────────────────────────────┐
│  My Wishlist  (7 saved)                  │
│                                          │
│  [Berlin]  [Vienna]  [Prague]  ← cities │
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ Hostel │  │ Hostel │  │ Hostel │    │
│  │  card  │  │  card  │  │  card  │    │
│  └────────┘  └────────┘  └────────┘    │
└──────────────────────────────────────────┘
```
- Heart button on all property cards toggles wishlist (persisted in Zustand + localStorage)
- "Share wishlist" button generates a shareable link
- Empty state: "Save hostels you love" + link to browse

### 11.2 Custom 404 Page
```
         404
  [illustrated map pin falling]
  "Looks like this page checked out early."
  [Browse Hostels]  [Go Home]
```

---

## 12. Global UX Patterns

### 12.1 Loading States
**Current:** `Skeleton` component exists but is used inconsistently (some pages have no loading UI).

**Standardize:**
- Every data-dependent section has a skeleton that matches its layout exactly
- Skeletons should pulse (already have `animate-pulse`)
- Page-level loading: Next.js `loading.tsx` file in each route folder

### 12.2 Empty States
**Current:** Most pages have no empty state UI at all.

**Add a reusable `EmptyState` component:**
```tsx
<EmptyState
  icon={<MapPin />}
  title="No hostels found"
  description="Try adjusting your filters"
  action={<Button>Clear Filters</Button>}
/>
```

### 12.3 Error States
**Add a reusable `ErrorState` component:**
```tsx
<ErrorState
  title="Couldn't load hostels"
  description="Check your connection and try again"
  onRetry={() => refetch()}
/>
```

### 12.4 Infinite Scroll / Pagination
**Current:** All 45 properties load at once.

**Add:** "Load more" button at the bottom of listing pages (simpler than infinite scroll, better for accessibility). Show 12 per page, "Load 12 more" button.

### 12.5 Toast Notifications
**Add `sonner` toasts for:**
- Booking confirmed → success toast with confetti
- API error → error toast with retry link
- Auth events → "Logged in as [name]" / "Logged out"
- Wishlist toggle → "Saved to wishlist" / "Removed from wishlist"

### 12.6 Scroll Restoration
**Add:** `scroll-behavior: smooth` to html element. Use Next.js `<ScrollRestoration />` equivalent via `useEffect` in layout to restore position on back navigation.

### 12.7 Image Fallbacks
**Current:** Many images have no error fallback — broken image icon shows.

**Add:** A custom `<HostelImage />` wrapper component:
```tsx
// Falls back to a city skyline placeholder gradient if image fails
<HostelImage src={property.images?.[0]?.url} alt={property.name} />
```

---

## 13. Performance & Accessibility

### 13.1 Image Optimization
- All Unsplash images: add `sizes` prop to `<Image>` components
- Hero images: `priority` prop (already done in homepage — ensure all above-fold images have it)
- Property images from CDN (`cdn.aohostels.com`): already in `next.config.js` remotePatterns — good

### 13.2 Core Web Vitals Targets
- **LCP:** < 2.5s — Hero image must be `priority`, no layout shift from skeleton → content
- **CLS:** < 0.1 — Reserve space for images with fixed aspect ratio containers (`aspect-[4/3]`)
- **FID/INP:** < 200ms — No heavy JS on main thread; code-split booking flow pages

### 13.3 Accessibility
- All interactive elements must have `aria-label` (icon buttons especially)
- Color contrast: primary orange (#E94E1B) on white passes AA — confirm with checker tool
- Focus rings: Currently using `focus-visible:ring-2` — ensure consistent on all interactive elements
- Skip navigation link: Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>` in layout
- Form labels: All inputs must have associated `<label>` elements (not just placeholder text)

### 13.4 SEO
- Each page needs `generateMetadata` (not just the root layout)
- Property detail pages: structured data (JSON-LD) for `LodgingBusiness`
- Add `robots.txt` and `sitemap.xml` generation via Next.js route handlers

---

## 14. Implementation Order

### Phase 1 — Foundation & Bugs (Week 1)
Critical fixes and design system setup. Nothing visible is broken after this phase.

1. Fix all 7 bugs from §2 (1–2 days)
2. Update `globals.css` — add missing animations, new color tokens, shadow tokens (half day)
3. Update `tailwind.config.ts` — new radius scale, shadow scale, font config (half day)
4. Create `/src/lib/design-tokens.ts` with class presets (half day)
5. Add `sonner` toast system to `providers.tsx` (half day)
6. Add `ErrorBoundary` component and wrap pages (half day)
7. Create reusable `EmptyState` and `ErrorState` components (half day)

### Phase 2 — Navigation & Layout (Week 1–2)
Structural shell that every page uses.

8. Redesign `Navbar` (scroll transparency, mobile overlay, search modal trigger) (1.5 days)
9. Redesign `Footer` (dark bg, app badges, social icons) (1 day)
10. Add `loading.tsx` files to each route folder (half day)
11. Build custom `not-found.tsx` and `error.tsx` pages (half day)

### Phase 3 — Homepage (Week 2)
Highest visibility page.

12. Hero section (parallax image, animated headline, redesigned search bar) (1 day)
13. Stats band (animated counters) (half day)
14. City destination cards with `CITIES` data (1 day)
15. Upgrade Why A&O, A&O Club banner, Reviews carousel (1 day)
16. Room types tabs section (1 day)
17. Cities map with sidebar list (half day)

### Phase 4 — Listing & Detail Pages (Week 3)
Core discovery and decision flow.

18. Hostels page: filter redesign, grid/list/map toggle, sort, empty state (2 days)
19. Property detail: image gallery lightbox, two-column layout, sticky booking widget (2 days)
20. Property detail: room type cards, amenity grid, location map, reviews section (1 day)

### Phase 5 — Booking Flow (Week 3–4)
Revenue-critical path.

21. Progress indicator component (half day)
22. Room selection step redesign (1 day)
23. Extras step fix + redesign (1 day)
24. Guest details step redesign + fix password validation (1 day)
25. Payment step redesign + order summary (1 day)
26. Confirmation page — boarding pass design + confetti (1 day)

### Phase 6 — Auth & Account (Week 4)
27. Login page split layout (1 day)
28. Register 2-step flow (1 day)
29. Account dashboard overview redesign (1 day)
30. Bookings page tabs (1 day)
31. Profile page build out (1 day)
32. Loyalty/Club page redesign (1 day)

### Phase 7 — Missing Pages & Polish (Week 5)
33. Wishlist page + heart toggle on all cards (1.5 days)
34. FAQ page with search and categories (1 day)
35. About page timeline (1 day)
36. Groups page form (1 day)
37. Club marketing page redesign (1 day)
38. SEO: `generateMetadata` for all pages, JSON-LD for property pages (1 day)
39. Accessibility audit and fixes (1 day)
40. Performance audit — image sizing, lazy loading, bundle analysis (1 day)

---

## Appendix: Key Files Reference

| What to change | File |
|----------------|------|
| Design tokens (CSS vars) | `src/app/globals.css` |
| Tailwind config | `tailwind.config.ts` |
| Root layout | `src/app/layout.tsx` |
| Navbar | `src/components/layout/Navbar.tsx` |
| Footer | `src/components/layout/Footer.tsx` |
| Providers (add Toaster) | `src/components/providers.tsx` |
| Homepage | `src/app/page.tsx` |
| Hostels list | `src/app/hostels/page.tsx` |
| Property detail | `src/app/hostels/[slug]/page.tsx` |
| Booking flow | `src/app/book/[propertyId]/**` |
| Auth pages | `src/app/auth/**` |
| Account pages | `src/app/account/**` |
| API service | `src/services/api.ts` |
| Properties service | `src/services/properties.service.ts` |
| Design tokens helper | `src/lib/design-tokens.ts` ← create new |
| Global constants | `src/lib/constants.ts` |
