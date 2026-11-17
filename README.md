# FIRA Frontend

Frontend bersama untuk **FIRA — Financial Intelligence & Recommendation Assistant**. Dibangun dengan Next.js App Router dan TypeScript.

## 1. Prasyarat
- Node.js versi LTS yang kompatibel dengan versi Next.js yang terpasang.
- npm.
- Backend Express.js berjalan terpisah jika ingin mengaktifkan integrasi API.

## 2. Menjalankan project

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000.

Untuk memeriksa project:

```bash
npm run typecheck
npm run lint
npm run build
```

## 3. Environment

Isi `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Ganti URL sesuai alamat backend tim. Jangan menaruh database credential atau API key AI di environment frontend. Variabel `NEXT_PUBLIC_*` dapat terekspos ke browser.

## 4. Struktur folder

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── auditor/
│   │   ├── budgeting/
│   │   ├── financial-twin/
│   │   ├── goals/
│   │   ├── simulator/
│   │   ├── transactions/
│   │   ├── weather/
│   │   └── layout.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
├── lib/
│   ├── api.ts
│   └── format.ts
└── types/
```

## 5. Batas tanggung jawab
- Next.js hanya menangani UI, interaksi, state tampilan, dan request REST API.
- Frontend tidak mengakses PostgreSQL secara langsung.
- Kalkulasi saldo/arus kas, realisasi anggaran, progres goal, simulasi, dan indikator Financial Weather tetap dikerjakan backend.
- AI key/provider dan prompt tidak disimpan di frontend.
- Data yang saat ini tampil di dashboard, transaksi, budgeting, dan goal adalah **mock/demo**, bukan data nyata.

## 6. API integration

Gunakan helper `apiRequest<T>()` dari `src/lib/api.ts` untuk request ke backend. Bentuk response sementara diasumsikan:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Ini hanya asumsi awal untuk scaffold. Sesuaikan helper dan tipe setelah API contract Express disepakati. Metode autentikasi, bentuk token/session, endpoint, pagination, dan format error belum ditentukan dalam konteks/PRD.

## 7. Pembagian kerja frontend
- **Dida:** fondasi project, app shell, autentikasi UI, dashboard, transaksi, reusable UI, dan integrasi API.
- **Hapis:** UI Smart Auditor, Financial Twin, What-If Simulator, Financial Weather, dan visualisasi data.
- Keduanya bekerja pada repository dan aplikasi Next.js yang sama.

## 8. Catatan keputusan sementara
- App Router + TypeScript dipilih sebagai default implementasi Next.js.
- CSS biasa digunakan untuk fondasi visual agar tidak mengunci tim ke library UI yang belum disepakati.
- `lucide-react` digunakan untuk ikon.
- Data halaman masih mock; tombol/form yang memerlukan backend sengaja belum aktif.
- Scope MVP, metode autentikasi, API contract, provider AI, dan target deployment masih perlu keputusan tim.
