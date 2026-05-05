# Mobile App Audit Report

**Date:** May 4, 2026  
**Project:** A&O Hostels Mobile App  
**Location:** `frontend/mobile/`  
**Auditor:** Automated Deep Code Audit

---

## Executive Summary

The mobile app is a React Native/Expo application with navigation, screens, and API integration. **41 issues** were identified across 18 categories ranging from critical security risks to code quality improvements.

| Severity | Count |
|----------|-------|
| Critical | 4 |
| High | 3 |
| Medium | 16 |
| Low | 18 |

---

## Critical Issues (Fix Immediately)

### Issue #1: 401 Interceptor Doesn't Redirect to Login
- **File:** `src/services/api.ts:62-71`
- **Severity:** CRITICAL
- **Description:** On 401 responses, the interceptor removes the token but doesn't trigger navigation to the login screen. This causes inconsistent app state where the user appears logged in but API calls fail.
- **Fix:** Implement an event emitter or callback to notify the app of auth failures and redirect to login.

### Issue #2: Token Stored in Plain AsyncStorage
- **Files:** `src/services/api.ts:15-50`, `src/stores/authStore.ts:35-36`
- **Severity:** CRITICAL
- **Description:** Authentication tokens are stored in AsyncStorage which is not encrypted. On rooted/jailbroken devices, this data can be accessed by malicious actors.
- **Fix:** Use `expo-secure-store` for sensitive data storage instead of AsyncStorage.

### Issue #3: No Offline Support
- **Severity:** CRITICAL
- **Description:** The app has no offline detection, no caching of API responses, and no queueing of actions when offline. Users get poor experience when connectivity drops.
- **Fix:** Implement network state detection with `@react-native-community/netinfo`, add response caching, and queue actions for when device comes back online.

### Issue #4: No Tests
- **Severity:** CRITICAL
- **Description:** No test files found. No test configuration. The package.json has no test script. This poses a significant code quality and regression risk.
- **Fix:** Set up testing with Jest and React Native Testing Library.

---

## High Priority Issues (Fix Soon)

### Issue #5: Excessive `any` Type Usage in API Service
- **File:** `src/services/api.ts:33,42,164,183,184`
- **Severity:** HIGH
- **Description:** Multiple functions use `any` type instead of proper TypeScript interfaces:
  - `getGuest(): Promise<any | null>` - should return `Guest | null`
  - `setGuest(guest: any)` - should accept `Guest` type
  - `updateProfile(data: any)` - should use proper profile type
  - `createStaff(data: any)` and `updateStaff(id: string, data: any)` - should use proper Staff type
- **Fix:** Create proper TypeScript interfaces for all API data types and replace `any` types.

### Issue #6: Incorrect Nested Navigator Navigation
- **File:** `src/screens/ProfileScreen.tsx:72`
- **Severity:** HIGH
- **Description:** Attempting to navigate to a tab screen using `navigation.navigate('MainTabs', { screen: 'Bookings' } as any)`. The `as any` cast indicates incorrect typing for nested navigator navigation.
- **Fix:** Properly type the navigation prop or use proper nested navigator typing with TypeScript.

### Issue #7: No Offline Detection
- **Severity:** HIGH
- **Description:** No offline detection or handling. API calls will fail when the device is offline with poor user experience.
- **Fix:** Implement network state detection using `@react-native-community/netinfo` and show appropriate UI.

---

## Medium Priority Issues

### Build/Configuration

#### Issue #8: Missing expo-env.d.ts
- **File:** `tsconfig.json:16`
- **Severity:** MEDIUM
- **Description:** The tsconfig.json references `expo-env.d.ts` in the include array, but this file doesn't exist. This provides Expo-specific type declarations.
- **Fix:** Run `expo start` to generate this file, or create it with: `/// <reference types="expo/types" />`

#### Issue #9: Unused Dependencies
- **File:** `package.json`
- **Severity:** MEDIUM
- **Description:** 
  - `react-hook-form` (line 26) is in dependencies but **never used** in the codebase
  - `@stripe/stripe-react-native` (line 20) is installed but **never integrated** (no StripeProvider, no useStripe calls)
- **Fix:** Remove unused dependencies or implement them properly.

### TypeScript/Types

#### Issue #10: `any` Types in Catch Blocks
- **Files:**
  - `src/screens/SearchScreen.tsx:96`
  - `src/screens/PropertyListScreen.tsx:54`
  - `src/screens/RoomSelectionScreen.tsx:44`
  - `src/screens/MyBookingsScreen.tsx:70,91`
  - `src/screens/CheckoutScreen.tsx:145`
  - `src/stores/authStore.ts:44,61,78,86,102`
