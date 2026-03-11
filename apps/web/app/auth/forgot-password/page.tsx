"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ZenButton } from "@/components/ui/ZenButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cloud, Mail, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        // We must use the implicit flow here to force Supabase to generate a 6-digit OTP 
        // instead of a long PKCE token, because our UI expects a 6-digit code.
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { flowType: 'implicit' } }
        );

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Redirect to the recovery OTP page
            router.push(`/auth/verify-recovery?email=${encodeURIComponent(email)}`);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void">
            <Link href="/" className="mb-8 flex items-center gap-2 text-text-dim hover:text-white transition-colors">
                <Cloud size={24} />
                <span className="font-bold">Macitta</span>
            </Link>

            <div className="w-full max-w-sm bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-xl">
                <h2 className="text-2xl font-bold mb-2 text-center">¿Olvidaste tu contraseña?</h2>
                <p className="text-text-dim text-center mb-8 text-sm">
                    Ingresa tu correo y te enviaremos un código de 8 dígitos para restablecerla.
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center">
                        {error}
                    </div>
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
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all"
                                placeholder="tu_correo@upt.edu.mx"
                                autoFocus
                            />
                        </div>
                    </div>

                    <ZenButton
                        variant="primary"
                        className="w-full mt-2 h-12"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Enviar código"}
                    </ZenButton>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/auth/login" className="text-sm text-text-dim hover:text-white transition-colors inline-flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
