# 🚀 Cara Menjalankan Dashboard FIRA

## Path Structure
```
C:\SEMESTER 5\project\fira-frontend\
├── .kiro/
├── fira-frontend/
│   └── fira-frontend/
│       └── fira-frontend/          ← Project sebenarnya ada disini
│           ├── src/
│           ├── package.json
│           └── ...
└── DASHBOARD_IMPLEMENTATION.md
```

## Menjalankan Development Server

### Option 1: Dari lokasi Anda saat ini
Jika Anda berada di `C:\SEMESTER 5\project\fira-frontend\fira-frontend`:

```powershell
cd fira-frontend
npm run dev
```

### Option 2: Dari root workspace
Jika Anda berada di `C:\SEMESTER 5\project\fira-frontend`:

```powershell
cd fira-frontend\fira-frontend\fira-frontend
npm run dev
```

### Option 3: Path langsung
```powershell
cd "C:\SEMESTER 5\project\fira-frontend\fira-frontend\fira-frontend\fira-frontend"
npm run dev
```

## Akses Dashboard

Setelah server berjalan, buka browser dan akses:
```
http://localhost:3000
```

## Troubleshooting

### Error: Cannot find package.json
**Penyebab:** Anda berada di directory yang salah.

**Solusi:** Pastikan Anda berada di directory yang berisi `package.json`:
```powershell
# Cek apakah file package.json ada
ls package.json

# Jika tidak ada, navigasi ke directory yang benar
cd fira-frontend
```

### Error: Port 3000 already in use
**Solusi:** Hentikan proses yang menggunakan port 3000 atau gunakan port lain:
```powershell
# Hentikan proses di port 3000
npx kill-port 3000

# Atau jalankan di port lain
npm run dev -- -p 3001
```

## Build untuk Production

Untuk membuat production build:
```powershell
npm run build
```

Untuk menjalankan production build:
```powershell
npm run start
```

## Commands Lainnya

### Type checking
```powershell
npm run typecheck
```

### Linting
```powershell
npm run lint
```

---

**Note:** Dashboard sudah fully functional dengan:
- ✅ Responsive design
- ✅ Figma design implementation 100%
- ✅ All components working
- ✅ No breaking changes
