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

---

## 🔴 Próximos Backlogs (Planejados)

1. **Backlog 13 (Visões Supremos - Dashboards & Gráficos):** V13.0.0.0
   - Gráficos de produtividade (quantos Selos criados/concluídos por período).
   - Visualização de Calendário para prazos (Decretos com data).

2. **Backlog 14 (Mobile Mastery - PWA):** V14.0.0.0
   - Refinamento total para uso em dispositivos móveis (gestos de swipe no Scribe Mode).
