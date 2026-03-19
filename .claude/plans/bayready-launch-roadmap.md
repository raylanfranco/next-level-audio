# BayReady Launch Roadmap

**Created:** 2026-03-16
**Status:** In Progress
**Goal:** Get BayReady running on Ben's Clover terminal, validate core functionality, then publish to Clover App Market as a paid app ($39/mo, free for Ben).

---

## Current State

- Android app: Phases 1-7 complete, feature parity with web dashboard
- APK: Both debug and release builds ready (minSdk 17, V1 signing, multidex)
- Web frontend: Deployed at bayready.vercel.app
- Backend: Deployed at bayready-production.up.railway.app
- Clover Developer Account: Production portal, BayReady app in DRAFT status, APK uploaded
- **Blocker:** Cannot sideload — Developer Options requires merchant owner pin (Ben's login)
- **Blocker:** Zero real-world testing of any flow (booking, deposit, multi-tenant, printer)

---

## Phase 1: Sideload onto Ben's Terminal

**Priority:** IMMEDIATE
**Depends on:** Ben unlocking Developer Options with his owner pin

### Steps:
1. Ben logs into terminal with **owner** account (not employee/manager pin)
2. Settings > About > tap "Build Number" 7 times → unlocks Developer Options
3. Settings > Developer Options > enable "USB Debugging"
4. Connect MacBook to terminal via USB (or use WiFi ADB: Developer Options > ADB over network)
5. From MacBook:
   ```bash
   brew install android-platform-tools   # one-time
   adb devices                           # verify connection
   adb install -r app-debug.apk          # install
   ```
6. Accept USB debugging prompt on terminal screen
7. App should appear in Clover app drawer

### Alternative — WiFi ADB (if USB cable issues):
1. Both devices on same WiFi
2. On terminal: Developer Options > enable "ADB over network" (note IP:port)
3. From MacBook: `adb connect <ip>:5555` then `adb install -r app-debug.apk`

### Transferring APK to MacBook:
- Email it to yourself (~15MB)
- AirDrop from phone (download on phone first)
- USB drive
- **Do NOT commit APK to git** — binary files bloat the repo permanently

---

## Phase 2: Real-World Testing on Ben's Terminal

**Priority:** HIGH
**Depends on:** Phase 1 complete

### Merchant Resolution
- [ ] App launches and resolves Ben's Clover merchant ID
- [ ] Splash screen transitions to main dashboard
- [ ] Merchant name displays correctly in sidebar

### Bookings Dashboard
- [ ] Calendar loads and displays existing bookings (if any)
- [ ] Week/Day view toggle works
- [ ] Date navigation works
- [ ] Status filter works

### Walk-In Creation
- [ ] Walk-in dialog opens
- [ ] Category-grouped service list loads from backend
- [ ] Can select a service, enter customer info, create walk-in
- [ ] New booking appears on calendar immediately

### Booking Detail & Status Flow
- [ ] Tap a booking → detail panel slides out
- [ ] Status transitions work (Pending → Confirmed → In Progress → Completed)
- [ ] Parts management works (add/delete/status change)

### Receipt Printing
- [ ] "Print Receipt" button works on Clover Mini/Station printer
- [ ] Receipt format looks correct (branding, booking details, service, customer)

### Services Page
- [ ] Services load from backend
- [ ] Can create/edit/delete services
- [ ] Intake questions CRUD works
- [ ] Active/inactive toggle works

### Settings Page
- [ ] Business info loads (name, timezone)
- [ ] Deposit percentage slider works and saves
- [ ] Weekly availability loads and saves
- [ ] Blocked dates can be added/removed

### Customers Page
- [ ] Customer list loads
- [ ] Search/filter works
- [ ] Customer detail shows vehicles and booking history
- [ ] Can add new customer

---

## Phase 3: Web Booking Flow (End-to-End)

**Priority:** HIGH
**Depends on:** Phase 2 validates backend connectivity

### Customer Booking (from NLA website)
- [ ] BookingWizardModal iframe loads BayReady booking page
- [ ] Service selection works (category → service)
- [ ] Calendar shows available slots
- [ ] Vehicle intake form works (Year/Make/Model/Trim)
- [ ] Customer info form works
- [ ] Deposit payment via Clover iframe succeeds (production SDK URL — already fixed)
- [ ] Booking confirmation displays

### Backend Verification
- [ ] Booking appears in BayReady backend (`/merchants/:id/bookings`)
- [ ] Booking appears on Ben's terminal (Android app)
- [ ] Deposit charge appears in Clover dashboard
- [ ] Customer record created in BayReady DB

### Availability Engine
- [ ] Slots respect business hours (Mon-Fri 9-7, Sat 9-3, Sun closed)
- [ ] Overlap detection prevents double-booking
- [ ] Blocked dates hide from calendar

---

## Phase 4: Multi-Tenant Validation

**Priority:** MEDIUM
**Depends on:** Phase 3 complete

### OAuth Onboarding
- [ ] New merchant can visit `/clover/authorize` and complete OAuth flow
- [ ] Tokens stored correctly in BayReady DB
- [ ] Merchant record created with correct Clover merchant ID

### Merchant Isolation
- [ ] Each merchant sees only their own bookings, services, customers
- [ ] Booking page (`/book/:merchantId`) shows correct merchant's services
- [ ] Availability rules are per-merchant

### Android App — New Merchant
- [ ] App resolves a different merchant's Clover account
- [ ] Dashboard shows that merchant's data (not Ben's)

---

## Phase 5: Clover App Market Submission

**Priority:** AFTER validation complete
**Depends on:** Phases 2-4 pass

### Pre-Submission Checklist
- [ ] All Phase 2-4 tests pass
- [ ] Screenshots captured from real terminal (not emulator)
- [ ] Functional Description written
- [ ] Functional Video recorded (screen recording of app walkthrough)
- [ ] Privacy Policy page created and hosted
- [ ] Terms of Service page created and hosted
- [ ] Webhooks configured (if needed, otherwise skip)
- [ ] Pricing tier set: $39/mo
- [ ] Ben's merchant flagged as free-for-life in backend

### Submission
- [ ] Upload final release APK to production developer portal
- [ ] Submit for Clover review
- [ ] Respond to any review feedback
- [ ] App approved and published

---

## Phase 6: Post-Launch

- [ ] Monitor for crashes/errors in production
- [ ] Gather feedback from Ben's daily usage
- [ ] Iterate on UX based on real merchant feedback
- [ ] Marketing: list on BayReady landing page, social media
- [ ] Stripe/billing integration for $39/mo subscription (non-Clover billing)

---

## Known Issues / Risks

1. **Clover Station original (API 17):** App has minSdk 17 with overrideLibrary for AndroidX lifecycle. May crash on this ancient device — acceptable since it's essentially retired hardware.
2. **Receipt printer:** Untested on real hardware. Uses programmatic ViewPrintJob — may need formatting adjustments.
3. **Clover SDK on real device:** `CloverAccount.getAccount()` behavior differs from emulator fallback. Needs real-device testing.
4. **Deposit flow:** SDK URL was just fixed (sandbox → production). Needs end-to-end verification with a real card.
5. **Keystore:** `bayready-release.jks` must be backed up securely. Loss = can't update the app on App Market.

---

## File Locations

| Asset | Path |
|-------|------|
| Debug APK | `bayready/android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `bayready/android/app/build/outputs/apk/release/app-release.apk` |
| Release Keystore | `bayready/android/bayready-release.jks` |
| ProGuard Rules | `bayready/android/app/proguard-rules.pro` |
| Build Config | `bayready/android/app/build.gradle.kts` |
