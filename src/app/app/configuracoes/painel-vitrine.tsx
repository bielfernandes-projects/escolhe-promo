"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormularioPerfil } from "./formulario-perfil";
import {
  alternarNaVitrine,
  removerDivulgacao,
  reordenarVitrine,
  publicarComLinkProprio,
} from "./perfil-acoes";

export type DivulgacaoGestao = {
  id: string;
  item_id: string;
  nome: string;
  preco: number;
  imagem_url: string;
  link_afiliado: string;
  usou_link_proprio: boolean;
  na_vitrine: boolean;
  ordem: number;
};

const emReais = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function PainelVitrine({
  perfil,
  divulgacoes,
}: {
  perfil: { handle: string; nome_exibicao: string } | null;
  divulgacoes: DivulgacaoGestao[];
}) {
  const [handle, setHandle] = useState(perfil?.handle ?? null);
  const [itens, setItens] = useState(divulgacoes);
  const [erro, setErro] = useState<string | null>(null);

  const naVitrine = useMemo(
    () => itens.filter((i) => i.na_vitrine),
    [itens],
  );
  const foraVitrine = useMemo(
    () => itens.filter((i) => !i.na_vitrine),
    [itens],
  );

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  async function comErro(fn: () => Promise<{ ok: boolean; erro?: string }>) {
    setErro(null);
    const r = await fn();
    if (!r.ok) setErro(r.erro ?? "Não deu certo. Recarregue e tente de novo.");
  }

  function aoArrastar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    const ids = naVitrine.map((i) => i.id);
    const de = ids.indexOf(String(active.id));
    const para = ids.indexOf(String(over.id));
    const novaOrdem = arrayMove(naVitrine, de, para);
    // Recompõe a lista completa mantendo os "fora da vitrine" no lugar.
    setItens([...novaOrdem, ...foraVitrine]);
    comErro(() => reordenarVitrine(novaOrdem.map((i) => i.id)));
  }

  function esconder(id: string) {
    setItens((antes) =>
      antes.map((i) => (i.id === id ? { ...i, na_vitrine: false } : i)),
    );
    comErro(() => alternarNaVitrine(id, false));
  }

  function mostrar(id: string) {
    setItens((antes) =>
      antes.map((i) => (i.id === id ? { ...i, na_vitrine: true } : i)),
    );
    comErro(() => alternarNaVitrine(id, true));
  }

  function excluir(id: string) {
    setItens((antes) => antes.filter((i) => i.id !== id));
    comErro(() => removerDivulgacao(id));
  }

  function publicar(id: string, link: string) {
    setItens((antes) =>
      antes.map((i) =>
        i.id === id
          ? { ...i, link_afiliado: link, usou_link_proprio: true, na_vitrine: true }
          : i,
      ),
    );
    return comErro(() => publicarComLinkProprio(id, link));
  }

  return (
    <div className="space-y-6">
      <FormularioPerfil
        handleSalvo={perfil?.handle ?? null}
        nomeSalvo={perfil?.nome_exibicao ?? null}
        aoSalvar={(h) => setHandle(h)}
      />

      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      {!handle ? (
        <p className="rounded-2xl bg-tela p-5 text-sm text-tinta-fraca">
          Defina seu @ acima pra ativar sua vitrine. Depois, tudo que você
          compartilhar entra aqui.
        </p>
      ) : (
        <>
          <section>
            <h3 className="text-sm font-bold text-tinta">
              Na sua vitrine{" "}
              <span className="font-normal text-tinta-fraca">
                ({naVitrine.length})
              </span>
            </h3>
            <p className="mt-1 text-xs text-tinta-fraca">
              Arraste pra reordenar. É a ordem que aparece em{" "}
              <a
                href={`/@${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-marca-700 underline underline-offset-2"
              >
                escolhepromo.com.br/@{handle}
              </a>
            </p>

            {naVitrine.length === 0 ? (
              <p className="mt-3 rounded-xl bg-tela p-4 text-xs text-tinta-fraca">
                Nada publicado ainda.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <DndContext
                  sensors={sensores}
                  collisionDetection={closestCenter}
                  onDragEnd={aoArrastar}
                >
                  <SortableContext
                    items={naVitrine.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {naVitrine.map((item) => (
                      <LinhaSortable
                        key={item.id}
                        item={item}
                        onEsconder={() => esconder(item.id)}
                        onExcluir={() => excluir(item.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </section>

          {foraVitrine.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-tinta">
                Fora da vitrine{" "}
                <span className="font-normal text-tinta-fraca">
                  ({foraVitrine.length})
                </span>
              </h3>
              <p className="mt-1 text-xs text-tinta-fraca">
                Você divulgou com o link genérico. Cole o seu link de afiliado
                pra publicar e ganhar comissão.
              </p>
              <div className="mt-3 space-y-2">
                {foraVitrine.map((item) => (
                  <LinhaForaVitrine
                    key={item.id}
                    item={item}
                    onPublicar={(link) => publicar(item.id, link)}
                    onExcluir={() => excluir(item.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function LinhaSortable({
  item,
  onEsconder,
  onExcluir,
}: {
  item: DivulgacaoGestao;
  onEsconder: () => void;
  onExcluir: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="flex items-center gap-2 rounded-xl bg-superficie p-2 ring-1 ring-black/[0.06]"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar"
        className="shrink-0 cursor-grab touch-none px-1 text-tinta-fraca active:cursor-grabbing"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imagem_url}
        alt=""
        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-black/[0.06]"
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-medium text-tinta">{item.nome}</p>
        <p className="text-[11px] text-tinta-fraca">{emReais(item.preco)}</p>
      </div>
      <button
        onClick={onEsconder}
        className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-tinta-fraca hover:bg-tela"
      >
        Esconder
      </button>
      <button
        onClick={onExcluir}
        aria-label="Excluir"
        className="shrink-0 rounded-lg p-1.5 text-tinta-fraca hover:bg-red-50 hover:text-red-600"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
        </svg>
      </button>
    </div>
  );
}

function LinhaForaVitrine({
  item,
  onPublicar,
  onExcluir,
}: {
  item: DivulgacaoGestao;
  onPublicar: (link: string) => void | Promise<void>;
  onExcluir: () => void;
}) {
  const [link, setLink] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function publicar() {
    if (!link.trim()) return;
    setSalvando(true);
    await onPublicar(link.trim());
    setSalvando(false);
  }

  return (
    <div className="rounded-xl bg-superficie p-2.5 ring-1 ring-black/[0.06]">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imagem_url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-black/[0.06]"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-medium text-tinta">{item.nome}</p>
          <p className="text-[11px] text-tinta-fraca">{emReais(item.preco)}</p>
        </div>
        <button
          onClick={onExcluir}
          aria-label="Excluir"
          className="shrink-0 rounded-lg p-1.5 text-tinta-fraca hover:bg-red-50 hover:text-red-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
          </svg>
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://s.shopee.com.br/..."
          className="min-w-0 flex-1 rounded-lg border border-black/10 bg-superficie px-3 py-2 text-xs outline-none focus:border-marca-500"
        />
        <button
          onClick={publicar}
          disabled={salvando || !link.trim()}
          className="shrink-0 rounded-lg bg-marca-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-marca-600 disabled:opacity-50"
        >
          {salvando ? "..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}
