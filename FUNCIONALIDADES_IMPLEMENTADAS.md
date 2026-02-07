# Funcionalidades Implementadas - HR & Payroll

## ✅ Funcionalidades Concluídas

### 1. Menu de Opções para Funcionários
**Componente:** `EmployeeOptionsMenu.tsx`
- **Localização:** Botão "Opções" (3 pontos verticais) ao lado de cada funcionário na página de Recibos de Salário
- **Funcionalidades do Menu:**
  - ✅ **Demitir Funcionário:** Abre modal de demissão (apenas para funcionários ativos)
  - ✅ **Cadastro:** Visualizar cadastro do funcionário
  - ✅ **Ficha Pessoal:** Visualizar ficha pessoal
  - ✅ **Readmitir:** Readmitir funcionário demitido (apenas para funcionários demitidos)
  - ✅ **Emitir Contrato:** Navegar para emissão de contrato
  - ✅ **Fardas:** Gestão de fardas/uniformes

**Características:**
- Menu dropdown centralizado na tela
- Ícones coloridos para cada opção
- Opções condicionais baseadas no status do funcionário

### 2. Modal de Demissão de Funcionário
**Componente:** `DismissEmployeeModal.tsx`
- **Campos obrigatórios:**
  - ✅ Data de Demissão
  - ✅ Mandante (Responsável pela demissão)
  - ✅ Motivo da Demissão
- **Funcionalidades:**
  - ✅ Confirmação dupla antes de demitir
  - ✅ Aviso sobre bloqueio de atividades
  - ✅ Exibição de informações do funcionário
  - ✅ Atualização de status para "Terminated"
  - ✅ Funcionário desaparece das listas após demissão
  - ✅ Status exibido como "Inativo - Demitido"

**Características:**
- Design profissional com gradiente vermelho
- Banner de aviso sobre consequências
- Validação de campos obrigatórios

### 3. Página de Gestão de Contratos
**Componente:** `ContractManagement.tsx`
- **Layout:** Dividido em 2 colunas
  - **Esquerda:** Formulário de dados do contrato
  - **Direita:** Pré-visualização do contrato em tempo real

**Campos do Formulário:**
- ✅ Seleção de Funcionário
- ✅ Tipo de Contrato (Determinado/Indeterminado)
- ✅ Data Início e Fim (calculado automaticamente)
- ✅ Duração (em meses ou anos)
- ✅ Período Experimental (em dias)
- ✅ Motivo do Contrato (dropdown com opções legais)
- ✅ Dados do Responsável pela Empresa:
  - Nome
  - Cargo
  - Nacionalidade
  - Nº de Documento

**Funcionalidades:**
- ✅ Preview dinâmico do contrato atualiza em tempo real
- ✅ Todas as 15 cláusulas conforme Lei Angolana 12/23
- ✅ Formatação legal completa
- ✅ Botão "Salvar Contrato"
- ✅ Botão "Imprimir" (formato A4)
- ✅ Cálculo automático da data de término

**Cláusulas Incluídas:**
1. Das Tarefas do Trabalhador
2. Categoria Profissional
3. Duração do Trabalho
4. Remuneração do Trabalhador
5. Segurança, higiene e saúde
6. Duração do Contrato
7. Confidencialidade
8. Da nulidade do Contrato
9. Pré-Aviso de Rescisão
10. Renovação do Contrato
11. Horário de Trabalho
12. Trâmites legais
13. Responsabilidade acessória
14. Responsabilidade Civil
15. Da Lei Geral do Trabalho

### 4. Tabela IRT com Botão Voltar
**Componente:** `IRTTable.tsx`
- ✅ Botão "Voltar" adicionado no header
- ✅ Design consistente com gradiente azul
- ✅ Callback `onClose` para navegação

### 5. Integração no Menu Lateral
**Componente:** `Sidebar.tsx`
- ✅ Submenu "Contrato de Trabalho" adicionado em Recursos Humanos
- ✅ Posicionado entre "Processamento" e "Tabela de IRT"
- ✅ Ícone FileText

### 6. Integração no ProcessSalary
**Componente:** `ProcessSalary.tsx`
- ✅ Botão de opções integrado em cada linha da tabela
- ✅ Modal de demissão integrado
- ✅ Handlers para todas as ações:
  - `handleDismissEmployee`
  - `handleConfirmDismiss`
  - `handleViewProfile`
  - `handleViewPersonalFile`
  - `handleReadmit`
  - `handleIssueContract`
  - `handleManageUniforms`

