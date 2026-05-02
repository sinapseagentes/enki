# System Prompt — Enki Project  
  
Você é o assistente de desenvolvimento do **Enki**, um clone premium do Trello com temática Suméria opcional ("Modo Escriba"). O projeto segue práticas de **ACID, SOLID, SCRUM, UI/UX e Secure by Design (SbD)**.  
⸻  
## Identidade do Projeto  
  
- **Nome:** Enki (anteriormente "Ollert")  
- **Propósito:** Kanban board colaborativo premium, multi-usuário, com automação e permissões  
- **Versão atual:** V17.1.0.0  
- **Versionamento:** ==Vx.y.z.k== (x=major, y=backlog/sprint, z=feature, k=bugfix)  
⸻  
****Stack Tecnológica****  

| Camada      | Tecnologia                          |
| ----------- | ----------------------------------- |
| Frontend    | React 19 + TypeScript 6 + Vite 8    |
| Estilização | Tailwind CSS v4 + Vanilla CSS       |
| Backend     | Firebase (Auth, Firestore, Storage) |
| DnD         | @dnd-kit/core + @dnd-kit/sortable   |
| Animações   | CSS Transitions + canvas-confetti   |
| Roteamento  | react-router-dom v7                 |
| Build       | Vite com @vitejs/plugin-react       |
  
⸻  
## Arquitetura do Projeto  
  
```
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
  
⸻  
****Rotas****  

| Rota       | Componente | Acesso      |
| ---------- | ---------- | ----------- |
| /login     | Login      | Público     |
| /          | Dashboard  | Autenticado |
| /board/:id | BoardPage  | Autenticado |
  
⸻  
## Modelos de Dados (Firestore)  
  
### Board  
  
```
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
  
```
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
  
```
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
  
⸻  
## Padrões e Convenções  
  
### Código  
  
- **Linguagem:** TypeScript strict  
- **Componentes:** Functional components com hooks  
- **Estado:** React Context (Auth, Theme, Notification) — sem Redux  
- **Naming:** camelCase para variáveis/funções, PascalCase para componentes/tipos  
- **Services:** Uma função por operação Firestore, usando ==onSnapshot== para real-time  
- **Exports:** Named exports (não default exports nos componentes)  
  
### Firebase  
  
- Coleções: ==boards==, ==cards==, ==lists==, ==comments==, ==activities==, ==notifications==, ==messages==, ==automations==, ==users==  
- Real-time via ==onSnapshot== com callbacks  
- Auth: Google Sign-In  
- Todas as operações são client-side (sem Cloud Functions)  
  
### Estilização  
  
- **Tailwind CSS v4** como base de utilidades  
- **CSS Variables** para temas (==--bg-primary==, ==--text-primary==, etc.) via ==data-theme==  
- Classes temáticas: ==bg-theme-card==, ==text-theme-main==, ==border-theme==, etc.  
- **Modo Escriba (Scribe Mode):** tema alternativo com paleta âmbar/argila, ativado via ==data-scribe-mode="true"== no body  
- Animações com classes ==animate-in==, ==fade-in==, ==slide-in-from-*==, ==zoom-in-*==  
- Micro-interações: ==active-shrink==, hover effects, confetti  
  
### UI/UX  
  
- **Glass morphism:** ==backdrop-blur-*== + ==bg-white/X== nos painéis  
- **Responsive:** Mobile-first, flex layouts  
- **Temas:** Light (padrão) / Dark / Scribe Mode (argila Suméria)  
- **Nomenclatura dupla:** Cada texto visível tem versão normal e Suméria (ex: "Cartão" / "Selo", "Lista" / "Coluna de Ur")  
⸻  
## Modo Escriba (Scribe Mode)  
  
Feature temática que transforma a nomenclatura e estética do app para um estilo Sumeriano antigo:  

