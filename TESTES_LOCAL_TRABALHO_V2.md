# 🧪 GUIA DE TESTES - LOCAL DE TRABALHO V2.0

## 📋 TESTES OBRIGATÓRIOS

Data: 11/02/2026
Versão: 2.0

---

## ✅ PREPARAÇÃO

### **1. Verificar Build**
```bash
npm run build
```
**Resultado Esperado:** Build sem erros

### **2. Iniciar Aplicação**
```bash
npm run dev
```
**Resultado Esperado:** Aplicação rodando em http://localhost:3000

### **3. Acessar Página**
- Navegar até "Local de Trabalho" no menu lateral
- **Resultado Esperado:** Página carrega sem erros

---

## 🔍 TESTE 1: LISTAR (SELECT)

### **Objetivo:** Verificar se os dados são carregados do banco

### **Passos:**
1. Acessar página "Local de Trabalho"
2. Observar a tabela

### **Verificações:**
- ✅ Dados aparecem na tabela
- ✅ Colunas corretas: Código, Nome, Tipo, Cliente, Responsável, Trabalhadores, Data Abertura, Ações
- ✅ Badge "Cloud Sync" aparece no header
- ✅ Dados ordenados por data de criação (mais recentes primeiro)
- ✅ Cliente exibido corretamente (nome do cliente, não UUID)

### **Resultado Esperado:**
```
✅ Tabela preenchida com dados reais do Supabase
✅ Nenhum erro no console
✅ Loading spinner aparece durante carregamento
```

---

## ➕ TESTE 2: CRIAR (INSERT)

### **Objetivo:** Verificar criação de novo local de trabalho

### **Passos:**
1. Clicar em "Novo Local"
2. Preencher formulário:
   - **Nome:** "Loja Teste 001" *(obrigatório)*
   - **Cliente:** Selecionar um cliente do dropdown *(obrigatório)*
   - **Tipo:** "LOJA"
   - **Código:** "LJ-TEST-001"
   - **Responsável:** "João Silva"
   - **Número de Trabalhadores:** 5
   - **Total Trabalhadores:** 10
   - **Data Abertura:** Data atual
3. Clicar em "Guardar"

### **Verificações:**
- ✅ Modal abre corretamente
- ✅ Dropdown de clientes carrega lista do banco
- ✅ Todos os campos estão visíveis e funcionais
- ✅ Formulário organizado em 4 seções
- ✅ Validação de campos obrigatórios funciona
- ✅ Loading spinner aparece durante salvamento
- ✅ Mensagem de sucesso aparece
- ✅ Modal fecha automaticamente
- ✅ Novo local aparece na tabela
- ✅ Dados do novo local estão corretos

### **Resultado Esperado:**
```
✅ Local criado com sucesso
✅ Mensagem: "✅ Local de trabalho criado com sucesso!"
✅ Novo registro visível na tabela
✅ Dados persistidos no Supabase
```

---

## ✏️ TESTE 3: EDITAR (UPDATE)

### **Objetivo:** Verificar edição de local existente

### **Passos:**
1. Clicar no ícone de "Editar" (lápis azul) em qualquer local
2. Modificar campos:
   - **Nome:** Adicionar " - EDITADO"
   - **Responsável:** Mudar para outro nome
   - **Número de Trabalhadores:** Alterar valor
3. Clicar em "Atualizar"

### **Verificações:**
- ✅ Modal abre com dados preenchidos
- ✅ Todos os campos contêm os valores corretos
- ✅ Cliente aparece selecionado corretamente
- ✅ Modificações são salvas
- ✅ Loading spinner aparece
- ✅ Mensagem de sucesso aparece
- ✅ Modal fecha automaticamente
- ✅ Alterações aparecem na tabela
- ✅ Dados atualizados no Supabase

### **Resultado Esperado:**
```
✅ Local atualizado com sucesso
✅ Mensagem: "✅ Local de trabalho atualizado com sucesso!"
✅ Alterações visíveis na tabela
✅ Dados persistidos no Supabase
```

---

## 🚫 TESTE 4: DELETE NÃO PERMITIDO

### **Objetivo:** Verificar que DELETE foi removido

### **Verificações:**
- ✅ Não existe botão de "Apagar" ou "Excluir"
- ✅ Não existe ícone de lixeira
- ✅ Não há função de DELETE no código
- ✅ Registros não podem ser removidos

