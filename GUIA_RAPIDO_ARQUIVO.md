# 🚀 GUIA RÁPIDO - INTEGRAÇÃO ARQUIVO + LOCAL DE TRABALHO

## ⚡ INÍCIO RÁPIDO

### 1️⃣ Página Arquivo - Como Usar

#### Acessar a Página
- Navegue até **Arquivo Digital** no menu

#### Criar Novo Arquivo
1. Clique em **"Novo Arquivo"**
2. Preencha os campos obrigatórios:
   - **Nome do Arquivo** *
   - **Tipo** * (Fatura, Recibo, Contrato, etc.)
3. Preencha campos opcionais:
   - Local de Trabalho (dropdown)
   - Responsável
   - Contacto
   - Data de Registro
   - URL do Arquivo
   - Nº Documento Associado
   - Documento Assinado (checkbox)
   - Observações
   - Ocorrências (JSON)
4. Clique em **"Criar"**

#### Editar Arquivo
1. Clique no ícone de **Editar** (lápis) na linha do arquivo
2. Modifique os campos desejados
3. Clique em **"Atualizar"**

#### Apagar Arquivo
1. Clique no ícone de **Apagar** (lixeira) na linha do arquivo
2. Confirme a ação

#### Pesquisar/Filtrar
- Use a barra de pesquisa para buscar por nome, tipo ou responsável
- Use o dropdown "Tipo" para filtrar por categoria

---

## 2️⃣ Integrar Local de Trabalho em Outros Formulários

### Passo 1: Importar a Função
```typescript
import { fetchLocalTrabalho } from '../services/supabaseClient';
```

### Passo 2: Criar Interface e Estado
```typescript
interface LocalTrabalho {
  id: string;
  nome: string;
}

const [locaisTrabalho, setLocaisTrabalho] = useState<LocalTrabalho[]>([]);
```

### Passo 3: Carregar Dados
```typescript
useEffect(() => {
  loadLocaisTrabalho();
}, []);

const loadLocaisTrabalho = async () => {
  try {
    const data = await fetchLocalTrabalho();
    setLocaisTrabalho(data || []);
  } catch (err) {
    console.error('Erro ao carregar locais de trabalho:', err);
  }
};
```

### Passo 4: Adicionar Dropdown
```typescript
<div>
  <label>Local de Trabalho</label>
  <select 
    value={formData.localTrabalhoId || ''}
    onChange={e => setFormData({ ...formData, localTrabalhoId: e.target.value })}
  >
    <option value="">Selecione...</option>
    {locaisTrabalho.map((local) => (
      <option key={local.id} value={local.id}>
        {local.nome}
      </option>
    ))}
  </select>
</div>
```

---

## 3️⃣ Funções Disponíveis

### Arquivos
```typescript
// Listar todos os arquivos
const arquivos = await listarArquivos();

// Criar novo arquivo
await criarArquivo({
  nome: 'Contrato XYZ',
  tipo: 'Contrato',
  responsavel: 'João Silva',
  // ... outros campos
});

// Atualizar arquivo
await atualizarArquivo(id, {
  nome: 'Contrato XYZ Atualizado',
  // ... campos a atualizar
});

// Apagar arquivo
await apagarArquivo(id);
```

### Local de Trabalho
```typescript
// Buscar todos os locais de trabalho
const locais = await fetchLocalTrabalho();
// Retorna: [{ id: 'uuid', nome: 'Nome do Local' }, ...]
```

---

## 4️⃣ Campos da Tabela Arquivos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome` | text | ✅ Sim | Nome do arquivo |
| `tipo` | text | ✅ Sim | Tipo (Fatura, Recibo, etc.) |
| `empresa_id` | uuid | ❌ Não | ID do Local de Trabalho |
| `responsavel` | text | ❌ Não | Nome do responsável |
| `contacto` | text | ❌ Não | Contacto |
| `data_registo` | date | ❌ Não | Data de registro |
| `file_url` | text | ❌ Não | URL do arquivo |
| `is_signed` | boolean | ❌ Não | Documento assinado |
| `associated_doc_no` | text | ❌ Não | Nº documento associado |
| `observacoes` | text | ❌ Não | Observações |
| `ocorrencias` | jsonb | ❌ Não | Ocorrências (JSON) |
| `created_at` | timestamptz | 🤖 Auto | Data de criação |
| `updated_at` | timestamptz | 🤖 Auto | Data de atualização |

