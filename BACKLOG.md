# 📋 Backlog Enki - SCRUM Control

Este arquivo rastreia o desenvolvimento do Enki seguindo as regras de versionamento `Vx.y.z.k`.

---

## 🟢 Backlog 0 a 7 - [ENTREGUE]

*Status: Concluído | Versão: V7.5.0.1*

*(Veja o histórico completo nas versões anteriores)*

---

## 🟢 Backlog 8 (Command Center - Side Panels) - [ENTREGUE]

*Status: Concluído | Versão: V8.0.0.0*

1. **Feature 8.1.0.0:** [x] Criar `CommandCenter.tsx` com Tabs (Atividades/Notificações/Mensagens).
2. **Feature 8.2.0.0:** [x] Implementar Backdrop Blur e Animação Lateral Premium.
3. **Feature 8.3.0.0:** [x] Sincronizar o Sino e o Histórico para abrirem o mesmo painel.

---

## 🟢 Backlog 9 (Gestão de Itens - Mover/Copiar) - [ENTREGUE]

*Status: Concluído | Versão: V9.0.0.0*

1. **Feature 9.1.0.0:** [x] Criar interface de "Mover" e "Copiar" no `CardModal`.
2. **Feature 9.2.0.0:** [x] Implementar lógica de transposição entre quadros no `cardService`.
3. **Feature 9.3.0.0:** [x] Suporte a seleção de Quadro -> Lista -> Posição.

---

## 🟢 Backlog 10 (Privacidade) - [ENTREGUE]

*Status: Concluído | Versão: V10.1.0.0*

1. **Feature 10.1.0.0:** [x] Implementar níveis de permissão (owner/admin/editor/viewer).
2. **Feature 10.2.0.0:** [x] Adicionar campo permissions ao Board com mapeamento userId -> nível.
3. **Feature 10.3.0.0:** [x] Atualizar createBoard para definir owner como 'owner'.
4. **Feature 10.4.0.0:** [x] Atualizar inviteUserToBoard para definir convidado como 'editor'.
5. **Feature 10.5.0.0:** [x] Implementar interface de gerenciamento de permissões no SettingsModal (agora exibindo o identifier/displayName do usuário).
6. **Feature 10.6.0.0:** [x] Adicionar campo permissions ao Card para permissões específicas por item.

---

## 🟢 Backlog 11 (Automação) - [ENTREGUE]

*Status: Concluído | Versão: V11.3.0.0*

1. **Feature 11.1.0.0:** [x] Criar sistema Butler simplificado com regras automáticas (`AutomationModal.tsx`).
2. **Feature 11.2.0.0:** [x] Implementar triggers: card_created, card_moved, card_archived.
3. **Feature 11.3.0.0:** [x] Implementar actions: move, add_label, set_due_date.

---

## 🟢 Backlog 12 (Hub Social - O Grande Zigurate) - [ENTREGUE]

*Status: Concluído | Versão: V12.4.0.0*

1. **Feature 12.1.0.0:** [x] Modelo de Perfil Expandido (`UserProfile` com bio, title, etc).
2. **Feature 12.2.0.0:** [x] Página de Perfil personalizada com métricas de usuário.
3. **Feature 12.3.0.0:** [x] Motor de Presença Real-Time via heartbeat e Firestore.
4. **Feature 12.4.0.0:** [x] Indicadores visuais de presença (Navbar, Board, CommandCenter).

## 🟢 Backlog 13 (Visões Supremos - Dashboards & Armazenamento) - [ENTREGUE]

*Status: Concluído | Versão: V13.1.0.0*

1. **Feature 13.1.0.0:** [x] Atualização de Attachment, Board, List, Card e UserProfile para suportar `storageMetrics`.
2. **Feature 13.2.0.0:** [x] Motor de armazenamento em tempo real usando batches do Firestore.
3. **Feature 13.3.0.0:** [x] Novo `StorageDashboard` detalhando consumo por Quadro, Lista e Cartão.
4. **Feature 13.4.0.0:** [x] Painel Administrativo (`/admin`) para gestão de cotas e usuários fantasmas.
5. **Feature 13.5.0.0:** [x] Propriedade de cartões automática e mensagens de erro explícitas.

---

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

---

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

---

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
   - Compilação do binário `.ipa` para Apple App Store e `.aab` para Google Play Store.

5. **Backlog (Painel Administrativo - Segurança):** `[PRIORIDADE: SEGURANÇA]`
   - Implementar exclusão completa de usuário (Banimento). A lógica no código deverá chamar duas funções simultâneas:
     - Uma para excluir a conta no Auth (`deleteUser(uid)`).
     - Outra para deletar o documento no Firestore (`deleteDoc(...)`), garantindo o acionamento da trava de segurança global no mesmo milissegundo.
