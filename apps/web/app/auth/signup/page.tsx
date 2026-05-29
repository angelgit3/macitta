"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailValue, setEmailValue] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string).trim().toLowerCase();
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const rawUsername = (formData.get("username") as string).trim();

        const username = rawUsername.replace(/[^a-zA-Z0-9_\-.]/g, "").slice(0, 32);
        if (username.length < 3) {
            setError("El nombre de usuario debe tener al menos 3 caracteres alfanumericos.");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("La contrasena debe tener al menos 8 caracteres.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contrasenas no coinciden");
            setLoading(false);
            return;
        }

        const supabase = createClient();
        const avatarSeed = encodeURIComponent(email.split("@")[0]);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    user_name: username,
                    avatar_url: `https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}`,
                },
            },
        });

        if (error) {
            const msg = error.message.toLowerCase();
            if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user_already_exists")) {
                setError("Ya existe una cuenta con ese correo. Olvidaste tu contrasena?");
            } else if (msg.includes("email not confirmed")) {
                setError("Este correo ya se registro pero no fue verificado. Revisa tu bandeja y busca el codigo de Macitta.");
            } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
                setError("Demasiados intentos. Espera unos minutos antes de intentar de nuevo.");
            } else if (msg.includes("invalid email") || msg.includes("unable to validate")) {
                setError("El formato del correo no es valido. Verifica tus datos e intenta de nuevo.");
            } else if (msg.includes("password") && (msg.includes("short") || msg.includes("weak"))) {
                setError("La contrasena es muy corta o debil. Usa al menos 8 caracteres.");
            } else {
                setError("No se pudo crear la cuenta. Verifica tus datos e intenta de nuevo.");
            }
            setLoading(false);
        } else {
            router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }
    }

    return (
        <div className="w-full max-w-sm bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-center">Bienvenido a Macitta</h2>
            <p className="text-text-dim text-center mb-6 text-sm">Crea tu cuenta con cualquier correo.</p>

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
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                            placeholder="tu_correo@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim ml-1">Contrasena</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3 text-text-dim" size={16} />
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                            placeholder="********"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim ml-1">Repetir Contrasena</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3 text-text-dim" size={16} />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                            className="w-full bg-void/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent-focus text-sm transition-all"
                            placeholder="********"
                        />
                    </div>
                </div>

                <ZenButton variant="primary" className="w-full mt-4 h-12" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Crear Cuenta"}
                </ZenButton>
            </form>

            <div className="mt-6 text-center text-sm text-text-dim">
                Ya tienes cuenta? <Link href="/auth/login" className="text-white font-medium hover:underline">Inicia Sesion</Link>
            </div>
        </div>
    );
}
