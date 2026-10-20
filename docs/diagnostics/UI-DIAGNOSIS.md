# Diagnóstico Clínico da Interface (UI/UX)

## 1.1 Viewport Toxicity
Foram encontrados usos de classes utilitárias e estilos que forçam o uso integral da viewport, o que é a principal causa do scroll lateral indesejado (especialmente no Safari/macOS devido à barra de rolagem sobreposta) e das quebras de layout em dispositivos móveis (por causa das barras de navegação).

| Caminho | Linha | Token | Contexto | Impacto Safari/iOS |
| :--- | :--- | :--- | :--- | :--- |
| `src/pages/AdminPanel.tsx` | 85, 90, 112 | `min-h-screen` | Container principal do painel | Scroll indesejado no mobile devido à safe-area. |
| `src/pages/Profile.tsx` | 68, 76, 88 | `min-h-screen` | Layout principal do perfil | Extensão da altura além da viewport real em iOS. |
| `src/pages/Login.tsx` | 24 | `h-screen w-full` | Flex container de login | `w-full` junto de comportamentos padrão e scrollbars causam scroll horizontal (scroll lateral). |
| `src/pages/Dashboard.tsx` | 234 | `min-h-screen` | Container do Dashboard | Quebra da base de altura no Safari móvel. |
| `src/pages/Board.tsx` | 329, 349 | `h-screen` | Flex wrapper principal | Força rolagem interna e colide com dinâmicas de 100vh em Safari. |
| `src/components/CardModal.tsx` | 403 | `max-h-[90vh]` | Altura de Modal | Comportamento não adaptativo ao teclado virtual (iOS). |
| `src/components/PrivateRoute.tsx`| 8 | `h-screen` | Wrapper de loading | Shift ao transitar para layout sem h-screen. |

## 1.2 Vazamento de Tema (Modo Escriba)
O "Modo Escriba" é um tema pensado para aplicar a paleta específica em *Boards* do tipo *Scribe*. No entanto, está sofrendo vazamento para a aplicação inteira.

- **Origem (Onde definido):** `src/contexts/ThemeContext.tsx`
- **Escopo Desejado:** Apenas dentro de instâncias de visualização de `Board` (Scribe).
- **Escopo Indevido:** Toda a aplicação (Dashboard, Profile, AdminPanel).
- **Causa Raiz:** O Provider de tema (`ThemeContext.tsx`) gerencia o estado `scribeMode` globalmente e realiza injeção direta no root via `document.body.setAttribute("data-scribe-mode", String(scribeMode))`. Adicionalmente, dezenas de componentes (ex: `Profile.tsx`, `AdminPanel.tsx`) consultam ativamente este contexto global e aplicam classes utilitárias condicionalmente (ex: `scribeMode ? 'text-theme-main' : 'text-gray-900'`), acoplando regras de negócio com estilo e quebrando a especificidade.

## 1.3 Layout Shift (CLS)
A aplicação sofre de Cumulative Layout Shift considerável durante as respostas da API do Firebase devido à renderização bloqueante sem reserva visual.

- **Visão Kanban (`Board.tsx` / `KanbanBoard.tsx`):** Dados de listas e cartões não possuem reserva de altura. O estado intermédio apenas contém um texto `Carregando...`, causando o surgimento em bloco dos itens que infla a tela, deslocando posições.
- **Visão Tabela (`TableView.tsx`):** A estrutura nasce sem *Skeletons* de linhas. A passagem de 0 linhas de Skeleton para `n` linhas geradas subitamente quebra a experiência.
- **Visão Calendário (`CalendarView.tsx`):** Células redimensionam abruptamente quando eventos são montados.
- **Estimativa de CLS Atual:** Elevada. A falta de Skeletons (nenhum encontrado no código) e da manutenção da UI Shell implica num redesenho inteiro da DOM.

## 1.4 Acessibilidade Baseline (WCAG 2.2 AA)
Foram identificadas violações flagrantes no que tange os guias essenciais.

- **Landmarks (`<main>`, `<nav>`, `<aside>`):** A maioria das páginas baseia-se unicamente em `<div>` genéricas no lugar de elementos HTML5 semânticos.
- **Atributos ARIA:** Quase nula utilização de atributos `aria-*` para componentes modais (`CardModal.tsx`), menús (`CommandCenter.tsx`) ou alertas. Não há gestão adequada do foco de acessibilidade.
- **Foco Visível e Navegação por Teclado:** Falta de anéis `:focus-visible` nas abstrações de botões customizados para manter consistência sem depender dos padrões imprevisíveis do navegador.
