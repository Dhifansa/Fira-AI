# FIRA — Initial Workspace & Integration Audit Report

## 1. Executive Summary

Audit menyeluruh telah dilakukan terhadap repository **FIRA (Financial Intelligence & Recommendation Assistant)** yang terdiri dari dua layanan terpisah: **Backend** (`backend/`, Node.js + Express.js + PostgreSQL) dan **Frontend** (`fira-frontend/`, Next.js App Router + TypeScript).

**Kesimpulan Utama Kesiapan Integrasi:**
1. **Backend CRUD Inti Sudah Fungsional:** Backend telah mengimplementasikan 22 endpoint bisnis (+ 2 endpoint sistem) yang mencakup **Authentication, Categories, Transactions, Budgets, dan Financial Goals** lengkap dengan autentikasi JWT (`Bearer`), validasi input, dan isolasi kepemilikan data per pengguna (`user_id`).
2. **Frontend Sebelumnya Masih Berupa Mock/Static UI:** Seluruh 10 halaman di `fira-frontend` sudah memiliki tampilan UI lengkap sesuai desain Figma, tetapi belum terhubung ke `apiRequest()` dari `src/lib/api.ts`. Form login dan register masih dalam keadaan `disabled`.
3. **Blocker Kritis pada Komunikasi & Kontrak Data:** Terdapat ketidakcocokan konfigurasi CORS (`credentials: 'include'` di frontend tanpa `credentials: true` di backend), ketiadaan pengiriman header `Authorization: Bearer <token>` di helper API frontend, ketidakseragaman struktur pembungkus `data` antar-controller backend, perbedaan tipe/nama field (`id` vs `transaction_id`, `'INCOME'` vs `'income'`, `number` vs `NUMERIC string`), serta belum adanya mekanisme *seeding* kategori (`categories`) bagi pengguna baru.
4. **Kesenjangan Fitur AI & Skema Database:** Empat halaman fitur AI di frontend (*Smart Auditor*, *Financial Twin*, *What-If Simulator*, *Financial Weather*) belum memiliki endpoint khusus di backend sehingga metriknya perlu disinkronkan dari data transaksi, anggaran, dan target finansial aktual pengguna. Selain itu, tabel `financial_goals` di database belum memiliki kolom untuk menyimpan progres dana terkumpul (`current_amount`).

---

## 2. Repository Structure

Repository menggunakan arsitektur *monorepo* sederhana yang memisahkan folder `backend` dan `fira-frontend`:

```text
FIRA-AI/
├── konteks.md
├── docs/
│   └── INTEGRATION-AUDIT.md                  # Laporan audit integrasi
├── backend/                                  # Service Backend (Node.js + Express 5)
│   ├── .env                                  # Konfigurasi environment aktif (rahasia)
│   ├── .env.example                          # Template variabel environment backend
│   ├── .gitignore
│   ├── app.js                                # Konfigurasi Express, CORS, dan registrasi route
│   ├── server.js                             # Entry point runtime server & koneksi pool DB
│   ├── fira.sql                              # Skema DDL PostgreSQL (5 tabel & 5 indeks)
│   ├── package.json                          # Dependency backend (CommonJS)
│   ├── config/
│   │   └── database.js                       # Konfigurasi pg.Pool PostgreSQL
│   ├── middleware/
│   │   └── authMiddleware.js                 # Verifikasi JWT Bearer Token
│   ├── routes/                               # Definisi route Express (5 file)
│   ├── controllers/                          # Handler HTTP request/response (5 file)
│   ├── services/                             # Business logic & validasi (5 file)
│   ├── repositories/                         # Data access layer / SQL query (4 file)
│   └── utils/                                # Direktori utilitas
└── fira-frontend/                            # Service Frontend (Next.js App Router + TS)
    ├── .env.example                          # Template env (NEXT_PUBLIC_API_BASE_URL)
    ├── .env.local                            # Konfigurasi environment lokal frontend
    ├── .gitignore
    ├── next.config.ts                        # Konfigurasi Next.js
    ├── package.json                          # Dependency frontend
    ├── tsconfig.json                         # Konfigurasi TypeScript
    └── src/
        ├── app/
        │   ├── globals.css                   # Styling global custom CSS
        │   ├── layout.tsx                    # Root layout HTML
        │   ├── (auth)/                       # Route group autentikasi (/login, /register)
        │   └── (dashboard)/                  # Route group aplikasi utama (8 halaman)
        ├── components/
        │   ├── app-shell.tsx                 # Wrapper layout utama (Sidebar + Topbar)
        │   ├── sidebar.tsx                   # Navigasi sidebar
        │   ├── page-heading.tsx              # Header reusable halaman
        │   └── modals/
        │       └── AddTransactionModals.tsx  # Modal tambah transaksi
        ├── lib/
        │   ├── api.ts                        # Fetch wrapper terpusat (apiRequest)
        │   └── format.ts                     # Formatter Rupiah & Tanggal
        └── types/
            └── index.ts                      # Definisi interface TypeScript
```

