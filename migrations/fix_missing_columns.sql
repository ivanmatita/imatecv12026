-- ====================================================================
-- MIGRATION: Corrigir Colunas Faltantes nas Tabelas
-- Data: 2026-01-29
-- Descrição: Adiciona colunas faltantes que estão causando erros 400
-- ====================================================================

-- 1. Verificar e adicionar coluna cliente_id em locais_trabalho
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'cliente_id'
    ) THEN
        ALTER TABLE public.locais_trabalho 
        ADD COLUMN cliente_id UUID REFERENCES public.clientes(id);
        
        RAISE NOTICE 'Coluna cliente_id adicionada à tabela locais_trabalho';
    ELSE
        RAISE NOTICE 'Coluna cliente_id já existe na tabela locais_trabalho';
    END IF;
END $$;

-- 2. Verificar estrutura completa da tabela locais_trabalho
DO $$ 
BEGIN
    -- Adicionar outras colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'data_abertura') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN data_abertura DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'data_encerramento') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN data_encerramento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'titulo') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN titulo TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'codigo') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN codigo TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'efectivos_dia') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN efectivos_dia INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'total_efectivos') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN total_efectivos INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'localizacao') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN localizacao TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'descricao') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN descricao TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'contacto') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN contacto TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'observacoes') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_trabalho' AND column_name = 'empresa_id') THEN
        ALTER TABLE public.locais_trabalho ADD COLUMN empresa_id UUID REFERENCES public.empresas(id);
    END IF;
END $$;

-- 3. Verificar e corrigir tabela movimentos_stock
DO $$ 
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movimentos_stock') THEN
        CREATE TABLE public.movimentos_stock (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            produto_id UUID REFERENCES public.produtos(id),
            armazem_id UUID REFERENCES public.armazens(id),
            tipo TEXT NOT NULL, -- 'entrada' ou 'saida'
            quantidade DECIMAL(10,2) NOT NULL,
            data DATE NOT NULL,
            documento_origem TEXT,
            observacoes TEXT,
            empresa_id UUID REFERENCES public.empresas(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela movimentos_stock criada';
    ELSE
        -- Garantir que todas as colunas existem
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentos_stock' AND column_name = 'produto_id') THEN
            ALTER TABLE public.movimentos_stock ADD COLUMN produto_id UUID REFERENCES public.produtos(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentos_stock' AND column_name = 'armazem_id') THEN
            ALTER TABLE public.movimentos_stock ADD COLUMN armazem_id UUID REFERENCES public.armazens(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentos_stock' AND column_name = 'tipo') THEN
            ALTER TABLE public.movimentos_stock ADD COLUMN tipo TEXT NOT NULL DEFAULT 'entrada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentos_stock' AND column_name = 'quantidade') THEN
            ALTER TABLE public.movimentos_stock ADD COLUMN quantidade DECIMAL(10,2) NOT NULL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentos_stock' AND column_name = 'data') THEN
            ALTER TABLE public.movimentos_stock ADD COLUMN data DATE NOT NULL DEFAULT CURRENT_DATE;
        END IF;
        
        RAISE NOTICE 'Tabela movimentos_stock verificada e atualizada';
    END IF;
END $$;

-- 4. Verificar e corrigir tabela armazens
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'armazens' AND column_name = 'nome') THEN
        ALTER TABLE public.armazens ADD COLUMN nome TEXT NOT NULL DEFAULT 'Armazém';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'armazens' AND column_name = 'localizacao') THEN
        ALTER TABLE public.armazens ADD COLUMN localizacao TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'armazens' AND column_name = 'empresa_id') THEN
        ALTER TABLE public.armazens ADD COLUMN empresa_id UUID REFERENCES public.empresas(id);
    END IF;
END $$;

-- 5. Atualizar RLS policies para permitir acesso
ALTER TABLE public.locais_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.armazens ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias permissivas (AJUSTAR EM PRODUÇÃO!)
DROP POLICY IF EXISTS "Permitir tudo em locais_trabalho" ON public.locais_trabalho;
CREATE POLICY "Permitir tudo em locais_trabalho" ON public.locais_trabalho
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir tudo em movimentos_stock" ON public.movimentos_stock;
CREATE POLICY "Permitir tudo em movimentos_stock" ON public.movimentos_stock
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir tudo em armazens" ON public.armazens;
CREATE POLICY "Permitir tudo em armazens" ON public.armazens
    FOR ALL USING (true);

-- 6. Verificar índices para performance
CREATE INDEX IF NOT EXISTS idx_locais_trabalho_cliente ON public.locais_trabalho(cliente_id);
CREATE INDEX IF NOT EXISTS idx_locais_trabalho_empresa ON public.locais_trabalho(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_stock_produto ON public.movimentos_stock(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_stock_armazem ON public.movimentos_stock(armazem_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_stock_data ON public.movimentos_stock(data DESC);

-- Mensagem final
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completa! Todas as colunas verificadas e corrigidas.';
END $$;
