---
documento: docs/REQUEST-OS-TEMPLATE
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: briefing
projeto: Enki
documento-superior: cursorrules.md v1.1 + prompt.md v1.1
---

# 📨 Briefing de Pedido de Ordem de Serviço

> **Destinatário:** Oráculo de Delfos (LLM externa de validação)
> **Remetente:** Product Owner do Projeto Enki
> **Propósito:** Solicitar geração de uma nova OS parametrizada para
> execução pelo Antigravity.

---

## Como Usar Este Briefing

1. Copie este arquivo para uma mensagem nova ao Oráculo (ou para um
   arquivo temporário, ex.: `/tmp/briefing-hoje.md`).
2. Preencha cada campo abaixo (não deixe vazio — use `N/A` quando
   genuinamente não aplicável).
3. Cole as saídas de comando solicitadas no **Bloco 4**.
4. Envie ao Oráculo.
5. Aguarde resposta com **Bloco A** (parâmetros) + **Bloco B**
   (instrução ao Antigravity).
6. (Opcional, recomendado) Arquive este briefing preenchido em
   `docs/orders-requests/REQUEST-AAAA-MM-DD-slug.md`.

---

## BLOCO 1 — Identificação do Pedido

| Campo | Valor |
|---|---|
| Data UTC do pedido | `AAAA-MM-DD HH:MM` |
| Sessão de trabalho | ex.: "manhã do dia X" / "sprint 18 dia 3" |
| Quem solicita | ARISTÓTELES SOARES BENÍCIO |
| Ambiente atual | macOS / Windows / Linux |

---

## BLOCO 2 — Estado Atual do Projeto

### 2.1. Versão e Branch

| Campo | Valor |
|---|---|
| Última tag aplicada | ex.: `V17.3.0.0` |
| Branch atual de trabalho | ex.: `main` / `feat/appshell` |
| Há trabalho não-commitado? | Sim / Não |
| Se sim, descrever brevemente | ex.: "ajustes no AppShell em rascunho" |

### 2.2. Backlog Vigente

| Campo | Valor |
|---|---|
| Épico/Backlog ativo | ex.: "Backlog 18 — UI/UX Tabula Rasa" |
| Sub-épico em curso | ex.: "Sub-épico 1 — AppShell" |
| Sub-épicos pendentes | ex.: "Tokens, Headless, Skeletons" |

### 2.3. Itens Críticos Abertos

Lista breve de itens `[PRIORIDADE: SEGURANÇA]` ou Críticos da última
auditoria que ainda não foram endereçados:

- `<item 1, ou "nenhum">`
- `<item 2>`

---

## BLOCO 3 — Pedido em Si

### 3.1. Objetivo

| Campo | Valor |
|---|---|
| Objetivo em UMA frase | `<verbo no infinitivo + alvo + critério>` |
| Tipo presumido | 📘 Documentação / 📗 Implementação / 📕 Governança / 📐 Livre |
| Por que agora? | ex.: "Gate 2 do plano UI foi aprovado ontem" |

### 3.2. Origem da Demanda

De onde nasceu este pedido?

- [ ] Item de auditoria → referenciar arquivo: `<ex.: AUDIT-V17.3.md §2.4.b>`
- [ ] Plano aprovado → referenciar arquivo: `<ex.: PLAN-V18.md §2.1>`
- [ ] Backlog do épico atual
- [ ] Dívida técnica conhecida
- [ ] Iniciativa nova (sem origem documental ainda)
- [ ] Outro: `<descrever>`

### 3.3. Restrições e Limites

| Campo | Valor |
|---|---|
| Prazo desejado | `<data ou "sem prazo rígido">` |
| Dependências externas | ex.: "depende do bump do Tailwind para v4" |
| Escopo proibido (NÃO INCLUI) | `<itens que NÃO devem entrar nesta OS>` |
| Branch alvo sugerida | ex.: `feat/appshell-rigid-shell` |

### 3.4. Critérios de Sucesso

Como saberei que esta OS foi bem executada?

- `<critério 1, mensurável>`
- `<critério 2>`
- `<critério 3>`

### 3.5. Hipóteses Assumidas (LISTA_HIPOTESES) ⬅ NOVO v1.1

Conforme `cursorrules.md §9.3` e `prompt.md §5.2`, toda OS pode
declarar hipóteses não-óbvias. Hipóteses **não declaradas** são
consideradas inexistentes — o Antigravity **não assume tacitamente**.

Liste as hipóteses sob as quais esta OS faz sentido. Use `nenhuma`
quando genuinamente não houver:

- ex.: "Assumo que `firestore.rules` está sob controle de versão."
- ex.: "Assumo que o usuário tem acesso de admin para deploy."
- ex.: "Assumo que CI está configurado para rodar `npm test` em PRs."
- `<sua hipótese 4, ou "nenhuma">`

