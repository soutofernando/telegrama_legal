"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    window.location.href = "/admin";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/ecri.jpg"
          alt="ECRI"
          className="h-16 w-16 rounded-2xl object-cover shadow-[var(--shadow-card)]"
        />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Encontro</h1>
        <p className="mt-1 text-sm text-muted">Painel de organização</p>
      </div>
      <form
        onSubmit={onSubmit}
        className="card-ecri w-full max-w-sm border border-border/80 p-6"
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">
              E-mail
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-base"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">
              Senha
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-base"
            />
          </label>
        </div>
        {error && (
          <p className="mt-3 text-sm font-medium text-accent">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <p className="mt-4 text-center text-xs text-muted">
          Página em branco ou erro 431?{" "}
          <a
            href="/api/clear-auth-cookies?redirect=/admin/login"
            className="font-semibold text-primary underline"
          >
            Limpar cookies
          </a>
        </p>
      </form>
    </div>
  );
}
