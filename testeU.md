# Plano de Testes Manuais - Enki V17.1.0.0 (Blindagem de Segurança)

Este documento detalha os testes manuais necessários para validar as implementações recentes de segurança (Firebase Rules, Atomicidade, Sanitização XSS) e refatoração de tipagem.

Recomendamos a execução destes testes no ambiente de **Emulador do Firebase** ou em um ambiente de **Staging**, utilizando duas contas de usuário diferentes (Usuário A e Usuário B) para testar os controles de acesso (RBAC).

---

## 1. Testes de Segurança: Firebase Rules (Firestore & Storage)

**Objetivo:** Garantir que o Role-Based Access Control (RBAC) está bloqueando acessos não autorizados e que o Storage está protegido.

### Cenário 1.1: Acesso Restrito a Boards (IDOR) 
- **Ação:** Faça login com o `Usuário A` e crie um novo Quadro (Board). Não convide o `Usuário B`.
- **Ação:** Tente acessar a URL do quadro diretamente enquanto logado como `Usuário B` (ex: `http://localhost:5173/board/{id_do_quadro_do_usuario_A}`).
- **Resultado Esperado:** A interface deve exibir uma tela de erro/acesso negado ou redirecionar para o Dashboard. O console do navegador (Network/Console) deve registrar que o Firestore retornou um erro `Missing or insufficient permissions`.
STATUS DO TESTE ##EXECUTADO COM SUCESSO## 

### Cenário 1.2: Acesso a Coleções Aninhadas (Cards, Lists, Comments)
- **Ação:** Com o `Usuário B`, tente ler, modificar ou deletar um cartão que pertence ao `Usuário A`. (Pode ser simulado via requisição direta no console do navegador chamando funções do Firebase ou tentando interceptar chamadas).
- **Resultado Esperado:** O banco de dados deve rejeitar qualquer operação (leitura ou escrita) de um `uid` que não consta no array `members` do Board pai.
STATUS DO TESTE ##EXECUTADO COM SUCESSO## 


### Cenário 1.3: Bloqueio do Storage
- **Ação:** Faça logout da aplicação. Tente acessar diretamente a URL de um anexo (imagem/arquivo) salvo no Firebase Storage.
- **Resultado Esperado:** O acesso deve ser bloqueado (`HTTP 403 Forbidden`). Apenas usuários autenticados podem visualizar anexos.
STATUS DO TESTE ##EXECUTADO COM SUCESSO## 

### Cenário 1.4: Teste do Leitor Curioso (Granularidade de Permissões)
- **Ação:** Convide o `Usuário B` para o Board do `Usuário A` com a permissão de `viewer` (leitor). Logado como `Usuário B`, tente arrastar um cartão para outra lista ou adicionar um comentário (forçando a ação pelo console se a UI bloquear).
- **Resultado Esperado:** O Firestore deve rejeitar a transação com erro de permissão. Se a interface bloquear, mas o banco aceitar via script, a "Shadow Logic" ainda existe.
STATUS DO TESTE ##EXECUTADO COM SUCESSO##  

---

## 2. Testes de Transações Atômicas (writeBatch)

**Objetivo:** Validar que as operações de movimentação e cópia de cartões não geram dados corrompidos caso haja falha na rede (Shadow Logic mitigada).

### Cenário 2.1: Movimentação Atômica de Cartão
- **Ação:** Em um quadro com duas listas (Lista 1 e Lista 2), mova um cartão da Lista 1 para a Lista 2 arrastando-o (Drag and Drop) ou via menu "Mover".
- **Comportamento no Banco:** Monitore o Firestore.
- **Resultado Esperado:** O campo `listId` do cartão e a ordem (`order`) devem ser atualizados simultaneamente no banco. Não pode ocorrer do cartão sumir de uma lista e não aparecer na outra (mesmo que haja lentidão na rede).
STATUS DO TESTE ##EXECUTADO COM SUCESSO##  


### Cenário 2.2: Cópia Atômica de Cartão
- **Ação:** Copie um cartão cheio de metadados (tags, checklist, datas) para outro quadro.
- **Resultado Esperado:** O novo cartão deve aparecer no destino instantaneamente com todos os dados íntegros.

