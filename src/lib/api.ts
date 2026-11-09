import type { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Client REST API terpusat. Tidak ada akses database langsung dari frontend. */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL belum dikonfigurasi. Isi file .env.local.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    // Strategi cookie/session perlu disesuaikan setelah metode autentikasi diputuskan.
    credentials: 'include',
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? `Request gagal (${response.status})`);
  }
  if (!payload) throw new Error('Response backend tidak dapat dibaca.');
  return payload.data;
}
