# MedChain

A medical supply chain traceability platform for government regulators, manufacturers, pharmacies, and consumers. Built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and MongoDB.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- MongoDB
- pnpm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd 8x-hiring-template
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure a cloud MongoDB connection string**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your cloud database connection string and auth secrets:
   ```
   DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medchain?retryWrites=true&w=majority"
   NEXTAUTH_SECRET="<your-secret>"
   NEXTAUTH_URL="http://localhost:3000"
   JWT_SECRET="<your-secret>"
   ```

4. **Push the Prisma schema**
   ```bash
   pnpm db:push
   ```

5. **Generate the Prisma client**
   ```bash
   pnpm db:generate
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

7. **Open** [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18 + Tailwind CSS + Shadcn/ui
- **Database**: MongoDB Atlas or another cloud MongoDB provider + Prisma ORM
- **Auth**: NextAuth.js / JWT-based sessions

## Features

- MedChain landing page and government-grade shell
- Prisma schema scaffold for traceability entities
- QR and UUID helper scaffolding
- Responsive design with enterprise styling

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── contexts/               # React Context providers
├── lib/                    # Utilities and Prisma helpers
└── prisma/                 # Database schema
```

## Useful Commands

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm lint          # Run ESLint
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push the Prisma schema to MongoDB
pnpm db:studio     # Open Prisma Studio
```

## Database Schema

The initial MedChain schema includes:

```sql
User, DrugType, License, MedicineUnit, TransferLog, and Flag models.
```

## Notes

- The current commit focuses on Step 1 foundation work: stack alignment, Prisma scaffold, and enterprise landing shell.
- Later steps will add auth, role middleware, dashboards, and public verification flows.

---

See [CANDIDATE_ASSIGNMENT.md](./CANDIDATE_ASSIGNMENT.md) for assessment instructions.
