# 🎯 GUIA DE USO DOS ASSISTENTES - IMATEC V.2.0

## ✅ ASSISTENTES ATIVADOS

### 1. **BackendAssistant** ✅
Gerencia todas as operações com o banco de dados Supabase.

### 2. **FrontendAssistant** ✅ (NOVO!)
Gerencia interface do usuário, notificações e interações.

### 3. **SecurityAssistant** ✅
Valida e protege dados do sistema.

### 4. **IntegrationAssistant** ✅
Sincroniza e integra todos os módulos.

---

## 📚 EXEMPLOS DE USO

### 🔧 BackendAssistant

#### Gerenciar Clientes
```typescript
import { BackendAssistant } from './services';

// Listar todos os clientes
const clientes = await BackendAssistant.clientes.listar();

// Criar novo cliente
const novoCliente = await BackendAssistant.clientes.criar({
  nome: 'João Silva',
  nif: '123456789',
  email: 'joao@email.ao',
  telefone: '+244 923 456 789',
  localidade: 'Luanda'
});

// Atualizar cliente
await BackendAssistant.clientes.atualizar('id-do-cliente', {
  nome: 'João Silva Atualizado'
});

// Excluir cliente
await BackendAssistant.clientes.excluir('id-do-cliente');
```

#### Gerenciar Fornecedores
```typescript
// Listar fornecedores
const fornecedores = await BackendAssistant.fornecedores.listar();

// Criar fornecedor
const novoFornecedor = await BackendAssistant.fornecedores.criar({
  nome: 'Fornecedor XYZ',
  contribuinte: '987654321',
  email: 'fornecedor@xyz.ao'
});
```

#### Gerenciar Vendas
```typescript
// Listar faturas
const faturas = await BackendAssistant.vendas.listar();

// Criar fatura
const novaFatura = await BackendAssistant.vendas.criar({
  numero: 'FT 2026/001',
  tipo: 'FT',
  data: '2026-01-28',
  cliente_id: 'uuid-do-cliente',
  total: 10000,
  subtotal: 8547,
  imposto: 1453,
  items: [...]
});

// Certificar fatura
await BackendAssistant.vendas.certificar('id-da-fatura', 'hash-gerado');
```

---

### 🎨 FrontendAssistant (NOVO!)

#### Notificações
```typescript
import { FrontendAssistant } from './services';

// Notificação de sucesso
FrontendAssistant.notificarSucesso('Cliente criado com sucesso!');

// Notificação de erro
FrontendAssistant.notificarErro('Erro ao salvar dados');

// Notificação de aviso
FrontendAssistant.notificarAviso('Preencha todos os campos obrigatórios');

// Notificação de informação
FrontendAssistant.notificarInfo('Sistema atualizado para versão 2.0');
```

#### Loading
```typescript
// Mostrar loading
FrontendAssistant.mostrarLoading('Carregando dados...');

// Esconder loading
FrontendAssistant.esconderLoading();

// Exemplo completo
async function carregarDados() {
  FrontendAssistant.mostrarLoading('Carregando clientes...');
  try {
    const clientes = await BackendAssistant.clientes.listar();
    FrontendAssistant.notificarSucesso(`${clientes.length} clientes carregados`);
  } catch (error) {
    FrontendAssistant.notificarErro('Erro ao carregar clientes');
  } finally {
    FrontendAssistant.esconderLoading();
  }
}
```

#### Confirmações
```typescript
// Confirmar ação
const confirmado = await FrontendAssistant.confirmar(
  'Tem certeza que deseja excluir este cliente?',
  'Confirmar Exclusão'
);

if (confirmado) {
  await BackendAssistant.clientes.excluir(clienteId);
  FrontendAssistant.notificarSucesso('Cliente excluído com sucesso!');
}
```

#### Formatação
```typescript
// Formatar moeda
const valorFormatado = FrontendAssistant.formatarMoeda(10000); // "Kz 10.000,00"

// Formatar data
const dataFormatada = FrontendAssistant.formatarData('2026-01-28'); // "28/01/2026"

// Formatar data e hora
const dataHoraFormatada = FrontendAssistant.formatarDataHora(new Date()); // "28/01/2026 18:30"
```

