# Implementation Plan - V7: Busca & Filtros (O Graal)

Este plano foca em transformar a navegação do Ollert em algo profissional, permitindo encontrar informações rapidamente em grandes volumes de dados.

## Propostas de Mudanças

### 1. Dashboard (Busca Global)
- Adicionar um campo de busca no topo da grade de quadros.
- Filtragem local (client-side) para resposta instantânea.

### 2. Board Page (Filtro de Cartões)
- **Barra de Busca:** Input no Header do quadro para filtrar cartões por título/descrição.
- **Painel de Filtros:** Dropdown para selecionar:
  - Cores (Labels).
  - Membros.
  - Estado (Concluído, Atrasado, No Prazo).
- **Lógica de Filtro:** Implementar um hook ou função que processe a lista de cartões antes de renderizar nas colunas.

### 3. Feedback Visual
- Cartões que não atendem ao critério de busca ficarão com opacidade reduzida (0.2) ou serão ocultados (conforme escolha do usuário).
- Destaque nos cartões encontrados.

## Componentes Afetados

- `Dashboard.tsx`: Inclusão da busca de quadros.
- `Board.tsx`: Lógica central de filtragem de cartões.
- `CardItem.tsx`: Estilo visual para estado "filtrado".

## Plano de Verificação

### Testes Manuais
- [ ] Digitar no dashboard e ver os quadros filtrando em tempo real.
- [ ] No quadro, filtrar por "Vermelho" e ver apenas cartões com etiqueta vermelha.
- [ ] Combinar busca por texto + etiqueta.
- [ ] Verificar se o Drag & Drop continua funcionando com filtros ativos.
