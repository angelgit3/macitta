'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ZenButton } from '@/components/ui/ZenButton';
import Link from 'next/link';
import { Cloud, Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

function VerifyRecoveryClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const supabase = createClient();

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 7) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            const nextIndex = Math.min(pastedData.length, 7);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const code = otp.join('');
        if (code.length < 8) {
            setError('Ingresa el código completo de 8 dígitos.');
            return;
        }

        if (!email) {
            setError('No se proporcionó un correo electrónico.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'recovery'
        });

        if (error) {
            setError(error.message === 'Token has expired or is invalid'
                ? 'El código es inválido o ha expirado. Intenta de nuevo.'
                : error.message);
            setLoading(false);
        } else {
            // Recovery OTP verified — session is now active, redirect to update-password
            router.push('/auth/update-password');
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        setError(null);
        setMessage(null);

        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabaseImplicit = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { flowType: 'implicit' } }
        );

        const { error } = await supabaseImplicit.auth.resetPasswordForEmail(email);

        if (error) {
            setError(error.message);
        } else {
            setMessage('Se ha reenviado un nuevo código a tu correo.');
            setOtp(['', '', '', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
        setResending(false);
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void text-center">
            <Link href="/" className="mb-8 flex items-center gap-2 text-text-dim hover:text-white transition-colors">
                <Cloud size={24} />
                <span className="font-bold">Macitta</span>
            </Link>

            <div className="w-full max-w-sm bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-xl">
                <div className="w-16 h-16 bg-accent-focus/20 rounded-full flex items-center justify-center mb-6 mx-auto text-accent-focus">
                    <KeyRound size={28} />
                </div>

                <h2 className="text-2xl font-bold mb-2">Recupera tu cuenta</h2>
                <p className="text-text-dim mb-6 text-sm leading-relaxed">
                    Ingresa el código de 8 dígitos que enviamos a <br />
                    <strong className="text-white">{email || 'tu correo'}</strong>
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 flex gap-2 text-left">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm mb-6 flex gap-2 text-left">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleVerify} className="flex flex-col gap-6">
                    <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-bold bg-void/50 border border-border-subtle rounded-xl focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all text-white outline-none"
                            />
                        ))}
                    </div>

                    <ZenButton
                        variant="primary"
                        className="w-full h-12"
                        disabled={loading || !isComplete}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Verificar y cambiar contraseña"}
                    </ZenButton>
                </form>

                <div className="mt-8 flex flex-col gap-3 text-sm">
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="text-text-dim hover:text-white font-medium transition-colors disabled:opacity-50"
                    >
                        {resending ? 'Enviando...' : '¿No recibiste el código? Reenviar'}
                    </button>

                    <Link href="/auth/login" className="text-zinc-600 hover:text-zinc-400 font-medium transition-colors">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyRecoveryPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-void text-text-dim">
                <Loader2 className="animate-spin" size={24} />
            </div>
        }>
            <VerifyRecoveryClient />
        </Suspense>
    );
}
