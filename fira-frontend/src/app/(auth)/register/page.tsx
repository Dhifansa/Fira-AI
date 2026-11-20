'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Nama, email, dan password wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password minimal harus terdiri dari 8 karakter.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!res.token) {
        await authApi.login({
          email: email.trim(),
          password,
        });
      }

      router.push('/');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal mendaftarkan akun FIRA.'
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
        <h1>Buat akun FIRA</h1>
        <p className="muted">
          Mulai kelola keuanganmu dengan lebih terstruktur.
        </p>

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
            <label htmlFor="name">Nama</label>
            <input
              id="name"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="Buat password (min. 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
        <p className="auth-note">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-link">
            Masuk
          </Link>
        </p>
      </section>
    </main>
  );
}
