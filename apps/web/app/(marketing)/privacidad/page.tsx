import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Cookie,
  FileText,
  Mail,
  ArrowLeft,
  KeyRound,
  HardDrive,
} from "lucide-react";

export const metadata = {
  title: "Aviso de Privacidad | Macitta",
  description:
    "Conoce cómo Macitta protege tus datos personales, tu progreso académico y la seguridad de tu información en nuestra plataforma.",
};

const sections = [
  { id: "responsable", title: "1. Responsable del Tratamiento" },
  { id: "datos-recabados", title: "2. Datos Personales Recabados" },
  { id: "finalidad", title: "3. Finalidad del Tratamiento" },
  { id: "seguridad", title: "4. Seguridad y Almacenamiento" },
  { id: "derechos-arco", title: "5. Derechos ARCO y Portabilidad" },
  { id: "cookies-offline", title: "6. Cookies y Almacenamiento Offline" },
  { id: "modificaciones", title: "7. Cambios al Aviso" },
  { id: "contacto", title: "8. Contacto de Privacidad" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-void text-ink">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-void/88 backdrop-blur-xl">
        <nav
          aria-label="Navegación del aviso de privacidad"
          className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
        >
          <Link
            href="/"
            aria-label="Volver a inicio"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Inicio</span>
          </Link>

          <Link href="/" aria-label="Macitta, inicio" className="inline-flex min-h-11 items-center">
            <Logo
              variant="full"
              size={28}
              className="text-ink"
              iconClassName="text-accent"
              textClassName="text-[1.05rem] font-black"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              Entrar
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Header Badge & Title */}
        <div className="flex flex-col items-start gap-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
            <ShieldCheck size={14} />
            Transparencia y Seguridad Legal
          </div>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-ink sm:text-5xl">
            Aviso de Privacidad
          </h1>
          <p className="max-w-2xl text-base leading-7 text-ink-muted">
            En <strong className="text-ink font-bold">Macitta</strong> respetamos profundamente tu privacidad. Este documento explica de manera clara qué datos recabamos, cómo los almacenamos y cuáles son tus derechos conforme a la legislación aplicable (LFPDPPP en México y estándares internacionales).
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-ink-faint">
            <span>Última actualización: 1 de agosto de 2026</span>
            <span>•</span>
            <span>Versión 1.0</span>
          </div>
        </div>

        {/* Navigation Index (TOC) */}
        <nav aria-label="Índice de contenido" className="my-8 rounded-2xl border border-border bg-surface/60 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent">
            Índice del Documento
          </h2>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-sm">
            {sections.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className="inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-accent font-medium"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                  {sec.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Policy Sections */}
        <div className="space-y-12 text-sm sm:text-base text-ink-muted leading-7">
          {/* Section 1 */}
          <section id="responsable" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <UserCheck size={20} />
              <h2 className="text-xl font-black text-ink">1. Responsable del Tratamiento</h2>
            </div>
            <p>
              <strong className="text-ink">Macitta</strong> (en adelante "la Plataforma") es una aplicación web y PWA dedicada al estudio de vocabulario, repetición espaciada y preparación para exámenes estandarizados como TOEFL ITP®.
            </p>
            <p>
              El responsable del tratamiento de tus datos personales es Alberto Anaya, desarrollador titular del proyecto Macitta. Nos comprometemos a resguardar la confidencialidad de tu información personal bajo estrictas medidas de seguridad técnica y organizativa.
            </p>
          </section>

          {/* Section 2 */}
          <section id="datos-recabados" className="scroll-mt-24 space-y-4 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <Database size={20} />
              <h2 className="text-xl font-black text-ink">2. Datos Personales Recabados</h2>
            </div>
            <p>Recabamos únicamente los datos necesarios para brindarte una experiencia de aprendizaje personalizada y eficiente:</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <KeyRound size={16} className="text-accent" />
                  Datos de Cuenta y Autenticación
                </div>
                <p className="text-xs text-ink-muted leading-6">
                  Correo electrónico, nombre de usuario público y contraseña encriptada (vía Supabase Auth).
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <FileText size={16} className="text-amber" />
                  Progreso de Estudio y Repasos
                </div>
                <p className="text-xs text-ink-muted leading-6">
                  Historial de repasos de tarjetas (FSRS/SM-2), mazos creados, racha de estudio, precisión y calificaciones TOEFL.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <HardDrive size={16} className="text-success" />
                  Almacenamiento Local (PWA)
                </div>
                <p className="text-xs text-ink-muted leading-6">
                  Copia en caché local (IndexedDB) para permitir continuar tus repeticiones sin conexión a internet.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <Lock size={16} className="text-accent" />
                  Datos Técnicos Básicos
                </div>
                <p className="text-xs text-ink-muted leading-6">
                  Agente de usuario, zona horaria y estado de red para coordinar la sincronización offline.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="finalidad" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <FileText size={20} />
              <h2 className="text-xl font-black text-ink">3. Finalidad del Tratamiento</h2>
            </div>
            <p>Tus datos son utilizados exclusivamente para las siguientes finalidades primarias:</p>
            <ul className="list-disc space-inside space-y-2 pl-5">
              <li>Gestionar tu cuenta de usuario y permitir el acceso seguro a tus mazos.</li>
              <li>Calcular los intervalos óptimos de repetición espaciada para tu aprendizaje.</li>
              <li>Sincronizar de manera bidireccional el avance generado sin conexión a internet.</li>
              <li>Generar tus métricas personales de rendimiento, maestrías y estadísticas de estudio.</li>
            </ul>
            <p className="text-xs text-ink-faint pt-2">
              <strong className="text-ink font-bold">Nota de Transparencia:</strong> NO utilizamos tus datos para enviar publicidad invasiva de terceros, ni vendemos ni comercializamos tu información personal a ninguna empresa o corredor de datos.
            </p>
          </section>

          {/* Section 4 */}
          <section id="seguridad" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <Lock size={20} />
              <h2 className="text-xl font-black text-ink">4. Seguridad y Almacenamiento</h2>
            </div>
            <p>
              Implementamos arquitectura defensiva en capas para asegurar que solo tú puedas acceder a tu información:
            </p>
            <ul className="list-disc space-inside space-y-2 pl-5">
              <li>
                <strong className="text-ink font-bold">Row Level Security (RLS):</strong> En la base de datos PostgreSQL respaldada por Supabase, cada registro de estudio está aislado por reglas estrictas a nivel de fila. Ningún otro usuario puede leer o modificar tu contenido.
              </li>
              <li>
                <strong className="text-ink font-bold">Tránsito Cifrado:</strong> Toda comunicación entre tu navegador o PWA y nuestros servidores se realiza obligatoriamente mediante HTTPS/TLS 1.3 con cifrado de alto nivel.
              </li>
              <li>
                <strong className="text-ink font-bold">Protección de Contraseñas:</strong> Las credenciales no se almacenan en texto plano; son procesadas con algoritmos de hashing seguro (Argon2 / Bcrypt).
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="derechos-arco" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck size={20} />
              <h2 className="text-xl font-black text-ink">5. Derechos ARCO y Portabilidad</h2>
            </div>
            <p>
              Como titular de tus datos, posees el control total de tu información. Tienes derecho a solicitar en cualquier momento:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-border p-3.5 bg-surface/40">
                <span className="font-bold text-ink text-sm block mb-1">Acceso & Rectificación</span>
                <span className="text-xs text-ink-muted">Consulta y modifica tu nombre de usuario o contraseña directamente en tu panel de cuenta.</span>
              </div>
              <div className="rounded-xl border border-border p-3.5 bg-surface/40">
                <span className="font-bold text-ink text-sm block mb-1">Cancelación & Oposición</span>
                <span className="text-xs text-ink-muted">Elimina definitivamente tu cuenta y todos tus mazos asociados o solicita la supresión de datos guardados.</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="cookies-offline" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <Cookie size={20} />
              <h2 className="text-xl font-black text-ink">6. Cookies y Almacenamiento Offline</h2>
            </div>
            <p>
              Macitta utiliza únicamente almacenamiento técnico esencial:
            </p>
            <ul className="list-disc space-inside space-y-2 pl-5">
              <li><strong className="text-ink font-bold">Tokens de Sesión (Cookies/LocalAuth):</strong> Mantienen tu cuenta autenticada de manera segura.</li>
              <li><strong className="text-ink font-bold">IndexedDB / LocalForage:</strong> Permite que la aplicación funcione en modo sin conexión (Offline-First) y almacene las tarjetas de tus sesiones.</li>
            </ul>
            <p className="text-xs text-ink-faint">No utilizamos cookies ni balizas de rastreo publicitario de redes de terceros.</p>
          </section>

          {/* Section 7 */}
          <section id="modificaciones" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <FileText size={20} />
              <h2 className="text-xl font-black text-ink">7. Modificaciones al Aviso</h2>
            </div>
            <p>
              Nos reservamos el derecho de actualizar este aviso de privacidad para reflejar mejoras en la plataforma o cambios legislativos. Cualquier modificación sustancial será notificada a través de la aplicación o en la portada del sitio con la fecha de actualización correspondiente.
            </p>
          </section>

          {/* Section 8 */}
          <section id="contacto" className="scroll-mt-24 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Mail size={20} />
              <h2 className="text-xl font-black text-ink">8. Contacto de Privacidad</h2>
            </div>
            <p>
              Si tienes preguntas, dudas o deseas ejercer alguno de tus derechos ARCO, puedes comunicarte directamente con el equipo a través de:
            </p>
            <div className="rounded-2xl border border-accent/25 bg-accent/5 p-5 text-sm">
              <p className="font-bold text-ink">Atención a Privacidad Macitta</p>
              <p className="mt-1 text-ink-muted">Correo electrónico: <a href="mailto:contacto@macitta.com" className="text-accent font-semibold underline hover:text-accent-hover">contacto@macitta.com</a></p>
              <p className="mt-1 text-ink-faint text-xs">Atención directa en español e inglés.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-void px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <Logo variant="full" size={24} className="text-ink" iconClassName="text-accent" textClassName="font-black" />
          <div className="flex items-center gap-6 text-xs text-ink-muted">
            <Link href="/privacidad" className="text-accent font-bold">Aviso de Privacidad</Link>
            <Link href="/terminos" className="hover:text-ink transition-colors">Términos de Servicio</Link>
            <Link href="/" className="hover:text-ink transition-colors">Inicio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