### **Resultado Esperado:**
```
✅ Nenhuma opção de DELETE disponível
✅ Registros permanentes no banco
```

---

## 👥 TESTE 5: SELEÇÃO DE CLIENTE

### **Objetivo:** Verificar dropdown dinâmico de clientes

### **Passos:**
1. Clicar em "Novo Local"
2. Observar campo "Cliente"
3. Clicar no dropdown

### **Verificações:**
- ✅ Dropdown carrega clientes do banco
- ✅ Clientes ordenados por nome (A-Z)
- ✅ Exibe nome e NIF do cliente
- ✅ Não permite digitar manualmente
- ✅ Campo marcado como obrigatório
- ✅ Validação impede salvar sem cliente

### **Teste de Validação:**
1. Tentar salvar sem selecionar cliente
2. **Resultado Esperado:** Mensagem "❌ O cliente é obrigatório!"

### **Resultado Esperado:**
```
✅ Dropdown funcional
✅ Clientes carregados do Supabase
✅ Validação funcionando
✅ Apenas UUID salvo no banco
```

---

## 💼 TESTE 6: GESTÃO DE LOCAL DE TRABALHO

### **Objetivo:** Verificar modal de gestão completo

### **Passos:**
1. Clicar no ícone "Gestão" (maleta roxa) em qualquer local
2. Navegar pelas 3 tabs

### **Tab 1: Detalhes**
- ✅ Cards de estatísticas aparecem
- ✅ Trabalhadores: X / Y
- ✅ Efetivos: X / dia
- ✅ Status: Ativo
- ✅ Informações completas exibidas
- ✅ Layout em grid responsivo

### **Tab 2: Movimentos**
- ✅ Mensagem "Funcionalidade em desenvolvimento" aparece
- ✅ Estrutura preparada para futura implementação

### **Tab 3: Relatório de Posto**
- ✅ Período de atividade exibido
- ✅ Recursos humanos detalhados
- ✅ Observações exibidas
- ✅ Botões "Imprimir" e "Exportar PDF" visíveis

### **Verificações Gerais:**
- ✅ Modal abre corretamente
- ✅ Header com nome e código do local
- ✅ Tabs funcionam corretamente
- ✅ Botão fechar funciona
- ✅ Design consistente com padrão do sistema

### **Resultado Esperado:**
```
✅ Modal de gestão completo e funcional
✅ 3 tabs navegáveis
✅ Informações detalhadas exibidas
✅ Botões de ação disponíveis
```

---

## 🔍 TESTE 7: PESQUISA

### **Objetivo:** Verificar funcionalidade de pesquisa

### **Passos:**
1. Digitar no campo de pesquisa:
   - Nome de um local
   - Código de um local
   - Nome de um responsável
2. Observar resultados

### **Verificações:**
- ✅ Pesquisa funciona em tempo real
- ✅ Filtra por nome
- ✅ Filtra por código
- ✅ Filtra por responsável
- ✅ Resultados atualizados instantaneamente
- ✅ Pesquisa case-insensitive

### **Resultado Esperado:**
```
✅ Pesquisa funcional
✅ Filtragem em múltiplos campos
✅ Resultados instantâneos
```

---

## 🏷️ TESTE 8: FILTRO POR TIPO

### **Objetivo:** Verificar filtro de tipo

### **Passos:**
1. Selecionar "Loja" no dropdown de tipo
2. Observar resultados
3. Selecionar "Armazém"
4. Observar resultados
5. Selecionar "Todos"

### **Verificações:**
- ✅ Filtro funciona corretamente
- ✅ Exibe apenas locais do tipo selecionado
- ✅ "Todos" exibe todos os locais
- ✅ Combina com pesquisa (filtros múltiplos)

### **Resultado Esperado:**
```
✅ Filtro por tipo funcional
✅ Combinação de filtros funciona
```

---

## 📊 TESTE 9: EXPORTAÇÃO EXCEL

### **Objetivo:** Verificar exportação para Excel

### **Passos:**
1. Aplicar filtros (opcional)
2. Clicar em "Excel"
3. Verificar arquivo baixado

### **Verificações:**
- ✅ Arquivo Excel baixado
- ✅ Nome do arquivo: "Locais_de_Trabalho.xlsx"
- ✅ Colunas corretas no Excel
- ✅ Dados corretos exportados
- ✅ Respeita filtros aplicados