- **Severity:** MEDIUM
- **Description:** Error objects are typed as `any` in catch blocks, losing type safety.
- **Fix:** Use `unknown` instead of `any`, or type as `Error`:
```typescript
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
}
```

#### Issue #11: `as any` Type Assertion for Navigation
- **File:** `src/screens/ProfileScreen.tsx:72`
- **Severity:** MEDIUM
- **Description:** `navigation.navigate('MainTabs', { screen: 'Bookings' } as any)` - incorrect typing for nested navigator navigation.
- **Fix:** Properly type the navigation prop with TypeScript types for React Navigation.

### React Native/Expo Compatibility

#### Issue #12: Invalid Prop on SafeAreaView
- **Files:**
  - `src/screens/SearchScreen.tsx:181`
  - `src/screens/PropertyDetailScreen.tsx:108`
  - `src/screens/CheckoutScreen.tsx:155`
- **Severity:** MEDIUM
- **Description:** `removeClippedSubviews={false}` is passed to `SafeAreaView`, but this is a `FlatList` prop, not a `SafeAreaView` prop.
- **Fix:** Remove the `removeClippedSubviews` prop from SafeAreaView components.

#### Issue #13: Dimensions.get() at Module Level
- **File:** `src/screens/SearchScreen.tsx:55`
- **Severity:** MEDIUM
- **Description:** `const { width: SCREEN_WIDTH } = Dimensions.get('window');` is called at module level. This won't update on orientation change and could cause issues.
- **Fix:** Use `useWindowDimensions` hook from `react-native` instead.

### Navigation

#### Issue #14: No Deep Linking Configuration
- **Files:** `app.json`, `src/navigation/MainNavigator.tsx`
- **Severity:** MEDIUM
- **Description:** No deep linking configuration found. The app cannot handle URL-based navigation.
- **Fix:** Add deep linking config to `app.json` and React Navigation configuration with a URL scheme.

### State Management

#### Issue #15: Zustand Store Not Using Persistence Middleware
- **File:** `src/stores/authStore.ts`
- **Severity:** MEDIUM
- **Description:** The auth store manually reads/writes to AsyncStorage in the `initialize` function, but doesn't use Zustand's `persist` middleware. This could lead to inconsistencies.
- **Fix:** Use Zustand's persist middleware with AsyncStorage.

#### Issue #16: Silent Failure in fetchProfile
- **File:** `src/stores/authStore.ts:98-105`
- **Severity:** MEDIUM
- **Description:** The `fetchProfile` function silently fails on error, which could hide issues from users.
- **Fix:** Add user feedback or error state.

#### Issue #17: No Loading State During App Initialization
- **File:** `App.tsx:23-28`
- **Severity:** MEDIUM
- **Description:** The app calls `initialize()` on mount but there's no loading indicator while checking auth state.
- **Fix:** Show a splash screen or loading indicator while `isLoading` is true.

### API Integration

#### Issue #18: No Retry Logic for Failed Requests
- **File:** `src/services/api.ts`
- **Severity:** MEDIUM
- **Description:** No retry logic for failed API requests. Network issues will cause immediate failures.
- **Fix:** Implement retry logic using axios interceptors or a library like `axios-retry`.

#### Issue #19: Fragile Response Data Parsing
- **Files:**
  - `src/screens/PropertyListScreen.tsx:53`
  - `src/screens/RoomSelectionScreen.tsx:43`
- **Severity:** MEDIUM
- **Description:** Using `response.data.properties || response.data.data || []` assumes multiple possible API response structures, which is fragile.
- **Fix:** Standardize API response format and handle it consistently.

### UI/Components

#### Issue #20: Variables Defined Inside Component But Outside Hooks
- **File:** `src/screens/SearchScreen.tsx:106-122`
- **Severity:** MEDIUM
- **Description:** `fallbackDestinations` array and `today`/`tomorrow` Date objects are recreated on every render.
- **Fix:** Move these outside the component or memoize them.

#### Issue #21: No Performance Optimizations (Memoization)
- **Files:** All screen files
- **Severity:** MEDIUM
- **Description:** No `React.memo`, `useMemo`, or `useCallback` usage found. All render functions are recreated on each render.
- **Fix:** Add memoization where appropriate.

