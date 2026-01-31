# 🔧 CORREÇÃO RÁPIDA - Erros 400 Supabase

## ⚡ Solução em 3 Passos

### ✅ PASSO 1: Acesse o Supabase Dashboard
```
1. Vá para: https://supabase.com/dashboard/project/alqttoqjftqckojusayf
2. Login com sua conta
3. Clique em "SQL Editor" no menu lateral
```

### ✅ PASSO 2: Execute a Migração
```
1. Clique em "New Query"
2. Abra o arquivo: migrations/fix_missing_columns.sql
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em "Run" (ou Ctrl+Enter)
```

### ✅ PASSO 3: Verifique
```
1. Recarregue a aplicação (Ctrl+Shift+R)
2. Teste registrar um Local de Trabalho
3. Teste registrar um Armazém
4. ✅ Deve funcionar!
```

---

## 🐛 Problema Atual

**Erro**: `Could not find the 'cliente_id' column of 'locais_trabalho'`

**Causa**: Coluna `cliente_id` não existe na tabela `locais_trabalho` do Supabase

**Impacto**: Não consegue registrar:
- ❌ Locais de Trabalho
- ❌ Armazéns  
- ❌ Movimentos de Stock
- ❌ Produtos
- ❌ Funcionários
- ❌ Fecho de Caixa

---

## 🔍 Verificação Rápida (Opcional)

Execute no console do navegador (F12):

```javascript
const { supabase } = await import('./services/supabaseClient');
const { data, error } = await supabase.from('locais_trabalho').select('*').limit(1);
console.log('Erro:', error?.message || 'Nenhum erro');
```

Se aparecer erro sobre colunas, a migração é necessária.

---

## 📋 O que a Migração Faz

✅ Adiciona coluna `cliente_id` em `locais_trabalho`
✅ Adiciona todas as colunas necessárias nas tabelas
✅ Cria tabela `movimentos_stock` se não existir
✅ Configura índices para performance
✅ Ativa RLS (Row Level Security)

**Tempo estimado**: 30 segundos
**Risco**: Baixíssimo (apenas adiciona colunas)

---

## 🆘 Problemas?

Se o SQL Editor não funcionar, tente:

1. **Método alternativo - Table Editor**:
   - Vá em "Table Editor" > "locais_trabalho"
   - Clique em "Add column"
   - Nome: `cliente_id`
   - Type: `uuid`
   - Foreign Key: `clientes.id`

2. **Método alternativo - API**:
   - Use o script `diagnostico-supabase.js` no console
   - Ele vai identificar exatamente o que falta

---

## ✅ Após Corrigir

Você poderá:
- ✅ Registrar Locais de Trabalho com clientes
- ✅ Criar Armazéns
- ✅ Lançar Movimentos de Stock
- ✅ Registrar Produtos
- ✅ Cadastrar Funcionários
- ✅ Fazer Fecho de Caixa

Tudo sincronizado com o Supabase! 🚀

---

**IMPORTANTE**: Após executar a migração, recarregue COMPLETAMENTE a aplicação (Ctrl+Shift+R)