### Cenário 2.3: Falha Forçada no Batch (Atomicidade Real)
- **Ação:** Mova um cartão da Lista 1 para a Lista 2.
- **Comportamento no Banco:** Monitore a coleção `cards` e a coleção `activities` (ActivityLog / Inscrição de Escriba).
- **Resultado Esperado:** Ambas as coleções devem receber o update no mesmo milissegundo. Se por algum motivo o banco rejeitar o log de atividade (ex: erro de validação), a movimentação do cartão deve ser revertida/cancelada. É tudo ou nada.
STATUS DO TESTE ##EXECUTADO COM SUCESSO##  

---

## 3. Testes de Prevenção contra XSS (DOMPurify)

**Objetivo:** Confirmar que injeções de código malicioso são interceptadas e limpas pelo DOMPurify no frontend.

### Cenário 3.1: Injeção em Campos de Texto
- **Ação:** Como um usuário comum, adicione o seguinte payload malicioso em:
  1. Título de uma Lista
  2. Título de um Cartão
  3. Descrição do Cartão
  4. Texto de um Comentário
  5. Mensagem de Chat (Centro de Comando)
  
  **Payload de Teste:**
  ```html
  <script>alert('XSS executado!')</script>
  <img src="x" onerror="alert('XSS via Imagem!')">
  <b onmouseover="alert('XSS via Hover!')">Passe o mouse aqui</b>
  ```

- **Resultado Esperado:** 
  - Ao salvar e recarregar a página, **nenhum alerta (`alert()`) deve ser exibido**.
  - O código malicioso deve ser filtrado. Textos formatados inofensivos (como `<b>Passe o mouse aqui</b>`) podem ser exibidos com estilo, mas os manipuladores de eventos JavaScript (`onerror`, `onmouseover`) e tags `<script>` devem desaparecer completamente do DOM final gerado pelo React.
STATUS DO TESTE ##EXECUTADO COM SUCESSO##  
---

## 4. Testes de Tipagem Estrita (Anti-Any)

**Objetivo:** Garantir que o projeto compila sem erros de tipagem e que as propriedades opcionais não causam falhas (crashes).

### Cenário 4.1: Validação de Compilação
- **Ação:** No terminal, execute o script de build ou typecheck do projeto:
  ```bash
  npm run build
  # ou
  npx tsc --noEmit
  ```
- **Resultado Esperado:** A compilação deve passar sem exibir erros críticos de tipagem. A aplicação deve empacotar com sucesso.
STATUS DO TESTE ##EXECUTADO COM SUCESSO##
---

### Cenário 4.2: Formulários e Campos Personalizados
- **Ação:** No modal de um cartão, adicione e manipule "Campos Personalizados" (Custom Fields) de vários tipos (Texto, Número, Data, Checkbox, Select). Salve o cartão.
- **Resultado Esperado:** O cartão deve fechar e salvar sem travamentos na tela. Todos os tipos estritos vinculados ao `CustomFieldValue` devem fluir perfeitamente entre o formulário React e o Firestore.
STATUS DO TESTE ##EXECUTADO COM SUCESSO##
---

## 5. Testes de Prevenção contra Vazamento de Dados (Data Leakage)

**Objetivo:** Confirmar que informações sensíveis de usuários não trafegam na rede indevidamente.

### Cenário 5.1: Inspeção de Payload de Membros
- **Ação:** Com o `Usuário A`, abra o painel de configurações do Board onde o `Usuário B` é membro. Abra a aba Network (Rede) do DevTools do navegador e inspecione a resposta da chamada que busca os perfis dos membros.
- **Resultado Esperado:** O payload JSON deve conter apenas dados públicos (ex: `uid`, `displayName`, `photoURL`). Campos sensíveis do `Usuário B`, como e-mail completo, dados de faturamento ou métricas de armazenamento, não podem trafegar pela rede para o `Usuário A`.

STATUS DO TESTE ##EXECUTADO COM SUCESSO##

> **Nota de Arquitetura:** O arquivo `testeU.md` será o nosso manual de roteiro de testes. Porém, quando formos executar esses testes na prática, os resultados (Passou/Falhou) e o status da blindagem devem ser obrigatoriamente registrados no `reportStatus.md` para manter o rastreio oficial.
