---
documento: cursorrules
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: constitucional
projeto: Enki
sintaxe-templates: mustache.js v4.x
---

# 📜 REGRAS DE OURO — PROTOCOLO DE BLINDAGEM (Projeto Enki)

> Documento **constitucional** do projeto Enki. Toda Ordem de Serviço
> (`prompt.md` + templates de `docs/templates/`) é interpretada SOB
> estas regras. Em qualquer conflito, **este documento prevalece**.
>
> **Glossário:**
> - **Antigravity** = agente de codificação assistido por IA utilizado
>   como desenvolvedor neste projeto.
> - **Oráculo** = LLM externa de validação que gera Ordens de Serviço
>   parametrizadas a partir de briefings do Product Owner.
> - **Product Owner** = Aristóteles Soares Benício.

---

## §0. MANIFESTO (4 PILARES)

### §0.1. Privacidade por Padrão (ISO 27001)
- Toda interface é construída assumindo **ambiente do cliente hostil**.
- **Isolamento de Contexto:** temas, permissões e dados sensíveis são
  injetados via *Scoped Variables*. O visual de um Board "Escriba"
  nunca vaza para o contexto global.

### §0.2. Transparência e Ética Algorítmica (ISO 42001)
- Interfaces que usam IA devem expor **estado de processamento** e
  **origem dos dados**.
- Proibidas "alucinações de UI" e Layout Shifts não documentados.

### §0.3. Arquitetura "Rigid Shell"
- **Proibido transbordamento de viewport.** Layout = grid fixo e
  previsível.
- Scroll é recurso **local e controlado**. Eliminam-se vulnerabilidades
  de overlap e bugs de "tela branca".

### §0.4. Acessibilidade por Padrão
- **WCAG 2.2 AA** é o piso mínimo, validado em pipeline de CI.

---

## §1. 🏗️ ARQUITETURA DE INTERFACE (RIGID SHELL)

### §1.1. Morte ao `100vh` / `100vw` em containers internos
- Usar `dvh` (Dynamic Viewport Height) para compatibilidade Safari/iOS.
- Usar `svh` para telas fixas.
- Usar `lvh` apenas com justificativa documentada via `[PROVENANCE]`.

### §1.2. Viewport Lockdown
- `root` e `body` com `overflow: hidden`.
- Scroll permitido APENAS em containers `.pt-scroll-area` via CSS Grid.

### §1.3. PWA Mobile-First (macOS/iOS)
- `padding: env(safe-area-inset-*)` obrigatório (notches).
- `touch-action: pan-x pan-y` em áreas de scroll (evita "bounce"
  elástico que quebra Drag-and-Drop).

### §1.4. Isolamento de Temas (Scoped CSS)
- **Proibidas** classes globais de tema no `body`.
- Usar `data-theme="scribe"` ou `style={{ '--accent': ... }}` no
  container raiz do Board.

### §1.5. Skeletons (Layout Shift)
- Reservar espaço exato da UI final em Kanban / Tabela / Calendário.
- **Métrica:** CLS < 0.05 nas três visões.

### §1.6. Estética "Precision Tech"
- Densidade de informação alta.
- **Tipografia mono canônica:** `JetBrains Mono` como família
  primária; fallback: `ui-monospace, SFMono-Regular, "SF Mono",
  Menlo, Consolas, monospace`.
- Feedback visual imediato em escritas no Firestore.

> 📌 **Nota constitucional:** o token canônico foi fixado nesta
> revisão (v1.1) para remover débito anterior. Mudanças exigem ADR
> em `docs/governance/`.

---

## §2. 🔐 SEGURANÇA DE APLICAÇÃO

### §2.1. Shadow Logic (Espelhamento Frontend ↔ Firestore Rules)
- **Anti-Frontend-Security:** proibido confiar apenas em `if(user)`
  no React.
- Toda lógica de permissão **DEVE** ter regra equivalente em
  `firestore.rules`.
- **Database Rejection:** o banco rejeita leituras quando o UID não
  está em `board.members[]` (ou campo canônico equivalente no schema
  Enki).

### §2.2. Sanitização & Anti-XSS
- Todo input do usuário é tratado como **dado radioativo**.
- Sanitização **obrigatória via `DOMPurify`** (ou biblioteca auditada
  equivalente) antes de renderização no DOM.
- **Proibida** sanitização via regex manual.
- Aplicação sistemática em títulos, descrições e qualquer campo livre.

### §2.3. Data Leakage (Selectors Mínimos)
- Auditar selectors: buscar APENAS o campo necessário.
  - ✅ `useUserPhotoURL(uid)`
  - ❌ `useUser(uid).photoURL`
- E-mails e metadados internos **não podem** vazar ao frontend.

### §2.4. Política de Segredos
- **Proibido** segredo no client bundle (`process.env.*` exposto,
  chaves em código, tokens em `localStorage`).
