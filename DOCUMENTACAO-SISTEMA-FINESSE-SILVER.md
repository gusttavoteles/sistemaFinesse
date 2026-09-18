# Documentação do Sistema — Finesse Silver

> Documento de produto, arquitetura, banco de dados e regras de negócio para um sistema simples de apoio ao controle financeiro de uma loja online de acessórios em prata 925.

> **Revisão 02 — 18/09/2026:** a loja foi definida como exclusivamente online. Foram removidos do escopo a abertura e o fechamento de caixa, o caixa por turno, o leitor de códigos e o fluxo de balcão/PDV. Toda alteração futura de escopo deve ser registrada neste arquivo antes de alterar a implementação.

> **Revisão 03 — 18/09/2026:** incluído o módulo de cobrança parcelada de clientes, com parcelas, vencimentos, contador de dias e mensagem pronta para copiar ou abrir no WhatsApp. Incluído também o planejamento de conteúdo para Instagram. O envio automático pelo WhatsApp e a publicação automática no Instagram ficam condicionados às APIs e regras da Meta.

> **Revisão 04 — 18/09/2026:** infraestrutura inicial informada pelo proprietário: projeto Supabase `rswbuqkwdwttylppnhcw` e repositório GitHub `gusttavoteles/sistemaFinesse`. A inspeção encontrou um protótipo antigo de conteúdo em `index.html`, um `README.md` e quatro commits. A limpeza do repositório ainda não foi executada porque é necessário definir se o histórico será preservado.

> **Revisão 05 — 18/09/2026:** definida a ordem de implementação: começar pela fundação do backend no Supabase e construir em seguida a primeira funcionalidade completa de cobrança parcelada, incluindo sua interface. O dashboard e as integrações externas serão construídos depois que existirem dados reais para exibir.

> **Revisão 06 — 18/09/2026:** decisões confirmadas pelo proprietário: estoque controlado por peça; pedidos cadastrados manualmente; baixa do estoque quando o pedido for marcado como vendido; pagamentos lançados no financeiro quando informados como recebidos, podendo ser parciais ou totais; vencimento definido pelo dia escolhido para pagamento; WhatsApp manual no MVP.

> **Revisão 07 — 18/09/2026:** criada a primeira base real do backend em `supabase/migrations/20260918000100_initial_backend.sql`, com tabelas, relacionamentos, funções de negócio, views e RLS. Também foram criados `supabase/seed.sql`, `supabase/README.md` e `.env.example`. A migration ainda precisa ser aplicada no projeto Supabase pelo SQL Editor ou CLI.

## 1. Visão do produto

O Finesse Silver será um sistema web interno para auxiliar o controle da loja online: pedidos, produtos, estoque, entradas e saídas financeiras, bancos, despesas, clientes e relatórios.

O foco inicial não é substituir a plataforma da loja online. O sistema deve registrar ou importar os pedidos realizados na loja e dar à proprietária uma visão confiável de:

- o que foi vendido;
- quanto existe em estoque;
- quanto entrou e saiu financeiramente;
- quanto está disponível nos bancos;
- quais produtos precisam ser repostos;
- quais resultados a loja está gerando;
- quais pedidos estão pendentes, pagos, enviados ou cancelados.

### 1.1 Usuários principais

| Perfil | Necessidades | Acesso inicial |
| --- | --- | --- |
| Administrador | Configurar o sistema, acompanhar resultados e corrigir cadastros | Completo |
| Gerente | Acompanhar pedidos, estoque, financeiro e relatórios | Quase completo |
| Operador(a) | Registrar pedidos, clientes e movimentações autorizadas | Pedidos, clientes e consulta de estoque |
| Financeiro | Controlar entradas, saídas, bancos e despesas | Financeiro e relatórios |

### 1.2 Princípios do sistema

1. Toda venda precisa refletir no estoque e no financeiro.
2. Movimentações financeiras e de estoque não devem ser apagadas; devem ser estornadas ou canceladas com histórico.
3. O sistema deve separar pedido, pagamento e movimentação financeira.
4. O acesso deve ser controlado por usuário e permissão.
5. O MVP deve ser simples o bastante para ser usado diariamente no acompanhamento da loja online.

## 2. Escopo recomendado

### 2.1 MVP — primeira versão

O MVP deve conter:

- autenticação de usuários;
- dashboard operacional;
- cadastro de produtos e categorias;
- controle de estoque por movimentações;
- registro e acompanhamento de pedidos online;
- cadastro de cobranças parceladas de clientes;
- geração de parcelas e acompanhamento de vencimentos;
- mensagem pronta para copiar ou abrir no WhatsApp;
- formas de pagamento;
- lançamentos simples de entradas e saídas financeiras;
- cadastro de clientes e fornecedores;
- contas a pagar e contas a receber básicas;
- contas bancárias;
- relatórios essenciais;
- histórico de alterações importantes.

### 2.2 Segunda etapa

Depois do MVP, podem entrar:

