---
documento: docs/templates/prompt-retomada
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: template
perfil: 📐 molde-livre
projeto: Enki
documento-superior: cursorrules.md v1.1 + prompt.md v1.1
sintaxe: mustache.js v4.x
risco: variável
---

{{! ============================================================ }}
{{! TEMPLATE: 📐 MOLDE LIVRE (prompt-retomada)                   }}
{{! Versão: 1.1 | Engine: mustache.js v4.x                       }}
{{! Uso: tarefas atípicas que não se encaixam nos 3 estruturados }}
{{! ============================================================ }}

{{! ----------------------------------------------------------- }}
{{! INVENTÁRIO DE PARÂMETROS ESPERADOS                          }}
{{! ----------------------------------------------------------- }}
{{!                                                              }}
{{! OBRIGATÓRIOS:                                                }}
{{!   TITULO_OS              string  - título imperativo curto   }}
{{!   DATA_UTC               string  - YYYY-MM-DD                }}
{{!   SLUG                   string  - kebab-case nome arquivo   }}
{{!   OBJETIVO               string  - 1 frase verificável       }}
{{!   CONTEXTO_ESTADO        string  - estado atual do projeto   }}
{{!   ORIGEM_OS              string  - de onde nasceu o pedido   }}
{{!   LISTA_INCLUI           array   - itens dentro do escopo    }}
{{!   LISTA_NAO_INCLUI       array   - itens fora do escopo      }}
{{!   ETAPAS                 array   - passos da execução        }}
{{!   GATES                  array   - pontos de aprovação (≥1)  }}
{{!   DOD_ITEMS              array   - critérios verificáveis    }}
{{!   CURSORRULES_REFS       array   - seções aplicáveis (NOVO   }}
{{!                                     v1.1: obrigatório aqui)  }}
{{!                                                              }}
{{! OPCIONAIS (controlados por flags IF_):                       }}
{{!   IF_TOCA_CODIGO         bool    - inclui Etapa 0 stack      }}
{{!   IF_TOCA_PRODUCAO       bool    - inclui ROLLBACK           }}
{{!   IF_GERA_COMMIT         bool    - inclui MENSAGEM_COMMIT    }}
{{!   IF_GERA_TAG            bool    - inclui TAG_NOME + msg     }}
{{!   IF_REQUER_PROVENANCE   bool    - exige bloco PROVENANCE    }}
{{!   BRANCH_ALVO            string  - se IF_TOCA_CODIGO         }}
{{!   LISTA_STACK_VALIDAR    string  - pacotes para npm ls       }}
{{!   LISTA_ARQUIVOS_COMMIT  array   - se IF_GERA_COMMIT         }}
{{!   MENSAGEM_COMMIT        string  - se IF_GERA_COMMIT         }}
{{!   TAG_NOME               string  - se IF_GERA_TAG            }}
{{!   TAG_MENSAGEM           string  - se IF_GERA_TAG            }}
{{!   ROLLBACK_COMANDOS      string  - se IF_TOCA_PRODUCAO       }}
{{!   ROLLBACK_IMPACTOS      string  - se IF_TOCA_PRODUCAO       }}
{{!   LISTA_HIPOTESES        array   - hipóteses não-óbvias      }}
{{!                                    (cursorrules §9.3)        }}
{{!   OBSERVACOES_LIVRES     string  - texto livre adicional     }}
{{! ----------------------------------------------------------- }}

# ORDEM DE SERVIÇO: {{TITULO_OS}}

> **Perfil:** 📐 Molde Livre
> **Data UTC:** {{DATA_UTC}}
> **Template:** `prompt-retomada.md` v1.1
> **Risco:** variável (declarar nas etapas)

---

## 🎯 OBJETIVO

{{OBJETIVO}}

---

## 📍 CONTEXTO MÍNIMO

**Estado atual do projeto:**
{{CONTEXTO_ESTADO}}

**Origem desta OS:**
{{ORIGEM_OS}}

