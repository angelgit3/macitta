import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Auth Confirmation Endpoint
 * Handles token exchange for both email verification and password recovery.
 *
 * Supports two flows:
 *  1. PKCE flow: receives `code` param → exchanges for session
 *  2. Token hash flow: receives `token_hash` + `type` → verifies OTP
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const next = searchParams.get('next') ?? '/';

    // Flow 1: PKCE code exchange (used by Supabase email links in production)
    const code = searchParams.get('code');
    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            redirect(next);
        }
    }

    // Flow 2: Token hash verification (email confirmation links)
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;

    if (token_hash && type) {
        const supabase = await createClient();
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            redirect(next);
        }
    }

    // If nothing worked, send to error page
    redirect('/auth/auth-code-error');
}
