---
documento: docs/PO-GUIDE
versão: 1.0
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: guia operacional
público: Product Owner + Antigravity (leitor secundário)
projeto: Enki
documento-superior: cursorrules.md v1.1 + prompt.md v1.1
modo: híbrido (manual atual + marcas [com enki] para automação futura)
---

# 📖 Guia do Product Owner — Projeto Enki

> Este é seu **manual operacional** como PO do Enki. Não é doc de
> referência — é guia de **uso diário**, denso e enciclopédico.
> Leia uma vez do início ao fim. Depois consulte por seção.
>
> **Leitor primário:** Aristóteles Soares Benício (PO).
> **Leitor secundário:** Antigravity (consulta quando recebe OS).
>
> **Pressuposto sobre automação:** o CLI `enki` (Sprint B) está
> especificado mas não implementado. As seções marcadas com
> `[com enki: ...]` indicam o que ficará automático quando a Fase 1
> do CLI for implementada.

---

## 🗺️ COMO USAR ESTE GUIA

### Por contexto de uso

| Situação | Vá direto para |
|---|---|
| "Não entendo quem é quem nesse sistema" | Camada 1 |
| "Preciso abrir uma OS agora" | Camada 2 + Camada 3 |
| "Antigravity me pediu decisão em um Gate" | Camada 2 §2.4 |
| "Algo deu errado, e agora?" | Camada 4 |
| "Quero parar de fazer trabalho manual" | Camada 5 |
| "Acho que algo está estranho no projeto" | Camada 6 |
| "Não conheço esse termo" | Glossário (Parte 4) |

### Convenções tipográficas

- `código` = comando shell ou nome de arquivo/regra
- **negrito** = ação que você executa
- _itálico_ = conceito sendo definido
- ⚠️ = atenção
- ⛔ = nunca faça
- ✅ = sempre faça
- 🤖 = trabalho do Antigravity
- 🏛️ = trabalho do Oráculo
- 👤 = seu trabalho como PO
- `[com enki: ...]` = ficará automático com o CLI

---

# 📐 CAMADA 1 — MAPA MENTAL

## 1.1. Os três atores

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│      👤 PO                  🏛️ Oráculo            🤖 Antigravity│
│      (você)                 (Claude)              (agente IA) │
│                                                              │
│      Decide                 Valida                Executa    │
│      o quê e por quê        forma e contexto      tecnicamente│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 1.1.a. Você (👤 PO)

| Faz | Não Faz |
|---|---|
| Decide objetivo de cada OS | Escreve código |
| Preenche briefing | Gera parâmetros (Bloco A) |
| Aprova/rejeita Gates | Materializa templates |
| Aceita ou rejeita riscos | Faz commits ou tags |
| Define DoD específica | Roda testes |
| Audita coerência periódica | Operações git/firebase |

> **Princípio:** seu valor é **decisão**, não **execução**. Toda vez
> que você se vê fazendo trabalho mecânico, é sintoma de processo
> mal-desenhado.

### 1.1.b. Oráculo (🏛️ Claude)

| Faz | Não Faz |
|---|---|
| Lê briefing + cursorrules + templates | Executa código |
| Escolhe template apropriado | Acessa repositório direto |
| Calcula parâmetros (Bloco A) | Faz commits/tags |
| Gera instrução ao Antigravity (Bloco B) | Decide aceitar risco |
| Sugere fatiamento se OS está grande | Aprova Gates |
| Aponta inconsistências com cursorrules | Toma ações de produção |

> **Princípio:** o Oráculo é **assessor**, não **executor**. Você o
> consulta antes da OS começar. Depois ele sai de cena até a
> próxima OS.

### 1.1.c. Antigravity (🤖 agente dev)

| Faz | Não Faz |
|---|---|
| Localiza template no repo | Pula validação Mustache |
| Renderiza Mustache | Pula Gates |
| Valida (dupla regex) | Aceita risco sozinho |
| Salva OS materializada | Modifica `cursorrules.md` |
| Executa etapas técnicas | Adiciona dependência fora de allowlist |
| Para em todo Gate | Refatora fora de escopo |
| Reporta incertezas honestamente | Esconde falhas |

