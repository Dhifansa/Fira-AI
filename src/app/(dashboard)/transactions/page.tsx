"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  Upload, 
  Car, 
  Briefcase, 
  ShoppingBag, 
  Zap, 
  CheckCircle2 
} from "lucide-react";

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Header Halaman & Ringkasan Metrik */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">FIRA WORKSPACE</div>
          <h1>Manajemen Transaksi</h1>
          <p className="muted">
            Catat, saring, dan kelola arus pemasukan serta pengeluaran harian Anda.
          </p>
        </div>
        <button 
          className="primary-button" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Tambah Transaksi
        </button>
      </div>

      {/* Metric Cards Ringkasan */}
      <div className="grid two-col" style={{ marginBottom: "20px" }}>
        <div className="card stat-card">
          <div className="stat-top">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowDownLeft size={16} className="positive" />
              <span>TOTAL PEMASUKAN</span>
            </div>
            <span className="pill">+Rp 14.850.000</span>
          </div>
          <div className="stat-value positive">Rp 14.850.000</div>
          <div className="stat-foot">Terverifikasi sistem</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowUpRight size={16} style={{ color: "var(--red)" }} />
              <span>TOTAL PENGELUARAN</span>
            </div>
            <span className="pill warning">-Rp 6.420.000</span>
          </div>
          <div className="stat-value" style={{ color: "var(--red)" }}>Rp 6.420.000</div>
          <div className="stat-foot">Dalam batas aman pagu</div>
        </div>
      </div>

      {/* Area Tabel Utama & Filter */}
      <div className="card">
        {/* Bar Toolbar Filter & Cari */}
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "500px" }}>
            <div className="field" style={{ flex: 1, margin: 0 }}>
              <div style={{ position: "relative" }}>
                <input 
                  type="text" 
                  placeholder="Cari transaksi, merchant..." 
                  style={{ paddingLeft: "36px", height: "38px" }} 
                />
                <Search size={16} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--muted)" }} />
              </div>
            </div>
            <button className="secondary-button" style={{ height: "38px", display: "flex", alignItems: "center", gap: "6px", padding: "0 12px" }}>
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Tabel Data Transaksi Detail */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>TANGGAL & WAKTU</th>
                <th>DESKRIPSI & MERCHANT</th>
                <th>KATEGORI</th>
                <th>TIPE</th>
                <th style={{ textAlign: "right" }}>NOMINAL</th>
                <th>STATUS</th>
                <th style={{ textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr>
                <td>
                  <strong style={{ fontSize: "12px", display: "block" }}>22 Nov 2026</strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>14:10 WIB</span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="stat-icon" style={{ width: "32px", height: "32px" }}><Car size={16} /></div>
                    <div>
                      <strong style={{ display: "block" }}>Pertamax Turbo</strong>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>SPBU Pertamina Kuningan</span>
                    </div>
                  </div>
                </td>
                <td><span className="pill">Transportasi</span></td>
                <td>
                  <span style={{ fontSize: "11px", color: "var(--red)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowUpRight size={14} /> Pengeluaran
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong className="amount expense">- Rp 250.000</strong>
                </td>
                <td><span className="pill">Selesai</span></td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", color: "var(--muted)" }}>
                    <button style={{ border: 0, background: "none" }}><Eye size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Pencil size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr>
                <td>
                  <strong style={{ fontSize: "12px", display: "block" }}>20 Nov 2026</strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>10:00 WIB</span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="stat-icon" style={{ width: "32px", height: "32px" }}><Briefcase size={16} /></div>
                    <div>
                      <strong style={{ display: "block" }}>Pembayaran Invoice Konsultasi</strong>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>Klien Studio Rekacipta</span>
                    </div>
                  </div>
                </td>
                <td><span className="pill">Pendapatan Bisnis</span></td>
                <td>
                  <span style={{ fontSize: "11px", color: "var(--green)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowDownLeft size={14} /> Pemasukan
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong className="amount income">+ Rp 2.350.000</strong>
                </td>
                <td><span className="pill">Selesai</span></td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", color: "var(--muted)" }}>
                    <button style={{ border: 0, background: "none" }}><Eye size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Pencil size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr>
                <td>
                  <strong style={{ fontSize: "12px", display: "block" }}>18 Nov 2026</strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>16:20 WIB</span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="stat-icon" style={{ width: "32px", height: "32px" }}><ShoppingBag size={16} /></div>
                    <div>
                      <strong style={{ display: "block" }}>Peralatan Kantor & Ergonomi</strong>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>Tokopedia Official Store</span>
                    </div>
                  </div>
                </td>
                <td><span className="pill">Belanja & Retail</span></td>
                <td>
                  <span style={{ fontSize: "11px", color: "var(--red)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowUpRight size={14} /> Pengeluaran
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong className="amount expense">- Rp 1.120.000</strong>
                </td>
                <td><span className="pill">Selesai</span></td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", color: "var(--muted)" }}>
                    <button style={{ border: 0, background: "none" }}><Eye size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Pencil size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>

              {/* Row 4 */}
              <tr>
                <td>
                  <strong style={{ fontSize: "12px", display: "block" }}>15 Nov 2026</strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>11:05 WIB</span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="stat-icon" style={{ width: "32px", height: "32px" }}><Zap size={16} /></div>
                    <div>
                      <strong style={{ display: "block" }}>Tagihan Listrik PLN & Wifi</strong>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>Autodebet BCA Virtual Account</span>
                    </div>
                  </div>
                </td>
                <td><span className="pill">Tagihan & Utilitas</span></td>
                <td>
                  <span style={{ fontSize: "11px", color: "var(--red)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowUpRight size={14} /> Pengeluaran
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong className="amount expense">- Rp 850.000</strong>
                </td>
                <td><span className="pill">Selesai</span></td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", color: "var(--muted)" }}>
                    <button style={{ border: 0, background: "none" }}><Eye size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Pencil size={15} /></button>
                    <button style={{ border: 0, background: "none" }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>Menampilkan 4 dari 42 entri</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "11px" }}>1</button>
            <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "11px", background: "var(--green-soft)" }}>2</button>
            <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "11px" }}>3</button>
          </div>
        </div>
      </div>

      {/* Catatan Prototip */}
      <div className="notice" style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} className="positive" />
          <span><strong>Data prototipe interaktif PRD v1.0:</strong> Semua penyesuaian simulasi bersifat lokal dan siap dikoneksikan ke endpoint backend FIRA Core.</span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>Engine: FIRA-Safe Ledger 1.0</span>
      </div>

      {/* Modal Form Tambah Transaksi */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "480px",
            background: "#fff",
            height: "100vh",
            padding: "24px",
            overflowY: "auto",
            boxShadow: "-8px 0 24px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <span className="eyebrow">FORM TRANSAKSI</span>
                <h2 style={{ font: "700 18px Manrope", margin: 0 }}>Tambah Transaksi Baru</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 0, background: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>Tipe Transaksi</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button type="button" className="secondary-button" style={{ background: "var(--green-soft)", borderColor: "var(--mint)" }}>
                    <ArrowUpRight size={14} /> Pengeluaran
                  </button>
                  <button type="button" className="secondary-button">
                    <ArrowDownLeft size={14} /> Pemasukan
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Jumlah Nominal (IDR)</label>
                <input type="text" defaultValue="Rp 150.000" />
                <small style={{ fontSize: "10px", color: "var(--muted)", marginTop: "4px", display: "block" }}>Format terisi otomatis dengan pemisah ribuan.</small>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Kategori</label>
                  <select defaultValue="Makanan & Minuman">
                    <option>Makanan & Minuman</option>
                    <option>Transportasi</option>
                    <option>Belanja & Retail</option>
                    <option>Tagihan & Utilitas</option>
                  </select>
                </div>
                <div className="field">
                  <label>Tanggal & Waktu</label>
                  <input type="text" defaultValue="11/28/2026, 08:15 PM" />
                </div>
              </div>

              <div className="field">
                <label>Deskripsi / Nama Merchant</label>
                <input type="text" defaultValue="Makan Siang Tim Engineering" />
              </div>

              <div className="field">
                <label>Catatan Tambahan (Opsional)</label>
                <input type="text" defaultValue="Biaya reimbursable project Sprint 4" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>Lampiran Struk / Bukti Transfer</label>
                <div style={{ border: "2px dashed var(--line)", borderRadius: "12px", padding: "20px", textAlign: "center", cursor: "pointer" }}>
                  <Upload size={24} style={{ color: "var(--muted)", marginBottom: "6px" }} />
                  <strong style={{ display: "block", fontSize: "12px" }}>Seret struk atau klik untuk unggah</strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>JPG, PNG, atau PDF hingga 5MB. AI OCR akan memverifikasi otomatis.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}