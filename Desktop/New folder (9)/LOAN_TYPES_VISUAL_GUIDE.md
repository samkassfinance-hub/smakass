# Loan Types - Visual & Functional Guide

## Loan Type System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TWO LOAN CATEGORIES                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  TYPE 1: AMOUNT WITH INTEREST (LI)                      │
│  ├─ Principal Amount + Interest Rate/Amount             │
│  ├─ Code Prefix: LI-                                    │
│  ├─ Example: LI-abc123                                  │
│  ├─ Display: "Amount with Interest"                     │
│  └─ Use Case: Traditional loans with interest           │
│                                                           │
│  TYPE 2: AMOUNT ONLY (LN)                               │
│  ├─ Principal Amount (No Interest)                      │
│  ├─ Code Prefix: LN-                                    │
│  ├─ Example: LN-def456                                  │
│  ├─ Display: "Amount Only"                              │
│  └─ Use Case: Interest-free loans or fixed payments     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Where Loan Types Appear

### 1. LOANS PAGE - List View
```
┌────────────────────────────────────────────────────────┐
│ LOANS                                                   │
├────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ John Smith (With Interest)  [ACTIVE]             │   │
│ │ [LI-abc123]                                      │   │
│ │                                                  │   │
│ │ EMI: ₹5,000   Principal: ₹50,000                │   │
│ │ Paid: ₹15,000   Remaining: ₹35,000              │   │
│ │ Progress: 30%                                   │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Jane Doe (Amount Only)      [ACTIVE]             │   │
│ │ [LN-def456]                                      │   │
│ │                                                  │   │
│ │ EMI: ₹10,000   Principal: ₹100,000              │   │
│ │ Paid: ₹40,000   Remaining: ₹60,000              │   │
│ │ Progress: 40%                                   │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
└────────────────────────────────────────────────────────┘
```

### 2. ADD LOAN MODAL - Selection
```
┌────────────────────────────────────────────────────────┐
│ ADD LOAN                                          ✕     │
├────────────────────────────────────────────────────────┤
│                                                          │
│ Client *                                                │
│ [Select client...                                    ▼] │
│                                                          │
│ Loan Type *                      ← NEW FIELD             │
│ [Select loan type...                               ▼] │
│  • Amount with Interest                                 │
│  • Amount Only                                          │
│ ℹ Choose loan type: with or without interest           │
│                                                          │
│ Interest Type          Collection Type                  │
│ [Percentage Interest▼] [Monthly         ▼]             │
│                                                          │
│ Principal (₹) *        Interest % *                     │
│ [50000              ] [2                 ]              │
│                                                          │
│ Duration (months)                                       │
│ [12                  ]                                  │
│                                                          │
│ Start Date                                              │
│ [2026-06-17]                                           │
│                                                          │
│ [Cancel]                          [Save Loan]           │
│                                                          │
└────────────────────────────────────────────────────────┘
```

### 3. COLLECTION PAGE - Due Collections
```
┌────────────────────────────────────────────────────────┐
│ COLLECT                                                 │
├────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ John Smith [With Interest]   [DUE]              │   │
│ │ [LI-abc123]                                      │   │
│ │ 9876543210 · Monthly EMI · Next: 18 Jun 2026    │   │
│ │                                                  │   │
│ │ [Collect ₹5,000] [Missed] [Partly Paid]         │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Jane Doe [Amount Only]       [2d OVERDUE]       │   │
│ │ [LN-def456]                                      │   │
│ │ 9876543211 · Monthly EMI · Next: 16 Jun 2026    │   │
│ │                                                  │   │
│ │ [Collect ₹10,000] [Missed] [Partly Paid]        │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
└────────────────────────────────────────────────────────┘
```

