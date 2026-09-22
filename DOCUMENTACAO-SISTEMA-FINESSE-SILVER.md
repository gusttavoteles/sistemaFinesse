# Documentação do Sistema — Finesse Silver

> Documento de produto, arquitetura, banco de dados e regras de negócio para um sistema simples de apoio ao controle financeiro de uma loja online de acessórios em prata 925.

> **Revisão 02 — 18/09/2026:** a loja foi definida como exclusivamente online. Foram removidos do escopo a abertura e o fechamento de caixa, o caixa por turno, o leitor de códigos e o fluxo de balcão/PDV. Toda alteração futura de escopo deve ser registrada neste arquivo antes de alterar a implementação.

> **Revisão 03 — 18/09/2026:** incluído o módulo de cobrança parcelada de clientes, com parcelas, vencimentos, contador de dias e mensagem pronta para copiar ou abrir no WhatsApp. Incluído também o planejamento de conteúdo para Instagram. O envio automático pelo WhatsApp e a publicação automática no Instagram ficam condicionados às APIs e regras da Meta.

> **Revisão 04 — 18/09/2026:** infraestrutura inicial informada pelo proprietário: projeto Supabase `rswbuqkwdwttylppnhcw` e repositório GitHub `gusttavoteles/sistemaFinesse`. A inspeção encontrou um protótipo antigo de conteúdo em `index.html`, um `README.md` e quatro commits. A limpeza do repositório ainda não foi executada porque é necessário definir se o histórico será preservado.

> **Revisão 05 — 18/09/2026:** definida a ordem de implementação: começar pela fundação do backend no Supabase e construir em seguida a primeira funcionalidade completa de cobrança parcelada, incluindo sua interface. O dashboard e as integrações externas serão construídos depois que existirem dados reais para exibir.

> **Revisão 06 — 18/09/2026:** decisões confirmadas pelo proprietário: estoque controlado por peça; pedidos cadastrados manualmente; baixa do estoque quando o pedido for marcado como vendido; pagamentos lançados no financeiro quando informados como recebidos, podendo ser parciais ou totais; vencimento definido pelo dia escolhido para pagamento; WhatsApp manual no MVP.

> **Revisão 07 — 18/09/2026:** criada a primeira base real do backend em `supabase/migrations/20260918000100_initial_backend.sql`, com tabelas, relacionamentos, funções de negócio, views e RLS. Também foram criados `supabase/seed.sql`, `supabase/README.md` e `.env.example`. A migration ainda precisa ser aplicada no projeto Supabase pelo SQL Editor ou CLI.

> **Revisão 08 — 18/09/2026:** a base do backend foi validada localmente. Foram confirmadas 19 tabelas públicas, RLS habilitado em todas, funções de venda/pagamento/cobrança, geração de parcelas, regra de vencimento no último dia do mês e seed inicial. A aplicação remota permanece pendente de autenticação no dashboard do Supabase; não foram versionadas chaves privadas.

> **Revisão 09 — 18/09/2026:** o projeto Supabase remoto foi autenticado e validado. O schema já existia com 19 tabelas, 13 tipos, 4 funções, 2 views e RLS habilitado nas 19 tabelas; por isso a migration não foi reaplicada nem houve exclusão de dados. O seed foi executado com sucesso, criando/confirmando as configurações da loja, 6 categorias de produtos, 6 categorias financeiras e 2 contas padrão. Testes transacionais de parcelas, total de pedido e rollback passaram.

> **Revisão 11 — 18/09/2026:** reservados no Supabase remoto os dois slots privados de master, sem armazenar os e-mails no repositório. O cadastro público foi desativado, o login anônimo permanece desativado, a confirmação de e-mail está ativa, a senha mínima foi definida em 12 caracteres e a troca segura de senha foi ativada. A verificação remota confirmou 19 gates de acesso, 18 triggers de auditoria, bloqueio de escrita direta em pagamentos, bloqueio de edição de cargo e ausência de RPC anônima. As contas Auth ainda precisam ser convidadas, confirmadas e vinculadas aos slots pelos próprios titulares.

> **Revisão 12 — 18/09/2026:** esclarecido o limite de confiança entre frontend e backend: o navegador pode conhecer a URL e a chave publicável/anon do Supabase, mas não recebe a `service_role`, senhas, TOTP ou credenciais administrativas. A chave publicável permite chamadas à API, não acesso aos dados; RLS, autenticação master, sessão AAL2 e as permissões do banco fazem a decisão final. O frontend será considerado cliente não confiável e deverá ser validado antes da publicação.

> **Revisão 13 — 18/09/2026:** criada a fundação do frontend em React/Vite. A primeira tela contém login master com senha, validação TOTP, recuperação por e-mail, sessão persistente e um dashboard inicial conectado somente à chave publicável do Supabase. Dados do painel usam estado vazio ou consultas reais; nenhum número fictício foi criado. Módulos de pedidos, clientes, estoque, financeiro e conteúdo ficaram como pontos de navegação sem operações até a definição de cada tela.

> **Revisão 14 — 18/09/2026:** ajustada a publicação estática para o GitHub Pages. O código-fonte HTML fica em `src/index.html`, o Vite compila os arquivos em `dist/` e o script de build copia o `index.html` compilado e os assets para a raiz do repositório. Os caminhos dos assets usam `./`, compatível com domínio próprio e com publicação em subpasta do GitHub Pages.

> **Revisão 15 — 18/09/2026:** os convites Auth foram enviados pelo painel do Supabase para os dois e-mails autorizados. O banco confirmou os dois slots habilitados e vinculados aos UUIDs criados. A chave publicável foi configurada somente no `.env.local` ignorado pelo Git e o frontend foi recompilado/publicado; ainda faltam confirmação de e-mail, definição de senha e cadastro do TOTP por cada titular.

> **Revisão 16 — 18/09/2026:** implementado o fluxo de primeiro acesso: convite com `access_token` abre a definição de senha, o primeiro login oferece cadastro TOTP por QR Code e os logins seguintes exigem desafio TOTP. O Vite local usa `http://localhost:3000/`, compatível com o redirecionamento atual do convite. A sessão AAL1 continua invisível para o dashboard até a validação AAL2.

