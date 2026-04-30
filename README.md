# Enki - Trello Clone Premium

Desenvolvimento de um clone do Trello usando as melhores práticas de **ACID, SOLID, SCRUM, UI/UX e Secure by Design (SbD)**.

## 🚀 Tecnologias

- **Frontend:** React + TypeScript + Vite
- **Estilização:** Tailwind CSS v4 + Vanilla CSS
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Animações:** Framer Motion / CSS Transitions

## 📅 Status do Projeto

Atualmente na **V17.1.0.0** — Todos os backlogs até **Sincronização & Portabilidade (Backlog 17)** estão entregues.

### Backlogs Entregues

| Backlog | Descrição                        | Versão    |
| ------- | -------------------------------- | --------- |
| 0–7     | Fundação, CRUD, DnD, Busca       | V7.5.0.1  |
| 8       | Command Center (Side Panels)     | V8.0.0.0  |
| 9       | Gestão de Itens (Mover/Copiar)   | V9.0.0.0  |
| 10      | Privacidade (Permissões)         | V10.1.0.0 |
| 11      | Automação (Butler simplificado)  | V11.3.0.0 |
| 12      | Hub Social (Presença Real-time)  | V12.4.0.0 |
| 13      | Dashboards & Métricas            | V13.1.0.0 |
| 14      | Custom Fields (Campos)           | V14.0.0.0 |
| 15      | Views (Table & Calendar)         | V15.0.0.0 |
| 16      | Export iCal                      | V16.1.0.0 |
| 17      | Export JSON/CSV & Kanban UX      | V17.1.0.0 |

Para ver o progresso detalhado de cada Sprint e Feature, acesse:

👉 [BACKLOG.md](./BACKLOG.md)

## 🛠️ Como rodar o projeto

1. Instale as dependências: `npm install`
2. Inicie o Firebase Emulator: `firebase emulators:start`
3. Inicie o servidor de desenvolvimento: `npm run dev`

## 🏷️ Versionamento

O projeto segue o padrão `Vx.y.z.k`:

- **x:** Major version (0 para pre-MVP)
- **y:** Backlog (Sprint)
- **z:** Feature dentro do backlog
- **k:** Correções de erro

## 📊 Arquitetura

```text
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

- [reportStatus.md](./reportStatus.md) — Análise completa do projeto vs backlog