### Temuan Konfigurasi & Dependency
- **Entry Point:**
  - Backend: `backend/server.js` (dijalankan melalui `npm run dev` / `npm start`).
  - Frontend: `fira-frontend/src/app/layout.tsx` dengan halaman utama di `fira-frontend/src/app/(dashboard)/page.tsx`.
- **Package & Dependencies:**
  - Backend (`backend/package.json`): `express` (`^5.3.0`), `pg` (`^8.23.1`), `bcryptjs` (`^3.0.3`), `jsonwebtoken` (`^9.0.3`), `cors` (`^2.8.6`), `dotenv` (`^18.0.10`), dev: `nodemon` (`^3.1.14`).
  - Frontend (`fira-frontend/package.json`): `next` (`latest`), `react` (`latest`), `react-dom` (`latest`), `lucide-react` (`^0.468.0`), `typescript` (`^5.7.2`).
- **Konfigurasi Environment:**
  - Backend menggunakan `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`.
  - Frontend menggunakan `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`.

---

## 3. Frontend Architecture

### Halaman & Fitur yang Tersedia
| Route | File | Status Awal | Keterangan Fitur |
| :--- | :--- | :--- | :--- |
| `/login` | `src/app/(auth)/login/page.tsx` | Statis | Form email & password. |
| `/register` | `src/app/(auth)/register/page.tsx` | Statis | Form nama, email & password. |
| `/` | `src/app/(dashboard)/page.tsx` | Hardcoded Mock | Ringkasan pemasukan/pengeluaran/arus kas, cuplikan Weather & AI Insights, grafik mingguan, distribusi kategori, transaksi terakhir, tombol buka `AddTransactionModal`. |
| `/transactions` | `src/app/(dashboard)/transactions/page.tsx` | Hardcoded Mock | Ringkasan total pemasukan/pengeluaran, input pencarian & filter, tabel transaksi, pagination, serta slide-over modal tambah/edit transaksi. |
| `/budgeting` | `src/app/(dashboard)/budgeting/page.tsx` | Hardcoded Mock | 4 kartu metrik anggaran, banner AI Adaptive Budget Insight, filter tab status, kartu anggaran kategori, dan form konfigurator anggaran baru. |
| `/financial-goals` | `src/app/(dashboard)/financial-goals/page.tsx` | Hardcoded Mock | 4 kartu metrik target, banner rekomendasi akselerasi AI, kartu detail goal dengan progres dana terkumpul, dan kalkulator rencana setoran. |
| `/smart-auditor` | `src/app/(dashboard)/smart-auditor/page.tsx` | Hardcoded Mock | Skor efisiensi, deteksi anomali lonjakan belanja, audit langganan berulang, rekomendasi *quick wins*. |
| `/financial-twin` | `src/app/(dashboard)/financial-twin/page.tsx` | Hardcoded + Simulasi Lokal | Profil arketipe finansial, kebiasaan belanja, dan antarmuka chat interaktif. |
| `/what-if-simulator` | `src/app/(dashboard)/what-if-simulator/page.tsx` | Hardcoded Mock | Preset skenario, form parameter simulasi cicilan/tunai, proyeksi dampak indikator, dan matriks perbandingan 3 skenario. |
| `/financial-weather` | `src/app/(dashboard)/financial-weather/page.tsx` | Hardcoded Mock | Skor cuaca finansial, 4 barometer ketahanan, spektrum zona cuaca, dan prakiraan 3 bulan ke depan. |

---

## 4. Backend Architecture

