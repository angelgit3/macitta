import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCard } from "@/app/actions/cards";
import type { Card } from "@/types/models";

export function useDeckDetails() {
    const router = useRouter();
    
    // Modal states
    const [showAssign, setShowAssign] = useState(false);
    const [showDeleteDeck, setShowDeleteDeck] = useState(false);
    const [showAddCard, setShowAddCard] = useState(false);
    
    // Card interaction states
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

    async function handleDeleteCard(cardId: string) {
        if (!confirm("¿Eliminar esta tarjeta de forma permanente?")) return;
        
        setDeletingCardId(cardId);
        try {
            await deleteCard(cardId);
            router.refresh();
        } catch (e: any) {
            alert(e.message || "Error al eliminar la tarjeta");
        } finally {
            setDeletingCardId(null);
        }
    }

    return {
        state: {
            showAssign,
            showDeleteDeck,
            showAddCard,
            editingCard,
            deletingCardId,
        },
        actions: {
            setShowAssign,
            setShowDeleteDeck,
            setShowAddCard,
            setEditingCard,
            handleDeleteCard,
        },
        router
    };
}