| Conceito Normal | Conceito Escriba |
| --------------- | ---------------- |
| Dashboard       | Centro de Ur     |
| Board/Quadro    | Tábua de Argila  |
| Lista           | Coluna de Ur     |
| Cartão          | Selo de Argila   |
| Tag             | Sinete           |
| Automação       | Vontade de Enki  |
| Notificação     | Decreto          |
| Comentário      | Inscrição        |
| Membro          | Escriba          |
  
  
Ativado em: ==SettingsModal== → toggle "Modo Escriba"   
Persistido em: ==localStorage["@Enki:scribeMode"]==  
⸻  
****Backlogs Entregues****  

| # | Backlog | Versão | Status |
| --- | ----------------------------------------------------- | --------- | ------ |
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
  
⸻  
## Próximos Backlogs (Planejados)  
  
- **Backlog 16.2:** Sincronização Ancestral — iCal Feed (Link Dinâmico)  
- **Backlog 17.2:** Caminho da Liberdade — Filtros Persistentes  
- **Backlog 18:** Mobile Mastery — PWA & Gestos de Swipe  
- **Backlog ∞:** Lojas Nativas — App Stores (Capacitor)  
⸻  
## Regras de Desenvolvimento  
  
1. **SCRUM:** Seguir os backlogs numerados. Cada feature tem um número ==Vx.y.z.k==.  
2. **Git:** Antes de cada feature e após confirmação de funcionalidade aceita pelo usuário: ==git add .== → ==git commit -m "..."== → ==git tag Vx.y.z.k==.  
3. **Commits:** Seguir Conventional Commits (==feat:==, ==fix:==, ==chore:==, ==docs:==, ==style:==, ==refactor:==).  
4. **Build/run:** O assistente pode compilar, buildar ou rodar se entender necessário. Solicitar confirmação.  
5. **Documentação:** Manter ==README.md==, ==BACKLOG.md== e ==reportStatus.md== atualizados.  
6. **Testes:** O projeto não possui testes automatizados. Verificação é manual via emuladores Firebase. Cada subitem de backlog (feature) deve ter solicitação de verificação  
7. **Firestore Rules:** Arquivo ==firestore.rules== na raiz — manter atualizado com novas features.  
8. **BACKLOG.md Rules:** Sempre fazer check após a aprovação de uma feature.  
⸻  
  
## Como Rodar  
  
```
npm install
firebase emulators:start   # Auth + Firestore + Storage emulators
npm run dev                # Vite dev server (localhost:5173)

```
  
⸻  
## Referências  
  
- [BACKLOG.md](./BACKLOG.md) — Controle SCRUM de features  
- [README.md](./README.md) — Visão geral do projeto  
- [reportStatus.md](./reportStatus.md) — Relatório de análise completa  
#    README  Enki - Trello Clone Premium  
  
Desenvolvimento de um clone do Trello usando as melhores práticas de **ACID, SOLID, SCRUM, UI/UX e Secure by Design (SbD)**.  
  
## 🚀 Tecnologias  
  
- **Frontend:** React + TypeScript + Vite  
- **Estilização:** Tailwind CSS v4 + Vanilla CSS  
- **Backend:** Firebase (Auth, Firestore, Storage)  
- **Animações:** Framer Motion / CSS Transitions  
  
## 📅 Status do Projeto  
  
Atualmente na **V17.1.0.0** — Todos os backlogs até **Sincronização & Portabilidade (Backlog 17)** estão entregues.  
  
**Backlogs Entregues**  

| Backlog | Descrição                       | Versão    |
| ------- | ------------------------------- | --------- |
| 0–7     | Fundação, CRUD, DnD, Busca      | V7.5.0.1  |
| 8       | Command Center (Side Panels)    | V8.0.0.0  |
| 9       | Gestão de Itens (Mover/Copiar)  | V9.0.0.0  |
| 10      | Privacidade (Permissões)        | V10.1.0.0 |
| 11      | Automação (Butler simplificado) | V11.3.0.0 |
| 12      | Hub Social (Presença Real-time) | V12.4.0.0 |
| 13      | Dashboards & Métricas           | V13.1.0.0 |
| 14      | Custom Fields (Campos)          | V14.0.0.0 |
| 15      | Views (Table & Calendar)        | V15.0.0.0 |
| 16      | Export iCal                     | V16.1.0.0 |
| 17      | Export JSON/CSV & Kanban UX     | V17.1.0.0 |
  
  
Para ver o progresso detalhado de cada Sprint e Feature, acesse:  
  
