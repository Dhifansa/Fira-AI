"use client";

import { 
  ShieldAlert, 
  Sparkles, 
  Download, 
  RotateCw, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Cloud, 
  Dumbbell, 
  Tv, 
  Zap, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function SmartAuditorPage() {
  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">AI Pro + P3 Core Engine</span>
            <span>Audit Otomatis Selesai · 28 Nov 2026, 08:30 WIB</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>AI Smart Auditor</h1>
          <p className="muted">
            Memindai 142 transaksi historis untuk mendeteksi anomali pengeluaran, kebocoran langganan tersembunyi, pos belanja berlebih, dan peluang efisiensi kas riil.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RotateCw size={14} /> Jalankan Audit Ulang
          </button>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Download size={16} /> Ekspor Laporan Audit (PDF)
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Kolom Bersebelahan) */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div className="card stat-card">
          <div className="stat-top">
            <span>SKOR EFISIENSI PENGELUARAN</span>
            <ShieldCheck size={16} className="positive" />
          </div>
          <div className="stat-value positive" style={{ fontSize: "32px" }}>
            76 <span style={{ fontSize: "14px", color: "var(--muted)" }}>/100</span>
          </div>
          <div className="stat-foot">Cukup Baik · Potensi +14 Poin</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>POTENSI PENGHEMATAN</span>
            <Sparkles size={16} className="positive" />
          </div>
          <div className="stat-value positive">Rp 1.450.000 <span style={{ fontSize: "12px", fontWeight: 400 }}>/bln</span></div>
          <div className="stat-foot">Setara Rp 17.400.000 / thn</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>KEBOCORAN / PEMBOROSAN</span>
            <AlertTriangle size={16} style={{ color: "var(--red)" }} />
          </div>
          <div className="stat-value" style={{ color: "var(--red)" }}>3 <span style={{ fontSize: "14px", fontWeight: 400, color: "var(--ink)" }}>Pos Transaksi</span></div>
          <div className="stat-foot" style={{ color: "var(--red)" }}>2 Langganan Pasif, 1 Anomali Lonjakan</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>TRANSAKSI DIAUDIT</span>
            <CheckCircle2 size={16} style={{ color: "var(--muted)" }} />
          </div>
          <div className="stat-value">142 <span style={{ fontSize: "14px", fontWeight: 400 }}>Entri</span></div>
          <div className="stat-foot">100% Terverifikasi · 30 Hari Terakhir</div>
        </div>
      </div>

      {/* 3. Pengeluaran Terbesar & Deteksi Anomali */}
      <div className="grid two-col" style={{ gap: "20px", marginBottom: "24px" }}>
        {/* Konsentrasi Belanja */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "16px" }}>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Pengeluaran Terbesar & Konsentrasi Belanja</h2>
              <p className="muted" style={{ fontSize: "11px" }}>Periode Analisis: 1 Nov – 28 Nov 2026 (Total Kas Keluar: Rp 7.420.000)</p>
            </div>
            <span className="pill">Top 4 Pos (88%)</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <strong>Makanan & Minuman (F&B)</strong>
                <span><strong>Rp 2.850.000</strong> <span style={{ color: "var(--muted)" }}>(38%)</span></span>
              </div>
              <div className="progress"><span style={{ width: "38%" }}></span></div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <strong>Kebutuhan Rumah & Utilitas</strong>
                <span><strong>Rp 1.620.000</strong> <span style={{ color: "var(--muted)" }}>(22%)</span></span>
              </div>
              <div className="progress"><span style={{ width: "22%" }}></span></div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <strong>Transportasi & Bensin</strong>
                <span><strong>Rp 1.150.000</strong> <span style={{ color: "var(--muted)" }}>(15%)</span></span>
              </div>
              <div className="progress"><span style={{ width: "15%" }}></span></div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <strong>Hiburan & Gaya Hidup</strong>
                <span><strong>Rp 950.000</strong> <span style={{ color: "var(--muted)" }}>(13%)</span></span>
              </div>
              <div className="progress"><span style={{ width: "13%" }}></span></div>
            </div>
          </div>

          <div className="notice" style={{ marginTop: "16px", fontSize: "11px" }}>
            <strong>Catatan AI Auditor:</strong> Pos F&B melampaui batas wajar 30% dari total belanja bulanan akibat tingginya transaksi pesan-antar makanan online di akhir pekan. Disarankan merevaluasi batas belanja mikro mingguan.
          </div>
        </div>

        {/* Deteksi Anomali Belanja */}
        <div className="card" style={{ borderColor: "#f9c6c4" }}>
          <div className="card-heading" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} style={{ color: "var(--red)" }} />
              <div>
                <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Deteksi Anomali Belanja</h2>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Unusual Spending Spike Engine</span>
              </div>
            </div>
            <span className="pill danger">Peringatan Sedang</span>
          </div>

          <div style={{ background: "#fff0ef", border: "1px solid #f9c6c4", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ color: "var(--red)", fontSize: "12px" }}>● Anomali Terdeteksi (Spike +42%)</strong>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>22-24 Nov 2026</span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, margin: "4px 0" }}>
              Lonjakan Ekstrem Kategori F&B Akhir Pekan
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "11px", marginTop: "6px" }}>
              <div>Rata-rata Normal: <strong>Rp 65.000 / hari</strong></div>
              <div>Rata-rata Saat ini: <strong style={{ color: "var(--red)" }}>Rp 245.000 / hari</strong></div>
            </div>
          </div>

          <p className="muted" style={{ fontSize: "11px", lineHeight: "1.5" }}>
            <strong>Penjelasan Data:</strong> Ditemukan 5 transaksi kafe dan delivery beruntun dalam kurun waktu 48 jam dengan nominal akumulatif Rp 735.000.
          </p>

          <div className="notice" style={{ marginTop: "12px", fontSize: "11px" }}>
            <strong>Rekomendasi Aksi AI:</strong> Terapkan batas pagu harian Weekend Cap sebesar Rp 120.000 atau aktifkan notifikasi peringatan saat belanja F&B melewati Rp 100.000/hari.
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button className="primary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Aktifkan Batas Belanja</button>
            <button className="secondary-button" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>Tandai Wajar</button>
          </div>
        </div>
      </div>

      {/* 4. Audit Langganan & Pengeluaran Berulang */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Audit Langganan & Pengeluaran Berulang</h2>
            <p className="muted" style={{ fontSize: "11px" }}>Recurring Leak Detector · Analisis Utilisasi Layanan 30 Hari Terakhir</p>
          </div>
          <span className="pill">3 Rekomendasi Siap Tindak</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {/* Item 1 */}
          <div style={{ border: "1px solid var(--line)", borderRadius: "12px", padding: "16px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Cloud size={18} className="positive" />
                <strong>Cloud Storage Backup</strong>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700 }}>Rp 135.000<span style={{ fontSize: "9px", color: "var(--muted)" }}>/bln</span></span>
            </div>
            <div className="progress" style={{ height: "6px", marginBottom: "6px" }}><span style={{ width: "12%" }}></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
              <span>Utilisasi Kuota</span>
              <strong style={{ color: "var(--orange)" }}>Hanya 12%</strong>
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", margin: "0 0 12px 0" }}>
              Downgrade ke paket 200GB. Kebutuhan data riil Anda hanya 140GB.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
              <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>Hemat Rp 95.000/bln</span>
              <button className="secondary-button" style={{ padding: "4px 8px", fontSize: "10px" }}>Downgrade Paket</button>
            </div>
          </div>

          {/* Item 2 */}
          <div style={{ border: "1px solid #f9c6c4", borderRadius: "12px", padding: "16px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Dumbbell size={18} style={{ color: "var(--red)" }} />
                <strong>Membership Gym</strong>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700 }}>Rp 450.000<span style={{ fontSize: "9px", color: "var(--muted)" }}>/bln</span></span>
            </div>
            <div className="progress" style={{ height: "6px", marginBottom: "6px" }}><span style={{ width: "0%", background: "var(--red)" }}></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
              <span>Presensi 40 Hari Terakhir</span>
              <strong style={{ color: "var(--red)" }}>0 Check-in</strong>
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", margin: "0 0 12px 0" }}>
              Tidak terdeteksi absensi presensi. Bekukan/jeda atau hentikan langganan aktif.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
              <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>Hemat Rp 450.000/bln</span>
              <button className="primary-button" style={{ padding: "4px 8px", fontSize: "10px", background: "var(--red)" }}>Jeda / Bekukan</button>
            </div>
          </div>

          {/* Item 3 */}
          <div style={{ border: "1px solid var(--line)", borderRadius: "12px", padding: "16px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Tv size={18} className="positive" />
                <strong>Video Streaming B</strong>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700 }}>Rp 65.000<span style={{ fontSize: "9px", color: "var(--muted)" }}>/bln</span></span>
            </div>
            <div className="progress" style={{ height: "6px", marginBottom: "6px" }}><span style={{ width: "20%" }}></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginBottom: "12px" }}>
              <span>Durasi Tontonan</span>
              <strong>&lt; 1 jam / bulan</strong>
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", margin: "0 0 12px 0" }}>
              Terdapat overlap konten dengan Platform A yang digunakan rutin.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
              <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>Hemat Rp 65.000/bln</span>
              <button className="secondary-button" style={{ padding: "4px 8px", fontSize: "10px" }}>Hentikan Langganan</button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Peluang Penghematan Taktis & Sinkronisasi */}
      <div className="grid two-col" style={{ gap: "20px" }}>
        {/* Quick Wins */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "14px" }}>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Peluang Penghematan Taktis (Quick Wins)</h2>
              <p className="muted" style={{ fontSize: "11px" }}>Rencana Aksi Langsung Berbasis Rekomendasi Teruji FIRA</p>
            </div>
            <span className="pill">2 Rekomendasi Utama</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: "10px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="pill warning" style={{ fontSize: "8px", marginBottom: "4px" }}>Dampak Tinggi</span>
                <strong style={{ display: "block", fontSize: "12px" }}>Alihkan Surplus Langganan ke Dana Darurat</strong>
                <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                  Alokasikan efisiensi pembatalan gym dan streaming (<strong>Rp 610.000/bln</strong>) langsung ke rekening Dana Darurat. Mempercepat target 6 bulan tercapai 2,3 bulan lebih awal.
                </p>
              </div>
              <button className="primary-button" style={{ padding: "6px 12px", fontSize: "11px", whiteSpace: "nowrap" }}>Aktifkan Autodebit</button>
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: "10px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="pill" style={{ fontSize: "8px", marginBottom: "4px" }}>Cashback Rutin</span>
                <strong style={{ display: "block", fontSize: "12px" }}>Optimasi Pengeluaran BBM via Rekening Terintegrasi</strong>
                <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                  Gunakan kartu kredit/debit payroll terhubung untuk transaksi BBM di SPBU rekanan. Memberikan potensi cashback penghematan <strong>Rp 120.000/bln</strong> secara otomatis.
                </p>
              </div>
              <button className="secondary-button" style={{ padding: "6px 12px", fontSize: "11px", whiteSpace: "nowrap" }}>Hubungkan Promo</button>
            </div>
          </div>
        </div>

        {/* Sinkronisasi Engine FIRA */}
        <div className="card" style={{ background: "#0e4336", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span className="eyebrow" style={{ color: "#a8e6cf", margin: 0 }}>FIRA ENGINE INTEGRATION</span>
            <Zap size={18} style={{ color: "#a8e6cf" }} />
          </div>

          <h2 style={{ font: "700 18px Manrope", margin: "0 0 8px 0", color: "#fff" }}>
            Sinkronisasi ke AI Budgeting
          </h2>
          <p style={{ fontSize: "11px", color: "#c1e7dd", lineHeight: "1.6", marginBottom: "16px" }}>
            Terapkan hasil audit ini secara instan ke modul AI Budgeting untuk menyesuaikan batas pagu bulanan secara dinamis tanpa perlu kalkulasi manual.
          </p>

          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px", marginBottom: "16px", fontSize: "11px" }}>
            <div style={{ color: "#a8e6cf", fontWeight: 700, marginBottom: "4px" }}>✓ Penyesuaian Otomatis:</div>
            <div style={{ color: "#fff" }}>• Batas F&B melebihi batas: Rp 2.850.000</div>
            <div style={{ color: "#fff" }}>• Pos Langganan Berkurang Rp 610.000</div>
            <div style={{ color: "#fff" }}>• Porsi Tabungan bertambah otomatis</div>
          </div>

          <button className="primary-button" style={{ width: "100%", padding: "10px", background: "#1eb980", borderColor: "#1eb980", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
            Terapkan Aturan Otomatis ke AI Budgeting <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}