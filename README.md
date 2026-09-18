# Finesse Silver

Sistema web interno para auxiliar o controle de uma loja online de acessórios em prata 925.

## Fonte oficial do projeto

Toda regra de negócio, decisão de produto, estrutura de banco de dados, roadmap e alteração de escopo deve ser registrada em:

`DOCUMENTACAO-SISTEMA-FINESSE-SILVER.md`

O arquivo deve ser atualizado antes da implementação de qualquer mudança que altere o comportamento do sistema.

## Escopo inicial

- pedidos online;
- controle de estoque;
- controle financeiro contínuo;
- cobranças parceladas de clientes;
- mensagens prontas para copiar ou abrir no WhatsApp;
- seleção e calendário de conteúdo para Instagram;
- relatórios e auditoria.

O sistema não terá abertura ou fechamento de caixa, caixa por turno, leitor de códigos ou fluxo de balcão.

## Tecnologias planejadas

- React e TypeScript;
- Supabase/PostgreSQL;
- GitHub para versionamento;
- publicação inicial como frontend estático.

## Backend inicial

O backend está documentado e versionado em:

- `supabase/migrations/20260918000100_initial_backend.sql` — estrutura, regras e RLS;
- `supabase/seed.sql` — dados padrão para desenvolvimento;
- `supabase/README.md` — instruções para aplicar a migration;
- `.env.example` — variáveis públicas necessárias para conectar o frontend.

O protótipo antigo de conteúdo foi removido para iniciar a nova base do sistema. O frontend será criado depois que o proprietário definir a interface desejada.
