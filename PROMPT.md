---
documento: prompt
versão: 1.1
revisão: 2026-10-05
hash-pendente: <a calcular após aprovação>
autoridade: protocolo
projeto: Enki
documento-superior: cursorrules.md v1.1
sintaxe-templates: mustache.js v4.x
---

# 📐 PROTOCOLO DE ORDENS DE SERVIÇO PARAMETRIZADAS — Projeto Enki

> Este documento define o **protocolo permanente** de geração,
> materialização e execução de Ordens de Serviço (OSs) no projeto
> Enki. Ele é executado SOB as Regras de Ouro do `cursorrules.md`
> (v1.1 ou superior).
>
> Em qualquer conflito, vale a Hierarquia de Autoridade definida em
> `cursorrules.md §10`.

---

## 1. 🎯 PROPÓSITO

Padronizar o ciclo completo de uma OS no Enki, de modo que:

- Todo pedido do Product Owner gere uma OS **rastreável e auditável**.
- O Antigravity execute apenas instruções **resolvidas, validadas e
  ancoradas** no `cursorrules.md`.
- Nenhum placeholder Mustache vaze para o repositório.
- Nenhuma decisão "plausível" sem `[PROVENANCE]` seja aceita
  (cursorrules §8.7 + §9).

---

## 2. 🧭 FLUXO CANÔNICO DA OS

```
┌─────────────────────────────────────────┐
│ 1. Product Owner preenche briefing      │
│    docs/REQUEST-OS-TEMPLATE.md          │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 2. Oráculo recebe briefing e responde   │
│    com Bloco A (parâmetros) +           │
│    Bloco B (instrução de materialização)│
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 3. Product Owner revisa Bloco A         │
│    (corrige se necessário) e aprova     │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 4. Antigravity:                         │
│    a. Localiza template em              │
│       docs/templates/                   │
│    b. Renderiza via mustache.js v4.x    │
│    c. Valida (regex + engine)           │
│    d. Salva em docs/orders/             │
│    e. Executa, parando nos Gates        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 5. DoD verificada → OS [EXECUTADA]      │
│    + commit/tag conforme aplicável      │
└─────────────────────────────────────────┘
```

---

## 3. 🔧 ENGINE MUSTACHE OFICIAL

