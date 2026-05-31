"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Redirect to dashboard after brief delay
            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 2000);
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6 text-success animate-in zoom-in">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-3">¡Contraseña actualizada!</h2>
                <p className="text-ink-faint max-w-xs leading-relaxed">
                    Tu contraseña ha sido cambiada correctamente. Redirigiendo al dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void">
            <Link href="/" className="mb-8 flex items-center gap-2 text-ink-faint hover:text-ink transition-colors">
                <Logo size={24} />
                <span className="font-bold">Macitta</span>
            </Link>

            <div className="w-full max-w-sm glass-panel p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold mb-2 text-center">Nueva Contraseña</h2>
                <p className="text-ink-faint text-center mb-8 text-sm">
                    Elige una contraseña segura para tu cuenta.
                </p>

                {error && (
                    <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink-faint ml-1">Nueva Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-ink-faint" size={18} />
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="w-full soft-field rounded-xl py-3 pl-11 pr-4"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink-faint ml-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-ink-faint" size={18} />
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className="w-full soft-field rounded-xl py-3 pl-11 pr-4"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <ZenButton
                        variant="primary"
                        className="w-full mt-2 h-12"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Actualizar Contraseña"}
                    </ZenButton>
                </form>
            </div>
        </div>
    );
}
