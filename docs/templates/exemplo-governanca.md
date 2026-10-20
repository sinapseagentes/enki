---
documento: docs/templates/exemplo-governanca
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: template
perfil: 📕 governança / release
projeto: Enki
documento-superior: cursorrules.md v1.1 + prompt.md v1.1
sintaxe: mustache.js v4.x
risco: 🔴 alto
---

{{! ============================================================ }}
{{! TEMPLATE: 📕 GOVERNANÇA / RELEASE (exemplo-governanca)       }}
{{! Versão: 1.1 | Engine: mustache.js v4.x                       }}
{{! Uso: auditoria sistêmica + correções + release com tag       }}
{{! ============================================================ }}

{{! ----------------------------------------------------------- }}
{{! INVENTÁRIO DE PARÂMETROS ESPERADOS                          }}
{{! ----------------------------------------------------------- }}
{{!                                                              }}
{{! OBRIGATÓRIOS:                                                }}
{{!   TITULO_OS                  string  - título imperativo    }}
{{!   DATA_UTC                   string  - YYYY-MM-DD            }}
{{!   SLUG                       string  - kebab-case            }}
{{!   OBJETIVO                   string  - 1 frase verificável   }}
{{!   CONTEXTO_VERSAO            string  - estado de versão      }}
{{!   ORIGEM_OS                  string  - de onde nasceu        }}
{{!   VERSAO_ATUAL               string  - versão antes          }}
{{!   VERSAO_NOVA                string  - versão a tagear       }}
{{!   TIPO_BUMP                  string  - MAJOR|MINOR|PATCH|BUILD}}
{{!   BRANCH_ALVO                string  - ex: chore/release-V18 }}
{{!   BRANCH_BASE                string  - ex: V17.3.0.0         }}
{{!   LISTA_INCLUI               array   - itens no escopo       }}
{{!   LISTA_NAO_INCLUI           array   - itens fora            }}
{{!   LISTA_DIRETORIOS_AUDITAR   array   - para varredura        }}
{{!   LISTA_REGRAS_VARRER        array   - regras cursorrules    }}
{{!   META_AUDITORIA             string  - caminho do AUDIT      }}
{{!   LISTA_STACK_VALIDAR        string  - pacotes para npm ls   }}
{{!   CURSORRULES_REFS           array   - seções aplicáveis     }}
{{!   LISTA_PROVENANCE_FONTES    array   - fontes oficiais       }}
{{!   TAG_NOME                   string  - tag anotada           }}
{{!   TAG_MENSAGEM               string  - mensagem da tag       }}
{{!   MENSAGEM_COMMIT            string  - commit Conventional   }}
{{!   DOD_ITEMS                  array   - critérios extras      }}
{{!                                                              }}
{{! OPCIONAIS (controlados por flags IF_):                       }}
{{!   IF_BUMP_MAJOR              bool    - breaking changes      }}
{{!   IF_BUMP_MINOR              bool    - feature add (v1.1:    }}
{{!                                       agora consumido)       }}
{{!   IF_REQUER_CORRECOES        bool    - Etapa 2 será executada}}
{{!   IF_REQUER_VALIDACAO_VISUAL bool    - check Safari/iOS      }}
{{!   IF_TOCA_FIRESTORE_RULES    bool    - revisão de rules      }}
{{!   IF_REQUER_HOTFIX_PLAN      bool    - plano hotfix pré-deploy}}
{{!   IF_DEPLOY_FIREBASE         bool    - inclui passos deploy  }}
{{!   LISTA_RISCOS_DECLARADOS    array   - riscos aceitos        }}
{{!   PLANO_HOTFIX               string  - se IF_REQUER_HOTFIX   }}
{{!   LISTA_BREAKING_CHANGES     array   - se IF_BUMP_MAJOR      }}
{{!   LISTA_FEATURE_NOTES        array   - se IF_BUMP_MINOR (NOVO}}
{{!                                       v1.1)                  }}
{{!   LISTA_MIGRATIONS           array   - migrações de dados    }}
{{!   LISTA_HIPOTESES            array   - hipóteses (§9.3)      }}
{{!   OBSERVACOES_LIVRES         string  - texto livre           }}
{{! ----------------------------------------------------------- }}

# ORDEM DE SERVIÇO: {{TITULO_OS}}

> **Perfil:** 📕 Governança / Release
> **Data UTC:** {{DATA_UTC}}
> **Template:** `exemplo-governanca.md` v1.1
> **Risco:** 🔴 Alto
> **Bump:** {{TIPO_BUMP}} (`{{VERSAO_ATUAL}}` → `{{VERSAO_NOVA}}`)

---

## 🎯 OBJETIVO

{{OBJETIVO}}

---

## 📍 CONTEXTO MÍNIMO

