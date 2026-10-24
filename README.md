# 🏠 Roomly — Smart Rental & Roommate Discovery Platform

Roomly is a full-stack smart rental and roommate-discovery platform designed to solve urban rental headaches for students and young working professionals. It combines **verified property discovery**, an **intelligent roommate compatibility matching algorithm**, **real-time chat**, **property visit scheduling**, and **financial rent-split calculators**.

---

## 🚀 Quick Start (Dead Simple)

### Prerequisites
- **Node.js**: v18+ (Tested on v24)
- **Docker & Docker Compose**: Running with PostgreSQL 17

### 1. Start PostgreSQL 17 via Docker
```bash
docker compose up -d
```
*The database runs on port `5432` with user `roomly` and database `roomly` backed by persistent volume `roomly_roomly_postgres_data`.*

### 2. Install Dependencies & Seed Database
```bash
# Install backend dependencies & sync Prisma schema
npm run server:install
npm run db:migrate
npm run db:seed

# Install frontend dependencies
npm install
```

### 3. Run the Full Application
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5174](http://localhost:5174)
- **Backend API**: [http://localhost:5050/api](http://localhost:5050/api)
- **API Health Check**: [http://localhost:5050/api/health](http://localhost:5050/api/health)

### 4. Run Automated Test Suite
```bash
npm test
```
*Runs 16 end-to-end integration tests validating authentication, database relations, compatibility scoring, and route protection.*

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@roomly.com` | `password123` | Platform oversight, report moderation & verification |
| **Landlord** | `rajesh@roomly.com` | `password123` | Manages 3BHK Penthouse in Koramangala & visit requests |
| **Landlord** | `priya@roomly.com` | `password123` | Manages 2BHK Garden Flat in Indiranagar |
| **Tenant** | `aarav@roomly.com` | `password123` | Software Engineer @ Flipkart, Night Owl, Pet Friendly |
| **Tenant** | `ananya@roomly.com` | `password123` | UX Designer @ Swiggy, Early Bird, Non-smoker |

*(Note: There is also a 1-click **Quick Switch** button in the Navbar for fast persona testing!)*

---

## 🏛️ Project Directory Structure

```text
roomly-project/
├── src/                               # React Frontend (Vite + TailwindCSS)
│   ├── api/
│   │   └── client.ts                  # Axios HTTP client with JWT interceptor
│   ├── components/                    # Reusable UI components
│   │   ├── Navbar.tsx                 # Navigation with notifications & quick switch
│   │   ├── Footer.tsx                 # Footer links & branding
│   │   ├── PropertyCard.tsx           # Rental listing card with price, tags, rooms
│   │   ├── RoommateCard.tsx           # Roommate card with compatibility badge
│   │   ├── PropertyMap.tsx            # Interactive neighborhood map locator
│   │   ├── ScheduleVisitModal.tsx     # Visit request booking modal
│   │   ├── ReportModal.tsx            # Trust & safety reporting modal
│   │   └── CompareFloatingBar.tsx     # Bottom bar for property comparison
│   ├── context/
│   │   ├── AuthContext.tsx            # User authentication state & methods
│   │   └── SocketContext.tsx          # Real-time WebSocket connection
│   ├── pages/                         # 14 Full Application Pages
│   │   ├── HomePage.tsx               # Hero search, curated listings, testimonials
│   │   ├── PropertiesPage.tsx         # Discovery feed with multi-criteria filters
│   │   ├── PropertyDetailPage.tsx     # Photos, room breakdown, amenities, visit booking
│   │   ├── RoommatesPage.tsx          # Compatibility scoring feed
│   │   ├── ComparePage.tsx            # Side-by-side comparison matrix (up to 4 homes)
│   │   ├── FinancialCalculatorPage.tsx# Fair rent split by room area & amenities
│   │   ├── ChatPage.tsx               # Real-time messaging with landlords & flatmates
│   │   ├── VisitsPage.tsx             # Scheduled property tour manager
│   │   ├── AddPropertyPage.tsx        # Multi-step listing wizard for landlords
│   │   ├── LandlordDashboardPage.tsx  # Inquiries, listings, and visit management
│   │   ├── TenantDashboardPage.tsx    # Saved properties, matches, and visits
│   │   ├── AdminDashboardPage.tsx     # Platform analytics, reports, and verifications
│   │   ├── LoginPage.tsx              # Clean login with demo persona buttons
│   │   └── RegisterPage.tsx           # Multi-role registration (Tenant / Landlord)
│   ├── types/
│   │   └── index.ts                   # Unified TypeScript interfaces
│   ├── App.tsx                        # Client routing & ProtectedRoute wrapper
│   ├── index.css                      # Modern CSS styling & glassmorphism
│   └── main.tsx                       # React root entrypoint
│
├── server/                            # Express Backend & Prisma ORM
│   ├── prisma/
│   │   └── contract.prisma            # 16-model PostgreSQL database schema
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts                # JWT authentication & role-based guards
│   │   ├── prisma/
│   │   │   ├── client.ts              # PrismaClient singleton with PrismaPg adapter
│   │   │   └── seed.ts                # Realistic Bangalore database seeder
│   │   ├── routes/
│   │   │   ├── auth.routes.ts         # Register, login, me, profile, roommate habits
│   │   │   ├── property.routes.ts     # Properties discovery, CRUD, reviews, favorites
│   │   │   ├── roommate.routes.ts     # Roommate matching feed & profile details
│   │   │   ├── visit.routes.ts        # Visit requests & status transitions
│   │   │   ├── chat.routes.ts         # Conversation & message endpoints
│   │   │   ├── notification.routes.ts # Alert notifications
│   │   │   ├── admin.routes.ts        # Analytics, verifications & reports
│   │   │   └── report.routes.ts       # User safety violation reports
│   │   ├── services/
│   │   │   └── matchingEngine.ts      # 4-factor compatibility scoring engine
│   │   ├── socket/
│   │   │   └── index.ts               # Socket.IO real-time chat & notifications
│   │   ├── app.ts                     # Express application configuration
│   │   └── server.ts                  # Server entrypoint with HTTP + Socket.IO
│   ├── .env                           # Server environment variables
│   ├── prisma.config.ts               # Prisma 7 configuration file
│   └── package.json                   # Backend dependencies
│
├── docker-compose.yml                 # PostgreSQL 17 container definition
├── package.json                       # Monorepo root scripts & dependencies
├── test_app.cjs                       # Automated integration test runner
└── README.md                          # Documentation
```

---

## 🧠 How to Explain This Project in Interviews (Dead Simple!)

### 1. Database Architecture (Prisma 7 + PostgreSQL 17)
- We modeled **16 relational entities** in `server/prisma/contract.prisma`:
  - `User`, `RoommateProfile`, `Match`, `Property`, `Room`, `Amenity`, `PropertyAmenity`, `PropertyImage`, `Favorite`, `VisitRequest`, `Conversation`, `Message`, `Notification`, `Report`, `Review`, `VerificationRecord`.
- Uses **Prisma 7** with the `@prisma/adapter-pg` driver adapter and connection pooling for PostgreSQL 17.
- Local PostgreSQL runs containerized in Docker with a named persistent volume (`roomly_roomly_postgres_data`), ensuring zero data loss across container restarts.

### 2. Roommate Compatibility Algorithm (`server/src/services/matchingEngine.ts`)
Instead of a simple keyword search, we evaluate compatibility using a **weighted 4-factor scoring model** (0 to 100%):
1. **Budget Overlap (25%)**: Calculates overlapping range between `[min, max]` budgets.
2. **Location Alignment (25%)**: Compares preferred city and shared neighborhood tags (e.g. Koramangala, Indiranagar).
3. **Lifestyle Vector (30%)**: Matches sleep rhythm (Early Bird vs Night Owl), cleanliness standard (1-5 scale), guest frequency, and social tolerance.
4. **Habits & Vices (20%)**: Compares smoking rules (Smoke-free vs Outside-only), pet preferences, and dietary restrictions (Veg, Non-Veg, Vegan).

*Each calculation returns an overall percentage score, a category breakdown, and human-readable explanation tags (e.g., `✓ Synchronized sleep cycle`, `⚠ Differing smoking rules`).*

### 3. Real-Time Communication (`Socket.IO`)
- When a user logs in, their client automatically joins their personal room (`user_<userId>`).
- When a chat is opened, the user joins that specific conversation room (`conv_<conversationId>`).
- When a message is sent:
  1. The message is persisted in PostgreSQL via Prisma.
  2. The message is broadcast to the conversation room instantly.
  3. A notification event is emitted to the recipient's personal room.

### 4. Financial Rent-Split Calculator
- In a shared 2BHK/3BHK apartment, rooms aren't equal. Roomly includes an interactive calculator that fairly balances:
  - Base square footage
  - Private attached washroom (+15-20% premium)
  - Attached balcony (+5-10% premium)
  - Equal split of utilities (Wi-Fi, electricity, housekeeping).

---

## 🔒 Security & Best Practices
- **Password Hashing**: Passwords hashed using `bcryptjs` with salt rounds = 10.
- **Stateless Authentication**: Signed JSON Web Tokens (JWT) with user ID and role claims.
- **Role-Based Access Control (RBAC)**: Distinct authorization checks for `TENANT`, `LANDLORD`, and `ADMIN`.
- **Injection Protection**: Parameterized SQL queries executed safely via Prisma ORM.
- **Environment Isolation**: Database URLs and secrets stored strictly in `.env`.
