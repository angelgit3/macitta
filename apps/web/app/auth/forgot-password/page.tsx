"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { Cloud, Mail, Loader2, Send, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/confirm?next=/auth/update-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSent(true);
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void text-center">
                <div className="w-16 h-16 bg-accent-focus/20 rounded-full flex items-center justify-center mb-6 text-accent-focus animate-in zoom-in">
                    <Send size={28} />
                </div>
                <h2 className="text-3xl font-bold mb-3">Revisa tu correo</h2>
                <p className="text-text-dim max-w-xs leading-relaxed">
                    Si tu email está registrado, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.
                </p>
                <Link href="/auth/login" className="mt-8">
                    <ZenButton variant="ghost" className="gap-2">
                        <ArrowLeft size={16} />
                        Volver al Login
                    </ZenButton>
                </Link>
            </div>
        );
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
                    Ingresa el email asociado a tu cuenta y te enviaremos un enlace para restablecerla.
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
                                placeholder="you@example.com"
                                autoFocus
                            />
                        </div>
                    </div>

                    <ZenButton
                        variant="primary"
                        className="w-full mt-2 h-12"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Enviar enlace"}
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
