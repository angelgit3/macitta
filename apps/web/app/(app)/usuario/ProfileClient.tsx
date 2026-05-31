'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ZenButton } from '@/components/ui/ZenButton';
import {
    KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2,
    Code2, User, Flame, Clock, Target, Trophy,
    Instagram, Twitter, Github
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStats } from '@/hooks/useUserStats';
import type { ReactNode } from 'react';

export function ProfileClient({ initialUser }: { initialUser: any }) {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const { stats, loading: statsLoading } = useUserStats();

    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [profile, setProfile] = useState<{ username: string; created_at: string } | null>(null);

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

    const avatarLetter = profile?.username?.[0]?.toUpperCase() || initialUser?.email?.[0]?.toUpperCase() || '?';

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
        : '';

    const totalTimeFormatted = stats
        ? stats.totalTimeMs >= 3600000
            ? `${(stats.totalTimeMs / 3600000).toFixed(1)}h`
            : `${Math.round(stats.totalTimeMs / 60000)}min`
        : '-';

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
            setMessage({ type: 'error', text: 'La contrasena debe tener al menos 6 caracteres.' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Contrasena actualizada con exito.' });
            setNewPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar la contrasena.' });
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
        <div className="space-y-5 pb-24">
            <section className="surface-panel rounded-xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-lg bg-accent-focus/10 flex items-center justify-center text-accent-focus text-2xl font-black shrink-0 border border-accent-focus/20">
                        {avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="quiet-kicker">Perfil</div>
                        <h2 className="text-2xl font-bold text-ink truncate">{profile?.username || initialUser?.email}</h2>
                        <p className="text-sm text-text-dim truncate">{initialUser?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <ProfileMetric label="Racha" value={`${stats?.streak ?? '-'}d`} icon={<Flame size={14} />} />
                    <ProfileMetric label="Tiempo" value={statsLoading ? '-' : totalTimeFormatted} icon={<Clock size={14} />} />
                    <ProfileMetric label="Maestria" value={statsLoading ? '-' : `${masteryPct}%`} icon={<Trophy size={14} />} />
                    <ProfileMetric label="Precision" value={statsLoading ? '-' : (stats?.precision !== null && stats?.precision !== undefined ? `${stats.precision}%` : 'Sin datos')} icon={<Target size={14} />} />
                </div>

                {memberSince && (
                    <p className="text-[10px] text-text-dim text-right mt-3">Miembro desde {memberSince}</p>
                )}
            </section>

            <section className="surface-card rounded-xl p-5 space-y-4">
                <SectionTitle icon={<User size={16} />} title="Datos del perfil" />
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="quiet-kicker ml-1">Nombre de usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setMessage(null); }}
                            placeholder="min. 3 caracteres"
                            minLength={3}
                            className="w-full soft-field rounded-lg py-3 px-4 focus:border-accent-focus text-sm"
                        />
                    </div>
                    {message && (
                        <div className={`flex items-center gap-2 text-xs font-medium p-3 rounded-lg ${message.type === 'success' ? 'bg-accent-success/10 text-accent-success' : 'bg-red-500/10 text-red-300'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                            {message.text}
                        </div>
                    )}
                    <ZenButton variant="primary" className="w-full h-11" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Guardar cambios'}
                    </ZenButton>
                </form>
            </section>

            <section className="surface-card rounded-xl p-5 space-y-4">
                <SectionTitle icon={<KeyRound size={16} />} title="Seguridad" />
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="quiet-kicker ml-1">Nueva contrasena</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setMessage(null); }}
                            placeholder="Minimo 6 caracteres"
                            className="w-full soft-field rounded-lg py-3 px-4 focus:border-accent-focus text-sm"
                        />
                    </div>
                    <ZenButton variant="primary" className="w-full h-11" disabled={loading || newPassword.length < 6}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Actualizar contrasena'}
                    </ZenButton>
                </form>
            </section>

            <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 text-red-300 font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                <LogOut size={16} /> Cerrar sesion
            </button>

            <footer className="pt-6 pb-2 text-center space-y-4 border-t border-border-subtle/50">
                <div className="flex justify-center gap-3">
                    <SocialButton label="Instagram" onClick={() => window.open('https://www.instagram.com/aalberto_anaya/', '_blank')}>
                        <Instagram size={18} />
                    </SocialButton>
                    <SocialButton label="Twitter" onClick={() => window.open('https://x.com/aalberto_anaya', '_blank')}>
                        <Twitter size={18} />
                    </SocialButton>
                    <SocialButton label="GitHub" onClick={() => window.open('https://github.com/angelgit3/macitta', '_blank')}>
                        <Github size={18} />
                    </SocialButton>
                </div>

                <div className="flex flex-col items-center justify-center gap-1">
                    <p className="text-[10px] font-medium text-text-dim uppercase flex items-center gap-1.5">
                        <Code2 size={12} />
                        Creado por Alberto Anaya
                    </p>
                    <p className="text-[10px] text-text-dim/70">
                        Macitta v1.0 - UPT 2026
                    </p>
                </div>
            </footer>
        </div>
    );
}

function ProfileMetric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="bg-void/45 rounded-lg p-3 text-center border border-border-subtle">
            <div className="mx-auto mb-1 text-accent-strong flex justify-center">{icon}</div>
            <div className="text-sm font-bold text-ink">{value}</div>
            <div className="text-[9px] uppercase text-text-dim mt-0.5">{label}</div>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 text-accent-focus">
            {icon}
            <h3 className="quiet-kicker text-text-dim">{title}</h3>
        </div>
    );
}

function SocialButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
    return (
        <button
            onClick={onClick}
            className="min-h-11 min-w-11 rounded-lg surface-card text-text-dim hover:text-accent-focus transition-colors flex items-center justify-center"
            title={label}
            aria-label={label}
        >
            {children}
        </button>
    );
}
