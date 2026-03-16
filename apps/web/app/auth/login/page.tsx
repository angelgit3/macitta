"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; // We will need to create this util
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { Cloud, Lock, Mail, Loader2 } from "lucide-react";

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
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        setLastAttemptedEmail(email);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void">
            <Link href="/" className="mb-8 flex items-center gap-2 text-text-dim hover:text-white transition-colors">
                <Cloud size={24} />
                <span className="font-bold">Macitta</span>
            </Link>

            <div className="w-full max-w-sm bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-xl">
                <h2 className="text-2xl font-bold mb-2 text-center">Bienvenido de nuevo</h2>
                <p className="text-text-dim text-center mb-8 text-sm">Inicia sesión para continuar tu racha.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-4 text-center">
                        {error.toLowerCase().includes('not confirmed')
                            ? 'Tu correo aún no ha sido verificado.'
                            : error.toLowerCase().includes('invalid login')
                                ? 'Correo o contraseña incorrectos.'
                                : error}
                    </div>
                )}

                {error?.toLowerCase().includes('not confirmed') && (
                    <Link
                        href={`/auth/verify-otp?email=${encodeURIComponent(lastAttemptedEmail)}`}
                        className="flex items-center justify-center gap-2 w-full mb-4 py-3 rounded-xl bg-accent-focus/15 border border-accent-focus/30 text-accent-focus font-medium text-sm hover:bg-accent-focus/25 transition-colors"
                    >
                        Verificar mi correo →
                    </Link>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-dim ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-text-dim" size={18} />
                            <input
                                name="email"
                                type="email"
                                required
                                defaultValue={lastAttemptedEmail}
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-dim ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-text-dim" size={18} />
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <ZenButton
                        variant="primary"
                        className="w-full mt-4 h-12"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
                    </ZenButton>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/auth/forgot-password" className="text-sm text-text-dim hover:text-white transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <div className="mt-4 text-center text-sm text-text-dim">
                    ¿No tienes cuenta? <Link href="/auth/signup" className="text-white font-medium hover:underline">Regístrate</Link>
                </div>
            </div>
        </div>
    );
}