#### Utilitários
```typescript
// Copiar para clipboard
await FrontendAssistant.copiarParaClipboard('Texto a copiar');

// Exportar para CSV
FrontendAssistant.exportarCSV(clientes, 'lista-clientes');

// Imprimir elemento
FrontendAssistant.imprimirElemento('area-impressao');

// Validar formulário
const valido = FrontendAssistant.validarFormulario('form-cliente');

// Scroll suave
FrontendAssistant.scrollParaElemento('topo-pagina');

// Detectar tema
const tema = FrontendAssistant.detectarTema(); // 'light' ou 'dark'
```

---

### 🔒 SecurityAssistant

#### Validações
```typescript
import { SecurityAssistant } from './services';

// Validar NIF
const nifValido = SecurityAssistant.validarNIF('123456789'); // true/false

// Validar Email
const emailValido = SecurityAssistant.validarEmail('teste@email.ao'); // true/false

// Validar Telefone
const telefoneValido = SecurityAssistant.validarTelefone('+244 923 456 789'); // true/false

// Validar cliente completo
const validacao = SecurityAssistant.validarCliente({
  nome: 'João Silva',
  nif: '123456789',
  email: 'joao@email.ao'
});

if (!validacao.valido) {
  console.error('Erros:', validacao.erros);
  // ['Email inválido', 'Telefone inválido']
}
```

#### Sanitização
```typescript
// Sanitizar texto (prevenir XSS)
const textoSeguro = SecurityAssistant.sanitizarTexto('<script>alert("xss")</script>');
// Resultado: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
```

#### Auditoria
```typescript
// Registrar ação para auditoria
SecurityAssistant.registrarAuditoria('criar', 'cliente', {
  nome: 'João Silva',
  nif: '123456789'
});
```

---

### 🔄 IntegrationAssistant

#### Processamento Completo
```typescript
import { IntegrationAssistant } from './services';

// Criar cliente (com validação automática)
const resultado = await IntegrationAssistant.processarOperacao(
  'criar',
  'cliente',
  {
    name: 'João Silva',
    vatNumber: '123456789',
    email: 'joao@email.ao'
  }
);

// Atualizar cliente
await IntegrationAssistant.processarOperacao(
  'atualizar',
  'cliente',
  { name: 'João Silva Atualizado' },
  'id-do-cliente'
);

// Excluir cliente
await IntegrationAssistant.processarOperacao(
  'excluir',
  'cliente',
  {},
  'id-do-cliente'
);
```

#### Sincronização
```typescript
// Sincronizar clientes
const clientes = await IntegrationAssistant.sincronizarDados('clientes');

// Sincronizar fornecedores
const fornecedores = await IntegrationAssistant.sincronizarDados('fornecedores');

// Sincronizar vendas
const vendas = await IntegrationAssistant.sincronizarDados('vendas');
```

---

## 🎣 USANDO HOOKS REACT

### Hook useClientes
```typescript
import { useClientes } from './services/hooks';

function ClientesPage() {
  const { clientes, carregando, erro, criar, atualizar, excluir } = useClientes();

  const handleCriar = async () => {
    await criar({
      name: 'Novo Cliente',
      vatNumber: '123456789',
      email: 'cliente@email.ao'
    });
  };

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>Erro: {erro}</div>;

  return (
    <div>
      <h1>Clientes ({clientes.length})</h1>
      <button onClick={handleCriar}>Criar Cliente</button>
      {/* Lista de clientes */}
    </div>
  );
}
```

### Hook useFornecedores
```typescript
import { useFornecedores } from './services/hooks';

function FornecedoresPage() {
  const { fornecedores, carregando, criar, atualizar, excluir } = useFornecedores();

  // Uso similar ao useClientes
}
```

### Hook useVendas
```typescript
import { useVendas } from './services/hooks';

function VendasPage() {
  const { vendas, carregando, criar, certificar } = useVendas();

  const handleCertificar = async (id: string) => {
    await certificar(id, 'hash-gerado');
  };
}
```

