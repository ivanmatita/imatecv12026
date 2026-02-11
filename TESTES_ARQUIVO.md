# ✅ TESTES - INTEGRAÇÃO ARQUIVO + LOCAL DE TRABALHO

## 📋 PLANO DE TESTES

Data: 11/02/2026
Sistema: IMATEC v1.2026
Módulo: Arquivo Digital + Local de Trabalho

---

## 🧪 TESTES FUNCIONAIS

### 1. PÁGINA ARQUIVO - LISTAR (SELECT)

#### Teste 1.1: Carregar Lista de Arquivos
- [ ] Abrir página "Arquivo Digital"
- [ ] Verificar se a lista de arquivos é carregada
- [ ] Verificar ordenação por `created_at desc`
- [ ] Verificar se todos os campos são exibidos corretamente

**Resultado Esperado:**
- Lista carregada com sucesso
- Arquivos ordenados do mais recente para o mais antigo
- Colunas: Nome, Tipo, Responsável, Data Registro, Assinado, Ações

#### Teste 1.2: Empty State
- [ ] Limpar todos os arquivos do banco (ou usar filtro que não retorna resultados)
- [ ] Verificar exibição do estado vazio

**Resultado Esperado:**
- Mensagem: "Nenhum documento encontrado"
- Ícone de pasta vazia
- Sugestão para adicionar novo arquivo

#### Teste 1.3: Loading State
- [ ] Abrir página e observar estado de carregamento
- [ ] Verificar se spinner é exibido

**Resultado Esperado:**
- Spinner animado durante carregamento
- Mensagem "Carregando..."

---

### 2. PÁGINA ARQUIVO - CRIAR (INSERT)

#### Teste 2.1: Criar Arquivo Mínimo
**Dados:**
```json
{
  "nome": "Teste Arquivo 001",
  "tipo": "Fatura"
}
```

**Passos:**
- [ ] Clicar em "Novo Arquivo"
- [ ] Preencher apenas campos obrigatórios
- [ ] Clicar em "Criar"

**Resultado Esperado:**
- ✅ Arquivo criado com sucesso
- ✅ Modal fechado
- ✅ Lista recarregada
- ✅ Novo arquivo aparece no topo
- ✅ `created_at` e `updated_at` preenchidos automaticamente

#### Teste 2.2: Criar Arquivo Completo
**Dados:**
```json
{
  "nome": "Fatura 2026/001",
  "tipo": "Fatura",
  "empresa_id": "[UUID do Local de Trabalho]",
  "responsavel": "João Silva",
  "contacto": "+244 923 456 789",
  "data_registo": "2026-02-11",
  "file_url": "https://example.com/file.pdf",
  "is_signed": true,
  "associated_doc_no": "FT 2026/001",
  "observacoes": "Teste completo",
  "ocorrencias": {"status": "pago"}
}
```

**Passos:**
- [ ] Clicar em "Novo Arquivo"
- [ ] Preencher TODOS os campos
- [ ] Selecionar Local de Trabalho no dropdown
- [ ] Marcar checkbox "Documento Assinado"
- [ ] Adicionar JSON válido em Ocorrências
- [ ] Clicar em "Criar"

**Resultado Esperado:**
- ✅ Arquivo criado com todos os campos
- ✅ Local de Trabalho associado corretamente
- ✅ Badge "Sim" exibido na coluna Assinado

#### Teste 2.3: Validação de Campos Obrigatórios
**Passos:**
- [ ] Clicar em "Novo Arquivo"
- [ ] Deixar campos obrigatórios vazios
- [ ] Tentar clicar em "Criar"

**Resultado Esperado:**
- ❌ Erro: "Nome e Tipo são obrigatórios"
- ❌ Formulário não é submetido

#### Teste 2.4: Validação de JSON
**Passos:**
- [ ] Clicar em "Novo Arquivo"
- [ ] Preencher campos obrigatórios
- [ ] Adicionar JSON inválido em Ocorrências: `{teste: invalido`
- [ ] Clicar em "Criar"

**Resultado Esperado:**
- ⚠️ JSON inválido é ignorado ou gera erro
- ✅ Arquivo criado sem o campo ocorrências (ou com null)

---

### 3. PÁGINA ARQUIVO - EDITAR (UPDATE)

