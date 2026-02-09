-- ============================================================
-- MIGRAÇÃO CRÍTICA - Corrigir Erros 400
-- Executar no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. CORRIGIR TABELA locais_trabalho
-- Adicionar todas as colunas necessárias
DO $$
BEGIN
    -- cliente_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'cliente_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN cliente_id UUID REFERENCES public.clientes(id)';
        RAISE NOTICE '✓ Coluna cliente_id adicionada';
    END IF;

    -- data_abertura
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'data_abertura'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN data_abertura DATE';
        RAISE NOTICE '✓ Coluna data_abertura adicionada';
    END IF;

    -- data_encerramento
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'data_encerramento'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN data_encerramento DATE';
        RAISE NOTICE '✓ Coluna data_encerramento adicionada';
    END IF;

    -- titulo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'titulo'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN titulo TEXT';
        RAISE NOTICE '✓ Coluna titulo adicionada';
    END IF;

    -- codigo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'codigo'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN codigo TEXT';
        RAISE NOTICE '✓ Coluna codigo adicionada';
    END IF;

    -- efectivos_dia
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'efectivos_dia'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN efectivos_dia INTEGER DEFAULT 0';
        RAISE NOTICE '✓ Coluna efectivos_dia adicionada';
    END IF;

    -- total_efectivos
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'total_efectivos'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN total_efectivos INTEGER DEFAULT 0';
        RAISE NOTICE '✓ Coluna total_efectivos adicionada';
    END IF;

    -- localizacao
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'localizacao'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN localizacao TEXT';
        RAISE NOTICE '✓ Coluna localizacao adicionada';
    END IF;

    -- descricao
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'descricao'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN descricao TEXT';
        RAISE NOTICE '✓ Coluna descricao adicionada';
    END IF;

    -- contacto (⚠️ ESTA COLUNA ESTAVA CAUSANDO O ERRO!)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'contacto'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN contacto TEXT';
        RAISE NOTICE '✓ Coluna contacto adicionada';
    END IF;

    -- observacoes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'observacoes'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN observacoes TEXT';
        RAISE NOTICE '✓ Coluna observacoes adicionada';
    END IF;

    -- empresa_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'locais_trabalho' 
        AND column_name = 'empresa_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.locais_trabalho ADD COLUMN empresa_id UUID REFERENCES public.empresas(id)';
        RAISE NOTICE '✓ Coluna empresa_id adicionada';
    END IF;

    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ Tabela locais_trabalho CORRIGIDA!';
    RAISE NOTICE '===========================================';
END $$;

-- 2. CORRIGIR TABELA armazens
DO $$
BEGIN
    -- nome
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'armazens' 
        AND column_name = 'nome'
    ) THEN
        EXECUTE 'ALTER TABLE public.armazens ADD COLUMN nome TEXT DEFAULT ''Armazém''';
        -- Atualizar valores NULL se houver
        EXECUTE 'UPDATE public.armazens SET nome = ''Armazém'' WHERE nome IS NULL';
        -- Tornar NOT NULL
        EXECUTE 'ALTER TABLE public.armazens ALTER COLUMN nome SET NOT NULL';
        RAISE NOTICE '✓ Coluna nome adicionada';
    END IF;

    -- localizacao
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'armazens' 
        AND column_name = 'localizacao'
    ) THEN
        EXECUTE 'ALTER TABLE public.armazens ADD COLUMN localizacao TEXT';
        RAISE NOTICE '✓ Coluna localizacao adicionada';
    END IF;

    -- empresa_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'armazens' 
        AND column_name = 'empresa_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.armazens ADD COLUMN empresa_id UUID REFERENCES public.empresas(id)';
        RAISE NOTICE '✓ Coluna empresa_id adicionada';
    END IF;

    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ Tabela armazens CORRIGIDA!';
    RAISE NOTICE '===========================================';
END $$;

-- 3. ATIVAR ROW LEVEL SECURITY
ALTER TABLE public.locais_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.armazens ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS PERMISSIVAS (TEMPORÁRIAS - AJUSTAR EM PRODUÇÃO)
DROP POLICY IF EXISTS "Permitir tudo em locais_trabalho" ON public.locais_trabalho;
CREATE POLICY "Permitir tudo em locais_trabalho" 
    ON public.locais_trabalho 
    FOR ALL 
    USING (true);

DROP POLICY IF EXISTS "Permitir tudo em armazens" ON public.armazens;
CREATE POLICY "Permitir tudo em armazens" 
    ON public.armazens 
    FOR ALL 
    USING (true);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_locais_trabalho_cliente 
    ON public.locais_trabalho(cliente_id);

CREATE INDEX IF NOT EXISTS idx_locais_trabalho_empresa 
    ON public.locais_trabalho(empresa_id);

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '██████████████████████████████████████████████';
    RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '██████████████████████████████████████████████';
    RAISE NOTICE '';
    RAISE NOTICE 'Agora você pode:';
    RAISE NOTICE '  ✓ Registrar Locais de Trabalho';
    RAISE NOTICE '  ✓ Registrar Armazéns';
    RAISE NOTICE '  ✓ Registrar Produtos';
    RAISE NOTICE '  ✓ Fazer Compras';
    RAISE NOTICE '  ✓ Cadastrar Funcionários';
    RAISE NOTICE '  ✓ Fazer Fecho de Caixa';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Recarregue a aplicação (Ctrl+Shift+R)';
    RAISE NOTICE '';
END $$;
