"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

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
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-2 text-center text-ink">Bienvenido a Macitta</h2>
            <p className="text-ink-faint text-center mb-6 text-sm">Crea tu cuenta con cualquier correo.</p>

            {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg text-sm mb-6 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <AuthField icon={<User size={16} />} label="Usuario">
                    <input
                        name="username"
                        required
                        minLength={3}
                        className="w-full soft-field rounded-lg py-3 pl-11 pr-4 text-sm"
                        placeholder="neo_anderson"
                    />
                </AuthField>

                <AuthField icon={<Mail size={16} />} label="Email">
                    <input
                        name="email"
                        type="email"
                        required
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        className="w-full soft-field rounded-lg py-3 pl-11 pr-4 text-sm"
                        placeholder="tu_correo@example.com"
                    />
                </AuthField>

                <AuthField icon={<Lock size={16} />} label="Contrasena">
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        className="w-full soft-field rounded-lg py-3 pl-11 pr-4 text-sm"
                        placeholder="********"
                    />
                </AuthField>

                <AuthField icon={<Lock size={16} />} label="Repetir contrasena">
                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        className="w-full soft-field rounded-lg py-3 pl-11 pr-4 text-sm"
                        placeholder="********"
                    />
                </AuthField>

                <ZenButton variant="primary" className="w-full mt-4 h-12" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Crear cuenta"}
                </ZenButton>
            </form>

            <div className="mt-6 text-center text-sm text-ink-faint">
                Ya tienes cuenta? <Link href="/auth/login" className="text-ink font-medium hover:underline">Inicia Sesion</Link>
            </div>
        </div>
    );
}

function AuthField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="label-kicker ml-1">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-3 text-ink-faint">{icon}</div>
                {children}
            </div>
        </div>
    );
}
