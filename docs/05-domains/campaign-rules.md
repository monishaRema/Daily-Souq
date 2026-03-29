# Campaign Rules

## Overview

This document defines the business rules for campaigns in DailySouq.

A campaign is a vendor-owned promotional visibility card used to attract customer attention.

Campaigns are not discount logic. They do not change checkout pricing in v1.

They are used for:

- vendor storefront visibility
- homepage promo/campaign sections

---

## Campaign Purpose

Campaigns exist to help vendors promote their shop visually through time-bound promotional content.

Examples:

- weekend promo
- seasonal campaign
- Ramadan/Eid visibility message
- new arrival announcement

This feature is about visibility, not commerce calculation.

---

## Campaign Ownership

### Vendor owns

- campaign content
- campaign draft/editing
- submission for approval

### Admin owns

- campaign approval/rejection/archive decision
- public visibility governance through moderation

### Customer owns

- no campaign mutation
- customer only sees eligible public campaigns

---

## Campaign Core Rules

### Rule 1: campaign belongs to exactly one vendor

Every campaign has one vendor owner.

### Rule 2: max 5 campaigns per vendor

In v1, one vendor can have at most 5 campaigns.

This should be enforced at business level.

### Rule 3: campaign contains one image only

To keep the feature focused, campaign uses:

- one image
- no gallery
- no featured image complexity

### Rule 4: campaign requires approval before public visibility

Vendor cannot publish directly to public surfaces without admin approval.

### Rule 5: campaign uses date window

Campaign has:

- start date
- end date

It is visible only inside valid date range.

### Rule 6: campaign does not affect price

Campaign is visibility content only.

It does not:

- create discount price
- modify checkout total
- act like coupon system

---

## Campaign Content in v1

Campaign contains:

- title
- short description
- image
- start date
- end date

Optional moderation data may include:

- rejection reason

---

## Campaign Lifecycle

Campaigns use the following lifecycle:

```txt
DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
EXPIRED
ARCHIVED
```

### `DRAFT`

Campaign created but not submitted.

### `PENDING_APPROVAL`

Campaign submitted to admin and awaiting review.

### `APPROVED`

Campaign approved by admin. Public visibility still depends on date range and vendor state.

### `REJECTED`

Campaign rejected by admin.

### `EXPIRED`

Campaign date window has passed.

### `ARCHIVED`

Campaign removed from normal active use.

---

## Campaign Visibility Rule

A campaign is publicly visible only if:

- campaign status is approved
- vendor is approved/active
- current date is between start date and end date

If any of these fail, campaign is not public.

---

## Date Rules

### Start and end dates are required

Campaign must define both dates.

### Start date must be before end date

Invalid time windows must be rejected.

### Expiry behavior

Once end date passes, campaign should no longer be visible publicly.

### Important design rule

Do not rely only on cron for truth.

Best approach:

- query/business logic determines whether campaign is currently visible
- cron may optionally mark stale campaigns as `EXPIRED` for cleanup

---

## Vendor Editable Rules

Vendor can edit freely while in:

- `DRAFT`
- `REJECTED` before resubmission

### Better v1 rule for approved content

If vendor changes approved campaign content materially, require re-approval.

This keeps moderation meaningful.

### Practical behavior

Approved campaign edits should send content back to:

```txt
PENDING_APPROVAL
```

if the campaign content is changed.

---

## Admin Moderation Rules

Admin can:

- approve campaign
- reject campaign
- archive campaign if needed

Admin should evaluate:

- campaign validity
- content appropriateness
- date window correctness
- vendor participation state

---

## Public Display Surfaces

Eligible campaigns may appear in:

- vendor storefront
- homepage campaign/promo section

They should not appear publicly if:

- rejected
- archived
- expired
- vendor is inactive/suspended
- date window is not valid

---

## Forbidden Behaviors

The following are not allowed in v1:

- campaign gallery or multiple images
- campaign affecting checkout price
- coupon logic
- campaign linked to payment rules
- direct vendor public publishing without approval
- more than 5 campaigns per vendor
- invalid date window
- public visibility of rejected, expired, or archived campaign

---

## Audit Logging Expectations

Important campaign actions should create audit entries.

Recommended events:

- `CAMPAIGN_CREATED`
- `CAMPAIGN_SUBMITTED`
- `CAMPAIGN_APPROVED`
- `CAMPAIGN_REJECTED`
- `CAMPAIGN_ARCHIVED`
- `CAMPAIGN_EXPIRED`

---

## Final Campaign Rule Summary

Campaigns are:

- vendor-owned
- admin-approved
- date-bound
- one-image visibility resources

They are intentionally narrow in v1.

This keeps the feature:

- useful
- easy to moderate
- easy to reason about
- separate from pricing complexity
