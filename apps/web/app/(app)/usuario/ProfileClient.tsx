'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ZenButton } from '@/components/ui/ZenButton';
import {
    KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2,
    GraduationCap, BookOpen, Code2, User, Flame, Clock, Target, Trophy,
    Instagram, Twitter, Github
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStats } from '@/hooks/useUserStats';


export function ProfileClient({ initialUser }: { initialUser: any }) {
    const supabase = createClient();
    const router = useRouter();
    const { stats, loading: statsLoading } = useUserStats();

    // Form state
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile state
    const [profile, setProfile] = useState<{ username: string; role: string; created_at: string } | null>(null);


    useEffect(() => {
        if (!initialUser?.id) return;
        supabase
            .from('profiles')
            .select('username, role, created_at')
            .eq('id', initialUser.id)
            .single()
            .then(({ data }) => {
                if (data) {
                    setProfile(data);
                    setUsername(data.username ?? '');
                }
            });
    }, [initialUser?.id]);

    const roleDisplay = profile?.role === 'teacher'
        ? { label: 'Docente', icon: BookOpen, className: 'text-emerald-400 bg-emerald-400/10' }
        : profile?.role === 'admin'
            ? { label: 'Admin', icon: Code2, className: 'text-purple-400 bg-purple-400/10' }
            : { label: 'Estudiante', icon: GraduationCap, className: 'text-blue-400 bg-blue-400/10' };

    const avatarLetter = profile?.username?.[0]?.toUpperCase() || initialUser?.email?.[0]?.toUpperCase() || '?';

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
        : '';

    const totalTimeFormatted = stats
        ? stats.totalTimeMs >= 3600000
            ? `${(stats.totalTimeMs / 3600000).toFixed(1)}h`
            : `${Math.round(stats.totalTimeMs / 60000)}min`
        : '—';

    const masteryPct = stats ? Math.round((stats.masteredCards / Math.max(stats.totalCards, 1)) * 100) : 0;

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim().length < 3) {
            setMessage({ type: 'error', text: 'El nombre de usuario debe tener al menos 3 caracteres.' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username: username.trim() })
                .eq('id', initialUser.id);
            if (error) throw error;
            setMessage({ type: 'success', text: 'Perfil actualizado.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Contraseña actualizada con éxito.' });
            setNewPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar la contraseña.' });
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
        <div className="space-y-5">

            {/* ── Hero card ── */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-accent-focus/20 flex items-center justify-center text-accent-focus text-2xl font-black shrink-0 border border-accent-focus/20">
                        {avatarLetter}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-white truncate">{profile?.username || initialUser?.email}</h2>
                        <p className="text-xs text-text-dim truncate">{initialUser?.email}</p>
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${roleDisplay.className}`}>
                            <roleDisplay.icon size={11} />
                            {roleDisplay.label}
                        </span>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'Racha', value: `${stats?.streak ?? '—'}d`, icon: Flame, color: 'text-orange-400' },
                        { label: 'Tiempo', value: statsLoading ? '—' : totalTimeFormatted, icon: Clock, color: 'text-blue-400' },
                        { label: 'Maestría', value: statsLoading ? '—' : `${masteryPct}%`, icon: Trophy, color: 'text-yellow-400' },
                        { label: 'Precisión', value: statsLoading ? '—' : (stats?.precision !== null && stats?.precision !== undefined ? `${stats.precision}%` : 'Sin datos'), icon: Target, color: 'text-green-400' },
                    ].map(s => (
                        <div key={s.label} className="bg-black/20 rounded-2xl p-3 text-center">
                            <s.icon size={14} className={`mx-auto mb-1 ${s.color}`} />
                            <div className="text-sm font-bold">{s.value}</div>
                            <div className="text-[9px] uppercase tracking-wider text-text-dim mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {memberSince && (
                    <p className="text-[10px] text-text-dim/50 text-right mt-3">Miembro desde {memberSince}</p>
                )}
            </div>

            {/* ── Edit username ── */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-accent-focus" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Datos del perfil</h3>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Nombre de usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setMessage(null); }}
                            placeholder="min. 3 caracteres"
                            minLength={3}
                            className="w-full bg-black/20 border border-border-subtle rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-accent-focus transition-colors text-sm"
                        />
                    </div>
                    {message && (
                        <div className={`flex items-center gap-2 text-xs font-medium p-3 rounded-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                            {message.text}
                        </div>
                    )}
                    <ZenButton variant="primary" className="w-full h-11" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Guardar cambios'}
                    </ZenButton>
                </form>
            </div>

            {/* ── Change password ── */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-accent-focus" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Seguridad</h3>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setMessage(null); }}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-black/20 border border-border-subtle rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-accent-focus transition-colors text-sm"
                        />
                    </div>
                    <ZenButton variant="primary" className="w-full h-11" disabled={loading || newPassword.length < 6}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Actualizar Contraseña'}
                    </ZenButton>
                </form>
            </div>

            {/* ── Creator Zone ── */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-focus/10 flex items-center justify-center text-accent-focus font-bold border border-accent-focus/20 shrink-0">
                        AA
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Alberto Anaya</h3>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Desarrollador</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                    <ZenButton 
                        variant="ghost" 
                        onClick={() => window.open('https://www.instagram.com/aalberto_anaya/', '_blank')}
                        className="w-full flex items-center justify-start gap-3 h-12 px-4 bg-pink-500/5 hover:bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-2xl transition-colors"
                    >
                        <Instagram size={16} />
                        <span className="text-xs font-bold">Instagram (Dudas o bugs)</span>
                    </ZenButton>
                    <ZenButton 
                        variant="ghost"
                        onClick={() => window.open('https://x.com/aalberto_anaya', '_blank')}
                        className="w-full flex items-center justify-start gap-3 h-12 px-4 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl transition-colors"
                    >
                        <Twitter size={16} />
                        <span className="text-xs font-bold">Twitter (Sigue mi trabajo)</span>
                    </ZenButton>
                    <ZenButton 
                        variant="ghost"
                        onClick={() => window.open('https://github.com/angelgit3/macitta', '_blank')}
                        className="w-full flex items-center justify-start gap-3 h-12 px-4 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-300 border border-zinc-500/20 rounded-2xl transition-colors"
                    >
                        <Github size={16} />
                        <span className="text-xs font-bold">GitHub (Código Fuente)</span>
                    </ZenButton>
                </div>
            </div>

            {/* ── Logout ── */}
            <button onClick={handleLogout} className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-3xl transition-all flex items-center justify-center gap-2 text-sm">
                <LogOut size={16} /> Cerrar Sesión
            </button>

            {/* ── Credit ── */}
            <div className="text-center py-2">
                <p className="text-[10px] text-zinc-700 flex items-center justify-center gap-1">
                    <Code2 size={10} /> Macitta v1.0 — UPT 2026 — Angel Anaya
                </p>
            </div>
        </div>
    );
}
