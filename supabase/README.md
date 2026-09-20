# Backend Supabase — Finesse Silver

## Fonte do backend

A migration em `supabase/migrations/20260918000100_initial_backend.sql` é a fonte reproduzível da estrutura inicial do banco. Ela cria:

- perfis de acesso em `public.perfis`;
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

Depois aplicar `supabase/migrations/20260918000200_security.sql`. A regra exige dois masters pré-autorizados. Usar `supabase/operations/provision-masters.sql` para reservar os dois e-mails no schema privado, nunca no GitHub. Criar as contas pelo fluxo administrativo de convite e confirmar o e-mail antes do acesso. Alterar somente `perfis.role` não concede acesso. O procedimento antigo de promover um usuário comum foi substituído.

Depois aplicar `supabase/migrations/20260918000300_mvp_operations.sql`. Essa migration adiciona o registro de contato de parcelas, a entrada financeira manual segura e o bucket privado `product-images`, com políticas subordinadas ao gate de master. O bucket não é público; as imagens são lidas pelo frontend por URL assinada.
Por fim, aplicar `supabase/migrations/20260919000400_remove_mfa_requirement.sql` para remover a exigência de AAL2/MFA do acesso operacional. A lista de masters, o perfil ativo, o e-mail confirmado e a sessão válida continuam obrigatórios.
Depois, aplicar `supabase/migrations/20260919000500_portuguese_table_names.sql`. Ela renomeia as tabelas de negócio para português, preserva os dados e atualiza as funções, views e auditoria. As principais tabelas são `clientes`, `produtos`, `pedidos`, `itens_pedidos`, `contas_financeiras`, `transacoes_financeiras`, `acordos_recebiveis` e `parcelas_recebiveis`.
Somente depois de todas as migrations, executar `supabase/seed.sql` para inserir categorias, contas financeiras e configurações padrão.

## Estado remoto validado

Em 19/09/2026, o projeto remoto `finesse-silver` está com as 19 tabelas de negócio em português, 13 tipos, 2 views renomeadas e RLS ativo. A migration `20260919000500_portuguese_table_names` foi aplicada e registrada no histórico. O fluxo transacional remoto de estoque, pedido, pagamento e parcelamento foi aprovado com rollback, sem deixar dados de teste.

## Funções de negócio

As operações sensíveis devem usar as funções do banco:

- `public.mark_order_sold(order_id)` — valida estoque e cria as saídas por peça;
- `public.record_order_payment(...)` — registra pagamento parcial ou total e cria a entrada financeira;
- `public.record_installment_payment(...)` — registra pagamento parcial ou total de uma parcela e cria a entrada financeira.

Isso mantém as regras de negócio no backend e evita que cada tela implemente uma versão diferente do mesmo fluxo.

Após a migration de segurança, pagamentos exigem também `p_request_id` (UUID estável por operação/retry). Escrita direta nas tabelas de pagamentos e financeiro é proibida. Ajustes usam `adjust_stock` e despesas usam `record_expense`. Executar `npm ci --ignore-scripts` e `npm test` para testes PostgreSQL locais. Ver a seção 18 da documentação central para evidências, configuração Auth, recuperação e pendências de publicação.

No projeto remoto, os dois slots privados de master estão reservados, habilitados e vinculados aos usuários Auth criados pelos convites enviados pelo painel. O cadastro público permanece desativado. Cada titular precisa confirmar o próprio e-mail e definir a senha; depois, executar novamente `supabase/operations/security-check.sql` e testar o login.

## Segurança

- O frontend usará apenas a URL do projeto e a chave publicável/anon.
- A `service_role` nunca deve ser colocada no frontend, no GitHub ou em arquivos `.env` enviados ao repositório.
- O RLS está habilitado nas tabelas públicas.
- Exclusões físicas não fazem parte do fluxo inicial; correções devem usar status, estorno ou ajuste.
- O frontend usa as RPCs `record_income`, `record_expense`, `mark_installment_contacted`, `mark_order_sold`, `record_order_payment`, `record_installment_payment` e `adjust_stock` para operações sensíveis.
- O upload de imagens usa somente o bucket privado `product-images`; não colocar `service_role` no navegador.
