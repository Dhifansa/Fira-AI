"use client";

import { useState } from "react";
import { 
  Bot, 
  Send, 
  SlidersHorizontal, 
  Download, 
  RotateCcw, 
  UserCheck, 
  Trash2
} from "lucide-react";

export default function FinancialTwinPage() {
  const [messages, setMessages] = useState([
    {
      sender: "twin",
      time: "09:31 WIB",
      text: "Halo Dida! Saya kembaran finansial Anda. Saya telah menganalisis 38 transaksi bulan November Anda dengan total surplus arus kas berjalan sebesar Rp 5.430.000. Ada keputusan finansial atau pembelian yang ingin kita diskusikan hari ini?",
      isRich: false,
      metrics: null
    },
    {
      sender: "user",
      time: "09:33 WIB",
      text: "Bagaimana kondisi keuangan saya bulan ini dan apa yang perlu saya waspadai?",
      isRich: false,
      metrics: null
    },
    {
      sender: "twin",
      time: "09:34 WIB",
      isRich: true,
      text: "Kondisi keuangan Anda bulan ini berada di level SANGAT SEHAT. Pemasukan Rp 12.850.000 melampaui target bulanan (107%), didukung efisiensi belanja aktual sebesar Rp 7.420.000 (hanya 92.7% dari batas pagu anggaran Anda).",
      metrics: {
        pemasukan: "Rp 12.850.000",
        pengeluaran: "Rp 7.420.000",
        ketahanan: "6.4 Bulan"
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState("");

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const newMsgs = [
      ...messages,
      { sender: "user", time: "09:35 WIB", text: query, isRich: false, metrics: null }
    ];
    setMessages(newMsgs);
    setInputQuery("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "twin",
          time: "09:35 WIB",
          text: `FIRA AI Twin sedang memproses analisis kontekstual untuk: "${query}". Berdasarkan data ledger saat ini, pola arus kas Anda stabil dan aman.`,
          isRich: false,
          metrics: null
        }
      ]);
    }, 600);
  };

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">AI Advanced · Beta</span>
            <span>Kembaran cerdas berbasis profil keuangan pribadi Anda</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>AI Financial Twin</h1>
          <p className="muted">
            Memahami kebiasaan belanja, memproyeksikan arus kas, dan menjawab pertanyaan finansial kontekstual secara real-time.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RotateCcw size={14} /> Sinkron Ulang
          </button>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <SlidersHorizontal size={14} /> Kalibrasi AI
          </button>
        </div>
      </div>

      {/* Bar Status Sinkronisasi AI */}
      <div className="notice" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span>● <strong>Data Terakhir Disinkronkan:</strong> Hari ini, 09:30 WIB</span>
          <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green)", fontSize: "10px" }}>Akurasi Profil: 94% High Precision</span>
          <span>142 Transaksi Dianalisis (6 Bulan Terakhir)</span>
        </div>
        <span style={{ color: "var(--muted)" }}>End-to-End Encrypted Financial Model</span>
      </div>

      {/* Layout Utama 2 Kolom */}
      <div className="grid two-col" style={{ gridTemplateColumns: "1fr 1.3fr", gap: "20px", alignItems: "start" }}>
        
        {/* SISI KIRI: Profil Kembaran & Kebiasaan Finansial */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Card 1: Arketipe Finansial */}
          <div className="card">
            <div className="card-heading" style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="stat-icon"><UserCheck size={18} /></div>
                <div>
                  <span className="eyebrow" style={{ margin: 0 }}>ARKETIPE FINANSIAL</span>
                  <h3 style={{ font: "700 16px Manrope", margin: 0 }}>Balanced Wealth Builder</h3>
                </div>
              </div>
              <span className="pill" style={{ fontSize: "9px" }}>Tipe: Akumulator Waspada</span>
            </div>

            <div style={{ background: "var(--green-soft)", borderRadius: "12px", padding: "14px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700, display: "block" }}>SKOR KEMIRIPAN KEPUTUSAN</span>
                <span style={{ font: "800 24px Manrope", color: "var(--green)" }}>92%</span>
              </div>
              <p className="muted" style={{ fontSize: "10px", maxWidth: "200px", margin: 0, lineHeight: "1.4" }}>
                Model merefleksikan 92% kecenderungan Anda saat dihadapkan pada alokasi gaji, investasi impulsif, dan pembayaran kewajiban rutin.
              </p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center", fontSize: "11px" }}>
              <div style={{ border: "1px solid var(--line)", padding: "8px", borderRadius: "8px" }}>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Savings Rate</span>
                <strong>42.2%</strong>
              </div>
              <div style={{ border: "1px solid var(--line)", padding: "8px", borderRadius: "8px" }}>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Stabilitas Cash</span>
                <strong style={{ color: "var(--green)" }}>Sangat Baik</strong>
              </div>
              <div style={{ border: "1px solid var(--line)", padding: "8px", borderRadius: "8px" }}>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Profil Risiko</span>
                <strong>Moderat</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Kebiasaan & Pola Finansial Utama */}
          <div className="card">
            <div className="card-heading" style={{ marginBottom: "14px" }}>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>Kebiasaan & Pola Finansial Utama</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Terverifikasi AI</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ borderLeft: "3px solid var(--green)", paddingLeft: "10px" }}>
                <strong style={{ fontSize: "12px", display: "block" }}>Disiplin Tabungan Awal Bulan</strong>
                <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                  Konsisten menyisihkan tabungan di awal bulan (H+1 gajian) rata-rata Rp 4.500.000 sebelum alokasi gaya hidup.
                </p>
              </div>

              <div style={{ borderLeft: "3px solid var(--orange)", paddingLeft: "10px" }}>
                <strong style={{ fontSize: "12px", display: "block", color: "#a86a22" }}>Anomali Pengeluaran Akhir Pekan</strong>
                <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                  Peningkatan impulsif akhir pekan pada kategori F&B (+18% di atas rata-rata hari kerja).
                </p>
              </div>

              <div style={{ borderLeft: "3px solid var(--green)", paddingLeft: "10px" }}>
                <strong style={{ fontSize: "12px", display: "block" }}>Surplus Cash Flow Konsisten</strong>
                <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                  Cashflow bulanan selalu mencatat surplus rata-rata Rp 5.430.000/bulan dalam 4 bulan berturut-turut.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Potensi Kebocoran Halus */}
          <div className="card" style={{ background: "#fff0ef", borderColor: "#f9c6c4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <strong style={{ color: "var(--red)", fontSize: "12px" }}>Potensi Kebocoran Halus Terdeteksi</strong>
              <span className="pill danger" style={{ fontSize: "8px" }}>Perlu Tindakan</span>
            </div>
            <p style={{ fontSize: "10px", color: "#b95e58", margin: 0, lineHeight: "1.5" }}>
              Porsi langganan digital berulang terdeteksi di 4 platform (total Rp 380.000/bln) dengan frekuensi penggunaan sangat rendah (&lt; 2 kali/bulan).
            </p>
          </div>

        </div>

        {/* SISI KANAN: Chatbot Interface FIRA Twin Assistant */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "560px", padding: 0 }}>
          
          {/* Header Chat */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--green)", color: "#fff", display: "grid", placeItems: "center" }}>
                <Bot size={18} />
              </div>
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>FIRA Twin Assistant</strong>
                <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 600 }}>● Online · Menjawab berdasarkan data November 2026</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="secondary-button" style={{ padding: "4px 8px", fontSize: "10px" }} onClick={() => setMessages([])}>
                <Trash2 size={12} /> Bersihkan
              </button>
              <button className="secondary-button" style={{ padding: "4px 8px", fontSize: "10px" }}>
                <Download size={12} /> Ekspor Transkrip
              </button>
            </div>
          </div>

          {/* Prompt Chips Recommendation */}
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--line)", background: "#f9fafb", display: "flex", gap: "8px", overflowX: "auto" }}>
            <span style={{ fontSize: "10px", color: "var(--muted)", alignSelf: "center", whiteSpace: "nowrap" }}>Saran Tanya:</span>
            {[
              "Bagaimana kondisi keuangan saya bulan ini?",
              "Mengapa pengeluaran akhir pekan naik?",
              "Apakah tabungan saya cukup aman?"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="secondary-button"
                style={{ fontSize: "10px", padding: "4px 10px", whiteSpace: "nowrap", borderRadius: "16px", background: "#fff" }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Area Pesan Chat */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600 }}>
                    {msg.sender === "user" ? "Anda" : "FIRA Twin"}
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--muted)" }}>{msg.time}</span>
                </div>

                <div
                  style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    background: msg.sender === "user" ? "var(--green)" : "#f3f4f6",
                    color: msg.sender === "user" ? "#fff" : "var(--ink)",
                    borderBottomRightRadius: msg.sender === "user" ? "2px" : "14px",
                    borderBottomLeftRadius: msg.sender === "twin" ? "2px" : "14px"
                  }}
                >
                  {msg.text}

                  {msg.isRich && msg.metrics && (
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <span className="pill" style={{ background: "var(--green-soft)", color: "var(--green)", fontSize: "9px" }}>Status: AMAN</span>
                        <span className="pill" style={{ background: "#fff", fontSize: "9px" }}>Skor Kesehatan: 88/100</span>
                      </div>
                      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", background: "#fff", padding: "8px", borderRadius: "8px", color: "var(--ink)", textAlign: "center" }}>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Total Pemasukan</span>
                          <strong style={{ fontSize: "11px" }}>{msg.metrics.pemasukan}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Realisasi Belanja</span>
                          <strong style={{ fontSize: "11px" }}>{msg.metrics.pengeluaran}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>Bantalan Dana</span>
                          <strong style={{ fontSize: "11px", color: "var(--green)" }}>{msg.metrics.ketahanan}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Area Input Chat */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", background: "#fff" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: "flex", gap: "10px", alignItems: "center" }}
            >
              <input
                type="text"
                placeholder="Tanyakan apa saja seputar pengeluaran, tabungan, atau proyeksi finansial..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                style={{ flex: 1, height: "42px", borderRadius: "10px", padding: "0 14px", fontSize: "12px" }}
              />
              <button
                type="submit"
                className="primary-button"
                style={{ height: "42px", width: "42px", padding: 0, display: "grid", placeItems: "center", borderRadius: "10px" }}
              >
                <Send size={16} />
              </button>
            </form>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "10px", color: "var(--muted)" }}>
              <span>Respons AI Twin didasarkan pada data terenkripsi dan kebijakan privasi FIRA.</span>
              <span>Tekan Enter untuk kirim</span>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}