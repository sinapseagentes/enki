---
documento: docs/templates/README
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: orientação
projeto: Enki
documento-superior: cursorrules.md v1.1 + prompt.md v1.1
sintaxe-templates: mustache.js v4.x
---

# 📚 Templates de Ordens de Serviço (OS) — Projeto Enki

> **Camada:** Templates parametrizados (Camada 4 da arquitetura).
> **Autoridade superior:** `cursorrules.md` (v1.1) + `prompt.md` (v1.1).
> **Engine oficial:** `mustache.js` ^4.2.0.
> **Consumidores:** Antigravity (executa) e Oráculo (referencia).

Este diretório contém os **moldes parametrizados** que o Antigravity
materializa em OSs concretas, conforme parâmetros fornecidos pelo
Oráculo de Delfos a partir de briefings do Product Owner.

---

## 🧭 Visão Geral do Sistema

```
┌──────────────────────────────────────────────┐
│   SYSTEM PROMPT  (cursorrules.md + prompt.md)│
│   — Camada 1: autoridade constitucional      │
└──────────────────────────────────────────────┘
                    │
                    │  governa
                    ▼
┌──────────────────────────────────────────────┐
│   docs/REQUEST-OS-TEMPLATE.md                │
│   — Camada 2: briefing PO → Oráculo          │
└──────────────────────────────────────────────┘
                    │
                    │  alimenta
                    ▼
┌──────────────────────────────────────────────┐
│   Resposta do Oráculo                        │
│   — Camada 3: Bloco A (parâmetros)           │
│                Bloco B (instrução de         │
│                materialização)               │
└──────────────────────────────────────────────┘
                    │
                    │  executa contra
                    ▼
┌──────────────────────────────────────────────┐
│   docs/templates/   ← VOCÊ ESTÁ AQUI         │
│   — Camada 4: esqueletos {{Mustache}}        │
└──────────────────────────────────────────────┘
                    │
                    │  materializa em
                    ▼
┌──────────────────────────────────────────────┐
│   docs/orders/OS-AAAA-MM-DD-slug.md          │
│   — Camada 5: OS executada e arquivada       │
└──────────────────────────────────────────────┘
```

---

## 🗂️ Catálogo de Templates

| Arquivo | Perfil | Uso | Risco |
|---|---|---|---|
| `prompt-retomada.md` | 📐 Molde Livre | Casos atípicos sem template específico | Variável |
| `exemplo-doc-sync.md` | 📘 Documentação | Atualizar BACKLOG / README / reportStatus + commit + tag | 🟢 Baixo |
| `exemplo-implementacao.md` | 📗 Implementação | Codificar 1 feature/fix com escopo delimitado | 🟡 Médio |
| `exemplo-governanca.md` | 📕 Governança / Release | Auditoria sistêmica + correções + bump de versão + tag | 🔴 Alto |

> ⚠️ **Sobre o prefixo `exemplo-`:** apesar do nome, **estes não são
> exemplos** — são os templates oficiais. A renomeação para
> `template-doc-sync.md`, etc. está **diferida** aguardando ADR
> dedicado em `docs/governance/`. Mudar o nome implica atualizar
> todas as OSs já materializadas que referenciam o template — por
> isso a decisão é tratada como migração planejada.

---

## 🌳 Árvore de Decisão — Qual Template Usar?

```
                  ┌──────────────────────────────────┐
                  │ A OS produz código de produção?  │
                  └──────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
               NÃO                     SIM
                │                       │
                ▼                       ▼
       ┌────────────────┐    ┌──────────────────────────────┐
       │ É só docs?     │    │ Toca múltiplos módulos OU    │
       │                │    │ faz release/bump de versão?  │
       └────────────────┘    └──────────────────────────────┘
               │                         │
               ▼                  ┌──────┴──────┐
        📘 doc-sync              SIM           NÃO
                                  │             │
                                  ▼             ▼
                          📕 governanca   📗 implementacao

Caso atípico (não cabe em nenhum) ──► 📐 prompt-retomada
```

---

## 🎯 Sintaxe de Placeholders (Mustache, conforme `prompt.md §3.2`)

### Placeholder simples
```mustache
{{NOME_PARAMETRO}}
```
- Sempre em `UPPER_SNAKE_CASE`.
- Substituído por valor único (string, número, data).

