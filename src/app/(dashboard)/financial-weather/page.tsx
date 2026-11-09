"use client";

import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  Zap, 
  RotateCw, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  Umbrella, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function FinancialWeatherPage() {
  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">Indikator Ketahanan Finansial · P3 Core</span>
            <span>Sistem radar kondisi finansial Anda secara real-time</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>Financial Weather</h1>
          <p className="muted">
            Mengukur stabilitas arus kas, ketahanan likuiditas terhadap guncangan, dan proyeksi cuaca keuangan 30–90 hari ke depan.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RotateCw size={14} /> Pembaruan Diagnosis Cuaca
          </button>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Download size={16} /> Unduh Rapor (PDF)
          </button>
        </div>
      </div>

      {/* 2. Banner Status Cuaca Utama */}
      <div className="card" style={{ background: "var(--green-soft)", borderColor: "var(--mint)", marginBottom: "24px" }}>
        <div className="grid two-col" style={{ gridTemplateColumns: "1.2fr 2fr", gap: "24px", alignItems: "center" }}>
          
          {/* Sisi Kiri: Big Score Display */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "24px",
              background: "var(--green)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 16px rgba(16, 75, 59, 0.2)",
              flexShrink: 0
            }}>
              <Sun size={36} />
              <span style={{ font: "800 22px Manrope", marginTop: "2px" }}>88<span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span></span>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)" }}>STABILITAS SAAT INI</div>
              <h2 style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0 4px" }}>
                CERAH (AMAN & RESILIEN)
              </h2>
              <span style={{ fontSize: "11px", color: "var(--ink)", display: "block" }}>
                Kategori: <strong>Sangat Baik & Bantalan Tahan Tinggi</strong>
              </span>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>● Diperbarui: 28 Nov 2026, 08:30 WIB</span>
            </div>
          </div>

          {/* Sisi Kanan: 4 Ringkasan Metrik */}
          <div>
            <div className="notice" style={{ background: "#fff", border: "1px solid var(--mint)", marginBottom: "12px", fontSize: "11px", lineHeight: "1.5" }}>
              <strong style={{ color: "var(--green)" }}>Analisis Meteorologi Finansial FIRA:</strong>
              <br />
              "Kondisi keuangan Anda bulan November 2026 berada dalam fase cerah optimal. Bantalan likuiditas Anda mampu menahan guncangan kehilangan pendapatan tak terduga hingga <strong>6.4 bulan ke depan</strong> tanpa mengorbankan pengeluaran pokok."
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" }}>
              <div style={{ background: "#fff", padding: "8px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Arus Kas Bersih</span>
                <strong style={{ fontSize: "11px", color: "var(--green)" }}>+Rp 5.430.000</strong>
              </div>
              <div style={{ background: "#fff", padding: "8px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Bantalan Kas</span>
                <strong style={{ fontSize: "11px" }}>6.4 Bulan</strong>
              </div>
              <div style={{ background: "#fff", padding: "8px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Rasio Cicilan</span>
                <strong style={{ fontSize: "11px", color: "var(--green)" }}>0.0%</strong>
              </div>
              <div style={{ background: "#fff", padding: "8px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Rasio Tabungan</span>
                <strong style={{ fontSize: "11px" }}>42.2%</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Parameter Barometer Finansial (4 Barometer Grid) */}
      <div style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "12px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Parameter Barometer Finansial</h2>
            <p className="muted" style={{ fontSize: "11px" }}>Diagnostik terukur dari 4 pilar penyusun ketahanan finansial rumah tangga Anda</p>
          </div>
          <span className="pill">Kalibrasi Otomatis via Open Finance</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="pill" style={{ background: "#e8f4ee", color: "var(--green)", fontSize: "9px" }}>Tekanan Rendah</span>
              <Sun size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Tekanan Pengeluaran</div>
            <div style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}>82 <span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span></div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}><span style={{ width: "82%" }}></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--muted)" }}>
              <span>Realisasi: Rp 7.42M</span>
              <span>Batas: Rp 8.00M</span>
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="pill" style={{ background: "#e8f4ee", color: "var(--green)", fontSize: "9px" }}>Sangat Cerah / Sehat</span>
              <ShieldCheck size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Kelembaban Likuiditas</div>
            <div style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}>94 <span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span></div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}><span style={{ width: "94%" }}></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--muted)" }}>
              <span>Kas Lancar: Rp 28.5M</span>
              <span>Bantalan Optimal</span>
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="pill" style={{ background: "#e8f4ee", color: "var(--green)", fontSize: "9px" }}>Angin Tenang</span>
              <TrendingUp size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Volatilitas Arus Kas</div>
            <div style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}>12% <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>simpangan baku</span></div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}><span style={{ width: "12%" }}></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--muted)" }}>
              <span>Fluktuasi Terkontrol</span>
              <span>Ambang Beban 35%</span>
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="pill" style={{ background: "#e8f4ee", color: "var(--green)", fontSize: "9px" }}>Risiko Rendah (&lt;5%)</span>
              <Umbrella size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Indeks Kerentanan Badai</div>
            <div style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}>&lt; 5% <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>probabilitas 60 hari</span></div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}><span style={{ width: "5%" }}></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--muted)" }}>
              <span>Beban Utang Konsumtif: 0%</span>
              <span>Zona Aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Spektrum Cuaca Finansial & Posisi Anda */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Spektrum Cuaca Finansial & Posisi Anda</h2>
            <p className="muted" style={{ fontSize: "11px" }}>Model klasifikasi 4 zona cuaca FIRA berdasarkan ketahanan likuiditas dan rasio beban biaya</p>
          </div>
          <span className="pill" style={{ background: "var(--green)", color: "#fff" }}>● Posisi Anda Saat Ini: Skor 88 (Zona Cerah)</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div style={{ border: "2px solid var(--green)", borderRadius: "12px", padding: "14px", background: "var(--green-soft)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <strong style={{ color: "var(--green)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sun size={16} /> Cerah
              </strong>
              <span className="pill" style={{ fontSize: "8px", background: "var(--green)", color: "#fff" }}>Posisi Anda</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>Skor 80 – 100</div>
            <p style={{ fontSize: "10px", color: "var(--ink)", lineHeight: "1.4", margin: 0 }}>
              Arus kas surplus stabil, dana darurat &gt; 6 bulan, rasio utang &lt; 20%. Pertumbuhan aset stabil dan bebas tekanan likuiditas.
            </p>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: "12px", padding: "14px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <strong style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CloudSun size={16} /> Berawan
              </strong>
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>Skor 60 – 79</div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.4", margin: 0 }}>
              Arus kas tipis, dana darurat 3-6 bulan. Terdapat pengeluaran impulsif minor yang membatasi kapasitas akumulasi modal.
            </p>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: "12px", padding: "14px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <strong style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", color: "#a86a22" }}>
                <CloudRain size={16} /> Hujan Ringan
              </strong>
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>Skor 40 – 59</div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.4", margin: 0 }}>
              Arus kas mendekati imbang/defisit, dana darurat &lt; 3 bulan. Beban gaya hidup atau cicilan mulai menggerus tabungan cadangan.
            </p>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: "12px", padding: "14px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <strong style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", color: "var(--red)" }}>
                <Zap size={16} /> Badai Finansial
              </strong>
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>Skor &lt; 40</div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.4", margin: 0 }}>
              Defisit kronis berkepanjangan, DSR &gt; 35%, dana darurat habis. Ancaman gagal bayar atau jerat gali lubang tutup lubang.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Prakiraan Cuaca Finansial 3 Bulan Ke Depan */}
      <div style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "14px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Prakiraan Cuaca Finansial 3 Bulan Ke Depan</h2>
            <p className="muted" style={{ fontSize: "11px" }}>Simulasi prediksi berdasarkan kalender pengeluaran rutin, musiman, dan milestone tabungan</p>
          </div>
          <span className="pill">Proyeksi AI Berbasis Machine Learning</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>DESEMBER 2026</span>
              <span className="pill" style={{ fontSize: "9px" }}>Cerah Berawan</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--green-soft)", color: "var(--green)", display: "grid", placeItems: "center" }}>
                <CloudSun size={22} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", display: "block" }}>Cerah Berawan</strong>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Prediksi Skor: <strong>81 / 100</strong></span>
              </div>
            </div>
            <div style={{ background: "#f8faf9", padding: "10px", borderRadius: "8px", fontSize: "11px", marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Proyeksi Surplus:</span>
                <strong className="positive">+Rp 4.100.000</strong>
              </div>
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.5", margin: 0 }}>
              <strong>Catatan AI:</strong> Ada peningkatan pengeluaran rekreasi & konsumsi akhir tahun. Surplus menurun tipis namun tetap di zona aman.
            </p>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>JANUARI 2027</span>
              <span className="pill" style={{ fontSize: "9px" }}>Cerah Kembali</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--green-soft)", color: "var(--green)", display: "grid", placeItems: "center" }}>
                <Sun size={22} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", display: "block" }}>Cerah Kembali</strong>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Prediksi Skor: <strong>89 / 100</strong></span>
              </div>
            </div>
            <div style={{ background: "#f8faf9", padding: "10px", borderRadius: "8px", fontSize: "11px", marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Proyeksi Surplus:</span>
                <strong className="positive">+Rp 5.850.000</strong>
              </div>
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.5", margin: 0 }}>
              <strong>Catatan AI:</strong> Estimasi bonus performa akhir tahun masuk. Ritme belanja kembali normal dan tabungan bulanan terakselerasi.
            </p>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>FEBRUARI 2027</span>
              <span className="pill" style={{ fontSize: "9px", background: "var(--green)", color: "#fff" }}>Cerah Optimal</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--green)", color: "#fff", display: "grid", placeItems: "center" }}>
                <Sparkles size={22} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", display: "block" }}>Cerah Optimal</strong>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Prediksi Skor: <strong>92 / 100</strong></span>
              </div>
            </div>
            <div style={{ background: "#f8faf9", padding: "10px", borderRadius: "8px", fontSize: "11px", marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Proyeksi Surplus:</span>
                <strong className="positive">+Rp 5.900.000</strong>
              </div>
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.5", margin: 0 }}>
              <strong>Milestone Target:</strong> Target Laptop M3 Pro diproyeksikan tercapai 100% tanpa mengusik dana darurat pokok.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Tindakan Mitigasi & Kesiapsiagaan AI */}
      <div className="grid two-col" style={{ gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "14px" }}>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Tindakan Mitigasi & Kesiapsiagaan AI</h2>
              <p className="muted" style={{ fontSize: "11px" }}>Rekomendasi taktis untuk mempertahankan skor cerah secara berkelanjutan</p>
            </div>
            <span className="pill">2 Rekomendasi Aktif</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: "10px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="pill warning" style={{ fontSize: "8px", marginBottom: "4px" }}>Prioritas Tinggi</span>
                <strong style={{ display: "block", fontSize: "12px" }}>Aktifkan Payung Pelindung Akhir Tahun (Budget Cap)</strong>
                <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                  Pasang pagu otomatis untuk kategori kuliner & rekreasi maksimal Rp 1.500.000 sepanjang 20–31 Desember 2026 untuk mencegah lonjakan musiman.
                </p>
              </div>
              <button className="primary-button" style={{ padding: "6px 12px", fontSize: "11px", whiteSpace: "nowrap" }}>Terapkan ke AI Budgeting</button>
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: "10px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="pill" style={{ fontSize: "8px", marginBottom: "4px" }}>Optimalisasi</span>
                <strong style={{ display: "block", fontSize: "12px" }}>Kunci Surplus Pasif Langganan ke Pasar Uang</strong>
                <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                  Temuan Smart Auditor: alihkan efisiensi langganan pasif sebesar Rp 610.000/bulan ke instrumen reksa dana untuk mempertebal dana darurat.
                </p>
              </div>
              <button className="secondary-button" style={{ padding: "6px 12px", fontSize: "11px", whiteSpace: "nowrap" }}>Buka What-If Simulator</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: "#0e4336", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span className="eyebrow" style={{ color: "#a8e6cf", margin: 0 }}>SIMULASI CUACA EXTREME</span>
            <Zap size={18} style={{ color: "#a8e6cf" }} />
          </div>

          <h2 style={{ font: "700 17px Manrope", margin: "0 0 6px 0", color: "#fff" }}>
            Uji Ketahanan Finansial Anda Terhadap Badai
          </h2>
          <p style={{ fontSize: "11px", color: "#c1e7dd", lineHeight: "1.5", marginBottom: "14px" }}>
            Bagaimana jika Anda tiba-tiba kehilangan pekerjaan selama 6 bulan? Atau mobil memerlukan servis darurat Rp 10.000.000? Uji ketahanan radar cuaca sekarang.
          </p>

          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px", marginBottom: "14px", fontSize: "11px" }}>
            <div style={{ color: "#a8e6cf", fontWeight: 700, marginBottom: "4px" }}>Ketahanan Maksimal: 6.4 Bulan (Tanpa Gaji)</div>
            <div style={{ color: "#fff" }}>Kondisi Kas: <strong>Sangat Aman</strong></div>
          </div>

          <button className="primary-button" style={{ width: "100%", padding: "10px", background: "#1eb980", borderColor: "#1eb980", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
            Mulai Stress-Test Finansial <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}