> **Revisão 20 — 18/09/2026:** implementada a primeira funcionalidade operacional do frontend: cadastro de clientes e módulo de cobranças parceladas. A interface consulta a view de parcelas, cria acordos pelo backend, calcula o saldo em aberto, mostra vencimentos/atrasos, copia mensagens de cobrança, abre o WhatsApp manualmente e registra recebimentos pela RPC transacional com `p_request_id`. Naquele momento o registro de contato ficou pendente de migration própria.

> **Revisão 21 — 18/09/2026:** ampliada a integração operacional do frontend com Supabase. Foram conectados cadastro de peças/produtos, imagens no bucket privado, ajustes de estoque, pedidos manuais, baixa de estoque por venda, pagamentos de pedidos, contas e lançamentos financeiros, calendário de conteúdo e registro de contato de cobranças. A migration `supabase/migrations/20260918000300_mvp_operations.sql` adiciona as RPCs e permissões necessárias. Integrações automáticas com WhatsApp e Instagram continuam fora do MVP, conforme definido neste documento.

> **Revisão 22 — 19/09/2026:** por decisão do proprietário, o MFA/TOTP foi removido do acesso operacional para destravar o uso do sistema. A migration `supabase/migrations/20260919000400_remove_mfa_requirement.sql` mantém os dois masters, perfil ativo, e-mail confirmado, sessão válida e expiração de oito horas, mas não exige mais AAL2. O frontend agora usa somente e-mail e senha. Essa decisão reduz a proteção contra acesso indevido e deve ser reavaliada antes de ampliar o sistema.

> **Revisão 23 — 21/09/2026:** adicionada à Visão geral a projeção de recebimentos por mês. O usuário pode escolher um mês de referência e consultar cards do mês selecionado, do mês seguinte e de dois meses à frente. O valor exibido considera somente o saldo ainda não recebido das parcelas com vencimento dentro de cada mês, sem incluir parcelas pagas ou canceladas.
> **Revisão 24 — 21/09/2026:** edição de cadastros preservando UUID e histórico, download autenticado das fotos, criação atômica de pedido com parcelas vinculadas e correção da visão geral/financeiro. As regras detalhadas e os limites de edição estão na seção 20. Migration: `20260921000600_linked_orders_and_dashboard.sql`.

> **Revisão 25 — 21/09/2026:** criada a programação semanal de conteúdo. Ao solicitar a programação, o sistema sorteia fotos de produtos ativos, agenda até 5 por dia de segunda a domingo, impede repetição da mesma imagem na semana, informa eventual falta de fotos e disponibiliza o download autenticado das fotos de cada dia. A regra está na seção 20.5 e na migration `20260921000700_weekly_content_scheduler.sql`.

> **Revisão 26 — 21/09/2026:** criada a aba **Reativação** para relacionamento pós-compra. Todos os clientes cadastrados, inclusive inativos, aparecem na lista. Cada cliente possui duas mensagens prontas: aviso de novas peças e convite para comprar novamente. Os botões preparam o contato manual, copiam a mensagem e abrem o WhatsApp quando há telefone cadastrado. Regras detalhadas na seção 20.6.

> **Revisão 27 — 21/09/2026:** adicionada a visão de lucro estimativo na tela Produtos e estoque. O sistema calcula lucro unitário, margem média por produto e lucro estimado do estoque usando custo de aquisição e preço vigente. Esses indicadores são projeções de catálogo, não substituem o lucro realizado das vendas. Regras detalhadas na seção 20.7.
> **Revisão 28 — 21/09/2026:** adicionada a meta de vendas na Visão geral. A master informa início, fim e valor do objetivo; o banco mantém uma única meta ativa e calcula automaticamente o progresso a partir dos pedidos quitados no período. O valor de um pedido entra uma única vez quando seu `payment_status` passa a `paid`, inclusive quando a quitação ocorre pela última parcela. Migration: `20260921000800_sales_goals.sql`.

> **Revisão 29 — 22/09/2026:** revisado o tratamento de fotos. O navegador pode receber formatos de imagem que consiga decodificar, mas o sistema não promete suporte universal a todo formato existente. Antes do upload, a foto é convertida para WebP, sem ampliar a imagem, com dimensão máxima de 2400 px no maior lado e tentativa de qualidade 90%; reduções adicionais de qualidade/dimensão são aplicadas somente se necessário para ficar abaixo de 5 MiB. O arquivo original não é mantido. O download autenticado permite escolher JPG ou PNG; JPG usa fundo branco quando a imagem possui transparência, e PNG preserva transparência. A conversão não recupera qualidade que já tenha sido perdida no arquivo original. Não foi necessária migration: o caminho da imagem e a tabela `imagens_produtos` permanecem os mesmos. Regras detalhadas na seção 20.9.

> **Revisão 30 — 22/09/2026:** adotada a logo oficial enviada pelo proprietário. A arte é versionada em `src/assets/finesse-logo.png`, exibida sobre fundo preto e aplicada à tela de login, ao menu lateral, ao cabeçalho móvel, ao primeiro acesso e ao carregamento inicial. O CSS somente enquadra a imagem removendo margens pretas vazias; não há redesenho, alteração do texto ou geração automática da marca. Regras detalhadas na seção 20.10.

> **Revisão 31 — 22/09/2026:** refinada a tela de login para integrar a logo preta ao painel visual. A direção escolhida é preto profundo com tipografia branca, detalhes dourados e fundo da logo sem borda visível; o marrom fica apenas como nuance sutil do gradiente, não como cor dominante. A arte original permanece preservada e o ajuste é feito por composição CSS. Regras detalhadas na seção 20.11.

> **Revisão 32 — 22/09/2026:** atualizados os modelos textuais de cobrança, novidades e reativação. A cobrança passou a usar o nome Finesse Joias, valor restante da parcela, vencimento, instrução de PIX e assinatura; como ainda não existe uma chave PIX configurada no banco, `{{chave_pix}}` permanece como marcador explícito. As duas mensagens de relacionamento passaram a oferecer opções numeradas de produtos. O envio continua manual, por cópia ou abertura do WhatsApp, sem automação ou disparo em massa. Regras detalhadas nas seções 3.5 e 20.6.

