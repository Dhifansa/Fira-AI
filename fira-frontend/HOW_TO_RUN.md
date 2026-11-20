# 🚀 Panduan Menjalankan Frontend FIRA

## Struktur Proyek
```
fira-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Halaman Autentikasi (Login, Register)
│   │   ├── (dashboard)/        # Halaman Dashboard & Fitur Utama (AppShell)
│   │   │   ├── budgeting/
│   │   │   ├── financial-goals/
│   │   │   ├── financial-twin/
│   │   │   ├── financial-weather/
│   │   │   ├── smart-auditor/
│   │   │   ├── transactions/
│   │   │   ├── what-if-simulator/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Dashboard utama
│   │   ├── globals.css         # Styling global & Figma design system
│   │   └── layout.tsx          # Root HTML layout
│   ├── components/             # Reusable UI components (Sidebar, AppShell, Modal)
│   ├── lib/                    # Helper & API client
│   └── types/                  # TypeScript interface
├── package.json
└── tsconfig.json
```

## Menjalankan Development Server

1. Buka terminal langsung di folder proyek (`fira-frontend`).
2. Instal dependensi (jika belum):
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

---

## Fitur & Navigasi Halaman

- **Dashboard Utama**: `/`
- **Transaksi**: `/transactions`
- **Budgeting**: `/budgeting`
- **Financial Goals**: `/financial-goals`
- **AI Smart Auditor**: `/smart-auditor`
- **AI Financial Twin**: `/financial-twin`
- **What-If Simulator**: `/what-if-simulator`
- **Financial Weather**: `/financial-weather`
- **Login**: `/login`
- **Register**: `/register`

---

## Build untuk Production

```bash
# Build
npm run build

# Start production server
npm run start
```
