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
- `supabase/seed.sql` — dados padrão para desenvolvimento;
- `supabase/README.md` — instruções para aplicar a migration;
- `.env.example` — variáveis públicas necessárias para conectar o frontend.

O protótipo antigo de conteúdo foi removido para iniciar a nova base do sistema. A fundação do frontend está em `src/`, com login master/MFA, dashboard inicial, navegação dos módulos e estados vazios seguros.

## Frontend local

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env.local` e informe somente a URL do projeto e a chave publicável/anon do Supabase. Nunca informe a `service_role` no frontend.

O comando `npm run build` gera `dist/` e também copia o `index.html` compilado e os assets para a raiz do repositório. Assim, o GitHub Pages configurado para publicar o ramo `main` pela raiz consegue localizar a entrada estática da aplicação.
