import { OrderSuccess } from "@/components/vitrine/order-success";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <OrderSuccess orderId={id} />;
}
