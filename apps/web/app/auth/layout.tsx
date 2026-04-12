import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-void">
            <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
                <Logo variant="full" size={32} className="text-white" iconClassName="text-accent-focus" textClassName="text-text-dim hover:text-white transition-colors" />
            </Link>
            {children}
        </div>
    );
}