- integração ou importação de pedidos da plataforma da loja;
- devoluções e trocas mais completas;
- controle de comissão de vendedores;
- cadastro de kits e combos;
- importação de produtos por planilha;
- anexos de notas fiscais e comprovantes;
- conciliação bancária;
- integração com gateway de pagamento, Pix ou marketplace;
- seleção de produtos para conteúdo do Instagram;
- calendário semanal de conteúdo;
- publicação automática no Instagram, caso a conta e as permissões da Meta sejam aprovadas;
- programa de fidelidade;
- alertas por e-mail ou WhatsApp.

### 2.3 O que não colocar no começo

Para reduzir risco, não começar com emissão fiscal, integração bancária automática, envio automático pelo WhatsApp ou integração profunda com a plataforma da loja. No MVP, os pedidos podem ser cadastrados manualmente ou por importação simples. A integração automática entra somente depois que o fluxo financeiro estiver validado.

## 3. Estrutura de navegação

### 3.1 Menu principal

1. **Dashboard**
2. **Pedidos**
3. **Cobranças**
4. **Controle financeiro**
5. **Estoque**
6. **Produtos**
7. **Clientes**
8. **Fornecedores**
9. **Conteúdo Instagram**
10. **Relatórios**
11. **Configurações**
12. **Auditoria** — visível apenas para administrador.

### 3.2 Dashboard

O dashboard deve responder rapidamente às perguntas mais importantes do dia:

- Qual foi o faturamento hoje e no período selecionado?
- Quantas vendas foram realizadas?
- Qual é o ticket médio?
- Qual é o valor líquido depois de descontos e devoluções?
- Qual foi o total recebido e o total ainda pendente?
- Quais parcelas vencem nos próximos dias?
- Quais clientes estão em atraso?
- Existem produtos abaixo do estoque mínimo?
- Quais foram os produtos mais vendidos?
- Quais contas vencem nos próximos dias?
- Qual é o saldo registrado nas contas bancárias?

Cards recomendados:

- vendas do dia;
- vendas do mês;
- ticket médio;
- entradas e saídas do período;
- estoque baixo;
- contas a pagar próximas do vencimento;
- parcelas de clientes próximas do vencimento;
- parcelas em atraso.

Gráficos recomendados:

- vendas por dia;
- vendas por forma de pagamento;
- produtos mais vendidos;
- entradas e saídas financeiras.

### 3.3 Pedidos online

Fluxo principal:

1. Registrar ou importar o pedido realizado na loja online.
2. Selecionar ou cadastrar o cliente.
3. Registrar os itens, valores, frete e desconto.
4. Informar a forma e o status do pagamento.
5. Atualizar o status do pedido: pendente, pago, enviado, concluído ou cancelado.
6. Gerar a movimentação de estoque quando o pedido for confirmado.
7. Gerar ou vincular a movimentação financeira correspondente.

Dados exibidos no pedido:

- foto do produto;
- nome e variação;
- SKU;
- preço e quantidade;
- subtotal, frete, desconto e total;
- status do pedido e do pagamento;
- origem do pedido.

Formas de pagamento iniciais:

- dinheiro;
- Pix;
- cartão de débito;
- cartão de crédito;
- transferência;
- pagamento pendente, quando a operação permitir.

### 3.4 Controle financeiro

O controle financeiro deve permitir:

- visualizar entradas e saídas por período;
- registrar uma entrada manual;
- registrar uma saída manual;
- vincular o lançamento a uma categoria;
- vincular o lançamento a um pedido, conta ou banco;
- consultar o saldo financeiro por conta;
- filtrar por status, data, categoria e forma de pagamento.

Não haverá abertura ou fechamento de caixa. O sistema terá um livro de movimentações financeiras contínuo, adequado para uma operação online.

### 3.5 Cobranças e parcelas

O módulo de cobranças deve permitir cadastrar um acordo de pagamento de um cliente com:

- nome do cliente;
- telefone;
- valor total devido;
- quantidade de parcelas;
- valor de cada parcela;
- data da primeira parcela;
- dia padrão de vencimento;
- periodicidade, inicialmente mensal;
- observações;
- status do acordo.

O sistema deve gerar as parcelas automaticamente e mostrar:

- número da parcela;
- data de vencimento;
- valor;
- status: pendente, paga, atrasada ou cancelada;
- quantos dias faltam para vencer;
- quantos dias está atrasada, quando aplicável.

Cada parcela deve ter as ações:

- copiar mensagem de cobrança;
- abrir o WhatsApp com a mensagem preenchida;
- marcar como contatada;
- registrar pagamento;
- alterar vencimento somente com permissão e motivo.

Mensagem padrão sugerida:

```text
Olá, {nome_cliente}! Tudo bem?

Passando para lembrar que a parcela {numero_parcela}/{total_parcelas}, no valor de {valor_parcela}, vence em {data_vencimento}.

Se já realizou o pagamento, por favor desconsidere esta mensagem. Obrigada!
```

No MVP, a mensagem será gerada e copiada pelo sistema para ser enviada manualmente no WhatsApp. O envio automático via API será tratado como integração futura e poderá gerar cobrança da Meta.

### 3.6 Estoque e produtos

Cada produto deve poder conter:

- nome comercial;
- SKU interno;
- categoria;
- fornecedor principal;
- descrição;
- fotos;
- material: prata 925, banho, aço, pedra etc.;
- peso aproximado em gramas, quando aplicável;
- tamanho ou variação;
- custo de aquisição;
- preço de venda;
- preço promocional;
- estoque atual;
- estoque mínimo;
- localização física;
- status ativo/inativo;
- instruções de cuidado;
- garantia ou política relacionada ao produto.

