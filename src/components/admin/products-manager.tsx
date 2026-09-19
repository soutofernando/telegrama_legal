"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct, upsertProduct } from "@/app/actions/admin";
import { compressProductImage } from "@/lib/compress-product-image";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePaginatedItems } from "@/hooks/use-pagination";
import { ProductKindBadge } from "@/components/vitrine/product-kind-badge";
import { PRODUCT_KINDS, PRODUCT_KIND_LABELS } from "@/lib/product-kind";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import type { Product, ProductKind } from "@/types/database";

const LOW_STOCK = 15;
const STOCK_CAP = 200;

function StockBar({ estoque }: { estoque: number }) {
  const pct = Math.min(100, (estoque / STOCK_CAP) * 100);
  const low = estoque <= LOW_STOCK;
  return (
    <div className="mt-3">
      <div className="h-2 overflow-hidden rounded-full bg-background">
        <div
          className={`h-full rounded-full transition-all ${low ? "bg-accent" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProductsManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    imagem_url: "",
    tipo: "botton" as ProductKind,
    preco_promocional: "",
    promo_combo_quantidade: "",
    promo_combo_preco: "",
  });

  const { visible, page, setPage, pages, totalItems, pageSize } =
    usePaginatedItems(products, DEFAULT_PAGE_SIZE);

  const reset = () => {
    setForm({
      id: "",
      nome: "",
      descricao: "",
      preco: "",
      estoque: "",
      imagem_url: "",
      tipo: "botton",
      preco_promocional: "",
      promo_combo_quantidade: "",
      promo_combo_preco: "",
    });
    setUploadError(null);
    setOpen(false);
  };

  const edit = (p: Product) => {
    setForm({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco: String(p.preco),
      estoque: String(p.estoque),
      imagem_url: p.imagem_url,
      tipo: p.tipo ?? "botton",
      preco_promocional:
        p.preco_promocional != null ? String(p.preco_promocional) : "",
      promo_combo_quantidade:
        p.promo_combo_quantidade != null
          ? String(p.promo_combo_quantidade)
          : "",
      promo_combo_preco:
        p.promo_combo_preco != null ? String(p.promo_combo_preco) : "",
    });
    setOpen(true);
  };

  const onFile = async (file: File) => {
    setUploadError(null);
    setUploadingImage(true);
    try {
      const compressed = await compressProductImage(file);
      const body = new FormData();
      body.append("file", compressed);
      const res = await fetch("/api/admin/upload-product-image", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      const url = data.url;
      if (!res.ok || !url) {
        throw new Error(data.error ?? "Falha no upload");
      }
      setForm((f) => ({ ...f, imagem_url: url }));
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const save = () => {
    startTransition(async () => {
      await upsertProduct({
        id: form.id || undefined,
        nome: form.nome,
        descricao: form.descricao,
        preco: Number(form.preco),
        estoque: Number(form.estoque),
        imagem_url: form.imagem_url,
        tipo: form.tipo,
        preco_promocional: form.preco_promocional
          ? Number(form.preco_promocional)
          : null,
        promo_combo_quantidade: form.promo_combo_quantidade
          ? Number(form.promo_combo_quantidade)
          : null,
        promo_combo_preco: form.promo_combo_preco
          ? Number(form.promo_combo_preco)
          : null,
      });
      reset();
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Button variant="secondary" onClick={() => { reset(); setOpen(true); }}>
        Novo produto
      </Button>

      {open && (
        <Card className="border border-primary/15">
          <p className="mb-4 font-bold text-foreground">
            {form.id ? "Editar produto" : "Novo produto"}
          </p>
          <div className="space-y-3">
            <input
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="input-field text-base"
            />
            <textarea
              placeholder="Descrição"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="input-field min-h-[5rem] text-base"
              rows={3}
            />
            <label className="block text-sm font-semibold text-muted">
              Tipo
              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo: e.target.value as ProductKind,
                  })
                }
                className="input-field mt-2 text-base"
              >
                {PRODUCT_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {PRODUCT_KIND_LABELS[kind]}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Preço"
                type="number"
                step="0.01"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                className="input-field text-base"
              />
              <input
                placeholder="Estoque"
                type="number"
                value={form.estoque}
                onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                className="input-field text-base"
              />
            </div>
            <fieldset className="space-y-3 rounded-xl border border-border/80 p-3">
              <legend className="px-1 text-sm font-semibold text-muted">
                Promoções (opcional)
              </legend>
              <input
                placeholder="Preço promocional (ex.: 4,00)"
                type="number"
                step="0.01"
                value={form.preco_promocional}
                onChange={(e) =>
                  setForm({ ...form, preco_promocional: e.target.value })
                }
                className="input-field text-base"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Combo: quantidade (ex.: 2)"
                  type="number"
                  min={2}
                  value={form.promo_combo_quantidade}
                  onChange={(e) =>
                    setForm({ ...form, promo_combo_quantidade: e.target.value })
                  }
                  className="input-field text-base"
                />
                <input
                  placeholder="Combo: preço total (ex.: 5,00)"
                  type="number"
                  step="0.01"
                  value={form.promo_combo_preco}
                  onChange={(e) =>
                    setForm({ ...form, promo_combo_preco: e.target.value })
                  }
                  className="input-field text-base"
                />
              </div>
              <p className="text-xs text-muted">
                Ex.: preço R$ 5 com promocional R$ 4 mostra badge -20%. Combo 2
                por R$ 5 aplica no carrinho ao comprar em múltiplos.
              </p>
            </fieldset>
            <label className="block text-sm font-semibold text-muted">
              Imagem
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                className="mt-2 block w-full text-sm disabled:opacity-50"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                }}
              />
              {uploadingImage && (
                <span className="mt-1 block text-xs font-normal text-muted">
                  Comprimindo e enviando…
                </span>
              )}
              {uploadError && (
                <span className="mt-1 block text-xs font-normal text-accent">
                  {uploadError}
                </span>
              )}
              {form.imagem_url && !uploadingImage && (
                <span className="mt-1 block text-xs font-normal text-primary">
                  Imagem pronta para salvar
                </span>
              )}
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              disabled={
                pending || uploadingImage || !form.nome || !form.imagem_url
              }
              onClick={save}
            >
              Salvar
            </Button>
            <Button variant="ghost" onClick={reset}>Cancelar</Button>
          </div>
        </Card>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="Catálogo vazio"
          description="Cadastre produtos para a vitrine do encontro."
          icon={<ShoppingBag className="h-7 w-7" strokeWidth={1.75} />}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((p) => {
            const low = p.estoque <= LOW_STOCK;
            return (
              <li key={p.id}>
                <Card className="border border-border/80">
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background">
                      <div className="absolute inset-1">
                        <div className="relative h-full w-full">
                          <Image
                            src={p.imagem_url}
                            alt=""
                            fill
                            className="object-contain"
                            sizes="80px"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start gap-2">
                        <p className="font-bold text-foreground">{p.nome}</p>
                        <ProductKindBadge kind={p.tipo ?? "botton"} />
                        {low && <Badge variant="accent">Estoque baixo</Badge>}
                      </div>
                      <p className="text-sm text-muted">
                        {formatCurrency(Number(p.preco))}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {p.estoque} unidades
                      </p>
                      <StockBar estoque={p.estoque} />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => edit(p)}
                      className="min-h-10 flex-1 rounded-xl bg-primary-soft text-sm font-semibold text-primary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="min-h-10 rounded-xl px-4 text-sm font-semibold text-accent"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(p);
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {products.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={pages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remover produto?"
        description={
          deleteTarget
            ? `“${deleteTarget.nome}” será excluído do catálogo, junto com itens de pedido e pedidos que ficarem só com este produto. Essa ação não pode ser desfeita.`
            : ""
        }
        error={deleteError}
        pending={pending}
        onCancel={() => {
          if (pending) return;
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const result = await deleteProduct(deleteTarget.id);
            if (!result.success) {
              setDeleteError(result.error);
              return;
            }
            setDeleteTarget(null);
            setDeleteError(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
