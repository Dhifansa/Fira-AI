"use client";

import { useEffect, useState } from "react";
import { X, Upload, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import {
  categoryApi,
  getAuthToken,
  normalizeDateToYMD,
  parseNominalInput,
  transactionApi,
} from "@/lib/api";
import type { Category, CategoryType, TransactionItem } from "@/types";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transaction: TransactionItem) => void;
  initialData?: TransactionItem | null;
}

const FALLBACK_CATEGORIES: Category[] = [
  { category_id: "fallback-exp-1", name: "Makanan & Minuman", type: "expense" },
  { category_id: "fallback-exp-2", name: "Transportasi", type: "expense" },
  { category_id: "fallback-exp-3", name: "Rumah & Utilitas", type: "expense" },
  { category_id: "fallback-exp-4", name: "Belanja & Retail", type: "expense" },
  { category_id: "fallback-exp-5", name: "Tagihan & Utilitas", type: "expense" },
  { category_id: "fallback-exp-6", name: "Hiburan & Gaya Hidup", type: "expense" },
  { category_id: "fallback-inc-1", name: "Penghasilan Tetap", type: "income" },
  { category_id: "fallback-inc-2", name: "Pendapatan Bisnis", type: "income" },
  { category_id: "fallback-inc-3", name: "Pendapatan Sampingan", type: "income" },
];

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}: AddTransactionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<CategoryType>("expense");
  const [amount, setAmount] = useState<string>("150000");
  const [categoryId, setCategoryId] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadCategoriesAndInit = async () => {
      await Promise.resolve();
      setErrorMsg(null);
      if (initialData) {
        setType(initialData.type);
        setAmount(String(Math.round(Number(initialData.amount))));
        setCategoryId(initialData.category_id);
        setTransactionDate(normalizeDateToYMD(initialData.transaction_date));
        setDescription(initialData.description || "");
        setNotes("");
      } else {
        setType("expense");
        setAmount("150000");
        setTransactionDate(new Date().toISOString().slice(0, 10));
        setDescription("");
        setNotes("");
      }

      if (!getAuthToken()) {
        setCategories(FALLBACK_CATEGORIES);
        return;
      }
      try {
        const list = await categoryApi.getAll();
        setCategories(list.length > 0 ? list : FALLBACK_CATEGORIES);
      } catch {
        setCategories(FALLBACK_CATEGORIES);
      }
    };

    loadCategoriesAndInit();
  }, [isOpen, initialData]);

  const filteredCategories = categories.filter((c) => c.type === type);
  const activeCategoryId = filteredCategories.some(
    (c) => c.category_id === categoryId
  )
    ? categoryId
    : filteredCategories[0]?.category_id || "";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!getAuthToken()) {
      setErrorMsg("Silakan login terlebih dahulu untuk menyimpan transaksi ke database.");
      return;
    }

    const numericAmount = parseNominalInput(amount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg("Jumlah nominal transaksi harus lebih besar dari 0.");
      return;
    }

    if (!activeCategoryId || activeCategoryId.startsWith("fallback-")) {
      setErrorMsg("Pilih kategori transaksi yang valid.");
      return;
    }

    const fullDescription = [description.trim(), notes.trim()]
      .filter(Boolean)
      .join(" · ");

    try {
      setIsSubmitting(true);
      let saved: TransactionItem;
      if (initialData) {
        saved = await transactionApi.update(initialData.transaction_id, {
          category_id: activeCategoryId,
          type,
          amount: numericAmount,
          description: fullDescription || null,
          transaction_date: normalizeDateToYMD(transactionDate),
        });
      } else {
        saved = await transactionApi.create({
          category_id: activeCategoryId,
          type,
          amount: numericAmount,
          description: fullDescription || null,
          transaction_date: normalizeDateToYMD(transactionDate),
        });
      }

      window.dispatchEvent(new Event("fira-transactions-updated"));
      if (onSuccess) {
        onSuccess(saved);
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan transaksi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#fff",
          height: "100vh",
          padding: "24px",
          overflowY: "auto",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--line)",
            paddingBottom: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <span className="eyebrow">FORM TRANSAKSI</span>
            <h2 style={{ font: "700 18px Manrope", margin: 0 }}>
              {initialData ? "Edit Transaksi" : "Tambah Transaksi Baru"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 0, background: "none", cursor: "pointer" }}
          >
            <X size={20} />
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
              fontSize: "12px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Tipe Transaksi
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setType("expense")}
                className="secondary-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background:
                    type === "expense" ? "var(--green-soft)" : "white",
                  borderColor:
                    type === "expense" ? "var(--mint)" : "#dce9e1",
                }}
              >
                <ArrowUpRight size={14} /> Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className="secondary-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background:
                    type === "income" ? "var(--green-soft)" : "white",
                  borderColor:
                    type === "income" ? "var(--mint)" : "#dce9e1",
                }}
              >
                <ArrowDownLeft size={14} /> Pemasukan
              </button>
            </div>
          </div>

          <div className="field">
            <label>Jumlah Nominal (IDR)</label>
            <input
              type="text"
              placeholder="Contoh: 150000 atau Rp 150.000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <small
              style={{
                fontSize: "10px",
                color: "var(--muted)",
                marginTop: "4px",
                display: "block",
              }}
            >
              Masukkan angka nominal transaksi dalam Rupiah.
            </small>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Kategori</label>
              <select
                value={activeCategoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Tanggal Transaksi</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Deskripsi / Nama Merchant</label>
            <input
              type="text"
              placeholder="Contoh: Makan Siang / SPBU Pertamina"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              placeholder="Catatan tambahan transaksi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Lampiran Struk / Bukti Transfer
            </label>
            <div
              style={{
                border: "2px dashed var(--line)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <Upload
                size={24}
                style={{ color: "var(--muted)", marginBottom: "6px" }}
              />
              <strong style={{ display: "block", fontSize: "12px" }}>
                Seret struk atau klik untuk unggah
              </strong>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                JPG, PNG, atau PDF hingga 5MB. AI OCR akan memverifikasi
                otomatis.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              className="secondary-button"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="primary-button"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