### **Colunas Esperadas:**
```
Código | Nome | Tipo | Endereço | Telefone | Responsável | 
Nº Trabalhadores | Total Trabalhadores | Data Abertura | Localização
```

### **Resultado Esperado:**
```
✅ Arquivo Excel gerado
✅ Dados corretos exportados
✅ Formatação adequada
```

---

## 🔄 TESTE 10: ATUALIZAR DADOS

### **Objetivo:** Verificar botão de atualização

### **Passos:**
1. Clicar em "Atualizar"
2. Observar comportamento

### **Verificações:**
- ✅ Ícone de refresh gira durante carregamento
- ✅ Dados recarregados do banco
- ✅ Tabela atualizada
- ✅ Nenhum erro no console

### **Resultado Esperado:**
```
✅ Dados atualizados com sucesso
✅ SELECT executado no Supabase
✅ Tabela refrescada
```

---

## ✅ TESTE 11: VALIDAÇÕES

### **Objetivo:** Verificar todas as validações

### **Teste 11.1: Nome Obrigatório**
1. Abrir "Novo Local"
2. Deixar nome vazio
3. Tentar salvar
4. **Resultado:** "❌ O nome é obrigatório!"

### **Teste 11.2: Cliente Obrigatório**
1. Abrir "Novo Local"
2. Preencher nome
3. Deixar cliente vazio
4. Tentar salvar
5. **Resultado:** "❌ O cliente é obrigatório!"

### **Teste 11.3: Campos Numéricos**
1. Tentar digitar texto em campos numéricos
2. **Resultado:** Apenas números aceitos

### **Teste 11.4: Datas**
1. Campos de data com calendário nativo
2. **Resultado:** Formato de data válido

### **Resultado Esperado:**
```
✅ Todas as validações funcionando
✅ Mensagens de erro claras
✅ Não permite salvar dados inválidos
```

---

## 🎨 TESTE 12: PADRÃO VISUAL

### **Objetivo:** Verificar consistência visual com "Documentos de Venda"

### **Verificações:**

#### **Header**
- ✅ Layout idêntico ao InvoiceList
- ✅ Badge "Cloud Sync" presente
- ✅ Botões com mesmo estilo
- ✅ Cores consistentes

#### **Filtros**
- ✅ Fundo cinza claro (bg-slate-100)
- ✅ Bordas arredondadas
- ✅ Labels em negrito
- ✅ Inputs com focus ring azul

#### **Tabela**
- ✅ Header com fundo cinza (bg-slate-50)
- ✅ Texto uppercase no header
- ✅ Hover effect nas linhas
- ✅ Bordas sutis

#### **Badges**
- ✅ Cores por tipo (azul, verde, roxo)
- ✅ Texto uppercase
- ✅ Arredondamento consistente

#### **Botões**
- ✅ Cores consistentes (azul, verde, cinza)
- ✅ Hover effects
- ✅ Ícones alinhados
- ✅ Sombras adequadas

### **Resultado Esperado:**
```
✅ Visual idêntico à página "Documentos de Venda"
✅ Consistência de cores e espaçamentos
✅ Design profissional e limpo
```

---

## 🔧 TESTE 13: CAMPOS NOVOS

### **Objetivo:** Verificar novos campos implementados

### **Campos a Testar:**
1. **Número de Trabalhadores**
   - ✅ Campo numérico
   - ✅ Aceita valores inteiros
   - ✅ Exibido na tabela (X / Y)
   - ✅ Salvo no banco

2. **Total Trabalhadores**
   - ✅ Campo numérico
   - ✅ Aceita valores inteiros
   - ✅ Exibido na tabela (X / Y)
   - ✅ Salvo no banco

### **Teste de Criação:**
1. Criar local com:
   - Número de Trabalhadores: 15
   - Total Trabalhadores: 25
2. Verificar na tabela: "15 / 25"
3. Editar e verificar valores corretos

### **Resultado Esperado:**
```
✅ Campos funcionais
✅ Valores salvos corretamente
✅ Exibição correta na tabela
```

---

## 🚀 TESTE 14: PERFORMANCE

### **Objetivo:** Verificar performance da aplicação

### **Verificações:**
- ✅ Página carrega em < 2 segundos
- ✅ Pesquisa responde instantaneamente
- ✅ Modal abre sem delay
- ✅ Salvamento rápido (< 3 segundos)
- ✅ Sem travamentos
- ✅ Sem memory leaks

