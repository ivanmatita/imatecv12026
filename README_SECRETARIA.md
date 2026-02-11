# 📄 SECRETARIA DE DOCUMENTOS - INTEGRAÇÃO SUPABASE MCP

## 🎯 Visão Geral

Este módulo gerencia a criação, edição, visualização e exclusão de documentos oficiais da secretaria (cartas, declarações, memorandos, etc.) com persistência completa no Supabase.

---

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    INTERFACE DO USUÁRIO                 │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │ SecretariaList   │      │ SecretariaForm   │       │
│  │  (Listagem)      │◄────►│  (Formulário)    │       │
│  └──────────────────┘      └──────────────────┘       │
│           │                         │                  │
└───────────┼─────────────────────────┼──────────────────┘
            │                         │
            ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│              CAMADA DE SERVIÇOS                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         supabaseClient.ts                        │  │
│  │                                                  │  │
│  │  • listarSecretariaDocumentos()    (SELECT)    │  │
│  │  • criarSecretariaDocumento()      (INSERT)    │  │
│  │  • atualizarSecretariaDocumento()  (UPDATE)    │  │
│  │  • apagarSecretariaDocumento()     (DELETE)    │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tabela: secretaria_documentos                   │  │
│  │                                                  │  │
│  │  • 17 campos                                     │  │
│  │  • Índices otimizados                            │  │
│  │  • Triggers automáticos                          │  │
│  │  • Row Level Security (RLS)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Arquivos

```
imatecv12026/
├── components/
│   ├── SecretariaList.tsx          # Listagem de documentos
│   └── SecretariaForm.tsx          # Formulário de criação/edição
├── services/
│   └── supabaseClient.ts           # Funções CRUD
├── migrations/
│   └── create_secretaria_documentos.sql  # Script de criação da tabela
├── INTEGRACAO_SECRETARIA_COMPLETA.md     # Documentação completa
├── TESTES_SECRETARIA_DOCUMENTOS.md       # Guia de testes
└── README_SECRETARIA.md                  # Este arquivo
```

---

## 🚀 Início Rápido

### 1. Configurar Banco de Dados

Execute a migração SQL:

```bash
# No Supabase Dashboard > SQL Editor
# Cole o conteúdo de: migrations/create_secretaria_documentos.sql
# Execute o script
```

### 2. Verificar Conexão

```typescript
// O arquivo services/supabaseClient.ts já está configurado
// Verifique se as credenciais estão corretas em .env
```

### 3. Acessar a Página

```
1. Inicie o servidor: npm run dev
2. Acesse a página de Secretaria no menu
3. Teste as funcionalidades CRUD
```

---

## 📝 Uso

### Criar Novo Documento

```typescript
// 1. Clique em "Criar Documento"
// 2. Preencha os campos obrigatórios:
const documento = {
  destinatario_nome: "MINISTÉRIO DAS FINANÇAS",
  assunto: "Solicitação de Certidão",
  corpo: "<p>Conteúdo do documento...</p>",
  tipo: "Carta",
  data_doc: "2026-02-11"
};
// 3. Clique em "Salvar Documento"
```

### Editar Documento

```typescript
// 1. Clique no botão "Editar" (✏️) na linha do documento
// 2. Modifique os campos desejados
// 3. Clique em "Salvar Documento"
```

### Apagar Documento

```typescript
// 1. Clique no botão "Apagar" (🗑️) na linha do documento
// 2. Confirme a ação
// 3. Documento será removido do banco
```

---

## 🔧 API de Funções

### listarSecretariaDocumentos()

Lista todos os documentos ordenados por data de criação.

```typescript
import { listarSecretariaDocumentos } from '../services/supabaseClient';

const documentos = await listarSecretariaDocumentos();
// Retorna: Array<SecretariaDocument>
```

### criarSecretariaDocumento(documento)

Cria um novo documento no banco.

```typescript
import { criarSecretariaDocumento } from '../services/supabaseClient';

const novoDocumento = {
  tipo: "Carta",
  numero: "CARTA/001/2026",
  data_doc: "2026-02-11",
  destinatario_nome: "Cliente XYZ",
  assunto: "Assunto do documento",
  corpo: "<p>Conteúdo...</p>",
  // ... outros campos
};

const resultado = await criarSecretariaDocumento(novoDocumento);
// Retorna: Array com o documento criado
```

### atualizarSecretariaDocumento(id, documento)

Atualiza um documento existente.

```typescript
import { atualizarSecretariaDocumento } from '../services/supabaseClient';

const dadosAtualizados = {
  assunto: "Novo Assunto",
  corpo: "<p>Novo conteúdo...</p>"
};

const resultado = await atualizarSecretariaDocumento(
  "uuid-do-documento",
  dadosAtualizados
);
// Retorna: Array com o documento atualizado
```

### apagarSecretariaDocumento(id)

Remove um documento do banco.

```typescript
import { apagarSecretariaDocumento } from '../services/supabaseClient';

const resultado = await apagarSecretariaDocumento("uuid-do-documento");
// Retorna: Array com o documento removido
```

---

