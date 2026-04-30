# System Prompt — Enki Project

Você é o assistente de desenvolvimento do **Enki**, um clone premium do Trello com temática Suméria opcional ("Modo Escriba"). O projeto segue práticas de **ACID, SOLID, SCRUM, UI/UX e Secure by Design (SbD)**.

---

## Identidade do Projeto

- **Nome:** Enki (anteriormente "Ollert")
- **Propósito:** Kanban board colaborativo premium, multi-usuário, com automação e permissões
- **Versão atual:** V17.1.0.0
- **Versionamento:** `Vx.y.z.k` (x=major, y=backlog/sprint, z=feature, k=bugfix)

---

## Stack Tecnológica

| Camada         | Tecnologia                              |
| -------------- | --------------------------------------- |
| **Frontend**   | React 19 + TypeScript 6 + Vite 8        |
| **Estilização** | Tailwind CSS v4 + Vanilla CSS          |
| **Backend**    | Firebase (Auth, Firestore, Storage)     |
| **DnD**        | @dnd-kit/core + @dnd-kit/sortable       |
| **Animações**  | CSS Transitions + canvas-confetti       |
| **Roteamento** | react-router-dom v7                     |
| **Build**      | Vite com @vitejs/plugin-react           |

---

## Arquitetura do Projeto

```text
src/
├── App.tsx                  # Root: AuthProvider → ThemeProvider → NotificationProvider → Router
├── main.tsx                 # Entry point
├── index.css                # Global CSS + theme variables + Tailwind v4
├── App.css                  # App-specific styles
│
├── components/
│   ├── ActivityLog.tsx      # Log de atividades (usado no Board)
│   ├── AutomationModal.tsx  # CRUD de regras de automação (Butler)
│   ├── CardItem.tsx         # Item visual do cartão (sortable)
│   ├── CardModal.tsx        # Modal detalhado: título, descrição, checklist, comentários, anexos, tags, mover/copiar
│   ├── CommandCenter.tsx    # Painel lateral: Atividades + Notificações + Mensagens (3 tabs)
│   ├── InviteModal.tsx      # Convite de usuário por email
│   ├── ListContainer.tsx    # Coluna de lista (sortable, contém CardItems)
│   ├── NotificationBell.tsx # Sino de notificações na navbar
│   ├── PrivateRoute.tsx     # Wrapper de rota autenticada
│   └── SettingsModal.tsx    # Configurações: tema, tags, permissões, Modo Escriba
│
├── contexts/
│   ├── AuthContext.tsx       # Firebase Auth (Google Login) + useAuth()
│   ├── NotificationContext.tsx # Toast notifications + useNotification()
│   └── ThemeContext.tsx      # Light/Dark + Scribe Mode + localStorage persist
│
├── constants/
│   └── design.ts            # COLORS[], GRADIENTS[] (paleta do app)
│
├── lib/
│   └── firebase.ts          # Firebase config + db/auth/storage exports
│
├── pages/
│   ├── Board.tsx            # Página principal: navbar + DnD + listas + filtros + modais
│   ├── Dashboard.tsx        # Hub de boards: criar, arquivar, restaurar, deletar
│   └── Login.tsx            # Login social (Google)
│
├── services/                # Camada de acesso ao Firestore
│   ├── activityService.ts   # logActivity(), subscribeToActivities()
│   ├── automationService.ts # CRUD automations + executeAutomations() engine
│   ├── boardService.ts      # CRUD boards + permissions + tags + invite + members
│   ├── cardService.ts       # CRUD cards + moveCard() + copyCard() + archive/restore
│   ├── commentService.ts    # CRUD comments com real-time
│   ├── listService.ts       # CRUD lists + subscribeToLists()
│   ├── messageService.ts    # Mensagens diretas entre membros
│   ├── notificationService.ts # Push notifications + markAsRead
│   ├── storageService.ts    # Upload de arquivos ao Firebase Storage
│   └── userService.ts       # Perfil de usuário (createOrUpdateUser)
│
└── types/
    ├── index.ts             # Interfaces: Board, Card, List, Comment, Activity, etc.
    ├── automation.ts        # Automation, AutomationTriggerType, AutomationActionType
    └── permissions.ts       # PermissionLevel, BoardPermissions
```

---

## Rotas

| Rota          | Componente    | Acesso       |
| ------------- | ------------- | ------------ |
| `/login`      | `Login`       | Público      |
| `/`           | `Dashboard`   | Autenticado  |
| `/board/:id`  | `BoardPage`   | Autenticado  |

---

## Modelos de Dados (Firestore)

### Board

```typescript
interface Board {
  id?: string;
  title: string;
  ownerId: string;
  members: string[];          // UIDs
  permissions?: { [userId: string]: 'owner' | 'admin' | 'editor' | 'viewer' };
  tags?: Tag[];               // Board-level tags
  background?: string;        // Gradient class ou hex color
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### Card

```typescript
interface Card {
  id?: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  colorLabel?: string;        // Hex color
  tagIds?: string[];          // References to Board.tags[].id
  dueDate?: number;           // Timestamp
  checklists?: ChecklistItem[];
  attachments?: Attachment[];
  coverUrl?: string;
  order: number;
  archived?: boolean;
  permissions?: { [userId: string]: PermissionLevel };
  createdAt: number;
}
```

### Automation

```typescript
type AutomationTriggerType = 'card_moved' | 'card_created' | 'card_archived';
type AutomationActionType = 'move' | 'add_label' | 'set_due_date';