#### Issue #22: No Image Caching Strategy
- **File:** `src/screens/SearchScreen.tsx`
- **Severity:** MEDIUM
- **Description:** Images from remote URLs are loaded without any caching strategy. This could lead to high data usage and slow loading.
- **Fix:** Use `expo-image` or implement caching.

### Environment Config

#### Issue #23: Hardcoded Stripe Publishable Key
- **File:** `src/config/environment.ts:39`
- **Severity:** MEDIUM
- **Description:** Stripe publishable key is hardcoded as `'pk_test_xxx'`. While publishable keys are public, it should be configurable per environment.
- **Fix:** Use environment variables with `EXPO_PUBLIC_` prefix.

### Security

#### Issue #24: No Certificate Pinning or SSL Validation
- **Severity:** MEDIUM
- **Description:** No certificate pinning or additional SSL validation is configured, making the app vulnerable to man-in-the-middle attacks.
- **Fix:** Implement certificate pinning using a library or configure it in the API client.

### Accessibility

#### Issue #25: No Accessibility Props
- **Severity:** MEDIUM
- **Description:** No `accessibilityLabel`, `accessibilityHint`, or `accessibilityRole` props found anywhere. This makes the app difficult to use with screen readers.
- **Fix:** Add accessibility props to interactive elements throughout the app.

### Push Notifications

#### Issue #26: Push Notification UI Without Backend
- **File:** `src/screens/NotificationPreferencesScreen.tsx`
- **Severity:** MEDIUM
- **Description:** The NotificationPreferencesScreen exists with toggle switches, but there's no actual push notification setup (no `expo-notifications` package installed, no token registration).
- **Fix:** Either implement push notifications properly or remove the screen until implementation is ready.

### Form Handling

#### Issue #27: No Field-Level Error Display
- **Files:**
  - `src/screens/CheckoutScreen.tsx`
  - `src/screens/LoginScreen.tsx`
  - `src/screens/RegisterScreen.tsx`
- **Severity:** MEDIUM
- **Description:** Form validation errors are shown via Alert rather than inline with the relevant fields.
- **Fix:** Add inline error display for each field.

---

## Low Priority Issues (Nice to Have)

### Build/Configuration

#### Issue #28: Missing metro.config.js
- **Severity:** LOW
- **Description:** No Metro bundler configuration file exists. While Expo provides defaults, custom configuration may be needed for asset handling.
- **Fix:** Create a `metro.config.js` file if customization is needed.

#### Issue #29: Missing babel.config.js
- **Severity:** LOW
- **Description:** No Babel configuration file found. Expo uses a default, but explicit configuration is recommended.
- **Fix:** Create a `babel.config.js` with Expo preset.

