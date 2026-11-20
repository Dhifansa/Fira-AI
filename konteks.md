# FIRA — Initial Workspace Audit

Bertindak sebagai Senior Full-Stack Engineer, Software Architect, dan QA Engineer.

Saya sedang mempersiapkan integrasi frontend dan backend aplikasi FIRA (Financial Intelligence & Recommendation Assistant).

## Technology Stack
- Frontend: Next.js
- Backend: Node.js + Express.js
- Database: PostgreSQL
- Communication: REST API dengan JSON
- Architecture: Separate frontend and backend services dalam satu repository.

## Tugas Utama

Lakukan audit menyeluruh terhadap repository yang tersedia.

### 1. Repository Structure
- Identifikasi folder frontend dan backend.
- Identifikasi entry point masing-masing aplikasi.
- Periksa package.json dan dependency.
- Identifikasi konfigurasi environment.
- Identifikasi konfigurasi database.

### 2. Backend Audit
- Daftar seluruh API endpoint yang benar-benar tersedia.
- Identifikasi HTTP method dan route.
- Periksa controller, service, middleware, dan validation.
- Periksa authentication dan authorization.
- Periksa database schema dan migration.
- Identifikasi endpoint yang belum selesai.

### 3. Frontend Audit
- Identifikasi halaman dan fitur yang sudah tersedia.
- Identifikasi seluruh API request.
- Periksa konfigurasi API base URL.
- Periksa authentication flow.
- Periksa state management dan data fetching.
- Identifikasi fitur yang masih menggunakan mock data atau hardcoded data.

### 4. Frontend–Backend Compatibility
Bandingkan setiap API request frontend dengan endpoint backend.

Periksa:
- Endpoint URL.
- HTTP method.
- Request body.
- Query parameters.
- Response structure.
- Authentication headers.
- Error response.
- Data type dan field naming.

Identifikasi seluruh ketidaksesuaian yang berpotensi menyebabkan integrasi gagal.

### 5. Security Audit
Periksa:
- Authentication.
- Authorization dan user ownership.
- CORS.
- Input validation.
- Environment configuration.
- Potensi kebocoran data finansial.
- Penanganan error dan informasi sensitif.

Jangan menampilkan nilai rahasia dari file environment.

### 6. Integration Readiness
Klasifikasikan setiap masalah:
- CRITICAL: menghambat aplikasi berjalan atau menimbulkan risiko keamanan serius.
- HIGH: menghambat fitur utama.
- MEDIUM: menyebabkan sebagian fungsi tidak berjalan.
- LOW: perbaikan minor atau peningkatan kualitas.

Buat rekomendasi urutan integrasi berdasarkan dependency antarf fitur.

## Aturan Wajib

1. Pada tahap ini hanya lakukan audit.
2. Jangan mengubah, membuat ulang, menghapus, atau memindahkan file kode.
3. Jangan melakukan refactoring.
4. Jangan mengubah desain UI.
5. Jangan mengubah database.
6. Jangan menjalankan migration atau operasi database destruktif.
7. Jangan mengasumsikan library database tertentu.
8. Jangan mengasumsikan endpoint yang belum ditemukan dalam kode.
9. Jangan mengganti arsitektur yang sudah ada.
10. Pertahankan seluruh implementasi yang sudah dikerjakan tim.

## Output

Buat laporan `docs/INTEGRATION-AUDIT.md` yang berisi:

1. Executive Summary.
2. Repository Structure.
3. Frontend Architecture.
4. Backend Architecture.
5. Database Overview.
6. API Endpoint Inventory.
7. Frontend API Request Inventory.
8. API Compatibility Matrix.
9. Authentication & Security Findings.
10. Integration Issues.
11. Prioritized Integration Plan.
12. Recommended Testing Strategy.

Jika folder `docs` belum tersedia, laporkan terlebih dahulu dan jangan membuat folder atau file baru.

Setelah audit selesai, tampilkan ringkasan temuan dan tunggu persetujuan saya sebelum melakukan perubahan kode.