### 3.6. Pré-DoR — Declaração de Pré-Condições ⬅ NOVO v1.1

Antes de pedir a OS, confirme que as pré-condições estão atendidas:

- [ ] O **escopo** desta OS está claro o suficiente para 1 frase
      verificável (item 3.1).
- [ ] O **NÃO INCLUI** (item 3.3) está explicitamente preenchido.
- [ ] As **hipóteses não-óbvias** estão declaradas (item 3.5).
- [ ] Os **critérios de sucesso** são mensuráveis (item 3.4).
- [ ] As **dependências externas** foram listadas (item 3.3).
- [ ] Esta OS **não acumula múltiplos perfis** (📘/📗/📕/📐).
      Se acumular, fatiar antes de pedir.

> Se qualquer item da Pré-DoR não puder ser marcado, **reformule o
> pedido antes de enviar ao Oráculo**.

---

## BLOCO 4 — Anexos de Contexto (OBRIGATÓRIOS)

### 4.1. Árvore de OSs Executadas

Cole abaixo a saída literal de:

```bash
tree docs/orders/ 2>/dev/null || find docs/orders/ -maxdepth 2 -type f
```

```text
<colar saída aqui>
```

### 4.2. Tags Recentes

Cole abaixo a saída literal de:

```bash
git tag --list --sort=-version:refname | head -10
```

```text
<colar saída aqui>
```

### 4.3. Status do Git

Cole abaixo a saída literal de:

```bash
git status --short --branch
```

```text
<colar saída aqui>
```

### 4.4. Stack Real (apenas se a OS toca código)

Cole abaixo a saída literal de:

```bash
npm ls vite tailwindcss typescript react 2>/dev/null | head -20
```

```text
<colar saída aqui>
```

### 4.5. Trecho Relevante de AUDIT/PLAN (se aplicável)

Se a OS deriva de um item específico de auditoria ou plano, cole aqui
o trecho relevante (5–15 linhas) para o Oráculo não precisar adivinhar:

```text
<colar trecho aqui, ou "N/A">
```

### 4.6. Versões dos Artefatos Constitucionais ⬅ NOVO v1.1

Para garantir coerência entre OS gerada e regras vigentes:

| Artefato | Versão lida | Arquivo |
|---|---|---|
| `cursorrules.md` | ex.: 1.1 | raiz do repo |
| `prompt.md` | ex.: 1.1 | raiz do repo |
| `docs/templates/README.md` | ex.: 1.1 | docs/templates/ |

> Em caso de divergência entre versão lida pelo PO e versão vigente
> no repositório no momento da execução, o Antigravity DEVE abortar
> e reportar (conforme `cursorrules.md §10`).

---

## BLOCO 5 — Output Esperado do Oráculo

Marque o que você quer receber na resposta:

- [ ] Apenas os parâmetros calculados (Bloco A)
- [ ] Parâmetros + justificativa breve de cada um
- [ ] Parâmetros + matriz de riscos antes da OS final
- [ ] Parâmetros + sugestão de fatiamento se a OS estiver grande demais
- [ ] Parâmetros + alerta de itens potencialmente fora de escopo

### 5.1. Nível de Verbosidade

- [ ] Mínimo (só o essencial)
- [ ] Padrão (parâmetros + comentários inline críticos)
- [ ] Extenso (com racional de cada decisão)

### 5.2. Formato de Entrega

- [ ] Resposta única (um só bloco)
- [ ] Bloco A separado de Bloco B (recomendado para revisão)
- [ ] Bloco A em tabela + Bloco B em texto corrido

---

## BLOCO 6 — Observações Livres

Espaço para qualquer contexto que não coube acima:

```text
<texto livre, ou deixar vazio>
```

---

## ✅ Checklist de Submissão

Antes de enviar este briefing ao Oráculo, confirme:

- [ ] Bloco 1 totalmente preenchido
- [ ] Bloco 2 totalmente preenchido (sem "N/A" em Versão/Branch)
- [ ] Bloco 3.1 com objetivo em UMA frase verificável
- [ ] Bloco 3.5 (`LISTA_HIPOTESES`) preenchido (ou "nenhuma")
- [ ] Bloco 3.6 (Pré-DoR) com todos os checkboxes marcados
- [ ] Bloco 4.1 com saída de `tree docs/orders/` colada
- [ ] Bloco 4.2 com tags recentes coladas
- [ ] Bloco 4.3 com `git status` colado
- [ ] Bloco 4.4 preenchido se a OS toca código
- [ ] Bloco 4.6 com versões dos artefatos constitucionais
- [ ] Bloco 5 com pelo menos um checkbox marcado
- [ ] Briefing salvo em `docs/orders-requests/REQUEST-AAAA-MM-DD-slug.md`
      (opcional, mas recomendado para auditoria do próprio fluxo)

