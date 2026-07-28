import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { CONTENT_LIMITS } from "@macitta/shared";

export async function requireAuthenticatedUser(
    supabase: SupabaseClient,
): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("No autorizado");
    return user;
}

export function throwSafeDatabaseError(
    operation: string,
    error: { code?: string; message?: string } | null,
): never {
    console.error(`[server-action:${operation}]`, {
        code: error?.code ?? "unknown",
    });
    throw new Error("No se pudo completar la operación.");
}

export async function assertDeckQuota(
    supabase: SupabaseClient,
    userId: string,
): Promise<void> {
    const { count, error } = await supabase
        .from("decks")
        .select("id", { count: "exact", head: true })
        .eq("author_id", userId);
    if (error) throwSafeDatabaseError("count-decks", error);
    if ((count ?? 0) >= CONTENT_LIMITS.decksPerUser) {
        throw new Error(`Alcanzaste el límite de ${CONTENT_LIMITS.decksPerUser} mazos personales.`);
    }
}

export async function assertOwnedDeck(
    supabase: SupabaseClient,
    deckId: string,
    userId: string,
): Promise<void> {
    const { data, error } = await supabase
        .from("decks")
        .select("id")
        .eq("id", deckId)
        .eq("author_id", userId)
        .maybeSingle();
    if (error) throwSafeDatabaseError("authorize-deck", error);
    if (!data) throw new Error("No autorizado");
}

export async function assertCardCapacity(
    supabase: SupabaseClient,
    deckId: string,
    additionalCards = 1,
): Promise<void> {
    const { count, error } = await supabase
        .from("cards")
        .select("id", { count: "exact", head: true })
        .eq("deck_id", deckId);
    if (error) throwSafeDatabaseError("count-cards", error);
    if ((count ?? 0) + additionalCards > CONTENT_LIMITS.cardsPerDeck) {
        throw new Error(
            `Un mazo admite hasta ${CONTENT_LIMITS.cardsPerDeck} tarjetas.`,
        );
    }
}

export async function assertOwnedCard(
    supabase: SupabaseClient,
    cardId: string,
    userId: string,
): Promise<{ deckId: string }> {
    const { data: card, error } = await supabase
        .from("cards")
        .select("deck_id")
        .eq("id", cardId)
        .maybeSingle();
    if (error) throwSafeDatabaseError("read-card-owner", error);
    if (!card) throw new Error("No autorizado");
    await assertOwnedDeck(supabase, card.deck_id, userId);
    return { deckId: card.deck_id };
}
