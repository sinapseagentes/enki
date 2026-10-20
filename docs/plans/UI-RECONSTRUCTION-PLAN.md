# Plano de Reconstrução: Tabula Rasa (UI/UX)

**Versão da Stack Validada:**
- Tailwind CSS: `v4.2.4`
- Vite: `v8.0.10`
- React: `v19.2.6`
- TypeScript: `v6.0.3`

---

## 2.1 App Shell (Rigid Shell)
O App Shell deve abandonar as diretivas tóxicas (`h-screen`, `100vh`) e passar a usar as medidas de *Dynamic/Small Viewport Height* atreladas às safe-areas nativas. O design utilizará **CSS Grid** para trancar as áreas externas e habilitar rolagem apenas nas áreas internas designadas (`.pt-scroll-area`).

**[PROVENANCE]** (Melhoria de estabilidade mobile | Spec CSS Values 4 & Apple WebKit Blog | Maio 2026)

### Diagrama Mermaid da Rigid Shell
```mermaid
grid
  grid-template-areas:
    "nav   header"
    "nav   main"
  grid-template-columns: 260px 1fr
  grid-template-rows: 64px 1fr
  height: calc(100svh - env(safe-area-inset-bottom))

  "nav" {
    background: var(--color-surface);
    overflow-y: auto; /* .pt-scroll-area */
  }
  "header" {
    background: var(--color-bg);
  }
  "main" {
    background: var(--color-bg);
    overflow: hidden; /* O conteúdo interno lidará com seu próprio scroll */
  }
```
*Em dispositivos móveis, o layout da grid muda para 1 coluna e a navegação se torna um Drawer off-canvas.*

## 2.2 Sistema de Tokens
Com a atualização para **Tailwind CSS v4.2.4**, abandonamos o `tailwind.config.ts` em favor da injeção direta de variáveis via diretiva `@theme` diretamente no arquivo `index.css`.

**Estratégia do Modo Escriba:**
Em vez de vazar classes arbitrárias pelo DOM com ternários, o tema "Scribe" será reduzido a variáveis CSS limitadas ao contexto do componente que hospeda o *Board*. A injeção será feita via `data-theme="scribe"` aplicado **estritamente** na `<div>` raiz do Board, nunca no `document.body`.

**[PROVENANCE]** (Isolamento de estilo e Tailwind v4 CSS-first engine | Tailwind CSS Official Docs | Fev 2026)

**Exemplo de Tokens em CSS:**
```css
@theme {
  --font-mono: 'Space Mono', 'Courier New', monospace; /* Definindo token tipográfico mono */
  
  /* Cores padrão (Base) */
  --color-board-bg: var(--color-slate-50);
  --color-board-text: var(--color-slate-900);
}

/* Scoped Theme: Modo Escriba */
[data-theme="scribe"] {
  --color-board-bg: var(--color-amber-50);
  --color-board-text: var(--color-amber-900);
}
```

## 2.3 Headless Library (Modais / Popovers / Menus)
Para corrigir de forma definitiva os modais sobrepostos e a falta de acessibilidade (Gate 1), precisamos de componentes base que controlem o `z-index`, `focus trap`, e `aria-attributes` de maneira não-opinativa no estilo.

| Critério | Radix UI | Ariakit | Headless UI |
| :--- | :--- | :--- | :--- |
| **WCAG 2.2** | Excelente (Completo) | Excelente (Completo) | Bom |
| **Bundle Size** | Médio (Modular) | Muito Leve | Leve |
| **Atividade do Mantenedor** | Altíssima | Média | Altíssima (Tailwind Labs) |
| **Compat. Tailwind v4** | 100% | 100% | 100% nativa |
| **Gestão Portal/z-index**| Portal Isolado Nativo | Suporte a Portals | Portal Isolado Nativo |

**Recomendação:** **Radix UI Primitives** (ex: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`).
**[PROVENANCE]** (Padrão ouro de acessibilidade no ecossistema React, arquitetura de portais modularizada que não interfere no Grid do Rigid Shell | Radix UI Docs & W3C ARIA APG | Abril 2026). Portals serão injetados numa div root específica no fim do body `<div id="radix-portal"></div>` para prevenir quebra do App Shell Grid.

## 2.4 Skeletons e Mitigação de CLS
O projeto não tem *Skeletons*. Isso precisa ser implementado para alcançar **CLS < 0.05**.
**[PROVENANCE]** (Core Web Vitals e UX fluída | Google Web.Dev | Março 2026)

- **Visão Kanban (`Board.tsx`):**
  Ao carregar, serão renderizadas 3 colunas "fantasmas" `w-72` com altura de `h-full` (usando background pulsante simulado em Tailwind). Dentro de cada coluna fantasma, 3 *cards* opacos `h-24` para reservar o pixel-equivalent.
- **Visão Tabela (`TableView.tsx`):**
  Renderização imediata dos *Headers* da tabela, seguidos de 10 linhas artificiais simulando a altura base `h-12` da `<tr>`.
- **Visão Calendário (`CalendarView.tsx`):**
  Grid visual estática instantânea, inflando "pastilhas" de Skeleton nos dias correntes.

## 2.5 Inventário de Componentes

| Componente | Caminho | Decisão | Justificativa |
| :--- | :--- | :--- | :--- |
| ThemeContext | `src/contexts/ThemeContext.tsx` | **REFATORAR** | Remover injeção de `data-scribe-mode` no `document.body` e não poluir o global state. |
| CardModal | `src/components/CardModal.tsx` | **DESCARTAR** | Componente monstruoso e não acessível. Reconstruir usando `@radix-ui/react-dialog`. |
| KanbanBoard | `src/components/KanbanBoard.tsx` | **REFATORAR** | Implementar `Rigid Shell` e áreas de scroll isoladas, somado aos Skeletons de layout. |
| Profile / AdminPanel | `src/pages/Profile.tsx` (etc) | **REFATORAR** | Remover classes de ternários sujos (ex: `scribeMode ? ...`) e usar CSS Custom Properties padrão. Eliminar `h-screen`. |
| TableView / CalendarView | `src/components/*.tsx` | **REFATORAR** | Adicionar fallback de *Skeleton* para inibir o layout shift durante o load. |

**[PROVENANCE]** (Princípio de Single Responsibility e DRY | Clean Code Patterns em React | 2026)

## 2.6 Roteiro High-Level (Sub-Épicos)

1. **Sub-Épico 1: Fundação do App Shell & Tailwind v4.**
   - Migrar variáveis/cores hardcoded para CSS variables (`@theme` no `index.css`).
   - Construir o CSS Grid do Rigid Shell e substituir `h-screen/100vh` por `svh/dvh` com safe-areas globais.
2. **Sub-Épico 2: Confinamento do Modo Escriba.**
   - Isolar o provedor de tema para agir apenas em instâncias de `Board`.
   - Limpar ternários espalhados nos componentes não-Scribe.
3. **Sub-Épico 3: Infraestrutura de Acessibilidade (Radix UI).**
   - Instalar primitivas de Modals, Dropdowns e Popovers.
   - Refatorar a `<div className="modal">` nativa para `<Dialog.Root>`.
4. **Sub-Épico 4: Estabilidade de Layout (Zero CLS).**
   - Desenvolver o componente estático `<KanbanSkeleton />`, `<TableSkeleton />`.
   - Plugar os skeletons no fallback do *Firebase Query State*.