### Lista (seção positiva)
```mustache
{{#LISTA_NOME}}
- {{ITEM}}
{{/LISTA_NOME}}
```
- Usado quando o parâmetro é um array.
- Bloco entre `{{#X}}` e `{{/X}}` é repetido para cada item.

### Condicional positiva
```mustache
{{#IF_TOCA_PRODUCAO}}
ROLLBACK obrigatório
{{/IF_TOCA_PRODUCAO}}
```
- Bloco incluído apenas se a flag for `true`.

### Condicional negativa
```mustache
{{^IF_REQUER_CORRECOES}}
Etapa 2 dispensada nesta OS.
{{/IF_REQUER_CORRECOES}}
```
- Bloco incluído apenas se a flag for `false`.

### Comentário interno
```mustache
{{! este texto não aparece no arquivo final }}
```
- Renderizado como vazio.
- Útil para documentar campos ao revisor humano.

---

## 🛡️ Regra Inviolável de Validação

Conforme `prompt.md §4`, antes de salvar qualquer OS materializada
em `docs/orders/`, o Antigravity DEVE executar **dois passos** de
validação:

### Passo 1 — Parâmetros não-resolvidos
```regex
\{\{(?![!#/^])[^}]+\}\}
```
Se houver QUALQUER ocorrência → ABORTAR (parâmetro faltando).

### Passo 2 — Seções remanescentes
```regex
\{\{[#/^][^}]+\}\}
```
Se houver QUALQUER ocorrência → ABORTAR (engine Mustache falhou).

> Esta regra impede que arquivos com `{{XYZ}}` literal vazem para o
> repositório, o que constituiria falha de governança ISO 27001/42001.

---

## 📋 Inventário Resumido de Parâmetros por Template

> A lista **completa e canônica** está no início de cada arquivo
> `.md` correspondente. O resumo abaixo serve para orientação
> rápida.

### 📐 `prompt-retomada.md` (molde livre)
- `TITULO_OS`, `OBJETIVO`, `DATA_UTC`, `SLUG`
- `LISTA_INCLUI`, `LISTA_NAO_INCLUI`
- `ETAPAS` (estrutura livre)
- `GATES` (mínimo 1)
- `CURSORRULES_REFS` (**obrigatório desde v1.1**)

### 📘 `exemplo-doc-sync.md`
- Identificação: `TITULO_OS`, `DATA_UTC`, `SLUG`
- Versão: `VERSAO_ATUAL`, `VERSAO_NOVA`
- Contexto: `ENTREGA_RECENTE`, `BRANCH_ALVO`
- Escopo: `LISTA_ARQUIVOS_DOCS`, `LISTA_INCLUI`, `LISTA_NAO_INCLUI`
- Opcionais: `IF_TAG_ANOTADA`, `TAG_NOME`, `TAG_MENSAGEM`, `CHANGELOG_ENTRY`
- Trilha: `MENSAGEM_COMMIT`, `CURSORRULES_REFS`

### 📗 `exemplo-implementacao.md`
- Identificação + Versão (idem acima)
- Escopo cirúrgico: `LISTA_ARQUIVOS_CRIAR`, `LISTA_ARQUIVOS_MODIFICAR`
- Stack: `LISTA_STACK_VALIDAR`, `LISTA_TESTES_OBRIGATORIOS`
- Provenance: `CURSORRULES_REFS`, `LISTA_PROVENANCE_FONTES`
- Opcionais: `IF_PR_NECESSARIO`, `IF_REQUER_VALIDACAO_VISUAL`,
  `IF_REQUER_TESTES_E2E`, `IF_TOCA_FIRESTORE_RULES`,
  `LISTA_LIBS_PERMITIDAS`, `LISTA_GREP_PROIBICOES`

### 📕 `exemplo-governanca.md`
- Todos os parâmetros do 📗 +
- Auditoria: `LISTA_DIRETORIOS_AUDITAR`, `LISTA_REGRAS_VARRER`,
  `META_AUDITORIA`
- Release: `TIPO_BUMP`, `TAG_NOME`, `TAG_MENSAGEM`
- Risco: `LISTA_RISCOS_DECLARADOS`, `LISTA_BREAKING_CHANGES`,
  `LISTA_MIGRATIONS`
