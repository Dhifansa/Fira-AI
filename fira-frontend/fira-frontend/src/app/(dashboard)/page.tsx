import { TrendingUp, TrendingDown, Activity, Filter, Plus, Cloud, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      {/* Top Bar / Quick Filter Contextual Bar */}
      <div className="dashboard-top-bar">
        <div className="filter-section">
          <div className="period-selector">
            <span className="period-label">Periode</span>
            <select className="period-dropdown">
              <option>November 2026</option>
              <option>Oktober 2026</option>
              <option>September 2026</option>
            </select>
          </div>
          <div className="filter-buttons">
            <button className="filter-btn">
              <Filter size={16} />
              Semua kategori
            </button>
            <button className="filter-btn">
              Semua akun
            </button>
          </div>
        </div>
        <button className="quick-add-btn">
          <Plus size={18} />
          Tambah transaksi
        </button>
      </div>

      {/* Primary Metrics Overview - 3 Cards */}
      <div className="metrics-overview">
        <div className="metric-card income-card">
          <div className="metric-header">
            <div className="metric-icon income-icon">
              <TrendingUp size={20} />
            </div>
            <span className="metric-label">Pemasukan</span>
          </div>
          <div className="metric-amount">Rp 8.500.000</div>
          <div className="metric-change positive">
            <TrendingUp size={14} />
            <span>+12% dari bulan lalu</span>
          </div>
          <div className="metric-period">November 2026</div>
        </div>

        <div className="metric-card expense-card">
          <div className="metric-header">
            <div className="metric-icon expense-icon">
              <TrendingDown size={20} />
            </div>
            <span className="metric-label">Pengeluaran</span>
          </div>
          <div className="metric-amount">Rp 3.250.000</div>
          <div className="metric-change negative">
            <TrendingDown size={14} />
            <span>-8% dari bulan lalu</span>
          </div>
          <div className="metric-period">November 2026</div>
        </div>

        <div className="metric-card cashflow-card">
          <div className="metric-header">
            <div className="metric-icon cashflow-icon">
              <Activity size={20} />
            </div>
            <span className="metric-label">Arus Kas Bersih</span>
          </div>
          <div className="metric-amount positive-amount">Rp 5.250.000</div>
          <div className="cashflow-status">
            <span className="status-badge positive">Sehat</span>
            <span className="status-text">Kondisi keuangan baik</span>
          </div>
        </div>
      </div>

      {/* Bento Section: Financial Weather & AI Auditor */}
      <div className="bento-section">
        <div className="weather-widget">
          <div className="widget-header">
            <div className="widget-title-group">
              <Cloud size={20} className="widget-icon" />
              <h3>Financial Weather</h3>
            </div>
            <button className="view-detail-btn">
              Lihat detail
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="weather-status">
            <div className="weather-main">
              <div className="weather-emoji">☀️</div>
              <div className="weather-info">
                <div className="weather-condition">Cerah</div>
                <div className="weather-description">Keuangan dalam kondisi stabil</div>
              </div>
            </div>
            <div className="weather-score">
              <div className="score-value">85</div>
              <div className="score-label">Skor kesehatan</div>
            </div>
          </div>
          <div className="weather-forecast">
            <div className="forecast-item">
              <span className="forecast-label">Minggu depan</span>
              <span className="forecast-icon">⛅</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-label">2 minggu</span>
              <span className="forecast-icon">☀️</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-label">Bulan depan</span>
              <span className="forecast-icon">🌤️</span>
            </div>
          </div>
        </div>

        <div className="ai-insights-widget">
          <div className="widget-header">
            <div className="widget-title-group">
              <Sparkles size={20} className="widget-icon" />
              <h3>AI Intelligence Highlights</h3>
            </div>
            <button className="view-detail-btn">
              Lihat semua
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="insights-list">
            <div className="insight-item priority-high">
              <AlertCircle size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">Pengeluaran transportasi meningkat 35%</div>
                <div className="insight-description">
                  Dibanding bulan lalu. Pertimbangkan untuk menggunakan transportasi umum.
                </div>
              </div>
            </div>
            <div className="insight-item priority-medium">
              <Sparkles size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">Potensi penghematan Rp 450.000</div>
                <div className="insight-description">
                  Ditemukan pola pengeluaran yang bisa dioptimalkan di kategori hiburan.
                </div>
              </div>
            </div>
            <div className="insight-item priority-low">
              <TrendingUp size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">Target tabungan tercapai 78%</div>
                <div className="insight-description">
                  Kamu sudah menabung Rp 3.120.000 dari target Rp 4.000.000.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}