Backend menerapkan arsitektur berlapis (*Layered Architecture*):
1. **Entry & App Layer** (`server.js`, `app.js`): Menginisialisasi Express 5, middleware `cors` dan `express.json()`, health check `/health`, mounting 5 router di bawah `/api/*`, fallback 404, serta error-handling middleware.
2. **Middleware Layer** (`authMiddleware.js`): Memvalidasi header `Authorization: Bearer <token>` dengan `jwt.verify(token, process.env.JWT_SECRET)` dan menyematkan `req.user = { user_id: decoded.user_id }`.
3. **Controller Layer (`controllers/`)**: Menerima request HTTP dan mengembalikan response JSON.
4. **Service Layer (`services/`)**: Menjalankan logika bisnis dan validasi domain (format tanggal `YYYY-MM-DD`, validasi desimal `NUMERIC(18,2)`, pencocokan tipe kategori `income`/`expense`).
5. **Repository Layer (`repositories/`)**: Menjalankan parameterized SQL query (`$1, $2, ...`) ke PostgreSQL melalui `pg.Pool`.

---

## 5. Database Overview

Database menggunakan **PostgreSQL** dengan koneksi pool native (`pg` di `backend/config/database.js`) tanpa ORM. Definisi skema tersimpan di `backend/fira.sql`:

1. **`users`**: `user_id` (UUID PK), `name`, `email` (UNIQUE), `password_hash`, `created_at`, `updated_at`.
2. **`categories`**: `category_id` (UUID PK), `user_id` (FK -> `users`), `name`, `type` (`'income' | 'expense'`), `created_at`. Memiliki composite unique `(category_id, user_id)` dan `(user_id, name, type)`.
3. **`transactions`**: `transaction_id` (UUID PK), `user_id` (FK -> `users`), `category_id`, `type` (`'income' | 'expense'`), `amount` (`NUMERIC(18,2)` > 0), `description`, `transaction_date` (`DATE`), `created_at`, `updated_at`. Memiliki composite FK `(category_id, user_id)` ke `categories`.
4. **`budgets`**: `budget_id` (UUID PK), `user_id` (FK -> `users`), `category_id`, `amount` (`NUMERIC(18,2)` > 0), `start_date` (`DATE`), `end_date` (`DATE`), `created_at`. Memiliki composite FK `(category_id, user_id)` ke `categories`.
5. **`financial_goals`**: `financial_goal_id` (UUID PK), `user_id` (FK -> `users`), `name`, `target_amount` (`NUMERIC(18,2)` > 0), `start_date` (`DATE`), `end_date` (`DATE`), `status` (`'active' | 'completed' | 'cancelled'`), `created_at`.

---

## 6. API Endpoint Inventory

| No | Method | Route | Auth | Controller & Handler | Request Body / Params | Struktur Response Sukses (`200`/`201`) |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | Publik | `app.js` | - | `{ success, application, message, version }` |
| 2 | `GET` | `/health` | Publik | `app.js` | - | `{ success, message, database: { connected, name, server_time } }` |
| 3 | `POST` | `/api/auth/register` | Publik | `authController.register` | `{ name, email, password }` (min 8 karakter) | `{ success: true, message, data: { user, token } }` |
| 4 | `POST` | `/api/auth/login` | Publik | `authController.login` | `{ email, password }` | `{ success: true, message, data: { user, token } }` |
| 5 | `GET` | `/api/auth/me` | Bearer JWT | `authController.getMe` | - | `{ success: true, message, data: { user } }` |
| 6 | `GET` | `/api/categories` | Bearer JWT | `categoryController.getAll` | - | `{ success: true, data: { categories: [...] } }` |
| 7 | `POST` | `/api/categories` | Bearer JWT | `categoryController.create` | `{ name, type }` (`income`\|`expense`) | `{ success: true, data: { category } }` |
| 8 | `PATCH` | `/api/categories/:id` | Bearer JWT | `categoryController.update` | `{ name?, type? }` | `{ success: true, data: { category } }` |
| 9 | `DELETE` | `/api/categories/:id` | Bearer JWT | `categoryController.delete` | Param `:id` (UUID) | `{ success: true, message }` |
| 10 | `GET` | `/api/transactions` | Bearer JWT | `transactionController.getAll` | - | `{ success: true, data: { transactions: [...] } }` |
| 11 | `GET` | `/api/transactions/:id` | Bearer JWT | `transactionController.getById` | Param `:id` (UUID) | `{ success: true, data: { transaction } }` |
| 12 | `POST` | `/api/transactions` | Bearer JWT | `transactionController.create` | `{ category_id, type, amount, transaction_date, description? }` | `{ success: true, message, data: { transaction } }` |
| 13 | `PATCH` | `/api/transactions/:id` | Bearer JWT | `transactionController.update` | `{ category_id?, type?, amount?, transaction_date?, description? }` | `{ success: true, message, data: { transaction } }` |
| 14 | `DELETE` | `/api/transactions/:id` | Bearer JWT | `transactionController.delete` | Param `:id` (UUID) | `{ success: true, message }` |
| 15 | `GET` | `/api/budgets` | Bearer JWT | `budgetController.getAll` | - | `{ success: true, message, data: [...] }` |
| 16 | `GET` | `/api/budgets/:id` | Bearer JWT | `budgetController.getById` | Param `:id` (UUID) | `{ success: true, message, data: { ... } }` |
| 17 | `POST` | `/api/budgets` | Bearer JWT | `budgetController.create` | `{ category_id, amount, start_date, end_date }` | `{ success: true, message, data: { ... } }` |
| 18 | `PUT` | `/api/budgets/:id` | Bearer JWT | `budgetController.update` | `{ category_id?, amount?, start_date?, end_date? }` | `{ success: true, message, data: { ... } }` |
| 19 | `DELETE` | `/api/budgets/:id` | Bearer JWT | `budgetController.delete` | Param `:id` (UUID) | `{ success: true, message }` |
| 20 | `GET` | `/api/financial-goals` | Bearer JWT | `getFinancialGoals` | - | `{ success: true, message, data: [...] }` |
| 21 | `GET` | `/api/financial-goals/:id` | Bearer JWT | `getFinancialGoalById` | Param `:id` (UUID) | `{ success: true, message, data: { ... } }` |
| 22 | `POST` | `/api/financial-goals` | Bearer JWT | `createFinancialGoal` | `{ name, target_amount, start_date, end_date, status? }` | `{ success: true, message, data: { ... } }` |
| 23 | `PUT` | `/api/financial-goals/:id` | Bearer JWT | `updateFinancialGoal` | `{ name?, target_amount?, start_date?, end_date?, status? }` | `{ success: true, message, data: { ... } }` |
| 24 | `DELETE` | `/api/financial-goals/:id` | Bearer JWT | `deleteFinancialGoal` | Param `:id` (UUID) | `{ success: true, message, data: { financial_goal_id } }` |

