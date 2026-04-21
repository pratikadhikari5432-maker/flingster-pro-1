# Security Specification - Lumina Creative Studio Pro

## Data Invariants
1. **User Integrity**: A user can only see and modify their own basic profile data. Sensitive fields like `credits`, `revenue`, `role`, and `isBlocked` are strictly system-managed or admin-managed.
2. **Financial Atomicity**: Withdrawal requests are immutable once created by the user, except for status changes performed by an admin.
3. **Verification Integrity**: Student status can only be requested by the user (`pending`) but must be finalized (`verified` or `rejected`) by an authorized admin.
4. **Admin Escalation Protection**: The `admin` role cannot be self-assigned.

## The Dirty Dozen Payloads (Rejection Targets)

1. **Self-Crediting**: User tries to update their own credits.
   - `PATCH /users/{myId} { "credits": 999999 }` -> **DENIED**
2. **Revenue Injection**: User tries to inflate their revenue balance.
   - `PATCH /users/{myId} { "revenue": 5000 }` -> **DENIED**
3. **Role Elevation**: User tries to promote themselves to admin.
   - `PATCH /users/{myId} { "role": "admin" }` -> **DENIED**
4. **Self-Verification**: User marks their student status as verified.
   - `PATCH /users/{myId} { "studentVerificationStatus": "verified" }` -> **DENIED**
5. **Escape the Block**: Blocked user tries to unblock themselves.
   - `PATCH /users/{myId} { "isBlocked": false }` -> **DENIED**
6. **Cross-User Snooping**: User A tries to read User B's profile.
   - `GET /users/{userIdB}` -> **DENIED**
7. **Phantom Withdrawal**: User creates a withdrawal request for another user's balance.
   - `POST /withdrawal_requests/ { "userId": "userIdB", "amount": 100 }` -> **DENIED**
8. **Admin Impersonation**: Attacker tries to approve their own withdrawal.
   - `PATCH /withdrawal_requests/{reqId} { "status": "approved" }` (as non-admin) -> **DENIED**
9. **ID Poisoning**: Document creation with an excessively long or malicious ID.
   - `PUT /users/LONG_POISONED_STRING_...` -> **DENIED**
10. **Terminal State Break**: User tries to delete a withdrawal request that is already approved.
    - `DELETE /withdrawal_requests/{reqId}` -> **DENIED**
11. **Public Leak**: Unauthenticated guest tries to list all withdrawal requests.
    - `GET /withdrawal_requests/` -> **DENIED**
12. **Shadow Field Injection**: User adds undocumented fields to their profile.
    - `PATCH /users/{myId} { "isVerified": true, "ghostField": "malicious" }` -> **DENIED**
