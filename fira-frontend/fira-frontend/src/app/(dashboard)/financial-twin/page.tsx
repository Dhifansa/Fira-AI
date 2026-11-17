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
      {/* Section - Top Banner / Header Info */}
      <div className="financial-twin-header">
        <div className="breadcrumb-nav">
          <span className="breadcrumb-item">Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">AI Financial Twin</span>
        </div>
        
        <div className="header-main">
          <div className="header-content">
            <div className="header-badges">
              <span className="badge-ai">AI Advanced · Beta</span>
              <span className="badge-desc">Kembaran cerdas berbasis profil keuangan pribadi Anda</span>
            </div>
            <h1 className="header-title">AI Financial Twin</h1>
            <p className="header-subtitle">
              Memahami kebiasaan belanja, memproyeksikan arus kas, dan menjawab pertanyaan finansial kontekstual secara real-time.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <RotateCcw size={16} />
              <span>Sinkron Ulang</span>
            </button>
            <button className="btn-primary">
              <SlidersHorizontal size={16} />
              <span>Kalibrasi AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bar Status Sinkronisasi AI */}
      <div className="sync-status-bar">
        <div className="sync-info-left">
          <div className="sync-info-item">
            <span className="sync-status-dot"></span>
            <span><strong>Data Terakhir Disinkronkan:</strong> Hari ini, 09:30 WIB</span>
          </div>
          <span className="badge-accuracy">Akurasi Profil: 94% High Precision</span>
          <span>142 Transaksi Dianalisis (6 Bulan Terakhir)</span>
        </div>
        <div className="sync-info-right">End-to-End Encrypted Financial Model</div>
      </div>

      {/* Layout Utama 2 Kolom */}
      <div className="twin-layout">
        
        {/* SISI KIRI: Profil Kembaran & Kebiasaan Finansial */}
        <div className="twin-sidebar">
          
          {/* Card 1: Arketipe Finansial */}
          <div className="twin-card">
            <div className="twin-card-header">
              <div className="twin-card-title-group">
                <div className="twin-icon-wrapper">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="twin-card-label">ARKETIPE FINANSIAL</div>
                  <h3 className="twin-card-title">Balanced Wealth Builder</h3>
                </div>
              </div>
              <span className="badge-archetype">Tipe: Akumulator Waspada</span>
            </div>

            <div className="similarity-score-box">
              <div>
                <div className="score-label">SKOR KEMIRIPAN KEPUTUSAN</div>
                <div className="score-number">92%</div>
              </div>
              <p className="score-description">
                Model merefleksikan 92% kecenderungan Anda saat dihadapkan pada alokasi gaji, investasi impulsif, dan pembayaran kewajiban rutin.
              </p>
            </div>

            <div className="metrics-mini-grid">
              <div className="metric-mini-box">
                <span className="metric-mini-label">Savings Rate</span>
                <strong className="metric-mini-value">42.2%</strong>
              </div>
              <div className="metric-mini-box">
                <span className="metric-mini-label">Stabilitas Cash</span>
                <strong className="metric-mini-value positive">Sangat Baik</strong>
              </div>
              <div className="metric-mini-box">
                <span className="metric-mini-label">Profil Risiko</span>
                <strong className="metric-mini-value">Moderat</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Kebiasaan & Pola Finansial Utama */}
          <div className="twin-card">
            <div className="twin-card-header">
              <div>
                <h3 className="twin-card-title">Kebiasaan & Pola Finansial Utama</h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>Terverifikasi AI</span>
              </div>
            </div>

            <div className="habits-list">
              <div className="habit-item">
                <strong className="habit-title">Disiplin Tabungan Awal Bulan</strong>
                <p className="habit-description">
                  Konsisten menyisihkan tabungan di awal bulan (H+1 gajian) rata-rata Rp 4.500.000 sebelum alokasi gaya hidup.
                </p>
              </div>

              <div className="habit-item warning">
                <strong className="habit-title warning">Anomali Pengeluaran Akhir Pekan</strong>
                <p className="habit-description">
                  Peningkatan impulsif akhir pekan pada kategori F&B (+18% di atas rata-rata hari kerja).
                </p>
              </div>

              <div className="habit-item">
                <strong className="habit-title">Surplus Cash Flow Konsisten</strong>
                <p className="habit-description">
                  Cashflow bulanan selalu mencatat surplus rata-rata Rp 5.430.000/bulan dalam 4 bulan berturut-turut.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Potensi Kebocoran Halus */}
          <div className="leak-alert-card">
            <div className="leak-alert-header">
              <strong className="leak-alert-title">Potensi Kebocoran Halus Terdeteksi</strong>
              <span className="badge-action">Perlu Tindakan</span>
            </div>
            <p className="leak-alert-description">
              Porsi langganan digital berulang terdeteksi di 4 platform (total Rp 380.000/bln) dengan frekuensi penggunaan sangat rendah (&lt; 2 kali/bulan).
            </p>
          </div>

        </div>

        {/* SISI KANAN: Chatbot Interface FIRA Twin Assistant */}
        <div className="twin-chat-container">
          
          {/* Header Chat */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <Bot size={20} />
              </div>
              <div className="chat-header-info">
                <div className="chat-header-title">FIRA Twin Assistant</div>
                <div className="chat-status">
                  <span>●</span>
                  <span>Online · Menjawab berdasarkan data November 2026</span>
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-btn-small" onClick={() => setMessages([])}>
                <Trash2 size={12} />
                <span>Bersihkan</span>
              </button>
              <button className="chat-btn-small">
                <Download size={12} />
                <span>Ekspor Transkrip</span>
              </button>
            </div>
          </div>

          {/* Prompt Chips Recommendation */}
          <div className="prompt-chips-bar">
            <span className="prompt-chips-label">Saran Tanya:</span>
            {[
              "Bagaimana kondisi keuangan saya bulan ini?",
              "Mengapa pengeluaran akhir pekan naik?",
              "Apakah tabungan saya cukup aman?"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="prompt-chip"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Area Pesan Chat */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.sender}`}
              >
                <div className="message-meta">
                  <span className="message-sender">
                    {msg.sender === "user" ? "Anda" : "FIRA Twin"}
                  </span>
                  <span className="message-time">{msg.time}</span>
                </div>

                <div className="message-bubble">
                  {msg.text}

                  {msg.isRich && msg.metrics && (
                    <div className="message-rich-content">
                      <div className="message-badges">
                        <span className="message-badge">Status: AMAN</span>
                        <span className="message-badge neutral">Skor Kesehatan: 88/100</span>
                      </div>
                      <div className="message-metrics-grid">
                        <div className="message-metric-item">
                          <span className="message-metric-label">Total Pemasukan</span>
                          <strong className="message-metric-value">{msg.metrics.pemasukan}</strong>
                        </div>
                        <div className="message-metric-item">
                          <span className="message-metric-label">Realisasi Belanja</span>
                          <strong className="message-metric-value">{msg.metrics.pengeluaran}</strong>
                        </div>
                        <div className="message-metric-item">
                          <span className="message-metric-label">Bantalan Dana</span>
                          <strong className="message-metric-value positive">{msg.metrics.ketahanan}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Area Input Chat */}
          <div className="chat-input-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="chat-input-form"
            >
              <input
                type="text"
                placeholder="Tanyakan apa saja seputar pengeluaran, tabungan, atau proyeksi finansial..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="chat-input-field"
              />
              <button
                type="submit"
                className="chat-send-button"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="chat-input-footer">
              <span>Respons AI Twin didasarkan pada data terenkripsi dan kebijakan privasi FIRA.</span>
              <span>Tekan Enter untuk kirim</span>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}