### 3.1. Engine canônico
- **Implementação:** [`mustache.js`](https://github.com/janl/mustache.js)
  versão `^4.2.0`.
- **Justificativa:** padrão de mercado, manutenção ativa, sem
  dependências, especificação Mustache 1.4 completa.
- **Alternativa permitida:** apenas se documentada via ADR em
  `docs/governance/`.

### 3.2. Sintaxe oficial de placeholders

| Tipo | Sintaxe | Renderização |
|---|---|---|
| Simples | `{{NOME_PARAMETRO}}` | substituído por valor único |
| Lista (seção positiva) | `{{#LISTA_NOME}}...{{/LISTA_NOME}}` | repetido por item |
| Condicional positiva | `{{#IF_X}}...{{/IF_X}}` | incluído se truthy |
| Condicional negativa | `{{^IF_X}}...{{/IF_X}}` | incluído se falsy |
| Comentário | `{{! texto }}` | renderizado como vazio |

### 3.3. Convenção de nomenclatura
- **Variáveis simples:** `UPPER_SNAKE_CASE` (ex.: `TITULO_OS`).
- **Listas:** prefixo `LISTA_` (ex.: `LISTA_INCLUI`).
- **Flags booleanas:** prefixo `IF_` (ex.: `IF_TOCA_FIRESTORE_RULES`).

---

## 4. 🛡️ VALIDAÇÃO DE PLACEHOLDERS (REGRA INVIOLÁVEL)

### 4.1. Após renderização pelo engine

Antes de salvar QUALQUER OS materializada em `docs/orders/`, o
Antigravity DEVE executar a sequência abaixo **na ordem**:

#### Passo 1 — Validação de parâmetros não-resolvidos

Aplicar a regex:

```regex
\{\{(?![!#/^])[^}]+\}\}
```

> 📌 **Por que esta regex e não a anterior:**
> - `(?![!#/^])` = lookahead negativo que ignora **comentários**
>   (`{{!}}`), **aberturas** (`{{#}}`), **fechamentos** (`{{/}}`) e
>   **inversões** (`{{^}}`).
> - Captura **apenas** placeholders simples não-resolvidos
>   (`{{NOME}}`).
> - Resolve o falso-positivo que existia na regex `\{\{[^}]+\}\}`
>   da v1.0.

Se houver QUALQUER ocorrência:
- **ABORTAR** imediatamente.
- **NÃO SALVAR** o arquivo.
- Reportar no chat:
  - Quantidade de placeholders pendentes.
  - Lista exata de cada um.
  - Linha onde aparecem.
- Aguardar nova OS corrigida.

#### Passo 2 — Validação de seções remanescentes

Aplicar a regex:

```regex
\{\{[#/^][^}]+\}\}
```

Se houver QUALQUER ocorrência:
- **ABORTAR** com mensagem específica:
  > *"Falha de engine Mustache: aberturas/fechamentos de seção
  > remanescentes. Verificar se o engine `mustache.js` foi invocado
  > corretamente, ou se a OS forneceu o array/flag esperado."*
- Esta falha é **diferente** da anterior: indica que o **engine**
  falhou, não que o **parâmetro** está faltando.

#### Passo 3 — Confirmação positiva

Se ambas as regex retornarem zero ocorrências:
- Salvar o arquivo materializado.
- Prosseguir com a execução da OS.

### 4.2. Auto-validação adicional

Além das regex acima, o Antigravity DEVE verificar:

- **Consistência de listas:** se um template usa `{{#LISTA_X}}` mas
  o parâmetro `LISTA_X` não foi fornecido, abortar.
- **Tipos esperados:** se um parâmetro deveria ser data UTC e veio em
  outro formato, abortar.
- **Caminhos de arquivo:** se a OS referencia caminhos que não existem
  e não estão na lista de `LISTA_ARQUIVOS_CRIAR`, abortar.
- **Coerência de versão:** `CURSORRULES_VERSAO_LIDA` deve ser
  compatível com a versão do `cursorrules.md` no momento da execução.

> Esta camada impede que arquivos com `{{XYZ}}` literal vazem para o
> repositório, o que constituiria falha de governança ISO 27001/42001.

---

## 5. 🤔 CAPTURA DE INCERTEZA (espelha cursorrules §9)

### 5.1. Quando o Antigravity declarar `Não Sei` honesto

Conforme `cursorrules §9.1`, o Antigravity deve declarar incerteza
em vez de fabricar plausibilidade. Quando isso ocorrer durante uma OS:

1. Marcar o ponto no código com `// TODO: provenance-pending`.
2. Registrar a pergunta em aberto no Gate humano mais próximo.
3. **Não prosseguir** sem decisão do Product Owner.

### 5.2. `LISTA_HIPOTESES` no briefing

Toda OS pode declarar `LISTA_HIPOTESES` no briefing
(`docs/REQUEST-OS-TEMPLATE.md`). Hipóteses não declaradas são
consideradas inexistentes — o Antigravity **não assume tacitamente**.

### 5.3. Frase canônica de incerteza

> *"Não tenho certeza se esta API existe nesta versão — favor
> confirmar na documentação oficial."*

Saída proibida: gerar código "plausível" sem ancoragem verificável.

---

## 6. 🏛️ HIERARQUIA EM CASO DE CONFLITO

Esta seção **delega** para `cursorrules.md §10`, que é a fonte única
da hierarquia de autoridade no projeto.

Em qualquer conflito detectado entre OS, `prompt.md` e `cursorrules.md`,
o Antigravity DEVE:
1. Aplicar a precedência de `cursorrules §10`.
2. **Abortar e reportar** ao Product Owner antes de executar.

---

## 7. 📁 ARTEFATOS E SEUS LUGARES

| Artefato | Local | Quem cria |
|---|---|---|
| `cursorrules.md` | raiz | constitucional, raramente alterado |
| `prompt.md` | raiz | este protocolo |
| `docs/REQUEST-OS-TEMPLATE.md` | docs/ | preenchido pelo PO |
| `docs/templates/*.md` | docs/templates/ | moldes Mustache |
| `docs/orders/OS-*.md` | docs/orders/ | OS materializada (Antigravity) |
| `docs/orders-requests/REQUEST-*.md` | docs/orders-requests/ | briefings arquivados (opcional) |
| `docs/audits/AUDIT-*.md` | docs/audits/ | auditorias geradas por OSs 📕 |
| `docs/governance/ADR-*.md` | docs/governance/ | decisões arquiteturais |
| `docs/plans/*.md` | docs/plans/ | planos macro (ex.: PLAN-V18) |
| `docs/diagnostics/*.md` | docs/diagnostics/ | diagnósticos pontuais |

---

## 8. 🚫 EXCEÇÕES PERMITIDAS

A única exceção ao fluxo canônico é o template `prompt-retomada.md`
(perfil 📐 Molde Livre), usado para casos atípicos onde nenhum dos
templates estruturados se aplica.

Mesmo nesse caso:
- A OS DEVE ser arquivada em `docs/orders/`.
- A validação de placeholders permanece obrigatória.
- `CURSORRULES_REFS` permanece obrigatório (decisão da v1.1).

---

## 9. 📎 RASTREABILIDADE

| Campo | Valor |
|---|---|
| Versão deste protocolo | 1.1 |
| Revisão | 2026-10-05 |
| Documento superior | `cursorrules.md` v1.1 |
| Engine Mustache oficial | `mustache.js` ^4.2.0 |
| Próxima revisão prevista | trimestral ou após ADR |

---

## 📜 HISTÓRICO DE MUDANÇAS

### v1.1 — 2026-10-05
- Engine Mustache declarado oficialmente.
- Regex de validação corrigida (ignora `{{!}}`, `{{#}}`, `{{/}}`, `{{^}}`).
- Hierarquia de conflito delegada para `cursorrules §10`.
- OS V17.3→18 extraída para `docs/orders/` (não-inline).
- Captura de incerteza formalizada (espelha cursorrules §9).

### v1.0
- Versão inicial com regex `\{\{[^}]+\}\}` (substituída por falsa-positiva).