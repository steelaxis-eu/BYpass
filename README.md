# BeautyPass

> [!IMPORTANT]
> **🚨 AGENT & DEVELOPER SECURITY PROTOCOL 🚨**
> This project handles sensitive medical and legal data. You MUST strictly adhere to the following rules:
> 1. **Read Security Skills**: Consult `.agent/skills/security-best-practices/SKILL.md` before architecture changes.
> 2. **Zero-Trust Frontend**: NEVER write to the DB directly from the client. Use Server Actions + Admin Client.
> 3. **Non-Repudiation**: All procedures and waivers must be logged with IP, User Agent, and Content Hash.
> 4. **GDPR Compliance**: Respect the "Legal Hold" logic (3-year liability). Do not hard delete without checking.
> 5. **Privacy**: Never expose Personal ID Codes. Use server-side hashing for lookups.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