#### Teste 3.1: Editar Arquivo Existente
**Passos:**
- [ ] Clicar no ícone de Editar de um arquivo
- [ ] Verificar se formulário é preenchido com dados atuais
- [ ] Modificar campo "Responsável"
- [ ] Clicar em "Atualizar"

**Resultado Esperado:**
- ✅ Formulário preenchido corretamente
- ✅ Arquivo atualizado com sucesso
- ✅ `updated_at` atualizado automaticamente
- ✅ Lista recarregada
- ✅ Alteração visível na tabela

#### Teste 3.2: Alterar Local de Trabalho
**Passos:**
- [ ] Editar arquivo
- [ ] Alterar Local de Trabalho no dropdown
- [ ] Salvar

**Resultado Esperado:**
- ✅ Local de Trabalho atualizado
- ✅ UUID correto salvo no banco

#### Teste 3.3: Marcar/Desmarcar Assinado
**Passos:**
- [ ] Editar arquivo
- [ ] Marcar checkbox "Documento Assinado"
- [ ] Salvar
- [ ] Verificar badge na tabela

**Resultado Esperado:**
- ✅ Badge muda de "Não" (cinza) para "Sim" (verde)

---

### 4. PÁGINA ARQUIVO - APAGAR (DELETE)

#### Teste 4.1: Apagar Arquivo
**Passos:**
- [ ] Clicar no ícone de Apagar
- [ ] Verificar mensagem de confirmação
- [ ] Confirmar

**Resultado Esperado:**
- ⚠️ Mensagem: "Tem certeza que deseja apagar este arquivo?"
- ✅ Arquivo removido do banco
- ✅ Lista recarregada
- ✅ Arquivo não aparece mais na tabela

#### Teste 4.2: Cancelar Apagar
**Passos:**
- [ ] Clicar no ícone de Apagar
- [ ] Cancelar na confirmação

**Resultado Esperado:**
- ❌ Arquivo NÃO é apagado
- ✅ Permanece na tabela

---

### 5. FILTROS E PESQUISA

#### Teste 5.1: Pesquisa por Nome
**Passos:**
- [ ] Digitar nome de arquivo na barra de pesquisa
- [ ] Verificar resultados

**Resultado Esperado:**
- ✅ Apenas arquivos com nome correspondente são exibidos

#### Teste 5.2: Pesquisa por Responsável
**Passos:**
- [ ] Digitar nome de responsável na barra de pesquisa
- [ ] Verificar resultados

**Resultado Esperado:**
- ✅ Apenas arquivos com responsável correspondente são exibidos

#### Teste 5.3: Filtro por Tipo
**Passos:**
- [ ] Selecionar "Faturas" no dropdown de tipo
- [ ] Verificar resultados

**Resultado Esperado:**
- ✅ Apenas arquivos do tipo "Fatura" são exibidos

#### Teste 5.4: Filtros Combinados
**Passos:**
- [ ] Digitar texto na pesquisa
- [ ] Selecionar tipo no dropdown
- [ ] Verificar resultados

**Resultado Esperado:**
- ✅ Apenas arquivos que atendem AMBOS os critérios são exibidos

---

### 6. INTEGRAÇÃO LOCAL DE TRABALHO

#### Teste 6.1: Carregar Locais de Trabalho
**Passos:**
- [ ] Abrir formulário de novo arquivo
- [ ] Verificar dropdown "Local de Trabalho"

**Resultado Esperado:**
- ✅ Dropdown populado com locais de trabalho do banco
- ✅ Ordenados alfabeticamente por nome
- ✅ Opção "Selecione..." no topo

#### Teste 6.2: Selecionar Local de Trabalho
**Passos:**
- [ ] Selecionar local de trabalho no dropdown
- [ ] Criar arquivo
- [ ] Verificar no banco se UUID foi salvo corretamente

**Resultado Esperado:**
- ✅ UUID do local de trabalho salvo em `empresa_id`
- ✅ Não salva nome, apenas ID

#### Teste 6.3: Local de Trabalho em SecretariaForm
**Passos:**
- [ ] Abrir formulário de Secretaria
- [ ] Verificar campo "Local de Trabalho"
- [ ] Selecionar local
- [ ] Salvar documento

