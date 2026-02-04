# Security & Compliance Report

> [!DATE]
> Generated: 2026-02-03

This document summarizes the "Military-Grade" security and legal compliance features implemented to protect the PMU business, ensuring readiness for GDPR audits and Insurance defense.

## 1. Non-Repudiation Architecture
To prevent clients from claiming "I never signed that," we have implemented a rigorous logging system that creates a digital "seal" around every procedure.

- **Digital Artifacts**: At the moment of signature, we capture:
  - **IP Address**: Source of the request.
  - **User Agent**: Device/Browser fingerprint.
  - **Content Hash (SHA-256)**: A cryptographic fingerprint of the *exact* data they signed (Name, Pigment, Health Data). If even one letter changes later, the hash won't match, proving the record is authentic.
- **Audit Logs**: These artifacts are stored in an immutable `audit_logs` table, accessible only via Admin privileges, never by the client app.

## 2. GDPR "Legal Hold" vs. Right to Erasure
A critical conflict exists between GDPR (Right to Erasure) and Liability Protection (Need to retain data for defense). We have resolved this with a **Legal Hold** logic:

- **Logic**: When a client requests deletion, the system checks for any procedures within the **Liability Period** (set to 3 years).
- **Active Liability**: If recent procedures exist, the deletion is **DENIED**. The client status is set to `legal_hold`. Data is restricted but NOT deleted, complying with GDPR Art. 17(3)(e).
- **Expired Liability**: If no recent procedures exist, the system performs a **Hard Delete** or Anonymization, satisfying the Right to Erasure.

## 3. Hybrid Signature Module & Smart-ID Readiness
We moved from a simple canvas to a **Provider/Adapter Pattern**:

- **Manual Adapter**: "Sign on Glass" (Current default).
- **Smart-ID Adapter**: A placeholder structure is ready to integrate Smart-ID/Mobile-ID APIs.
- **Future Proof**: The database and backend are ready to store cryptographic tokens from QES (Qualified Electronic Signatures) alongside manual images.

## 4. Adverse Event Protocol
To defend against medical negligence claims, we implemented a formal channel for reporting complications (e.g., allergic reactions).

- **Immediate Logging**: Masters can log events (Severity: Mild/Severe) instantly.
- **Chain of Custody**: These reports are timestamped and linked to the specific procedure ID, creating a contemporaneous medical record which is the gold standard in court.

## 5. Server-Side Security (Zero-Trust Frontend)
We refactored the application to remove **ALL direct database access** from the frontend.

- **Old Way**: Frontend calls `supabase.from('procedures').insert(...)`. (Risky: Requires exposing Table permissions to public/anon users).
- **New Way**: Frontend submits data to a **Server Action**.
  - **Validation**: Zod schemas enforce data types stricty on the server.
  - **Privilege Elevation**: The Server Action uses a secure `Admin Client` to write to the DB and Storage.
  - **Result**: The frontend has *zero* write permissions to the database. It can only submit forms.

## 6. Client Identity & Health Data
- **Deterministic Hashing**: We verify client identity using a SHA-256 hash of their Personal Code. This allows us to find returning clients without storing their raw ID in a searchable way if needed (though currently we store both for convenience/legal, the lookup is hash-based).
- **Health Screening**: Mandatory intake form (Allergies, Pregnancy) is now tied to the procedure record, ensuring no "I didn't know I couldn't do this" excuses.

## 7. Middleware Security (Service Role RBAC)
To ensure reliable access control without being blocked by circular RLS policies, the Middleware uses a **Service Role (Sudo)** client for role verification.

- **Security Model**: The `SUPABASE_SERVICE_ROLE_KEY` is stored in server-side environment variables and **never exposed** to the client browser.
- **Scope**: The elevated privilege is strictly limited to fetching the user's `role` from the `profiles` table. It does not bypass RLS for any user-facing data fetching.
- **Benefit**: This prevents "Admin Lockout" scenarios where a misconfigured RLS policy might accidentally block administrators from accessing the dashboard to fix the system.

## Next Steps
- **Smart-ID API**: Contract with SK ID Solutions to get API keys for the Smart-ID adapter.
- **Regular Audits**: Review `audit_logs` monthly to ensure no anomalous activity.
