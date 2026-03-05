import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

/**
 * PKCE Token Exchange Endpoint
 * Handles both email verification (signup) and password recovery flows.
 *
 * Query params:
 *  - token_hash: the hashed token from the email link
 *  - type: 'email' (signup) | 'recovery' (password reset) | etc.
 *  - next: where to redirect after success (defaults to '/')
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? '/';

    if (token_hash && type) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            // Redirect user to specified redirect URL or root of app
            redirect(next);
        }
    }

    // Redirect the user to an error page with instructions
    redirect('/auth/auth-code-error');
}