Categorias possíveis:

- anéis;
- brincos;
- colares;
- correntes;
- pulseiras;
- pingentes;
- tornozeleiras;
- piercings;
- acessórios e embalagens;
- kits.

O estoque deve ser calculado por um histórico de movimentações. Exemplos:

- entrada de compra;
- ajuste positivo;
- ajuste negativo;
- venda;
- devolução de cliente;
- troca;
- perda ou avaria;
- transferência futura entre lojas.

### 3.7 Financeiro e bancos

O financeiro deve separar três conceitos:

1. **Pedido:** o fato comercial que aconteceu.
2. **Pagamento:** como a venda foi paga.
3. **Movimentação financeira:** quando o valor entrou ou saiu de uma conta bancária ou carteira.

Isso evita misturar faturamento com saldo disponível.

Recursos iniciais:

- contas a pagar;
- contas a receber;
- despesas recorrentes;
- categorias financeiras;
- contas bancárias;
- transferências entre contas;
- lançamentos manuais;
- status pendente, pago, vencido ou cancelado;
- anexos de comprovantes em uma etapa posterior.

Contas bancárias podem representar:

- conta corrente;
- conta digital;
- carteira de dinheiro;
- conta de recebimento de cartão;
- conta de recebimento de marketplace.

### 3.8 Clientes e fornecedores

Cliente:

- nome;
- telefone;
- e-mail;
- CPF, se necessário e de acordo com a política de privacidade;
- data de nascimento opcional;
- observações;
- histórico de compras;
- consentimento para comunicações, se houver marketing.

Fornecedor:

- razão social ou nome;
- documento;
- contato;
- telefone e e-mail;
- endereço;
- prazo médio de entrega;
- observações;
- histórico de compras.

### 3.9 Conteúdo Instagram

O sistema poderá selecionar produtos para sugerir conteúdo com base em regras como:

- produto ativo;
- estoque disponível;
- produto sem publicação recente;
- lançamento recente;
- categoria em destaque;
- maior margem ou maior prioridade comercial.

Cada conteúdo poderá conter:

- produto escolhido;
- imagem;
- legenda;
- hashtags;
- data e hora planejadas;
- status: sugestão, aprovado, agendado, publicado ou erro;
- usuário que aprovou.

O calendário semanal deve permitir revisar, aprovar, editar e reordenar as sugestões antes da publicação. A publicação automática dependerá de uma conta Instagram profissional, permissões da Meta e um serviço agendador.

### 3.10 Relatórios

Relatórios do MVP:

- vendas por período;
- vendas por produto;
- vendas por categoria;
- vendas por forma de pagamento;
- margem estimada;
- produtos sem giro;
- estoque atual e estoque baixo;
- movimentações de estoque;
- contas pagas e pendentes;
- fluxo de entradas e saídas.

## 4. Banco de dados recomendado

### 4.1 Escolha: Supabase

Supabase é uma boa escolha para este projeto porque oferece:

- PostgreSQL como banco relacional;
- autenticação;
- políticas de segurança por linha (RLS);
- armazenamento de imagens de produtos;
- funções server-side quando necessário;
- APIs geradas automaticamente;
- painel administrativo;
- possibilidade de usar tempo real em partes do sistema.

Para a primeira versão, usar Supabase diretamente no frontend é aceitável desde que as políticas RLS estejam configuradas corretamente. A chave pública `anon` pode ficar no frontend; a chave `service_role` nunca deve ser enviada ao navegador.

### 4.1.1 O plano gratuito é suficiente?

Sim. Para o MVP e para uma loja online de pequeno porte, o plano Free é suficiente para começar. Os limites atuais informados pelo Supabase incluem, por projeto:

- 500 MB de banco de dados;
- 1 GB de armazenamento de arquivos;
- 5 GB de transferência não cacheada e 5 GB cacheada;
- 50.000 usuários ativos mensais;
- 500.000 chamadas de Edge Functions;
- 2 milhões de mensagens Realtime;
- até 2 projetos ativos na organização gratuita.

O limite mais relevante para este sistema será o banco de 500 MB e o armazenamento de imagens. Como pedidos, produtos e lançamentos financeiros são dados pequenos, o banco deve comportar bastante tempo de operação. As fotos dos produtos devem ser comprimidas e redimensionadas para não consumir o 1 GB rapidamente.

O projeto gratuito pode ser pausado depois de uma semana de inatividade. O plano Free também não inclui backup automático, então a rotina deve prever exportações periódicas do banco antes de usar dados importantes em produção. Os limites podem mudar; conferir a página oficial de preços antes de contratar ou publicar em escala.

Para a cobrança manual, o plano gratuito é suficiente: o sistema apenas calcula parcelas e monta a mensagem. Para o Instagram, o plano gratuito também deve suportar um calendário semanal de baixo volume, usando Storage para imagens, uma Edge Function ou uma rotina externa para executar os horários e a API oficial da Meta para publicar. A publicação automática não é garantida apenas por estar no Supabase: depende da aprovação da conta, permissões, tokens e limitações da API do Instagram.

