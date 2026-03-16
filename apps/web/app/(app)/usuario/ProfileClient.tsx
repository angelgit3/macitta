'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ZenButton } from '@/components/ui/ZenButton';
import {
    KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2,
    MessageSquare, Bug, Lightbulb, MessageCircle, Send,
    GraduationCap, BookOpen, Code2, User, Flame, Clock, Target, Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStats } from '@/hooks/useUserStats';

const FEEDBACK_TYPES = [
    { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { value: 'suggestion', label: 'Sugerencia', icon: Lightbulb, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { value: 'other', label: 'Otro', icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
] as const;

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

    // Feedback state
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'other'>('suggestion');
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

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

    const handleFeedbackSubmit = async () => {
        if (!feedbackMsg.trim() || !initialUser?.id) return;
        setFeedbackLoading(true);
        try {
            const { error } = await supabase.from('feedback').insert({
                user_id: initialUser.id,
                type: feedbackType,
                message: feedbackMsg.trim(),
            });
            if (error) throw error;
            setFeedbackSent(true);
            setFeedbackMsg('');
            setTimeout(() => { setFeedbackSent(false); setFeedbackOpen(false); }, 2500);
        } catch (err) {
            console.error('[Feedback] Error:', err);
        } finally {
            setFeedbackLoading(false);
        }
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
                        { label: 'Precisión', value: '—', icon: Target, color: 'text-green-400' },
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

            {/* ── Feedback ── */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-5 space-y-4">
                <button onClick={() => setFeedbackOpen(!feedbackOpen)} className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-yellow-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Feedback & Soporte</h3>
                    </div>
                    <span className={`text-text-dim text-xs transition-transform duration-200 ${feedbackOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {feedbackOpen && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {feedbackSent ? (
                            <div className="flex flex-col items-center gap-2 py-6 text-green-400">
                                <CheckCircle2 size={28} />
                                <p className="font-bold text-sm">¡Gracias por tu feedback!</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    {FEEDBACK_TYPES.map(ft => (
                                        <button
                                            key={ft.value}
                                            onClick={() => setFeedbackType(ft.value)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${feedbackType === ft.value ? ft.color : 'text-zinc-500 bg-transparent border-border-subtle'}`}
                                        >
                                            <ft.icon size={12} /> {ft.label}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={feedbackMsg}
                                    onChange={e => setFeedbackMsg(e.target.value)}
                                    placeholder={feedbackType === 'bug' ? 'Describe el error...' : feedbackType === 'suggestion' ? '¿Qué te gustaría ver?' : 'Tu mensaje...'}
                                    rows={3}
                                    className="w-full bg-black/20 border border-border-subtle rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:border-accent-focus transition-colors resize-none"
                                />
                                <ZenButton variant="primary" className="w-full h-11 gap-2" disabled={feedbackLoading || !feedbackMsg.trim()} onClick={handleFeedbackSubmit}>
                                    {feedbackLoading ? <Loader2 className="animate-spin" size={14} /> : <><Send size={13} /> Enviar</>}
                                </ZenButton>
                            </>
                        )}
                    </div>
                )}
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