---

## 5️⃣ Exemplos de Uso

### Exemplo 1: Criar Arquivo Completo
```typescript
await criarArquivo({
  nome: 'Fatura 2026/001',
  tipo: 'Fatura',
  empresa_id: 'uuid-do-local-trabalho',
  responsavel: 'Maria Santos',
  contacto: '+244 923 456 789',
  data_registo: '2026-02-11',
  file_url: 'https://storage.example.com/fatura-001.pdf',
  is_signed: true,
  associated_doc_no: 'FT 2026/001',
  observacoes: 'Fatura referente ao mês de janeiro',
  ocorrencias: { status: 'pago', data_pagamento: '2026-02-10' }
});
```

### Exemplo 2: Buscar e Exibir Arquivos
```typescript
const fetchData = async () => {
  const arquivos = await listarArquivos();
  console.log('Total de arquivos:', arquivos.length);
  
  arquivos.forEach(arquivo => {
    console.log(`${arquivo.nome} - ${arquivo.tipo}`);
  });
};
```

### Exemplo 3: Atualizar Status de Assinatura
```typescript
await atualizarArquivo(arquivoId, {
  is_signed: true,
  observacoes: 'Documento assinado em 11/02/2026'
});
```

---

## 6️⃣ Tratamento de Erros

### Exemplo com Try/Catch
```typescript
try {
  await criarArquivo(formData);
  alert('Arquivo criado com sucesso!');
} catch (err: any) {
  console.error('Erro ao criar arquivo:', err);
  alert(`Erro: ${err.message || 'Erro desconhecido'}`);
}
```

---

## 7️⃣ Validações Importantes

### ✅ Antes de Criar/Atualizar
```typescript
if (!formData.nome || !formData.tipo) {
  alert('Nome e Tipo são obrigatórios');
  return;
}
```

### ✅ Validar JSON (Ocorrências)
```typescript
try {
  const parsed = JSON.parse(jsonString);
  setFormData({ ...formData, ocorrencias: parsed });
} catch {
  alert('JSON inválido');
}
```

---

## 8️⃣ Dicas e Boas Práticas

### ✅ Sempre Recarregar Após Operações
```typescript
await criarArquivo(formData);
await fetchArquivos(); // Recarrega lista
```

### ✅ Usar Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await criarArquivo(formData);
  } finally {
    setLoading(false);
  }
};
```

### ✅ Confirmação Antes de Apagar
```typescript
if (!window.confirm('Tem certeza que deseja apagar?')) {
  return;
}
await apagarArquivo(id);
```

---

## 9️⃣ Checklist de Implementação

### Para Adicionar Local de Trabalho em um Formulário:

- [ ] Importar `fetchLocalTrabalho`
- [ ] Criar interface `LocalTrabalho`
- [ ] Criar estado `locaisTrabalho`
- [ ] Criar função `loadLocaisTrabalho()`
- [ ] Chamar no `useEffect`
- [ ] Adicionar dropdown no formulário
- [ ] Salvar UUID no campo apropriado

---

## 🆘 Resolução de Problemas

### Problema: Locais de Trabalho não aparecem no dropdown
**Solução:** Verificar se `loadLocaisTrabalho()` está sendo chamado no `useEffect`

### Problema: Erro ao criar arquivo
**Solução:** Verificar se campos obrigatórios estão preenchidos (nome, tipo)

### Problema: Arquivo não aparece após criar
**Solução:** Verificar se `fetchArquivos()` está sendo chamado após criar

### Problema: Erro de JSON inválido
**Solução:** Validar formato JSON antes de salvar

---

## 📞 Suporte

Para mais informações, consulte:
- **Documentação Completa:** `INTEGRACAO_ARQUIVO_COMPLETA.md`
- **Código Fonte:** `components/ArchivesManager.tsx`
- **Serviços:** `services/supabaseClient.ts`

---

**Última Atualização:** 11/02/2026
**Versão:** 1.0
**Status:** ✅ Produção
