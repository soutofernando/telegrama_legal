import { HomeExperience } from "@/components/vitrine/home-experience";
import {
  getProductMaxQuantities,
  getPublicProducts,
} from "@/lib/data/catalog";
import {
  pickFeaturedProduct,
  pickHighlightProducts,
} from "@/lib/catalog-helpers";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getPublicProducts();
  const featured = pickFeaturedProduct(products);
  const highlights = pickHighlightProducts(products, 6);
  const popular = pickHighlightProducts(products, 12).slice(6, 12);

  const quickAddIds = highlights.map((p) => p.id);
  const maxQuantities = quickAddIds.length
    ? await getProductMaxQuantities(quickAddIds)
    : {};

  return (
    <HomeExperience
      featured={featured}
      highlights={highlights}
      popular={popular}
      maxQuantities={maxQuantities}
    />
  );
}
