---
documento: docs/templates/exemplo-doc-sync
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: template
perfil: 📘 documentação
projeto: Enki
documento-superior: cursorrules.md v1.1 + prompt.md v1.1
sintaxe: mustache.js v4.x
risco: 🟢 baixo
---

{{! ============================================================ }}
{{! TEMPLATE: 📘 DOCUMENTAÇÃO (exemplo-doc-sync)                 }}
{{! Versão: 1.1 | Engine: mustache.js v4.x                       }}
{{! Uso: sync de BACKLOG/README/reportStatus + commit + tag opt  }}
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
{{!   ENTREGA_RECENTE        string  - o que foi concluído antes }}
{{!   ORIGEM_OS              string  - de onde nasceu o pedido   }}
{{!   VERSAO_ATUAL           string  - versão antes desta OS     }}
{{!   VERSAO_NOVA            string  - versão a ser registrada   }}
{{!   BRANCH_ALVO            string  - ex.: docs/sync-V17.3.1    }}
{{!   LISTA_INCLUI           array   - itens dentro do escopo    }}
{{!   LISTA_NAO_INCLUI       array   - itens fora do escopo      }}
{{!   LISTA_ARQUIVOS_DOCS    array   - arquivos a atualizar      }}
{{!   MENSAGEM_COMMIT        string  - msg Conventional Commits  }}
{{!   CURSORRULES_REFS       array   - seções aplicáveis         }}
{{!   DOD_ITEMS              array   - critérios verificáveis    }}
{{!                                                              }}
{{! OPCIONAIS (controlados por flags IF_):                       }}
{{!   IF_TAG_ANOTADA         bool    - inclui bloco de tag       }}
{{!   TAG_NOME               string  - se IF_TAG_ANOTADA         }}
{{!   TAG_MENSAGEM           string  - se IF_TAG_ANOTADA         }}
{{!   CHANGELOG_ENTRY        string  - se IF_TAG_ANOTADA (NOVO   }}
{{!                                    v1.1: obrigatório quando  }}
{{!                                    há tag)                   }}
{{!   IF_NOVO_EPICO          bool    - se cria novo épico        }}
{{!   NOVO_EPICO_NOME        string  - se IF_NOVO_EPICO          }}
{{!   NOVO_EPICO_DOR         array   - itens da DoR do novo épico}}
{{!   IF_REGISTRA_AUDITORIA  bool    - se referencia AUDIT-*.md  }}
{{!   AUDIT_REFERENCIADO     string  - caminho do AUDIT          }}
{{!   LISTA_ITENS_SEGURANCA  array   - itens [PRIORIDADE: SEG.]  }}
{{!   LISTA_HIPOTESES        array   - hipóteses não-óbvias      }}
{{!                                    (cursorrules §9.3)        }}
{{!   OBSERVACOES_LIVRES     string  - texto livre adicional     }}
{{! ----------------------------------------------------------- }}

# ORDEM DE SERVIÇO: {{TITULO_OS}}

> **Perfil:** 📘 Documentação
> **Data UTC:** {{DATA_UTC}}
> **Template:** `exemplo-doc-sync.md` v1.1
> **Risco:** 🟢 Baixo

---

## 🎯 OBJETIVO

{{OBJETIVO}}

---

## 📍 CONTEXTO MÍNIMO

| Campo | Valor |
|---|---|
| Versão atual (antes) | `{{VERSAO_ATUAL}}` |
| Versão a registrar | `{{VERSAO_NOVA}}` |
| Entrega recente | {{ENTREGA_RECENTE}} |
| Origem desta OS | {{ORIGEM_OS}} |
| Branch alvo | `{{BRANCH_ALVO}}` |