Para envio automático de cobrança pelo WhatsApp, o Supabase pode armazenar clientes, parcelas, modelos e histórico, mas não torna o envio gratuito. A WhatsApp Business Platform cobra por mensagem entregue conforme categoria e país. Por isso, o MVP usará copiar/abrir WhatsApp; a API oficial será uma etapa opcional com custo variável.

### 4.1.2 Integrações externas e custos

#### WhatsApp

O MVP não enviará mensagens automaticamente. Ele criará a mensagem personalizada, permitirá copiar o texto e poderá abrir uma conversa do WhatsApp com o número e o texto preenchido.

Envio automático real deve usar a WhatsApp Business Platform oficial. A Meta informa que a cobrança ocorre por mensagem entregue e varia conforme categoria e país. Portanto, não considerar essa integração como gratuita. Não usar automação de navegador ou WhatsApp Web não oficial.

Referência: [WhatsApp Business Platform — preços oficiais](https://whatsappbusiness.com/products/platform-pricing/).

#### Instagram

O sistema poderá selecionar produtos por regras simples, como estoque disponível, produto novo, categoria em destaque e tempo desde a última publicação. Essa seleção não exige inteligência artificial e pode ser feita gratuitamente dentro do sistema.

Para publicar automaticamente, a conta precisa ser profissional — Business ou Creator — e a aplicação precisa ter permissões, tokens e configuração da Meta. A API oficial permite publicar conteúdo de contas profissionais, mas a disponibilidade depende do tipo de conteúdo e das permissões aprovadas.

Referência: [coleção oficial da API do Instagram da Meta](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api).

O sistema deve manter uma fila de conteúdo com aprovação humana antes da publicação. A rotina semanal pode ser executada por uma função agendada ou por um serviço externo, respeitando os limites do plano e da API.

### 4.2 Hospedagem inicial

O código pode ficar em um repositório GitHub e o frontend pode ser publicado como site estático. Porém, o GitHub não será o banco de dados nem o backend: o Supabase continuará responsável pelos dados, autenticação e arquivos.

Recomendação prática:

- repositório: GitHub;
- frontend inicial: GitHub Pages, se a necessidade for somente publicar uma aplicação estática;
- backend e banco: Supabase;
- hospedagem mais confortável para produção: Cloudflare Pages, Vercel ou Netlify;
- domínio próprio: conectar depois ao provedor de frontend escolhido.

GitHub Pages pode exigir configuração adicional para rotas de SPA e variáveis de ambiente. Por isso, ele é adequado para protótipo e primeira publicação, mas não precisa ser a hospedagem definitiva.

### 4.3 Stack sugerida

- React;
- TypeScript;
- Vite;
- Tailwind CSS;
- componentes acessíveis reutilizáveis;
- Supabase JavaScript Client;
- PostgreSQL via Supabase;
- GitHub Actions para build e publicação;
- gráficos leves para o dashboard;
- armazenamento de imagens no Supabase Storage.

A aplicação deve ser responsiva, com foco em desktop/tablet para a rotina administrativa e bom uso no celular para consultas e lançamentos rápidos.

## 5. Modelo de dados inicial

Todas as tabelas operacionais devem ter, quando aplicável, `id`, `created_at`, `updated_at`, `created_by`, `updated_by` e `organization_id` ou `store_id`. Mesmo que inicialmente exista uma única loja, manter esse campo facilita crescimento futuro.

### 5.1 Identidade e acesso

#### `profiles`

- `id` — referência ao usuário autenticado;
- `full_name`;
- `email`;
- `role` — admin, manager, operator ou finance;
- `active`;
- `created_at`.

#### `permissions` e `role_permissions` — etapa posterior

Podem ser adicionadas quando houver necessidade de permissões mais detalhadas que os quatro perfis iniciais.

### 5.2 Catálogo

#### `categories`

- `id`;
- `name`;
- `description`;
- `active`.

#### `suppliers`

- `id`;
- `name`;
- `document`;
- `email`;
- `phone`;
- `address`;
- `notes`;
- `active`.

#### `products`

- `id`;
- `name`;
- `sku` opcional ou obrigatório conforme a política da loja;
- `category_id`;
- `supplier_id`;
- `description`;
- `material`;
- `purity` — por exemplo, 925;
- `weight_grams`;
- `cost_price`;
- `sale_price`;
- `promotional_price`;
- `minimum_stock`;
- `active`;
- `care_instructions`.

#### `product_images`

- `id`;
- `product_id`;
- `storage_path`;
- `sort_order`;
- `is_cover`.

Se houver tamanhos ou modelos diferentes com preço/estoque próprio, criar `product_variants` em vez de guardar tudo em texto no produto.

### 5.3 Estoque

#### `inventory_movements`

- `id`;
- `product_id` ou `variant_id`;
- `type` — purchase, sale, return, adjustment_in, adjustment_out, loss;
- `quantity` — quantidade inteira de peças;
- `unit_cost`;
- `reference_type`;
- `reference_id`;
- `notes`;
- `created_by`;
- `created_at`.

O estoque será controlado exclusivamente por quantidade de peças. O peso em gramas pode ser armazenado como informação do produto, mas não será usado para calcular o saldo. O estoque atual será calculado pela soma das entradas menos as saídas.

### 5.4 Pedidos

#### `orders`

- `id`;
- `order_number` legível;
- `source` — online_store, manual ou marketplace;
- `customer_id` opcional;
- `created_by`;
- `status` — pending, sold, shipped, completed, canceled, partially_returned, returned;
- `payment_status` — pending, paid, partially_paid, refunded;
- `subtotal`;
- `shipping_amount`;
- `discount_amount`;
- `total_amount`;
- `notes`;
- `paid_at`;
- `shipped_at`;
- `completed_at`.

#### `order_items`

- `id`;
- `order_id`;
- `product_id`;
- `product_name_snapshot`;
- `sku_snapshot`;
- `quantity` — quantidade inteira de peças;
- `unit_price`;
- `unit_cost_snapshot`;
- `discount_amount`;
- `total_amount`.

Guardar snapshots do nome, SKU e custo é importante para que relatórios históricos não mudem quando um produto for editado.

#### `order_payments`

- `id`;
- `order_id`;
- `payment_method`;
- `amount`;
- `installments`;
- `paid_at`;
- `financial_account_id`;
- `status`.

### 5.5 Controle financeiro e bancos

Não haverá tabelas de `cash_registers` ou `cash_sessions`. Como a loja é online, o controle será feito por um livro financeiro contínuo.

#### `financial_accounts`

- `id`;
- `name`;
- `type` — cash, bank, digital_wallet, card_receivable;
- `institution`;
- `initial_balance`;
- `active`.

#### `financial_categories`

- `id`;
- `name`;
- `type` — income ou expense;
- `parent_id` opcional;
- `active`.

#### `financial_transactions`

- `id`;
- `financial_account_id`;
- `category_id`;
- `type` — income ou expense;
- `direction` — in ou out;
- `status` — pending, paid, overdue, canceled;
- `amount`;
- `transaction_date`;
- `due_date`;
- `paid_at`;
- `description`;
- `reference_type`;
- `reference_id`;
- `created_by`.

Transferências entre contas devem gerar duas movimentações relacionadas: uma saída na origem e uma entrada no destino.

### 5.6 Cobranças e parcelas

#### `receivable_agreements`

- `id`;
- `customer_id`;
- `total_amount`;
- `installment_count`;
- `installment_amount`;
- `frequency` — inicialmente monthly;
- `first_due_date`;
- `due_day`;
- `status` — active, completed, canceled;
- `notes`;
- `created_by`.

#### `receivable_installments`

- `id`;
- `agreement_id`;
- `installment_number`;
- `due_date`;
- `amount`;
- `status` — pending, paid, overdue, canceled;
- `paid_at`;
- `financial_transaction_id` opcional;
- `last_contacted_at` opcional;
- `notes`.

O número de dias até o vencimento deve ser calculado pela data atual e não armazenado como valor fixo. Assim, o contador permanece correto sem precisar atualizar todos os registros diariamente.

### 5.7 Conteúdo Instagram

#### `content_posts`

- `id`;
- `product_id`;
- `image_path`;
- `caption`;
- `hashtags`;
- `scheduled_for`;
- `status` — suggestion, approved, scheduled, published, failed;
- `approved_by`;
- `published_at`;
- `external_post_id` opcional;
- `error_message` opcional.

### 5.8 Clientes, auditoria e configurações

#### `customers`

- `id`;
- `name`;
- `phone`;
- `email`;
- `document`;
- `birth_date` opcional;
- `marketing_consent`;
- `whatsapp_opt_in` — necessário caso o envio automático seja implementado;
- `notes`;
- `active`.

#### `audit_logs`

- `id`;
- `user_id`;
- `action`;
- `entity_type`;
- `entity_id`;
- `old_data` JSONB;
- `new_data` JSONB;
- `created_at`.

#### `store_settings`

- `store_name`;
- `logo_path`;
- `currency`;
- `timezone`;
- `default_minimum_stock`;
- `allow_negative_stock`;
- `allow_sale_without_customer`;
- `updated_by`.

## 6. Regras de negócio

### 6.1 Produtos e estoque

1. Quando informado, o SKU deve ser único.
2. Produto inativo não pode ser incluído em novo pedido.
3. Toda entrada ou saída gera um registro em `inventory_movements`.
4. Pedido marcado como `sold` reduz o estoque em peças; pedido cancelado antes desse status não altera o estoque.
5. Uma devolução gera uma movimentação de entrada vinculada ao pedido original.
6. Ajuste manual exige motivo e registra o usuário responsável.
7. Pedido abaixo do estoque disponível deve ser bloqueado por padrão.
8. A permissão para estoque negativo, se necessária, deve ser uma configuração explícita.
9. Produtos abaixo do estoque mínimo aparecem no dashboard e no relatório de reposição.

### 6.2 Pedidos online

1. Um pedido só pode ser marcado como vendido se tiver pelo menos um item.
2. O pagamento pode ser parcial ou total. O pedido fica pendente, parcialmente pago ou pago conforme a soma dos pagamentos informados.
3. O desconto não pode deixar o total negativo.
4. Uma alteração financeira relevante exige gerente ou administrador.
5. Um pedido vendido ou pago não deve ser editado diretamente; deve ser cancelado, devolvido ou ajustado por um fluxo específico.
6. O cancelamento deve registrar motivo e usuário.
7. Pedidos com pagamento em cartão ou Pix devem manter a forma de pagamento mesmo que o produto seja devolvido.
8. O sistema deve guardar o preço e o custo no momento do pedido para preservar o histórico.

### 6.3 Controle financeiro

1. Não existe abertura ou fechamento de caixa.
2. Toda entrada ou saída deve possuir valor, data, categoria e descrição.
3. Uma entrada originada de pedido deve estar vinculada ao pedido e ao valor efetivamente informado como recebido.
4. O valor recebido pode ser parcial ou total e cada recebimento deve gerar seu próprio lançamento ou vínculo financeiro.
5. Uma saída manual exige motivo e usuário responsável.
6. Correções devem gerar estorno ou ajuste, preservando o lançamento original.

### 6.4 Financeiro e bancos

1. Faturamento não é igual a dinheiro disponível.
2. Um pedido parcelado ou pendente pode gerar recebimentos futuros.
3. Toda conta paga deve registrar a data efetiva de pagamento.
4. Contas vencidas devem ser identificadas automaticamente.
5. Transferência entre contas não deve ser considerada receita ou despesa.
6. Lançamentos manuais exigem categoria e descrição.
7. Exclusão física de lançamento financeiro não deve ser permitida para usuários comuns.

### 6.5 Usuários e segurança

1. Usuários inativos não podem entrar no sistema.
2. Operador não pode alterar custo de produto, excluir pedidos ou apagar movimentações financeiras sem permissão.
3. Gerente pode aprovar alterações relevantes e ajustes definidos pela configuração.
4. Administrador pode gerenciar usuários, permissões e configurações.
5. Dados de clientes devem ser acessados apenas por usuários autorizados.
6. RLS deve limitar cada registro à loja/organização correta.
7. A chave `service_role` do Supabase nunca deve aparecer no frontend, no GitHub ou em arquivos públicos.

### 6.6 Cobranças parceladas

1. O valor total do acordo deve ser igual à soma das parcelas, respeitando eventual diferença de centavos na última parcela.
2. Cada parcela deve ter uma data de vencimento e um status próprio.
3. Parcela vencida é identificada automaticamente pela data atual e pelo status não pago.
4. O contador deve mostrar dias restantes quando a parcela ainda não venceu e dias de atraso quando já venceu.
5. Registrar pagamento deve atualizar a parcela e criar ou vincular a movimentação financeira correspondente.
6. Alterar valor, quantidade ou vencimento depois da criação exige motivo e permissão.
7. Copiar ou abrir uma mensagem no WhatsApp não significa que ela foi enviada. O sistema deve registrar somente a ação de contato quando o usuário confirmar.
8. O sistema não deve enviar mensagens por automação de navegador ou WhatsApp Web não oficial.
9. O envio automático, se implementado no futuro, deve respeitar consentimento, modelo aprovado e as regras vigentes da WhatsApp Business Platform.

### 6.7 Instagram

1. O sistema deve sugerir apenas produtos ativos e com estoque disponível.
2. Uma sugestão não pode ser publicada sem aprovação do usuário responsável.
3. O sistema deve evitar selecionar repetidamente o mesmo produto dentro de um intervalo configurável.
4. Conteúdo agendado precisa registrar horário, status, tentativa e erro retornado pela plataforma.
5. Publicação automática depende de conta Instagram profissional, permissões e credenciais válidas da Meta.
6. A publicação semanal deve ser executada por uma rotina agendada no backend ou em um serviço de automação autorizado.

## 7. Fluxos essenciais

### 7.1 Compra e entrada de estoque

1. Usuário cadastra ou seleciona o fornecedor.
2. Registra os produtos recebidos, quantidades e custos.
3. O sistema cria movimentações de entrada.
4. O custo atual do produto é atualizado conforme a regra definida.
5. Se a compra tiver pagamento pendente, é criada uma conta a pagar.

### 7.2 Pedido manual

1. Operador registra manualmente o pedido da loja online.
2. Sistema valida produtos, quantidades e valores.
3. Operador informa cliente e pagamento.
4. Sistema grava pedido, itens e pagamentos.
5. Sistema grava a saída de estoque quando o pedido é marcado como vendido.
6. Sistema grava a entrada financeira somente quando o usuário informa que recebeu o pagamento, seja parcial ou total.
7. Dashboard e relatórios passam a refletir a operação.

### 7.3 Lançamento financeiro

1. Usuário escolhe entrada ou saída.
2. Informa conta, categoria, valor, data e descrição.
3. Sistema valida a permissão do usuário.
4. Lançamento fica disponível no histórico e nos relatórios.
5. Correções posteriores geram ajuste ou estorno, preservando o histórico.

### 7.4 Cobrança de cliente

1. Usuário cadastra o cliente e o acordo de pagamento.
2. Sistema calcula e grava as parcelas futuras.
3. Dashboard mostra parcelas próximas e atrasadas.
4. Usuário abre a parcela e copia a mensagem personalizada.
5. Usuário pode abrir o WhatsApp com o telefone e a mensagem preenchida.
6. Após o contato, usuário pode marcar a parcela como contatada.
7. Ao receber o pagamento, usuário registra a quitação e a entrada financeira.

### 7.5 Conteúdo semanal do Instagram

1. Sistema identifica produtos elegíveis conforme as regras de seleção.
2. Sistema cria sugestões com imagem, legenda e hashtags.
3. Usuário revisa, edita e aprova as sugestões.
4. Sistema cria o calendário semanal.
5. Uma rotina agendada tenta publicar cada conteúdo no horário definido.
6. Sistema registra publicado ou falhou e mostra o motivo quando houver erro.

## 8. Organização sugerida do projeto

```text
finesse-silver/
├─ src/
│  ├─ components/
│  ├─ layouts/
│  ├─ pages/
│  ├─ features/
│  │  ├─ dashboard/
│  │  ├─ orders/
│  │  ├─ financial-control/
│  │  ├─ inventory/
│  │  ├─ finance/
│  │  └─ customers/
│  ├─ lib/
│  │  ├─ supabase.ts
│  │  ├─ permissions.ts
│  │  └─ formatters.ts
│  ├─ hooks/
│  ├─ types/
│  └─ styles/
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ functions/
├─ public/
├─ .env.example
├─ README.md
└─ DOCUMENTACAO-SISTEMA-FINESSE-SILVER.md
```

## 9. Skills e ferramentas úteis

Skills relevantes para construir o sistema:

- **Sites**: estruturar a aplicação web, experiência, rotas, responsividade e publicação;
- **Spreadsheets**: preparar planilhas de importação de produtos, custos e estoque;
- **Documents**: gerar manuais ou procedimentos em DOCX, caso a documentação precise ser entregue em Word;
- **Visualize**: criar gráficos, simulações e visualizações operacionais quando forem úteis;
- **Computer Use**: validar o sistema em aplicativos ou navegador, quando necessário.

Além das skills, o projeto deve usar:

- Supabase Dashboard para banco, autenticação, Storage e RLS;
- GitHub para versionamento;
- GitHub Actions para build e publicação;
- ferramenta de análise de erros em produção em etapa posterior.

## 10. Segurança, LGPD e operação

O sistema deve coletar apenas os dados de clientes necessários para a operação. CPF e data de nascimento devem ser opcionais até existir uma necessidade clara.

Recomendações:

- criar política de privacidade;
- limitar quem vê dados pessoais;
- permitir desativar clientes sem apagar o histórico financeiro;
- registrar consentimento para comunicações;
- fazer backup/exportação periódica;
- nunca colocar credenciais privadas no repositório;
- separar ambiente de desenvolvimento e produção;
- revisar políticas RLS antes de colocar dados reais.

## 11. Roadmap de construção

### Fase 0 — Descoberta e decisões

- confirmar fluxo real da loja;
- confirmar se haverá uma ou mais lojas;
- confirmar de qual plataforma vêm os pedidos online;
- registrar pedidos manualmente no início;
- definir formas de pagamento usadas;
- decidir se o estoque negativo será permitido;
- escolher categorias e campos obrigatórios;
- baixar o estoque quando o pedido for marcado como vendido;
- registrar no financeiro apenas o valor informado como recebido, parcial ou total;
- usar o dia escolhido pelo cliente para gerar os vencimentos;
- usar WhatsApp manual no MVP.

### Fase 1 — Fundação

- criar projeto frontend;
- criar o projeto Supabase no plano Free;
- criar autenticação;
- criar tabelas e migrations;
- configurar RLS;
- criar layout, menu e identidade visual;
- criar dados de demonstração.

### Fase 2 — Operação diária

- dashboard;
- produtos e categorias;
- estoque;
- pedidos online;
- controle financeiro contínuo;
- cobranças parceladas e parcelas;
- mensagens prontas para WhatsApp;
- clientes.

### Fase 3 — Financeiro

- contas bancárias;
- contas a pagar;
- contas a receber;
- categorias financeiras;
- contas bancárias e transferências;
- relatórios financeiros;
- auditoria.

### Fase 4 — Melhorias

- devoluções e trocas;
- importação por planilha;
- comissões;
- integração com a plataforma da loja;
- publicação automática no Instagram;
- integração oficial de mensagens do WhatsApp, se houver orçamento.

## 12. Critérios de aceite do MVP

O MVP estará pronto quando:

- um usuário autorizado conseguir entrar;
- um administrador conseguir cadastrar categoria, fornecedor e produto;
- uma entrada de estoque alterar o saldo disponível;
- um operador conseguir registrar um pedido online;
- o pedido marcado como vendido reduzir o estoque em uma peça por unidade;
- o pagamento refletir no financeiro;
- uma entrada ou saída manual aparecer no controle financeiro;
- um acordo gerar todas as parcelas corretamente;
- o sistema mostrar dias restantes e dias de atraso;
- a mensagem de cobrança ser gerada com nome, parcela, valor e vencimento;
- o botão de copiar e abrir WhatsApp funcionar sem envio automático;
- produtos abaixo do mínimo aparecerem no dashboard;
- um usuário sem permissão não conseguir executar ações restritas;
- os registros principais ficarem disponíveis para consulta e auditoria;
- o sistema funcionar em desktop e tablet;
- o projeto puder ser publicado a partir do GitHub sem expor segredos.

## 13. Decisões em aberto antes da implementação

Estas decisões não impedem a criação do protótipo, mas devem ser respondidas antes de usar dados reais:

1. Qual é a plataforma atual da loja online, caso exista uma integração futura?
2. Como serão tratadas trocas, defeitos e garantia?
3. Haverá comissão por vendedor ou parceiro?
4. O preço da prata influenciará automaticamente o preço de venda?
5. A loja precisa emitir nota fiscal pelo sistema?
6. A conta do Instagram é profissional (Business ou Creator) e está ligada a uma Página do Facebook?
7. Qual frequência e quais dias da semana serão usados para o Instagram?
8. Quais relatórios são indispensáveis para a rotina da proprietária?

Regra provisória para vencimentos: o usuário escolherá um dia de 1 a 31. Quando esse dia não existir no mês, a parcela vencerá no último dia daquele mês. Essa regra pode ser alterada antes da migration sem afetar o restante do modelo.

## 14. Controle de mudanças e documentação

Para evitar alterações acidentais nas regras de negócio:

1. Toda mudança de escopo deve ser registrada no início deste arquivo com número, data e resumo.
2. Toda nova regra deve ser adicionada na seção **Regras de negócio** antes do código ser alterado.
3. Toda mudança de tabela, campo ou relacionamento deve ser registrada no **Modelo de dados** e acompanhada de migration.
4. Toda tela nova deve ser incluída na **Estrutura de navegação** e no roadmap.
5. Antes de publicar uma versão, os critérios de aceite devem ser revisados.
6. Decisões ainda não confirmadas devem permanecer em **Decisões em aberto** e não devem ser tratadas como regra definitiva.
7. O arquivo deve ser atualizado no mesmo commit da mudança de código correspondente.

## 15. Ordem oficial de implementação

### Etapa 1 — Decisões finais

- registrar pedidos manualmente no início;
- usar estoque por peça;
- baixar estoque quando o pedido for marcado como vendido;
- registrar no financeiro apenas o valor informado como recebido, parcial ou total;
- usar WhatsApp manual no MVP;
- exigir aprovação humana para publicações do Instagram.

### Etapa 2 — Fundação backend

- criar migrations PostgreSQL;
- criar tabelas de usuários, clientes, cobranças, parcelas e financeiro;
- configurar autenticação Supabase;
- configurar políticas RLS;
- criar categorias financeiras padrão;
- criar dados de demonstração;
- configurar Storage somente quando as imagens de produtos forem implementadas.

### Etapa 3 — Primeira funcionalidade completa

Construir o módulo de cobrança de ponta a ponta:

- cadastro de cliente;
- cadastro do acordo de pagamento;
- geração automática das parcelas;
- contador de dias para vencimento e atraso;
- mensagem personalizada;
- copiar mensagem;
- abrir WhatsApp com mensagem preenchida;
- registrar contato;
- registrar pagamento;
- atualizar o financeiro.

### Etapa 4 — Frontend base e operação

- layout autenticado;
- menu e navegação;
- dashboard com dados reais;
- pedidos online;
- produtos e estoque;
- controle financeiro;
- clientes e fornecedores.

### Etapa 5 — Integrações e melhorias

- seleção automática de produtos para Instagram;
- calendário semanal;
- publicação oficial no Instagram;
- importação de pedidos;
- WhatsApp Business Platform, somente se houver necessidade e orçamento.

## 16. Recomendação final

Não começar pelo dashboard, porque ele depende das tabelas e dos fluxos que ainda não existem. Também não começar pela integração do Instagram ou do WhatsApp, porque são dependências externas.

O primeiro desenvolvimento deve ser o backend do módulo de cobranças, acompanhado imediatamente pela tela correspondente. Assim validamos banco, regras, permissões e experiência de uso em uma funcionalidade real antes de expandir o sistema.

## 17. Backend implementado

### 17.1 Migration inicial

A migration inicial contém:

- perfis e papéis de usuário;
- configurações da loja;
- categorias, fornecedores, produtos e imagens;
- clientes;
- pedidos manuais e itens;
- pagamentos de pedidos;
- movimentações de estoque por peça;
- contas, categorias e transações financeiras;
- acordos, parcelas e pagamentos de cobranças;
- fila de conteúdo do Instagram;
- auditoria;
- índices básicos;
- funções para marcar pedido como vendido;
- funções para registrar pagamentos parciais ou totais;
- views para saldo de estoque e resumo das parcelas;
- RLS para acesso autenticado.

### 17.2 Regras mantidas no banco

As operações que podem gerar inconsistência ficam centralizadas em funções PostgreSQL:

- marcar pedido como vendido valida o estoque e cria as saídas;
- registrar pagamento atualiza o status e cria a entrada financeira;
- registrar pagamento de parcela atualiza a parcela e cria a entrada financeira;
- criação de acordo gera as parcelas automaticamente;
- itens do pedido recalculam subtotal e total.

### 17.3 Aplicação no Supabase

O passo operacional seguinte é aplicar a migration pelo SQL Editor do projeto e executar o seed. O procedimento está documentado em `supabase/README.md`. Nenhuma chave privada deve ser adicionada ao GitHub.