👉 [BACKLOG.md](./BACKLOG.md)  
  
## 🛠️ Como rodar o projeto  
  
1. Instale as dependências: ==npm install==  
2. Inicie o Firebase Emulator: ==firebase emulators:start==  
3. Inicie o servidor de desenvolvimento: ==npm run dev==  
  
## 🏷️ Versionamento  
  
O projeto segue o padrão ==Vx.y.z.k==:  
  
- **x:** Major version (0 para pre-MVP)  
- **y:** Backlog (Sprint)  
- **z:** Feature dentro do backlog  
- **k:** Correções de erro  
  
## 📊 Arquitetura  
  
```
src/
├── components/     # UI Components (CardModal, CommandCenter, SettingsModal, etc.)
├── contexts/       # React Contexts (Auth, Theme, Notification)
├── constants/      # Design tokens e constantes
├── lib/            # Firebase config
├── pages/          # Pages (Board, Dashboard, Login)
├── services/       # Firebase services (board, card, list, automation, etc.)
└── types/          # TypeScript interfaces

```
  
  
## 📋 Relatórios  
  
- [reportStatus.md](./reportStatus.md) — Análise completa do projeto vs backlog   **📊 Report Status - Enki (Ollert)**  
  
> **Data:** 2026-04-30  
  
> **Agente:** Antigravity  
  
> **Branch:** main  
  
> **HEAD:** ==b8f915d==  
  
> **Última tag:** ==V17.1.0.0==  

⸻  
## 🔍 Resumo da Análise  
  
O projeto Enki atingiu um nível de maturidade avançado. Após a implementação de exportação iCal, JSON e CSV, além de melhorias no Kanban UX (cores e colapso de colunas), o projeto foi estabilizado na versão **V17.1.0.0**. Uma tentativa de implementar PWA Mastery (Backlog 18) foi revertida para manter a estabilidade do sistema de autenticação via emuladores em rede local.  
⸻  
## 📋 Status por Backlog  
  
### ✅ Backlogs 0–11 — ENTREGUE  
- **Status:** Estáveis e funcionais.  
- Funcionalidades: Auth, CRUD, DnD, Command Center, Mover/Copiar, Privacidade e Automação Butler.  
  
### ✅ Backlog 12 (Hub Social) — ENTREGUE  
- **Versão:** V12.4.0.0  
- **Status:** Motor de presença real-time e perfis de usuários funcionais.  
  
### ✅ Backlog 13 (Dashboards & Armazenamento) — ENTREGUE  
- **Versão:** V13.1.0.0  
- **Status:** Dashboards de consumo de storage e Painel Administrativo implementados.  
  
### ✅ Backlog 14 (Custom Fields) — ENTREGUE  
- **Versão:** V14.0.0.0  
- **Status:** Campos personalizados (texto, número, data, etc.) integrados ao CardModal e capas dos cartões.  
  
### ✅ Backlog 15 (Views: Calendar & Table) — ENTREGUE  
- **Versão:** V15.0.0.0  
- **Status:** Alternador de visões (Kanban/Table/Calendar) funcional.  
  
### ✅ Backlog 16.1 (Sincronização iCal) — ENTREGUE  
- **Versão:** V16.1.0.0  
- **Status:** Exportação manual de .ics funcional.  
  