- Usar **Firebase App Check** + variáveis server-side / Cloud Functions.

---

## §3. 🏗️ ZERO-TRUST TYPESCRIPT

### §3.1. Uso de `any` = falha de segurança **Crítica** (dívida técnica).
### §3.2. Uso de `unknown` sem narrowing explícito = severidade **Alta**.
### §3.3. Proibidos `@ts-ignore` e `@ts-expect-error` sem justificativa em comentário e ticket no `BACKLOG.md`.
### §3.4. Tipos genéricos/inconsistentes herdados → **refatoração imediata** para interfaces estritas.
### §3.5. Funções exportadas devem ter **tipo de retorno explícito**.

---

## §4. 🚮 HIGIENE DE AMBIENTE (Migração Windows → macOS)

### §4.1. Anti-Metadata
- Ignorar/remover `Thumbs.db`, `desktop.ini`, `.DS_Store`,
  `.AppleDouble`, `._*`, `Icon?` e caminhos `C:\`.

### §4.2. Line Endings
- Forçar `LF` (Unix) em todos os novos arquivos
  (`.gitattributes` com `* text=auto eol=lf`).

### §4.3. Git Identity
- Novos commits usam apenas configuração `--local` do repositório
  (nunca `--global`).

---

## §5. 🧠 COMANDO DE DESCONFIANÇA (Security Engineer Mode)

Antes de QUALQUER tarefa de backlog, o agente assume a persona de
**Security Engineer** e executa varredura prévia em:

- `src/services/` (em especial `cardService`, `boardService`,
  `userService`)
- `src/hooks/`
- `src/context/`
- `src/pages/`

**Vetores obrigatórios de verificação:**
1. Shadow Logic (§2.1)
2. XSS / Sanitização (§2.2)
3. Data Leakage (§2.3)
4. Tipagem tênue / `any` / `unknown` (§3)
5. Vazamento de segredos (§2.4)

A varredura é **recursiva** e cobre todos os subdiretórios.

---

## §6. 📊 OBSERVABILIDADE (ISO 42001)

### §6.1. Decisões mediadas por IA devem gerar **log estruturado não-PII**.
### §6.2. Telemetria de UI (cliques, navegação) **nunca** captura conteúdo livre digitado pelo usuário.
### §6.3. Logs de erro do client são scrubados antes do envio ao backend.

---

## §7. 🚨 GOVERNANÇA DE BACKLOG

### §7.1. Recomendações de segurança em runtime
Toda nova recomendação de segurança identificada em runtime **DEVE**
ser registrada em `BACKLOG.md` no mesmo ciclo de trabalho, com a tag
`[PRIORIDADE: SEGURANÇA]`.

### §7.2. Itens Críticos bloqueiam release
Itens de severidade **Crítica** identificados em auditorias
(ex.: `AUDIT-V17.x.md`) bloqueiam fechamento de release.

### §7.3. Tags anotadas obrigatórias
Tags de release (`vMAJOR.MINOR.PATCH.BUILD`) são **anotadas**
(`git tag -a`). Tags leves são proibidas.

---

## §8. 🧠 PROTOCOLO ANTI-VIBE-CODING (ISO 42001)

> "Vibe coding" = aceitar sugestão da LLM porque "soa certo", sem
> verificação contra a stack atual, documentação oficial e contexto
> do projeto. É considerado **falha de governança de IA**.

### §8.1. Princípio da Suspeita Reversa
A IA é tratada como **estagiário talentoso porém desatualizado**.
Toda sugestão é considerada "potencialmente herdada de corpus
obsoleto" até prova em contrário.

### §8.2. Proibições Explícitas (Padrões Mortos)
Proibida a introdução de:
- `var` (usar `const`/`let`)
- Class components React em código novo (preferir function + hooks)
- `componentWillMount`, `componentWillReceiveProps`, e outros
  lifecycles legados
- Callbacks aninhados quando `async/await` resolve
- `moment.js` (usar `date-fns` ou `Temporal` API)
- `request`, `request-promise` (usar `fetch` nativo ou `undici`)
- `node-sass` (usar `sass` / `dart-sass`)
- `enzyme` em testes novos (usar `@testing-library`)
- jQuery em qualquer hipótese

### §8.3. Verificação de Atualidade da Stack
Antes de sugerir qualquer biblioteca, o agente DEVE:
1. Verificar `package.json` para versões reais instaladas.
2. Confirmar que a API sugerida existe na versão instalada
   (não em versão imaginada).
3. Em caso de dúvida sobre API: declarar a dúvida em vez de
   gerar código "plausível" (ver §9).

### §8.4. Anti-Slopsquatting (Dependências Fantasma)
- **Proibido** sugerir pacote npm sem confirmação de existência real.
- Toda nova dependência exige:
  - Link para o registro npm/GitHub oficial.
  - Verificação de manutenção ativa (último commit < 12 meses).
  - Análise de superfície de ataque (downloads semanais > 10k OU
    auditoria manual documentada).

### §8.5. Detecção de Antipadrões Memorizados
Sinalizar e refatorar quando encontrar:
- `try/catch` que engole erro silenciosamente
- `JSON.parse` sem `try/catch` ou schema (Zod/Valibot)
- Regex caseiro para e-mail, URL, CPF (usar libs auditadas)
- `innerHTML` (usar `textContent` ou framework)
- `eval`, `Function()` constructor, `setTimeout(string, ...)`
- JWT/tokens em `localStorage` (usar httpOnly cookies)
- `Math.random()` para qualquer uso security-sensitive
- Comparação de string com timing attack (`===` em senha/token)

### §8.6. Cargo Cult Hooks (React-específico)
Sinalizar uso desnecessário de:
- `useEffect` para sincronizar estado derivado (preferir cálculo direto)
- `useMemo`/`useCallback` sem profiling que justifique
- `useState` para valor que poderia ser ref ou constante
- `useRef` para valor que poderia ser `useState`

### §8.7. Provenance Obrigatória
Toda decisão arquitetural não-óbvia introduzida pelo Antigravity
DEVE vir com comentário no formato:

```ts
// [PROVENANCE] <razão> | <fonte> | <data>
// ex.: [PROVENANCE] React 19 use() preferred over useEffect for data fetching
//      | https://react.dev/reference/react/use | 2026-06
```

### §8.8. "Idiomatic Check" Antes do Commit
Para a stack declarada (Tailwind v4 / React 19 / TS 5.x / Vite atual):
- O código gerado segue a documentação OFICIAL da versão instalada?
- Há padrão mais idiomático introduzido na major recente?
- Em caso de dúvida: marcar com `// TODO: idiomatic-review` em vez de
  commitar "no feeling".

