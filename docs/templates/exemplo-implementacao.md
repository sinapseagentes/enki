---
documento: docs/templates/exemplo-implementacao
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: template
perfil: 📗 implementação
projeto: Enki
documento-superior: cursorrules.md v1.1 + prompt.md v1.1
sintaxe: mustache.js v4.x
risco: 🟡 médio
---

{{! ============================================================ }}
{{! TEMPLATE: 📗 IMPLEMENTAÇÃO (exemplo-implementacao)           }}
{{! Versão: 1.1 | Engine: mustache.js v4.x                       }}
{{! Uso: codificar 1 feature/fix com escopo delimitado           }}
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
{{!   ORIGEM_OS                  string  - ex: PLAN-V18.md §2.1  }}
{{!   BRANCH_ALVO                string  - ex: feat/appshell     }}
{{!   BRANCH_BASE                string  - ex: V17.3.0.0         }}
{{!   LISTA_INCLUI               array   - itens no escopo       }}
{{!   LISTA_NAO_INCLUI           array   - itens fora do escopo  }}
{{!   LISTA_ARQUIVOS_CRIAR       array   - novos arquivos        }}
{{!   LISTA_ARQUIVOS_MODIFICAR   array   - arquivos a alterar    }}
{{!   LISTA_STACK_VALIDAR        string  - pacotes para npm ls   }}
{{!   LISTA_TESTES_OBRIGATORIOS  array   - cenários de teste     }}
{{!   CURSORRULES_REFS           array   - seções aplicáveis     }}
{{!   LISTA_PROVENANCE_FONTES    array   - fontes oficiais       }}
{{!   MENSAGEM_COMMIT            string  - commit Conventional   }}
{{!   DOD_ITEMS                  array   - critérios extras      }}
{{!                                                              }}
{{! OPCIONAIS (controlados por flags IF_):                       }}
{{!   IF_PR_NECESSARIO           bool    - gera PR formal        }}
{{!   IF_REQUER_VALIDACAO_VISUAL bool    - check Safari/iOS      }}
{{!   IF_REQUER_TESTES_E2E       bool    - inclui Playwright/Cyp }}
{{!   IF_TOCA_FIRESTORE_RULES    bool    - revisão de rules      }}
{{!   IF_BLOQUEIA_DEPS           bool    - proibição reforçada   }}
{{!   LISTA_GREP_PROIBICOES      array   - tokens proibidos      }}
{{!   LISTA_LIBS_PERMITIDAS      array   - allowlist de imports  }}
{{!   LISTA_HIPOTESES            array   - hipóteses (§9.3)      }}
{{!   OBSERVACOES_LIVRES         string  - texto livre           }}
{{! ----------------------------------------------------------- }}

# ORDEM DE SERVIÇO: {{TITULO_OS}}

> **Perfil:** 📗 Implementação
> **Data UTC:** {{DATA_UTC}}
> **Template:** `exemplo-implementacao.md` v1.1
> **Risco:** 🟡 Médio

---

## 🎯 OBJETIVO

{{OBJETIVO}}

---

## 📍 CONTEXTO MÍNIMO

