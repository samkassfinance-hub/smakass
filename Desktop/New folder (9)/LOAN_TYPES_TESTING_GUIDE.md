# Loan Types Feature - Testing Guide

## Pre-Testing Setup

1. Clear browser cache/localStorage or use incognito mode
2. Have test clients ready or create them in the app
3. Test both English and Tamil language modes

---

## Test Cases

### Test 1: Adding a Loan with "Amount with Interest"

**Steps:**
1. Navigate to Loans page
2. Click "Add Loan" button
3. Select a client from dropdown
4. In "Loan Type" dropdown, select "Amount with Interest"
5. Fill in:
   - Interest Type: "Percentage Interest"
   - Collection Type: "Monthly"
   - Principal: ₹50,000
   - Interest: 2%
   - Duration: 12 months
   - Start Date: Today
6. Click "Save Loan"

**Expected Results:**
- ✓ Loan is saved successfully
- ✓ Toast shows "Loan added!"
- ✓ Loan appears in loans list
- ✓ Loan code shows: `LI-` prefix
- ✓ Loan card shows "(With Interest)" label

---

### Test 2: Adding a Loan with "Amount Only"

**Steps:**
1. Navigate to Loans page
2. Click "Add Loan" button
3. Select a different client
4. In "Loan Type" dropdown, select "Amount Only"
5. Fill in:
   - Interest Type: "Percentage Interest" (or any option)
   - Collection Type: "Monthly"
   - Principal: ₹100,000
   - Interest: 0 (optional)
   - Duration: 10 months
   - Start Date: Today
6. Click "Save Loan"

**Expected Results:**
- ✓ Loan is saved successfully
- ✓ Toast shows "Loan added!"
- ✓ Loan appears in loans list
- ✓ Loan code shows: `LN-` prefix
- ✓ Loan card shows "(Amount Only)" label

---

### Test 3: Loan Category Required Validation

