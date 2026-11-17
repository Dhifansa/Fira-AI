"use client";

import { X, Upload } from "lucide-react";

export default function AddTransactionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-5 text-slate-100 relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold">Tambah Transaksi Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4">
          {/* Tipe Transaksi */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="py-2.5 rounded-lg border border-rose-500/50 bg-rose-500/10 text-rose-400 font-medium text-sm">
                Pengeluaran
              </button>
              <button type="button" className="py-2.5 rounded-lg border border-slate-800 bg-slate-800/50 text-slate-400 font-medium text-sm">
                Pemasukan
              </button>
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Jumlah Nominal (IDR)</label>
            <input type="text" placeholder="Rp 150.000" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          {/* Kategori & Merchant */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kategori</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-300">
                <option>Makanan & Minuman</option>
                <option>Transportasi</option>
                <option>Rumah & Utilitas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Merchant/Deskripsi</label>
              <input type="text" placeholder="e.g. SPBU Pertamina" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          {/* Lampiran Struk (AI OCR) */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Lampiran Struk / Bukti (OCR Auto-Scan)</label>
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer">
              <Upload className="w-6 h-6 text-slate-500 mb-1" />
              <p className="text-xs text-slate-400">Seret struk atau klik untuk unggah</p>
              <p className="text-[10px] text-slate-600 mt-1">JPG, PNG, PDF hingga 5MB. AI OCR akan memindai otomatis</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-medium">
              Batal
            </button>
            <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2.5 rounded-lg text-sm font-semibold">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}