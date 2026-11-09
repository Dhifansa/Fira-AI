"use client";

import { useState } from "react";
import { 
  Sliders, 
  RotateCcw, 
  Bookmark, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Info
} from "lucide-react";

export default function WhatIfSimulatorPage() {
  const [selectedPreset, setSelectedPreset] = useState("laptop");
  const [paymentMethod, setPaymentMethod] = useState("cicilan12");

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">Simulasi Interaktif · P3 Advanced</span>
            <span>Berbasis Data Aktual (Nov 2026)</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>What-If Simulator</h1>
          <p className="muted">
            Eksplorasi keputusan finansial besar sebelum mengambil risiko. Uji dampak cicilan, pembelian aset, kenaikan tabungan, atau efisiensi biaya terhadap arus kas dan ketahanan dana darurat Anda.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Bookmark size={16} /> Simpan Skenario Ini
          </button>
        </div>
      </div>

      {/* Mode Simulasi Mandiri Banner */}
      <div className="notice" style={{ background: "var(--green-soft)", borderColor: "var(--mint)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Sliders size={18} className="positive" />
          <span><strong>Mode Simulasi Mandiri (Sandboxed Environment):</strong> Hasil proyeksi merupakan pemodelan matematis berbasis data historis dan asumsi yang Anda masukkan, terpisah dari saldo atau buku kas riil akun perbankan Anda.</span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>Aman & Terisolasi</span>
      </div>

      {/* 2. Preset Skenario Populer */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "8px" }}>PRESET SKENARIO POPULER</div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { id: "laptop", label: "Beli Laptop Rp 15 Juta (Cicilan 12x)" },
            { id: "investasi", label: "Tambah Investasi +Rp 500.000 / bln" },
            { id: "gayahidup", label: "Pangkas Gaya Hidup 15%" },
            { id: "kpr", label: "KPR Rumah Baru Rp 4.200.000 / bln" }
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className="secondary-button"
              style={{
                fontSize: "11px",
                padding: "6px 12px",
                background: selectedPreset === preset.id ? "var(--green-soft)" : "#fff",
                borderColor: selectedPreset === preset.id ? "var(--mint)" : "var(--line)",
                color: selectedPreset === preset.id ? "var(--green)" : "var(--ink)",
                fontWeight: selectedPreset === preset.id ? 700 : 500
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid Utama 2 Kolom (Parameter vs Hasil) */}
      <div className="grid two-col" style={{ gridTemplateColumns: "1.1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        
        {/* SISI KIRI: Parameter Skenario */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon"><Sliders size={18} /></div>
              <div>
                <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Parameter Skenario</h2>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Atur variabel simulasi dan asumsi pembayaran</span>
              </div>
            </div>
            <span className="pill">Preset: Laptop Pro</span>
          </div>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>Jenis Skenario</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                <button type="button" className="primary-button" style={{ padding: "6px", fontSize: "10px" }}>Pengeluaran Besar</button>
                <button type="button" className="secondary-button" style={{ padding: "6px", fontSize: "10px" }}>Investasi</button>
                <button type="button" className="secondary-button" style={{ padding: "6px", fontSize: "10px" }}>Utang/Kredit</button>
                <button type="button" className="secondary-button" style={{ padding: "6px", fontSize: "10px" }}>Anggaran</button>
              </div>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Nama Skenario</label>
              <input type="text" defaultValue="Upgrade Laptop Kerja M3 Max" />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Total Nilai Transaksi (Rp)</label>
              <input type="text" defaultValue="Rp 15.000.000" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>Metode Pembayaran</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid var(--line)", borderRadius: "8px", cursor: "pointer", fontSize: "11px" }}>
                  <input type="radio" name="payment" checked={paymentMethod === "tunai"} onChange={() => setPaymentMethod("tunai")} />
                  <div>
                    <strong>Tunai Sekaligus (Cash Direct)</strong>
                    <span style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}>Potong langsung dari saldo tabungan kas (Rp 15.000.000)</span>
                  </div>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid var(--mint)", background: "var(--green-soft)", borderRadius: "8px", cursor: "pointer", fontSize: "11px" }}>
                  <input type="radio" name="payment" checked={paymentMethod === "cicilan12"} onChange={() => setPaymentMethod("cicilan12")} />
                  <div>
                    <strong style={{ color: "var(--green)" }}>Cicilan 12 Bulan (Bunga 0.5%/bln)</strong>
                    <span style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}>DP Rp 3.000.000 · Angsuran <strong>Rp 1.096.000 / bln</strong></span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-grid">
              <div className="field" style={{ margin: 0 }}>
                <label>Uang Muka / DP (Rp)</label>
                <input type="text" defaultValue="3.000.000" />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Tenor/Periode</label>
                <select defaultValue="12 Bulan">
                  <option>12 Bulan (Des 2026 - Nov 2027)</option>
                  <option>6 Bulan</option>
                  <option>24 Bulan</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "12px", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <input type="checkbox" id="kompensasi" defaultChecked style={{ width: "16px", height: "16px" }} />
                <label htmlFor="kompensasi" style={{ fontSize: "11px", fontWeight: 700 }}>Kompensasi Anggaran Otomatis</label>
              </div>
              <p className="muted" style={{ fontSize: "10px", margin: 0, paddingLeft: "24px" }}>
                FIRA akan secara otomatis memotong pos non-esensial untuk menyerap cicilan Rp 1.096.000 agar surplus bulanan Anda tetap terjaga.
              </p>
              <div style={{ margin: "8px 0 0 24px", fontSize: "10px", color: "var(--green)", fontWeight: 600 }}>
                • Pangkas Pos Hiburan & Kuliner: -Rp 500.000 / bln
              </div>
            </div>

            <button type="submit" className="primary-button" style={{ marginTop: "8px", padding: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
              <Play size={16} /> Jalankan Kalkulasi Ulang Skenario
            </button>
          </form>
        </div>

        {/* SISI KANAN: Hasil Proyeksi & Evaluasi AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Card 1: Dampak Metrik Finansial */}
          <div className="card">
            <div className="card-heading" style={{ marginBottom: "14px" }}>
              <h2>Dampak terhadap Indikator Keuangan</h2>
              <span className="pill">Setelah Simulasi</span>
            </div>

            <div className="grid two-col" style={{ gap: "12px" }}>
              <div style={{ border: "1px solid var(--line)", padding: "12px", borderRadius: "10px", background: "#f8faf9" }}>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>Arus Kas Bulanan (Net)</div>
                <div style={{ font: "800 20px Manrope", color: "var(--green)", margin: "2px 0" }}>+Rp 4.334.000</div>
                <div style={{ fontSize: "10px", color: "var(--red)" }}>Aktual: Rp 5.430.000 (-Rp 1.096.000 / -20.1%)</div>
              </div>

              <div style={{ border: "1px solid var(--line)", padding: "12px", borderRadius: "10px", background: "#f8faf9" }}>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>Ketahanan Dana Darurat</div>
                <div style={{ font: "800 20px Manrope", color: "var(--green)", margin: "2px 0" }}>5.9 Bulan</div>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>Aktual: 6.4 Bulan (-0.5 Bulan untuk DP Rp 3M)</div>
              </div>

              <div style={{ border: "1px solid var(--line)", padding: "12px", borderRadius: "10px", background: "#f8faf9" }}>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>Rasio Beban Cicilan (DSR)</div>
                <div style={{ font: "800 20px Manrope", color: "var(--green)", margin: "2px 0" }}>8.5%</div>
                <div style={{ fontSize: "10px", color: "var(--green)" }}>Sangat Rendah (Batas Aman Maksimal 30%)</div>
              </div>

              <div style={{ border: "1px solid var(--line)", padding: "12px", borderRadius: "10px", background: "#f8faf9" }}>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>Skor Financial Health</div>
                <div style={{ font: "800 20px Manrope", color: "var(--green)", margin: "2px 0" }}>83 <span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span></div>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>Aktual: 88/100 (-5 Poin Terprediksi)</div>
              </div>
            </div>
          </div>

          {/* Card 2: Grafik Proyeksi Arus Kas 12 Bulan */}
          <div className="card">
            <div className="card-heading" style={{ marginBottom: "10px" }}>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Proyeksi Arus Kas 12 Bulan</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Des 2026 – Nov 2027</span>
              </div>
              <span className="pill">Simulasi Stabil</span>
            </div>

            <div className="chart" style={{ height: "120px" }}>
              <div className="chart-col">
                <div className="bar dark" style={{ height: "65%" }}></div>
                <span className="chart-label">Des</span>
              </div>
              <div className="chart-col">
                <div className="bar dark" style={{ height: "65%" }}></div>
                <span className="chart-label">Jan</span>
              </div>
              <div className="chart-col">
                <div className="bar dark" style={{ height: "70%" }}></div>
                <span className="chart-label">Feb</span>
              </div>
              <div className="chart-col">
                <div className="bar dark" style={{ height: "75%" }}></div>
                <span className="chart-label">Mar</span>
              </div>
              <div className="chart-col">
                <div className="bar dark" style={{ height: "80%" }}></div>
                <span className="chart-label">Apr</span>
              </div>
              <div className="chart-col">
                <div className="bar dark" style={{ height: "85%" }}></div>
                <span className="chart-label">Mei</span>
              </div>
            </div>

            <div className="notice" style={{ marginTop: "12px", fontSize: "10px" }}>
              <CheckCircle2 size={14} className="positive" style={{ float: "left", marginRight: "6px", marginTop: "1px" }} />
              Surplus konsisten berada pada level Rp 4.334.000/bulan (Desember 2026), masih jauh di atas batas defisit Rp 0.
            </div>
          </div>

          {/* Card 3: Evaluasi AI FIRA */}
          <div className="card" style={{ background: "#e8f4ee", borderColor: "var(--mint)" }}>
            <div className="card-heading" style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} className="positive" />
                <h3 style={{ font: "700 15px Manrope", margin: 0, color: "var(--green)" }}>Evaluasi AI FIRA</h3>
              </div>
              <span className="pill" style={{ background: "var(--green)", color: "#fff", fontWeight: 700 }}>REKOMENDASI: LAYAK DIAMBIL</span>
            </div>

            <div style={{ fontSize: "11px", color: "var(--ink)", lineHeight: "1.5" }}>
              <p style={{ margin: "0 0 8px 0" }}>
                ✓ Pembelian laptop Rp 15.000.000 dengan cicilan 12 bulan <strong>TIDAK mengganggu stabilitas arus kas pokok Anda</strong>.
              </p>
              <p style={{ margin: 0 }}>
                ⚠️ Pembayaran DP Rp 3.000.000 sedikit mengikis bantalan dana darurat dari 6.4 bulan ke 5.9 bulan. Mengaktifkan kompensasi penghematan F&B akan mengembalikan dana darurat ke level 6.4 bulan dalam 4 bulan.
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button className="primary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Aktifkan Aturan Penghematan</button>
              <button className="secondary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Bandingkan Opsi Bayar Tunai</button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Tabel Matriks Perbandingan Multi-Skenario */}
      <div className="card">
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Matriks Perbandingan Multi-Skenario</h2>
            <p className="muted" style={{ fontSize: "11px" }}>Uji 3 alternatif strategi sebelum membuat komitmen finansial permanen</p>
          </div>
          <span className="pill">Model Objektif FIRA</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>PARAMETER EVALUASI</th>
                <th>OPSI A: BAYAR TUNAI (CASH FULL)</th>
                <th>OPSI B: CICILAN 12X (TERPILIH)</th>
                <th>OPSI C: TABUNG 3 BULAN & NABUNG</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pengeluaran Awal (Upfront)</strong></td>
                <td><strong style={{ color: "var(--red)" }}>Rp 15.000.000 (Tunai)</strong></td>
                <td><strong>Rp 3.000.000 (DP)</strong></td>
                <td><strong>Rp 0 Hari Ini</strong></td>
              </tr>
              <tr>
                <td><strong>Beban Bulanan (Next 12 Mths)</strong></td>
                <td><strong className="positive">Rp 0 / bulan</strong></td>
                <td><strong>Rp 1.096.000 / bulan</strong></td>
                <td><strong>Rp 5.000.000 / bln (Selama 3 Bln)</strong></td>
              </tr>
              <tr>
                <td><strong>Dampak Dana Darurat</strong></td>
                <td><span className="pill danger">Turun ke 3.5 Bulan (Kritis)</span></td>
                <td><span className="pill">Turun ke 5.9 Bulan (Aman)</span></td>
                <td><span className="pill">Tetap 6.4 Bulan (Terjaga)</span></td>
              </tr>
              <tr>
                <td><strong>Total Biaya Finansial</strong></td>
                <td><strong>Rp 15.000.000 (Nett)</strong></td>
                <td><strong>Rp 16.152.000 (Bunga Rp 1.15 M)</strong></td>
                <td><strong>Rp 15.000.000 (Potensi Diskon Promo)</strong></td>
              </tr>
              <tr>
                <td><strong>Skor Keseimbangan FIRA</strong></td>
                <td><span className="pill warning">Risiko Likuiditas</span></td>
                <td><span className="pill" style={{ background: "var(--green)", color: "#fff" }}>Paling Seimbang</span></td>
                <td><span className="pill">Paling Hemat Finansial</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}