---

## 7. Frontend API Request Inventory

- **Helper Terpusat:** `apiRequest<T>(path: string, init: RequestInit = {})` di `src/lib/api.ts`.
- **Pemanggilan API per Modul:**
  1. **Auth (`/login`, `/register`, `Sidebar`):** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`.
  2. **Categories:** `GET /categories`, `POST /categories`.
  3. **Transactions (`/`, `/transactions`):** `GET /transactions`, `POST /transactions`, `PATCH /transactions/:id`, `DELETE /transactions/:id`.
  4. **Budgets (`/budgeting`):** `GET /budgets`, `POST /budgets`, `PUT /budgets/:id`, `DELETE /budgets/:id`.
  5. **Financial Goals (`/financial-goals`):** `GET /financial-goals`, `POST /financial-goals`, `PUT /financial-goals/:id`, `DELETE /financial-goals/:id`.

---

## 8. API Compatibility Matrix

| Aspek / Fitur | Kondisi Awal Frontend | Implementasi Backend | Resolusi Integrasi |
| :--- | :--- | :--- | :--- |
| **Base URL** | `.env.local` belum tersedia | `http://localhost:5000/api` | Buat `fira-frontend/.env.local` |
| **CORS & Credentials** | `credentials: 'include'` di `api.ts` | `cors({ origin })` tanpa `credentials: true` | Tambahkan `credentials: true` pada `cors()` di `backend/app.js` |
| **Auth Header** | Tidak mengirim header `Authorization` | Wajib `Authorization: Bearer <token>` | Sisipkan header `Authorization` otomatis dari `localStorage` di `api.ts` |
| **Response Wrapper `data`** | Mengasumsikan satu bentuk `data` | `/categories` & `/transactions` membungkus dalam objek; `/budgets` & `/financial-goals` berupa array | Sediakan fungsi client spesifik di `src/lib/api.ts` yang menormalisasi payload |
| **Tipe & Field `Transaction`** | `{ id, type: 'INCOME'\|'EXPENSE', amount: number, category, date }` | `{ transaction_id, category_id, category_name, type: 'income'\|'expense', amount: string, transaction_date }` | Selaraskan tipe di `src/types/index.ts` dan mapper di `src/lib/api.ts` |
| **Kategori Default User Baru** | Dropdown berisi nama kategori statis | Tabel `categories` kosong untuk user baru | Seed kategori default otomatis saat user belum memiliki kategori |

---

## 9. Authentication & Security Findings

