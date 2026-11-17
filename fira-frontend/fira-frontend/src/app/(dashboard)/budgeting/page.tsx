"use client";

import { useState } from "react";
import { 
  Wallet, 
  ArrowRightLeft, 
  Plus, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Utensils, 
  Home, 
  Car, 
  Tv, 
  HeartPulse, 
  BookOpen,
  Pencil,
  Trash2
} from "lucide-react";

export default function BudgetingPage() {
  const [filterTab, setFilterTab] = useState("Semua");

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">PRO v1.0 + P3</span>
            <span>IO Engine: Adaptive Budget Engine Active</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>AI Budgeting</h1>
          <p className="muted">
            Alokasi pintar dinamis yang memitigasi defisit secara real-time melalui proteksi surplus lintas kategori.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} /> Optimasi AI Otomatis
          </button>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Buat Anggaran Baru
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Kolom Bersebelahan) */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div className="card stat-card">
          <div className="stat-top">
            <span>TOTAL PAGU ANGGARAN</span>
            <Wallet size={16} className="positive" />
          </div>
          <div className="stat-value">Rp 8.000.000</div>
          <div className="stat-foot">Terdaftar 6 Kategori</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>REALISASI BELANJA</span>
            <span className="pill warning">-4.2% vs bulan lalu</span>
          </div>
          <div className="stat-value">Rp 7.420.000</div>
          <div className="stat-foot">±4.2% sebelumnya (Rp 7.75M)</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>SISA ANGGARAN</span>
            <span className="pill">Aman</span>
          </div>
          <div className="stat-value positive">Rp 580.000</div>
          <div className="stat-foot positive">Penopang sisa 2 hari periode berjalan</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>UTILISASI ANGGARAN</span>
            <span className="pill warning">Waspada</span>
          </div>
          <div className="stat-value" style={{ color: "#a86a22" }}>92.8%</div>
          <div className="stat-foot">Sisa 2 Hari Periode November</div>
        </div>
      </div>

      {/* 3. AI Adaptive Budget Insight Banner */}
      <div className="card" style={{ background: "var(--green-soft)", borderColor: "var(--mint)", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--green)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="eyebrow" style={{ color: "var(--green)", margin: 0 }}>AI ADAPTIVE BUDGET INSIGHT</span>
                <span className="pill" style={{ background: "#fff", fontSize: "9px" }}>Audit Model 2.4</span>
              </div>
              <h3 style={{ font: "700 16px Manrope", margin: "4px 0" }}>
                Mitigasi Defisit: Realokasikan Surplus Transportasi ke F&B
              </h3>
              <p className="muted" style={{ fontSize: "12px", color: "var(--ink)", lineHeight: "1.6" }}>
                FIRA mendeteksi defisit <strong style={{ color: "var(--red)" }}>Rp 150.000 (+8% over-limit)</strong> pada kategori <strong>Makanan & Minuman</strong> akibat lonjakan makan luar akhir pekan. 
                Sementara itu, kategori <strong>Transportasi</strong> memiliki sisa anggaran longgar <strong>Rp 350.000</strong> dengan sisa 2 hari aktif.
              </p>
            </div>
          </div>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
            <ArrowRightLeft size={15} /> Terapkan Realokasi (+Rp 250.000)
          </button>
        </div>

        {/* Sinkronisasi Smart Auditor */}
        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--mint)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
          <span style={{ color: "var(--green)" }}>
            <strong>Sinkronisasi AI Smart Auditor:</strong> Ditemukan pengeluaran langganan streaming tidak terpakai senilai Rp 610.000. Pangkas untuk memperbesar Dana Darurat Desember.
          </span>
          <a href="/smart-auditor" className="text-link">Buka Smart Auditor &gt;</a>
        </div>
      </div>

      {/* 4. Filter & Judul Daftar Pagu per Kategori */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ font: "700 18px Manrope", margin: 0 }}>Daftar Pagu Anggaran per Kategori</h2>
          <p className="muted" style={{ fontSize: "12px" }}>Monitoring penggunaan pagu per pos pengeluaran dengan indikator laju konsumsi harian terkendali.</p>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "white", padding: "4px", borderRadius: "10px", border: "1px solid var(--line)" }}>
          {["Semua (6)", "Defisit (1)", "Waspada (2)", "Aman (3)"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab.split(" ")[0])}
              className="secondary-button"
              style={{
                border: 0,
                padding: "6px 12px",
                fontSize: "11px",
                background: filterTab === tab.split(" ")[0] ? "var(--green-soft)" : "transparent",
                color: filterTab === tab.split(" ")[0] ? "var(--green)" : "var(--muted)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid 6 Kartu Pagu Kategori */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        
        {/* Card 1: Makanan & Minuman (DEFISIT) */}
        <div className="card" style={{ borderColor: "#f9c6c4" }}>
          <div style={{ borderTop: "4px solid var(--red)", margin: "-20px -20px 16px -20px", borderRadius: "16px 16px 0 0" }}></div>
          <div className="card-heading" style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon" style={{ background: "#fff0ef", color: "var(--red)" }}><Utensils size={18} /></div>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Makanan & Minuman</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Konsumsi harian & F&B</span>
              </div>
            </div>
            <span className="pill danger">DEFISIT</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 4px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Realisasi / Pagu</span>
            <strong style={{ fontSize: "14px", color: "var(--red)" }}>105.5%</strong>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "8px" }}>
            Rp 2.850.000 <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 2.700.000</span>
          </div>
          <div className="progress"><span style={{ width: "100%", background: "var(--red)" }}></span></div>

          <div className="notice" style={{ background: "#fff0ef", borderColor: "#f9c6c4", color: "#b95e58", marginTop: "12px", fontSize: "11px" }}>
            <strong>Melebihi Batas: -Rp 150.000</strong>
            <br />
            AI Warning: Lonjakan terjadi akibat makan luar akhir pekan. Rekomendasi: batasi pengeluaran F&B Qdoba hingga akhir bulan.
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--line)", fontSize: "11px", color: "var(--muted)" }}>
            <span>28 Transaksi</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ border: 0, background: "none" }}><Pencil size={14} /></button>
              <button style={{ border: 0, background: "none" }}><Trash2 size={14} /></button>
            </div>
          </div>
        </div>

        {/* Card 2: Rumah & Utilitas (WASPADA) */}
        <div className="card" style={{ borderColor: "#ffe4bd" }}>
          <div style={{ borderTop: "4px solid var(--orange)", margin: "-20px -20px 16px -20px", borderRadius: "16px 16px 0 0" }}></div>
          <div className="card-heading" style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon" style={{ background: "#fff4e7", color: "var(--orange)" }}><Home size={18} /></div>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Rumah & Utilitas</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Listrik, air, wifi & maintenance</span>
              </div>
            </div>
            <span className="pill warning">WASPADA</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 4px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Realisasi / Pagu</span>
            <strong style={{ fontSize: "14px", color: "#a86a22" }}>90.0%</strong>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "8px" }}>
            Rp 1.620.000 <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 1.800.000</span>
          </div>
          <div className="progress"><span style={{ width: "90%", background: "var(--orange)" }}></span></div>

          <div className="notice" style={{ background: "#fff8ec", borderColor: "#ffe4bd", color: "#8a5814", marginTop: "12px", fontSize: "11px" }}>
            <strong>Sisa Anggaran: Rp 180.000</strong>
            <br />
            Safe Daily Pace: Maksimal Rp 90.000/hari untuk 2 hari tersisa.
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--line)", fontSize: "11px", color: "var(--muted)" }}>
            <span>7 Transaksi</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ border: 0, background: "none" }}><Pencil size={14} /></button>
              <button style={{ border: 0, background: "none" }}><Trash2 size={14} /></button>
            </div>
          </div>
        </div>

        {/* Card 3: Transportasi & Bensin (AMAN) */}
        <div className="card" style={{ borderColor: "var(--mint)" }}>
          <div style={{ borderTop: "4px solid var(--green)", margin: "-20px -20px 16px -20px", borderRadius: "16px 16px 0 0" }}></div>
          <div className="card-heading" style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><Car size={18} /></div>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Transportasi & Bensin</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>BBM, parkir, & transport umum</span>
              </div>
            </div>
            <span className="pill">AMAN</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 4px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Realisasi / Pagu</span>
            <strong style={{ fontSize: "14px", color: "var(--green)" }}>76.7%</strong>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "8px" }}>
            Rp 1.150.000 <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 1.500.000</span>
          </div>
          <div className="progress"><span style={{ width: "76.7%" }}></span></div>

          <div className="notice" style={{ marginTop: "12px", fontSize: "11px" }}>
            <strong>Surplus Tersedia: +Rp 350.000</strong>
            <br />
            Safe Daily Pace: Hingga Rp 175.000/hari. Dapat dialokasikan sebagian ke F&B.
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--line)", fontSize: "11px", color: "var(--muted)" }}>
            <span>14 Transaksi</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ border: 0, background: "none" }}><Pencil size={14} /></button>
              <button style={{ border: 0, background: "none" }}><Trash2 size={14} /></button>
            </div>
          </div>
        </div>

        {/* Card 4: Hiburan & Gaya Hidup */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><Tv size={18} /></div>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Hiburan & Gaya Hidup</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Bioskop, hobi, & hangout</span>
              </div>
            </div>
            <span className="pill warning">WASPADA</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 4px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Realisasi / Pagu</span>
            <strong>95.0%</strong>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "8px" }}>
            Rp 950.000 <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 1.000.000</span>
          </div>
          <div className="progress"><span style={{ width: "95%", background: "var(--orange)" }}></span></div>
          <div className="notice" style={{ background: "#fff8ec", borderColor: "#ffe4bd", color: "#8a5814", marginTop: "12px", fontSize: "11px" }}>
            <strong>Sisa Anggaran: Rp 50.000</strong>
          </div>
        </div>

        {/* Card 5: Kesehatan & Fitnes */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><HeartPulse size={18} /></div>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Kesehatan & Fitnes</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Apotek, gym, & suplemen</span>
              </div>
            </div>
            <span className="pill">AMAN</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 4px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Realisasi / Pagu</span>
            <strong>75.0%</strong>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "8px" }}>
            Rp 450.000 <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 600.000</span>
          </div>
          <div className="progress"><span style={{ width: "75%" }}></span></div>
          <div className="notice" style={{ marginTop: "12px", fontSize: "11px" }}>
            <strong>Sisa Anggaran: Rp 150.000</strong>
          </div>
        </div>

        {/* Card 6: Edukasi & Buku */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><BookOpen size={18} /></div>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Edukasi & Buku</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Kursus online & buku</span>
              </div>
            </div>
            <span className="pill">PAS / PASSED</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 4px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Realisasi / Pagu</span>
            <strong>100.0%</strong>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "8px" }}>
            Rp 400.000 <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>dari Rp 400.000</span>
          </div>
          <div className="progress"><span style={{ width: "100%" }}></span></div>
          <div className="notice" style={{ marginTop: "12px", fontSize: "11px" }}>
            <strong>Sisa Anggaran: Rp 0</strong>
          </div>
        </div>

      </div>

      {/* 5. Konfigurator Cepat Anggaran Baru */}
      <div className="card">
        <div className="card-heading">
          <div>
            <h2>Konfigurator Cepat: Buat / Atur Anggaran Baru</h2>
            <p>Rancang pagu presisi dengan rekomendasi pintar berbasis rata-rata pengeluaran 3 bulan terakhir.</p>
          </div>
          <span className="pill" style={{ fontSize: "9px" }}>Model Pembelajaran Mesin v1.8</span>
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: "14px" }}>
          <div className="form-grid" style={{ gridTemplateColumns: "1.5fr 1fr 1fr auto", alignItems: "end", gap: "12px" }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Kategori Pengeluaran</label>
              <select defaultValue="Makanan & Minuman (F&B)">
                <option>Makanan & Minuman (F&B)</option>
                <option>Transportasi & Bensin</option>
                <option>Rumah & Utilitas</option>
                <option>Hiburan & Gaya Hidup</option>
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Batas Pagu (Nominal)</label>
              <input type="text" defaultValue="Rp 1.750.000" />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Frekuensi Periode</label>
              <select defaultValue="Bulanan (November 2026)">
                <option>Bulanan (November 2026)</option>
                <option>Mingguan</option>
              </select>
            </div>
            <button type="submit" className="primary-button" style={{ height: "42px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} /> Simpan Pagu Kategori
            </button>
          </div>
        </form>

        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
            <span className="pill">Peringatan Dini Adaptif FIRA AI</span>
            <span style={{ color: "var(--muted)" }}>Kirim notifikasi telegram & pop-up saat belanja menyentuh 80% dan 95% untuk mencegah defisit fatal.</span>
          </div>
        </div>
      </div>
    </>
  );
}