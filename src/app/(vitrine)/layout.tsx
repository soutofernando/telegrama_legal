import { CartProvider } from "@/context/cart-context";
import { CartAnimationProvider } from "@/context/cart-animation-context";
import { CatalogFiltersProvider } from "@/context/catalog-filters-context";
import { SmoothScroll } from "@/components/vitrine/smooth-scroll";
import { StoreBottomNav } from "@/components/vitrine/store-bottom-nav";
import { StoreHeader } from "@/components/vitrine/store-header";

export default function VitrineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <CartAnimationProvider>
        <CatalogFiltersProvider>
          <SmoothScroll />
          <div className="min-h-screen bg-background text-foreground">
            <StoreHeader />
            <main className="safe-bottom-nav md:pb-0">{children}</main>
            <StoreBottomNav />
          </div>
        </CatalogFiltersProvider>
      </CartAnimationProvider>
    </CartProvider>
  );
}
