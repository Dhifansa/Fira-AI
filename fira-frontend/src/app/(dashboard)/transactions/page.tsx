"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Pencil,
  Trash2,
  Car,
  Briefcase,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Utensils,
} from "lucide-react";
import AddTransactionModal from "@/components/modals/AddTransactionModals";
import { getAuthToken, transactionApi } from "@/lib/api";
import { formatDate, formatRupiah } from "@/lib/format";
import type { TransactionItem } from "@/types";

const DEMO_TRANSACTIONS: TransactionItem[] = [
  {
    transaction_id: "demo-1",
    user_id: "demo",
    category_id: "cat-1",
    category_name: "Transportasi",
    type: "expense",
    amount: "250000",
    description: "Pertamax Turbo · SPBU Pertamina Kuningan",
    transaction_date: "2026-11-22",
  },
  {
    transaction_id: "demo-2",
    user_id: "demo",
    category_id: "cat-2",
    category_name: "Pendapatan Bisnis",
    type: "income",
    amount: "2350000",
    description: "Pembayaran Invoice Konsultasi · Klien Studio Rekacipta",
    transaction_date: "2026-11-20",
  },
  {
    transaction_id: "demo-3",
    user_id: "demo",
    category_id: "cat-3",
    category_name: "Belanja & Retail",
    type: "expense",
    amount: "1120000",
    description: "Peralatan Kantor & Ergonomi · Tokopedia Official Store",
    transaction_date: "2026-11-18",
  },
  {
    transaction_id: "demo-4",
    user_id: "demo",
    category_id: "cat-4",
    category_name: "Tagihan & Utilitas",
    type: "expense",
    amount: "850000",
    description: "Tagihan Listrik PLN & Wifi · Autodebet BCA Virtual Account",
    transaction_date: "2026-11-15",
  },
];