1. **JWT Bearer Authentication:** Token di-sign menggunakan `process.env.JWT_SECRET` dengan masa berlaku `JWT_EXPIRES_IN` (default `1d`).
2. **Isolasi Kepemilikan Data (Ownership Enforcement):** Seluruh query SQL memfilter berdasarkan `user_id` dari payload JWT yang terverifikasi, ditambah constraint composite foreign key `(category_id, user_id)` di PostgreSQL.
3. **Validasi Input & Proteksi SQL Injection:** Seluruh query menggunakan parameterized query (`$1, $2`). Validasi tipe string pada `authService`, validasi UUID pada `budgetService`, dan global error handler di `app.js` mencegah kebocoran stack trace atau crash akibat input tidak valid.

---

## 10. Integration Issues

- **CRITICAL:**
  - `[CRIT-01]` Konflik CORS `credentials: 'include'` vs `cors()` backend.
  - `[CRIT-02]` Ketiadaan pengiriman header `Authorization: Bearer <token>` di `src/lib/api.ts`.
  - `[CRIT-03]` Ketiadaan global error-handling middleware di `backend/app.js` untuk menangkap `next(error)` dari `budgetController.js`.
  - `[CRIT-04]` File `fira-frontend/.env.local` belum dibuat.
- **HIGH:**
  - `[HIGH-01]` Form `/login` dan `/register` masih statis dan tombol submit `disabled`.
  - `[HIGH-02]` User baru tidak memiliki data di tabel `categories` sehingga tidak dapat membuat transaksi atau budget.
  - `[HIGH-03]` Perbedaan struktur tipe `Transaction` antara frontend dan backend.
  - `[HIGH-04]` Halaman `/`, `/transactions`, `/budgeting`, dan `/financial-goals` masih menggunakan data hardcoded.
- **MEDIUM:**
  - `[MED-01]` Tabel `financial_goals` tidak memiliki kolom `current_amount`.
  - `[MED-02]` Struktur `data` antara `/transactions`, `/categories` (objek) dan `/budgets`, `/financial-goals` (array) berbeda.
  - `[MED-03]` `AddTransactionModals.tsx` menggunakan class Tailwind CSS yang tidak terinstal.
  - `[MED-04]` `POST` dan `PATCH` `/api/transactions` belum menyertakan `category_name` pada response.
  - `[MED-05]` Halaman fitur AI (`/smart-auditor`, `/financial-twin`, `/what-if-simulator`, `/financial-weather`) perlu disinkronkan dengan data finansial aktual user.
- **LOW:**
  - `[LOW-01]` `POST /api/auth/register` belum langsung mengembalikan JWT `token`.
  - `[LOW-02]` `backend/.env.example` belum tersedia.

---

## 11. Prioritized Integration Plan

1. **Fase 1:** Perbaikan CORS, Global Error Middleware, normalisasi `transactionService` (`category_name`), pembuatan `.env.local` & `.env.example`, serta pembaruan `src/types/index.ts` dan `src/lib/api.ts`.
2. **Fase 2:** Integrasi halaman `/login`, `/register`, profil user di `Sidebar` (`GET /api/auth/me`), dan fungsi Logout.
3. **Fase 3:** Auto-seeding kategori default pada `categoryService` / `authService` agar setiap user memiliki kategori pemasukan dan pengeluaran standar.
4. **Fase 4:** Perbaikan `AddTransactionModals.tsx` dan integrasi penuh CRUD Transaksi di `/transactions` dan `/`.
5. **Fase 5:** Integrasi penuh CRUD Budgeting dan kalkulasi realisasi `spent` di `/budgeting`.
6. **Fase 6:** Integrasi penuh CRUD Financial Goals di `/financial-goals` dan ringkasan metrik riil di Dashboard (`/`).
7. **Fase 7:** Sinkronisasi metrik finansial riil ke halaman AI Intelligence (`/smart-auditor`, `/financial-twin`, `/what-if-simulator`, `/financial-weather`).

---

## 12. Recommended Testing Strategy

1. **Database & Health Check:** Uji `GET /health` memastikan koneksi PostgreSQL aktif.
2. **End-to-End API Flow:** Uji Register -> Login -> Get Profile -> Get Auto-Seeded Categories -> Create/Update/Delete Transaction -> Create/Update/Delete Budget (verifikasi kalkulasi `spent`) -> Create/Update/Delete Financial Goal.
3. **Frontend Build & Type Verification:** Jalankan `npm run typecheck`, `npm run lint`, dan `npm run build` pada `fira-frontend` untuk memastikan 0 error kompilasi maupun tipe data.

