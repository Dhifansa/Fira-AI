"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Send,
  SlidersHorizontal,
  Download,
  RotateCcw,
  UserCheck,
  Trash2,
} from "lucide-react";
import { aiApi } from "@/lib/api";
import type { FinancialTwinData, TwinChatMessage } from "@/types";

const INITIAL_TWIN_DATA: FinancialTwinData = {
  syncedAt: "Belum Ada Data",
  periodLabel: "Periode Berjalan",
  hasRealData: false,
  analyzedTransactionsCount: 0,
  accuracyLabel: "Akurasi Profil: 0% (Menunggu Input Transaksi)",
  archetype: {
    title: "Belum Terbentuk (Data Kosong)",
    badge: "Tipe: Menunggu Data",
    similarityScore: 0,
    description:
      "Belum ada histori transaksi untuk membentuk model kembaran finansial. Semua indikator dimulai dari Rp 0.",
    savingsRate: "0%",
    cashStability: "Belum Ada Data",
    riskProfile: "Moderat",
  },
  habits: [
    {
      id: "h1",
      type: "normal",
      title: "Belum Ada Pola Transaksi",
      description:
        "Pemasukan Rp 0 dan Pengeluaran Rp 0. Pola kebiasaan finansial akan muncul otomatis setelah Anda mengisi transaksi.",
    },
  ],
  leakAlert: {
    title: "Belum Ada Kebocoran Kas",
    badge: "Rp 0",
    description:
      "Total pengeluaran masih Rp 0. Tidak ada kebocoran kas yang terdeteksi.",
  },
  initialMessages: [
    {
      sender: "twin",
      time: "Online",
      text: "Halo! Saat ini saldo dan transaksi Anda masih Rp 0 (0 transaksi tercatat). Silakan tambahkan transaksi pemasukan atau pengeluaran Anda terlebih dahulu, atau tanyakan apa saja seputar perencanaan keuangan kepada saya!",
      isRich: true,
      metrics: {
        pemasukan: "Rp 0",
        pengeluaran: "Rp 0",
        ketahanan: "0 Bulan",
        healthScore: "0/100",
        status: "RP 0",
      },
    },
  ],
};

const RISK_PROFILES = ["Konservatif", "Moderat", "Agresif"];

