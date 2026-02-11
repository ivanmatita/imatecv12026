# 🧪 GUIA DE TESTES - SECRETARIA DOCUMENTOS

## ✅ CHECKLIST DE VALIDAÇÃO

Use este guia para validar a integração completa da página de Secretaria com Supabase MCP.

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar os testes, certifique-se de que:

- [ ] O servidor de desenvolvimento está rodando (`npm run dev`)
- [ ] A conexão com Supabase está ativa
- [ ] A tabela `secretaria_documentos` existe no banco
- [ ] Você tem acesso à página de Secretaria no sistema

---

## 🧪 TESTE 1: LISTAR (SELECT)

### Objetivo
Verificar se a página carrega documentos do banco de dados.

### Passos

1. Acesse a página de Secretaria
2. Aguarde o carregamento

### ✅ Resultado Esperado

- [ ] A página carrega sem erros
- [ ] Documentos existentes são exibidos na tabela
- [ ] Documentos estão ordenados por data (mais recentes primeiro)
- [ ] Todos os campos são exibidos corretamente:
  - Data
  - Número
  - Tipo
  - Assunto
  - Destinatário
- [ ] Botões de ação estão visíveis (Imprimir, Editar, Apagar)

### 🐛 Se falhar

- Verifique o console do navegador (F12)
- Verifique se a tabela `secretaria_documentos` existe
- Verifique as credenciais do Supabase

---

## 🧪 TESTE 2: CRIAR (INSERT)

### Objetivo
Verificar se é possível criar um novo documento.

### Passos

1. Clique no botão **"Criar Documento"**
2. Preencha os campos obrigatórios:
   - **Destinatário:** "MINISTÉRIO DAS FINANÇAS"
   - **Assunto:** "Solicitação de Certidão de Quitação Fiscal"
   - **Corpo:** Digite um texto qualquer
3. Clique em **"Salvar Documento"**

### ✅ Resultado Esperado

- [ ] Formulário abre sem erros
- [ ] Campos são preenchidos corretamente
- [ ] Ao salvar, aparece mensagem: "Documento criado com sucesso!"
- [ ] Retorna à lista automaticamente
- [ ] Novo documento aparece na lista (no topo)
- [ ] Todos os dados estão corretos

### 🐛 Se falhar

- Verifique se os campos obrigatórios foram preenchidos
- Verifique o console para erros de validação
- Verifique se `empresa_id` está configurado

---

## 🧪 TESTE 3: EDITAR (UPDATE)

### Objetivo
Verificar se é possível editar um documento existente.

### Passos

1. Na lista, clique no botão **"Editar"** (✏️) de um documento
2. Modifique o campo **Assunto** para: "Assunto Modificado - Teste"
3. Clique em **"Salvar Documento"**

### ✅ Resultado Esperado

- [ ] Formulário abre com dados do documento
- [ ] Campos estão preenchidos corretamente
- [ ] Ao salvar, aparece mensagem: "Documento atualizado com sucesso!"
- [ ] Retorna à lista automaticamente
- [ ] Documento atualizado aparece com novo assunto
- [ ] Campo `updated_at` foi atualizado no banco

### 🐛 Se falhar

- Verifique se o documento existe no banco
- Verifique se o ID do documento é válido
- Verifique permissões de UPDATE no Supabase

---

## 🧪 TESTE 4: APAGAR (DELETE)

### Objetivo
Verificar se é possível apagar um documento.

### Passos

1. Na lista, clique no botão **"Apagar"** (🗑️) de um documento
2. Na confirmação, clique em **"OK"**

### ✅ Resultado Esperado

- [ ] Aparece confirmação: "Tem certeza que deseja apagar..."
- [ ] Ao confirmar, aparece mensagem: "Documento apagado com sucesso!"
- [ ] Documento desaparece da lista
- [ ] Lista é atualizada automaticamente
- [ ] Documento foi removido do banco

### 🐛 Se falhar

- Verifique se o documento não está bloqueado
- Verifique permissões de DELETE no Supabase
- Verifique se há restrições de foreign key

---

## 🧪 TESTE 5: SINCRONIZAÇÃO

### Objetivo
Verificar se o botão de sincronização funciona.

### Passos

1. Clique no botão **"Sincronizar"** (🔄) no cabeçalho
2. Aguarde o carregamento

### ✅ Resultado Esperado

- [ ] Ícone de loading aparece
- [ ] Lista é recarregada do banco
- [ ] Documentos são exibidos corretamente
- [ ] Nenhum erro no console

---

## 🧪 TESTE 6: VALIDAÇÃO DE CAMPOS

### Objetivo
Verificar se a validação de campos obrigatórios funciona.

### Passos

1. Clique em **"Criar Documento"**
2. Deixe os campos **Destinatário** e **Assunto** vazios
3. Clique em **"Salvar Documento"**

### ✅ Resultado Esperado