**Resultado Esperado:**
- ✅ Dropdown funcional
- ✅ UUID salvo em `companyId`

---

## 🔧 TESTES TÉCNICOS

### 7. FUNÇÕES DO SUPABASE CLIENT

#### Teste 7.1: listarArquivos()
```typescript
const arquivos = await listarArquivos();
console.log('Total:', arquivos.length);
```

**Resultado Esperado:**
- ✅ Retorna array de arquivos
- ✅ Ordenado por `created_at desc`

#### Teste 7.2: criarArquivo()
```typescript
const novo = await criarArquivo({
  nome: 'Teste',
  tipo: 'Recibo'
});
console.log('Criado:', novo);
```

**Resultado Esperado:**
- ✅ Retorna objeto criado com ID
- ✅ `created_at` e `updated_at` preenchidos

#### Teste 7.3: atualizarArquivo()
```typescript
const atualizado = await atualizarArquivo(id, {
  nome: 'Teste Atualizado'
});
console.log('Atualizado:', atualizado);
```

**Resultado Esperado:**
- ✅ Retorna objeto atualizado
- ✅ `updated_at` atualizado

#### Teste 7.4: apagarArquivo()
```typescript
const apagado = await apagarArquivo(id);
console.log('Apagado:', apagado);
```

**Resultado Esperado:**
- ✅ Arquivo removido do banco
- ✅ Retorna confirmação

#### Teste 7.5: fetchLocalTrabalho()
```typescript
const locais = await fetchLocalTrabalho();
console.log('Locais:', locais);
```

**Resultado Esperado:**
- ✅ Retorna array com `id` e `nome`
- ✅ Ordenado alfabeticamente

---

## 🐛 TESTES DE ERRO

### 8. TRATAMENTO DE ERROS

#### Teste 8.1: Erro de Conexão
**Simular:** Desconectar internet
**Resultado Esperado:**
- ❌ Mensagem de erro clara
- ⚠️ Estado de erro exibido

#### Teste 8.2: Campo Obrigatório Vazio
**Resultado Esperado:**
- ❌ Validação impede submissão
- ⚠️ Mensagem de erro exibida

#### Teste 8.3: UUID Inválido
**Simular:** Passar UUID inválido para `empresa_id`
**Resultado Esperado:**
- ❌ Erro de foreign key
- ⚠️ Mensagem de erro tratada

---

## 📊 RESULTADOS DOS TESTES

### Resumo

| Categoria | Total | Passou | Falhou | Pendente |
|-----------|-------|--------|--------|----------|
| CRUD Básico | 12 | - | - | 12 |
| Validações | 4 | - | - | 4 |
| Filtros | 4 | - | - | 4 |
| Integração LT | 3 | - | - | 3 |
| Funções API | 5 | - | - | 5 |
| Erros | 3 | - | - | 3 |
| **TOTAL** | **31** | **0** | **0** | **31** |

---

## 📝 INSTRUÇÕES PARA EXECUTAR TESTES

### Preparação
1. Garantir que servidor está rodando: `npm run dev`
2. Garantir conexão com Supabase
3. Ter dados de teste no banco

### Execução
1. Seguir cada teste na ordem
2. Marcar checkbox quando concluído
3. Anotar resultados
4. Reportar bugs encontrados

### Critérios de Sucesso
- ✅ Todos os testes CRUD passam
- ✅ Validações funcionam corretamente
- ✅ Filtros retornam resultados esperados
- ✅ Integração com Local de Trabalho funcional
- ✅ Erros tratados adequadamente

---

## 🔍 BUGS CONHECIDOS

_Nenhum bug conhecido no momento._

---

## 📅 HISTÓRICO DE TESTES

| Data | Testador | Resultado | Observações |
|------|----------|-----------|-------------|
| 11/02/2026 | - | Pendente | Testes a executar |

---

## 🎯 PRÓXIMOS TESTES

1. Teste de performance com 1000+ registros
2. Teste de upload de arquivos para storage
3. Teste de permissões de usuário
4. Teste de auditoria (created_at, updated_at)

---

**Status:** 📋 Plano de Testes Criado
**Execução:** ⏳ Pendente
**Última Atualização:** 11/02/2026
