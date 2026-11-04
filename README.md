# Forge Fitness

A gym management web application built for **PRT362S Applications Development Practice** at the Cape Peninsula University of Technology (2026), by **Group WO3**.

**Live site:** https://project-3-website.vercel.app

Forge Fitness replaces a community gym's manual processes with one web platform. Visitors can browse gym information, trainers, courses and membership packages. Members can sign up, enrol in courses, follow training plans and buy a membership package. Trainers and administrators manage the gym's data from their own dashboards.

---

## Group members

| Name | Student number |
|---|---|
| Adriaan van der Westhuizen (Group leader) | 240436415 |
| Anas Pansari | 230195342 |
| Dayyaan Francis | 222277343 |
| Imaad Petersen | 230166040 |
| Jaden Abrahams | 222206721 |
| Raul Ja'aim Everts | 230270565 |

---

## Features

| Area | What it does |
|---|---|
| Sign up / log in | Email and password accounts through Supabase Auth, with role-based access |
| Profile | Personal details, enrolled courses and purchase history |
| Home and About | Gym overview, featured packages and trainers |
| Trainers | Trainer profiles with bios, ratings and skills |
| Courses and My Bookings | Browse courses, enrol, and manage enrolments |
| Training plans | Structured plans broken into days and exercises |
| Packages and Billing | Basic, Premium and Elite Athlete memberships with student rates, student verification requests, and checkout by card or digital wallet (mock payment, recorded as a transaction) |
| Contact | Enquiry form; messages go to the Admin Dashboard |
| Trainer Dashboard | A trainer's own courses and enrolled members |
| Admin Dashboard | Manage users, courses, trainers, packages, enrolments, transactions, messages and student verification |

### User roles

| Role | Access |
|---|---|
| Visitor | Public pages: Home, About, Courses, Trainers, Packages, Training Plans, Contact |
| Member | Default role after sign-up. Adds Profile, enrolment, My Bookings, student verification and Billing |
| Trainer | Member access plus the Trainer Dashboard |
| Admin | Everything, including the Admin Dashboard |

Roles are stored in the `role` column of the `profiles` table.

---

## Tech stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | User interface |
| React Router DOM | 7.18 | Client-side routing |
| Vite | 7.3 | Development server and build tool |
| @supabase/supabase-js | 2.116 | Database and authentication client |
| Supabase (PostgreSQL) | Cloud | Database, authentication, row-level security |
| CSS3 (Inter font) | – | Global theme (`src/styles/global.css`) plus one stylesheet per page |
| ESLint | 9.39 | Linting |
| Vercel | – | Hosting |

---

## Project structure

```
project_3_Gym_Website/
├── index.html              Entry HTML page
├── package.json            Dependencies and npm scripts
├── vite.config.js          Vite configuration
├── vercel.json             Rewrites all routes to index.html (needed for React Router on Vercel)
├── schema.sql              Database schema (all tables)
├── .env.example            Template for the required environment variables
└── src/
    ├── main.jsx            Mounts the app inside BrowserRouter
    ├── App.jsx             Layout (navbar, footer) and all routes
    ├── components/
    │   └── ProtectedRoute.jsx   Login and role checks for protected pages
    ├── context/
    │   └── AuthContext.jsx      Session, profile and sign up / log in / log out
    ├── pages/              One component per page
    ├── styles/             global.css (theme) + one CSS file per page
    └── supabase/
        └── client.js       Shared Supabase client
```

### Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home | Everyone |
| `/about` | About | Everyone |
| `/courses` | Courses | Everyone (login needed to enrol) |
| `/trainers` | Trainers | Everyone |
| `/packages` | Packages | Everyone (login needed to choose a plan) |
| `/contact` | Contact | Everyone |
| `/login`, `/signup` | Login, Signup | Everyone |
| `/training-plans` | Training Plans | Everyone |
| `/profile` | Profile | Logged-in users |
| `/billing` | Billing | Logged-in users, after choosing a package |
| `/my-bookings` | My Bookings | Members |
| `/trainer-dashboard` | Trainer Dashboard | Trainers and admins |
| `/admin-dashboard` | Admin Dashboard | Admins |

---

## Running it locally

### Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 7)
- npm 10+
- A Supabase project (free tier is fine)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of `schema.sql` and run it.
3. Add some starting data, at least the packages:

   ```sql
   INSERT INTO public.packages (name, price_regular, price_student) VALUES
     ('Basic', 399, 299), ('Premium', 599, 399), ('Elite Athlete', 999, 699);
   ```

4. Enable row-level security on the tables and add policies (Authentication → Policies).

### 3. Add environment variables

Copy `.env.example` to `.env` and fill in your Supabase details (Supabase → Project Settings → API):

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env`.

### 4. Start the app

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### 5. Create an admin

Sign up through the app, then in Supabase → Table Editor → `profiles`, change your user's `role` to `admin`. Trainers are set the same way, with `trainer`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the production version into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |

---

## Deployment

The live site is hosted on Vercel and deploys automatically from the `dev` branch.

- **Root directory:** `2026/project_3_Gym_Website`
- **Framework preset:** Vite (build: `npm run build`, output: `dist`)
- **Environment variables:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Routing:** `vercel.json` rewrites every path to `index.html`, so pages like `/packages` work when refreshed
- **Supabase:** the live URL is set as the Site URL under Authentication → URL Configuration

---

## Known limitations

- Payments are simulated. No real payment gateway is connected and card details are never stored.
- Digital Wallet is a placeholder that records the purchase without redirecting to a provider.
- Student verification is approved manually by an admin; no proof of registration is uploaded.
