# 📖 GUIA RÁPIDO DE USO - LOCAL DE TRABALHO

## 🚀 INÍCIO RÁPIDO

### **Acessar a Página**
1. Abrir aplicação: http://localhost:3000
2. Clicar no menu lateral: **"Local de Trabalho"**
3. Página carrega automaticamente os dados do banco

---

## ➕ CRIAR NOVO LOCAL DE TRABALHO

### **Passo a Passo:**

1. **Clicar em "Novo Local"** (botão azul no topo)

2. **Preencher Seção 1: Informações Básicas**
   - **Nome:** Digite o nome do local *(obrigatório)*
   - **Título:** Digite um título (opcional)
   - **Código:** Digite um código único (opcional)
   - **Tipo:** Selecione: Loja, Armazém, Escritório, Fábrica ou Outro
   - **Cliente:** Selecione um cliente da lista *(obrigatório)*

3. **Preencher Seção 2: Localização e Contato**
   - **Endereço:** Digite o endereço completo
   - **Localização:** Digite a zona/região
   - **Telefone:** Digite o telefone de contato
   - **Contacto:** Digite email ou outro contato

4. **Preencher Seção 3: Gestão e Operação**
   - **Responsável:** Nome do responsável pelo local
   - **Data Abertura:** Selecione a data de abertura
   - **Data Encerramento:** Selecione se aplicável
   - **Efetivos por Dia:** Número de efetivos diários
   - **Total Efetivos:** Total de efetivos
   - **Número de Trabalhadores:** Trabalhadores atuais
   - **Total Trabalhadores:** Capacidade total

5. **Preencher Seção 4: Descrição e Observações**
   - **Descrição:** Descrição detalhada do local
   - **Observações:** Observações adicionais

6. **Clicar em "Guardar"**

7. **Verificar mensagem de sucesso:** "✅ Local de trabalho criado com sucesso!"

8. **Verificar novo local na tabela**

---

## ✏️ EDITAR LOCAL DE TRABALHO

### **Passo a Passo:**

1. **Localizar o local na tabela**

2. **Clicar no ícone de "Editar"** (lápis azul)

3. **Modificar os campos desejados**
   - Todos os campos podem ser editados
   - Nome e Cliente continuam obrigatórios

4. **Clicar em "Atualizar"**

5. **Verificar mensagem de sucesso:** "✅ Local de trabalho atualizado com sucesso!"

6. **Verificar alterações na tabela**

---

## 💼 GESTÃO DE LOCAL DE TRABALHO

### **Passo a Passo:**

1. **Localizar o local na tabela**

2. **Clicar no ícone "Gestão"** (maleta roxa)

3. **Navegar pelas tabs:**

   **Tab "Detalhes":**
   - Ver estatísticas (Trabalhadores, Efetivos, Status)
   - Ver informações completas do local

   **Tab "Movimentos":**
   - Ver movimentos relacionados ao local
   - *(Funcionalidade em desenvolvimento)*

   **Tab "Relatório de Posto":**
   - Ver relatório completo
   - Período de atividade
   - Recursos humanos
   - Observações
   - Clicar em "Imprimir" ou "Exportar PDF"

4. **Fechar modal** (clicar no X ou fora do modal)

---

## 🔍 PESQUISAR LOCAIS

### **Passo a Passo:**

1. **Localizar campo de pesquisa** (no topo, abaixo do header)

2. **Digitar termo de pesquisa:**
   - Nome do local
   - Código do local
   - Nome do responsável

3. **Resultados filtrados automaticamente**

4. **Limpar pesquisa:** Apagar texto do campo

---

## 🏷️ FILTRAR POR TIPO

### **Passo a Passo:**

1. **Localizar dropdown "Tipo"** (ao lado da pesquisa)

2. **Selecionar tipo desejado:**
   - Todos
   - Loja
   - Armazém
   - Escritório
   - Fábrica
   - Outro

3. **Resultados filtrados automaticamente**

4. **Combinar com pesquisa:** Pesquisa + Filtro funcionam juntos

---

## 📊 EXPORTAR PARA EXCEL

### **Passo a Passo:**

1. **Aplicar filtros desejados** (opcional)
   - Pesquisar por termo
   - Filtrar por tipo

2. **Clicar em "Excel"** (botão verde no topo)

3. **Arquivo baixado automaticamente:** "Locais_de_Trabalho.xlsx"

4. **Abrir arquivo Excel** e verificar dados

---

## 🔄 ATUALIZAR DADOS

### **Passo a Passo:**

1. **Clicar em "Atualizar"** (botão com ícone de refresh)

2. **Aguardar carregamento** (ícone gira durante carregamento)

3. **Dados recarregados do banco**

---

## ⚠️ VALIDAÇÕES E ERROS

### **Campos Obrigatórios:**

**Nome:**
- ❌ Tentar salvar sem nome
- ✅ Mensagem: "❌ O nome é obrigatório!"

**Cliente:**
- ❌ Tentar salvar sem cliente
- ✅ Mensagem: "❌ O cliente é obrigatório!"

### **Campos Numéricos:**
- Apenas números são aceitos
- Valores negativos não permitidos

### **Datas:**
- Formato: DD/MM/AAAA
- Calendário nativo do navegador

---

## 🎨 INTERFACE

