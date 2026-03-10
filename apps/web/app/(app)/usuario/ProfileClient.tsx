'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ZenButton } from '@/components/ui/ZenButton';
import {
    KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2,
    MessageSquare, Bug, Lightbulb, MessageCircle, Send,
    GraduationCap, BookOpen, Code2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const FEEDBACK_TYPES = [
    { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { value: 'suggestion', label: 'Sugerencia', icon: Lightbulb, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { value: 'other', label: 'Otro', icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
] as const;

export function ProfileClient({ initialUser }: { initialUser: any }) {
    const supabase = createClient();
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [userRole, setUserRole] = useState<string>('student');

    // Feedback state
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'other'>('suggestion');
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    // Fetch user role
    useEffect(() => {
        async function fetchRole() {
            if (!initialUser?.id) return;
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', initialUser.id)
                .single();
            if (data) setUserRole(data.role);
        }
        fetchRole();
    }, [initialUser?.id, supabase]);

    const roleDisplay = userRole === 'teacher'
        ? { label: 'Docente', icon: BookOpen, className: 'text-emerald-400' }
        : userRole === 'admin'
            ? { label: 'Admin', icon: Code2, className: 'text-purple-400' }
            : { label: 'Estudiante', icon: GraduationCap, className: 'text-blue-400' };

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

    const handleFeedbackSubmit = async () => {
        if (!feedbackMsg.trim() || !initialUser?.id) return;
        setFeedbackLoading(true);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert({
                    user_id: initialUser.id,
                    type: feedbackType,
                    message: feedbackMsg.trim(),
                });

            if (error) throw error;
            setFeedbackSent(true);
            setFeedbackMsg('');
            setTimeout(() => {
                setFeedbackSent(false);
                setFeedbackOpen(false);
            }, 2500);
        } catch (err) {
            console.error('[Feedback] Error:', err);
        } finally {
            setFeedbackLoading(false);
        }
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
                        <p className={`text-sm font-medium flex items-center gap-1.5 ${roleDisplay.className}`}>
                            <roleDisplay.icon size={14} />
                            {roleDisplay.label}
                        </p>
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

            {/* Feedback Section */}
            <div className="bg-stone-surface border border-border-subtle rounded-3xl p-6 space-y-4">
                <button
                    onClick={() => setFeedbackOpen(!feedbackOpen)}
                    className="w-full flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-yellow-400" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-dim">Feedback & Soporte</h3>
                    </div>
                    <span className={`text-text-dim text-xs transition-transform ${feedbackOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {feedbackOpen && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {feedbackSent ? (
                            <div className="flex flex-col items-center gap-2 py-6 text-green-400">
                                <CheckCircle2 size={32} />
                                <p className="font-bold">¡Gracias por tu feedback!</p>
                                <p className="text-xs text-zinc-500">Tu mensaje ha sido enviado.</p>
                            </div>
                        ) : (
                            <>
                                {/* Type selector */}
                                <div className="flex gap-2">
                                    {FEEDBACK_TYPES.map(ft => {
                                        const Icon = ft.icon;
                                        const isActive = feedbackType === ft.value;
                                        return (
                                            <button
                                                key={ft.value}
                                                onClick={() => setFeedbackType(ft.value)}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${isActive ? ft.color : 'text-zinc-500 bg-transparent border-border-subtle hover:border-zinc-600'
                                                    }`}
                                            >
                                                <Icon size={14} />
                                                {ft.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Message textarea */}
                                <textarea
                                    value={feedbackMsg}
                                    onChange={(e) => setFeedbackMsg(e.target.value)}
                                    placeholder={
                                        feedbackType === 'bug'
                                            ? 'Describe el error que encontraste...'
                                            : feedbackType === 'suggestion'
                                                ? '¿Qué te gustaría ver en Macitta?'
                                                : 'Escribe tu mensaje...'
                                    }
                                    rows={3}
                                    className="w-full bg-black/20 border border-border-subtle rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:border-accent-focus transition-colors resize-none"
                                />

                                {/* Submit */}
                                <ZenButton
                                    variant="primary"
                                    className="w-full h-11 gap-2"
                                    disabled={feedbackLoading || !feedbackMsg.trim()}
                                    onClick={handleFeedbackSubmit}
                                >
                                    {feedbackLoading
                                        ? <Loader2 className="animate-spin" size={16} />
                                        : <><Send size={14} /> Enviar Feedback</>
                                    }
                                </ZenButton>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-3xl transition-all flex items-center justify-center gap-2"
            >
                <LogOut size={18} />
                Cerrar Sesión
            </button>

            {/* Developer Credit */}
            <div className="text-center space-y-1 py-4">
                <p className="text-[11px] text-zinc-600 flex items-center justify-center gap-1.5">
                    <Code2 size={12} />
                    Desarrollado por <span className="text-zinc-400 font-medium">Ángel Anaya</span>
                </p>
                <p className="text-[10px] text-zinc-700">
                    Macitta v1.0 — UPT 2026
                </p>
            </div>
        </div>
    );
}
