'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.login({
        email: email.trim(),
        password,
      });
      router.push('/');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal masuk ke akun FIRA.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <Link href="/" className="brand" style={{ padding: 0, display: "inline-flex", textDecoration: "none", marginBottom: "8px" }}>
          <Image
            src="/FIRA-Logo-Full-Vector.svg"
            alt="FIRA Logo"
            width={160}
            height={61}
            priority
            style={{ height: "auto", width: "160px", objectFit: "contain" }}
          />
        </Link>
        <h1>Selamat datang kembali</h1>
        <p className="muted">Masuk untuk melanjutkan pengelolaan keuanganmu.</p>

        {errorMsg && (
          <div
            className="notice"
            style={{
              marginTop: '14px',
              background: '#fff0ef',
              borderColor: '#f9c6c4',
              color: '#b95e58',
              fontSize: '12px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="auth-note">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-link">
            Daftar
          </Link>
        </p>
      </section>
    </main>
  );
}