function getCategoryIcon(categoryName: string, type: string) {
  const lower = categoryName.toLowerCase();
  if (lower.includes("transport")) return <Car size={16} />;
  if (lower.includes("makan") || lower.includes("f&b")) return <Utensils size={16} />;
  if (lower.includes("tagihan") || lower.includes("utilitas") || lower.includes("rumah")) {
    return <Zap size={16} />;
  }
  if (type === "income" || lower.includes("pendapatan") || lower.includes("penghasilan")) {
    return <Briefcase size={16} />;
  }
  return <ShoppingBag size={16} />;
}

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>(DEMO_TRANSACTIONS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchTransactions = useCallback(async () => {
    await Promise.resolve();
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setTransactions(DEMO_TRANSACTIONS);
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const list = await transactionApi.getAll();
      setTransactions(list);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat data transaksi."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      void fetchTransactions();
    };
    handleUpdate();
    window.addEventListener("fira-transactions-updated", handleUpdate);
    window.addEventListener("fira-auth-change", handleUpdate);
    return () => {
      window.removeEventListener("fira-transactions-updated", handleUpdate);
      window.removeEventListener("fira-auth-change", handleUpdate);
    };
  }, [fetchTransactions]);

  const handleDelete = async (tx: TransactionItem) => {
    if (!isAuthenticated || tx.transaction_id.startsWith("demo-")) {
      setTransactions((prev) =>
        prev.filter((item) => item.transaction_id !== tx.transaction_id)
      );
      return;
    }

    try {
      await transactionApi.remove(tx.transaction_id);
      await fetchTransactions();
      window.dispatchEvent(new Event("fira-transactions-updated"));
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus transaksi."
      );
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const desc = (tx.description || "").toLowerCase();
        const cat = (tx.category_name || "").toLowerCase();
        if (!desc.includes(q) && !cat.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, searchQuery]);

  const { totalIncome, totalExpense } = useMemo(() => {
    if (!isAuthenticated && transactions === DEMO_TRANSACTIONS) {
      return { totalIncome: 14850000, totalExpense: 6420000 };
    }
    return transactions.reduce(
      (acc, tx) => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === "income") acc.totalIncome += amt;
        else acc.totalExpense += amt;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [transactions, isAuthenticated]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const cycleFilter = () => {
    setCurrentPage(1);
    setTypeFilter((prev) =>
      prev === "all" ? "expense" : prev === "expense" ? "income" : "all"
    );
  };

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
          onClick={() => {
            setEditingTx(null);
            setIsModalOpen(true);
          }}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Tambah Transaksi
        </button>
      </div>

      {errorMsg && (
        <div
          className="notice"
          style={{
            marginBottom: "16px",
            background: "#fff0ef",
            borderColor: "#f9c6c4",
            color: "#b95e58",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Metric Cards Ringkasan */}
      <div className="grid two-col" style={{ marginBottom: "20px" }}>
        <div className="card stat-card">
          <div className="stat-top">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowDownLeft size={16} className="positive" />
              <span>TOTAL PEMASUKAN</span>
            </div>
            <span className="pill">+{formatRupiah(totalIncome)}</span>
          </div>
          <div className="stat-value positive">{formatRupiah(totalIncome)}</div>
          <div className="stat-foot">Terverifikasi sistem</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowUpRight size={16} style={{ color: "var(--red)" }} />
              <span>TOTAL PENGELUARAN</span>
            </div>
            <span className="pill warning">-{formatRupiah(totalExpense)}</span>
          </div>
          <div className="stat-value" style={{ color: "var(--red)" }}>
            {formatRupiah(totalExpense)}
          </div>
          <div className="stat-foot">Dalam batas aman pagu</div>
        </div>
      </div>

      {/* Area Tabel Utama & Filter */}
      <div className="card">
        {/* Bar Toolbar Filter & Cari */}
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              maxWidth: "560px",
            }}
          >
            <div className="field" style={{ flex: 1, margin: 0 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Cari transaksi, merchant, kategori..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ paddingLeft: "36px", height: "38px" }}
                />
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "11px",
                    color: "var(--muted)",
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={cycleFilter}
              className="secondary-button"
              style={{
                height: "38px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 12px",
              }}
            >
              <Filter size={14} />{" "}
              {typeFilter === "all"
                ? "Semua Tipe"
                : typeFilter === "expense"
                ? "Pengeluaran"
                : "Pemasukan"}
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    Memuat transaksi dari server FIRA...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    Belum ada transaksi yang sesuai filter. Klik &ldquo;Tambah
                    Transaksi&rdquo; untuk mencatat transaksi baru.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const parts = (tx.description || tx.category_name).split("·");
                  const mainTitle = parts[0]?.trim() || tx.category_name;
                  const subTitle =
                    parts.slice(1).join("·").trim() || tx.category_name;

                  return (
                    <tr key={tx.transaction_id}>
                      <td>
                        <strong style={{ fontSize: "12px", display: "block" }}>
                          {formatDate(tx.transaction_date)}
                        </strong>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                          Tercatat
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            className="stat-icon"
                            style={{ width: "32px", height: "32px" }}
                          >
                            {getCategoryIcon(tx.category_name, tx.type)}
                          </div>
                          <div>
                            <strong style={{ display: "block" }}>
                              {mainTitle}
                            </strong>
                            <span
                              style={{ fontSize: "10px", color: "var(--muted)" }}
                            >
                              {subTitle}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pill">{tx.category_name}</span>
                      </td>
                      <td>
                        {tx.type === "expense" ? (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--red)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <ArrowUpRight size={14} /> Pengeluaran
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--green)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <ArrowDownLeft size={14} /> Pemasukan
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <strong
                          className={`amount ${
                            tx.type === "expense" ? "expense" : "income"
                          }`}
                        >
                          {tx.type === "expense" ? "- " : "+ "}
                          {formatRupiah(Number(tx.amount))}
                        </strong>
                      </td>
                      <td>
                        <span className="pill">Selesai</span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                            color: "var(--muted)",
                          }}
                        >
                          <button
                            type="button"
                            title="Detail / Edit"
                            onClick={() => {
                              setEditingTx(tx);
                              setIsModalOpen(true);
                            }}
                            style={{ border: 0, background: "none" }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            title="Edit Transaksi"
                            onClick={() => {
                              setEditingTx(tx);
                              setIsModalOpen(true);
                            }}
                            style={{ border: 0, background: "none" }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            title="Hapus Transaksi"
                            onClick={() => handleDelete(tx)}
                            style={{ border: 0, background: "none" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "18px",
            paddingTop: "14px",
            borderTop: "1px solid var(--line)",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            Menampilkan {paginatedTransactions.length} dari{" "}
            {filteredTransactions.length} entri
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className="secondary-button"
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    background:
                      currentPage === page ? "var(--green-soft)" : "white",
                  }}
                >
                  {page}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Catatan Status Integrasi */}
      <div
        className="notice"
        style={{
          marginTop: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} className="positive" />
          {isAuthenticated ? (
            <span>
              <strong>Terhubung ke Backend FIRA Core:</strong> Seluruh transaksi
              disinkronkan secara langsung dengan database PostgreSQL.
            </span>
          ) : (
            <span>
              <strong>Mode Pratinjau Prototipe:</strong>{" "}
              <Link href="/login" className="text-link">
                Masuk ke akun Anda
              </Link>{" "}
              untuk menyimpan dan mengelola transaksi langsung di database FIRA.
            </span>
          )}
        </div>
        <span
          style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}
        >
          Engine: FIRA-Safe Ledger 1.0
        </span>
      </div>

      {/* Modal Form Tambah / Edit Transaksi */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        initialData={editingTx}
        onSuccess={() => {
          fetchTransactions();
        }}
      />
    </>
  );
}