> **Princípio:** o Antigravity é **executor disciplinado**. Toda
> liberdade que ele tem está enquadrada no template + cursorrules.

---

## 1.2. Onde mora cada coisa

```
projeto-enki/
│
├── cursorrules.md                    🏛️  CONSTITUIÇÃO (autoridade máxima)
├── prompt.md                         🏛️  PROTOCOLO DE OS
├── package.json                      🤖
├── firestore.rules                   🤖
├── .gitignore                        🤖  (regras macOS)
├── .gitattributes                    🤖  (eol=lf)
│
├── src/                              🤖  CÓDIGO DE PRODUÇÃO
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── ...
│
├── docs/
│   │
│   ├── PO-GUIDE.md                   👤  ESTE ARQUIVO
│   ├── REQUEST-OS-TEMPLATE.md        👤  BRIEFING (você preenche)
│   │
│   ├── templates/                    🏛️  MOLDES MUSTACHE
│   │   ├── README.md                 (referência)
│   │   ├── prompt-retomada.md        📐 livre
│   │   ├── exemplo-doc-sync.md       📘 docs
│   │   ├── exemplo-implementacao.md  📗 código
│   │   └── exemplo-governanca.md     📕 release
│   │
│   ├── orders/                       🤖  OSs MATERIALIZADAS
│   │   ├── OS-2026-10-05-appshell.md
│   │   └── ...
│   │
│   ├── orders-requests/              👤  BRIEFINGS ARQUIVADOS
│   │   ├── REQUEST-2026-10-05-appshell.md
│   │   └── ...
│   │
│   ├── audits/                       🤖  AUDITORIAS GERADAS
│   │   └── AUDIT-V17.3.md
│   │
│   ├── plans/                        👤  PLANOS MACRO
│   │   └── PLAN-V18.md
│   │
│   ├── diagnostics/                  👤🤖 DIAGNÓSTICOS
│   │
│   └── governance/                   👤  ADRs E SPECs
│       ├── SPEC-enki-cli.md
│       └── ADR-NNNN-*.md
│
├── reportStatus.md                   🤖  STATUS DO PROJETO
├── BACKLOG.md                        👤🤖 BACKLOG VIVO
├── README.md                         🤖  README DO REPO
└── CHANGELOG.md                      🤖  HISTÓRICO DE RELEASES
```

### Quem lê, quem escreve

| Arquivo | Quem lê | Quem escreve |
|---|---|---|
| `cursorrules.md` | 🤖🏛️ sempre | 👤 raramente (com ADR) |
| `prompt.md` | 🤖🏛️ sempre | 👤 raramente (com ADR) |
| `REQUEST-OS-TEMPLATE.md` | 👤 sempre | 👤 raramente (atualiza estrutura) |
| `docs/templates/*.md` | 🤖 sob demanda | 👤 raramente (com ADR) |
| `docs/orders/OS-*.md` | 🤖👤 | 🤖 |
| `docs/orders-requests/*.md` | 👤 | 👤 |
| `docs/audits/AUDIT-*.md` | 🤖👤 | 🤖 |
| `BACKLOG.md` | 👤🤖 | 🤖 (via OS) + 👤 (anotações) |
| `reportStatus.md` | 👤 | 🤖 (via OS) |
| `README.md` | público | 🤖 (via OS) |
| `CHANGELOG.md` | público | 🤖 (via OS de governança) |

---

## 1.3. O ciclo de vida de uma OS

```
                  📝              🏛️              🤖
   PREPARO ────► BRIEFING ────► OS GERADA ────► EXECUÇÃO
   (você)       (Oráculo)      (Antigravity)
     │              │              │              │
     ▼              ▼              ▼              ▼
   /tmp/         resposta       docs/         docs/
   briefing      do chat        orders/       audits/
                                              + commits
                                              + tags
                                                    │
                                                    ▼
                                              🚪 GATES ⛔
                                                    │
                                                    ▼
                                            ✅ CONCLUÍDA
                                            (arquivada)
```

### 1.3.a. Tempo médio típico (manual atual)

