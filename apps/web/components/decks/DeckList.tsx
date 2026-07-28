"use client";

import { useState } from "react";
import { FileJson, Globe, Library, Plus, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ImportDeckDialog } from "./ImportDeckDialog";
import type { Deck } from "@/types/models";

interface DeckListProps {
  personalDecks: Deck[];
  globalDecks?: Deck[];
}

export function DeckList({ personalDecks, globalDecks = [] }: DeckListProps) {
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const query = search.trim().toLocaleLowerCase("es-MX");
  const filteredPersonal = personalDecks.filter((deck) => deck.title.toLocaleLowerCase("es-MX").includes(query));
  const filteredGlobal = globalDecks.filter((deck) => deck.title.toLocaleLowerCase("es-MX").includes(query));

  return (
    <div className="flex flex-col gap-8 pb-24">
      <header className="flex flex-col gap-6 pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-4">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-accent">Biblioteca</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-ink sm:text-4xl">Mazos</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink-muted">
            Elige una colección para estudiar o crea material propio.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-4 text-sm font-bold text-ink-muted transition-colors hover:border-accent/35 hover:text-ink"
          >
            <FileJson size={18} aria-hidden="true" /> Importar
          </button>
          <Link href="/vocabulario/nuevo" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-void transition-colors hover:bg-accent-hover">
            <Plus size={18} aria-hidden="true" /> Crear mazo
          </Link>
        </div>
      </header>

      <div className="sticky top-0 z-10 -mx-1 bg-void/95 px-1 py-2 backdrop-blur-lg">
        <label htmlFor="deck-search" className="sr-only">Buscar mazo</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={18} aria-hidden="true" />
          <input id="deck-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre" className="soft-field min-h-12 w-full rounded-xl py-3 pl-12 pr-4" />
        </div>
      </div>

      <div className="space-y-10">
        {globalDecks.length > 0 && <DeckSection title="Colecciones de Macitta" description="Listas para comenzar" decks={filteredGlobal} global />}
        <DeckSection title="Tus colecciones" description="Creadas o importadas por ti" decks={filteredPersonal} />
      </div>

      {showImport && <ImportDeckDialog onClose={() => setShowImport(false)} />}
    </div>
  );
}

function DeckSection({ title, description, decks, global = false }: { title: string; description: string; decks: Deck[]; global?: boolean }) {
  return (
    <section aria-labelledby={`deck-section-${global ? "global" : "personal"}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id={`deck-section-${global ? "global" : "personal"}`} className="text-xl font-black tracking-tight text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        </div>
        <span className="text-sm tabular-nums text-ink-faint">{decks.length}</span>
      </div>

      {decks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong px-5 py-8 text-sm text-ink-muted">
          No encontramos mazos en esta sección.
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/85">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/vocabulario/${deck.id}`} className="group flex min-h-24 items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-raised/75 sm:px-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                {global ? <Globe size={20} aria-hidden="true" /> : <Library size={20} aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-black text-ink">{deck.title}</span>
                {deck.description && <span className="mt-1 block line-clamp-2 text-sm leading-6 text-ink-muted">{deck.description}</span>}
              </span>
              <ArrowRight size={18} className="shrink-0 text-ink-faint transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
