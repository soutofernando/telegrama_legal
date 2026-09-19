import { CatalogExperience } from "@/components/vitrine/catalog-experience";
import { CATALOG_CATEGORIES, type CatalogCategoryId } from "@/lib/catalog-helpers";
import { getBestSellers } from "@/lib/data/best-sellers";
import {
  getProductMaxQuantities,
  getPublicProducts,
} from "@/lib/data/catalog";

export const revalidate = 60;

function parseCategory(cat?: string): CatalogCategoryId {
  if (cat === "lembrancas") return "prendas";
  if (cat === "telegramas") return "tirantes";
  if (cat === "especiais") return "all";
  if (cat && CATALOG_CATEGORIES.some((c) => c.id === cat)) {
    return cat as CatalogCategoryId;
  }
  return "all";
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const products = await getPublicProducts();

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">
        Nenhum produto cadastrado ainda.
      </div>
    );
  }

  const productIds = products.map((p) => p.id);
  const [maxQuantities, bestSellers] = await Promise.all([
    getProductMaxQuantities(productIds),
    getBestSellers(6),
  ]);

  return (
    <CatalogExperience
      products={products}
      initialCategory={parseCategory(cat)}
      maxQuantities={maxQuantities}
      bestSellers={bestSellers}
    />
  );
}