- Opcionais: `IF_BUMP_MAJOR`, `IF_BUMP_MINOR`, `IF_REQUER_CORRECOES`,
  `IF_REQUER_HOTFIX_PLAN`, `IF_DEPLOY_FIREBASE`, `PLANO_HOTFIX`

---

## ✅ Checklist de Sanidade da OS Gerada

Antes de aprovar uma OS gerada pelo Oráculo, valide:

- [ ] **Objetivo** cabe em UMA frase verificável
- [ ] **Contexto mínimo** informa estado atual + origem da OS
- [ ] **DoR** (Definition of Ready) preenchida
- [ ] **NÃO INCLUI** preenchido (essencial — evita escopo inflado)
- [ ] **Etapa 0** (verificação prévia) está presente
- [ ] Há pelo menos **UM Gate humano** definido
- [ ] **Entregáveis** têm caminho definido
- [ ] **`[PROVENANCE]`** exigido para decisões não-óbvias
- [ ] **`LISTA_HIPOTESES`** declarada (ou explicitamente "nenhuma")
- [ ] **DoD** com itens binários (verificáveis)
- [ ] **ROLLBACK** preenchido se há mudança em produção
- [ ] **Referências ao `cursorrules.md`** por `§` (não copy/paste)
- [ ] **Todos os `{{PLACEHOLDERS}}`** foram substituídos por valores reais
- [ ] **Branch alvo** segue convenção do perfil

---

## 📐 Convenções de Nomenclatura

### OSs em `docs/orders/`
```
OS-AAAA-MM-DD-slug-curto.md
```

Exemplos:
- `OS-2026-06-10-appshell.md`
- `OS-2026-06-15-doc-sync-V18-rc1.md`
- `OS-2026-07-01-release-V18.md`

### Branches por perfil

| Perfil | Prefixo de branch |
|---|---|
| 📘 Documentação | `docs/<slug>` |
| 📗 Implementação | `feat/<slug>` ou `fix/<slug>` |
| 📕 Governança / Release | `chore/release-V<x.y.z>` |
| 📐 Livre | a critério da OS |

### Mensagem de commit (Conventional Commits)
```
<tipo>(<escopo>): <título curto>

<corpo opcional, explicando o "porquê">

OS: docs/orders/OS-AAAA-MM-DD-slug.md
Cursorrules: §<seções>
Refs: <AUDIT/PLAN/DIAGNOSIS relacionado>
```

Tipos canônicos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`,
`perf`, `build`, `ci`.

---

## 🔄 Ciclo de Vida de uma OS

```
Pedido         → você preenche docs/REQUEST-OS-TEMPLATE.md
                 e envia ao Oráculo
                       │
                       ▼
Geração        → Oráculo responde com Bloco A + Bloco B
                       │
                       ▼
Revisão        → você valida parâmetros (Bloco A)
                 [aqui você pode pedir ajustes ao Oráculo]
                       │
                       ▼
Materialização → Antigravity substitui {{...}} no template
                 e VALIDA via 2 regex (prompt.md §4)
                       │
                       ▼
Arquivamento   → Antigravity salva em docs/orders/
                       │
                       ▼
Execução       → Antigravity executa as etapas, parando nos Gates
                       │
                       ▼
Conclusão      → DoD verificada, OS marcada como [EXECUTADA]
                 commit/tag conforme aplicável