> **Revisão 33 — 22/09/2026:** cadastrada a chave PIX pública `finessesuporte.25@gmail.com` no modelo de cobrança. As mensagens passaram a usar caracteres Unicode explícitos, normalização NFC e codificação UTF-8 na cópia/URL do WhatsApp para preservar emojis, corações, gemas e emojis de opções numeradas. O envio continua manual, sem automação ou disparo em massa.

## 1. Visão do produto

> **Revisão 10 — 18/09/2026:** acesso restrito a dois usuários master, com privilégios operacionais iguais. Esta decisão substitui a divisão anterior em administrador, gerente, operador e financeiro. A seção 18 define os requisitos de segurança e distingue implementação de pendências operacionais.

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
| Master 1 | Operar e administrar a loja | Todas as operações permitidas, com senha |
| Master 2 | Operar e administrar a loja | Mesmos direitos do Master 1, com senha |

A administração da infraestrutura permanece separada do acesso operacional. Nenhum master pode contornar regras financeiras, editar auditoria ou cadastrar um terceiro usuário pelo aplicativo. O valor técnico `admin` permanece no enum por compatibilidade; a autorização depende da lista privada de dois usuários, não apenas desse valor.

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
  8. **Reativação de clientes**
  9. **Fornecedores**
  10. **Conteúdo Instagram**
  11. **Relatórios**
  12. **Configurações**
  13. **Auditoria** — visível apenas para administrador.

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
- projeção de recebimentos para o mês escolhido, o mês seguinte e os dois meses seguintes;

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

Mensagem padrão vigente:

