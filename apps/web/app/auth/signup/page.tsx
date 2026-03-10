"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { Cloud, User, Mail, Lock, Loader2, CheckCircle2, Send } from "lucide-react";

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const username = formData.get("username") as string;
        // const fullname = formData.get("fullname") as string; // Removed per user request

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        const supabase = createClient();

        // Sign up with extra metadata for the profiles trigger
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/confirm?next=/dashboard`,
                data: {
                    user_name: username,
                    // full_name: fullname, // Removed
                    avatar_url: `https://api.dicebear.com/9.x/notionists/svg?seed=${username}`, // Automagic avatars
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void text-center">
                <div className="w-16 h-16 bg-accent-focus/20 rounded-full flex items-center justify-center mb-6 text-accent-focus animate-in zoom-in">
                    <Send size={28} />
                </div>
                <h2 className="text-3xl font-bold mb-3">Revisa tu correo</h2>
                <p className="text-text-dim max-w-xs leading-relaxed">
                    Te hemos enviado un enlace de verificación. Haz clic en él para activar tu cuenta. Revisa también tu carpeta de spam.
                </p>
                <Link href="/auth/login" className="mt-8">
                    <ZenButton variant="ghost" className="gap-2 text-text-dim">
                        Ya verifiqué → Ir al Login
                    </ZenButton>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void">
            <Link href="/" className="mb-6 flex items-center gap-2 text-text-dim hover:text-white transition-colors">
                <Cloud size={24} />
                <span className="font-bold">Macitta</span>
            </Link>

            <div className="w-full max-w-sm bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-xl">
                <h2 className="text-2xl font-bold mb-2 text-center">Únete al Culto</h2>
                <p className="text-text-dim text-center mb-6 text-sm">Crea tu perfil de estudiante.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim ml-1">Usuario</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3 text-text-dim" size={16} />
                            <input
                                name="username"
                                required
                                minLength={3}
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                                placeholder="neo_anderson"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3 text-text-dim" size={16} />
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 text-text-dim" size={16} />
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim ml-1">Repetir Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 text-text-dim" size={16} />
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <ZenButton
                        variant="primary"
                        className="w-full mt-4 h-12"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Crear Cuenta"}
                    </ZenButton>
                </form>

                <div className="mt-6 text-center text-sm text-text-dim">
                    ¿Ya tienes cuenta? <Link href="/auth/login" className="text-white font-medium hover:underline">Inicia Sesión</Link>
                </div>
            </div>
        </div>
    );
}