```

---

## 🗓️ Manutenção dos Templates

- **Revisão trimestral:** validar que templates refletem boas
  práticas vigentes.
- **Revisão imediata:** após qualquer auditoria que detecte falha de
  governança originada em template inadequado.
- **Mudança em template:** exige OS própria do perfil 📘 Documentação,
  com justificativa registrada em ADR (`docs/governance/ADR-NNNN-*.md`).
- **Versionamento:** mudanças significativas marcam o template com
  nova versão no frontmatter YAML.

---

## 🚫 Anti-Padrões a Evitar

### ❌ Não faça
- Editar manualmente uma OS já materializada para "consertar"
  placeholder esquecido.
- Pular o `docs/REQUEST-OS-TEMPLATE.md` por achar que "é uma tarefa
  simples".
- Usar `prompt-retomada.md` quando um dos 3 estruturados se aplica.
- Aprovar OS sem ler o Bloco A inteiro.
- Materializar OS sem rodar as **duas** validações regex.
- Misturar perfis (ex.: 📗 Implementação que também faz release →
  fatie em duas OSs).
- Reaproveitar literalmente OS antiga sem revalidar contra
  `cursorrules.md` vigente.

### ✅ Faça
- Resista a OSs grandes — fatie em sub-épicos.
- Use `[PROVENANCE]` mesmo quando parecer óbvio (auditoria futura
  agradece).
- Arquive briefings em `docs/orders-requests/` para rastreabilidade
  do processo decisório.
- Em dúvida sobre o template, escolha o de **maior rigor**
  (📕 > 📗 > 📘 > 📐).
- Declare `LISTA_HIPOTESES` quando houver pressuposto não-óbvio
  (cursorrules §9.3).

---

## 🆘 FAQ

**P: Posso editar um template diretamente sem passar por OS?**
R: Não. Mudanças em template exigem OS de perfil 📘 + ADR.

**P: O que faço se nenhum dos 3 templates estruturados serve?**
R: Use o `prompt-retomada.md` (📐 Livre). Mas reflita: talvez você
esteja diante de um padrão novo que merece um 5º template.

**P: O Oráculo pode propor um template novo?**
R: Pode propor, mas a criação exige sua aprovação + ADR + OS 📘.

**P: E se o Antigravity detectar inconsistência entre OS e cursorrules?**
R: Ele DEVE abortar e reportar antes de executar (ver
`cursorrules.md §10` — Hierarquia de Autoridade).

**P: Como reaproveito uma OS antiga similar?**
R: Não reaproveite o arquivo materializado — refaça o pedido ao
Oráculo apontando a OS antiga como referência. Isso garante que
mudanças no template ou cursorrules sejam incorporadas.

**P: O que faço se o Antigravity declarar incerteza durante uma OS?**
R: Conforme `cursorrules.md §9` e `prompt.md §5`, o Antigravity DEVE
parar e registrar a incerteza no Gate humano mais próximo. Sua
função como PO é decidir: (a) responder a incerteza; (b) abortar a
OS; ou (c) aceitar como hipótese e prosseguir, registrando em
`LISTA_HIPOTESES`.

**P: Por que existe um bloco "Definition of Ready" agora?**
R: Para evitar que OSs entrem em execução com pedido mal-formado. A
DoR força reflexão sobre pré-condições antes da Etapa 0 técnica.
Isso reduz drasticamente o risco de retrabalho.

---

## 🔗 Mapeamento Pilar → Seção (migração v1.0 → v1.1)

Quem lembra dos antigos `P1, P2, P3, P4` do `cursorrules.md` v1.0,
use a tabela abaixo para localizar o equivalente na v1.1:

| v1.0 | v1.1 | Tema |
|---|---|---|
| P1 | §0.1 | Privacidade por Padrão (ISO 27001) |
| P2 | §0.2 | Transparência e Ética Algorítmica (ISO 42001) |
| P3 | §0.3 | Arquitetura "Rigid Shell" |
| P4 | §0.4 | Acessibilidade por Padrão (WCAG 2.2 AA) |

---

## 📎 Arquivos Relacionados

- **Camada 1 (constitucional):** `cursorrules.md`, `prompt.md` (raiz)
- **Camada 2 (briefing):** `docs/REQUEST-OS-TEMPLATE.md`
- **Camada 4 (templates):** este diretório
- **Camada 5 (OSs executadas):** `docs/orders/`
- **Briefings históricos:** `docs/orders-requests/` (opcional)
- **ADRs:** `docs/governance/`
- **Auditorias:** `docs/audits/`
- **Diagnósticos:** `docs/diagnostics/`
- **Planos:** `docs/plans/`

---

## 📜 HISTÓRICO DE MUDANÇAS

### v1.1 — 2026-10-05
- Frontmatter YAML adicionado.
- Diagrama ASCII recriado (estava corrompido na v1.0).
- Tags HTML órfãs removidas.
- Engine Mustache referenciado oficialmente como `mustache.js v4.x`.
- Regex de validação atualizada (2 passos, conforme `prompt.md §4`).
- Notação `§` padronizada.
- Tabela de mapeamento Pilar → Seção adicionada.
- FAQ expandida (incerteza + DoR).

### v1.0
- Versão inicial.