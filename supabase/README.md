# Backend Supabase — Finesse Silver

## Fonte do backend

A migration em `supabase/migrations/20260918000100_initial_backend.sql` é a fonte reproduzível da estrutura inicial do banco. Ela cria:

- autenticação complementar em `public.profiles`;
- clientes;
- produtos e categorias;
- pedidos manuais;
- baixa de estoque por peça quando o pedido é marcado como `sold`;
- pagamentos parciais ou totais de pedidos;
- contas e movimentações financeiras;
- acordos de cobrança e parcelas;
- pagamentos parciais ou totais de parcelas;
- fila de conteúdo para Instagram;
- RLS para usuários autenticados;
- funções transacionais para vender pedido e registrar pagamentos.

## Aplicação inicial

Enquanto o Supabase CLI não estiver configurado na máquina, a migration pode ser aplicada pelo SQL Editor do projeto Supabase:

1. Abrir o projeto `rswbuqkwdwttylppnhcw`.
2. Abrir **SQL Editor**.
3. Criar uma nova query.
4. Colar o conteúdo da migration.
5. Executar e verificar se não houve erro.
6. Executar o conteúdo de `supabase/seed.sql` em uma segunda query.

Em seguida, criar o primeiro usuário em **Authentication**. O trigger criará o perfil com papel `operator`. Para transformar o primeiro usuário em administrador, executar no SQL Editor, substituindo o e-mail:

```sql
update public.profiles
set role = 'admin'
where email = 'seu-email@exemplo.com';
```

## Funções de negócio

As operações sensíveis devem usar as funções do banco:

- `public.mark_order_sold(order_id)` — valida estoque e cria as saídas por peça;
- `public.record_order_payment(...)` — registra pagamento parcial ou total e cria a entrada financeira;
- `public.record_installment_payment(...)` — registra pagamento parcial ou total de uma parcela e cria a entrada financeira.

Isso mantém as regras de negócio no backend e evita que cada tela implemente uma versão diferente do mesmo fluxo.

## Segurança

- O frontend usará apenas a URL do projeto e a chave publicável/anon.
- A `service_role` nunca deve ser colocada no frontend, no GitHub ou em arquivos `.env` enviados ao repositório.
- O RLS está habilitado nas tabelas públicas.
- Exclusões físicas não fazem parte do fluxo inicial; correções devem usar status, estorno ou ajuste.
