"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { Cloud, User, Mail, Lock, Loader2, Send, GraduationCap, BookOpen } from "lucide-react";

const ALLOWED_DOMAIN = "upt.edu.mx";

function detectRole(email: string): "student" | "teacher" | null {
    const parts = email.split("@");
    if (parts.length !== 2) return null;
    const [local, domain] = parts;
    if (domain.toLowerCase() !== ALLOWED_DOMAIN) return null;
    return /^\d+$/.test(local) ? "student" : "teacher";
}

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailValue, setEmailValue] = useState("");

    const detectedRole = emailValue ? detectRole(emailValue) : null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const username = formData.get("username") as string;

        // Validate institutional domain
        if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
            setError("Usa tu correo institucional @upt.edu.mx");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    user_name: username,
                    avatar_url: `https://api.dicebear.com/9.x/notionists/svg?seed=${username}`,
                },
            },
        });

        if (error) {
            // Translate common Supabase errors
            if (error.message.includes('upt.edu.mx')) {
                setError("Solo se permiten correos institucionales @upt.edu.mx");
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void">
            <Link href="/" className="mb-6 flex items-center gap-2 text-text-dim hover:text-white transition-colors">
                <Cloud size={24} />
                <span className="font-bold">Macitta</span>
            </Link>

            <div className="w-full max-w-sm bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-xl">
                <h2 className="text-2xl font-bold mb-2 text-center">Bienvenido a Macitta</h2>
                <p className="text-text-dim text-center mb-6 text-sm">Usa tu correo institucional @upt.edu.mx</p>

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
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim ml-1">Email Institucional</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3 text-text-dim" size={16} />
                            <input
                                name="email"
                                type="email"
                                required
                                value={emailValue}
                                onChange={(e) => setEmailValue(e.target.value)}
                                className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                                placeholder="matricula@upt.edu.mx"
                            />
                        </div>
                        {/* Role detection badge */}
                        {emailValue && (
                            <div className="mt-1.5 ml-1">
                                {detectedRole === "student" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                                        <GraduationCap size={12} />
                                        Estudiante
                                    </span>
                                )}
                                {detectedRole === "teacher" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                        <BookOpen size={12} />
                                        Docente
                                    </span>
                                )}
                                {detectedRole === null && emailValue.includes("@") && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg">
                                        Solo correos @upt.edu.mx
                                    </span>
                                )}
                            </div>
                        )}
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
                        disabled={loading || (emailValue.includes("@") && !detectedRole)}
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