### 4. LOAN INFO MODAL - Details
```
┌────────────────────────────────────────────────────────┐
│ LOAN DETAILS                                      ✕     │
├────────────────────────────────────────────────────────┤
│                                                          │
│              [💰 Icon]                                  │
│              ₹50,000                                    │
│              [ACTIVE]                                  │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Client: John Smith                               │   │
│ │ Phone: 9876543210                                │   │
│ │ Loan Type: Amount with Interest  ← NEW           │   │
│ │ Start Date: 01 Jun 2026                          │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Interest Rate: 2% (Percentage)                   │   │
│ │ Duration: 12 installments                        │   │
│ │ Collection Type: Monthly                         │   │
│ │ Collection Amount: ₹5,000                        │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Total Payable: ₹65,000                           │   │
│ │ Total Paid: ₹15,000                              │   │
│ │ Remaining: ₹50,000                               │   │
│ │                                                  │   │
│ │ Progress: 23%                                   │   │
│ │ [████░░░░░░░░░░░░░░░░░░░░░░]                    │   │
│ │                                                  │   │
│ │ Next Due: 18 Jun 2026                            │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
└────────────────────────────────────────────────────────┘
```

### 5. CLIENT PROFILE - Loans Section
```
┌────────────────────────────────────────────────────────┐
│ CLIENT PROFILE                                    ✕     │
├────────────────────────────────────────────────────────┤
│                                                          │
│  👤 John Smith                                          │
│  📞 9876543210                                          │
│  📍 123 Main Street                                     │
│  💼 Business Owner                                      │
│                                                          │
│  LOANS (3)                                              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ₹50,000 [With Interest]   [ACTIVE]              │  │
│  │ · 12 months                                      │  │
│  │ EMI: ₹5,000  Paid: ₹15,000  Remaining: ₹35,000 │  │
│  │ [About] [Edit] [WhatsApp]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ₹25,000 [Amount Only]     [COMPLETED]           │  │
│  │                                                  │  │
│  │ EMI: ₹2,500  Paid: ₹25,000  Remaining: ₹0      │  │
│  │ [About] [Edit] [WhatsApp]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  RECENT PAYMENTS                                        │
│  ├─ ₹5,000 on 17 Jun 2026 - Loan LI-abc123            │
│  ├─ ₹5,000 on 10 Jun 2026 - Loan LI-abc123            │
│  └─ ₹5,000 on 03 Jun 2026 - Loan LI-abc123            │
│                                                          │
└────────────────────────────────────────────────────────┘
```

## Data Structure

### Loan Object with Category
```javascript
{
  id: "loan-uuid-123",
  clientId: "client-uuid-456",
  principal: 50000,
  interestRate: 2,
  interestType: "percentage",
  duration: 12,
  type: "monthly",
  startDate: "2026-06-01",
  status: "active",
  
  category: "with_interest",    // ← NEW FIELD
                                 // Options: "with_interest" or "without_interest"
  
  loanMode: "traditional",
  createdAt: "2026-06-01"
}
```

## Loan Code Format

### Code Generation Logic
```
Category              Prefix    Length    Example
─────────────────────────────────────────────────
with_interest         LI-       9 chars   LI-abc1234
without_interest      LN-       9 chars   LN-def5678
```

### How It Works
1. First 3 chars: Category prefix (LI- or LN-)
2. Next 6 chars: First 6 characters of loan ID
3. Total: Easily distinguishable codes

## Workflow Example

### Scenario: Creating a New Loan

**Step 1: Open Add Loan**
- User clicks "Add Loan"
- Loan Type Modal appears

**Step 2: Fill Loan Form**
- Select Client: "John Smith"
- **Select Loan Type: "Amount with Interest"** ← NEW
- Interest Type: "Percentage Interest"
- Collection Type: "Monthly"
- Principal: ₹50,000
- Interest: 2%
- Duration: 12 months

**Step 3: Save Loan**
- System creates loan with:
  - `category: "with_interest"`
  - Code: `LI-abc1234`

**Step 4: View in Collection**
- Collection page shows:
  - "John Smith [With Interest]"
  - Code: "[LI-abc1234]"
  - Due amount and collection options

## Backward Compatibility

For existing loans without category:
- Defaults to `"with_interest"` if missing
- Code generation uses default prefix (LI-)
- Can be updated when editing loans
- No data loss or migration issues

## Key Differences Summary

| Aspect | With Interest | Amount Only |
|--------|---|---|
| **Code Prefix** | LI- | LN- |
| **Interest Type** | Supported | Not applicable |
| **Use Case** | Traditional loans | Fixed payment loans |
| **Display** | "Amount with Interest" | "Amount Only" |
| **Interest Field** | Required | Optional |
| **Collection Tracking** | Interest + Principal | Amount only |

---
**Visual Guide Version**: 1.0
**Last Updated**: June 2026
