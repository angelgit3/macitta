'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ZenButton } from '@/components/ui/ZenButton';
import {
    KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2,
    Code2, User, Flame, Clock, Target, Trophy,
    Download, Github, Instagram, ShieldCheck, TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStats } from '@/hooks/useUserStats';
import { clearPrivateOfflineData } from '@/lib/db';
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

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallCard, setShowInstallCard] = useState(false);
    const [installInstructions, setInstallInstructions] = useState('');

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

    useEffect(() => {
        const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || navigatorWithStandalone.standalone === true;
        const isMobileLike = window.matchMedia('(pointer: coarse)').matches
            && window.matchMedia('(max-width: 820px)').matches;

        if (isStandalone || !isMobileLike) {
            setShowInstallCard(false);
            return;
        }

        const userAgent = window.navigator.userAgent;
        const isIOS = /iphone|ipad|ipod/i.test(userAgent)
            || (navigatorWithStandalone.standalone !== undefined && /safari/i.test(userAgent));

        const syncCapturedPrompt = () => {
            setInstallPrompt(window.__macittaInstallPrompt ?? null);
        };

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            window.__macittaInstallPrompt = event as BeforeInstallPromptEvent;
            setInstallPrompt(event as BeforeInstallPromptEvent);
            setShowInstallCard(true);
        };

        const handleAppInstalled = () => {
            window.__macittaInstallPrompt = undefined;
            setInstallPrompt(null);
            setShowInstallCard(false);
        };

        setShowInstallCard(true);
        setInstallInstructions(
            isIOS
                ? 'En Safari toca Compartir y luego Agregar a pantalla de inicio.'
                : 'Si tu navegador no abre el instalador, usa el menú y toca Instalar app o Agregar a pantalla principal.'
        );
        syncCapturedPrompt();

        window.addEventListener('macitta:installprompt', syncCapturedPrompt);
        window.addEventListener('macitta:appinstalled', handleAppInstalled);
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('macitta:installprompt', syncCapturedPrompt);
            window.removeEventListener('macitta:appinstalled', handleAppInstalled);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

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
        try {
            await clearPrivateOfflineData();
        } finally {
            await supabase.auth.signOut();
        }
        router.push('/auth/login');
        router.refresh();
    };

    // ── Account deletion (ARCO cancelación) ─────────────────
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'ELIMINAR' || deleting) return;
        setDeleting(true);
        try {
            const { error } = await supabase.rpc('delete_own_account');
            if (error) throw error;
            // Borra la copia offline (IndexedDB + almacenamiento local)
            try { await clearPrivateOfflineData(); } catch { /* best effort */ }
            try { localStorage.clear(); } catch { /* best effort */ }
            try { await supabase.auth.signOut(); } catch { /* la sesión ya no existe */ }
            window.location.href = '/';
        } catch {
            setDeleting(false);
            setMessage({
                type: 'error',
                text: 'No se pudo eliminar la cuenta. Intenta de nuevo o escríbenos a macitta.app@gmail.com.',
            });
            setShowDeleteModal(false);
        }
    };

    const handleInstallApp = async () => {
        if (!installPrompt) return;

        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowInstallCard(false);
        }

        setInstallPrompt(null);
    };

    return (
        <div className="space-y-5 pb-24">

            {/* ── Identity card ─────────────────────────────── */}
            <section className="rounded-2xl border border-border bg-surface/85 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20
                                    flex items-center justify-center text-accent text-2xl font-black shrink-0">
                        {avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 text-sm font-bold text-accent">Perfil</div>
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
                    <p className="mt-3 text-right text-xs text-ink-faint">Miembro desde {memberSince}</p>
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
            <section className="product-panel space-y-4 rounded-2xl p-5">
                <SectionTitle icon={<User size={16} />} title="Datos del perfil" />
                <form method="post" onSubmit={handleUpdateProfile} className="space-y-3">
                    <div className="space-y-1.5">
                        <label htmlFor="profile-username" className="ml-1 text-sm font-bold text-ink-muted">Nombre de usuario</label>
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
            <section className="product-panel space-y-4 rounded-2xl p-5">
                <SectionTitle icon={<KeyRound size={16} />} title="Seguridad" />
                <form method="post" onSubmit={handleUpdatePassword} className="space-y-3">
                    <div className="space-y-1.5">
                        <label htmlFor="profile-password" className="ml-1 text-sm font-bold text-ink-muted">Nueva contraseña</label>
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

            {showInstallCard && (
                <section className="product-panel space-y-3 rounded-2xl p-5">
                    <SectionTitle icon={<Download size={16} />} title="Instalar app" />
                    <p className="text-sm leading-6 text-ink-muted">
                        Agrega Macitta a tu pantalla de inicio para abrirla como app.
                    </p>
                    {installPrompt ? (
                        <ZenButton variant="primary" className="w-full h-11" onClick={handleInstallApp}>
                            Instalar Macitta
                        </ZenButton>
                    ) : (
                        <p className="rounded-xl border border-border bg-void/35 px-4 py-3 text-xs leading-5 text-ink-muted">
                            {installInstructions}
                        </p>
                    )}
                </section>
            )}

            {/* ── Sign out ──────────────────────────────────── */}
            <button
                onClick={handleLogout}
                className="w-full bg-danger/10 hover:bg-danger/15 border border-danger/25 text-danger
                           font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
                <LogOut size={16} /> Cerrar sesión
            </button>

            {/* ── Danger zone: eliminar cuenta ─────────────── */}
            <section className="rounded-2xl border border-danger/25 bg-danger/5 p-5 space-y-3">
                <div className="flex items-center gap-2 text-danger">
                    <TriangleAlert size={16} />
                    <h3 className="text-base font-black">Zona de peligro</h3>
                </div>
                <p className="text-sm leading-6 text-ink-muted">
                    Eliminar tu cuenta borra permanentemente tu perfil, mazos, historial de
                    repasos, racha y calificaciones. Esta acción no se puede deshacer.
                </p>
                <button
                    onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setMessage(null); }}
                    className="w-full rounded-xl border border-danger/40 bg-danger/10 py-3 text-sm font-bold
                               text-danger transition-colors hover:bg-danger/20"
                >
                    Eliminar mi cuenta
                </button>
            </section>

            {/* ── Modal de confirmación de baja ────────────── */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-account-title"
                    onClick={() => !deleting && setShowDeleteModal(false)}
                >
                    <div
                        className="w-full max-w-sm bg-surface border border-danger/30 rounded-3xl overflow-hidden shadow-2xl animate-pop-in p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 text-danger">
                            <TriangleAlert size={20} />
                            <h3 id="delete-account-title" className="text-lg font-black">¿Eliminar tu cuenta?</h3>
                        </div>
                        <p className="text-sm leading-6 text-ink-muted">
                            Se borrarán todos tus datos de forma permanente. Para confirmar,
                            escribe <strong className="text-ink">ELIMINAR</strong> abajo.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
                            placeholder="ELIMINAR"
                            autoComplete="off"
                            className="w-full soft-field rounded-xl py-3 px-4 text-sm font-bold tracking-widest"
                            aria-label="Escribe ELIMINAR para confirmar"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                className="rounded-xl border border-border py-3 text-sm font-bold text-ink-muted
                                           transition-colors hover:bg-surface-raised hover:text-ink disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirm !== 'ELIMINAR' || deleting}
                                className="rounded-xl bg-danger py-3 text-sm font-black text-void
                                           transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Footer ────────────────────────────────────── */}
            <footer className="pt-6 pb-2 text-center space-y-4 border-t border-border">
                <div className="flex justify-center items-center gap-4 text-xs font-semibold text-ink-muted">
                    <Link href="/privacidad" className="flex items-center gap-1 hover:text-accent transition-colors">
                        <ShieldCheck size={14} className="text-accent" /> Aviso de Privacidad
                    </Link>
                    <span>•</span>
                    <Link href="/terminos" className="hover:text-accent transition-colors">
                        Términos de Servicio
                    </Link>
                </div>

                <div className="flex justify-center gap-3">
                    <SocialButton label="GitHub" href="https://github.com/angelgit3/macitta">
                        <Github size={18} />
                    </SocialButton>
                    <SocialButton label="Instagram" href="https://www.instagram.com/aalberto_anaya/">
                        <Instagram size={18} />
                    </SocialButton>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-ink-faint">
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
        <div className="border-r border-border px-2 text-center last:border-r-0">
            <div className="mx-auto mb-1 flex justify-center text-accent">{icon}</div>
            <div className="text-sm font-bold text-ink">{value}</div>
            <div className="mt-0.5 text-[0.6875rem] text-ink-faint">{label}</div>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 text-accent">
            {icon}
            <h3 className="text-base font-black text-ink">{title}</h3>
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
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface-raised text-ink-faint transition-colors hover:border-accent/35 hover:text-accent"
            aria-label={label}
            title={label}
        >
            {children}
            <span className="sr-only sm:not-sr-only sm:ml-2 sm:text-xs sm:font-bold">{label}</span>
        </a>
    );
}