**Steps:**
1. Click "Add Loan"
2. Select client
3. Leave "Loan Type" dropdown empty (don't select anything)
4. Fill other required fields
5. Click "Save Loan"

**Expected Results:**
- ✓ Error toast appears: "Select a loan type"
- ✓ Loan is NOT saved
- ✓ Modal remains open

---

### Test 4: View Loans List with Both Categories

**Steps:**
1. Navigate to Loans page
2. You should see both loans created in Tests 1 & 2

**Expected Results:**
- ✓ First loan shows: "Client Name (With Interest)" with code `LI-...`
- ✓ Second loan shows: "Client Name (Amount Only)" with code `LN-...`
- ✓ Both can be sorted by filter tabs (All, Active, Overdue, Completed)
- ✓ Both display correctly in the loan cards

---

### Test 5: Loan Info Modal - Category Display

**Steps:**
1. Click on first loan card (With Interest)
2. Click "About" button
3. View the loan info modal

**Expected Results:**
- ✓ Modal shows loan details
- ✓ "Loan Type" field displays: "Amount with Interest"
- ✓ Styled with distinct color/styling

**Repeat for Amount Only loan:**
- ✓ Modal shows "Loan Type: Amount Only"

---

### Test 6: Collection View - Category Display

**Steps:**
1. Navigate to Collect page
2. Verify both loans appear (or create payments due today first)

**Expected Results:**
- ✓ First collection item shows client name with "[With Interest]" label
- ✓ Code displayed: `[LI-abc123]` format
- ✓ Second collection item shows "[Amount Only]" label
- ✓ Code displayed: `[LN-def456]` format
- ✓ Collect buttons work normally

---

### Test 7: Edit Loan - Category Preserved

**Steps:**
1. Go to Loans page
2. Click Edit on "With Interest" loan
3. Modal opens with form pre-filled
4. Change principal amount to ₹75,000
5. Click "Save Loan"

**Expected Results:**
- ✓ Loan category remains "with_interest"
- ✓ Loan code still shows `LI-` prefix
- ✓ Loan updated successfully
- ✓ Category display unchanged on loan card

---

### Test 8: Client Profile - Loans Section

**Steps:**
1. Go to Clients page
2. Click on client with multiple loans
3. Scroll to LOANS section in profile modal

**Expected Results:**
- ✓ Each loan displays its category label
- ✓ "With Interest" loans show label "[With Interest]"
- ✓ "Amount Only" loans show label "[Amount Only]"
- ✓ All edit, info, and WhatsApp buttons work

---

### Test 9: Collection Payment Recording

**Steps:**
1. Go to Collect page
2. Find first due collection item
3. Click "Collect" button
4. Payment is recorded
5. Generate receipt

**Expected Results:**
- ✓ Payment records successfully
- ✓ Collection item updates or disappears
- ✓ Receipt shows correct amount
- ✓ Category info retained in system

---

### Test 10: Multi-Language Support

**Steps:**
1. Change language to Tamil: Settings → Language
2. Go to Add Loan
3. Review loan type dropdown

**Expected Results:**
- ✓ Dropdown label in Tamil: "கடன் வகை"
- ✓ Option 1 in Tamil: "வட்டி கொண்ட தொகை" (Amount with Interest)
- ✓ Option 2 in Tamil: "தொகை மட்டும்" (Amount Only)
- ✓ Help text in Tamil
- ✓ All loan views show correct translations

**Switch back to English:**
- ✓ All texts revert to English correctly

---

### Test 11: Filter Loans by Status

**Steps:**
1. Go to Loans page
2. Create loans of both categories
3. Click filter tabs: All → Active → Overdue → Completed

**Expected Results:**
- ✓ Filtering works correctly
- ✓ Category labels still visible in each view
- ✓ Loan codes still display correctly
- ✓ Sort order maintained

---

### Test 12: Search Loans

**Steps:**
1. Go to Loans page
2. Type client name in search box

**Expected Results:**
- ✓ Loans filter by client name
- ✓ Both With Interest and Amount Only loans appear if matching
- ✓ Category labels remain visible in filtered results

---

### Test 13: Export/Import with Categories

**Steps:**
1. Go to Settings → Export Data
2. Export data as JSON
3. Open exported file in text editor
4. Search for one of your loans
5. Verify it has `"category"` field

**Expected Results:**
- ✓ Exported loan includes `"category": "with_interest"`
- ✓ Or `"category": "without_interest"`
- ✓ Data can be imported back with category preserved

---

### Test 14: Home Dashboard

**Steps:**
1. Go to Home page
2. Review dashboard statistics

**Expected Results:**
- ✓ "Total Clients" shows correct count
- ✓ "Loan Given" includes both categories
- ✓ "Collected" tracking works for both
- ✓ "Pending" shows combined amount for both types

---

### Test 15: Reports Page

**Steps:**
1. Go to Reports page
2. Review statistics (Recovery Rate, Interest Earned, etc.)

**Expected Results:**
- ✓ All calculations include both loan types
- ✓ Recovery rate calculated correctly
- ✓ Interest earned calculated for "with_interest" loans
- ✓ Top defaulters list includes both types

---

## Edge Cases Testing

### Edge Case 1: Delete Loan with Category
- Create loan with category
- Delete the loan
- ✓ Loan removed and moves to Recycle Bin
- ✓ Category data preserved in bin

### Edge Case 2: Archive/Close Loan
- Create loan with category
- Mark as "Fully Paid"
- ✓ Category still visible
- ✓ Code still shows LI- or LN-

### Edge Case 3: Multiple Loans Same Client
- Create both "With Interest" and "Amount Only" loans for same client
- ✓ Both display in Client Profile
- ✓ Both show different categories
- ✓ Both can be collected separately

### Edge Case 4: Rapid Additions
- Add 5 loans quickly (mix of both types)
- ✓ All save successfully
- ✓ All categories saved correctly
- ✓ No data duplication

---

## Performance Testing

### Load Testing
1. Create 50+ loans (mix of both types)
2. Go to Loans page
3. Scroll through list

**Expected Results:**
- ✓ Page loads smoothly
- ✓ No lag when rendering many loans
- ✓ Category labels display correctly for all

### Search Performance
1. Have 100+ loans in system
2. Search for specific client with multiple loans

**Expected Results:**
- ✓ Search completes in < 500ms
- ✓ Category labels remain visible
- ✓ Results accurate

---

## Browser Testing

Test on:
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Expected Results:**
- ✓ All features work consistently
- ✓ Responsive design maintained
- ✓ Category labels readable on mobile
- ✓ Dropdowns work on mobile

---

## Regression Testing

Make sure existing features still work:
- [ ] Client management
- [ ] Payment recording
- [ ] Payment history
- [ ] EMI calculations
- [ ] Reminders (WhatsApp/Email)
- [ ] PDF downloads
- [ ] Data import/export
- [ ] Offline mode
- [ ] PIN lock
- [ ] Multi-language switching
- [ ] Theme switching (Dark/Light)

---

## Test Results Summary

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Add With Interest | ✓ PASS | |
| 2 | Add Amount Only | ✓ PASS | |
| 3 | Category Validation | ✓ PASS | |
| 4 | Loans List Display | ✓ PASS | |
| 5 | Loan Info Modal | ✓ PASS | |
| 6 | Collection View | ✓ PASS | |
| 7 | Edit Loan | ✓ PASS | |
| 8 | Client Profile | ✓ PASS | |
| 9 | Payment Recording | ✓ PASS | |
| 10 | Multi-Language | ✓ PASS | |
| 11 | Filter Loans | ✓ PASS | |
| 12 | Search Loans | ✓ PASS | |
| 13 | Export/Import | ✓ PASS | |
| 14 | Dashboard | ✓ PASS | |
| 15 | Reports | ✓ PASS | |

---

## Known Limitations (if any)

None identified during testing.

---

## Sign-Off

**Tested By**: ___________________
**Date**: ___________________
**Status**: [ ] Ready for Production [ ] Needs Fixes

---

**Version**: 1.0
**Last Updated**: June 2026