| Etapa | Tempo |
|---|---|
| 1. Preparar briefing | ~15 min |
| 2. Oráculo gera OS | ~2 min |
| 3. PO revisa Bloco A | ~3 min |
| 4. Antigravity materializa | ~1 min |
| 5. Execução (varia por perfil) | 10 min – várias horas |
| 6. Arquivamento | ~2 min |

**Total mínimo:** ~33 min para OS pequena de doc-sync.
**[com enki: ~7 min]** — economia de ~80% no preparo + arquivamento.

---

## 1.4. Os quatro perfis de OS

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📐 LIVRE                  Casos atípicos                  │
│   prompt-retomada.md        Quando nenhum outro serve       │
│   Risco: variável                                           │
│                                                             │
│   📘 DOC-SYNC               Atualizar BACKLOG/README/etc.   │
│   exemplo-doc-sync.md       SEM tocar código de produção    │
│   Risco: 🟢 baixo                                            │
│                                                             │
│   📗 IMPLEMENTAÇÃO          Codar 1 feature/fix             │
│   exemplo-implementacao.md  Escopo cirúrgico em código      │
│   Risco: 🟡 médio                                            │
│                                                             │
│   📕 GOVERNANÇA / RELEASE   Auditoria + correções + release │
│   exemplo-governanca.md     Bump de versão + tag + deploy   │
│   Risco: 🔴 alto                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **Regra mnemônica:** em caso de dúvida, escolha o de **maior
> rigor** (📕 > 📗 > 📘 > 📐). É mais fácil "abafar" rigor extra do
> que descobrir que faltou no meio da execução.

---

# 🎯 CAMADA 2 — DECISÕES DIÁRIAS DO PO

## 2.1. Decision tree — Qual template usar?

```
                    ┌──────────────────────────────┐
                    │ A OS produz código de        │
                    │ produção (.ts/.tsx/.css/etc)?│
                    └──────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              NÃO                    SIM
              │                       │
              ▼                       ▼
   ┌──────────────────┐   ┌──────────────────────────────┐
   │ É só docs/BACKLOG│   │ Toca múltiplos módulos OU    │
   │ /README/         │   │ faz release/bump de versão   │
   │ reportStatus?    │   │ OU gera AUDIT-*.md?          │
   └──────────────────┘   └──────────────────────────────┘
        │                          │
        ▼                  ┌───────┴───────┐
   📘 doc-sync             SIM             NÃO
                            │               │
                            ▼               ▼
                    📕 governanca   📗 implementacao

   Caso atípico que não cabe em nenhum dos 3 ──► 📐 prompt-retomada
```

### 2.1.a. Tabela de decisão rápida

| Sua tarefa | Template |
|---|---|
| "Atualizar BACKLOG.md com itens da última auditoria" | 📘 |
| "Atualizar README.md com nova versão" | 📘 |
| "Criar `AppShell.tsx` em `src/components/`" | 📗 |
| "Refatorar hook `useUser` para Zero-Trust TS" | 📗 |
| "Auditar Shadow Logic + corrigir críticos + fechar V18" | 📕 |
| "Bump de MAJOR com breaking changes documentados" | 📕 |
| "Investigar por que CI quebrou (sem commit ainda)" | 📐 |
| "Discutir arquitetura de novo módulo (ADR)" | 📐 |

### 2.1.b. Sinais de que você está usando o template errado

| Sintoma | Template provável | Trocar para |
|---|---|---|
| OS 📘 termina criando `.tsx` | escolha errada | 📗 |
| OS 📗 inclui `git tag -a` | escolha errada | 📕 |
| OS 📗 toca 3 módulos não-relacionados | escopo inflado | fatiar em 3 OSs 📗 |
| OS 📐 com Gates idênticos a 📗 padrão | uso indevido do livre | 📗 |
| OS 📕 sem `AUDIT-*.md` gerado | escolha errada | 📗 (se só fix) |

---

## 2.2. Pré-DoR — Como saber se o briefing está pronto

Antes de enviar ao Oráculo, verifique **mentalmente** (ou via
`enki briefing validate`):

