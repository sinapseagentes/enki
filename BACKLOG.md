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

## 🔴 Próximos Backlogs (Planejados)

1. **Backlog 14 (Campos Ancestrais - Custom Fields):** V14.0.0.0
   - Criação de campos personalizados (Texto, Data, Checkbox) por Quadro.
   - Exibição dos campos na capa do cartão.

2. **Backlog 15 (Visões de Oráculo - Calendar & Table):** V15.0.0.0
   - Visualização de Calendário para datas de entrega.
   - Visualização em Tabela (estilo planilha) para edição em massa.

3. **Backlog 16 (Caminho da Liberdade - Export & UI Polish):** V16.0.0.0
   - Exportação de dados do quadro em JSON/CSV.
   - Filtros persistentes (Saved Searches).
   - Cores para listas e opção de colapsar colunas.

4. **Backlog 17 (Mobile Mastery - PWA):** V17.0.0.0
   - Refinamento total para uso em dispositivos móveis (gestos de swipe).
   - Configuração de Manifesto PWA para instalação como App nativo.

5. **Backlog ∞ (Lojas Nativas - App Stores):** V∞
   - Integração do Capacitor para empacotar o código web.
   - Compilação do binário `.ipa` para Apple App Store e `.aab` para Google Play Store.