export default function FinancialTwinPage() {
  const [twinData, setTwinData] = useState<FinancialTwinData>(INITIAL_TWIN_DATA);
  const [messages, setMessages] = useState<TwinChatMessage[]>(INITIAL_TWIN_DATA.initialMessages);
  const [inputQuery, setInputQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [riskIdx, setRiskIdx] = useState(1);

  const loadTwinProfile = useCallback(async (riskOverride?: string) => {
    await Promise.resolve();
    setIsSyncing(true);
    try {
      const data = await aiApi.getFinancialTwin(riskOverride);
      setTwinData(data);
      setMessages(data.initialMessages);
    } catch {
      // Gunakan fallback profil lokal jika backend belum merespons
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      void loadTwinProfile();
    };
    const timer = window.setTimeout(handleSync, 0);
    window.addEventListener("fira-transactions-updated", handleSync);
    window.addEventListener("fira-auth-change", handleSync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("fira-transactions-updated", handleSync);
      window.removeEventListener("fira-auth-change", handleSync);
    };
  }, [loadTwinProfile]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isSending) return;

    const nowTime =
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB";

    const userMsg: TwinChatMessage = {
      sender: "user",
      time: nowTime,
      text: query,
      isRich: false,
      metrics: null,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) {
      setInputQuery("");
    }
    setIsSending(true);

    try {
      const res = await aiApi.chatFinancialTwin(query, messages);
      setMessages((prev) => [...prev, res.reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "twin",
          time: nowTime,
          text: `Berdasarkan data buku kas Anda untuk "${query}", pola arus kas Anda saat ini tercatat dengan rasio tabungan ${twinData.archetype.savingsRate} dan stabilitas kas ${twinData.archetype.cashStability}.`,
          isRich: false,
          metrics: null,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCalibrateRisk = async () => {
    const nextIdx = (riskIdx + 1) % RISK_PROFILES.length;
    setRiskIdx(nextIdx);
    const nextRisk = RISK_PROFILES[nextIdx];
    await loadTwinProfile(nextRisk);

    const nowTime =
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB";

    setMessages((prev) => [
      ...prev,
      {
        sender: "twin",
        time: nowTime,
        text: `Kalibrasi profil AI berhasil diperbarui ke mode "${nextRisk}". Seluruh rekomendasi alokasi tabungan, toleransi investasi, dan batas pengeluaran kini disesuaikan dengan profil risiko ${nextRisk}.`,
        isRich: false,
        metrics: null,
      },
    ]);
  };

  const handleExportTranscript = () => {
    const content = messages
      .map(
        (m) =>
          `[${m.time}] ${m.sender === "user" ? "Anda" : "FIRA Twin"}: ${m.text}${
            m.metrics
              ? `\n   -> Pemasukan: ${m.metrics.pemasukan} | Pengeluaran: ${m.metrics.pengeluaran} | Ketahanan: ${m.metrics.ketahanan}`
              : ""
          }`
      )
      .join("\n\n");

    const blob = new Blob(
      [`TRANSKRIP KONSULTASI AI FINANCIAL TWIN - FIRA\n==============================================\n\n${content}\n`],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transkrip-fira-financial-twin.txt";
    a.click();
    URL.revokeObjectURL(url);
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
              <span className="badge-desc">
                Kembaran cerdas berbasis profil keuangan pribadi Anda
              </span>
            </div>
            <h1 className="header-title">AI Financial Twin</h1>
            <p className="header-subtitle">
              Memahami kebiasaan belanja, memproyeksikan arus kas, dan menjawab pertanyaan finansial
              kontekstual secara real-time.
            </p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              onClick={() => void loadTwinProfile(RISK_PROFILES[riskIdx])}
              disabled={isSyncing}
              className="btn-secondary"
            >
              <RotateCcw size={16} />
              <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Ulang"}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleCalibrateRisk()}
              className="btn-primary"
            >
              <SlidersHorizontal size={16} />
              <span>Kalibrasi AI ({twinData.archetype.riskProfile})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bar Status Sinkronisasi AI */}
      <div className="sync-status-bar">
        <div className="sync-info-left">
          <div className="sync-info-item">
            <span className="sync-status-dot"></span>
            <span>
              <strong>Data Terakhir Disinkronkan:</strong> {twinData.syncedAt}
            </span>
          </div>
          <span className="badge-accuracy">{twinData.accuracyLabel}</span>
          <span>
            {twinData.analyzedTransactionsCount} Transaksi Dianalisis (
            {twinData.hasRealData ? "Database Aktual" : "6 Bulan Terakhir"})
          </span>
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
                  <h3 className="twin-card-title">{twinData.archetype.title}</h3>
                </div>
              </div>
              <span className="badge-archetype">{twinData.archetype.badge}</span>
            </div>

            <div className="similarity-score-box">
              <div>
                <div className="score-label">SKOR KEMIRIPAN KEPUTUSAN</div>
                <div className="score-number">{twinData.archetype.similarityScore}%</div>
              </div>
              <p className="score-description">{twinData.archetype.description}</p>
            </div>

            <div className="metrics-mini-grid">
              <div className="metric-mini-box">
                <span className="metric-mini-label">Savings Rate</span>
                <strong className="metric-mini-value">{twinData.archetype.savingsRate}</strong>
              </div>
              <div className="metric-mini-box">
                <span className="metric-mini-label">Stabilitas Cash</span>
                <strong className="metric-mini-value positive">
                  {twinData.archetype.cashStability}
                </strong>
              </div>
              <div className="metric-mini-box">
                <span className="metric-mini-label">Profil Risiko</span>
                <strong className="metric-mini-value">{twinData.archetype.riskProfile}</strong>
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
              {twinData.habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`habit-item ${habit.type === "warning" ? "warning" : ""}`}
                >
                  <strong className={`habit-title ${habit.type === "warning" ? "warning" : ""}`}>
                    {habit.title}
                  </strong>
                  <p className="habit-description">{habit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Potensi Kebocoran Halus */}
          <div className="leak-alert-card">
            <div className="leak-alert-header">
              <strong className="leak-alert-title">{twinData.leakAlert.title}</strong>
              <span className="badge-action">{twinData.leakAlert.badge}</span>
            </div>
            <p className="leak-alert-description">{twinData.leakAlert.description}</p>
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
                  <span>Online · Menjawab berdasarkan data {twinData.periodLabel}</span>
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-btn-small"
                onClick={() => setMessages(twinData.initialMessages)}
              >
                <Trash2 size={12} />
                <span>Bersihkan</span>
              </button>
              <button
                type="button"
                className="chat-btn-small"
                onClick={handleExportTranscript}
              >
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
              "Mengapa pengeluaran terbesar saya naik?",
              "Apakah tabungan darurat saya cukup aman?",
              "Bagaimana status budget & target finansial saya?",
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => void handleSend(prompt)}
                disabled={isSending}
                className="prompt-chip"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Area Pesan Chat */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
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
                        <span className="message-badge">
                          Status: {msg.metrics.status || "AMAN"}
                        </span>
                        <span className="message-badge neutral">
                          Skor Kesehatan: {msg.metrics.healthScore || "88/100"}
                        </span>
                      </div>
                      <div className="message-metrics-grid">
                        <div className="message-metric-item">
                          <span className="message-metric-label">Total Pemasukan</span>
                          <strong className="message-metric-value">{msg.metrics.pemasukan}</strong>
                        </div>
                        <div className="message-metric-item">
                          <span className="message-metric-label">Realisasi Belanja</span>
                          <strong className="message-metric-value">
                            {msg.metrics.pengeluaran}
                          </strong>
                        </div>
                        <div className="message-metric-item">
                          <span className="message-metric-label">Bantalan Dana</span>
                          <strong className="message-metric-value positive">
                            {msg.metrics.ketahanan}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="message-wrapper twin">
                <div className="message-meta">
                  <span className="message-sender">FIRA Twin</span>
                  <span className="message-time">Memproses...</span>
                </div>
                <div className="message-bubble">
                  Sedang menganalisis data buku kas & indikator finansial Anda...
                </div>
              </div>
            )}
          </div>

          {/* Area Input Chat */}
          <div className="chat-input-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="chat-input-form"
            >
              <input
                type="text"
                placeholder="Tanyakan apa saja seputar pengeluaran, tabungan, budget, atau proyeksi finansial..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isSending}
                className="chat-input-field"
              />
              <button type="submit" disabled={isSending} className="chat-send-button">
                <Send size={18} />
              </button>
            </form>
            <div className="chat-input-footer">
              <span>Respons AI Twin didasarkan pada data buku kas PostgreSQL dan analitik FIRA.</span>
              <span>Tekan Enter untuk kirim</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