---

## §9. 🤔 PRINCÍPIO DO "NÃO SEI" HONESTO

> Promovido de §8.9 da v1.0 para regra estrutural na v1.1.

### §9.1. Declaração de incerteza é preferível a fabricação
A IA DEVE preferir declarar incerteza a fabricar plausibilidade.

**Frase canônica aceita:**
> *"Não tenho certeza se esta API existe nesta versão — favor
> confirmar na documentação oficial."*

**Saída proibida:** gerar código "plausível" sem ancoragem verificável.

### §9.2. Canal de captura de incerteza
Quando o agente declara incerteza durante uma OS, ele DEVE:
1. Marcar o ponto com `// TODO: provenance-pending` no código.
2. Registrar a pergunta em aberto no Gate humano da OS.
3. Aguardar decisão do Product Owner antes de prosseguir.

### §9.3. "Hipóteses Assumidas" são primeira-classe
Toda OS pode (e deve, quando aplicável) declarar bloco
`LISTA_HIPOTESES` no briefing. Hipóteses não declaradas são
consideradas inexistentes — Antigravity NÃO assume tacitamente.

---

## §10. 🏛️ HIERARQUIA DE AUTORIDADE

Em qualquer conflito entre artefatos do projeto, esta é a ordem de
precedência inviolável:

1. **`cursorrules.md`** (este documento) — autoridade constitucional.
2. **`prompt.md`** — protocolo de OS parametrizadas.
3. **OS materializada** em `docs/orders/OS-*.md` — instrução pontual.
4. **Instrução verbal** do Product Owner em chat.

> ⚠️ Em qualquer conflito detectado, o Antigravity DEVE **abortar e
> reportar** ao Product Owner antes de executar.

---

## §11. ✅ CHECKLIST DE CONFORMIDADE (auto-verificação por commit)

- [ ] Nenhum `100vh` / `100vw` introduzido em containers internos (§1.1)
- [ ] Nenhum `any` introduzido sem ticket de débito (§3.1)
- [ ] Toda permissão de UI tem espelho em `firestore.rules` (§2.1)
- [ ] Inputs livres passam por `DOMPurify` (§2.2)
- [ ] Selectors retornam apenas campos necessários (§2.3)
- [ ] Nenhum segredo no bundle final (§2.4)
- [ ] Arquivos novos com EOL = LF (§4.2)
- [ ] WCAG 2.2 AA validado em componentes alterados (§0.4)
- [ ] `[PROVENANCE]` presente em decisões não-óbvias (§8.7)
- [ ] Nenhum padrão morto introduzido (§8.2)
- [ ] Nenhum antipadrão memorizado introduzido (§8.5)
- [ ] Tag de release é anotada, nunca leve (§7.3)

---

## 📎 RASTREABILIDADE

| Campo | Valor |
|---|---|
| Versão deste documento | 1.1 |
| Revisão | 2026-10-05 |
| Documento substituído | cursorrules.md v1.0 |
| Próxima revisão prevista | trimestral ou após ADR |
| Local oficial | raiz do repositório |