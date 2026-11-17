"use client";

import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  CloudSun,
  ShoppingCart,
  Briefcase,
  Zap,
  Car
} from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      {/* 1. Header Banner Kondisi Finansial */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">PRO v1.0 Core MVP</span>
            <span>Pembaruan otomatis 5 menit lalu</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>Kondisi Finansial Bulan Ini</h1>
          <p className="muted">
            Analisis real-time arus kas, rasio kesehatan tabungan, dan deteksi anomali FIRA AI.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Bulan Ini</span>
          </button>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> + Tambah Transaksi
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (3 Kolom Bersebelahan) */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "20px" }}>
        {/* Total Pemasukan */}
        <div className="card stat-card">
          <div className="stat-top">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowDownLeft size={16} className="positive" />
              <span>TOTAL PEMASUKAN</span>
            </div>
            <span className="pill">+8.5%</span>
          </div>
          <div className="stat-value">Rp 12.850.000</div>
          <div className="stat-foot">Target bulanan: Rp 12.000.000 (107% tercapai)</div>
        </div>

        {/* Total Pengeluaran */}
        <div className="card stat-card">
          <div className="stat-top">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowUpRight size={16} style={{ color: "var(--red)" }} />
              <span>TOTAL PENGELUARAN</span>
            </div>
            <span className="pill warning">-4.2% Hemat</span>
          </div>
          <div className="stat-value">Rp 7.420.000</div>
          <div className="stat-foot">Batas Budget: Rp 8.000.000 (Sisa Rp 580.000)</div>
        </div>

        {/* Arus Kas Bersih */}
        <div className="card stat-card" style={{ background: "var(--green-soft)", borderColor: "var(--mint)" }}>
          <div className="stat-top">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={16} className="positive" />
              <span className="positive" style={{ fontWeight: 700 }}>ARUS KAS BERSIH</span>
            </div>
            <span className="pill">+42.2% Laju Simpan</span>
          </div>
          <div className="stat-value positive">+Rp 5.430.000</div>
          <div className="stat-foot positive">Kesehatan Surplus: Sangat Sehat (+Rp 5.43M)</div>
        </div>
      </div>

      {/* 3. AI Intelligence Widgets (Financial Weather & Highlights) */}
      <div className="grid two-col" style={{ marginBottom: "20px" }}>
        {/* Financial Weather Widget */}
        <div className="card">
          <div className="card-heading">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CloudSun className="positive" size={20} />
              <div>
                <h2>Financial Weather</h2>
                <p>Indeks Stabilitas Keuangan Harian</p>
              </div>
            </div>
            <span className="pill">AMAN</span>
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center", marginTop: "10px" }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              border: "6px solid var(--green)", 
              display: "grid", 
              placeItems: "center", 
              font: "800 24px Manrope",
              color: "var(--green)"
            }}>
              88<span style={{ fontSize: "10px" }}>/100</span>
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Langit Cerah Finansial</strong>
              <p className="muted" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                Rasio tabungan 42.2% & pengeluaran wajib terkendali. Tidak ada anomali risiko tinggi yang terdeteksi di November 2026.
              </p>
            </div>
          </div>
        </div>

        {/* AI Financial Highlights */}
        <div className="card">
          <div className="card-heading">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck className="positive" size={20} />
              <div>
                <h2>AI Financial Highlights</h2>
                <p>Rekomendasi taktis berbasis algoritma cerdas FIRA</p>
              </div>
            </div>
            <span className="pill warning">Smart Auditor</span>
          </div>
          <div className="notice" style={{ marginBottom: "12px" }}>
            <strong>Efisiensi F&B & Penghematan Langganan:</strong>
            <br />
            Pengeluaran Makan & Minum menurun 12% bulan ini, namun terdapat potensi langganan cloud gym/streaming berulang (Rp 189.000/bln) yang belum Anda gunakan dalam 40 hari terakhir.
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary-button" style={{ padding: "7px 12px", fontSize: "11px" }}>Hentikan Langganan</button>
            <button className="secondary-button" style={{ padding: "7px 12px", fontSize: "11px" }}>Abaikan Rekomendasi</button>
          </div>
        </div>
      </div>

      {/* 4. Visualisasi Grafik & Distribusi */}
      <div className="grid two-col" style={{ marginBottom: "20px" }}>
        {/* Visualisasi Pemasukan vs Pengeluaran */}
        <div className="card">
          <div className="card-heading">
            <div>
              <h2>Pemasukan vs Pengeluaran</h2>
              <p>Perbandingan real-time cashflow per minggu (November 2026)</p>
            </div>
          </div>
          <div className="chart">
            <div className="chart-col">
              <div className="bar dark" style={{ height: "70%" }}></div>
              <div className="bar" style={{ height: "40%" }}></div>
              <span className="chart-label">Minggu 1</span>
            </div>
            <div className="chart-col">
              <div className="bar dark" style={{ height: "60%" }}></div>
              <div className="bar" style={{ height: "50%" }}></div>
              <span className="chart-label">Minggu 2</span>
            </div>
            <div className="chart-col">
              <div className="bar dark" style={{ height: "85%" }}></div>
              <div className="bar" style={{ height: "45%" }}></div>
              <span className="chart-label">Minggu 3</span>
            </div>
            <div className="chart-col">
              <div className="bar dark" style={{ height: "65%" }}></div>
              <div className="bar" style={{ height: "55%" }}></div>
              <span className="chart-label">Minggu 4</span>
            </div>
          </div>
          <div className="legend">
            <div><span className="dot"></span> Pemasukan</div>
            <div><span className="dot light"></span> Pengeluaran</div>
          </div>
        </div>

        {/* Distribusi Pengeluaran */}
        <div className="card">
          <div className="card-heading">
            <div>
              <h2>Distribusi Pengeluaran</h2>
              <p>Realisasi 5 kategori pengeluaran utama</p>
            </div>
            <span className="pill">100% Tercatat</span>
          </div>
          <div className="category-list" style={{ marginTop: "10px" }}>
            <div>
              <div className="category-row">
                <span>Kebutuhan Pokok (45%)</span>
                <strong>Rp 3.33M</strong>
              </div>
              <div className="progress"><span style={{ width: "45%" }}></span></div>
            </div>
            <div>
              <div className="category-row">
                <span>Transportasi (18%)</span>
                <strong>Rp 1.33M</strong>
              </div>
              <div className="progress"><span style={{ width: "18%" }}></span></div>
            </div>
            <div>
              <div className="category-row">
                <span>Hiburan & Makan (15%)</span>
                <strong>Rp 1.11M</strong>
              </div>
              <div className="progress"><span style={{ width: "15%" }}></span></div>
            </div>
            <div>
              <div className="category-row">
                <span>Tagihan & Utilitas (12%)</span>
                <strong>Rp 890K</strong>
              </div>
              <div className="progress"><span style={{ width: "12%" }}></span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Tabel Transaksi Terakhir */}
      <div className="card">
        <div className="card-heading">
          <div>
            <h2>Transaksi Terakhir</h2>
            <p>Aktivitas keuangan periode November 2026 yang telah diaudit</p>
          </div>
          <button className="secondary-button" style={{ padding: "6px 12px" }}>Lihat Semua Transaksi</button>
        </div>

        <div className="transaction-list">
          <div className="transaction-row">
            <div className="transaction-icon"><Briefcase size={18} /></div>
            <div className="transaction-info">
              <strong>Gaji Pokok & Tunjangan Kinerja</strong>
              <small>28 Nov 2026 · 09:30 WIB · Penghasilan Tetap</small>
            </div>
            <div className="amount income">+ Rp 10.500.000</div>
          </div>

          <div className="transaction-row">
            <div className="transaction-icon"><ShoppingCart size={18} /></div>
            <div className="transaction-info">
              <strong>Belanja Bulanan Supermarket</strong>
              <small>25 Nov 2026 · 16:15 WIB · Kebutuhan Pokok</small>
            </div>
            <div className="amount expense">- Rp 1.450.000</div>
          </div>

          <div className="transaction-row">
            <div className="transaction-icon"><Zap size={18} /></div>
            <div className="transaction-info">
              <strong>Pembayaran Proyek UI Design</strong>
              <small>24 Nov 2026 · 14:00 WIB · Pendapatan Sampingan</small>
            </div>
            <div className="amount income">+ Rp 2.350.000</div>
          </div>

          <div className="transaction-row">
            <div className="transaction-icon"><Car size={18} /></div>
            <div className="transaction-info">
              <strong>PLN Pascabayar & WiFi Fiber</strong>
              <small>20 Nov 2026 · 08:10 WIB · Tagihan & Utilitas</small>
            </div>
            <div className="amount expense">- Rp 890.000</div>
          </div>
        </div>
      </div>
    </>
  );
}