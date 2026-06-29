"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email    = formData.get("email") as string;
    const password = formData.get("password") as string;

    setLastAttemptedEmail(email);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  const friendlyError = error
    ? error.toLowerCase().includes("not confirmed")
      ? "Tu correo aún no ha sido verificado."
      : error.toLowerCase().includes("invalid login")
      ? "Correo o contraseña incorrectos."
      : error
    : null;

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-black text-ink mb-1">Bienvenido de vuelta</h2>
        <p className="text-sm text-ink-muted">Inicia sesión para continuar tu racha.</p>
      </div>

      {/* Error banner */}
      {friendlyError && (
        <div className="bg-danger/8 border border-danger/25 text-danger p-3 rounded-xl text-sm mb-4 text-center" role="alert">
          {friendlyError}
        </div>
      )}

      {/* Verify CTA */}
      {error?.toLowerCase().includes("not confirmed") && (
        <Link
          href={`/auth/verify-otp?email=${encodeURIComponent(lastAttemptedEmail)}`}
          className="flex items-center justify-center gap-2 w-full mb-4 py-3 rounded-xl
                     bg-accent/10 border border-accent/25 text-accent font-medium text-sm
                     hover:bg-accent/18 transition-all duration-200"
        >
          Verificar mi correo
        </Link>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="label-kicker ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={17} />
            <input
              id="login-email"
              name="email"
              type="email"
              required
              defaultValue={lastAttemptedEmail}
              placeholder="tú@example.com"
              className="w-full soft-field rounded-xl py-3.5 pl-11 pr-4 text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="label-kicker ml-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={17} />
            <input
              id="login-password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full soft-field rounded-xl py-3.5 pl-11 pr-4 text-sm"
            />
          </div>
        </div>

        <ZenButton
          variant="primary"
          fullWidth
          className="mt-2 h-12 text-sm"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Entrar"}
        </ZenButton>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-ink-faint hover:text-ink transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div className="mt-4 text-center text-sm text-ink-faint">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/signup" className="text-ink font-semibold hover:text-accent transition-colors">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