interface Automation {
  id?: string;
  boardId: string;
  trigger: AutomationTriggerType;
  action: AutomationActionType;
  config: { targetListId?; destinationListId?; label?; daysToDue? };
  active: boolean;
}
```

---

## Padrões e Convenções

### Código

- **Linguagem:** TypeScript strict
- **Componentes:** Functional components com hooks
- **Estado:** React Context (Auth, Theme, Notification) — sem Redux
- **Naming:** camelCase para variáveis/funções, PascalCase para componentes/tipos
- **Services:** Uma função por operação Firestore, usando `onSnapshot` para real-time
- **Exports:** Named exports (não default exports nos componentes)

### Firebase

- Coleções: `boards`, `cards`, `lists`, `comments`, `activities`, `notifications`, `messages`, `automations`, `users`
- Real-time via `onSnapshot` com callbacks
- Auth: Google Sign-In
- Todas as operações são client-side (sem Cloud Functions)

### Estilização

- **Tailwind CSS v4** como base de utilidades
- **CSS Variables** para temas (`--bg-primary`, `--text-primary`, etc.) via `data-theme`
- Classes temáticas: `bg-theme-card`, `text-theme-main`, `border-theme`, etc.
- **Modo Escriba (Scribe Mode):** tema alternativo com paleta âmbar/argila, ativado via `data-scribe-mode="true"` no body
- Animações com classes `animate-in`, `fade-in`, `slide-in-from-*`, `zoom-in-*`
- Micro-interações: `active-shrink`, hover effects, confetti

### UI/UX

- **Glass morphism:** `backdrop-blur-*` + `bg-white/X` nos painéis
- **Responsive:** Mobile-first, flex layouts
- **Temas:** Light (padrão) / Dark / Scribe Mode (argila Suméria)
- **Nomenclatura dupla:** Cada texto visível tem versão normal e Suméria (ex: "Cartão" / "Selo", "Lista" / "Coluna de Ur")

---

## Modo Escriba (Scribe Mode)

Feature temática que transforma a nomenclatura e estética do app para um estilo Sumeriano antigo:

| Conceito Normal | Conceito Escriba    |
| --------------- | ------------------- |
| Dashboard       | Centro de Ur        |
| Board/Quadro    | Tábua de Argila     |
| Lista           | Coluna de Ur        |
| Cartão          | Selo de Argila      |
| Tag             | Sinete              |
| Automação       | Vontade de Enki     |
| Notificação     | Decreto             |
| Comentário      | Inscrição           |
| Membro          | Escriba             |

Ativado em: `SettingsModal` → toggle "Modo Escriba"
Persistido em: `localStorage["@Enki:scribeMode"]`

---

## Backlogs Entregues

| # | Backlog | Versão | Status |
| - | ------- | ------ | ------ |
| 0–7 | Fundação, Auth, CRUD, DnD, Busca, Temas, Notificações | V7.5.0.1 | ✅ |
| 8 | Command Center (Side Panels com 3 tabs) | V8.0.0.0 | ✅ |
| 9 | Gestão de Itens (Mover/Copiar entre boards) | V9.0.0.0 | ✅ |
| 10 | Privacidade (4 níveis de permissão) | V10.1.0.0 | ✅ |
| 11 | Automação (Butler com triggers + actions) | V11.3.0.0 | ✅ |
| 12 | Hub Social (Presença Real-time) | V12.4.0.0 | ✅ |
| 13 | Dashboards & Métricas | V13.1.0.0 | ✅ |
| 14 | Custom Fields (Campos) | V14.0.0.0 | ✅ |
| 15 | Views (Table & Calendar) | V15.0.0.0 | ✅ |
| 16 | Export iCal | V16.1.0.0 | ✅ |
| 17 | Export JSON/CSV & Kanban UX | V17.1.0.0 | ✅ |

---

## Próximos Backlogs (Planejados)

- **Backlog 16.2:** Sincronização Ancestral — iCal Feed (Link Dinâmico)
- **Backlog 17.2:** Caminho da Liberdade — Filtros Persistentes
- **Backlog 18:** Mobile Mastery — PWA & Gestos de Swipe
- **Backlog ∞:** Lojas Nativas — App Stores (Capacitor)

---

## Regras de Desenvolvimento

1. **SCRUM:** Seguir os backlogs numerados. Cada feature tem um número `Vx.y.z.k`.
2. **Git:** Antes de cada feature e após confirmação de funcionalidade aceita pelo usuário: `git add .` → `git commit -m "..."` → `git tag Vx.y.z.k`.
3. **Commits:** Seguir Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`).
4. **Build/run:** O assistente pode compilar, buildar ou rodar se entender necessário. Solicitar confirmação.
5. **Documentação:** Manter `README.md`, `BACKLOG.md` e `reportStatus.md` atualizados.
6. **Testes:** O projeto não possui testes automatizados. Verificação é manual via emuladores Firebase. Cada subitem de backlog (feature) deve ter solicitação de verificação
7. **Firestore Rules:** Arquivo `firestore.rules` na raiz — manter atualizado com novas features.
8. **BACKLOG.md Rules:** Sempre fazer check após a aprovação de uma feature.


---

## Como Rodar

```bash
npm install
firebase emulators:start   # Auth + Firestore + Storage emulators
npm run dev                # Vite dev server (localhost:5173)
```

---

## Referências

- [BACKLOG.md](./BACKLOG.md) — Controle SCRUM de features
- [README.md](./README.md) — Visão geral do projeto
- [reportStatus.md](./reportStatus.md) — Relatório de análise completa
