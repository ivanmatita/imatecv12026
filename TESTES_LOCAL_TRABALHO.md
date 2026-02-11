# 🧪 GUIA DE TESTES - LOCAL DE TRABALHO

## 📋 TESTES OBRIGATÓRIOS

Execute os seguintes testes para validar a integração completa com Supabase MCP.

---

## 1️⃣ TESTE DE LISTAGEM (SELECT)

### Objetivo
Verificar se os dados são carregados corretamente do banco de dados.

### Passos
1. Acesse o sistema
2. Navegue até "Local de Trabalho" no menu lateral
3. Aguarde o carregamento da página

### Resultado Esperado
✅ A tabela deve exibir todos os locais de trabalho cadastrados no banco
✅ Os dados devem estar ordenados por data de criação (mais recentes primeiro)
✅ Se não houver dados, deve exibir "Nenhum local registado no sistema"
✅ Durante o carregamento, deve exibir um indicador de loading

### Validação no Banco
```sql
SELECT * FROM local_trabalho ORDER BY created_at DESC;
```

---

## 2️⃣ TESTE DE CRIAÇÃO (INSERT)

### Objetivo
Verificar se novos locais são criados corretamente no banco de dados.

### Passos
1. Clique no botão "ADICIONAR LOCAL"
2. Preencha os campos:
   - **Nome**: "Loja Teste Central" (obrigatório)
   - **Título**: "Filial Principal"
   - **Código**: "LJ-TEST-001"
   - **Tipo**: Selecione "LOJA"
   - **Endereço**: "Rua Teste, 123, Luanda"
   - **Localização**: "Zona Norte"
   - **Telefone**: "+244 923 456 789"
   - **Contacto**: "teste@imatec.ao"
   - **Responsável**: "João Silva"
   - **Data Abertura**: Selecione data atual
   - **Efetivos por Dia**: 10
   - **Total Efetivos**: 50
   - **Descrição**: "Local de teste para validação"
   - **Observações**: "Criado durante teste de integração"
3. Clique em "Guardar"

### Resultado Esperado
✅ Deve exibir mensagem "✅ Local de trabalho criado com sucesso!"
✅ O modal deve fechar automaticamente
✅ A lista deve ser atualizada automaticamente
✅ O novo local deve aparecer no topo da lista

### Validação no Banco
```sql
SELECT * FROM local_trabalho WHERE nome = 'Loja Teste Central';
```

### Verificações Adicionais
- ✅ O campo `id` deve ser um UUID válido
- ✅ O campo `created_at` deve ter a data/hora atual
- ✅ Todos os campos preenchidos devem estar salvos corretamente

---

## 3️⃣ TESTE DE EDIÇÃO (UPDATE)

### Objetivo
Verificar se as alterações são salvas corretamente no banco de dados.

### Passos
1. Localize o local criado no teste anterior ("Loja Teste Central")
2. Clique no ícone de "Editar" (lápis)
3. Modifique os seguintes campos:
   - **Nome**: "Loja Teste Central - ATUALIZADA"
   - **Telefone**: "+244 999 888 777"
   - **Total Efetivos**: 75
   - **Observações**: "Atualizado em [data atual]"
4. Clique em "Atualizar"

### Resultado Esperado
✅ Deve exibir mensagem "✅ Local de trabalho atualizado com sucesso!"
✅ O modal deve fechar automaticamente
✅ A lista deve ser atualizada automaticamente
✅ As alterações devem aparecer na tabela

### Validação no Banco
```sql
SELECT nome, telefone, total_efectivos, observacoes 
FROM local_trabalho 
WHERE nome LIKE '%ATUALIZADA%';
```

### Verificações Adicionais
- ✅ O campo `id` deve permanecer o mesmo
- ✅ O campo `created_at` NÃO deve ser alterado
- ✅ Apenas os campos modificados devem ter novos valores

---

## 4️⃣ TESTE DE EXCLUSÃO (DELETE)

### Objetivo
Verificar se os locais são removidos corretamente do banco de dados.

### Passos
1. Localize o local atualizado ("Loja Teste Central - ATUALIZADA")
2. Clique no ícone de "Apagar" (lixeira)
3. Leia a mensagem de confirmação
4. Clique em "OK" para confirmar

### Resultado Esperado
✅ Deve exibir popup de confirmação com o nome do local
✅ Após confirmar, deve exibir "✅ Local de trabalho apagado com sucesso!"
✅ A lista deve ser atualizada automaticamente
✅ O local deve desaparecer da tabela

### Validação no Banco
```sql
SELECT * FROM local_trabalho WHERE nome LIKE '%ATUALIZADA%';
-- Deve retornar 0 registros
```

---

## 5️⃣ TESTE DE VALIDAÇÃO

### Objetivo
Verificar se as validações estão funcionando corretamente.

### Teste 5.1: Campo Obrigatório
1. Clique em "ADICIONAR LOCAL"
2. Deixe o campo "Nome" vazio
3. Preencha outros campos
4. Clique em "Guardar"

**Resultado Esperado**: ✅ Deve exibir "❌ O nome é obrigatório!"

### Teste 5.2: Cancelamento
1. Clique em "ADICIONAR LOCAL"
2. Preencha alguns campos
3. Clique em "Cancelar"

**Resultado Esperado**: 
✅ O modal deve fechar
✅ Nenhum dado deve ser salvo
✅ O formulário deve ser limpo

