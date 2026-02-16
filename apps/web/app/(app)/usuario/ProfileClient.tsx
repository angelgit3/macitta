'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ZenButton } from '@/components/ui/ZenButton';
import { KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProfileClient({ initialUser }: { initialUser: any }) {
    const supabase = createClient();
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Contraseña actualizada con éxito.' });
            setNewPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al actualizar la contraseña.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* User Info Section */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent-focus/20 flex items-center justify-center text-accent-focus text-2xl font-bold">
                        {initialUser?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{initialUser?.email}</h2>
                        <p className="text-sm text-text-dim lowercase">Alumno Macitta</p>
                    </div>
                </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <KeyRound size={18} className="text-accent-focus" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-dim">Seguridad</h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 ml-1">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-black/20 border border-border-subtle rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-accent-focus transition-colors"
                        />
                    </div>

                    {message && (
                        <div className={`flex items-center gap-2 text-xs font-medium p-3 rounded-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {message.text}
                        </div>
                    )}

                    <ZenButton
                        variant="primary"
                        className="w-full h-12"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Actualizar Contraseña'}
                    </ZenButton>
                </form>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-3xl transition-all flex items-center justify-center gap-2"
            >
                <LogOut size={18} />
                Cerrar Sesión
            </button>
        </div>
    );
}
