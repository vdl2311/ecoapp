# Security Specification: EcoApp Firestore Access & Hardening

## 1. Data Invariants
- **Identity Integrity**: A user can only write and mutate their own profile document (`/users/{userId}`) where `{userId}` strictly equals `request.auth.uid`.
- **Role Isolation**: Normal users cannot self-escalate their `role` to `agent` without authorized credential checks.
- **Relational Ownership**: A transaction in `/users/{userId}/transactions/{txId}` must belong to the parent `{userId}`, and only the user or system can insert records.
- **Community Safety (Donations)**: Any citizen can browse active donations (`/donations/{donationId}`), but only the authenticated `authorId` can edit, mark as reserved, or delete their own listing.
- **Environmental Reports**: Any authenticated citizen can report irregular dumping or view community reports; only the reporter can edit their description, while status transitions ('em_analise', 'resolvido') are restricted to SESUMA agents or the author.
- **Immutability of Keys**: Critical identifiers (`id`, `authorId`, `userId`, `createdAt`) cannot be mutated across update operations.

---

## 2. The "Dirty Dozen" Threat Payloads (Security TDD)
1. **Payload 1 (Identity Spoofing - Profile Takeover)**:
   - Operation: `setDoc(/users/target-user-123, { id: 'target-user-123', name: 'Hacker', role: 'agent' })` as unauthenticated or different UID.
   - Expected: `PERMISSION_DENIED`
2. **Payload 2 (Role Escalation)**:
   - Operation: Authenticated user attempting to change their own role from `citizen` to `agent` via unauthorized patch.
   - Expected: `PERMISSION_DENIED`
3. **Payload 3 (Unbounded Payload Exhaustion)**:
   - Operation: Creating a donation with a 500KB junk string in `description` or `title`.
   - Expected: `PERMISSION_DENIED`
4. **Payload 4 (Donation Hijack)**:
   - Operation: Updating another user's donation item where `request.auth.uid != resource.data.authorId`.
   - Expected: `PERMISSION_DENIED`
5. **Payload 5 (Author ID Impersonation)**:
   - Operation: Citizen creates a report setting `authorId: 'mayor-of-ipatinga'`.
   - Expected: `PERMISSION_DENIED` (must match `request.auth.uid`)
6. **Payload 6 (Cross-User Transaction Injection)**:
   - Operation: Writing a points transaction into `/users/another-user-id/transactions/tx-1` without permission.
   - Expected: `PERMISSION_DENIED`
7. **Payload 7 (Path ID Traversal / Junk Characters)**:
   - Operation: Writing to `/donations/{junk!@#$%^&*()}` with an invalid ID format.
   - Expected: `PERMISSION_DENIED`
8. **Payload 8 (Arbitrary Ghost Fields - Shadow Update)**:
   - Operation: Updating a report document with an injected `adminBypassKey: true` field.
   - Expected: `PERMISSION_DENIED`
9. **Payload 9 (Forged Status Bypass on Closed Ticket)**:
   - Operation: Citizen modifying a report already marked as `resolvido`.
   - Expected: `PERMISSION_DENIED`
10. **Payload 10 (Negative Point Drain Attack)**:
    - Operation: Creating a points transaction with `amount: -999999` to corrupt ledger balance.
    - Expected: `PERMISSION_DENIED`
11. **Payload 11 (Unauthenticated Data Scraping)**:
    - Operation: Unauthenticated client listing private user subcollections.
    - Expected: `PERMISSION_DENIED`
12. **Payload 12 (Cata-Treco Spoofing)**:
    - Operation: Creating a pickup request with mismatched `authorId`.
    - Expected: `PERMISSION_DENIED`