```
┌─────────────────────────────────────────────────────────┐
│  Pré-DoR Checklist                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [ ] Objetivo cabe em UMA frase verificável?            │
│                                                         │
│  [ ] LISTA_NAO_INCLUI está preenchida?                  │
│      (sem ela, escopo será inflado)                     │
│                                                         │
│  [ ] LISTA_HIPOTESES declarada (ou "nenhuma")?          │
│                                                         │
│  [ ] Critérios de sucesso são MENSURÁVEIS?              │
│      (ruim: "ficar bom"                                 │
│       bom: "lint+typecheck verdes, CLS < 0.05")         │
│                                                         │
│  [ ] Dependências externas listadas?                    │
│                                                         │
│  [ ] OS NÃO acumula múltiplos perfis?                   │
│      (se acumula, fatie ANTES)                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

> **Regra:** se você não consegue marcar TODOS os checkboxes acima
> com confiança, o briefing **NÃO** está pronto. Refine antes de
> chamar o Oráculo.

`[com enki: enki briefing validate <path>]`

---

## 2.3. Como revisar o Bloco A do Oráculo

Quando o Oráculo responder com Bloco A + B, **não** aprove no
automático. Faça esta checagem rápida (~3 min):

```
┌─────────────────────────────────────────────────────────┐
│  Checklist de Revisão do Bloco A                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [ ] Template escolhido faz sentido para o objetivo?    │
│                                                         │
│  [ ] BRANCH_BASE é tag ou branch protegida?             │
│                                                         │
│  [ ] LISTA_ARQUIVOS_CRIAR / MODIFICAR estão no escopo?  │
│                                                         │
│  [ ] CURSORRULES_REFS cita seções RELEVANTES?           │
│      (não exaustivas — só as que se aplicam)            │
│                                                         │
│  [ ] LISTA_PROVENANCE_FONTES tem URLs OFICIAIS?         │
│      (não Stack Overflow, Medium, blog)                 │
│                                                         │
│  [ ] DOD_ITEMS específicos são VERIFICÁVEIS?            │
│      (não "fazer bem feito")                            │
│                                                         │
│  [ ] Se IF_TOCA_FIRESTORE_RULES = true, OS reconhece    │
│      isso explicitamente?                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.3.a. O que dizer ao Oráculo

| Situação | Comando |
|---|---|
| Tudo OK | "Aprovado" |
| Pequeno ajuste pontual | "Ajusta X em Y" |
| Muitos ajustes | "Refaz com foco em Z" |
| Escopo está grande demais | "Sugere fatiamento" |
| Template parece errado | "Por que escolheu 📗 e não 📕?" |

---

## 2.4. Como decidir em um Gate

Antigravity vai parar em pontos pré-definidos da OS pedindo decisão.
Existem 3 tipos de Gate por perfil:

### 2.4.a. Gates de implementação (📗)

| Gate | O que Antigravity apresenta | Sua decisão |
|---|---|---|
| Gate 1 | git diff + testes + verificações anti-vibe-coding | ✅ commit OU 🔧 ajustar OU ❌ abortar |
| Gate 2 | git log + push aceito + status CI | ✅ encerrar OS OU ➡️ próxima OS |

### 2.4.b. Gates de governança (📕)

| Gate | O que Antigravity apresenta | Sua decisão |
|---|---|---|
| Gate 1 | Resumo executivo da auditoria + TOP 5 críticos | Decidir quais Críticos: corrigir agora vs aceitar como risco |
| Gate 2 | Correções aplicadas + zero críticos pendentes | ✅ release OU 🔧 ajustar |
| Gate 3 | Commit + tag + push + deploy + smoke tests | ✅ encerrar OS |

### 2.4.c. Gates de doc-sync (📘)

| Gate | O que Antigravity apresenta | Sua decisão |
|---|---|---|
| Gate 1 | git diff dos arquivos docs | ✅ commitar OU 🔧 ajustar |
| Gate 2 | commit + push (+ tag se aplicável) | ✅ encerrar OS |

---

## 2.5. Quando aprovar vs rejeitar um Gate

