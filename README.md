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

- React e Vite (JavaScript na primeira fundação; TypeScript pode ser adotado na próxima refatoração);
- Supabase/PostgreSQL;
- GitHub para versionamento;
- publicação inicial como frontend estático.

## Backend inicial

O backend está documentado e versionado em:

- `supabase/migrations/20260918000100_initial_backend.sql` — estrutura, regras e RLS;
- `supabase/migrations/20260918000200_security.sql` — gates de master e operações idempotentes;
- `supabase/migrations/20260918000300_mvp_operations.sql` — imagens privadas, contato de cobrança e lançamentos financeiros manuais;
- `supabase/migrations/20260919000400_remove_mfa_requirement.sql` — remoção da exigência de MFA, mantendo master ativo e sessão válida;
- `supabase/migrations/20260919000500_portuguese_table_names.sql` — renomeação das tabelas e views de negócio para português;
- `supabase/seed.sql` — dados padrão para desenvolvimento;
- `supabase/README.md` — instruções para aplicar a migration;
- `.env.example` — variáveis públicas necessárias para conectar o frontend.

O protótipo antigo de conteúdo foi removido para iniciar a nova base do sistema. O frontend em `src/` agora possui login master por senha, dashboard, clientes, produtos/estoque, pedidos, cobranças, financeiro e calendário de conteúdo.

## Frontend local

```bash
npm install
npm run dev
```

O servidor local abre em `http://localhost:3000/`, que é o endereço usado pelo fluxo atual de convite.

Copie `.env.example` para `.env.local` e informe somente a URL do projeto e a chave publicável/anon do Supabase. Nunca informe a `service_role` no frontend.

O fluxo de recuperação de senha usa `VITE_AUTH_REDIRECT_URL`. O valor padrão é `https://gusttavoteles.github.io/sistemaFinesse/`, evitando que o link enviado por e-mail aponte para `localhost`. Se o sistema for publicado em outro endereço, atualize essa variável e inclua o endereço na lista de Redirect URLs do Supabase.

O comando `npm run build` gera `dist/` e também copia o `index.html` compilado e os assets para a raiz do repositório. Assim, o GitHub Pages configurado para publicar o ramo `main` pela raiz consegue localizar a entrada estática da aplicação.
