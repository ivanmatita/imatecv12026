# Assistentes do Sistema IMATEC V.2.0

Este projeto utiliza assistentes especializados para gerenciar diferentes aspectos do sistema ERP.

## 📦 Assistentes Disponíveis

### 1. **BackendAssistant** - Assistente de Backend
Responsável por todas as operações CRUD com o Supabase.

**Funcionalidades:**
- ✅ Gerenciamento de Clientes (CRUD completo)
- ✅ Gerenciamento de Fornecedores (CRUD completo)
- ✅ Gerenciamento de Vendas/Faturas (CRUD completo)
- ✅ Isolamento de dados por empresa (multi-tenancy)
- ✅ Teste de conectividade com Supabase

**Exemplo de uso:**
```typescript
import { BackendAssistant } from './services/backendAssistant';

// Definir empresa ativa
BackendAssistant.setEmpresaAtiva('uuid-da-empresa');

// Listar clientes
const clientes = await BackendAssistant.clientes.listar();

// Criar novo cliente
const novoCliente = await BackendAssistant.clientes.criar({
  nome: 'Cliente Teste',
  nif: '123456789',
  email: 'cliente@teste.ao'
});

// Atualizar cliente
await BackendAssistant.clientes.atualizar('id-do-cliente', {
  nome: 'Nome Atualizado'
});

// Excluir cliente
await BackendAssistant.clientes.excluir('id-do-cliente');
```

### 2. **SecurityAssistant** - Assistente de Segurança
Responsável por validações, sanitização e proteção de dados.

**Funcionalidades:**
- ✅ Validação de NIF (Número de Identificação Fiscal)
- ✅ Validação de Email
- ✅ Validação de Telefone
- ✅ Sanitização de texto (prevenção XSS)
- ✅ Validação de valores monetários
- ✅ Validação de UUID
- ✅ Validação completa de entidades (Cliente, Fornecedor, Fatura)
- ✅ Sistema de auditoria
- ✅ Verificação de permissões

**Exemplo de uso:**
```typescript
import { SecurityAssistant } from './services/securityAssistant';

// Validar NIF
const nifValido = SecurityAssistant.validarNIF('123456789');

// Validar cliente completo
const validacao = SecurityAssistant.validarCliente({
  nome: 'Cliente Teste',
  nif: '123456789',
  email: 'cliente@teste.ao'
});

if (!validacao.valido) {
  console.error('Erros:', validacao.erros);
}

// Sanitizar texto
const textoSeguro = SecurityAssistant.sanitizarTexto('<script>alert("xss")</script>');

// Registrar auditoria
SecurityAssistant.registrarAuditoria('criar', 'cliente', { nome: 'Teste' });
```

### 3. **IntegrationAssistant** - Assistente de Integração
Responsável por sincronização e integração entre módulos.

**Funcionalidades:**
- ✅ Sincronização de dados entre estado local e Supabase
- ✅ Mapeamento automático de dados (DB ↔ Aplicação)
- ✅ Processamento completo de operações com validação
- ✅ Inicialização automática do sistema

**Exemplo de uso:**
```typescript
import { IntegrationAssistant } from './services/integrationAssistant';

// Inicializar sistema
await IntegrationAssistant.inicializar();

// Sincronizar dados
const clientes = await IntegrationAssistant.sincronizarDados('clientes');

// Processar operação completa (com validação e auditoria)
const resultado = await IntegrationAssistant.processarOperacao(
  'criar',
  'cliente',
  {
    name: 'Cliente Teste',
    vatNumber: '123456789',
    email: 'cliente@teste.ao'
  }
);

// Mapear dados
const clienteApp = IntegrationAssistant.mapearCliente(clienteDB);
const clienteDB = IntegrationAssistant.mapearClienteParaDB(clienteApp);
```

## 🚀 Inicialização do Sistema

Para inicializar todos os assistentes automaticamente:

```typescript
import { inicializarSistema } from './services';

// No início da aplicação (App.tsx ou index.tsx)
useEffect(() => {
  inicializarSistema();
}, []);
```

## 🔌 Conexão com Supabase

As credenciais do Supabase estão configuradas em `services/supabaseClient.ts`:

```typescript
const SUPABASE_URL = "https://alqttoqjftqckojusayf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGci...";
```

**Banco de dados:** imatecv12026

## 📊 Estrutura de Dados

### Clientes (tabela: `clientes`)
- `id` (UUID)
- `nome` (string)
- `nif` (string)
- `email` (string)
- `telefone` (string)
- `endereco` (string)
- `localidade` (string)
- `provincia` (string)
- `municipio` (string)
- `codigo_postal` (string)
- `pais` (string)
- `web_page` (string)
- `tipo_cliente` (string)
- `iban` (string)
- `conta_partilhada` (boolean)
- `saldo_inicial` (number)
- `empresa_id` (UUID) - Para isolamento de dados

### Fornecedores (tabela: `fornecedores`)
- `id` (UUID)
- `nome` (string)
- `contribuinte` (string)
- `email` (string)
- `telefone` (string)
- `morada` (string)
- `localidade` (string)
- `provincia` (string)
- `municipio` (string)
- `codigo_postal` (string)
- `pais` (string)
- `web_page` (string)
- `num_inss` (string)
- `siglas_banco` (string)
- `iban` (string)
- `swift` (string)
- `tipo_cliente` (string)
- `empresa_id` (UUID) - Para isolamento de dados

### Faturas (tabela: `faturas`)
- `id` (UUID)
- `numero` (string)
- `tipo` (string)
- `data` (date)
- `cliente_id` (UUID)
- `total` (number)
- `subtotal` (number)
- `imposto` (number)
- `desconto` (number)
- `certificado` (boolean)
- `hash` (string)
- `data_certificacao` (timestamp)
- `items` (jsonb)
- `empresa_id` (UUID) - Para isolamento de dados

## 🔒 Segurança e Multi-tenancy

Todos os assistentes implementam isolamento de dados por empresa:

```typescript
// Definir empresa ativa
BackendAssistant.setEmpresaAtiva('uuid-da-empresa');

// Todas as operações subsequentes respeitarão o isolamento
const clientes = await BackendAssistant.clientes.listar(); // Apenas da empresa ativa
```

## 📝 Logs e Debugging

Todos os assistentes geram logs detalhados:

- ✅ `✅` - Operação bem-sucedida
- ❌ `❌` - Erro
- ⚠️ `⚠️` - Aviso
- 🔄 `🔄` - Processamento em andamento
- 🔒 `🔒` - Operação de segurança
- 🚀 `🚀` - Inicialização

## 🛠️ Troubleshooting

### Problema: "Falha na conexão com Supabase"
**Solução:** Verifique se as credenciais em `supabaseClient.ts` estão corretas.

### Problema: "Nenhuma empresa ativa definida"
**Solução:** Chame `BackendAssistant.setEmpresaAtiva('uuid')` antes de usar os métodos.

### Problema: "Validação falhou"
**Solução:** Verifique os erros retornados pelo SecurityAssistant e corrija os dados.

## 📚 Documentação Adicional

Para mais informações sobre o Supabase, consulte: https://supabase.com/docs

---

**Desenvolvido por:** IMATEC Soft V.2.0  
**Licença:** Proprietária  
**Versão:** 2.0.0