```
                  ┌──────────────────────────┐
                  │ Antigravity apresentou   │
                  │ status no Gate           │
                  └──────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ Tudo prometido foi cumprido?  │
              └───────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              SIM                        NÃO
              │                           │
              ▼                           ▼
    ┌──────────────────┐         ┌──────────────────┐
    │ Verifiquei diff  │         │ É falha pequena  │
    │ + lint/test ok?  │         │ corrigível?      │
    └──────────────────┘         └──────────────────┘
              │                           │
       ┌──────┴──────┐             ┌──────┴──────┐
       SIM           NÃO          SIM           NÃO
       │             │             │             │
       ▼             ▼             ▼             ▼
   ✅ APROVAR   🔧 PEDIR        🔧 PEDIR    ❌ ABORTAR
                  PROVA           AJUSTE      a OS
                  EXPLÍCITA
```

### 2.5.a. Sinais de "aprovar com confiança"

- ✅ Diff é exatamente o esperado (não há arquivos extras).
- ✅ Lint + typecheck + test verdes (saída literal mostrada).
- ✅ Antigravity declarou as incertezas honestamente
  (`// TODO: provenance-pending`) e você decidiu sobre cada uma.
- ✅ Zero tokens proibidos no diff.
- ✅ `[PROVENANCE]` presente em decisões não-óbvias.

### 2.5.b. Sinais de "pedir mais prova antes de aprovar"

- ⚠️ Antigravity diz "testes verdes" mas não cola a saída literal.
- ⚠️ Diff mostra arquivos fora da `LISTA_ARQUIVOS_MODIFICAR`.
- ⚠️ Há `// TODO` ou `// FIXME` que não estavam declarados.
- ⚠️ Aparece dependência nova não autorizada.

### 2.5.c. Sinais de "abortar a OS"

- 🚫 Antigravity diz "vou pular validação" ou similar.
- 🚫 Há `any`, `@ts-ignore` introduzidos.
- 🚫 Houve refatoração fora de escopo "porque parecia óbvio".
- 🚫 Auditoria revelou Crítico não-declarado em DoR.
- 🚫 Antigravity ignorou Gate anterior e seguiu sozinho.

> **Princípio:** abortar uma OS **não é fracasso seu**. É evidência
> de que o sistema de governança funcionou. Releases ruins entregues
> são piores do que OSs abortadas.

---

## 2.6. Quando aceitar risco vs corrigir agora

Em OSs 📕 (governança), o Gate 1 te pede decisão sobre cada item
Crítico encontrado na auditoria. Use a matriz:

```
                  IMPACTO SE FALHAR
                  ┌─────────┬─────────┐
                  │  ALTO   │  BAIXO  │
       ┌──────────┼─────────┼─────────┤
       │  ALTO    │ CORRIGE │ ACEITA  │
EFORÇO │          │  AGORA  │  COM    │
DA     │          │         │ PRAZO   │
CORR.  ├──────────┼─────────┼─────────┤
       │  BAIXO   │ CORRIGE │ CORRIGE │
       │          │  AGORA  │  AGORA  │
       └──────────┴─────────┴─────────┘
```

### 2.6.a. Critérios para "aceitar como risco"

Aceite formalmente como risco APENAS se:

1. ✅ O item NÃO é de segurança crítica (XSS, Shadow Logic, segredos).
2. ✅ O risco está documentado em `BACKLOG.md` com tag
   `[PRIORIDADE: SEGURANÇA]`.
3. ✅ Há prazo declarado para endereçamento (próximo épico, p.ex.).
4. ✅ Você (PO) registra a decisão **por escrito** na OS.

### 2.6.b. NUNCA aceite como risco

- 🚫 Itens de **segurança crítica** (cursorrules §2 inteiro).
- 🚫 Shadow Logic ausente em coleção sensível (`users`, `boards`).
- 🚫 Segredos no client bundle.
- 🚫 XSS em campo de input livre.
- 🚫 `any` em código que toca autenticação/autorização.

> **Regra de ouro:** se a hesitação te dá frio na barriga, **não
> aceite**. Vá para correção agora ou aborte a OS.

---

🔚 **Fim da Parte 1/4.**

**📍 Próxima:** Parte 2/4 — Camada 3 (Cheat Sheet Shell completo).

Aguardo *"continua"* (ou *"ajusta X na Parte 1"*).