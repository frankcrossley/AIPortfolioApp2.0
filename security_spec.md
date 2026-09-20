# Security Specification: AI Portfolio Management

## 1. System Invariants
1. Any authenticated enterprise user can browse AI Estate items and relationships to maintain visibility across platforms and initiatives.
2. Creating an Estate item or Relationship requires authentication and valid input fields according to `firebase-blueprint.json`.
3. An Estate item or Relationship mutation (edit, delete) requires the user to be authenticated.
4. Input strings and identifiers must be size-bounded to prevent Denial of Wallet and ID poisoning attacks.

## 2. The Dirty Dozen Payloads (Targeting Vulnerabilities)
1. **Unauthenticated Write**: Creating an estate item with `auth == null` -> DENY.
2. **ID Poisoning**: Creating an estate item with an ID longer than 128 characters or special illegal characters -> DENY.
3. **Payload Bloat**: Injecting a 500KB description string to exhaust quota -> DENY (max size <= 2000 chars).
4. **Missing Required Fields**: Creating an estate item missing `name` or `type` -> DENY.
5. **Type Poisoning**: Sending `annualCost` as a string or array instead of number -> DENY.
6. **Enum Violation**: Sending lifecycleStage: "AlienStage" -> DENY.
7. **Shadow Injection**: Submitting an arbitrary injected attribute `__adminBackdoor` -> DENY.
8. **Unauthenticated Deletion**: Deleting an initiative without logging in -> DENY.
9. **Blanket List Scraping**: Querying collection without authenticated context -> DENY.
10. **Relationship ID Poisoning**: Relationship with invalid characters in id -> DENY.
11. **Malicious Relationship Type**: Injecting unregistered relationship type -> DENY.
12. **Negative Numeric Values**: Submitting negative costs -> DENY.
