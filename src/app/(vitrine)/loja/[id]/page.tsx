import { notFound } from "next/navigation";
import {
  getProductMaxQuantity,
  getPublicProductById,
} from "@/lib/data/catalog";
import { getSerenataSongs } from "@/lib/data/serenata-songs";
import { CATALOG_REVALIDATE } from "@/lib/constants";
import { ProductDetailView } from "@/components/vitrine/product-detail-view";

export const revalidate = CATALOG_REVALIDATE;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProductById(id);
  if (!product) notFound();

  const maxQuantity = product.disponivel
    ? await getProductMaxQuantity(id)
    : 0;

  const serenataSongs =
    product.tipo === "serenata" ? await getSerenataSongs() : [];

  return (
    <ProductDetailView
      product={product}
      maxQuantity={maxQuantity}
      serenataSongs={serenataSongs}
    />
  );
}