### Hook useValidacao
```typescript
import { useValidacao } from './services/hooks';

function FormularioCliente() {
  const { validarCliente, validarNIF, validarEmail } = useValidacao();

  const handleSubmit = (dados: any) => {
    const validacao = validarCliente(dados);
    
    if (!validacao.valido) {
      alert('Erros: ' + validacao.erros.join(', '));
      return;
    }

    // Salvar cliente...
  };
}
```

### Hook useNotificacoes
```typescript
import { useNotificacoes } from './services/hooks';

function MeuComponente() {
  const { sucesso, erro, aviso, info } = useNotificacoes();

  const salvar = async () => {
    try {
      await BackendAssistant.clientes.criar(dados);
      sucesso('Cliente criado com sucesso!');
    } catch (error) {
      erro('Erro ao criar cliente');
    }
  };
}
```

---

## 🚀 INICIALIZAÇÃO DO SISTEMA

### No App.tsx ou index.tsx
```typescript
import { useEffect } from 'react';
import { inicializarSistema, verificarStatusSistema } from './services';

function App() {
  useEffect(() => {
    // Inicializar sistema
    inicializarSistema();

    // Verificar status (opcional)
    verificarStatusSistema().then(status => {
      console.log('Status:', status);
    });
  }, []);

  return <div>Minha Aplicação</div>;
}
```

---

## 📊 EXEMPLO COMPLETO

### Página de Clientes com Todos os Assistentes
```typescript
import { useState, useEffect } from 'react';
import { 
  BackendAssistant, 
  FrontendAssistant, 
  SecurityAssistant,
  IntegrationAssistant 
} from './services';

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    FrontendAssistant.mostrarLoading('Carregando clientes...');
    
    try {
      const dados = await BackendAssistant.clientes.listar();
      setClientes(dados);
      FrontendAssistant.notificarSucesso(`${dados.length} clientes carregados`);
    } catch (error) {
      FrontendAssistant.notificarErro('Erro ao carregar clientes');
    } finally {
      FrontendAssistant.esconderLoading();
    }
  };

  const salvarCliente = async () => {
    // Validar dados
    const validacao = SecurityAssistant.validarCliente(formData);
    if (!validacao.valido) {
      FrontendAssistant.notificarErro(validacao.erros.join(', '));
      return;
    }

    // Salvar com integração completa
    try {
      await IntegrationAssistant.processarOperacao('criar', 'cliente', formData);
      await carregarClientes();
    } catch (error) {
      // Erro já tratado pelo IntegrationAssistant
    }
  };

  const excluirCliente = async (id: string) => {
    const confirmado = await FrontendAssistant.confirmar(
      'Tem certeza que deseja excluir este cliente?'
    );

    if (confirmado) {
      await IntegrationAssistant.processarOperacao('excluir', 'cliente', {}, id);
      await carregarClientes();
    }
  };

  return (
    <div>
      <h1>Gestão de Clientes</h1>
      {/* Interface aqui */}
    </div>
  );
}
```

---

## 🎯 RESUMO DOS ASSISTENTES

| Assistente | Função Principal | Quando Usar |
|------------|------------------|-------------|
| **BackendAssistant** | CRUD com Supabase | Operações de banco de dados |
| **FrontendAssistant** | Interface e UX | Notificações, loading, confirmações |
| **SecurityAssistant** | Validação e segurança | Validar dados antes de salvar |
| **IntegrationAssistant** | Sincronização | Operações completas com validação |

---

## ✅ CHECKLIST DE USO

- [x] BackendAssistant ativado
- [x] FrontendAssistant ativado
- [x] SecurityAssistant ativado
- [x] IntegrationAssistant ativado
- [x] Hooks React criados
- [x] Exemplos documentados
- [ ] Sistema inicializado no App.tsx
- [ ] Testar notificações
- [ ] Testar CRUD completo

---

**Desenvolvido por:** IMATEC Soft V.2.0  
**Versão:** 2.0.0  
**Data:** 2026-01-28