### **Resultado Esperado:**
```
✅ Aplicação rápida e responsiva
✅ Sem problemas de performance
```

---

## 🔐 TESTE 15: INTEGRAÇÃO SUPABASE

### **Objetivo:** Verificar integração completa com Supabase

### **Verificações:**

#### **SELECT**
1. Abrir página
2. Verificar no Supabase Dashboard
3. **Resultado:** Query SELECT executada

#### **INSERT**
1. Criar novo local
2. Verificar no Supabase Dashboard
3. **Resultado:** Novo registro na tabela `local_trabalho`

#### **UPDATE**
1. Editar local
2. Verificar no Supabase Dashboard
3. **Resultado:** Registro atualizado na tabela

#### **Cliente ID**
1. Verificar campo `cliente_id` no banco
2. **Resultado:** UUID do cliente, não nome

### **Resultado Esperado:**
```
✅ Todas as operações refletidas no Supabase
✅ Dados persistidos corretamente
✅ Nenhum erro de conexão
```

---

## 📱 TESTE 16: RESPONSIVIDADE

### **Objetivo:** Verificar layout em diferentes tamanhos de tela

### **Testes:**
1. **Desktop (1920x1080)**
   - ✅ Layout completo visível
   - ✅ Tabela com todas as colunas

2. **Tablet (768x1024)**
   - ✅ Layout adaptado
   - ✅ Botões empilhados
   - ✅ Tabela com scroll horizontal

3. **Mobile (375x667)**
   - ✅ Layout mobile-friendly
   - ✅ Botões em coluna
   - ✅ Tabela com scroll

### **Resultado Esperado:**
```
✅ Layout responsivo
✅ Funcional em todos os tamanhos
✅ Sem quebras de layout
```

---

## ✅ CHECKLIST DE TESTES

### **Funcionalidades Core**
- [ ] SELECT (Listar) funciona
- [ ] INSERT (Criar) funciona
- [ ] UPDATE (Editar) funciona
- [ ] DELETE removido (não existe)
- [ ] Cliente dropdown funciona
- [ ] Gestão modal funciona

### **Pesquisa e Filtros**
- [ ] Pesquisa funciona
- [ ] Filtro por tipo funciona
- [ ] Combinação de filtros funciona

### **Exportação**
- [ ] Excel exporta corretamente
- [ ] Dados corretos no arquivo

### **Validações**
- [ ] Nome obrigatório
- [ ] Cliente obrigatório
- [ ] Campos numéricos validados
- [ ] Datas validadas

### **Visual**
- [ ] Padrão InvoiceList aplicado
- [ ] Cores consistentes
- [ ] Badges corretos
- [ ] Botões estilizados

### **Novos Campos**
- [ ] Número de trabalhadores funciona
- [ ] Total trabalhadores funciona
- [ ] Exibição correta na tabela

### **Performance**
- [ ] Carregamento rápido
- [ ] Sem travamentos
- [ ] Pesquisa instantânea

### **Supabase**
- [ ] SELECT executado
- [ ] INSERT executado
- [ ] UPDATE executado
- [ ] Dados persistidos

### **Responsividade**
- [ ] Desktop OK
- [ ] Tablet OK
- [ ] Mobile OK

---

## 🎯 RESULTADO FINAL ESPERADO

### **Todos os Testes Passam:**
```
✅ 16/16 Testes Aprovados
✅ Funcionalidades 100% Operacionais
✅ Integração Supabase Completa
✅ Padrão Visual Consistente
✅ Performance Excelente
✅ Sem Erros ou Bugs
```

### **Pronto para Produção:**
```
✅ Código Limpo
✅ Documentação Completa
✅ Testes Validados
✅ Build Sem Erros
✅ Deploy Aprovado
```

---

## 📝 RELATÓRIO DE TESTES

Após executar todos os testes, preencher:

**Data:** ___/___/______
**Testador:** ________________
**Ambiente:** Desenvolvimento / Produção

### **Resumo:**
- Testes Executados: ___/16
- Testes Aprovados: ___/16
- Testes Reprovados: ___/16
- Bugs Encontrados: ___

### **Observações:**
_____________________________________
_____________________________________
_____________________________________

### **Status Final:**
- [ ] ✅ APROVADO PARA PRODUÇÃO
- [ ] ⚠️ APROVADO COM RESSALVAS
- [ ] ❌ REPROVADO - NECESSITA CORREÇÕES

---

**FIM DO GUIA DE TESTES**
