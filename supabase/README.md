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

Depois aplicar `supabase/migrations/20260918000200_security.sql`. A regra atual exige dois masters pré-autorizados e MFA. Usar `supabase/operations/provision-masters.sql` para reservar os dois e-mails no schema privado, nunca no GitHub. Criar as contas pelo fluxo administrativo de convite, confirmar o e-mail e cadastrar/verificar TOTP antes do acesso. Alterar somente `profiles.role` não concede acesso. O procedimento antigo de promover um usuário comum foi substituído.

## Estado remoto validado

Em 18/09/2026, o projeto remoto `finesse-silver` já continha o schema correspondente à base inicial. A tentativa de reaplicar a migration foi interrompida pelo próprio banco porque o tipo `public.app_role` já existia; nenhum dado foi apagado. O diagnóstico confirmou 19 tabelas, 13 tipos, 4 funções, 2 views e RLS nas 19 tabelas. O seed foi executado com sucesso e os testes transacionais de parcelas, total do pedido e rollback foram aprovados.

## Funções de negócio

As operações sensíveis devem usar as funções do banco:

- `public.mark_order_sold(order_id)` — valida estoque e cria as saídas por peça;
- `public.record_order_payment(...)` — registra pagamento parcial ou total e cria a entrada financeira;
- `public.record_installment_payment(...)` — registra pagamento parcial ou total de uma parcela e cria a entrada financeira.

Isso mantém as regras de negócio no backend e evita que cada tela implemente uma versão diferente do mesmo fluxo.

Após a migration de segurança, pagamentos exigem também `p_request_id` (UUID estável por operação/retry). Escrita direta nas tabelas de pagamentos e financeiro é proibida. Ajustes usam `adjust_stock` e despesas usam `record_expense`. Executar `npm ci --ignore-scripts` e `npm test` para testes PostgreSQL locais. Ver a seção 18 da documentação central para evidências, configuração Auth, recuperação e pendências de publicação.

No projeto remoto, os dois slots privados de master estão reservados, habilitados e vinculados aos usuários Auth criados pelos convites enviados pelo painel. O cadastro público permanece desativado. Cada titular ainda precisa confirmar o próprio e-mail, definir a senha e cadastrar TOTP; depois, executar novamente `supabase/operations/security-check.sql` e testar o login AAL2.

## Segurança

- O frontend usará apenas a URL do projeto e a chave publicável/anon.
- A `service_role` nunca deve ser colocada no frontend, no GitHub ou em arquivos `.env` enviados ao repositório.
- O RLS está habilitado nas tabelas públicas.
- Exclusões físicas não fazem parte do fluxo inicial; correções devem usar status, estorno ou ajuste.
