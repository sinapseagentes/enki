# 📋 Backlog Ollert - SCRUM Control

Este arquivo rastreia o desenvolvimento do Ollert seguindo as regras de versionamento `Vx.y.z.k`.

---

## 🟢 Backlog 0 a 7 - [ENTREGUE]

*Status: Concluído | Versão: V7.5.0.1*

*(Veja o histórico completo nas versões anteriores)*

---

## 🟡 Backlog 8 (Command Center - Side Panels) - [EM ANDAMENTO]

*Status: 10% Concluído | Versão Base: V8.0.0.0*

1. **Feature 8.1.0.0:** [ ] Criar `CommandCenter.tsx` com Tabs (Atividades/Notificações).
2. **Feature 8.2.0.0:** [ ] Implementar Backdrop Blur e Animação Lateral Premium.
3. **Feature 8.3.0.0:** [ ] Sincronizar o Sino e o Histórico para abrirem o mesmo painel.

---

## 🟡 Backlog 9 (Gestão de Itens - Mover/Copiar) - [EM ANDAMENTO]

*Status: 0% Concluído | Versão Base: V9.0.0.0*

1. **Feature 9.1.0.0:** [ ] Criar interface de "Mover" e "Copiar" no `CardModal`.
2. **Feature 9.2.0.0:** [ ] Implementar lógica de transposição entre quadros no `cardService`.
3. **Feature 9.3.0.0:** [ ] Suporte a seleção de Quadro -> Lista -> Posição.

---

## 🟢 Backlog 10 (Privacidade) - [ENTREGUE]

*Status: Concluído | Versão: V10.0.0.0*

1. **Feature 10.1.0.0:** [x] Implementar níveis de permissão (owner/admin/editor/viewer).
2. **Feature 10.2.0.0:** [x] Adicionar campo permissions ao Board com mapeamento userId -> nível.
3. **Feature 10.3.0.0:** [x] Atualizar createBoard para definir owner como 'owner'.
4. **Feature 10.4.0.0:** [x] Atualizar inviteUserToBoard para definir convidado como 'editor'.

---

## 🟡 Backlog 11 (Automação) - [EM ANDAMENTO]

*Status: 0% Concluído | Versão Base: V11.0.0.0*

1. **Feature 11.1.0.0:** [ ] Criar sistema Butler simplificado com regras automáticas.
2. **Feature 11.2.0.0:** [ ] Implementar triggers: card_created, card_moved, card_archived.
3. **Feature 11.3.0.0:** [ ] Implementar actions: move, add_label, set_due_date.

---

## 🔴 Próximos Backlogs (Planejados)

1. **Backlog 12 (Hub Social - O Grande Zigurate):** V12.0.0.0
   - Perfis de Usuários: Página de perfil personalizada (com estatísticas de "Escribas").
   - Presença em Real-Time: Ver quem está online na Tábua (indicadores de presença).

2. **Backlog 13 (Visões Supremos - Dashboards & Gráficos):** V13.0.0.0
   - Gráficos de produtividade (quantos Selos criados/concluídos por período).
   - Visualização de Calendário para prazos (Decretos com data).

3. **Backlog 14 (Mobile Mastery - PWA):** V14.0.0.0
   - Refinamento total para uso em dispositivos móveis (gestos de swipe no Scribe Mode).