{{#IF_REGISTRA_AUDITORIA}}
**Auditoria referenciada:** `{{AUDIT_REFERENCIADO}}`
{{/IF_REGISTRA_AUDITORIA}}

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

> Em caso de dúvida sobre escopo, pausar e consultar Product Owner.

---

## ✅ DoR — Pré-condições do Pedido

Conforme `docs/REQUEST-OS-TEMPLATE.md §3.6`, esta OS só é executável
se:

- [ ] `OBJETIVO` cabe em UMA frase verificável.
- [ ] `LISTA_ARQUIVOS_DOCS` lista APENAS arquivos de documentação
      (não há `.tsx`, `.ts`, `.css` ou outro código de produção).
- [ ] `VERSAO_NOVA` segue convenção semver `vMAJOR.MINOR.PATCH.BUILD`.
- [ ] `LISTA_INCLUI` e `LISTA_NAO_INCLUI` sem sobreposição.
- [ ] `ENTREGA_RECENTE` referencia entregáveis reais (não promessas).
{{#IF_TAG_ANOTADA}}
- [ ] `CHANGELOG_ENTRY` preenchido (obrigatório quando há tag).
- [ ] `TAG_NOME` segue convenção `V<MAJOR>.<MINOR>.<PATCH>.<BUILD>`.
{{/IF_TAG_ANOTADA}}
{{#IF_NOVO_EPICO}}
- [ ] `NOVO_EPICO_DOR` tem ≥ 3 itens binários.
{{/IF_NOVO_EPICO}}

> Se qualquer item da DoR não puder ser marcado, **abortar a
> execução** e devolver a OS ao Oráculo para revisão.

### 🚨 Sinais de que NÃO é caso de doc-sync

Se QUALQUER destes for verdadeiro, use outro template:

- A OS modifica código `.ts`/`.tsx`/`.css` → usar `exemplo-implementacao.md` (📗).
- A OS faz auditoria sistêmica de múltiplos diretórios → usar
  `exemplo-governanca.md` (📕).
- A OS gera ou referencia `AUDIT-*.md` recém-criado E corrige código
  → usar `exemplo-governanca.md` (📕).

> Apenas a **referência** a um AUDIT existente (sem correções de
> código) cabe em 📘. Geração + correção exige 📕.

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

### 0.1. Confirmar branch limpa

```bash
git status
```

### 0.2. Verificar `.gitignore` (cursorrules §4.1)

Regras macOS obrigatórias:
- `.DS_Store`, `.AppleDouble`, `.LSOverride`, `Icon?`, `._*`
- `.env`, `.env.local`, `node_modules`, `dist`, `.vite`, `coverage`

Se ausentes, ADICIONAR antes de qualquer `git add`.

### 0.3. Verificar `.gitattributes` (cursorrules §4.2)

```text
* text=auto eol=lf
```

### 0.4. Reler regras aplicáveis do `cursorrules.md`

{{#CURSORRULES_REFS}}
- §{{REF}}
{{/CURSORRULES_REFS}}

### 0.5. Sinalizar QUALQUER divergência antes de prosseguir.

---

## 🛠️ ETAPA 1 — ATUALIZAÇÃO DOCUMENTAL

### 1.1. Arquivos a atualizar

{{#LISTA_ARQUIVOS_DOCS}}
- `{{CAMINHO}}` — {{DESCRICAO}}
{{/LISTA_ARQUIVOS_DOCS}}

### 1.2. `BACKLOG.md`

- Marcar épico anterior como **[ENTREGUE]** com data UTC `{{DATA_UTC}}`.
- Registrar referência à `{{VERSAO_NOVA}}`.

{{#IF_NOVO_EPICO}}
### 1.3. Novo Épico no `BACKLOG.md`

Criar entrada **{{NOVO_EPICO_NOME}}** com Definition of Ready (DoR)
mínima preenchida:

{{#NOVO_EPICO_DOR}}
- [ ] {{ITEM}}
{{/NOVO_EPICO_DOR}}

> Não criar histórias/tarefas executáveis nesta OS — apenas o épico
> com DoR.
{{/IF_NOVO_EPICO}}

{{#LISTA_ITENS_SEGURANCA}}
### 1.4. Itens `[PRIORIDADE: SEGURANÇA]`

Registrar no `BACKLOG.md` (cursorrules §7.1):

{{#LISTA_ITENS_SEGURANCA}}
- `[PRIORIDADE: SEGURANÇA]` {{ITEM}}
{{/LISTA_ITENS_SEGURANCA}}
{{/LISTA_ITENS_SEGURANCA}}

### 1.5. `README.md`

- Atualizar versão atual para `{{VERSAO_NOVA}}`.
- Garantir que stack documentada reflete o `package.json` real.
- Em caso de dúvida sobre versões, executar:

```bash
npm ls vite tailwindcss typescript react
```

antes de gravar.

### 1.6. `reportStatus.md`

Adicionar novo bloco com data UTC `{{DATA_UTC}}` contendo:

a) O que foi entregue: {{ENTREGA_RECENTE}}
b) Riscos abertos (referenciar AUDIT/diagnostics se houver).
c) Próximos passos (sem prometer datas sem base).

{{#IF_TAG_ANOTADA}}
### 1.7. Entry de CHANGELOG (obrigatório com tag — v1.1)

Adicionar ao `CHANGELOG.md` (criar se não existir) bloco com:

```markdown
## {{VERSAO_NOVA}} — {{DATA_UTC}}

{{CHANGELOG_ENTRY}}
```

> ⚠️ Conforme `docs/templates/README.md`, toda tag publicada exige
> entry de CHANGELOG rastreável. Mensagem de tag (`TAG_MENSAGEM`)
> não substitui o CHANGELOG.
{{/IF_TAG_ANOTADA}}

---

## 🚪 GATE 1 ⛔ — REVISÃO DE DIFF

**Quando:** Etapa 1 concluída.

**Apresentar no chat:**

1. Saída de:

```bash
git diff --stat
```

2. Resumo das mudanças por arquivo (1 linha cada).
3. Lista de itens `[PRIORIDADE: SEGURANÇA]` criados (se houver).
4. Confirmação de que NÃO foi alterado código de produção.
{{#IF_TAG_ANOTADA}}
5. Prévia do `CHANGELOG_ENTRY` que será gravado.
{{/IF_TAG_ANOTADA}}

**Aguardar:** aprovação explícita do Product Owner antes da Etapa 2.

---

## 🛠️ ETAPA 2 — REGISTRO GIT (após aprovação do Gate 1)

### 2.1. Stage seletivo (não usar `git add .` cego)

```bash
git add {{#LISTA_ARQUIVOS_DOCS}}{{CAMINHO}} {{/LISTA_ARQUIVOS_DOCS}}
```

{{#IF_TAG_ANOTADA}}
Adicionar também o `CHANGELOG.md`:

```bash
git add CHANGELOG.md
```
{{/IF_TAG_ANOTADA}}

### 2.2. Commit Conventional

```bash
git commit -m "{{MENSAGEM_COMMIT}}

OS: docs/orders/OS-{{DATA_UTC}}-{{SLUG}}.md
Cursorrules: §{{#CURSORRULES_REFS}}{{REF}}, {{/CURSORRULES_REFS}}
{{#IF_REGISTRA_AUDITORIA}}Refs: {{AUDIT_REFERENCIADO}}{{/IF_REGISTRA_AUDITORIA}}"
```

{{#IF_TAG_ANOTADA}}
### 2.3. Tag Anotada (cursorrules §7.3)

```bash
git tag -a {{TAG_NOME}} -m "{{TAG_MENSAGEM}}"
git push --follow-tags
```

> Tag leve é proibida. Apenas tags anotadas são aceitas para releases.
{{/IF_TAG_ANOTADA}}

{{^IF_TAG_ANOTADA}}
### 2.3. Push (sem tag nesta OS)

```bash
git push -u origin {{BRANCH_ALVO}}
```
{{/IF_TAG_ANOTADA}}

---

## 🚪 GATE 2 ⛔ — CONFIRMAÇÃO DE PUSH

**Quando:** Etapa 2 concluída.

**Apresentar no chat:**

1. Saída de:

```bash
git log -1 --stat
```

{{#IF_TAG_ANOTADA}}
2. Saída de:

```bash
git tag -n {{TAG_NOME}}
```

3. Confirmação de:

```bash
git ls-remote origin {{TAG_NOME}}
```
{{/IF_TAG_ANOTADA}}

{{^IF_TAG_ANOTADA}}
2. Confirmação de:

```bash
git ls-remote origin {{BRANCH_ALVO}}
```
{{/IF_TAG_ANOTADA}}

**Aguardar:** confirmação humana de fechamento da OS.

---

## ✅ DEFINITION OF DONE

### Itens fixos (sempre verificáveis)

- [ ] DoR (Pré-condições) totalmente marcada
- [ ] `.gitignore` em conformidade com `cursorrules §4.1`
- [ ] `.gitattributes` em conformidade com `cursorrules §4.2`
- [ ] `BACKLOG.md`, `README.md`, `reportStatus.md` atualizados com
      dados REAIS (não fictícios)
- [ ] Itens `[PRIORIDADE: SEGURANÇA]` registrados (se aplicável)
- [ ] Gate 1 aprovado (revisão de diff)
- [ ] Commit Conventional realizado com referência à OS e cursorrules
{{#IF_TAG_ANOTADA}}
- [ ] `CHANGELOG.md` atualizado com `CHANGELOG_ENTRY`
- [ ] Tag anotada `{{TAG_NOME}}` criada (proibida tag leve)
- [ ] Push com `--follow-tags` aceito no remoto
{{/IF_TAG_ANOTADA}}
- [ ] Gate 2 aprovado (confirmação de push)
- [ ] Nenhuma linha de código de produção alterada
- [ ] Nenhuma dependência adicionada
- [ ] OS arquivada em `docs/orders/`

### Itens específicos desta OS

{{#DOD_ITEMS}}
- [ ] {{ITEM}}
{{/DOD_ITEMS}}

---

## 🔄 ROLLBACK

> Como reverter em caso de problema:

{{#IF_TAG_ANOTADA}}
### Se a tag já foi pushada

```bash
git tag -d {{TAG_NOME}}
git push --delete origin {{TAG_NOME}}
```
{{/IF_TAG_ANOTADA}}

### Reverter o commit de docs

```bash
git revert <hash-do-commit>
git push
```

### Impactos colaterais conhecidos

- Nenhum em produção (alteração documental apenas).
- Histórico git terá commit de revert visível (auditável, esperado).
{{#IF_TAG_ANOTADA}}
- Tag deletada do remoto fica visível no histórico de operações git
  do servidor (auditável, esperado).
- Consumidores que clonaram a tag mantêm cópia local (órfã).
{{/IF_TAG_ANOTADA}}

### Após qualquer rollback

- [ ] Abrir OS de incidente em `docs/orders/` documentando causa.
- [ ] Atualizar `reportStatus.md` com bloco "Rollback {{DATA_UTC}}".
{{#IF_TAG_ANOTADA}}
- [ ] Não reaplicar a mesma `TAG_NOME` (use `{{TAG_NOME}}-rev1` ou
      similar).
{{/IF_TAG_ANOTADA}}

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
| Template usado | `exemplo-doc-sync.md` v1.1 |
| Versão antes | `{{VERSAO_ATUAL}}` |
| Versão depois | `{{VERSAO_NOVA}}` |
| Documento superior | `cursorrules.md` v1.1 + `prompt.md` v1.1 |
| Engine de renderização | `mustache.js` ^4.2.0 |
| Briefing de pedido | `docs/orders-requests/REQUEST-{{DATA_UTC}}-{{SLUG}}.md` (se arquivado) |

---

## 📜 HISTÓRICO DE MUDANÇAS DESTE TEMPLATE

### v1.1 — 2026-10-05
- Frontmatter YAML adicionado.
- Bloco DoR (Pré-condições do Pedido) adicionado.
- `LISTA_HIPOTESES` adicionada como parâmetro opcional renderizável.
- `CHANGELOG_ENTRY` obrigatório quando `IF_TAG_ANOTADA=true`
  (resolve A-05).
- Blocos shell envelopados em ` ```bash `.
- Bloco `IF_TAG_ANOTADA`/`^IF_TAG_ANOTADA` corrigido (era ambíguo).
- Notação `§` padronizada.
- Seção "Sinais de que NÃO é caso de doc-sync" adicionada.
- Rollback expandido com checklist pós-rollback.

### v1.0
- Versão inicial.