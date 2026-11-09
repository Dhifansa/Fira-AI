export default function DashboardPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FIRA WORKSPACE</div>
          <h1>Ringkasan keuangan</h1>
          <p className="muted">
            Pantau kondisi keuangan dan kebiasaan finansialmu dalam satu tempat.
          </p>
        </div>
        <button className="primary-button">+ Tambah transaksi</button>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-top">
            <span>Total pemasukan</span>
          </div>
          <div className="stat-value">Rp 8.500.000</div>
          <div className="stat-foot positive">Bulan ini · data demo</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Total pengeluaran</span>
          </div>
          <div className="stat-value">Rp 3.250.000</div>
          <div className="stat-foot">Bulan ini · data demo</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Arus kas bersih</span>
          </div>
          <div className="stat-value">Rp 5.250.000</div>
          <div className="stat-foot positive">Positif</div>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Total anggaran</span>
          </div>
          <div className="stat-value">Rp 4.000.000</div>
          <div className="stat-foot">Periode November 2026</div>
        </div>
      </div>
    </>
  );
}