### ✅ Backlog 17.1 (Portabilidade & UI) — ENTREGUE  
- **Versão:** V17.1.0.0  
- **Status:** Exportação JSON/CSV, Sinetes de Cor para listas e colapso de colunas Kanban.  
⸻  
## 🏷️ Situação do Git  
- O projeto está sincronizado com a tag ==V17.1.0.0==.  
- Todas as alterações experimentais que quebraram o login via emulador foram removidas.  
⸻  
## 📌 Próximos Passos Sugeridos  
  
1. **Backlog 16.2** — iCal Feed (Link Dinâmico para calendários externos).  
2. **Backlog 17.2** — Filtros Persistentes (Saved Searches).  
3. **Backlog 18** — Mobile Mastery (PWA) — **Atenção:** Requer cuidado extremo com o redirecionamento de Auth em rede local.  
4. **Backlog ∞** — Capacitor (App Stores).  
    **📋 Backlog Enki - SCRUM Control**  
  
Este arquivo rastreia o desenvolvimento do Enki seguindo as regras de versionamento ==Vx.y.z.k==.  
⸻  
## 🟢 Backlog 0 a 7 - [ENTREGUE]  
  
*Status: Concluído | Versão: V7.5.0.1*  
  
*(Veja o histórico completo nas versões anteriores)*  
⸻  
## 🟢 Backlog 8 (Command Center - Side Panels) - [ENTREGUE]  
  
*Status: Concluído | Versão: V8.0.0.0*  
  
1. **Feature 8.1.0.0:** [x] Criar ==CommandCenter.tsx== com Tabs (Atividades/Notificações/Mensagens).  
2. **Feature 8.2.0.0:** [x] Implementar Backdrop Blur e Animação Lateral Premium.  
3. **Feature 8.3.0.0:** [x] Sincronizar o Sino e o Histórico para abrirem o mesmo painel.  
⸻  
## 🟢 Backlog 9 (Gestão de Itens - Mover/Copiar) - [ENTREGUE]  
  
*Status: Concluído | Versão: V9.0.0.0*  
  
1. **Feature 9.1.0.0:** [x] Criar interface de "Mover" e "Copiar" no ==CardModal==.  
2. **Feature 9.2.0.0:** [x] Implementar lógica de transposição entre quadros no ==cardService==.  
3. **Feature 9.3.0.0:** [x] Suporte a seleção de Quadro -> Lista -> Posição.  
⸻  
## 🟢 Backlog 10 (Privacidade) - [ENTREGUE]  
  
*Status: Concluído | Versão: V10.1.0.0*  
  
1. **Feature 10.1.0.0:** [x] Implementar níveis de permissão (owner/admin/editor/viewer).  
2. **Feature 10.2.0.0:** [x] Adicionar campo permissions ao Board com mapeamento userId -> nível.  
3. **Feature 10.3.0.0:** [x] Atualizar createBoard para definir owner como 'owner'.  
4. **Feature 10.4.0.0:** [x] Atualizar inviteUserToBoard para definir convidado como 'editor'.  
5. **Feature 10.5.0.0:** [x] Implementar interface de gerenciamento de permissões no SettingsModal (agora exibindo o identifier/displayName do usuário).  
6. **Feature 10.6.0.0:** [x] Adicionar campo permissions ao Card para permissões específicas por item.  
⸻  
## 🟢 Backlog 11 (Automação) - [ENTREGUE]  
  
*Status: Concluído | Versão: V11.3.0.0*  
  
1. **Feature 11.1.0.0:** [x] Criar sistema Butler simplificado com regras automáticas (==AutomationModal.tsx==).  
2. **Feature 11.2.0.0:** [x] Implementar triggers: card_created, card_moved, card_archived.  
3. **Feature 11.3.0.0:** [x] Implementar actions: move, add_label, set_due_date.  
⸻  
## 🟢 Backlog 12 (Hub Social - O Grande Zigurate) - [ENTREGUE]  
  
*Status: Concluído | Versão: V12.4.0.0*  
  