```text
✨ Olá, {{nome}}! Tudo bem?
Passando com carinho para lembrar que o pagamento referente à sua compra na **Finesse Joias** está pendente no valor de **R$ {{valor}}**, com vencimento em **{{data_vencimento}}**.
💳 Você pode realizar o pagamento pela chave PIX abaixo:
**finessesuporte.25@gmail.com**
Caso o pagamento já tenha sido efetuado, por favor, desconsidere esta mensagem e, se possível, envie o comprovante. 💎
Se precisar de alguma informação ou desejar combinar uma nova data, estamos à disposição para ajudar. 🤍
Atenciosamente,
**Finesse Joias | Prata 925** ✨
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

O sistema poderá selecionar fotos vinculadas a produtos para sugerir conteúdo com base em regras como:

- produto ativo;
- caminho de imagem válido no bucket privado;
- imagem ainda não usada na semana selecionada.

Cada conteúdo poderá conter:

- produto escolhido;
- imagem;
- legenda;
- hashtags;
- data e hora planejadas;
- status: sugestão, aprovado, agendado, publicado ou erro;
- usuário que aprovou.

O calendário semanal deve permitir revisar, aprovar e editar as sugestões antes da publicação. A programação automática de fotos é interna ao sistema; a publicação automática no Instagram continua fora do MVP e dependerá de uma conta Instagram profissional, permissões da Meta e um serviço agendador.

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

1. A programação automática considera somente fotos vinculadas a produtos ativos e com caminho de Storage válido.
2. Ao ser solicitada, a programação cria até 5 publicações por dia, de segunda-feira a domingo, nos horários de 09:00, 11:30, 14:00, 17:00 e 20:00 no fuso `America/Sao_Paulo`.
3. Uma mesma `image_path` não pode aparecer mais de uma vez na mesma semana. Publicações `scheduled`, `approved` e `published` bloqueiam a reutilização; uma publicação `failed` não bloqueia nova tentativa.
4. A programação preenche apenas vagas vazias e não substitui publicações manuais, aprovadas ou já publicadas.
5. Se houver menos de 35 fotos elegíveis e únicas, o sistema agenda o máximo disponível e informa a quantidade faltante; não reutiliza fotos para completar a semana.
6. Repetir a mesma solicitação é idempotente por `p_request_id`; solicitar novamente a mesma semana não cria duplicatas.
7. Baixar fotos usa a sessão autenticada e o bucket privado. O usuário baixa as fotos de cada dia individualmente pelo navegador e publica manualmente no Instagram no MVP.

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

1. Usuário escolhe a segunda-feira da semana e solicita a programação.
2. O backend sorteia fotos elegíveis sem repetir a mesma imagem dentro da semana.
3. O backend cria até 5 itens por dia, com legenda, hashtags, produto, horário e status `scheduled`.
4. Se houver menos fotos que o necessário, a tela informa o total criado e a quantidade faltante.
5. Usuário revisa, edita ou marca os itens conforme o fluxo manual de conteúdo.
6. Usuário usa o botão de cada dia para baixar as fotos e faz a publicação manual no Instagram.

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

A estrutura e o seed inicial já foram validados no projeto remoto `finesse-silver`. O schema existente foi preservado e o seed idempotente foi executado pelo SQL Editor. O procedimento reproduzível continua documentado em `supabase/README.md`. Nenhuma chave privada deve ser adicionada ao GitHub.

### 17.4 Validação remota concluída

- 19 tabelas públicas encontradas;
- 13 tipos PostgreSQL encontrados;
- 4 funções de negócio encontradas;
- 2 views encontradas;
- RLS habilitado nas 19 tabelas;
- seed confirmado: 6 categorias de produtos, 6 categorias financeiras e 2 contas;
- teste de parcelas: dia 31 ajustado para 28/02;
- teste de total do pedido: 2 × R$ 100,00 − R$ 10,00 = R$ 190,00;
- rollback confirmado: nenhum dado de teste permaneceu.

## 18. Segurança — decisão oficial para dois masters

Esta seção substitui permissões antigas incompatíveis com o acesso exclusivo dos dois masters. Referências: [OWASP ASVS](https://owasp.org/projects/asvs), [Supabase produção](https://supabase.com/docs/guides/deployment/going-into-prod), [MFA TOTP](https://supabase.com/docs/guides/auth/auth-mfa/totp), [sessões](https://supabase.com/docs/guides/auth/sessions). Não representa certificação de segurança.

### 18.1 Controles de acesso e sessão

- Somente dois slots privados (1 e 2), associados a e-mails normalizados e UUIDs do Auth. Os e-mails reais não entram no repositório público.
- Lista vazia significa acesso negado a todos. Provisionamento exclusivamente administrativo pelo SQL Editor usando `supabase/operations/provision-masters.sql`; nenhuma função pública promove usuários.
- Novo usuário fora da lista é rejeitado pelo trigger do Auth. Cadastro público e anônimo devem permanecer desativados no provedor, como segunda camada.
- Ambos os masters precisam confirmar o e-mail. O MFA/TOTP foi removido por decisão do proprietário; o acesso operacional usa somente senha.
- Todas as tabelas exigem usuário autorizado, perfil ativo, e-mail correspondente e sessão existente dentro da janela de oito horas. Conhecer a chave publicável não autoriza acesso.
- Sessões do aplicativo ficam limitadas a 8 horas pela autorização no banco; novo login é necessário após esse período. Remover a sessão, desativar o perfil ou revogar o slot bloqueia a próxima consulta, mesmo com JWT antigo. Isso não depende da opção paga de duração de sessão do provedor.
- Logout deve revogar a sessão e limpar estado local. Dados já vistos/baixados não podem ser recolhidos. Bloqueio por inatividade na interface será implementado no frontend; não está ativo ainda.
- Senha mínima de 12 caracteres, única por conta; recuperação por e-mail verificado e redirecionamento exato para URL autorizada. MFA nas contas da infraestrutura GitHub/Supabase continua sendo responsabilidade dos titulares, mas não é exigido pelo aplicativo.

### 18.2 Integridade e auditoria

- Pagamentos e lançamentos financeiros não aceitam escrita direta pela API. Usar RPCs transacionais e `p_request_id` UUID único por ação, preservado nos retries. Mesmo ID com valores diferentes é rejeitado; retries iguais retornam o resultado original. Data omitida usa o horário da primeira gravação.
- Pagamentos validam valor positivo, finito, com duas casas decimais, saldo restante e conta ativa. O pagamento parcial entra no financeiro somente pelo valor recebido. Receber não marca automaticamente a venda.
- Venda mantém bloqueio de pedido e produtos; movimentações de estoque passam pelo mesmo bloqueio por produto. Repetir a venda já marcada `sold` não baixa novamente. Testes simultâneos em múltiplas conexões ainda são necessários antes de produção.
- Itens e valores de pedidos com venda/pagamento ficam protegidos; status e totais não podem ser forjados pela API. Ajuste de estoque usa RPC com motivo e registro compensatório, preservando histórico.
- Acordos têm até 120 parcelas, de pelo menos R$ 0,01. Divisão trunca as parcelas regulares e coloca o resto na última para preservar centavos. Primeiro vencimento deve corresponder ao dia escolhido (ou último dia do mês). A regra de mês menor continua a regra anteriormente documentada.
- Pagamento integral de todas as parcelas conclui o acordo. Parcelas geradas não podem ser alteradas diretamente. Estorno, renegociação e cancelamento precisam de fluxo transacional próprio antes de serem disponibilizados na interface.
- Triggers registram autor, horário, operação, entidade e valores/status relevantes. Auditoria não aceita inserção, alteração ou exclusão pelo aplicativo e não duplica nomes, telefones, documentos ou observações pessoais. Administradores da infraestrutura continuam tecnicamente privilegiados.
- RPCs internas ficam no schema privado; funções públicas recebem somente permissões necessárias e search_path fixo. O nome técnico legado `admin` não concede acesso sem a lista privada e sessão válida.

### 18.3 Frontend e hospedagem — requisitos de liberação

O frontend já possui a fundação de autenticação, dashboard e módulos operacionais; os controles abaixo continuam sendo requisitos de liberação e não substituem a validação em ambiente real:

- O frontend é público por natureza: qualquer visitante pode baixar JavaScript, descobrir a URL do Supabase e a chave publicável/anon, observar chamadas e tentar repetir requisições. Isso não deve conceder acesso ao backend; toda autorização precisa permanecer no banco e no Auth.
- A chave publicável/anon não é uma credencial administrativa. A `service_role`, tokens de automação, senhas, TOTP, tokens de convite e qualquer segredo devem permanecer apenas em ambiente administrativo/servidor e nunca no bundle, navegador, GitHub ou logs.
- O banco remoto foi verificado com RLS nas 19 tabelas, gates restritivos para usuários autenticados, RPCs internas privadas e bloqueios de escrita direta sensível. A proteção depende de esses controles continuarem ativos; esconder endpoints ou código no frontend não é uma camada de segurança.
- HTTPS obrigatório; nenhum segredo administrativo no bundle ou GitHub. Somente URL e chave publicável Supabase no cliente.
- Renderizar textos como texto; evitar HTML dinâmico, scripts inline e eval. Validar tamanho/formato dos campos e usar consultas parametrizadas. Implementar CSP com origens mínimas e política de referência; proteção CSRF se forem usadas sessões por cookie.
- Não guardar clientes/pagamentos em cache persistente, URLs, console ou analytics. Limpar dados de tela ao sair. Exibir mensagens de erro sem SQL/tokens/detalhes internos.
- Sessão expirada deve abrir o fluxo de login, sem carregar dados. Não armazenar senha ou segredo de autenticação no frontend.
- Storage deve permanecer sem buckets públicos de documentos. Uploads exigirão limite de tamanho/tipo e políticas próprias antes da ativação.
- A configuração de cabeçalhos como CSP, frame-ancestors, HSTS e nosniff deve ser verificada na hospedagem escolhida. GitHub Pages não deve ser considerado automaticamente compatível com todos os cabeçalhos desejados; escolher hospedagem com suporte quando necessário.

### 18.4 Backup, monitoramento e incidentes

- Meta operacional inicial: backup diário criptografado, retenção de 30 dias, cópia separada do projeto e teste mensal de restauração em ambiente isolado. RPO proposto: até 24h; RTO alvo: 1 dia útil, a confirmar após ensaio. Não existe agendamento ativo nem destino de backup definido ainda.
- Backup precisa abranger dados, schema, políticas, configuração necessária de autenticação e arquivos do Storage, quando existirem. Verificar o escopo das ferramentas de exportação; apenas migrations/seed não recuperam clientes e pagamentos.
- Não gravar backups ou credenciais no GitHub. Rotação e descarte seguro aplicam-se também aos backups. Não prometer restauração antes de executá-la com sucesso.
- Workflow de CI executa testes PostgreSQL e verificação de dependências a cada push/PR. Logs do Auth/Supabase e `supabase/operations/security-check.sql` ajudam a revisar acesso, políticas e auditoria. Não há envio automático de alertas operacionais; falta definir canal e serviço para falhas de backup, indisponibilidade e tentativas suspeitas.
- Incidente: revogar usuário/sessões comprometidos, rotacionar credenciais afetadas, preservar evidências restritas, investigar abrangência, corrigir e verificar recuperação. Avaliar comunicação às pessoas afetadas/ANPD conforme o caso e requisitos aplicáveis.

### 18.5 Privacidade

- Cadastro mínimo: nome e contato necessários à venda/cobrança. CPF, data de nascimento e outros campos opcionais só devem ser coletados com finalidade justificada.
- Informar finalidade, acesso, compartilhamentos e canal para solicitações antes do uso real. Prazo de retenção de dados comerciais depende das necessidades e obrigações aplicáveis; não foi inventado um prazo universal.
- Acesso a exportações restrito aos masters. Evitar dados reais nos testes. Mensagens WhatsApp continuam copiadas/enviadas manualmente, com conferência do destinatário.

### 18.6 Evidências e pendências

- Migration `20260918000200_security.sql`: implementação dos controles de banco originais; `20260919000400_remove_mfa_requirement.sql` substitui a exigência de AAL2.
- `npm test`: nove cenários executados em PostgreSQL embarcado PGlite, com esquema Auth simulado. Exercitam RLS e papéis reais do PostgreSQL, bloqueios, retries, valores e centavos; não exercitam a API Auth hospedada, entrega de e-mail ou login TOTP real.
- Pendentes: os titulares devem confirmar os e-mails dos convites, definir as senhas e testar login/recuperação ponta a ponta. Também permanecem necessários ensaio de concorrência real e restauração, definição de backup/alertas e aplicação dos controles finais de frontend/hospedagem.
- Atualização remota: os dois e-mails foram convidados, os slots 1 e 2 estão habilitados e vinculados aos UUIDs Auth. Após aplicar a migration 004, o acesso depende de confirmação de e-mail, master ativo e sessão válida.
- Validações históricas da revisão 09 foram smoke tests; não constituíam uma auditoria de autorização. Nenhum status de segurança deve ser marcado concluído apenas porque uma tabela ou política existe.

## 19. Fundação do frontend

### 19.1 Decisões da primeira implementação

- Stack: React 19, Vite e `@supabase/supabase-js`.
- Cliente Supabase criado somente quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem. O build não contém nem solicita `service_role`.
- Login por senha usa `signInWithPassword`; a aplicação não cria nem exige desafio TOTP.
- Recuperação de senha usa o fluxo nativo do Supabase, sem armazenar senha, token ou TOTP no navegador.
- O dashboard consulta contagens e parcelas pendentes reais; enquanto não houver dados, apresenta `—` e estados vazios, sem dados fictícios.
- Os módulos implementados gravam somente pelas permissões e RPCs previstas; integrações automáticas externas continuam exibindo ações manuais ou estados de aprovação.
- O layout inicial é responsivo e usa o idioma português do Brasil. O design visual permanece uma base de trabalho até a aprovação da interface pelo proprietário.

### 19.2 Arquivos e validação

- `index.html`, `vite.config.js` e `src/`: aplicação frontend.
- `src/lib/supabase.js`: criação segura do cliente publicável.
- `src/app/AuthScreen.jsx`: login por senha e recuperação.
- `src/app/PasswordSetupScreen.jsx`: definição de senha no primeiro acesso por convite ou recuperação.
- `src/app/Dashboard.jsx`: shell, navegação e dashboard inicial.
- `src/app/CustomersPage.jsx`: cadastro e busca de clientes.
- `src/app/WinbackPage.jsx`: reativação de todos os clientes cadastrados, mensagens prontas e contato manual.
- `src/app/ProductsPage.jsx`: peças, preços, imagens e ajustes de estoque.
- `src/app/OrdersPage.jsx`: pedidos manuais, itens, venda e pagamentos.
- `src/app/ReceivablesPage.jsx`: cobranças, parcelas, mensagens e recebimentos.
- `src/app/FinancePage.jsx`: contas e lançamentos manuais.
- `src/app/ContentPage.jsx`: calendário e aprovação manual de conteúdo.
- `src/styles.css`: identidade visual e responsividade.
- `src/index.html`: entrada-fonte usada pelo Vite.
- `index.html` e `assets/`: saída estática compilada para leitura direta pelo GitHub Pages.
- `scripts/publish-root.mjs`: copia a saída compilada para a raiz após `npm run build`.
- `npm run build`: compilação aprovada.
- `npm test`: nove testes de segurança aprovados após a criação do frontend.

### 19.3 Próxima ordem de construção

1. Aprovar visualmente a base do dashboard e dos módulos operacionais.
2. Aplicar a migration `20260918000300_mvp_operations.sql` no Supabase remoto e validar o bucket privado de imagens.
3. Validar com dados reais clientes, produtos, imagens, pedidos, estoque, cobranças e financeiro.
4. Implementar relatórios e auditoria visual para a rotina diária.
5. Construir seleção automática de conteúdo e integração oficial com Instagram, se aprovada.
6. Avaliar WhatsApp Business Platform oficial, somente com orçamento e consentimento definidos.

### 19.4 Projeção de recebimentos na Visão geral

- A projeção consulta `resumo_parcelas_recebiveis`, usando `due_date`, `amount`, `paid_amount` e `effective_status`.
- O mês de referência é escolhido pelo usuário em um campo de mês.
- Cada card mostra o mês, o valor em aberto e a quantidade de parcelas previstas.
- O valor de cada parcela é calculado como `max(amount - paid_amount, 0)`.
- Parcelas pagas ou canceladas não entram na projeção. Atrasos entram somente no mês correspondente ao vencimento original.

## 20. Revisão de fluxos solicitada em 21/09/2026

### 20.1 Edição e propagação

- Clientes, produtos, contas financeiras e conteúdo não publicado passam a oferecer edição do mesmo registro (UUID preservado), nunca exclusão/recriação para corrigir dados.
- Nome/telefone/e-mail do cliente são dados canônicos. Pedidos, cobranças, mensagens e dashboard consultam os relacionamentos e mostram os dados atualizados ao abrir/recarregar a tela. Não há sincronização em tempo real entre computadores nesta revisão.
- Nome/preço/custo do produto usados numa venda são snapshots históricos: editar o catálogo não reescreve itens nem valores de pedidos existentes. Estoque continua sendo alterado apenas por movimentação com motivo.
- Pedidos oferecem edição de cliente e observações. Trocar o cliente é permitido somente antes de qualquer recebimento e atualiza também o acordo vinculado, na mesma transação. Observações não alteram estoque ou financeiro. Alteração de itens, total ou plano após gerar cobrança exige fluxo de revisão/renegociação próprio; não será feita implicitamente por edição cadastral.
- Conta permite editar nome, tipo e instituição; não permite reescrever saldo inicial nem lançamentos recebidos. Conteúdo publicado é histórico; editar conteúdo ainda não publicado retorna à sugestão para nova aprovação.
- Parcela em aberto permite corrigir vencimento individual, com motivo auditado. Não altera valor, quantidade, pagamentos, nem as demais datas do acordo. Parcelas quitadas/canceladas e acordos inativos permanecem bloqueados.

### 20.2 Fotos privadas

- Cada foto vinculada à peça terá ação Baixar foto, usando sessão autenticada no bucket privado `product-images`; não tornar o bucket público.
- O arquivo original pode ser um formato de imagem que o navegador consiga decodificar; antes do upload ele é normalizado para WebP, com limite de 25 MiB para o original e 5 MiB para a versão armazenada. Adicionar foto durante edição preserva as fotos anteriores. Falha da foto deve ser informada separadamente do sucesso do cadastro, sem incentivar cadastro duplicado. Os detalhes de conversão e download estão na seção 20.8.

### 20.3 Pedido e cobrança vinculada

- Ao cadastrar pedido, informar se haverá cobrança parcelada, quantidade, primeiro vencimento e dia mensal. Cliente é obrigatório para parcelamento. O plano abrange o total do pedido (itens + frete − desconto), sem entrada automática.
- Pedido, itens, acordo e parcelas são criados numa única transação idempotente. Falha em qualquer etapa desfaz toda a criação. Um pedido possui no máximo um acordo vinculado; cobranças antigas independentes não são associadas por suposição.
- Parcelas aparecem em Cobranças imediatamente após o cadastro, mesmo antes de Marcar vendido. Isso não baixa estoque nem gera entrada financeira. Marcar vendido continua baixando estoque uma única vez.
- Receber parcela vinculada registra um único lançamento financeiro e sincroniza o pagamento parcial/integral do pedido. O botão de pagamento desses pedidos direciona para Cobranças, evitando recebimentos paralelos duplicados. Parcelas do cartão são metadados de um pagamento recebido e não substituem um plano de cobrança.
- Mantidos: divisão mensal, até 120 parcelas, mínimo de R$ 0,01 por parcela, ajuste de centavos na última parcela e último dia do mês quando necessário. Mensagem de cobrança usa o saldo restante da parcela, não o valor já recebido.

### 20.4 Visão geral e validação

- Corrigir status `canceled`, leitura trocada de resultados e término de carregamento em falhas. Mostrar erro, não zero fictício, quando os dados não puderem ser consultados.
- Saldo = saldo inicial das contas ativas + todas as entradas pagas − todas as saídas pagas dessas contas. Dashboard e Financeiro usam a mesma agregação no banco, sem limitar cálculo aos últimos 100/1.000 registros.
- A receber = saldo restante de parcelas de acordos ativos; pedidos = pedidos não cancelados; produtos/clientes = cadastros ativos. Fluxo mostra movimentos pagos dos últimos sete dias; próximos vencimentos incluem atrasos e próximos sete dias; pedidos recentes mostram registros reais.
- Recarregar a visão geral ao retornar de outro módulo, voltar o foco à janela ou clicar Atualizar.
- Implementação e evidências desta revisão: migration `20260921000600_linked_orders_and_dashboard.sql` aplicada/verificada no projeto remoto `rswbuqkwdwttylppnhcw` em 21/09/2026. A confirmação remota encontrou as duas colunas de vínculo, as quatro RPCs públicas (`create_manual_order`, `edit_order_details`, `edit_installment_due_date`, `dashboard_summary`), as duas views (`resumo_parcelas_recebiveis`, `saldos_contas_financeiras`) e os triggers de sincronização/proteção.
- `npm test`: 19 cenários aprovados, incluindo rollback atômico, idempotência, recebimento parcial/integral sem duplicação financeira, propagação de cliente, preservação de snapshots, correção auditada de vencimento, segurança de fotos, dashboard com mais de 1.000 lançamentos e programação semanal sem repetição.
- `npm run build`: aprovado. A saída compilada foi atualizada na raiz para GitHub Pages. O aviso de tamanho do bundle não impede a publicação e fica registrado para futura divisão de módulos.
- QA visual isolado em `tests/browser-preview/`: aprovado para edição de cliente/produto/conta/conteúdo, parcelamento de pedido, filtro de cobranças, mensagem com saldo restante, download autenticado simulado e recuperação da visão geral após erro. O fixture não usa o Supabase remoto nem dados reais.

### 20.5 Programação semanal de fotos

- A tela Conteúdo trabalha com uma semana de segunda-feira a domingo. Se o usuário escolher outra data, a interface normaliza para a segunda-feira correspondente.
- O botão **Programar esta semana** é a única ação que dispara a seleção automática. Não existe publicação automática no Instagram neste MVP.
- O banco sorteia fotos ligadas a produtos ativos, usando o `storage_path` do bucket privado `product-images`. A seleção é aleatória a cada solicitação, mas respeita o bloqueio de repetição dentro da semana.
- Cada dia possui cinco horários fixos: 09:00, 11:30, 14:00, 17:00 e 20:00, no fuso `America/Sao_Paulo`. A programação cria no máximo uma foto por horário.
- Publicações existentes nos status `approved`, `scheduled` ou `published` ocupam a vaga e suas imagens não podem ser reutilizadas na semana. Publicações `failed` não contam como bloqueio e podem ser tentadas novamente.
- A rotina nunca apaga, reordena ou sobrescreve publicações já existentes. Ela somente completa vagas abaixo de cinco por dia.
- Com menos de 35 fotos elegíveis e únicas, a rotina agenda todas as disponíveis e retorna `missing` com a quantidade que faltou. A tela exibe esse aviso e não repete fotos para completar a meta.
- O `p_request_id` torna a operação idempotente: repetir a mesma requisição retorna o resultado anterior sem inserir novamente. Uma nova solicitação para a mesma semana também não cria novas imagens se a semana já estiver completa.
- O botão **Baixar fotos** executa um download autenticado por imagem do dia, com nomes de arquivo contendo data, ordem e produto. O navegador pode solicitar autorização para múltiplos downloads. O sistema não cria ZIP nesta etapa.
- A implementação está em `supabase/migrations/20260921000700_weekly_content_scheduler.sql`, na RPC `generate_weekly_content_schedule(date, uuid)`, e na tela `src/app/ContentPage.jsx`.
- Validação local: os 19 testes confirmam 35 imagens distribuídas em 7 dias com 5 únicas por dia, reexecução idempotente e comportamento de escassez sem repetição. A migration `20260921000700_weekly_content_scheduler.sql` foi aplicada no Supabase remoto em 21/09/2026; a verificação confirmou a RPC e os índices `imagens_produtos_storage_path_idx` e `publicacoes_conteudo_image_schedule_idx`. Nenhum post real foi criado durante a validação remota.

### 20.6 Reativação de clientes

- A aba **Reativação** lista todos os registros da tabela `clientes`, sem filtrar pelo campo `active`. Assim, clientes ativos e inativos continuam disponíveis para consulta e contato, conforme solicitado.
- A lista permite buscar por nome, telefone ou e-mail. A edição do cadastro continua sendo feita na aba **Clientes**, mantendo uma única fonte de dados para nome e telefone.
- Cada cliente possui duas ações: **Avisar novas peças** e **Convidar para comprar novamente**. As mensagens usam o nome atual do cadastro no momento do clique.
- Mensagem de novidades: começa com `✨ Olá, {nome}! Temos novidades na **Finesse Joias**! 💎`, apresenta Prata 925 e oferece as opções numeradas: novidades, anéis, colares, brincos e pulseiras.
- Mensagem de clientes sem compra recente: começa com `✨ Olá, {nome}! Sentimos sua falta por aqui! 🤍`, explica que chegaram novidades na Finesse Joias e oferece as mesmas cinco opções numeradas.
- A mensagem de cobrança usa o saldo restante da parcela, não o valor já recebido, e informa a chave PIX pública `finessesuporte.25@gmail.com`.
- Emojis são montados por pontos de código Unicode, normalizados com NFC e codificados com `encodeURIComponent` em UTF-8 antes da abertura do WhatsApp. A mesma mensagem normalizada é enviada ao clipboard, mantendo o conteúdo consistente entre copiar e abrir.
- Cada ação copia a mensagem para a área de transferência e, se existir telefone, abre uma conversa preenchida em `wa.me`. O sistema não envia automaticamente; a master revisa e confirma o envio no WhatsApp.
- Sem telefone, a mensagem ainda pode ser copiada para outro canal. A tela informa que o cadastro precisa de telefone para abrir o WhatsApp.
- O indicador de autorização de WhatsApp continua visível para orientar a operação. A aba não cria disparos em massa, não envia mensagens em segundo plano e não altera automaticamente o cadastro do cliente.
- A implementação está em `src/lib/communicationMessages.js`, `src/app/ReceivablesPage.jsx` e `src/app/WinbackPage.jsx`, integrada à navegação de `src/app/Dashboard.jsx`. Não foi necessária migration: a chave PIX é um dado público de recebimento usado pelo frontend, e a funcionalidade continua protegida por RLS e autenticação master.

### 20.7 Lucro estimativo de produtos

- A tela **Produtos e estoque** mostra o lucro estimado por peça no cadastro e três indicadores gerais: lucro médio por peça, margem média e lucro estimado do estoque.
- O preço vigente usado no cálculo é o `promotional_price` quando ele existe; caso contrário, usa o `sale_price`. O custo usado é o `cost_price` atual do produto.
- Lucro unitário estimado = preço vigente − custo de aquisição. Margem estimada = lucro unitário ÷ preço vigente × 100.
- O lucro médio por peça é a média aritmética do lucro unitário dos produtos ativos que possuem custo e preço maiores que zero. Não é uma média ponderada por estoque ou vendas.
- O lucro estimado em estoque = lucro unitário × quantidade atual em estoque, somado para os produtos elegíveis. Ele representa uma projeção caso todo o estoque seja vendido pelo preço vigente.
- Produtos sem custo informado ou sem preço válido continuam no catálogo, mas não entram nos indicadores e exibem **Informe o custo** no cartão.
- Os cálculos não descontam frete, taxas, impostos, descontos adicionais, custo financeiro, embalagem ou despesas operacionais. Portanto, o valor é uma estimativa bruta de catálogo, não lucro líquido nem lucro contábil.
- Alterar custo, preço promocional ou preço de venda atualiza a projeção do catálogo. Isso não altera snapshots de preço/custo já gravados em itens de pedidos e não reescreve o histórico financeiro.
- A implementação está em `src/app/ProductsPage.jsx` e `src/modules.css`. Não foi necessária migration ou alteração estrutural no banco.

### 20.8 Meta de vendas na Visão geral

- A seção **Meta do período** fica na aba principal e permite informar data inicial, data final e valor da meta.
- Existe uma única meta ativa por vez. Salvar outra meta encerra a anterior e cria o novo período, preservando o histórico para auditoria.
- O progresso é calculado no banco pela RPC `sales_goal_summary()`. Entram somente pedidos com `pedidos.payment_status = 'paid'`, `paid_at` preenchido e data local `America/Sao_Paulo` dentro do período da meta.
- Cada pedido quitado é contado uma única vez pelo valor total da venda. Pagamentos parciais e parcelas individuais não duplicam o progresso; a venda entra quando a última parcela quita o pedido.
- O card mostra percentual, total recebido em pedidos pagos, quantidade de pedidos e saldo restante. Ao voltar à Visão geral, atualizar ou recuperar o foco da janela, o resumo é consultado novamente.
- A gravação usa a RPC protegida `save_sales_goal(date,date,numeric,uuid)`, valida o período e o valor, exige sessão master válida e é idempotente pelo `p_request_id`.
- A tabela `metas_vendas` possui RLS, acesso de leitura apenas para equipe autorizada e alterações somente pela RPC. Cada criação/alteração é registrada na auditoria.
- Implementação: `src/app/Dashboard.jsx`, `src/styles.css` e `supabase/migrations/20260921000800_sales_goals.sql`.

### 20.9 Normalização, compressão e download de fotos

- O arquivo selecionado deve ser uma imagem que o navegador consiga decodificar. A interface usa `accept="image/*"`, mas formatos específicos podem depender do navegador; arquivos que não puderem ser lidos são rejeitados com mensagem clara. O limite do arquivo original antes do processamento é 25 MiB, para evitar processamento excessivo no navegador.
- O processamento ocorre no frontend antes do upload. O sistema desenha a imagem em canvas, aplica a orientação disponível, preserva a proporção e nunca aumenta as dimensões originais.
- A versão armazenada é sempre WebP (`image/webp`) com nome terminado em `.webp`. A dimensão máxima é 2400 px no maior lado. A primeira tentativa usa qualidade 90%; se o resultado ultrapassar o limite do bucket, o sistema reduz progressivamente a qualidade e, depois, a dimensão para 2000 px e 1600 px. A versão final deve ficar em até 5 MiB, limite do bucket privado `product-images`.
- O arquivo original não é enviado nem salvo no Supabase. Portanto, a regra reduz armazenamento, mas não garante restauração da qualidade original depois de uma conversão com perdas. Se no futuro for necessário preservar o original, será preciso uma decisão própria de armazenamento adicional e custo.
- A conversão é aplicada também às imagens antigas no momento do download, sem regravar o arquivo do bucket. Cada download autenticado permite escolher `JPG` ou `PNG`:
  - `JPG`: usa qualidade 92% e preenche transparência com branco, porque JPG não possui canal alfa;
  - `PNG`: preserva transparência e não aplica compressão com perdas.
- O cadastro/edição mantém a foto anterior quando uma nova foto é adicionada. Se a conversão, o upload ou a vinculação falhar, o produto continua salvo sem incentivar cadastro duplicado; a interface informa a falha separadamente. Se a vinculação falhar depois do upload, o sistema tenta remover o objeto órfão do bucket.
- A programação semanal de conteúdo usa o mesmo arquivo WebP privado e converte cada download para o formato escolhido na tela. A seleção aleatória, a regra de cinco fotos por dia e o bloqueio de repetição semanal não são alterados.
- Imagens animadas não têm sua animação garantida: quando o navegador as decodifica como um quadro, a versão normalizada será uma imagem estática.
- Implementação: `src/lib/imageProcessing.js`, `src/app/ProductsPage.jsx`, `src/app/ContentPage.jsx` e `src/modules.css`. Não foi necessária migration ou alteração de tabela. A regra deve ser atualizada neste documento antes de qualquer mudança futura nos formatos, limites, qualidade ou retenção do original.

### 20.10 Identidade visual e logo oficial

- A logo oficial da Finesse é o arquivo fornecido pelo proprietário e versionado em `src/assets/finesse-logo.png`.
- A arte deve ser exibida com fundo preto (`#000`), preservando a aparência prateada e o texto original da imagem.
- O sistema aplica a logo nos pontos de marca principais: tela de login, tela de definição de senha do convite, menu lateral desktop, menu lateral responsivo, cabeçalho móvel e tela de carregamento.
- O enquadramento é feito apenas por CSS, usando `object-fit: cover` e posicionamento vertical controlado para ocultar margens pretas vazias da imagem quadrada. O arquivo original não é editado nem redesenhado.
- A logo não deve ser substituída por texto, símbolo `F`, ícone genérico ou outra versão sem registrar nova revisão neste documento.
- Não há alteração de banco, autenticação ou regra de negócio. A implementação está em `src/app/App.jsx`, `src/app/AuthScreen.jsx`, `src/app/Dashboard.jsx`, `src/app/PasswordSetupScreen.jsx`, `src/styles.css` e `src/assets/finesse-logo.png`.

### 20.11 Composição visual da tela de login

- A direção visual aprovada para o acesso é **preto profundo**, porque integra melhor o fundo preto da logo com a proposta de joias em prata e evita que a arte pareça um cartão preto sobre um painel cinza.
- A paleta da tela usa painel preto, logo com fundo preto, texto branco/prateado e dourado discreto para os rótulos de destaque. O marrom não é a cor dominante; aparece somente em uma nuance quase imperceptível do gradiente para evitar uma tela chapada.
- A logo mantém a arte original enviada pelo proprietário. Não é permitido redesenhar letras, trocar o texto da marca ou gerar uma nova logo sem aprovação e nova revisão documental.
- O enquadramento da logo remove visualmente margens pretas vazias por CSS, mantém o painel sem borda aparente e preserva a leitura da marca em desktop e telas menores.
- O texto de apresentação continua separado da logo, com hierarquia: rótulo dourado, chamada principal branca e descrição em cinza-prateado. O rodapé permanece discreto para não competir com a marca.
- A implementação está em `src/styles.css`; não altera autenticação, dados, banco ou regras operacionais.
