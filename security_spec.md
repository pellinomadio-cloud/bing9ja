# Security Specification & Test Cases

## 1. Data Invariants
- A **User** account document must only be read by the owner or an admin. It can only be updated by the owner (for details like balance, tier level, and active nodes) or by an admin. Users cannot self-escalate or set arbitrary amounts without following proper transactional flows.
- A **Transaction** record must be securely authored. Once written, a transaction cannot be edited or deleted by users.
- **UpgradeRequest** and **BingPurchaseRequest** documents represent manual slips that are submitted by users (status: 'pending') and can only be updated to terminal statuses ('completed', 'failed') by admins.
- **CompanyDetails** settings can only be written by admins and can be read by any authenticated user.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Malicious Escalation**: Attempt to update a user's own `tier` directly to Level 4 without an approved upgrade request.
2. **Ghost Balance Update**: Inject an additional ₦50,000 to user `balance` field without initiating a proper transfer or payment.
3. **Transaction Poisoning**: Create an already `'completed'` deposit transaction of ₦1,000,000 reference to bypass gateway checks.
4. **Transaction Deletion**: Attempt to delete old withdrawal transactions to cover trails.
5. **Gateway Settings Sabotage**: A standard user attempting to modify company banking details inside `/system/company_details` to divert payments.
6. **Self-Approve Upgrade**: Attempt to transition an upgrade request from `'pending'` to `'completed'` directly from the user's client.
7. **Self-Approve Node**: Attempt to transition a node purchase request from `'pending'` to `'completed'` to receive server yields for free.
8. **Impersonate User Creation**: Attempt to register a user document for a username that does not belong to the registering user.
9. **Steal Other User Profiles**: Attempt to read another user's document details (such as password, balance, and private tokens).
10. **State Corruption**: Attempt to modify the status of a request that has already reached a terminal state (`'completed'`).
11. **Inject Shadow fields**: Trying to write random properties (like `isVip: true` or `isAdmin: true`) on a user profile.
12. **Modify Immutable Timestamps**: Attempt to update `timestamp` or `createdAt` on old slips.

All of these scenarios must be blocked, returning `PERMISSION_DENIED`.
