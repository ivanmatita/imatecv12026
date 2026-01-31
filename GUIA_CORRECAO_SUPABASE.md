# 🔧 Guia para Corrigir Erros 400 do Supabase

## ❌ Problema Identificado
Erro: `Could not find the 'cliente_id' column of 'locais_trabalho' in the schema cache`

Outros erros similares em:
- `movimentos_stock` (400)
- `armazens` (400)

## ✅ Solução

### Passo 1: Acesse o Supabase Dashboard
1. Vá para: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto: **imatecv12026**
   - URL: `alqttoqjftqckojusayf.supabase.co`

### Passo 2: Execute a Migração SQL

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie TODO o conteúdo do arquivo `migrations/fix_missing_columns.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 3: Verifique os Resultados

Você deve ver mensagens como:
```
✓ Coluna cliente_id adicionada à tabela locais_trabalho
✓ Tabela movimentos_stock criada/atualizada
✓ Migration completa!
```

### Passo 4: Teste a Aplicação

1. Volte para a aplicação
2. Pressione **Ctrl+Shift+R** para recarregar completamente
3. Teste registar:
   - ✅ Local de Trabalho
   - ✅ Armazéns
   - ✅ Produtos
   - ✅ Movimentos de Stock
   - ✅ Funcionários
   - ✅ Fecho de Caixa

## 📋 O que a Migração Faz

### Tabela `locais_trabalho`:
- ✅ Adiciona `cliente_id` (UUID, referência para clientes)
- ✅ Adiciona `data_abertura`, `data_encerramento`
- ✅ Adiciona `titulo`, `codigo`, `localizacao`
- ✅ Adiciona `efectivos_dia`, `total_efectivos`
- ✅ Adiciona `descricao`, `contacto`, `observacoes`
- ✅ Adiciona `empresa_id`

### Tabela `movimentos_stock`:
- ✅ Cria a tabela se não existir
- ✅ Adiciona `produto_id`, `armazem_id`
- ✅ Adiciona `tipo` (entrada/saida)
- ✅ Adiciona `quantidade`, `data`
- ✅ Adiciona `documento_origem`, `observacoes`

### Tabela `armazens`:
- ✅ Adiciona `nome`, `localizacao`
- ✅ Adiciona `empresa_id`

### Segurança (RLS):
- ✅ Ativa Row Level Security em todas as tabelas
- ✅ Cria políticas permissivas para desenvolvimento
- ⚠️ **IMPORTANTE**: Ajustar políticas para produção!

### Performance:
- ✅ Cria índices para buscas rápidas
- ✅ Otimiza consultas por cliente, empresa, data

## 🔄 Alternativa: Executar via API (Se preferir)

Se tiver problemas com o Dashboard, pode executar via código:

```javascript
// Executar no console do navegador (F12)
const { createClient } = supabase;
const supabaseUrl = 'https://alqttoqjftqckojusayf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Sua chave
const client = createClient(supabaseUrl, supabaseKey);

// Copie o SQL do arquivo fix_missing_columns.sql e execute
const sql = `...`; // Cole o SQL aqui
const { data, error } = await client.rpc('exec', { sql });
console.log(data, error);
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do SQL Editor no Supabase
2. Confirme que você tem permissões de administrador no projeto
3. Verifique se o projeto está ativo (não pausado)

## ⚠️ Avisos Importantes

1. **Backup**: Essa migração é segura, mas sempre bom ter backup
2. **Produção**: As políticas RLS estão permissivas - ajustar antes de deploy
3. **Performance**: Os índices vão melhorar a velocidade das consultas

---

**Última atualização**: 2026-01-29
**Versão da Migração**: 1.0
**Status**: ✅ Pronta para execução
