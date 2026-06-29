'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ZenButton } from '@/components/ui/ZenButton';
import {
    KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2,
    Code2, User, Flame, Clock, Target, Trophy,
    Github, Instagram,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStats } from '@/hooks/useUserStats';
import type { ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileClientProps {
    initialUser: SupabaseUser;
}

interface FeedbackMessage {
    type: 'success' | 'error';
    text: string;
}

interface Profile {
    username: string;
    created_at: string;
}

/** Format total milliseconds into "Xh" or "Xmin". */
function formatTime(ms: number): string {
    if (ms >= 3_600_000) return `${(ms / 3_600_000).toFixed(1)}h`;
    return `${Math.round(ms / 60_000)}min`;
}

/**
 * ProfileClient — user settings, stats overview, and account management.
 * Handles username updates, password changes, and sign-out.
 */
export function ProfileClient({ initialUser }: ProfileClientProps) {
    const supabase  = useMemo(() => createClient(), []);
    const router    = useRouter();
    const { stats, loading: statsLoading } = useUserStats();

    const [username,   setUsername]   = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading,    setLoading]    = useState(false);
    const [message,    setMessage]    = useState<FeedbackMessage | null>(null);
    const [profile,    setProfile]    = useState<Profile | null>(null);

    useEffect(() => {
        if (!initialUser?.id) return;
        supabase
            .from('profiles')
            .select('username, created_at')
            .eq('id', initialUser.id)
            .single()
            .then(({ data }) => {
                if (data) {
                    setProfile(data);
                    setUsername(data.username ?? '');
                }
            });
    }, [initialUser?.id, supabase]);

    const avatarLetter = profile?.username?.[0]?.toUpperCase()
        || initialUser?.email?.[0]?.toUpperCase()
        || '?';

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
        : '';

    const masteryPct = stats
        ? Math.round((stats.masteredCards / Math.max(stats.totalCards, 1)) * 100)
        : 0;

    // ── Profile update ──────────────────────────────────────
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
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error al actualizar.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    // ── Password update ─────────────────────────────────────
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Contraseña actualizada con éxito.' });
            setNewPassword('');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error al actualizar la contraseña.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    // ── Sign out ────────────────────────────────────────────
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    return (
        <div className="space-y-5 pb-24">

            {/* ── Identity card ─────────────────────────────── */}
            <section className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20
                                    flex items-center justify-center text-accent text-2xl font-black shrink-0">
                        {avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="label-kicker mb-0.5">Perfil</div>
                        <h2 className="text-2xl font-bold text-ink truncate">
                            {profile?.username || initialUser?.email}
                        </h2>
                        <p className="text-sm text-ink-faint truncate">{initialUser?.email}</p>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <ProfileMetric label="Racha"    value={`${stats?.streak ?? '-'}d`}                                    icon={<Flame  size={14} />} />
                    <ProfileMetric label="Tiempo"   value={statsLoading ? '-' : formatTime(stats?.totalTimeMs ?? 0)}     icon={<Clock  size={14} />} />
                    <ProfileMetric label="Maestría" value={statsLoading ? '-' : `${masteryPct}%`}                        icon={<Trophy size={14} />} />
                    <ProfileMetric
                        label="Precisión"
                        value={statsLoading ? '-' : (stats?.precision != null ? `${stats.precision}%` : 'Sin datos')}
                        icon={<Target size={14} />}
                    />
                </div>

                {memberSince && (
                    <p className="label-kicker text-right mt-3">Miembro desde {memberSince}</p>
                )}
            </section>

            {/* ── Feedback banner ───────────────────────────── */}
            {message && (
                <div className={`flex items-center gap-2 text-xs font-medium p-3 rounded-xl
                    ${message.type === 'success'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-danger/10  text-danger  border border-danger/20'}`}>
                    {message.type === 'success'
                        ? <CheckCircle2 size={13} />
                        : <AlertCircle  size={13} />}
                    {message.text}
                </div>
            )}

            {/* ── Profile form ──────────────────────────────── */}
            <section className="glass-card rounded-2xl p-5 space-y-4">
                <SectionTitle icon={<User size={16} />} title="Datos del perfil" />
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div className="space-y-1.5">
                        <label htmlFor="profile-username" className="label-kicker ml-1">Nombre de usuario</label>
                        <input
                            type="text"
                            id="profile-username"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setMessage(null); }}
                            placeholder="mín. 3 caracteres"
                            minLength={3}
                            className="w-full soft-field rounded-xl py-3 px-4 text-sm"
                        />
                    </div>
                    <ZenButton variant="primary" className="w-full h-11" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Guardar cambios'}
                    </ZenButton>
                </form>
            </section>

            {/* ── Security form ─────────────────────────────── */}
            <section className="glass-card rounded-2xl p-5 space-y-4">
                <SectionTitle icon={<KeyRound size={16} />} title="Seguridad" />
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div className="space-y-1.5">
                        <label htmlFor="profile-password" className="label-kicker ml-1">Nueva contraseña</label>
                        <input
                            type="password"
                            id="profile-password"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setMessage(null); }}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            className="w-full soft-field rounded-xl py-3 px-4 text-sm"
                        />
                    </div>
                    <ZenButton variant="primary" className="w-full h-11" disabled={loading || newPassword.length < 8}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Actualizar contraseña'}
                    </ZenButton>
                </form>
            </section>

            {/* ── Sign out ──────────────────────────────────── */}
            <button
                onClick={handleLogout}
                className="w-full bg-danger/10 hover:bg-danger/15 border border-danger/25 text-danger
                           font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
                <LogOut size={16} /> Cerrar sesión
            </button>

            {/* ── Footer ────────────────────────────────────── */}
            <footer className="pt-6 pb-2 text-center space-y-4 border-t border-border">
                <div className="flex justify-center gap-3">
                    <SocialButton label="GitHub" href="https://github.com/angelgit3/macitta">
                        <Github size={18} />
                    </SocialButton>
                    <SocialButton label="Instagram" href="https://www.instagram.com/aalberto_anaya/">
                        <Instagram size={18} />
                    </SocialButton>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <p className="label-kicker flex items-center gap-1.5">
                        <Code2 size={12} /> Hecha por Alberto Anaya
                    </p>
                    <p className="text-xs text-ink-muted">Macitta · 2026</p>
                </div>
            </footer>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────

function ProfileMetric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="bg-void/45 rounded-xl p-3 text-center border border-border">
            <div className="mx-auto mb-1 text-amber flex justify-center">{icon}</div>
            <div className="text-sm font-bold text-ink">{value}</div>
            <div className="label-kicker mt-0.5">{label}</div>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 text-accent">
            {icon}
            <h3 className="label-kicker text-ink-muted">{title}</h3>
        </div>
    );
}

/** Opens `href` in a new tab — avoids inline window.open handlers. */
function SocialButton({ label, href, children }: { label: string; href: string; children: ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 min-w-11 rounded-xl glass-card text-ink-faint hover:text-accent transition-colors flex items-center justify-center"
            aria-label={label}
            title={label}
        >
            {children}
            <span className="sr-only sm:not-sr-only sm:ml-2 sm:text-xs sm:font-bold">{label}</span>
        </a>
    );
}