1. **Feature 12.1.0.0:** [x] Modelo de Perfil Expandido (==UserProfile== com bio, title, etc).  
2. **Feature 12.2.0.0:** [x] Página de Perfil personalizada com métricas de usuário.  
3. **Feature 12.3.0.0:** [x] Motor de Presença Real-Time via heartbeat e Firestore.  
4. **Feature 12.4.0.0:** [x] Indicadores visuais de presença (Navbar, Board, CommandCenter).  
  
## 🟢 Backlog 13 (Visões Supremos - Dashboards & Armazenamento) - [ENTREGUE]  
  
*Status: Concluído | Versão: V13.1.0.0*  
  
1. **Feature 13.1.0.0:** [x] Atualização de Attachment, Board, List, Card e UserProfile para suportar ==storageMetrics==.  
2. **Feature 13.2.0.0:** [x] Motor de armazenamento em tempo real usando batches do Firestore.  
3. **Feature 13.3.0.0:** [x] Novo ==StorageDashboard== detalhando consumo por Quadro, Lista e Cartão.  
4. **Feature 13.4.0.0:** [x] Painel Administrativo (==/admin==) para gestão de cotas e usuários fantasmas.  
5. **Feature 13.5.0.0:** [x] Propriedade de cartões automática e mensagens de erro explícitas.  
⸻  
## 🟢 Backlog 14 (Campos Ancestrais - Custom Fields) - [ENTREGUE]  
  
*Status: Concluído | Versão: V14.0.0.0*  
  
- [x] Criação de campos personalizados (Texto, Número, Data, Checkbox, Seleção) por Quadro.  
- [x] Suporte a Sufixos/Unidades (ex: h, pts, R$).  
- [x] Exibição dos campos na capa do cartão (Custom Badges).  
  
## 🟢 Backlog 15 (Visões de Oráculo - Calendar & Table) - [ENTREGUE]  
  
*Status: Concluído | Versão: V15.0.0.0*  
  
- [x] Alternador de Oráculo (View Switcher) na barra superior.  
- [x] Visão de Tabela (Grid) com colunas dinâmicas para Custom Fields.  
- [x] Visão de Calendário (Grade Mensal) com suporte a Scribe Mode.  
⸻  
## 🟢 Backlog 16.1 (Sincronização Ancestral - iCal) - [ENTREGUE]  
  
*Status: Concluído | Versão: V16.1.0.0*  
  
- [x] Exportação manual de arquivo iCal (.ics) seguindo RFC 5545.  
- [x] Nova interface de abas no Modal de Configurações para organização de recursos.  
  
## 🟢 Backlog 17.1 (Caminho da Liberdade - Portabilidade & UI) - [ENTREGUE]  
  
*Status: Concluído | Versão: V17.1.0.0*  
  
- [x] Exportação de dados do quadro em JSON (Backup Completo).  
- [x] Exportação de cartões em CSV (Compatível com Excel/Sheets, incluindo Custom Fields).  
- [x] Personalização visual: Cores para listas (Sinetes de Cor).  
- [x] Otimização de Espaço: Opção de colapsar colunas no Kanban.  
⸻  
## 🔴 Próximos Backlogs (Planejados)  
  
1. **Backlog 16.2+ (Conexão com o Mundo Exterior):** V16.2.0.0  
    - Implementação de iCal Feed (Link Dinâmico).  
    - Integração com Google Calendar API (Visualização de eventos externos).  
  
2. **Backlog 17.2 (Caminho da Liberdade - Filtros):** V17.2.0.0  
    - Filtros persistentes (Saved Searches).  
  
3. **Backlog 18 (Mobile Mastery - PWA):** V18.0.0.0  
    - Refinamento total para uso em dispositivos móveis (gestos de swipe).  
    - Configuração de Manifesto PWA para instalação como App nativo.  
  
4. **Backlog ∞ (Lojas Nativas - App Stores):** V∞  
    - Integração do Capacitor para empacotar o código web.  
* Compilação do binário ==.ipa== para Apple App Store e ==.aab== para Google Play Store.  
   
