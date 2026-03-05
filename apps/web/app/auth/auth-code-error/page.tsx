import Link from "next/link";
import { Cloud, AlertTriangle } from "lucide-react";

export default function AuthCodeErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void text-center">
            <Link href="/" className="mb-10 flex items-center gap-2 text-text-dim hover:text-white transition-colors">
                <Cloud size={24} />
                <span className="font-bold">Macitta</span>
            </Link>

            <div className="w-full max-w-sm bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-xl">
                <div className="w-14 h-14 bg-orange-500/15 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-400">
                    <AlertTriangle size={28} />
                </div>

                <h2 className="text-2xl font-bold mb-3">Enlace inválido</h2>
                <p className="text-text-dim text-sm leading-relaxed mb-8">
                    El enlace que usaste ha expirado o ya fue utilizado.
                    Esto puede pasar si tardaste mucho en hacer clic o si ya cambiaste tu contraseña.
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/auth/forgot-password"
                        className="w-full bg-accent-focus text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center p-4"
                    >
                        Solicitar nuevo enlace
                    </Link>
                    <Link
                        href="/auth/login"
                        className="w-full bg-transparent text-text-dim hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center p-3 text-sm"
                    >
                        Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