- [ ] Aparece alerta: "Preencha o Destinatário e o Assunto"
- [ ] Documento NÃO é salvo
- [ ] Formulário permanece aberto

---

## 🧪 TESTE 7: TRATAMENTO DE ERROS

### Objetivo
Verificar se erros são tratados corretamente.

### Passos

1. Desconecte a internet (ou pause a conexão)
2. Tente criar um novo documento
3. Clique em **"Salvar Documento"**

### ✅ Resultado Esperado

- [ ] Aparece mensagem de erro amigável
- [ ] Documento é salvo localmente (fallback)
- [ ] Usuário é informado da situação
- [ ] Sistema não trava

---

## 🧪 TESTE 8: VISUALIZAÇÃO/IMPRESSÃO

### Objetivo
Verificar se a funcionalidade de impressão funciona.

### Passos

1. Clique no botão **"Visualizar/Imprimir"** (🖨️) de um documento
2. Verifique o modal de impressão

### ✅ Resultado Esperado

- [ ] Modal de impressão abre
- [ ] Documento é exibido em formato A4
- [ ] Todos os dados estão visíveis
- [ ] Botão "Imprimir Agora" funciona
- [ ] Botão "Fechar" funciona

---

## 🧪 TESTE 9: PESQUISA

### Objetivo
Verificar se a pesquisa funciona.

### Passos

1. Digite um termo no campo de pesquisa
2. Verifique os resultados

### ✅ Resultado Esperado

- [ ] Documentos são filtrados em tempo real
- [ ] Pesquisa funciona por:
  - Assunto
  - Número
  - Destinatário
- [ ] Resultados são exibidos corretamente

---

## 🧪 TESTE 10: PERSISTÊNCIA

### Objetivo
Verificar se os dados persistem após reload.

### Passos

1. Crie um novo documento
2. Recarregue a página (F5)
3. Verifique se o documento ainda está lá

### ✅ Resultado Esperado

- [ ] Documento criado permanece na lista
- [ ] Todos os dados estão corretos
- [ ] Nenhuma perda de informação

---

## 📊 RESUMO DOS TESTES

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | LISTAR (SELECT) | ⬜ | |
| 2 | CRIAR (INSERT) | ⬜ | |
| 3 | EDITAR (UPDATE) | ⬜ | |
| 4 | APAGAR (DELETE) | ⬜ | |
| 5 | SINCRONIZAÇÃO | ⬜ | |
| 6 | VALIDAÇÃO | ⬜ | |
| 7 | ERROS | ⬜ | |
| 8 | IMPRESSÃO | ⬜ | |
| 9 | PESQUISA | ⬜ | |
| 10 | PERSISTÊNCIA | ⬜ | |

**Legenda:**
- ⬜ Não testado
- ✅ Passou
- ❌ Falhou

---

## 🔍 VERIFICAÇÃO NO BANCO DE DADOS

### Consultas SQL para Validação

```sql
-- Ver todos os documentos
SELECT * FROM secretaria_documentos ORDER BY created_at DESC;

-- Ver documento específico
SELECT * FROM secretaria_documentos WHERE id = 'SEU_ID_AQUI';

-- Verificar campos automáticos
SELECT id, created_at, updated_at FROM secretaria_documentos;

-- Contar documentos
SELECT COUNT(*) FROM secretaria_documentos;
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Erro de ligação"

**Solução:**
1. Verifique conexão com internet
2. Verifique credenciais do Supabase em `.env`
3. Verifique se o projeto Supabase está ativo

### Problema: "Campos obrigatórios não preenchidos"

**Solução:**
1. Verifique se `destinatario_nome` e `assunto` estão preenchidos
2. Verifique se não há espaços em branco apenas

### Problema: "Erro: Referência inválida"

**Solução:**
1. Verifique se `empresa_id` é um UUID válido
2. Verifique se `serie_id` existe na tabela `series`

### Problema: Documento não aparece na lista

**Solução:**
1. Clique em "Sincronizar"
2. Verifique se o documento foi realmente criado no banco
3. Verifique ordenação (created_at DESC)

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

Para considerar a integração como **APROVADA**, todos os testes devem:

- [ ] Passar sem erros
- [ ] Funcionar conforme esperado
- [ ] Não quebrar funcionalidades existentes
- [ ] Persistir dados corretamente no banco
- [ ] Tratar erros adequadamente

---

## 📝 RELATÓRIO DE TESTES

Após completar todos os testes, preencha:

**Data do Teste:** ___/___/______

**Testado por:** _____________________

**Ambiente:** [ ] Desenvolvimento [ ] Produção

**Resultado Geral:** [ ] ✅ Aprovado [ ] ❌ Reprovado

**Observações:**
_________________________________________________
_________________________________________________
_________________________________________________

---

**Próximo Passo:** Se todos os testes passarem, a integração está pronta para produção! 🎉