### **Cores dos Badges de Tipo:**

| Tipo | Cor |
|------|-----|
| Loja | Azul |
| Armazém | Verde |
| Escritório | Roxo |
| Fábrica | Laranja |
| Outro | Cinza |

### **Ícones de Ação:**

| Ícone | Ação | Cor |
|-------|------|-----|
| 💼 Maleta | Gestão | Roxo |
| ✏️ Lápis | Editar | Azul |
| 👁️ Olho | Ver Detalhes | Cinza |

---

## 📱 RESPONSIVIDADE

### **Desktop (1920x1080):**
- Layout completo
- Todas as colunas visíveis
- Botões lado a lado

### **Tablet (768x1024):**
- Layout adaptado
- Botões empilhados
- Scroll horizontal na tabela

### **Mobile (375x667):**
- Layout mobile-friendly
- Botões em coluna
- Tabela com scroll

---

## ❓ PERGUNTAS FREQUENTES

### **1. Posso apagar um local de trabalho?**
❌ Não. Os registros não podem ser apagados do banco de dados. Apenas criação e edição são permitidas.

### **2. Como seleciono um cliente?**
✅ Clique no dropdown "Cliente" e selecione da lista. Não é possível digitar manualmente.

### **3. Quais campos são obrigatórios?**
✅ Apenas **Nome** e **Cliente** são obrigatórios.

### **4. Os dados são salvos automaticamente?**
❌ Não. É necessário clicar em "Guardar" ou "Atualizar" para salvar.

### **5. Como sei se os dados foram salvos?**
✅ Uma mensagem de sucesso aparece: "✅ Local de trabalho criado/atualizado com sucesso!"

### **6. Posso exportar apenas os dados filtrados?**
✅ Sim. A exportação Excel respeita os filtros aplicados.

### **7. Como vejo o relatório de um local?**
✅ Clique no ícone de "Gestão" (maleta) e vá para a tab "Relatório de Posto".

### **8. Os dados são salvos no banco ou apenas localmente?**
✅ Todos os dados são salvos no banco de dados Supabase. Nada depende de estado local.

---

## 🔧 ATALHOS E DICAS

### **Dicas de Uso:**

1. **Pesquisa Rápida:**
   - Use o campo de pesquisa para encontrar locais rapidamente
   - Funciona em tempo real

2. **Filtros Combinados:**
   - Combine pesquisa + filtro por tipo para resultados precisos

3. **Exportação:**
   - Aplique filtros antes de exportar para Excel personalizado

4. **Gestão Completa:**
   - Use o modal de gestão para ver todas as informações de uma vez

5. **Atualização:**
   - Clique em "Atualizar" após fazer alterações em outro dispositivo

### **Atalhos de Teclado:**

| Atalho | Ação |
|--------|------|
| `Esc` | Fechar modal |
| `Enter` | Salvar formulário (quando em campo de input) |
| `Tab` | Navegar entre campos |

---

## 📊 EXEMPLO PRÁTICO

### **Cenário: Criar Nova Loja**

**Objetivo:** Criar registro para nova loja em Luanda

**Passos:**

1. Clicar em "Novo Local"

2. Preencher:
   ```
   Nome: Loja Benfica
   Título: Filial Principal
   Código: LJ-BEN-001
   Tipo: Loja
   Cliente: [Selecionar da lista]
   
   Endereço: Rua da Missão, Benfica, Luanda
   Localização: Zona Norte
   Telefone: +244 923 456 789
   Contacto: benfica@empresa.ao
   
   Responsável: João Silva
   Data Abertura: 01/01/2026
   Número de Trabalhadores: 5
   Total Trabalhadores: 10
   
   Descrição: Loja principal localizada no Benfica
   Observações: Horário: 8h-18h
   ```

3. Clicar em "Guardar"

4. Verificar mensagem de sucesso

5. Localizar "Loja Benfica" na tabela

6. Clicar em "Gestão" para ver detalhes completos

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após criar/editar um local, verificar:

- [ ] Nome está correto
- [ ] Cliente está selecionado
- [ ] Tipo está correto
- [ ] Dados de contato estão completos
- [ ] Número de trabalhadores está atualizado
- [ ] Datas estão corretas
- [ ] Descrição está clara
- [ ] Local aparece na tabela
- [ ] Dados estão no Supabase

---

## 🎯 RESUMO

### **Operações Principais:**

1. ✅ **Criar:** Novo Local → Preencher → Guardar
2. ✅ **Editar:** Editar → Modificar → Atualizar
3. ✅ **Gestão:** Gestão → Ver Detalhes/Relatório
4. ✅ **Pesquisar:** Digitar termo → Resultados filtrados
5. ✅ **Filtrar:** Selecionar tipo → Resultados filtrados
6. ✅ **Exportar:** Excel → Arquivo baixado
7. ✅ **Atualizar:** Atualizar → Dados recarregados

### **Lembrar:**

- ✅ Nome e Cliente são obrigatórios
- ✅ Não é possível apagar locais
- ✅ Todos os dados são salvos no banco
- ✅ Pesquisa e filtros funcionam juntos
- ✅ Exportação respeita filtros

---

**FIM DO GUIA RÁPIDO**

*Para mais informações, consulte a documentação técnica completa.*