---

## 6️⃣ TESTE DE ATUALIZAÇÃO AUTOMÁTICA

### Objetivo
Verificar se a lista é atualizada após cada operação.

### Passos
1. Abra o console do navegador (F12)
2. Vá para a aba "Network"
3. Execute qualquer operação (CREATE, UPDATE ou DELETE)
4. Observe as requisições HTTP

### Resultado Esperado
✅ Após INSERT: deve haver uma requisição SELECT
✅ Após UPDATE: deve haver uma requisição SELECT
✅ Após DELETE: deve haver uma requisição SELECT
✅ A lista deve sempre refletir o estado atual do banco

---

## 7️⃣ TESTE DE TODOS OS CAMPOS

### Objetivo
Verificar se todos os 19 campos são salvos corretamente.

### Passos
1. Clique em "ADICIONAR LOCAL"
2. Preencha TODOS os campos:
   - Nome: "Local Completo Teste"
   - Título: "Título Teste"
   - Código: "LJ-FULL-001"
   - Tipo: "ARMAZEM"
   - Endereço: "Endereço Completo Teste"
   - Localização: "Localização Teste"
   - Telefone: "+244 111 222 333"
   - Contacto: "contato@teste.ao"
   - Responsável: "Maria Santos"
   - Cliente ID: "00000000-0000-0000-0000-000000000002"
   - Data Abertura: "2026-01-01"
   - Data Encerramento: "2026-12-31"
   - Efetivos por Dia: 25
   - Total Efetivos: 100
   - Descrição: "Descrição completa do local de teste"
   - Observações: "Observações detalhadas para teste"
3. Clique em "Guardar"

### Validação no Banco
```sql
SELECT * FROM local_trabalho WHERE codigo = 'LJ-FULL-001';
```

### Verificações
✅ Todos os 19 campos devem estar preenchidos no banco
✅ Nenhum campo deve estar NULL (exceto os opcionais vazios)
✅ Os tipos de dados devem estar corretos (text, int, date, uuid)

---

## 8️⃣ TESTE DE ERRO

### Objetivo
Verificar se os erros são tratados corretamente.

### Teste 8.1: Erro de Conexão
1. Desconecte a internet (ou bloqueie o Supabase)
2. Tente criar um novo local
3. Observe a mensagem de erro

**Resultado Esperado**: ✅ Deve exibir mensagem de erro clara

### Teste 8.2: Erro de Validação do Banco
1. Tente inserir um UUID inválido no campo Cliente ID
2. Clique em "Guardar"

**Resultado Esperado**: ✅ Deve exibir mensagem de erro do Supabase

---

## 9️⃣ TESTE DE PERFORMANCE

### Objetivo
Verificar se a aplicação mantém boa performance.

### Passos
1. Crie 10 locais de trabalho
2. Observe o tempo de carregamento
3. Execute operações de edição e exclusão

### Resultado Esperado
✅ A listagem deve carregar em menos de 2 segundos
✅ As operações CRUD devem completar em menos de 1 segundo
✅ Não deve haver travamentos ou lentidão

---

## 🔟 TESTE DE RECARREGAMENTO

### Objetivo
Verificar se o botão de recarregar funciona corretamente.

### Passos
1. Clique no botão "Recarregar" (ícone de refresh)
2. Observe o indicador de loading
3. Verifique se a lista é atualizada

### Resultado Esperado
✅ O ícone deve girar durante o carregamento
✅ A lista deve ser atualizada com dados do banco
✅ Não deve haver duplicação de dados

---

## ✅ CHECKLIST DE VALIDAÇÃO

Marque cada teste após execução bem-sucedida:

- [ ] 1. Listagem (SELECT) funcionando
- [ ] 2. Criação (INSERT) funcionando
- [ ] 3. Edição (UPDATE) funcionando
- [ ] 4. Exclusão (DELETE) funcionando
- [ ] 5. Validações funcionando
- [ ] 6. Atualização automática após operações
- [ ] 7. Todos os 19 campos salvando corretamente
- [ ] 8. Tratamento de erros funcionando
- [ ] 9. Performance adequada
- [ ] 10. Botão recarregar funcionando

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

A integração será considerada **100% completa** quando:

✅ Todos os 10 testes passarem sem erros
✅ Nenhuma funcionalidade existente for afetada
✅ Todos os dados forem persistidos corretamente no Supabase
✅ A interface responder de forma rápida e fluida
✅ Mensagens de erro e sucesso forem claras e informativas

---

## 📊 VALIDAÇÃO FINAL NO BANCO

Execute esta query para validar a estrutura completa:

```sql
-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'local_trabalho'
ORDER BY 
    ordinal_position;

-- Verificar dados de teste
SELECT 
    id,
    nome,
    codigo,
    tipo,
    created_at
FROM 
    local_trabalho
ORDER BY 
    created_at DESC
LIMIT 10;
```

---

## 🚀 PRÓXIMOS PASSOS

Após validar todos os testes:

1. ✅ Marcar todos os itens do checklist
2. ✅ Documentar quaisquer problemas encontrados
3. ✅ Fazer commit das alterações
4. ✅ Fazer deploy para produção
5. ✅ Treinar usuários finais

---

**Data de Criação**: 2026-02-11
**Versão**: 1.0
**Status**: Pronto para Testes
