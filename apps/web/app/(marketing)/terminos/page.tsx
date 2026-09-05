import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import {
  Scale,
  FileCheck2,
  BookOpen,
  CloudOff,
  UserCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Términos de Servicio | Macitta",
  description:
    "Términos y condiciones de uso de la plataforma de estudio Macitta, sus funciones offline y módulos de práctica.",
};

const sections = [
  { id: "aceptacion", title: "1. Aceptación de los Términos" },
  { id: "uso-servicio", title: "2. Uso Aceptable del Servicio" },
  { id: "propiedad-intelectual", title: "3. Propiedad Intelectual" },
  { id: "offline-sync", title: "4. Funciones Offline y Sincronización" },
  { id: "limitacion-responsabilidad", title: "5. Limitación de Responsabilidad" },
  { id: "modificaciones", title: "6. Modificaciones de Servicio" },
  { id: "contacto", title: "7. Contacto Legal" },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-void text-ink">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-void/88 backdrop-blur-xl">
        <nav
          aria-label="Navegación de términos de servicio"
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
            <Scale size={14} />
            Condiciones de Uso
          </div>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-ink sm:text-5xl">
            Términos de Servicio
          </h1>
          <p className="max-w-2xl text-base leading-7 text-ink-muted">
            Bienvenido a <strong className="text-ink font-bold">Macitta</strong>. Al crear una cuenta o utilizar nuestra plataforma, aceptas cumplir con los siguientes términos y condiciones reguladores.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-ink-faint">
            <span>Última actualización: 1 de agosto de 2026</span>
            <span>•</span>
            <span>Versión 1.0</span>
          </div>
        </div>

        {/* Navigation Index (TOC) */}
        <nav aria-label="Índice de términos" className="my-8 rounded-2xl border border-border bg-surface/60 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent">
            Índice de los Términos
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
          <section id="aceptacion" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <FileCheck2 size={20} />
              <h2 className="text-xl font-black text-ink">1. Aceptación de los Términos</h2>
            </div>
            <p>
              Al acceder, registrarte o hacer uso del sitio web o aplicación web progresiva (PWA) de Macitta, confirmas haber leído, comprendido y aceptado quedar vinculado por estos Términos de Servicio y por nuestro <Link href="/privacidad" className="text-accent font-bold underline">Aviso de Privacidad</Link>.
            </p>
            <p>
              El servicio está dirigido a personas <strong className="text-ink font-bold">mayores de 13 años</strong>. Si tienes entre 13 y 17 años, solo puedes crear y usar una cuenta con el consentimiento y supervisión de tu padre, madre o tutor legal, quien acepta estos términos en tu nombre.
            </p>
          </section>

          {/* Section 2 */}
          <section id="uso-servicio" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <UserCheck size={20} />
              <h2 className="text-xl font-black text-ink">2. Uso Aceptable del Servicio</h2>
            </div>
            <p>Macitta está diseñada como una herramienta de apoyo académico personal para la memorización y práctica de idioma inglés. Te comprometes a:</p>
            <ul className="list-disc space-inside space-y-2 pl-5">
              <li>Proporcionar información verdadera durante tu registro.</li>
              <li>Mantener la seguridad de tus credenciales de acceso.</li>
              <li>No realizar actividades de ingeniería inversa, scraping malintencionado ni ataques de denegación de servicio a los servidores de la plataforma.</li>
              <li>Utilizar el contenido del banco de lecturas y exámenes de preparación únicamente para tu aprendizaje personal.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="propiedad-intelectual" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <BookOpen size={20} />
              <h2 className="text-xl font-black text-ink">3. Propiedad Intelectual</h2>
            </div>
            <p>
              Los algoritmos de repetición, la interfaz de usuario, el diseño <strong className="text-ink font-bold">Estudio Lúmico</strong>, logotipos, código fuente y los reactivos originales del banco de estudio son propiedad intelectual de Macitta y Alberto Anaya.
            </p>
            <p>
              Conservas la propiedad total de los mazos y tarjetas personalizadas creados por ti dentro de tu cuenta.
            </p>
          </section>

          {/* Section 4 */}
          <section id="offline-sync" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <CloudOff size={20} />
              <h2 className="text-xl font-black text-ink">4. Funciones Offline y Sincronización</h2>
            </div>
            <p>
              Macitta incorpora capacidades de trabajo sin conexión (Offline-First). El progreso de tus sesiones almacenado localmente en tu navegador será sincronizado con la nube una vez que el dispositivo reestablezca la conectividad. Macitta no se hace responsable por pérdidas de datos ocasionadas por la limpieza manual de la memoria caché del navegador antes de realizar la sincronización.
            </p>
          </section>

          {/* Section 5 */}
          <section id="limitacion-responsabilidad" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <AlertCircle size={20} />
              <h2 className="text-xl font-black text-ink">5. Limitación de Responsabilidad</h2>
            </div>
            <p>
              Macitta ofrece material de práctica orientado a exámenes como TOEFL ITP®, pero no otorga certificaciones oficiales ni garantiza puntajes específicos en evaluaciones administradas por instituciones terceras (como ETS®).
            </p>
          </section>

          {/* Section 6 */}
          <section id="modificaciones" className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles size={20} />
              <h2 className="text-xl font-black text-ink">6. Modificaciones de Servicio</h2>
            </div>
            <p>
              Nos reservamos el derecho de añadir nuevas funciones, optimizar el motor de repetición o actualizar los términos en cualquier momento para mantener la excelencia del servicio.
            </p>
          </section>

          {/* Section 7 */}
          <section id="contacto" className="scroll-mt-24 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Scale size={20} />
              <h2 className="text-xl font-black text-ink">7. Contacto Legal</h2>
            </div>
            <p>
              Para cualquier consulta referente a estos términos, puedes escribirnos a <a href="mailto:contacto@macitta.com" className="text-accent font-semibold underline">contacto@macitta.com</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-void px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <Logo variant="full" size={24} className="text-ink" iconClassName="text-accent" textClassName="font-black" />
          <div className="flex items-center gap-6 text-xs text-ink-muted">
            <Link href="/privacidad" className="hover:text-ink transition-colors">Aviso de Privacidad</Link>
            <Link href="/terminos" className="text-accent font-bold">Términos de Servicio</Link>
            <Link href="/" className="hover:text-ink transition-colors">Inicio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