#### Issue #30: Missing .env File
- **Severity:** LOW
- **Description:** No `.env` file exists for local development environment variables.
- **Fix:** Create `.env` file for local development (ensure it's gitignored).

### TypeScript/Types

#### Issue #31: `any` Type for DateTimePicker Events
- **File:** `src/screens/SearchScreen.tsx:127,139`
- **Severity:** LOW
- **Description:** `event: any` parameter in `handleCheckInChange` and `handleCheckOutChange`.
- **Fix:** Use proper type: `DateTimePickerEvent` from `@react-native-community/datetimepicker`.

### UI/Components

#### Issue #32: FlatList Missing Performance Optimizations
- **Files:**
  - `src/screens/PropertyListScreen.tsx`
  - `src/screens/RoomSelectionScreen.tsx`
  - `src/screens/MyBookingsScreen.tsx`
- **Severity:** LOW
- **Description:** No `getItemLayout` prop for FlatList, which could improve performance for large lists.
- **Fix:** Add `getItemLayout` if list items have fixed height.

#### Issue #33: Remote Images Without Local Fallbacks
- **File:** `src/screens/SearchScreen.tsx`
- **Severity:** LOW
- **Description:** All images are loaded from remote URLs. If the device is offline or images fail to load, there's no fallback.
- **Fix:** Add local placeholder images and error handling for Image components.

### File Structure

#### Issue #34: Nested `src/src` Directory
- **Path:** `src/src/`
- **Severity:** LOW
- **Description:** A nested `src/src` directory exists with a `stores` subdirectory. This appears to be a mistake during project setup.
- **Fix:** Remove the nested `src/src` directory.

#### Issue #35: Empty `components` Directory
- **Path:** `src/components/`
- **Severity:** LOW
- **Description:** The components directory exists but is empty.
- **Fix:** Either add shared components or remove the directory.

### Performance

#### Issue #36: No Memoization Anywhere in the Codebase
- **Severity:** LOW
- **Description:** No use of `React.memo`, `useMemo`, or `useCallback` anywhere.
- **Fix:** Add memoization to expensive components and callbacks (also listed in Medium priority).

### Environment Config

#### Issue #37: API URL Detection Logic Complexity
- **File:** `src/config/environment.ts:9-35`
- **Severity:** LOW
- **Description:** Complex logic to detect API URL with multiple fallbacks.
- **Fix:** Simplify the logic or use a more robust approach.

### Asset Management

#### Issue #38: No Local Assets Configured
- **File:** `app.json`
- **Severity:** LOW
- **Description:** No fonts configured in `app.json`. All images are remote URLs.
- **Fix:** Add local font assets and configure in `app.json`.

### Form Handling

#### Issue #39: react-hook-form Not Used
- **File:** `package.json:26`
- **Severity:** LOW
- **Description:** `react-hook-form` is in dependencies but forms are implemented manually with useState.
- **Fix:** Either use `react-hook-form` for forms or remove the dependency.

### Navigation

#### Issue #40: No Deep Linking Configuration
- **File:** `app.json`
- **Severity:** LOW
- **Description:** No deep linking scheme configured in `app.json`.
- **Fix:** Add scheme to `app.json`: `"scheme": "aohostels"`

### Offline Support

#### Issue #41: No Offline Support
- **Severity:** LOW
- **Description:** The app has no offline detection or caching (also listed in Critical priority).
- **Fix:** Implement offline support with network detection and caching.

---

## Issue Statistics by Category

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Build/Configuration | 0 | 0 | 2 | 4 | 6 |
| TypeScript/Types | 0 | 1 | 2 | 1 | 4 |
| React Native/Expo | 0 | 0 | 2 | 0 | 2 |
| Navigation | 0 | 1 | 1 | 1 | 2 |
| State Management | 0 | 0 | 3 | 0 | 3 |
| API Integration | 1 | 0 | 2 | 0 | 4 |
| UI/Components | 0 | 0 | 3 | 3 | 4 |
| File Structure | 0 | 0 | 0 | 2 | 2 |
| Environment Config | 0 | 0 | 1 | 1 | 2 |
| Security | 1 | 0 | 1 | 0 | 2 |
| Performance | 0 | 0 | 1 | 1 | 2 |
| Accessibility | 0 | 0 | 1 | 0 | 1 |
| Offline Support | 1 | 1 | 0 | 1 | 1 |
| Deep Linking | 0 | 0 | 1 | 1 | 1 |
| Push Notifications | 0 | 0 | 1 | 0 | 1 |
| Asset Management | 0 | 0 | 0 | 1 | 1 |
| Form Handling | 0 | 0 | 1 | 2 | 2 |
| Testing | 1 | 0 | 0 | 0 | 1 |
| **TOTAL** | **4** | **3** | **16** | **18** | **41** |

---

## Recommended Action Plan

### Phase 1: Security & Stability (Week 1)
1. Fix Issue #2: Move tokens to SecureStore
2. Fix Issue #1: Add 401 redirect logic
3. Fix Issue #3: Add offline detection
4. Fix Issue #4: Set up testing framework

### Phase 2: Type Safety (Week 2)
1. Fix Issue #5: Create TypeScript interfaces for API types
2. Fix Issue #10: Fix `any` types in catch blocks
3. Fix Issue #11: Fix navigation type assertions

### Phase 3: User Experience (Week 3)
1. Add offline support with caching
2. Add accessibility props throughout
3. Fix Issue #27: Add inline form errors
4. Fix Issue #21: Add performance optimizations

### Phase 4: Code Quality (Week 4)
1. Clean up file structure (Issues #34, #35)
2. Remove unused dependencies (Issue #9)
3. Add missing config files (Issues #28, #29)
4. Implement proper error handling and loading states

---

## Files Requiring Immediate Attention

1. `src/services/api.ts` - Critical security and auth issues
2. `src/stores/authStore.ts` - Token storage and persistence issues
3. `src/screens/ProfileScreen.tsx` - Navigation typing issues
4. `src/screens/SearchScreen.tsx` - Multiple performance and type issues
5. `App.tsx` - Missing loading state
6. `package.json` - Unused dependencies
7. `src/config/environment.ts` - Hardcoded keys

---

**End of Report**
