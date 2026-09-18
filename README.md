# Telegrama Legal

Sistema web para organizar venda e entrega de prendas durante o **ECRI** (Encontro de Crianças com Cristo) — Igreja Sagrado Coração de Jesus.

- **Vitrine pública**: catálogo, carrinho e checkout (sem login)
- **Admin**: equipes, horários, produtos/estoque, dashboard de itens e itinerário de entrega
- **Stack**: Next.js (App Router), TypeScript, Tailwind, Supabase, Vercel

## Requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com) e [Vercel](https://vercel.com)

## Configuração local

1. Clone o repositório e instale dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Preencha:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — **somente servidor** |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número com DDI (ex: `5511999999999`) |
| `NEXT_PUBLIC_SITE_NAME` | Nome exibido na vitrine (opcional) |
| `NEXT_PUBLIC_PICKUP_LOCATION` | Texto de retirada no checkout (opcional) |

3. Aplique a migration no Supabase:

- Painel Supabase → **SQL Editor** → cole o conteúdo de `supabase/migrations/20250918000000_initial.sql` e execute  
- Ou use a CLI: `supabase db push` (com projeto linkado)

4. (Opcional) Popule dados iniciais:

```sql
-- Execute supabase/seed.sql no SQL Editor
```

5. Crie um usuário admin:

- Supabase → **Authentication** → **Users** → **Add user** (e-mail + senha)  
- Qualquer usuário autenticado acessa `/admin` (modelo simples para equipe organizadora)

6. Rode o app:

```bash
npm run dev
```

- Vitrine: [http://localhost:3000](http://localhost:3000)  
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Deploy (Vercel + Supabase)

### Supabase

1. Crie o projeto e rode a migration.
2. Em **Settings → API**, copie URL, anon key e service role key.
3. Em **Database → Connection pooling**, use o pooler **Transaction** (porta **6543**) se for conectar ferramentas externas — o app Next.js usa a API HTTP do Supabase, não conexão direta Postgres.
4. Confirme o bucket `products` (público) e políticas de storage da migration.
5. Em **Database → Replication**, confirme que `order_items` está na publicação `supabase_realtime` (a migration já adiciona).

### Vercel

1. Instale a CLI (opcional): `npm i -g vercel`
2. Na raiz do projeto: `vercel login` e depois `vercel` (preview) ou `vercel --prod` (produção).
3. Ou importe o repositório em [vercel.com/new](https://vercel.com/new) — o preset **Next.js** é detectado automaticamente (`vercel.json` define região **gru1** para functions).
4. Em **Project → Settings → Environment Variables**, configure para **Production** e **Preview**:

| Variável | Sensitive |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Não |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Não |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sim** |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Não |
| `NEXT_PUBLIC_SITE_NAME` | Não |
| `NEXT_PUBLIC_PICKUP_LOCATION` | Não |

5. No Supabase → **Authentication → URL Configuration**, adicione:
   - **Site URL**: `https://seu-dominio.vercel.app`
   - **Redirect URLs**: `https://seu-dominio.vercel.app/**` e `http://localhost:3000/**`

6. Rode um deploy de teste e abra `/`, `/loja` e `/admin/login`.

Após alterar produtos no admin, o cache ISR é revalidado via `revalidatePath` nas Server Actions.

## Arquitetura resumida

| Área | Comportamento |
|------|----------------|
| Catálogo `/loja` | ISR (`revalidate` 60s) + view `public_products` (sem estoque) |
| Checkout | Server Action `placeOrderAction` → RPC `place_order` (transação atômica) |
| Admin / itinerário | Supabase Realtime em `order_items` |
| Vitrine | Sem Realtime; carrinho em `localStorage` |

### Estoque atômico

A função `place_order` no Postgres:

1. Cria o pedido
2. Para cada item: `UPDATE products SET estoque = estoque - qtd WHERE estoque >= qtd`
3. Se algum update afetar 0 linhas → rollback com erro *Estoque insuficiente*

Não exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente.

## Estrutura de pastas

```
src/app/(vitrine)/     # Loja pública
src/app/admin/         # Painel autenticado
src/app/actions/       # Server Actions
supabase/migrations/   # Schema + RPC
```

## Antes do evento (checklist)

1. Cadastrar todas as **equipes** e **horários** reais
2. Subir **produtos** com fotos (admin → Produtos) e estoque correto
3. Testar um pedido completo na vitrine e conferir no **Itinerário**
4. Validar link WhatsApp com `NEXT_PUBLIC_WHATSAPP_NUMBER`
5. Criar/contar contas admin da equipe (~40 pessoas, 2 dias de pico)

## Licença

Uso interno da organização do ECRI.
