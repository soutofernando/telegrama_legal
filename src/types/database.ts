export type PaymentMethod = "whatsapp" | "on_delivery" | "vendor_paid";
export type FulfillmentType = "delivery" | "pickup";
export type DeliveryStatus = "pending" | "in_progress" | "delivered";

export interface Team {
  id: string;
  nome: string;
  created_at?: string;
}

export interface AppSettings {
  whatsapp_number: string;
  whatsapp_message_template: string;
  pix_key: string;
  pix_merchant_name: string;
  pix_merchant_city: string;
  updated_at?: string;
}

export interface DeliverySlot {
  id: string;
  horario: string;
  sort_order: number;
  created_at?: string;
}

export type ProductKind =
  | "botton"
  | "serenata"
  | "prenda"
  | "adesivo"
  | "tirante";

export interface SerenataSong {
  id: string;
  titulo: string;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  preco_promocional: number | null;
  promo_combo_quantidade: number | null;
  promo_combo_preco: number | null;
  imagem_url: string;
  estoque: number;
  tipo: ProductKind;
  created_at?: string;
  updated_at?: string;
}

export interface PublicProduct {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  preco_promocional: number | null;
  promo_combo_quantidade: number | null;
  promo_combo_preco: number | null;
  imagem_url: string;
  tipo: ProductKind;
  disponivel: boolean;
}

export interface Order {
  id: string;
  nome_comprador: string;
  equipe_id: string;
  forma_pagamento: PaymentMethod;
  delivery_slot_id: string;
  fulfillment_type?: FulfillmentType;
  criado_em: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantidade: number;
  nome_recebedor: string;
  equipe_destino_id: string;
  delivery_slot_id: string;
  fulfillment_type?: FulfillmentType;
  eh_presente: boolean;
  serenata_song_id?: string | null;
  status: DeliveryStatus;
  entregador_nome?: string | null;
  valor_linha?: number | null;
  criado_em: string;
}

export interface OrderItemWithRelations extends OrderItem {
  teams?: { nome: string };
  delivery_slots?: { horario: string; sort_order?: number };
  products?: { nome: string; tipo?: ProductKind };
  serenata_songs?: { titulo: string } | null;
  orders?: Pick<Order, "nome_comprador" | "forma_pagamento">;
}

export interface CartLine {
  lineId: string;
  productId: string;
  tipo?: ProductKind;
  nome: string;
  preco: number;
  precoPromocional: number | null;
  promoComboQuantidade: number | null;
  promoComboPreco: number | null;
  imagem_url: string;
  quantidade: number;
  maxQuantity: number;
  serenataSongId?: string;
  serenataSongTitulo?: string;
}

export interface CheckoutPayload {
  nomeComprador: string;
  equipeId: string;
  deliverySlotId: string;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    quantidade: number;
    serenataSongId?: string;
    presente?: boolean;
    nomeRecebedor?: string;
    equipeDestinoId?: string;
  }[];
}

export type FeedbackType = "feedback" | "complaint" | "suggestion";
export type FeedbackStatus = "new" | "in_progress" | "resolved";

export interface CustomerFeedback {
  id: string;
  tipo: FeedbackType;
  nome: string;
  equipe_id: string | null;
  contato: string | null;
  assunto: string;
  mensagem: string;
  avaliacao: number | null;
  status: FeedbackStatus;
  nota_admin: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface CustomerFeedbackWithTeam extends CustomerFeedback {
  teams?: { nome: string } | null;
}

export interface SubmitFeedbackPayload {
  tipo: FeedbackType;
  nome: string;
  equipeId?: string;
  contato?: string;
  assunto: string;
  mensagem: string;
  avaliacao?: number;
}