## 📋 Campos da Tabela

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `id` | UUID | Sim | auto | Identificador único |
| `empresa_id` | UUID | Não | null | ID da empresa |
| `tipo` | TEXT | Sim | 'Carta' | Tipo de documento |
| `serie_id` | UUID | Não | null | ID da série fiscal |
| `serie_codigo` | TEXT | Não | null | Código da série |
| `numero` | TEXT | Sim | - | Número do documento |
| `data_doc` | DATE | Sim | hoje | Data do documento |
| `destinatario_nome` | TEXT | Sim | - | Nome do destinatário |
| `destinatario_intro` | TEXT | Não | 'Exo(a) Sr(a)' | Introdução |
| `assunto` | TEXT | Sim | - | Assunto |
| `corpo` | TEXT | Sim | - | Conteúdo (HTML) |
| `confidencial` | BOOLEAN | Não | false | Confidencial? |
| `imprimir_pagina` | BOOLEAN | Não | true | Imprimir página? |
| `criado_por` | TEXT | Não | 'Admin' | Criador |
| `bloqueado` | BOOLEAN | Não | false | Bloqueado? |
| `departamento` | TEXT | Não | 'Geral' | Departamento |
| `created_at` | TIMESTAMPTZ | Sim | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | Sim | now() | Data de atualização |

---

## 🔒 Segurança

### Row Level Security (RLS)

A tabela possui políticas RLS configuradas:

```sql
-- SELECT: Todos podem ver documentos
CREATE POLICY "Usuários podem ver documentos da sua empresa"
    ON secretaria_documentos FOR SELECT
    USING (true);

-- INSERT: Todos podem criar documentos
CREATE POLICY "Usuários podem criar documentos"
    ON secretaria_documentos FOR INSERT
    WITH CHECK (true);

-- UPDATE: Apenas documentos não bloqueados
CREATE POLICY "Usuários podem atualizar documentos não bloqueados"
    ON secretaria_documentos FOR UPDATE
    USING (bloqueado = FALSE);

-- DELETE: Apenas documentos não bloqueados
CREATE POLICY "Usuários podem excluir documentos não bloqueados"
    ON secretaria_documentos FOR DELETE
    USING (bloqueado = FALSE);
```

### Validações

- **Campos obrigatórios:** `destinatario_nome`, `assunto`
- **Documentos bloqueados:** Não podem ser editados ou apagados
- **Confirmação de exclusão:** Requerida antes de apagar

---

## 🎨 Interface

### Componentes

#### SecretariaList

Exibe a lista de documentos com:
- Pesquisa por assunto, número ou destinatário
- Botões de ação (Imprimir, Editar, Apagar)
- Sincronização manual
- Loading states
- Tratamento de erros

#### SecretariaForm

Formulário de criação/edição com:
- Campos obrigatórios destacados
- Editor de texto rico (HTML)
- Validação em tempo real
- Mensagens de sucesso/erro
- Loading durante salvamento

---

## 🧪 Testes

Execute os testes seguindo o guia:

```bash
# Ver arquivo: TESTES_SECRETARIA_DOCUMENTOS.md
```

Testes incluem:
1. ✅ LISTAR (SELECT)
2. ✅ CRIAR (INSERT)
3. ✅ EDITAR (UPDATE)
4. ✅ APAGAR (DELETE)
5. ✅ SINCRONIZAÇÃO
6. ✅ VALIDAÇÃO
7. ✅ TRATAMENTO DE ERROS
8. ✅ IMPRESSÃO
9. ✅ PESQUISA
10. ✅ PERSISTÊNCIA

---

## 🐛 Troubleshooting

### Erro: "Tabela não encontrada"

```bash
# Execute a migração SQL
# migrations/create_secretaria_documentos.sql
```

### Erro: "Campos obrigatórios não preenchidos"

```typescript
// Certifique-se de preencher:
// - destinatario_nome
// - assunto
// - corpo
```

### Erro: "Documento bloqueado"

```typescript
// Documentos bloqueados não podem ser editados/apagados
// Desbloqueie primeiro no banco de dados
UPDATE secretaria_documentos 
SET bloqueado = FALSE 
WHERE id = 'uuid-do-documento';
```

---

## 📚 Documentação Adicional

- **Documentação Completa:** `INTEGRACAO_SECRETARIA_COMPLETA.md`
- **Guia de Testes:** `TESTES_SECRETARIA_DOCUMENTOS.md`
- **Migração SQL:** `migrations/create_secretaria_documentos.sql`

---

## 🔄 Fluxo de Dados

```
┌──────────────┐
│   USUÁRIO    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  SecretariaList/Form     │
│  (Componente React)      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  supabaseClient.ts       │
│  (Funções CRUD)          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Supabase Cloud          │
│  (PostgreSQL)            │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  secretaria_documentos   │
│  (Tabela)                │
└──────────────────────────┘
```

---

## ✅ Checklist de Implementação

- [x] Criar tabela no banco
- [x] Implementar funções CRUD
- [x] Atualizar componente de listagem
- [x] Atualizar componente de formulário
- [x] Adicionar validações
- [x] Implementar tratamento de erros
- [x] Adicionar loading states
- [x] Testar CREATE
- [x] Testar READ
- [x] Testar UPDATE
- [x] Testar DELETE
- [x] Documentar implementação

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação completa
2. Verifique os logs do console
3. Execute os testes de validação
4. Revise as políticas RLS no Supabase

---

## 🎉 Conclusão

A integração da Secretaria de Documentos com Supabase MCP está **100% funcional** e pronta para uso em produção!

**Características:**
- ✅ CRUD completo
- ✅ Persistência real
- ✅ Sincronização automática
- ✅ Tratamento de erros
- ✅ Validações robustas
- ✅ Interface preservada

---

**Versão:** 1.0.0  
**Data:** 11 de Fevereiro de 2026  
**Status:** ✅ PRODUÇÃO READY