{{#IF_TOCA_CODIGO}}
**Branch alvo:** `{{BRANCH_ALVO}}`
{{/IF_TOCA_CODIGO}}

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

---

## ✅ DoR — Pré-condições do Pedido

Conforme `docs/REQUEST-OS-TEMPLATE.md §3.6`, esta OS só é executável
se as pré-condições abaixo estiverem atendidas:

- [ ] Objetivo (`OBJETIVO`) cabe em UMA frase verificável.
- [ ] `LISTA_INCLUI` e `LISTA_NAO_INCLUI` preenchidas (sem
      sobreposição entre elas).
- [ ] Origem da OS (`ORIGEM_OS`) referenciada com caminho/§ exato.
- [ ] Pelo menos UM Gate humano definido em `GATES`.
- [ ] Aplicabilidade do 📐 Molde Livre justificada (esta OS de fato
      não se encaixa em 📘 / 📗 / 📕 — ver "Sinais" abaixo).
{{#IF_TOCA_CODIGO}}
- [ ] Stack relevante listada em `LISTA_STACK_VALIDAR`.
- [ ] Branch alvo (`BRANCH_ALVO`) segue convenção do perfil.
{{/IF_TOCA_CODIGO}}
{{#IF_TOCA_PRODUCAO}}
- [ ] `ROLLBACK_COMANDOS` e `ROLLBACK_IMPACTOS` preenchidos.
{{/IF_TOCA_PRODUCAO}}

> Se qualquer item da DoR não puder ser marcado, **abortar a
> execução** e devolver a OS ao Oráculo para revisão.

### 🚨 Sinais de que NÃO é caso de Molde Livre

Se QUALQUER destes for verdadeiro, esta OS deveria usar template
estruturado em vez de `prompt-retomada.md`:

- A OS só atualiza BACKLOG / README / reportStatus → usar
  `exemplo-doc-sync.md` (📘).
- A OS cria/altera arquivos `.tsx`/`.ts`/`.css` com escopo
  conhecido → usar `exemplo-implementacao.md` (📗).
- A OS faz bump de versão, gera AUDIT-*.md ou tag de release →
  usar `exemplo-governanca.md` (📕).

> Em caso de dúvida, escolha o template de **maior rigor** (📕 > 📗 >
> 📘 > 📐), conforme `docs/templates/README.md`.

---

{{#LISTA_HIPOTESES}}
## 🤔 Hipóteses Assumidas (cursorrules §9.3)

Esta OS faz sentido sob as seguintes hipóteses. Se qualquer uma se
revelar falsa durante a execução, **abortar e reportar**:

{{#LISTA_HIPOTESES}}
- {{ITEM}}
{{/LISTA_HIPOTESES}}

---
{{/LISTA_HIPOTESES}}

{{#IF_TOCA_CODIGO}}
## 🔍 ETAPA 0 — VERIFICAÇÃO PRÉVIA

### 0.1. Confirmar branch limpa

```bash
git status
```

### 0.2. Confirmar versões reais da stack relevante

```bash
npm ls {{LISTA_STACK_VALIDAR}}
```

Em caso de divergência com versões esperadas, **ABORTAR** e reportar
antes de prosseguir (cursorrules §8.3 e §8.8).

### 0.3. Reler regras aplicáveis do `cursorrules.md`

{{#CURSORRULES_REFS}}
- §{{REF}}
{{/CURSORRULES_REFS}}

### 0.4. Sinalizar QUALQUER divergência antes de prosseguir.

---
{{/IF_TOCA_CODIGO}}

{{^IF_TOCA_CODIGO}}
## 🔍 ETAPA 0 — VERIFICAÇÃO PRÉVIA (não-código)

### 0.1. Confirmar branch limpa

```bash
git status
```

### 0.2. Reler regras aplicáveis do `cursorrules.md`

{{#CURSORRULES_REFS}}
- §{{REF}}
{{/CURSORRULES_REFS}}

### 0.3. Sinalizar QUALQUER divergência antes de prosseguir.

---
{{/IF_TOCA_CODIGO}}

## 🛠️ ETAPAS DE EXECUÇÃO

{{#ETAPAS}}
### {{NUMERO}}. {{NOME}}

{{DESCRICAO}}

{{#ENTREGAVEL}}
**Entregável:** `{{CAMINHO}}`
{{/ENTREGAVEL}}

{{#INSTRUCOES}}
- {{ITEM}}
{{/INSTRUCOES}}

{{/ETAPAS}}

---

{{#IF_REQUER_PROVENANCE}}
## 🧠 PROVENANCE OBRIGATÓRIO

Toda decisão arquitetural não-óbvia introduzida por esta OS DEVE vir
acompanhada de comentário inline no formato:

```ts
// [PROVENANCE] <razão> | <fonte oficial> | <data>
```

Conforme `cursorrules.md §8.7` (Anti-Vibe-Coding).

Em caso de incerteza, declarar honestamente conforme `cursorrules.md
§9.1` em vez de fabricar plausibilidade.

---
{{/IF_REQUER_PROVENANCE}}

## 🚪 GATES DE APROVAÇÃO HUMANA

{{#GATES}}
### Gate {{NUMERO}} ⛔ — {{NOME}}

**Quando:** {{QUANDO}}

**Apresentar no chat:**
{{#APRESENTAR}}
- {{ITEM}}
{{/APRESENTAR}}

**Aguardar:** aprovação explícita do Product Owner antes de prosseguir.

{{/GATES}}

---

{{#IF_GERA_COMMIT}}
## 📝 COMMIT (após aprovação do último Gate)

```bash
git add {{#LISTA_ARQUIVOS_COMMIT}}{{ITEM}} {{/LISTA_ARQUIVOS_COMMIT}}
git commit -m "{{MENSAGEM_COMMIT}}

OS: docs/orders/OS-{{DATA_UTC}}-{{SLUG}}.md
Cursorrules: §{{#CURSORRULES_REFS}}{{REF}}, {{/CURSORRULES_REFS}}"
```

A mensagem deve seguir Conventional Commits e referenciar:
- OS arquivada em `docs/orders/`.
- Seções aplicáveis do `cursorrules.md`.

---
{{/IF_GERA_COMMIT}}

{{#IF_GERA_TAG}}
## 🏷️ TAG ANOTADA

```bash
git tag -a {{TAG_NOME}} -m "{{TAG_MENSAGEM}}"
git push --follow-tags
```

Conforme `cursorrules.md §7.3` — tag leve é proibida.

---
{{/IF_GERA_TAG}}

## ✅ DEFINITION OF DONE

{{#DOD_ITEMS}}
- [ ] {{ITEM}}
{{/DOD_ITEMS}}

### Itens fixos do perfil 📐

- [ ] DoR (Pré-condições do Pedido) totalmente marcada antes da Etapa 0.
- [ ] Todos os Gates definidos foram aprovados pelo Product Owner.
- [ ] `CURSORRULES_REFS` lido e respeitado.
{{#IF_TOCA_CODIGO}}
- [ ] Stack real validada via `npm ls` (cursorrules §8.8).
- [ ] Nenhum padrão morto introduzido (cursorrules §8.2).
- [ ] `[PROVENANCE]` presente em decisões não-óbvias (cursorrules §8.7).
{{/IF_TOCA_CODIGO}}
{{#IF_GERA_COMMIT}}
- [ ] Commit Conventional realizado com referência à OS e cursorrules.
{{/IF_GERA_COMMIT}}
{{#IF_GERA_TAG}}
- [ ] Tag anotada `{{TAG_NOME}}` criada (proibida tag leve).
{{/IF_GERA_TAG}}
- [ ] OS arquivada em `docs/orders/`.

---

{{#IF_TOCA_PRODUCAO}}
## 🔄 ROLLBACK

**Como reverter em caso de problema:**

```bash
{{ROLLBACK_COMANDOS}}
```

**Impactos colaterais conhecidos:**
{{ROLLBACK_IMPACTOS}}

### Após qualquer rollback

- [ ] Abrir OS de incidente em `docs/orders/` documentando causa.
- [ ] Atualizar `reportStatus.md` com bloco "Rollback {{DATA_UTC}}".
- [ ] Avaliar se itens originais da OS revertida precisam ser
      re-priorizados no `BACKLOG.md`.

---
{{/IF_TOCA_PRODUCAO}}

{{#OBSERVACOES_LIVRES}}
## 📌 OBSERVAÇÕES

{{OBSERVACOES_LIVRES}}

---
{{/OBSERVACOES_LIVRES}}

## 📎 RASTREABILIDADE

| Campo | Valor |
|---|---|
| OS arquivada em | `docs/orders/OS-{{DATA_UTC}}-{{SLUG}}.md` |
| Template usado | `prompt-retomada.md` v1.1 |
| Documento superior | `cursorrules.md` v1.1 + `prompt.md` v1.1 |
| Engine de renderização | `mustache.js` ^4.2.0 |
| Briefing de pedido | `docs/orders-requests/REQUEST-{{DATA_UTC}}-{{SLUG}}.md` (se arquivado) |

---

## 📜 HISTÓRICO DE MUDANÇAS DESTE TEMPLATE

### v1.1 — 2026-10-05
- Frontmatter YAML adicionado.
- `CURSORRULES_REFS` promovido a OBRIGATÓRIO no inventário.
- Bloco DoR (Pré-condições do Pedido) adicionado.
- `LISTA_HIPOTESES` adicionada como parâmetro opcional renderizável.
- Blocos shell envelopados em ` ```bash `.
- Tag HTML órfã removida.
- Mensagem de commit corrigida para usar `CURSORRULES_REFS` real.
- Seção "Sinais de que NÃO é caso de Molde Livre" adicionada.

### v1.0
- Versão inicial.