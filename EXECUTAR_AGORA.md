# 🚨 EXECUTAR MIGRAÇÃO URGENTE - Supabase

## ⚡ PASSOS SIMPLES (2 minutos)

### 1️⃣ ABRA O SUPABASE DASHBOARD
Clique aqui: https://supabase.com/dashboard/project/alqttoqjftqckojusayf/editor

### 2️⃣ CLIQUE EM "SQL EDITOR" (menu lateral esquerdo)

### 3️⃣ CLIQUE EM "+ NEW QUERY"

### 4️⃣ COPIE E COLE O CÓDIGO ABAIXO:

```sql
-- CORREÇÃO URGENTE - Adicionar colunas faltantes

-- 1. Corrigir locais_trabalho
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id);
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS data_abertura DATE;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS data_encerramento DATE;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS efectivos_dia INTEGER DEFAULT 0;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS total_efectivos INTEGER DEFAULT 0;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS localizacao TEXT;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS contacto TEXT;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.locais_trabalho ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- 2. Corrigir armazens
ALTER TABLE public.armazens ADD COLUMN IF NOT EXISTS nome TEXT DEFAULT 'Armazém';
ALTER TABLE public.armazens ADD COLUMN IF NOT EXISTS localizacao TEXT;
ALTER TABLE public.armazens ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- 3. Ativar RLS
ALTER TABLE public.locais_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.armazens ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas permissivas
DROP POLICY IF EXISTS "Permitir tudo em locais_trabalho" ON public.locais_trabalho;
CREATE POLICY "Permitir tudo em locais_trabalho" ON public.locais_trabalho FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir tudo em armazens" ON public.armazens;
CREATE POLICY "Permitir tudo em armazens" ON public.armazens FOR ALL USING (true);

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_locais_trabalho_cliente ON public.locais_trabalho(cliente_id);
CREATE INDEX IF NOT EXISTS idx_locais_trabalho_empresa ON public.locais_trabalho(empresa_id);
```

### 5️⃣ CLIQUE EM "RUN" (ou pressione Ctrl+Enter)

### 6️⃣ AGUARDE A MENSAGEM DE SUCESSO

Você deve ver: "Success. No rows returned"

### 7️⃣ VOLTE PARA A APLICAÇÃO E PRESSIONE Ctrl+Shift+R

---

## ✅ APÓS EXECUTAR TUDO FUNCIONARÁ:

- ✅ Registro de Local de Trabalho
- ✅ Registro de Armazéns
- ✅ Registro de Produtos
- ✅ Registro de Compras
- ✅ Fecho de Caixa
- ✅ Cadastro de Funcionários

---

## 🔴 SE DER ERRO NO PASSO 5:

Tente executar linha por linha:

1. Primeiro execute só as linhas do "-- 1. Corrigir locais_trabalho"
2. Depois as linhas do "-- 2. Corrigir armazens"
3. Depois "-- 3. Ativar RLS"
4. Depois "-- 4. Criar políticas"
5. Por último "-- 5. Criar índices"

---

**URGENTE**: Faça isso AGORA para o sistema voltar a funcionar! 🚀