| Campo | Valor |
|---|---|
| Versão atual (antes) | `{{VERSAO_ATUAL}}` |
| Versão a tagear | `{{VERSAO_NOVA}}` |
| Tipo de bump | **{{TIPO_BUMP}}** |
| Branch base | `{{BRANCH_BASE}}` |
| Branch alvo | `{{BRANCH_ALVO}}` |
| Origem desta OS | {{ORIGEM_OS}} |
| Auditoria a gerar | `{{META_AUDITORIA}}` |
{{#IF_TOCA_FIRESTORE_RULES}}
| ⚠️ Toca `firestore.rules` | **SIM** — exige revisão de Shadow Logic + deploy ordenado |
{{/IF_TOCA_FIRESTORE_RULES}}
{{#IF_BUMP_MAJOR}}
| ⚠️ Bump MAJOR (breaking) | **SIM** — exige documentação de Breaking Changes |
{{/IF_BUMP_MAJOR}}
{{#IF_BUMP_MINOR}}
| ℹ️ Bump MINOR (feature) | **SIM** — exige Feature Notes documentadas |
{{/IF_BUMP_MINOR}}

{{#IF_BUMP_MAJOR}}
### Breaking Changes Declarados

{{#LISTA_BREAKING_CHANGES}}
- {{ITEM}}
{{/LISTA_BREAKING_CHANGES}}

> Bump MAJOR exige que cada breaking change esteja documentado neste
> bloco. Mudanças não-listadas detectadas durante a execução exigem
> abortar a OS e rever o escopo.
{{/IF_BUMP_MAJOR}}

{{#IF_BUMP_MINOR}}
### Feature Notes Declaradas (v1.1)

{{#LISTA_FEATURE_NOTES}}
- {{ITEM}}
{{/LISTA_FEATURE_NOTES}}

> Bump MINOR exige que cada feature adicionada esteja descrita neste
> bloco. Será registrada em `CHANGELOG.md` na Etapa 3.
{{/IF_BUMP_MINOR}}

{{#LISTA_MIGRATIONS}}
### Migrações Necessárias

{{#LISTA_MIGRATIONS}}
- {{ITEM}}
{{/LISTA_MIGRATIONS}}

> Migrações DEVEM ser idempotentes e reversíveis. Se houver migração
> destrutiva, exigir aprovação explícita adicional do Product Owner.
{{/LISTA_MIGRATIONS}}

---

## 🧭 ESCOPO

### ✅ INCLUI

{{#LISTA_INCLUI}}
- {{ITEM}}
{{/LISTA_INCLUI}}

### 🚫 NÃO INCLUI (proibido nesta OS)

{{#LISTA_NAO_INCLUI}}
- {{ITEM}}
{{/LISTA_NAO_INCLUI}}

> ⛔ Em caso de descoberta de itens fora do escopo durante a execução,
> abortar e abrir OS específica. NÃO acumular escopo nesta OS.

{{#LISTA_RISCOS_DECLARADOS}}
### Riscos Aceitos para Esta Release

{{#LISTA_RISCOS_DECLARADOS}}
- {{ITEM}}
{{/LISTA_RISCOS_DECLARADOS}}

> Riscos listados acima foram aceitos pelo Product Owner como dívida
> consciente. Devem ser registrados em `BACKLOG.md` com tag
> `[PRIORIDADE: SEGURANÇA]` ou equivalente para endereçamento futuro.
{{/LISTA_RISCOS_DECLARADOS}}

---

## ✅ DoR — Pré-condições do Pedido

Conforme `docs/REQUEST-OS-TEMPLATE.md §3.6`, esta OS só é executável se:

- [ ] `OBJETIVO` cabe em UMA frase verificável.
- [ ] `TIPO_BUMP` está coerente com `VERSAO_ATUAL → VERSAO_NOVA`
      (semver válido).
- [ ] `BRANCH_BASE` é tag ou branch protegida.
- [ ] `META_AUDITORIA` aponta para caminho em `docs/audits/`
      seguindo nomenclatura `AUDIT-<VERSAO>.md`.
- [ ] `LISTA_DIRETORIOS_AUDITAR` contém apenas diretórios existentes
      no repo.
- [ ] `LISTA_REGRAS_VARRER` referencia seções reais do
      `cursorrules.md`.
- [ ] `LISTA_INCLUI` e `LISTA_NAO_INCLUI` sem sobreposição.
- [ ] Auditoria anterior (se existir) está em `docs/audits/` e
      acessível.
{{#IF_BUMP_MAJOR}}
- [ ] `LISTA_BREAKING_CHANGES` tem ≥ 1 item (bump MAJOR sem
      breaking change é contradição).
{{/IF_BUMP_MAJOR}}
{{#IF_BUMP_MINOR}}
- [ ] `LISTA_FEATURE_NOTES` tem ≥ 1 item (bump MINOR sem feature
      é contradição).
{{/IF_BUMP_MINOR}}
{{#IF_DEPLOY_FIREBASE}}
- [ ] PO tem credenciais para `firebase deploy` no projeto.
- [ ] Janela de manutenção comunicada (se aplicável).
{{/IF_DEPLOY_FIREBASE}}
{{#IF_REQUER_HOTFIX_PLAN}}
- [ ] `PLANO_HOTFIX` preenchido com passos executáveis.
{{/IF_REQUER_HOTFIX_PLAN}}

> Se qualquer item da DoR não puder ser marcado, **abortar a
> execução** e devolver a OS ao Oráculo para revisão.

### 🚨 Sinais de que NÃO é caso de governanca

Se QUALQUER destes for verdadeiro, use outro template:

- A OS apenas atualiza docs/BACKLOG/README sem auditoria nem bump →
  `exemplo-doc-sync.md` (📘).
- A OS cria/altera código `.ts`/`.tsx` em escopo restrito SEM
  auditoria sistêmica → `exemplo-implementacao.md` (📗).
- A OS é uma **resposta a incidente em produção** com janela
  estreita → considerar criar template `exemplo-hotfix.md` (ainda
  não disponível — usar `prompt-retomada.md` 📐 com risco
  explicitamente declarado).

---

{{#LISTA_HIPOTESES}}
## 🤔 Hipóteses Assumidas (cursorrules §9.3)

Esta OS faz sentido sob as seguintes hipóteses. Se qualquer uma se
revelar falsa, **abortar e reportar**:

{{#LISTA_HIPOTESES}}
- {{ITEM}}
{{/LISTA_HIPOTESES}}

---
{{/LISTA_HIPOTESES}}

## 🔍 ETAPA 0 — VERIFICAÇÃO PRÉVIA

### 0.1. Branch e estado git

```bash
git checkout -b {{BRANCH_ALVO}} {{BRANCH_BASE}}
git status
git log --oneline -5
```

Confirmar:
- Branch criada exatamente a partir de `{{BRANCH_BASE}}`.
- Diretório de trabalho limpo.
- Últimos 5 commits coerentes com o estado declarado.

### 0.2. Validação de stack real (cursorrules §8.3 e §8.8)

```bash
npm ls {{LISTA_STACK_VALIDAR}}
```

Registrar saída literal. Em caso de divergência com `README.md`,
**ABORTAR**.

### 0.3. Higiene de ambiente (cursorrules §4)

Verificar `.gitignore` quanto a regras macOS:
- `.DS_Store`, `.AppleDouble`, `.LSOverride`, `Icon?`, `._*`
- `.env`, `.env.local`, `node_modules`, `dist`, `.vite`, `coverage`

Verificar `.gitattributes`:

```text
* text=auto eol=lf
```

Se ausentes, ADICIONAR antes de qualquer outra ação.

### 0.4. Reler regras aplicáveis do `cursorrules.md`

{{#CURSORRULES_REFS}}
- §{{REF}}
{{/CURSORRULES_REFS}}

### 0.5. Fontes de Provenance pré-aprovadas (cursorrules §8.7 + §9.1)

{{#LISTA_PROVENANCE_FONTES}}
- {{ITEM}}
{{/LISTA_PROVENANCE_FONTES}}

> 🤔 **Em caso de incerteza:** declarar honestamente conforme
> `cursorrules §9.1` em vez de fabricar plausibilidade. Marcar com
> `// TODO: provenance-pending` e registrar no Gate humano.

### 0.6. Confirmar disponibilidade de auditoria anterior

Se esta OS deriva de auditoria prévia, confirmar que o arquivo
referenciado existe e está acessível:

```bash
test -f {{META_AUDITORIA}} && echo "Auditoria: OK" || echo "Auditoria: AUSENTE"
```

### 0.7. Sinalizar divergências

Se qualquer item 0.1 a 0.6 apresentar divergência, **PARAR** e
consultar Product Owner antes de prosseguir.

---

## 🛠️ ETAPA 1 — AUDITORIA SISTÊMICA (Security Engineer Mode)

> Antes de qualquer modificação, ativar Security Engineer Mode
> conforme `cursorrules §5` — Comando de Desconfiança.

### 1.1. Escopo de varredura recursiva

Diretórios a auditar:

{{#LISTA_DIRETORIOS_AUDITAR}}
- `{{CAMINHO}}`
{{/LISTA_DIRETORIOS_AUDITAR}}

### 1.2. Regras a varrer

{{#LISTA_REGRAS_VARRER}}
- {{ITEM}}
{{/LISTA_REGRAS_VARRER}}

### 1.3. Formato de entrega da auditoria

Gerar arquivo: `{{META_AUDITORIA}}`

Estrutura obrigatória — tabela única com 5 colunas:

| Caminho:Linha | Severidade | Descrição | Recomendação | Regra Violada |

- **Severidade:** Crítico | Alto | Médio | Baixo
- **Regra Violada:** referenciar seção do cursorrules
  (ex.: §1.1, §2.2, §8.5)

### 1.4. Categorias de auditoria

#### 1.4.a. Layout / Rigid Shell (cursorrules §1)
- Buscar: `100vw`, `100vh`, `vw`, `vh` em CSS/Tailwind/inline.
- Buscar: `h-screen`, `w-screen`, `min-h-screen`.
- Sinalizar onde `dvh`/`svh`/`lvh` deveriam ser usados.
- Containers que quebrarão com a barra dinâmica do Safari iOS.
- Ausência de `env(safe-area-inset-*)` em PWA.
- Falta de `touch-action: pan-x pan-y` em áreas de scroll.
- Classes globais de tema no `body` (violação §1.4).

#### 1.4.b. Tipagem / Zero-Trust TS (cursorrules §3)
- Localizar: `any`, `unknown` sem narrowing, `as any`.
- Localizar: `@ts-ignore`, `@ts-expect-error` sem justificativa.
- Funções exportadas sem tipo de retorno explícito.
- Uso de `Function`, `Object`, `{}` como tipos.

#### 1.4.c. Segurança / Shadow Logic (cursorrules §2.1)
- Verificações de permissão no frontend sem espelho em
  `firestore.rules`.
- Coleções a auditar: `users`, `boards`, `admin`, `sessions`,
  `billing`, `audit_logs`.
- Itens sem espelhamento = severidade Crítico.

#### 1.4.d. Segurança / XSS (cursorrules §2.2)
- Renderizações de dados do usuário sem `DOMPurify`.
- Uso de `innerHTML`, `dangerouslySetInnerHTML` sem sanitização.
- Sanitização via regex manual (proibida).

#### 1.4.e. Segurança / Data Leakage (cursorrules §2.3)
- Selectors retornando objeto User completo onde 1 campo bastaria.
- E-mails/metadados internos visíveis no frontend.
- Logs do client expondo dados sensíveis.

#### 1.4.f. Segurança / Segredos (cursorrules §2.4)
- `process.env.*` exposto no client bundle.
- Tokens/JWT em `localStorage`/`sessionStorage`.
- Chaves hardcoded em código.

#### 1.4.g. Vibe Coding / Padrões Mortos (cursorrules §8.2)
- `var`, class components React em código novo.
- Lifecycles legados (`componentWillMount`, etc.).
- `moment.js`, `request`, `node-sass`, `enzyme`, jQuery.

#### 1.4.h. Vibe Coding / Antipadrões Memorizados (cursorrules §8.5)
- `try/catch` silencioso (engole erro sem log/throw).
- `JSON.parse` sem guard.
- Regex caseiro para email/URL/CPF.
- `eval`, `Function()` constructor, `setTimeout(string, ...)`.
- `Math.random()` em contexto security-sensitive.
- Comparação de token via `===` (timing attack).

#### 1.4.i. Vibe Coding / Cargo Cult Hooks (cursorrules §8.6)
- `useEffect` para estado derivado calculável.
- `useMemo`/`useCallback` sem profiling que justifique.
- `useState` para constante; `useRef` onde `useState` caberia.

#### 1.4.j. Vibe Coding / Dependências Suspeitas (cursorrules §8.4)
- Pacotes com último release > 12 meses.
- Pacotes com downloads semanais < 10k SEM auditoria documentada.
- Nomes similares a pacotes populares (typosquatting).

#### 1.4.k. Vibe Coding / Falta de Provenance (cursorrules §8.7)
- Decisões arquiteturais não-óbvias sem `// [PROVENANCE] ...`.
- `// TODO: provenance-pending` deixados sem resolução
  (cursorrules §9.2).

{{#IF_REQUER_VALIDACAO_VISUAL}}
#### 1.4.l. Acessibilidade / WCAG 2.2 AA (cursorrules §0.4)
- Auditoria leve: contraste, foco visível, landmarks, navegação por
  teclado, `aria-*` mal usados.
{{/IF_REQUER_VALIDACAO_VISUAL}}

### 1.5. Resumo executivo da auditoria

Ao final da varredura, gerar no topo do `{{META_AUDITORIA}}`:

```text
Resumo Executivo
Total de itens identificados: <N>
Por severidade:
  Crítico: <N>
  Alto: <N>
  Médio: <N>
  Baixo: <N>

Por categoria:
  1.4.a Layout / Rigid Shell: <N>
  1.4.b Tipagem / Zero-Trust TS: <N>
  1.4.c Shadow Logic: <N>
  1.4.d XSS / Sanitização: <N>
  1.4.e Data Leakage: <N>
  1.4.f Segredos: <N>
  1.4.g Padrões Mortos: <N>
  1.4.h Antipadrões Memorizados: <N>
  1.4.i Cargo Cult Hooks: <N>
  1.4.j Dependências Suspeitas: <N>
  1.4.k Falta de Provenance: <N>

Top 5 itens Críticos:
  1. <caminho:linha> — <descrição curta>
  2. ...
```

---
## 🚪 GATE 1 ⛔ — APROVAÇÃO DA AUDITORIA

**Quando:** Etapa 1 concluída, `{{META_AUDITORIA}}` salvo.

**Apresentar no chat:**

1. Resumo executivo completo (item 1.5).
2. Lista dos TOP 5 críticos com caminho:linha e regra violada.
3. **Bloco de incerteza (v1.1):** lista de pontos onde o agente
   declarou `// TODO: provenance-pending` durante a varredura,
   conforme `cursorrules §9.2`. Cada ponto exige decisão do PO:
   - (a) responder a incerteza;
   - (b) aceitar como hipótese e registrar em `LISTA_HIPOTESES`;
   - (c) abortar a OS.
4. Pergunta explícita ao Product Owner:
   - Quais itens Críticos serão corrigidos NESTA OS?
   - Quais itens Críticos serão aceitos como risco e registrados em
     `BACKLOG.md` com `[PRIORIDADE: SEGURANÇA]`?
   - Quais itens Altos/Médios/Baixos serão corrigidos NESTA OS?

**Aguardar:** decisão explícita do Product Owner sobre o escopo de
correções da Etapa 2.

> ⚠️ Itens Críticos NÃO endereçados (corrigidos OU aceitos
> formalmente) bloqueiam o release. A OS não pode prosseguir para
> Etapa 3 com Críticos pendentes silenciosamente
> (`cursorrules §7.2`).

---

{{#IF_REQUER_CORRECOES}}
## 🛠️ ETAPA 2 — APLICAÇÃO DE CORREÇÕES (após aprovação do Gate 1)

### 2.1. Princípio cirúrgico

Corrigir APENAS os itens explicitamente aprovados no Gate 1. Cada
correção deve:
- Referenciar o item da auditoria pelo identificador.
- Vir acompanhada de comentário inline (v1.1 — placeholders reais):

```ts
// [FIX] AUDIT-{{VERSAO_NOVA}}.md item {{ID_ITEM}} | {{DESCRICAO_CURTA}}
```

> 📌 **Nota v1.1:** o Antigravity DEVE substituir `{{ID_ITEM}}` pelo
> identificador real do item na auditoria (ex.: `1.4.c-03`) e
> `{{DESCRICAO_CURTA}}` por uma descrição de até 80 caracteres no
> momento da escrita do código. Comentário sem essas substituições
> viola `cursorrules §8.7` e §9.1.

- NÃO refatorar trechos adjacentes não-listados.

### 2.2. Ordem de aplicação

Aplicar correções na seguinte ordem de prioridade:

1. Críticos de Segurança (Shadow Logic, Segredos, XSS).
2. Críticos de Tipagem (`any`, narrowing).
3. Críticos de Layout (`100vh`/`100vw` em raiz).
4. Altos (mesma ordem por categoria).
5. Médios e Baixos (apenas se aprovados explicitamente).

### 2.3. Validação após cada categoria

Após corrigir cada categoria, executar:

```bash
npm run lint
npm run typecheck
npm test
```

Não prosseguir para próxima categoria com testes vermelhos.

### 2.4. Atualização do AUDIT

Após cada correção aplicada, atualizar `{{META_AUDITORIA}}` marcando
o item como `[CORRIGIDO]` com hash do commit (preenchido após Etapa 3).

### 2.5. Itens aceitos como risco

Para cada item Crítico aceito como risco no Gate 1, registrar em
`BACKLOG.md`:

```text
[PRIORIDADE: SEGURANÇA] <descrição>

Origem: AUDIT-{{VERSAO_NOVA}}.md item <ID_ITEM>
Regra: cursorrules §<seção>
Risco aceito em: {{DATA_UTC}} pelo Product Owner
```

{{#IF_TOCA_FIRESTORE_RULES}}
### 2.6. Atualização de `firestore.rules`

Se houve correção de Shadow Logic, atualizar `firestore.rules`
correspondente. Validar localmente:

```bash
firebase emulators:start --only firestore
npm run test:rules
```

> ⚠️ Rules NÃO devem ser deployadas nesta etapa. O deploy ocorre na
> Etapa 3, na ordem correta (rules antes do código).
{{/IF_TOCA_FIRESTORE_RULES}}

---

## 🚪 GATE 2 ⛔ — REVISÃO PRÉ-RELEASE

**Quando:** Etapa 2 concluída, todas as correções aplicadas.

**Apresentar no chat:**

1. Lista de itens corrigidos com referência ao AUDIT:

```bash
git diff --stat
```

2. Lista de itens aceitos como risco (registrados em `BACKLOG.md`).

3. Saída de:

```bash
npm run lint
npm run typecheck
npm test
```

Todos verdes.

4. Verificação final anti-vibe-coding:
- [ ] Nenhum `[PROVENANCE]` ausente em decisões não-óbvias.
- [ ] Nenhum `// TODO: provenance-pending` órfão.
- [ ] Nenhum `any` introduzido durante correções.
- [ ] Nenhuma dependência nova adicionada.
- [ ] Nenhum padrão morto introduzido.
- [ ] Todos os comentários `[FIX]` têm `ID_ITEM` e `DESCRICAO_CURTA`
      preenchidos (v1.1).

5. Status do AUDIT:
- Críticos: `<N corrigidos>` + `<N aceitos como risco>`
- Altos: `<N corrigidos>` + `<N pendentes>`
- Médios/Baixos: `<resumo>`

{{#IF_REQUER_VALIDACAO_VISUAL}}
6. Validação visual em Safari macOS + iOS + Chromium:
- Sem regressões visuais.
- Áreas afetadas pelas correções funcionando.
{{/IF_REQUER_VALIDACAO_VISUAL}}

{{#IF_TOCA_FIRESTORE_RULES}}
7. `firestore.rules`:
- Testes de rules passando no emulator.
- Diff das rules apresentado.
{{/IF_TOCA_FIRESTORE_RULES}}

8. Confirmação de zero Críticos pendentes (não corrigidos E não
   aceitos como risco). Esta é a condição inviolável para prosseguir.

**Aguardar:** aprovação explícita do Product Owner para Etapa 3
(Release).

> ⛔ Se houver QUALQUER Crítico pendente sem decisão formal, abortar.
> Release com Críticos silenciosos viola governança ISO 27001
> (cursorrules §0.1 + §7.2).

---
{{/IF_REQUER_CORRECOES}}

{{^IF_REQUER_CORRECOES}}
## ℹ️ ETAPA 2 — DISPENSADA

Esta OS foi configurada com `IF_REQUER_CORRECOES = false`. A
auditoria da Etapa 1 é puramente documental e não gera alterações
de código nesta OS.

Itens identificados na auditoria devem ser registrados em
`BACKLOG.md` para endereçamento em OSs futuras.

> ⚠️ Esta configuração só é aceitável se a auditoria não revelar
> itens Críticos. Se houver Críticos, a OS deve ser reconfigurada
> com `IF_REQUER_CORRECOES = true` ou os Críticos formalmente
> aceitos como risco no Gate 1.

---
{{/IF_REQUER_CORRECOES}}

## 🛠️ ETAPA 3 — RELEASE (após aprovação do Gate 2)

### 3.1. Sincronização documental

Atualizar arquivos canônicos com a nova versão:

- `BACKLOG.md`
  - Marcar épico/auditoria como `[ENTREGUE]` com data UTC.
  - Registrar referência à `{{VERSAO_NOVA}}`.
  - Adicionar itens `[PRIORIDADE: SEGURANÇA]` dos riscos aceitos.

- `README.md`
  - Atualizar versão para `{{VERSAO_NOVA}}`.
  - Stack documentada deve refletir `package.json` real (validar via
    `npm ls`).

{{#IF_BUMP_MAJOR}}
- `CHANGELOG.md` (e/ou `BREAKING-CHANGES.md`)
  - Documentar cada item de `LISTA_BREAKING_CHANGES`.
  - Incluir guia de migração se aplicável.
{{/IF_BUMP_MAJOR}}

{{#IF_BUMP_MINOR}}
- `CHANGELOG.md` (v1.1)
  - Documentar cada item de `LISTA_FEATURE_NOTES` sob seção
    "Added" do release `{{VERSAO_NOVA}}`.
{{/IF_BUMP_MINOR}}

- `reportStatus.md`
  - Bloco com data UTC `{{DATA_UTC}}`.
  - Resumo da auditoria (referenciar `{{META_AUDITORIA}}`).
  - Itens corrigidos vs aceitos como risco.
  - Próximos passos.

### 3.2. Stage seletivo

```bash
git add BACKLOG.md README.md reportStatus.md {{META_AUDITORIA}}
```

Adicionar arquivos de código corrigidos na Etapa 2 (ver lista do
Gate 2 item 1).

{{#IF_BUMP_MAJOR}}
Adicionar `CHANGELOG.md` (e/ou `BREAKING-CHANGES.md`):

```bash
git add CHANGELOG.md
```
{{/IF_BUMP_MAJOR}}

{{#IF_BUMP_MINOR}}
Adicionar `CHANGELOG.md`:

```bash
git add CHANGELOG.md
```
{{/IF_BUMP_MINOR}}

> NÃO usar `git add .` cego. Stage apenas arquivos do escopo
> declarado.

### 3.3. Commit Conventional

```bash
git commit -m "{{MENSAGEM_COMMIT}}

OS: docs/orders/OS-{{DATA_UTC}}-{{SLUG}}.md
Auditoria: {{META_AUDITORIA}}
Cursorrules: §{{#CURSORRULES_REFS}}{{REF}}, {{/CURSORRULES_REFS}}
Bump: {{TIPO_BUMP}} ({{VERSAO_ATUAL}} -> {{VERSAO_NOVA}})"
```

### 3.4. Atualização do AUDIT com hash

Após o commit, recuperar o hash:

```bash
HASH=$(git log -1 --format=%H)
```

Atualizar `{{META_AUDITORIA}}` substituindo cada placeholder de hash
pelos valores reais. Fazer commit adicional se necessário:

```bash
git add {{META_AUDITORIA}}
git commit -m "docs(audit): registra hashes de correção em {{META_AUDITORIA}}"
```

### 3.5. Tag anotada (cursorrules §7.3)

```bash
git tag -a {{TAG_NOME}} -m "{{TAG_MENSAGEM}}"
```

> Tag leve é proibida. Apenas anotada.

### 3.6. Push com follow-tags

```bash
git push -u origin {{BRANCH_ALVO}}
git push --follow-tags
```

{{#IF_DEPLOY_FIREBASE}}
### 3.7. Deploy Firebase (ordem CRÍTICA)

> ⚠️ Ordem inviolável: rules ANTES do código.

#### 3.7.a. Backup das rules atuais

```bash
firebase firestore:indexes > backup-indexes-{{DATA_UTC}}.json
firebase deploy --only firestore:rules --project <project-id> --dry-run
```

#### 3.7.b. Deploy das rules

```bash
firebase deploy --only firestore:rules --project <project-id>
```

Validar no console que as novas rules estão ativas.

#### 3.7.c. Deploy do código (apenas após rules OK)

```bash
firebase deploy --only hosting --project <project-id>
```

#### 3.7.d. Smoke test pós-deploy
- Login funciona.
- Boards carregam.
- Permissões respeitam novas rules.
{{/IF_DEPLOY_FIREBASE}}

{{#IF_REQUER_HOTFIX_PLAN}}
### 3.8. Plano de hotfix pré-aprovado

Plano caso problemas críticos sejam detectados pós-deploy:

{{PLANO_HOTFIX}}
{{/IF_REQUER_HOTFIX_PLAN}}

---

## 🚪 GATE 3 ⛔ — CONFIRMAÇÃO DE RELEASE

**Quando:** Etapa 3 concluída.

**Apresentar no chat:**

1. Saída de:

```bash
git log -2 --stat
```

(commit principal + commit de hashes do AUDIT).

2. Saída de:

```bash
git tag -n {{TAG_NOME}}
```

3. Confirmação de push aceito:

```bash
git ls-remote origin {{TAG_NOME}}
git ls-remote origin {{BRANCH_ALVO}}
```

4. Status do CI (se configurado): build + testes verdes.

{{#IF_DEPLOY_FIREBASE}}
5. Confirmação de deploy Firebase:
- Rules ativas (timestamp do deploy).
- Hosting ativa (URL e timestamp).
- Smoke tests passando.
{{/IF_DEPLOY_FIREBASE}}

6. URL pública de release notes ou referência à tag no remoto
   (GitHub/GitLab/Bitbucket).

7. Confirmação de que `BACKLOG.md`, `README.md` e `reportStatus.md`
   foram atualizados e refletem a nova versão.

**Aguardar:** confirmação humana de fechamento da OS.

> Após aprovação do Gate 3, a OS é considerada CONCLUÍDA. Reabrir
> exige nova OS de hotfix ou continuação.

---

## ✅ DEFINITION OF DONE

### Itens fixos (sempre verificáveis)

- [ ] DoR (Pré-condições) totalmente marcada
- [ ] Etapa 0: branch criada de `{{BRANCH_BASE}}` e stack validada
- [ ] `.gitignore` em conformidade com `cursorrules §4.1`
- [ ] `.gitattributes` em conformidade com `cursorrules §4.2`
- [ ] Auditoria gerada em `{{META_AUDITORIA}}` com 5 colunas e
      resumo executivo
- [ ] Gate 1 aprovado: PO decidiu escopo de correções
- [ ] Zero `// TODO: provenance-pending` órfãos
- [ ] Zero Críticos pendentes sem decisão formal
{{#IF_REQUER_CORRECOES}}
- [ ] Correções aplicadas com comentário `[FIX]` rastreável
      (com `ID_ITEM` e `DESCRICAO_CURTA` preenchidos — v1.1)
- [ ] Riscos aceitos registrados em `BACKLOG.md` com
      `[PRIORIDADE: SEGURANÇA]`
- [ ] Lint + typecheck + test verdes após Etapa 2
{{/IF_REQUER_CORRECOES}}
- [ ] Gate 2 aprovado: revisão pré-release completa
- [ ] `BACKLOG.md`, `README.md`, `reportStatus.md` atualizados com
      `{{VERSAO_NOVA}}` e dados REAIS
{{#IF_BUMP_MAJOR}}
- [ ] `CHANGELOG.md` documenta cada item de `LISTA_BREAKING_CHANGES`
{{/IF_BUMP_MAJOR}}
{{#IF_BUMP_MINOR}}
- [ ] `CHANGELOG.md` documenta cada item de `LISTA_FEATURE_NOTES`
{{/IF_BUMP_MINOR}}
- [ ] AUDIT atualizado com hashes de commit
- [ ] Tag anotada `{{TAG_NOME}}` criada (proibida tag leve)
- [ ] Push com `--follow-tags` aceito no remoto
{{#IF_DEPLOY_FIREBASE}}
- [ ] Deploy Firebase executado na ordem correta (rules antes do
      código)
- [ ] Smoke tests pós-deploy aprovados
{{/IF_DEPLOY_FIREBASE}}
- [ ] Gate 3 aprovado: release confirmado publicado
- [ ] Nenhuma dependência nova adicionada (a menos que listada
      explicitamente)
- [ ] Nenhum arquivo fora do escopo declarado foi alterado
- [ ] OS arquivada em `docs/orders/`

### Itens específicos desta OS

{{#DOD_ITEMS}}
- [ ] {{ITEM}}
{{/DOD_ITEMS}}

---

## 🔄 ROLLBACK

> ⚠️ Rollback de release publicada é operação delicada. Em
> ambientes que já consumiram a tag, a melhor prática é **avançar
> com hotfix** em vez de reverter. Use os cenários abaixo apenas em
> janela de tempo curta após publicação.

### Cenário A — Antes do push da tag (Etapa 3.6)

Tudo ainda local:

```bash
git tag -d {{TAG_NOME}}
git reset --hard {{BRANCH_BASE}}
git branch -D {{BRANCH_ALVO}}
```

Impacto: zero (nada chegou ao remoto).

### Cenário B — Após push, antes de qualquer deploy

Tag pública mas código não rodando em produção:

```bash
git tag -d {{TAG_NOME}}
git push --delete origin {{TAG_NOME}}
git push --delete origin {{BRANCH_ALVO}}
```

Impacto colateral conhecido:
- Tag deletada do remoto fica visível no histórico de operações git
  do servidor (auditável, esperado).
- Consumidores que clonaram a tag mantêm cópia local (órfã).
- Comunicar imediatamente ao time/stakeholders.

{{#IF_DEPLOY_FIREBASE}}
### Cenário C — Após deploy de rules (mas não código)

Reverter rules ANTES de deletar tag:

```bash
firebase deploy --only firestore:rules --project <project-id>
```

Validar que rules antigas voltaram. Depois aplicar Cenário B.

Impacto:
- Janela curta (segundos) onde rules novas ficaram ativas.
- Auditar logs de acesso nesse intervalo.

### Cenário D — Após deploy completo (rules + código)

Hotfix é preferível a rollback. Se rollback for inevitável:

1. Deploy do código anterior:

```bash
git checkout {{VERSAO_ATUAL}}
firebase deploy --only hosting --project <project-id>
```

2. Deploy das rules anteriores (após código):

```bash
firebase deploy --only firestore:rules --project <project-id>
```

> Atenção: ordem inversa do deploy normal. Aqui o código volta
> primeiro, rules depois, para evitar janela de incompatibilidade.

3. Aplicar Cenário B (delete da tag).

4. Abrir incidente formal e investigar causa raiz.

Impacto colateral:
- Dados criados no intervalo entre deploy e rollback podem ficar
  órfãos ou inconsistentes.
- Auditar `audit_logs` cuidadosamente.
- Considerar comunicação a usuários afetados.
{{/IF_DEPLOY_FIREBASE}}

### Após qualquer rollback

- [ ] Abrir OS de incidente em `docs/orders/` documentando causa.
- [ ] Atualizar `reportStatus.md` com bloco "Rollback {{DATA_UTC}}".
- [ ] Avaliar se itens da auditoria que motivaram a OS revertida
      precisam ser re-priorizados.
- [ ] Não reaplicar a mesma `TAG_NOME` (use `{{TAG_NOME}}-rev1` ou
      similar).

---

{{#OBSERVACOES_LIVRES}}
## 📌 OBSERVAÇÕES

{{OBSERVACOES_LIVRES}}

---
{{/OBSERVACOES_LIVRES}}

## 📎 RASTREABILIDADE

| Campo | Valor |
|---|---|
| OS arquivada em | `docs/orders/OS-{{DATA_UTC}}-{{SLUG}}.md` |
| Template usado | `exemplo-governanca.md` v1.1 |
| Versão antes | `{{VERSAO_ATUAL}}` |
| Versão depois | `{{VERSAO_NOVA}}` |
| Tipo de bump | {{TIPO_BUMP}} |
| Branch base | `{{BRANCH_BASE}}` |
| Branch alvo | `{{BRANCH_ALVO}}` |
| Tag publicada | `{{TAG_NOME}}` |
| Auditoria gerada | `{{META_AUDITORIA}}` |
| Origem do pedido | {{ORIGEM_OS}} |
| Documento superior | `cursorrules.md` v1.1 + `prompt.md` v1.1 |
| Engine de renderização | `mustache.js` ^4.2.0 |
| Briefing de pedido | `docs/orders-requests/REQUEST-{{DATA_UTC}}-{{SLUG}}.md` (se arquivado) |
{{#IF_BUMP_MAJOR}}
| Breaking Changes | Documentados em `CHANGELOG.md` |
{{/IF_BUMP_MAJOR}}
{{#IF_BUMP_MINOR}}
| Feature Notes | Documentadas em `CHANGELOG.md` |
{{/IF_BUMP_MINOR}}
{{#IF_DEPLOY_FIREBASE}}
| Deploy Firebase | rules + hosting (ordem rules-first) |
{{/IF_DEPLOY_FIREBASE}}

---

## 📜 HISTÓRICO DE MUDANÇAS DESTE TEMPLATE

### v1.1 — 2026-10-05
- Frontmatter YAML adicionado.
- Bloco DoR (Pré-condições do Pedido) adicionado.
- `LISTA_HIPOTESES` adicionada como parâmetro opcional renderizável.
- TODOS os blocos shell envelopados em ` ```bash `.
- **C-04 resolvido:** `IF_BUMP_MINOR` ganha bloco condicional próprio
  + `LISTA_FEATURE_NOTES` no inventário.
- **A-03 resolvido:** modelo do comentário `[FIX]` agora usa
  placeholders Mustache reais (`{{ID_ITEM}}`, `{{DESCRICAO_CURTA}}`).
- Notação `§` padronizada (P4 → §0.4).
- Seção "Sinais de que NÃO é caso de governanca" adicionada.
- Gate 1 expandido com bloco de incerteza (`cursorrules §9.2`).
- Item de DoD para `// TODO: provenance-pending` órfão adicionado.

### v1.0
- Versão inicial.