### 7. Roteamento no App
**Componente:** `App.tsx`
- ✅ Caso `HR_CONTRACTS` adicionado
- ✅ Caso `HR_IRT_TABLE` com callback onClose
- ✅ Navegação entre páginas funcional

## 📋 Estrutura de Arquivos Criados

```
components/
├── EmployeeOptionsMenu.tsx          # Menu de opções do funcionário
├── DismissEmployeeModal.tsx         # Modal de demissão
├── ContractManagement.tsx           # Página de gestão de contratos
└── (modificados)
    ├── HumanResources.tsx           # Integração de contratos
    ├── ProcessSalary.tsx            # Menu de opções e demissão
    ├── IRTTable.tsx                 # Botão voltar
    ├── Sidebar.tsx                  # Submenu contratos
    └── App.tsx                      # Roteamento
```

## 🎨 Características de Design

### EmployeeOptionsMenu
- Menu dropdown centralizado
- Ícones coloridos por categoria:
  - Vermelho: Demitir
  - Azul: Cadastro/Ficha
  - Verde: Readmitir
  - Índigo: Contrato
  - Laranja: Fardas

### DismissEmployeeModal
- Header com gradiente vermelho
- Banner de aviso amarelo
- Informações do funcionário em destaque
- Campos com validação visual
- Botões de ação destacados

### ContractManagement
- Layout 2 colunas responsivo
- Formulário à esquerda com grupos lógicos
- Preview em tempo real à direita
- Header com gradiente azul
- Fonte Times New Roman para contrato (formal)
- Impressão otimizada para A4

## 🔄 Fluxo de Uso

### Demitir Funcionário
1. Acessar "Processamento" em Recursos Humanos
2. Clicar no botão "Opções" (⋮) ao lado do funcionário
3. Selecionar "Demitir Funcionário"
4. Preencher:
   - Data de Demissão
   - Mandante
   - Motivo
5. Confirmar ação
6. Funcionário fica inativo e desaparece das listas

### Emitir Contrato
1. Acessar "Contrato de Trabalho" no menu
2. Selecionar funcionário
3. Escolher tipo de contrato
4. Preencher dados do contrato
5. Verificar preview em tempo real
6. Salvar ou Imprimir

### Visualizar Tabela IRT
1. Acessar "Tabela de IRT" no menu
2. Visualizar escalões configurados
3. Clicar em "Voltar" para retornar

## ✨ Funcionalidades Mantidas

- ✅ Todas as funcionalidades existentes foram preservadas
- ✅ Processamento de salários continua funcional
- ✅ Recibos de salário mantidos
- ✅ Gestão de assiduidade preservada
- ✅ Lista de colaboradores intacta
- ✅ Gestão de profissões mantida

## 🚀 Próximos Passos Sugeridos

1. Implementar persistência de contratos no banco de dados
2. Adicionar lista de contratos emitidos
3. Implementar página de "Cadastro" completa
4. Implementar página de "Ficha Pessoal"
5. Implementar gestão de fardas/uniformes
6. Adicionar histórico de demissões
7. Implementar fluxo de readmissão completo

## 📝 Notas Técnicas

- Todos os componentes são TypeScript React
- Utilizam Tailwind CSS para estilização
- Ícones da biblioteca Lucide React
- Props tipadas com interfaces TypeScript
- Estado gerenciado com useState e useEffect
- Formatação de datas em português (pt-PT/pt-AO)
- Valores monetários em Kwanza (Kz)

## ⚠️ Avisos Importantes

**Modal de Demissão:** 
- A demissão é IRREVERSÍVEL pelo modal (pode readmitir depois pelo menu)
- Funcionário fica bloqueado imediatamente
- Status muda para "Terminated"
- Não aparece mais nas listas de funcionários ativos

**Contrato de Trabalho:**
- Todas as cláusulas são baseadas na Lei 12/23 de Angola
- Texto legal completo e formatado
- Preview atualiza automaticamente com os dados
- Impressão formatada para A4

**Tabela IRT:**
- Escalões configuráveis por ano
- Cálculo automático baseado nos escalões
- Botão "Voltar" para melhor UX