---

## 📌 Notas Importantes

1. **Não preencher os anexos do Bloco 4** = Oráculo opera no escuro
   e pode gerar OS inconsistente com o estado real. Resista à
   tentação de pular essa etapa.

2. **Briefing minimalista** é aceito apenas para OSs do tipo
   📐 Livre (molde `prompt-retomada.md`) ou para correções triviais
   (typos, pequenos fixes).

3. **O Oráculo NÃO executa nada** — apenas gera a OS parametrizada.
   Quem executa é o Antigravity, e somente após sua aprovação humana
   da OS gerada.

4. **Histórico de briefings** pode ser opcionalmente arquivado em
   `docs/orders-requests/` para rastreabilidade do próprio processo
   decisório (útil em auditoria ISO 42001).

---

# ============== FIM DO BRIEFING ==============

---

## 🔍 Anatomia do Briefing — Por Que Cada Bloco Existe

> Seção de referência. Não precisa ser preenchida — explica o
> racional para revisores futuros.

### Bloco 1 — Identificação
Resolve: "quando isto foi pedido e em que ambiente". Importante para
reproduzibilidade e para detectar pedidos antigos sendo reaproveitados
sem revisão.

### Bloco 2 — Estado Atual
Resolve: "em que ponto o projeto está agora". Sem isso, o Oráculo
pode gerar uma OS baseada em estado imaginado (vibe coding aplicado
a OS).

### Bloco 3 — Pedido
Resolve: "o quê e por quê". Forçar objetivo em **uma frase** evita
escopo inflado desde a origem.

- **Bloco 3.5 (Hipóteses):** captura pressupostos que, se falsos,
  invalidam a OS. Materializa `cursorrules §9.3`.
- **Bloco 3.6 (Pré-DoR):** garante que o briefing não chega ao
  Oráculo malformado. Espelha o checklist do `docs/templates/README.md`.

### Bloco 4 — Anexos (CRÍTICO)
Resolve: "que evidências objetivas você tem". `tree`, `git status`,
`npm ls` são **fatos** — não interpretação. Isso elimina a
necessidade de adivinhação do Oráculo.

### Bloco 5 — Output
Resolve: "o que você espera receber do Oráculo". Permite que o PO
module a verbosidade da resposta conforme a complexidade da OS.

### Bloco 6 — Observações
Válvula de escape para tudo que não cabe nos blocos rígidos.

---

## 💡 Sugestão de Diretório Adicional

O checklist menciona `docs/orders-requests/` como local opcional para
arquivar briefings. **Não é obrigatório**, mas é fortemente
recomendado porque:

- Cria histórico do próprio processo decisório.
- Em auditoria ISO 42001, é o tipo de evidência valorizada.
- Permite ver padrões de pedidos ao longo do tempo.

---

## 🎯 Fluxo de Uso na Prática

```
1. cp docs/REQUEST-OS-TEMPLATE.md /tmp/briefing-hoje.md
2. Preencher /tmp/briefing-hoje.md
3. Rodar os comandos do Bloco 4 e colar as saídas
4. Colar o conteúdo de /tmp/briefing-hoje.md em mensagem ao Oráculo
5. Receber a OS parametrizada (Bloco A + Bloco B)
6. Revisar Bloco A (parâmetros) — corrigir se necessário
7. Aprovar e enviar ao Antigravity
8. Antigravity materializa o template + valida + executa
```

---

## ⚠️ Pontos de Atenção

### 1. Tamanho do briefing
- Briefing completo pode passar de 200 linhas com os anexos colados.
- Isso é **intencional** — densidade de contexto é o que evita
  vibe coding.
- Em compensação, a OS gerada pelo Oráculo pode ser muito mais
  enxuta.

### 2. Briefings recorrentes
Para tarefas similares (ex.: vários sub-épicos do Backlog 18), você
pode manter um **briefing-base** e ajustar só os blocos 3 e 4.

### 3. Sigilo de anexos
- Cuidado ao colar saída de `git status` se houver paths sensíveis.
- Cuidado ao colar `npm ls` em projetos com pacotes privados.
- Opção: redactar manualmente antes de colar.

---

## 📜 HISTÓRICO DE MUDANÇAS

### v1.1 — 2026-10-05
- Frontmatter YAML adicionado.
- Artefatos de paste removidos (limpeza completa).
- **Bloco 3.5** (`LISTA_HIPOTESES`) adicionado (cursorrules §9.3).
- **Bloco 3.6** (Pré-DoR) adicionado.
- **Bloco 4.6** (versões dos artefatos constitucionais) adicionado.
- Blocos shell envelopados em ` ```bash `.
- Seção "Anatomia" reescrita e movida ao final.

### v1.0
- Versão inicial.