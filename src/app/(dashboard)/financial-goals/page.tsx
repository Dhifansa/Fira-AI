"use client";

import { useState } from "react";
import { 
  Target, 
  Sparkles, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Laptop, 
  Plane, 
  GraduationCap, 
  Calculator, 
  CheckCircle2, 
  MoreVertical,
  Zap
} from "lucide-react";

export default function FinancialGoalsPage() {
  const [activeTab, setActiveTab] = useState("Semua Target");

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">AI Goal Engine + P3 Core</span>
            <span>Rancang, pantau, dan capai target finansial strategis</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>Financial Goal Planner</h1>
          <p className="muted">
            Perencanaan target pintar berbasis saran alokasi adaptif dari surplus arus kas harian Anda.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Zap size={14} /> Simulasi Akselerasi AI
          </button>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Buat Target Baru
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Kolom Bersebelahan) */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div className="card stat-card">
          <div className="stat-top">
            <span>TOTAL TARGET AKUMULASI</span>
            <Target size={16} className="positive" />
          </div>
          <div className="stat-value">Rp 145.000.000</div>
          <div className="stat-foot">Terbagi dalam 4 target aktif</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>DANA TERKUMPUL SAAT INI</span>
            <span className="pill">+40.3%</span>
          </div>
          <div className="stat-value positive">Rp 58.450.000</div>
          <div className="stat-foot positive">Progres keseluruhan berjalan cepat</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>KOMITMEN SETORAN BULANAN</span>
            <Calendar size={16} style={{ color: "var(--muted)" }} />
          </div>
          <div className="stat-value">Rp 3.250.000 <span style={{ fontSize: "11px", fontWeight: 400 }}>/bln</span></div>
          <div className="stat-foot">Dari surplus kas Rp 5.430.000 (Rasio aman 59.8%)</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>ESTIMASI CAPAIAN WAKTU</span>
            <Clock size={16} style={{ color: "var(--muted)" }} />
          </div>
          <div className="stat-value" style={{ fontSize: "18px" }}>3 On-Track · 1 Perlu Akselerasi</div>
          <div className="stat-foot">Target terdekat: Laptop Kerja (3 Bulan lagi)</div>
        </div>
      </div>

      {/* 3. AI Wawasan Adaptif Cerdas FIRA Banner */}
      <div className="card" style={{ background: "var(--green-soft)", borderColor: "var(--mint)", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--green)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="eyebrow" style={{ color: "var(--green)", margin: 0 }}>WAWASAN ADAPTIF CERDAS FIRA</span>
                <span className="pill" style={{ background: "#fff", fontSize: "9px" }}>Optimization Recommendation</span>
              </div>
              <h3 style={{ font: "700 16px Manrope", margin: "4px 0" }}>
                Rekomendasi Akselerasi: Sinkronisasi Penghematan AI Smart Auditor
              </h3>
              <p className="muted" style={{ fontSize: "12px", color: "var(--ink)", lineHeight: "1.6" }}>
                Dengan mengalihkan efisiensi pembatalan langganan pasif (<strong>Rp 610.000/bln</strong>) dan surplus Transportasi (<strong>Rp 350.000</strong>) ke target <strong>"Dana Darurat 6 Bulan"</strong>, target Anda akan tercapai <strong>2,4 bulan lebih cepat</strong> (April 2027 menjadi Januari 2027).
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
            <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
              <Zap size={14} /> Terapkan Auto-Boost (+Rp 610.000/bln)
            </button>
            <a href="#" className="text-link" style={{ textAlign: "center", fontSize: "11px" }}>Lihat Rincian Skenario &gt;</a>
          </div>
        </div>
      </div>

      {/* 4. Filter Tab Target */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "6px", background: "white", padding: "4px", borderRadius: "10px", border: "1px solid var(--line)" }}>
          {["Semua Target (4)", "Dana Darurat (1)", "Pembelian Aset (1)", "Liburan & Gaya Hidup (1)", "Pendidikan (1)"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.split(" ")[0])}
              className="secondary-button"
              style={{
                border: 0,
                padding: "6px 12px",
                fontSize: "11px",
                background: activeTab === tab.split(" ")[0] ? "var(--green-soft)" : "transparent",
                color: activeTab === tab.split(" ")[0] ? "var(--green)" : "var(--muted)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>Urutkan: <strong>Menurut Progres Tertinggi</strong></span>
      </div>

      {/* 5. Grid 4 Kartu Goal Detail (2 x 2) */}
      <div className="grid two-col" style={{ gap: "16px", marginBottom: "28px" }}>
        
        {/* Card 1: Dana Darurat 6 Bulan */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><ShieldCheck size={18} /></div>
              <div>
                <span className="pill warning" style={{ fontSize: "9px", marginBottom: "2px" }}>Prioritas Kritis</span>
                <h3 style={{ font: "700 16px Manrope", margin: 0 }}>Dana Darurat 6 Bulan</h3>
              </div>
            </div>
            <span className="pill">ON TRACK</span>
          </div>

          <div style={{ fontSize: "20px", fontWeight: 800, margin: "10px 0 4px" }}>
            Rp 28.500.000 <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 45.000.000</span>
          </div>
          <div className="progress" style={{ height: "8px" }}><span style={{ width: "63.3%" }}></span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
            <span>63.3% tercapai</span>
            <span>Sisa Rp 16.500.000</span>
          </div>

          <div className="grid two-col" style={{ background: "#f8faf9", padding: "10px", borderRadius: "10px", margin: "14px 0", fontSize: "11px" }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Tenggat Waktu</span>
              <strong>Mei 2027 (6 bln lagi)</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Setoran Rutin</span>
              <strong>Rp 2.750.000 / bln</strong>
            </div>
          </div>

          <div className="notice" style={{ fontSize: "11px", padding: "10px 12px" }}>
            <strong>Rekomendasi AI:</strong> Alokasikan bonus akhir tahun untuk melengkapi 36.7% sisa bantalan kas agar perlindungan optimal lebih cepat.
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
            <button className="primary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>+ Tambah Setoran</button>
            <button className="secondary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Edit Target</button>
            <button className="secondary-button" style={{ padding: "8px" }}><MoreVertical size={14} /></button>
          </div>
        </div>

        {/* Card 2: Laptop Kerja Baru (M3 Pro) */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><Laptop size={18} /></div>
              <div>
                <span className="pill" style={{ fontSize: "9px", marginBottom: "2px", background: "#e8f4ee", color: "var(--green)" }}>Prioritas Tinggi</span>
                <h3 style={{ font: "700 16px Manrope", margin: 0 }}>Laptop Kerja Baru (M3 Pro)</h3>
              </div>
            </div>
            <span className="pill" style={{ background: "#e8f4ee", color: "var(--green)" }}>OPTIMAL</span>
          </div>

          <div style={{ fontSize: "20px", fontWeight: 800, margin: "10px 0 4px" }}>
            Rp 14.200.000 <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 20.000.000</span>
          </div>
          <div className="progress" style={{ height: "8px" }}><span style={{ width: "71.0%" }}></span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
            <span>71.0% tercapai</span>
            <span>Sisa Rp 5.800.000</span>
          </div>

          <div className="grid two-col" style={{ background: "#f8faf9", padding: "10px", borderRadius: "10px", margin: "14px 0", fontSize: "11px" }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Tenggat Waktu</span>
              <strong>Februari 2027 (3 bln lagi)</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Setoran Rutin</span>
              <strong>Rp 1.933.000 / bln</strong>
            </div>
          </div>

          <div className="notice" style={{ fontSize: "11px", padding: "10px 12px" }}>
            <strong>AI Twin Match:</strong> Tersambung dengan skenario What-If Simulator: siap dibeli tunai tanpa cicilan bunga konsumtif.
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
            <button className="primary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>+ Tambah Setoran</button>
            <button className="secondary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Edit Target</button>
            <button className="secondary-button" style={{ padding: "8px" }}><MoreVertical size={14} /></button>
          </div>
        </div>

        {/* Card 3: Liburan Keluarga ke Jepang */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon" style={{ background: "#fff4e7", color: "var(--orange)" }}><Plane size={18} /></div>
              <div>
                <span className="pill warning" style={{ fontSize: "9px", marginBottom: "2px" }}>Prioritas Sedang</span>
                <h3 style={{ font: "700 16px Manrope", margin: 0 }}>Liburan Keluarga ke Jepang</h3>
              </div>
            </div>
            <span className="pill warning">PERLU AKSELERASI</span>
          </div>

          <div style={{ fontSize: "20px", fontWeight: 800, margin: "10px 0 4px" }}>
            Rp 10.750.000 <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 35.000.000</span>
          </div>
          <div className="progress" style={{ height: "8px" }}><span style={{ width: "30.7%", background: "var(--orange)" }}></span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
            <span>30.7% tercapai</span>
            <span>Sisa Rp 24.250.000</span>
          </div>

          <div className="grid two-col" style={{ background: "#f8faf9", padding: "10px", borderRadius: "10px", margin: "14px 0", fontSize: "11px" }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Tenggat Waktu</span>
              <strong>November 2027 (12 bln lagi)</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Kebutuhan vs Aktual</span>
              <strong style={{ color: "var(--red)" }}>Rp 1.500k (kurang 520k)</strong>
            </div>
          </div>

          <div className="notice" style={{ background: "#fff0ef", borderColor: "#f9c6c4", color: "#b95e58", fontSize: "11px", padding: "10px 12px" }}>
            <strong>Peringatan:</strong> Selisih Rp 520.000/bulan berpotensi menggeser keberangkatan 2 bulan ke Januari 2028 jika laju setoran tidak disesuaikan.
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
            <button className="primary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>+ Tambah Setoran</button>
            <button className="secondary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Selesaikan Deadline</button>
            <button className="secondary-button" style={{ padding: "8px" }}><MoreVertical size={14} /></button>
          </div>
        </div>

        {/* Card 4: Sertifikasi Profesional Finansial */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><GraduationCap size={18} /></div>
              <div>
                <span className="pill" style={{ fontSize: "9px", marginBottom: "2px" }}>Prioritas Tinggi</span>
                <h3 style={{ font: "700 16px Manrope", margin: 0 }}>Sertifikasi Profesional Finansial</h3>
              </div>
            </div>
            <span className="pill">ON TRACK</span>
          </div>

          <div style={{ fontSize: "20px", fontWeight: 800, margin: "10px 0 4px" }}>
            Rp 5.000.000 <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 15.000.000</span>
          </div>
          <div className="progress" style={{ height: "8px" }}><span style={{ width: "33.3%" }}></span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
            <span>33.3% tercapai</span>
            <span>Sisa Rp 10.000.000</span>
          </div>

          <div className="grid two-col" style={{ background: "#f8faf9", padding: "10px", borderRadius: "10px", margin: "14px 0", fontSize: "11px" }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Tenggat Waktu</span>
              <strong>Agustus 2027 (9 bln lagi)</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px" }}>Setoran Rutin</span>
              <strong>Rp 1.110.000 / bln</strong>
            </div>
          </div>

          <div className="notice" style={{ fontSize: "11px", padding: "10px 12px" }}>
            <strong>Insight Karier:</strong> Alokasi setoran stabil sesuai kalender pendaftaran batch Q3 2027. Arus kas aman tersendat.
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
            <button className="primary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>+ Tambah Setoran</button>
            <button className="secondary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Edit Target</button>
            <button className="secondary-button" style={{ padding: "8px" }}><MoreVertical size={14} /></button>
          </div>
        </div>

      </div>

      {/* 6. Kalkulator Cerdas: Rencana Setoran Otomatis */}
      <div className="card">
        <div className="card-heading">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="stat-icon"><Calculator size={18} /></div>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Kalkulator Cerdas: Rencana Setoran Otomatis</h2>
              <p className="muted" style={{ fontSize: "12px" }}>Hitung kapasitas setoran baru berdasarkan arus kas nyata tanpa mengorbankan stabilitas bulanan.</p>
            </div>
          </div>
          <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green)" }}>Kapasitas Bebas: Rp 2.180.000 / bln</span>
        </div>

        <div className="grid two-col" style={{ gap: "24px", marginTop: "16px", alignItems: "start" }}>
          {/* Input Form Sisi Kiri */}
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Nama Target Finansial</label>
              <input type="text" defaultValue="Dana Renovasi Rumah Sederhana" />
            </div>

            <div className="form-grid">
              <div className="field" style={{ margin: 0 }}>
                <label>Target Nominal (Rp)</label>
                <input type="text" defaultValue="Rp 15.000.000" />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Tenggat Waktu (Durasi)</label>
                <select defaultValue="12 Bulan (1 Tahun)">
                  <option>12 Bulan (1 Tahun)</option>
                  <option>6 Bulan</option>
                  <option>24 Bulan (2 Tahun)</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="field" style={{ margin: 0 }}>
                <label>Kategori Rencana</label>
                <select defaultValue="Pembelian Aset / Properti">
                  <option>Pembelian Aset / Properti</option>
                  <option>Dana Darurat</option>
                  <option>Liburan & Gaya Hidup</option>
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Frekuensi Setoran</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <button type="button" className="primary-button" style={{ padding: "8px", fontSize: "11px" }}>Bulanan</button>
                  <button type="button" className="secondary-button" style={{ padding: "8px", fontSize: "11px" }}>Mingguan</button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <input type="checkbox" id="autodebit" defaultChecked style={{ width: "16px", height: "16px" }} />
              <label htmlFor="autodebit" style={{ fontSize: "11px", color: "var(--ink)", fontWeight: 500 }}>
                Aktifkan Auto-Debit Nabung Otomatis H+1 Gajian
              </label>
            </div>
          </form>

          {/* Result Panel Sisi Kanan */}
          <div style={{ background: "#f8faf9", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className="eyebrow" style={{ margin: 0 }}>KALKULASI AI REAL-TIME</span>
              <span className="pill" style={{ fontSize: "9px" }}>AMAN & TERJANGKAU</span>
            </div>
            
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>Kebutuhan Setoran Bulanan:</div>
            <div style={{ font: "800 28px Manrope", color: "var(--green)", margin: "4px 0 12px" }}>
              Rp 1.250.000 <span style={{ fontSize: "14px", fontWeight: 500 }}>/ bulan</span>
            </div>

            <div className="notice" style={{ background: "#fff", border: "1px solid var(--line)", fontSize: "11px", lineHeight: "1.6" }}>
              <CheckCircle2 size={16} className="positive" style={{ float: "left", marginRight: "8px", marginTop: "2px" }} />
              Berdasarkan sisa waktu 12 Bulan, surplus kas Anda saat ini (Rp 5.430.000/bln) <strong>SANGAT CUKUP</strong> dan tidak mengganggu alokasi kebutuhan pokok keluarga.
            </div>

            <button className="primary-button" style={{ width: "100%", marginTop: "16px", padding: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} /> Simpan & Aktifkan Target
            </button>
          </div>
        </div>
      </div>
    </>
  );
}