| Campo | Valor |
|---|---|
| Estado de versão | {{CONTEXTO_VERSAO}} |
| Origem desta OS | {{ORIGEM_OS}} |
| Branch base | `{{BRANCH_BASE}}` |
| Branch alvo | `{{BRANCH_ALVO}}` |
{{#IF_TOCA_FIRESTORE_RULES}}
| ⚠️ Toca `firestore.rules` | **SIM** — exige revisão de Shadow Logic (`cursorrules §2.1`) |
{{/IF_TOCA_FIRESTORE_RULES}}

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

{{#IF_BLOQUEIA_DEPS}}
> ⛔ **Proibição reforçada:** esta OS NÃO autoriza adição de novas
> dependências. Se uma necessidade surgir durante a execução,
> abortar e abrir OS específica para avaliação da dependência.
{{/IF_BLOQUEIA_DEPS}}

{{#LISTA_LIBS_PERMITIDAS}}
### ✅ Allowlist de imports novos

Apenas as bibliotecas abaixo podem ser importadas em arquivos novos
desta OS:

{{#LISTA_LIBS_PERMITIDAS}}
- `{{ITEM}}`
{{/LISTA_LIBS_PERMITIDAS}}
{{/LISTA_LIBS_PERMITIDAS}}

{{#LISTA_GREP_PROIBICOES}}
### 🚫 Tokens proibidos no diff

Rejeitar commit se qualquer um dos tokens abaixo aparecer:

{{#LISTA_GREP_PROIBICOES}}
- `{{ITEM}}`
{{/LISTA_GREP_PROIBICOES}}
{{/LISTA_GREP_PROIBICOES}}

---

## ✅ DoR — Pré-condições do Pedido

Conforme `docs/REQUEST-OS-TEMPLATE.md §3.6`, esta OS só é executável
se:

- [ ] `OBJETIVO` cabe em UMA frase verificável.
- [ ] `LISTA_ARQUIVOS_CRIAR` e `LISTA_ARQUIVOS_MODIFICAR` têm
      caminhos plausíveis e existentes (ou marcados para criação).
- [ ] `LISTA_STACK_VALIDAR` lista os pacotes diretamente tocados
      pela OS (não toda a stack).
- [ ] `LISTA_TESTES_OBRIGATORIOS` define cenários verificáveis
      (não "testar bem").
- [ ] `CURSORRULES_REFS` referencia seções reais e aplicáveis.
- [ ] `LISTA_PROVENANCE_FONTES` aponta para URLs oficiais
      (não blogs/StackOverflow).
- [ ] `BRANCH_BASE` é tag ou branch protegida — não branch volátil.
- [ ] `LISTA_INCLUI` e `LISTA_NAO_INCLUI` sem sobreposição.
{{#IF_TOCA_FIRESTORE_RULES}}
- [ ] Toda nova lógica de permissão tem mapeamento prévio em
      `firestore.rules` (cursorrules §2.1 — Shadow Logic).
{{/IF_TOCA_FIRESTORE_RULES}}

> Se qualquer item da DoR não puder ser marcado, **abortar a
> execução** e devolver a OS ao Oráculo para revisão.

### 🚨 Sinais de que NÃO é caso de implementacao

Se QUALQUER destes for verdadeiro, use outro template:

- A OS apenas atualiza docs/BACKLOG/README → `exemplo-doc-sync.md` (📘).
- A OS faz auditoria sistêmica em múltiplos diretórios +
  bump de versão + tag de release → `exemplo-governanca.md` (📕).
- A OS toca MAIS DE UM módulo arquitetural simultaneamente →
  fatie em N OSs de 📗 dedicadas, OU use 📕 se for release.

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

### 0.1. Criar branch a partir da base correta

```bash
git checkout -b {{BRANCH_ALVO}} {{BRANCH_BASE}}
git status
```

Confirmar que a branch foi criada exatamente a partir de
`{{BRANCH_BASE}}` e que está limpa.

### 0.2. Validar stack real (cursorrules §8.3 e §8.8)

```bash
npm ls {{LISTA_STACK_VALIDAR}}
```

Registrar a saída literal. Se houver divergência com versões
esperadas (ex.: README declara Vite 8 mas instalado é Vite 7),
**ABORTAR** e reportar antes de codar.

### 0.3. Reler regras aplicáveis do `cursorrules.md`

{{#CURSORRULES_REFS}}
- §{{REF}}
{{/CURSORRULES_REFS}}

### 0.4. Reler bloco de proveniência + tratamento de incerteza

Esta OS exige `[PROVENANCE]` para decisões não-óbvias. Fontes oficiais
disponíveis para citação:

{{#LISTA_PROVENANCE_FONTES}}
- {{ITEM}}
{{/LISTA_PROVENANCE_FONTES}}

> 🤔 **Em caso de incerteza (cursorrules §9.1):** declarar
> honestamente em vez de fabricar. Marcar o ponto no código com
> `// TODO: provenance-pending` e registrar a pergunta no Gate
> humano mais próximo.

### 0.5. Sinalizar divergências

Se qualquer item 0.1 a 0.4 apresentar divergência ou dúvida, **PARAR**
e consultar Product Owner antes de prosseguir.

---

## 🛠️ ETAPA 1 — IMPLEMENTAÇÃO

### 1.1. Estrutura de arquivos a criar

{{#LISTA_ARQUIVOS_CRIAR}}
- `{{CAMINHO}}` — {{DESCRICAO}}
{{/LISTA_ARQUIVOS_CRIAR}}

### 1.2. Arquivos a modificar (escopo cirúrgico)

{{#LISTA_ARQUIVOS_MODIFICAR}}
- `{{CAMINHO}}` — {{DESCRICAO}}
{{/LISTA_ARQUIVOS_MODIFICAR}}

> ⚠️ Modificações DEVEM ser cirúrgicas. Não refatorar trechos fora
> do escopo declarado, mesmo que pareçam óbvios. Refatorações
> oportunistas violam o princípio de OS = unidade de mudança
> auditável.

### 1.3. Regras de implementação

#### 1.3.a. Tipagem (cursorrules §3 — Zero-Trust TS)
- Proibido `any`, `unknown` sem narrowing, `@ts-ignore`,
  `@ts-expect-error`.
- Funções exportadas com tipo de retorno explícito.
- Interfaces estritas para props e estados.

#### 1.3.b. Padrões de código (cursorrules §8.2 — Anti-Padrões)
- Function components only (proibido class components).
- `const`/`let` (proibido `var`).
- `async/await` (preferir sobre callbacks aninhados).
- Imports apenas de pacotes já em `package.json` (ou da allowlist).

#### 1.3.c. Provenance obrigatório (cursorrules §8.7)

Toda decisão não-óbvia DEVE vir com comentário inline:

```ts
// [PROVENANCE] <razão> | <fonte oficial> | {{DATA_UTC}}
```

Exemplo concreto:

```ts
// [PROVENANCE] React 19 use() preferred over useEffect for data fetching
//              | https://react.dev/reference/react/use | {{DATA_UTC}}
```

#### 1.3.d. Acessibilidade (cursorrules §0.4 — WCAG 2.2 AA)
- Landmarks semânticos (`<main>`, `<nav>`, `<header>`).
- Foco visível em elementos interativos.
- Contraste de cor ≥ 4.5:1 para texto normal.
- Navegação por teclado funcional.

{{#IF_TOCA_FIRESTORE_RULES}}
#### 1.3.e. Espelhamento de permissões (cursorrules §2.1 — Shadow Logic)
- Toda lógica de permissão no frontend DEVE ter regra correspondente
  em `firestore.rules`.
- Auditar: `users`, `boards`, `admin`, `sessions`, `billing`,
  `audit_logs`.
- Itens sem espelhamento = falha crítica, abortar Gate 1.
{{/IF_TOCA_FIRESTORE_RULES}}

### 1.4. Testes obrigatórios

{{#LISTA_TESTES_OBRIGATORIOS}}
- {{ITEM}}
{{/LISTA_TESTES_OBRIGATORIOS}}

Os testes devem rodar localmente antes do Gate 1:

```bash
npm run lint
npm run typecheck
npm test
```

{{#IF_REQUER_TESTES_E2E}}
Testes E2E também são obrigatórios:

```bash
npm run test:e2e
```
{{/IF_REQUER_TESTES_E2E}}

{{#IF_REQUER_VALIDACAO_VISUAL}}
### 1.5. Validação visual obrigatória

- Testar em **Safari macOS** (versão atual).
- Testar em **iOS Safari** (real device ou simulador).
- Testar em **Chromium** (Chrome/Edge atual).
- Verificar:
  - Sem scroll lateral em viewport mobile e desktop.
  - Sem salto na barra dinâmica do Safari iOS.
  - Notch / safe-area respeitados em PWA.
  - Áreas de scroll local funcionam isoladamente.
{{/IF_REQUER_VALIDACAO_VISUAL}}

---

## 🚪 GATE 1 ⛔ — REVISÃO PRÉ-COMMIT

**Quando:** Etapa 1 concluída, todos os testes verdes localmente.

**Apresentar no chat:**

1. Lista de arquivos criados/modificados:

```bash
git status
git diff --stat
```

2. Saída do test runner (todos verdes).

3. Saída de lint + typecheck (zero erros, zero warnings novos).

4. **Verificação de tokens proibidos:**

{{#LISTA_GREP_PROIBICOES}}
```bash
grep -RIn "{{ITEM}}" {{#LISTA_ARQUIVOS_CRIAR}}{{CAMINHO}} {{/LISTA_ARQUIVOS_CRIAR}}{{#LISTA_ARQUIVOS_MODIFICAR}}{{CAMINHO}} {{/LISTA_ARQUIVOS_MODIFICAR}}
```
{{/LISTA_GREP_PROIBICOES}}

Cada grep DEVE retornar zero ocorrências. Caso contrário, abortar.

5. Confirmação de presença de `[PROVENANCE]` em decisões não-óbvias.

6. **Auto-validação anti-vibe-coding** (cursorrules §8):

- [ ] Nenhum `any` introduzido sem ticket de débito.
- [ ] Nenhum padrão morto (var, class component, moment.js, etc.).
- [ ] Nenhuma dependência nova fora da allowlist.
- [ ] Nenhum `useEffect` para estado derivado calculável.
- [ ] Nenhum cargo cult (`useMemo`/`useCallback` sem profiling).
- [ ] Nenhum `// TODO: provenance-pending` deixado sem decisão.

{{#IF_REQUER_VALIDACAO_VISUAL}}
7. Validação visual em Safari + Chromium aprovada.
{{/IF_REQUER_VALIDACAO_VISUAL}}

{{#IF_TOCA_FIRESTORE_RULES}}
8. Confirmação de espelhamento Shadow Logic ↔ `firestore.rules`.
{{/IF_TOCA_FIRESTORE_RULES}}

**Aguardar:** aprovação explícita do Product Owner antes da Etapa 2.

---

## 🛠️ ETAPA 2 — VALIDAÇÃO LOCAL E COMMIT (após Gate 1)

### 2.1. Validações finais antes do commit

```bash
npm run lint
npm run typecheck
npm test
```

{{#IF_REQUER_TESTES_E2E}}
```bash
npm run test:e2e
```
{{/IF_REQUER_TESTES_E2E}}

Todas devem retornar zero erros e zero warnings novos.

### 2.2. Stage seletivo (não usar `git add .` cego)

```bash
git add {{#LISTA_ARQUIVOS_CRIAR}}{{CAMINHO}} {{/LISTA_ARQUIVOS_CRIAR}}{{#LISTA_ARQUIVOS_MODIFICAR}}{{CAMINHO}} {{/LISTA_ARQUIVOS_MODIFICAR}}
```

> ⚠️ NÃO commitar arquivos fora do escopo declarado, mesmo que
> `git status` mostre alterações adicionais. Se houver arquivos
> extras modificados, abortar e investigar a origem antes de
> prosseguir.

### 2.3. Commit Conventional

```bash
git commit -m "{{MENSAGEM_COMMIT}}

OS: docs/orders/OS-{{DATA_UTC}}-{{SLUG}}.md
Plano: {{ORIGEM_OS}}
Cursorrules: §{{#CURSORRULES_REFS}}{{REF}}, {{/CURSORRULES_REFS}}
Provenance: {{#LISTA_PROVENANCE_FONTES}}{{ITEM}}; {{/LISTA_PROVENANCE_FONTES}}"
```

### 2.4. Push para remoto

```bash
git push -u origin {{BRANCH_ALVO}}
```

{{#IF_PR_NECESSARIO}}
### 2.5. Abertura de Pull Request

Abrir PR de `{{BRANCH_ALVO}}` para `{{BRANCH_BASE}}` (ou branch
principal conforme política do projeto) com:

- **Título:** {{MENSAGEM_COMMIT}}
- **Descrição:** referenciar OS, plano e cursorrules.
- **Reviewers:** Product Owner.
- **Labels:** conforme convenção do repositório.
{{/IF_PR_NECESSARIO}}

---

## 🚪 GATE 2 ⛔ — CONFIRMAÇÃO DE PUSH

**Quando:** Etapa 2 concluída.

**Apresentar no chat:**

1. Saída de:

```bash
git log -1 --stat
```

2. Confirmação de push aceito no remoto:

```bash
git ls-remote origin {{BRANCH_ALVO}}
```

3. Saída do CI (se configurado): build verde, testes verdes.

{{#IF_PR_NECESSARIO}}
4. URL do Pull Request aberto.
5. Status dos checks automatizados do PR.
{{/IF_PR_NECESSARIO}}

**Aguardar:** aprovação humana para:
- merge (se PR), OU
- continuação para próxima OS (próximo sub-épico).

---

## ✅ DEFINITION OF DONE

### Itens fixos (sempre verificáveis)

- [ ] DoR (Pré-condições) totalmente marcada
- [ ] Etapa 0: branch criada de `{{BRANCH_BASE}}` e stack validada
- [ ] Arquivos criados conforme `LISTA_ARQUIVOS_CRIAR`
- [ ] Arquivos modificados conforme `LISTA_ARQUIVOS_MODIFICAR`
- [ ] Nenhum arquivo fora do escopo foi alterado
- [ ] Zero ocorrências de tokens proibidos (`LISTA_GREP_PROIBICOES`)
- [ ] Zero `any`/`unknown` sem narrowing (`cursorrules §3`)
- [ ] Toda decisão não-óbvia com `[PROVENANCE]` (`cursorrules §8.7`)
- [ ] Zero `// TODO: provenance-pending` órfãos (`cursorrules §9.2`)
- [ ] Lint + typecheck + test verdes
{{#IF_REQUER_TESTES_E2E}}
- [ ] Testes E2E verdes
{{/IF_REQUER_TESTES_E2E}}
{{#IF_REQUER_VALIDACAO_VISUAL}}
- [ ] Validação visual em Safari macOS + iOS + Chromium aprovada
{{/IF_REQUER_VALIDACAO_VISUAL}}
{{#IF_TOCA_FIRESTORE_RULES}}
- [ ] Shadow Logic espelhada em `firestore.rules` (`cursorrules §2.1`)
{{/IF_TOCA_FIRESTORE_RULES}}
- [ ] Gates 1 e 2 aprovados
- [ ] Commit Conventional com refs à OS, plano e cursorrules
- [ ] Branch publicada no remoto
{{#IF_PR_NECESSARIO}}
- [ ] Pull Request aberto e com checks verdes
{{/IF_PR_NECESSARIO}}
- [ ] Nenhuma dependência nova adicionada
- [ ] OS arquivada em `docs/orders/`

### Itens específicos desta OS

{{#DOD_ITEMS}}
- [ ] {{ITEM}}
{{/DOD_ITEMS}}

---

## 🔄 ROLLBACK

### Cenário A — antes do merge (branch ainda isolada)

```bash
git checkout {{BRANCH_BASE}}
git branch -D {{BRANCH_ALVO}}
git push origin --delete {{BRANCH_ALVO}}
```

Impacto: zero (branch nunca chegou ao código principal).

### Cenário B — após merge (já em branch principal)

```bash
git revert -m 1 <hash-do-merge>
git push
```

Impactos colaterais conhecidos:
- Revert visível no histórico (esperado e auditável).
- Componentes/hooks que dependiam do código revertido podem requerer
  ajuste — abrir OS de remediação se necessário.

{{#IF_TOCA_FIRESTORE_RULES}}
### Cenário C — `firestore.rules` em produção

Se as rules foram deployadas:

```bash
firebase deploy --only firestore:rules --project <project-id>
```

Restaurar versão anterior das rules ANTES de reverter o código, para
evitar janela de inconsistência permission ↔ código.
{{/IF_TOCA_FIRESTORE_RULES}}

### Após qualquer rollback

- [ ] Abrir OS de incidente em `docs/orders/` documentando causa.
- [ ] Atualizar `reportStatus.md` com bloco "Rollback {{DATA_UTC}}".
- [ ] Avaliar se itens da OS revertida precisam ser re-priorizados no
      `BACKLOG.md`.

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
| Template usado | `exemplo-implementacao.md` v1.1 |
| Branch base | `{{BRANCH_BASE}}` |
| Branch alvo | `{{BRANCH_ALVO}}` |
| Origem do pedido | {{ORIGEM_OS}} |
| Documento superior | `cursorrules.md` v1.1 + `prompt.md` v1.1 |
| Engine de renderização | `mustache.js` ^4.2.0 |
| Briefing de pedido | `docs/orders-requests/REQUEST-{{DATA_UTC}}-{{SLUG}}.md` (se arquivado) |

---

## 📜 HISTÓRICO DE MUDANÇAS DESTE TEMPLATE

### v1.1 — 2026-10-05
- Frontmatter YAML adicionado.
- Bloco DoR (Pré-condições do Pedido) adicionado.
- `LISTA_HIPOTESES` adicionada como parâmetro opcional renderizável.
- TODOS os blocos shell envelopados em ` ```bash ` (havia muitos
  soltos no v1.0).
- Seções Mustache `LISTA_LIBS_PERMITIDAS` e `LISTA_GREP_PROIBICOES`
  corrigidas (aninhamento ambíguo).
- Notação `§` padronizada (P4 → §0.4).
- Etapa 0.4 expandida com bloco de tratamento de incerteza
  (`cursorrules §9`).
- Item de DoD para `// TODO: provenance-pending` órfão adicionado.
- Seção "Sinais de que NÃO é caso de implementacao" adicionada.

### v1.0
- Versão inicial.