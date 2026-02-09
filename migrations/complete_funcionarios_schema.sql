-- ====================================================================
-- MIGRATION: Corrigir Banco de Dados - Tabela Funcionários Completa
-- Data: 2026-01-29
-- Descrição: Adiciona TODAS as colunas necessárias para o Classificador Salarial
-- ====================================================================

DO $$ 
BEGIN
    -- 1. Colunas de Subsídios e Abonos
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_transporte_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_transporte_fim DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_alimentacao_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_alimentacao_fim DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_familia_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_familia_fim DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_habitacao_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_habitacao_fim DATE;
    
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_natal NUMERIC DEFAULT 0;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_natal_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_natal_fim DATE;
    
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_ferias NUMERIC DEFAULT 0;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_ferias_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS subs_ferias_fim DATE;
    
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS abonos NUMERIC DEFAULT 0;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS abonos_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS abonos_fim DATE;
    
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS adiantamentos NUMERIC DEFAULT 0;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS adiantamentos_inicio DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS adiantamentos_fim DATE;
    
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS salary_adjustments NUMERIC DEFAULT 0;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS penalties NUMERIC DEFAULT 0;

    -- 2. Dados Pessoais Adicionais
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS genero TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS estado_civil TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS nacionalidade TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS naturalidade TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS nome_pai TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS nome_mae TEXT;

    -- 3. Endereço Completo
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS endereco TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS municipio TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS bairro TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS casa_n TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS rua TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS zona TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS codigo_postal TEXT;

    -- 4. Dados Fiscais e Profissionais
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS work_location_id UUID;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS reparticao_fiscal TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS inss_antigo TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS local_trabalho_provincia TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS local_trabalho_municipio TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS grupo_irt TEXT;
    
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS tipo_documento TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS numero_documento TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS entidade_emissora TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS data_emissao DATE;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS data_validade DATE;

    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS solicitado_por TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS motivo_admissao TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS horario_semanal JSONB;

    -- 5. Outros Estados UI / Performance
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS performance_score NUMERIC DEFAULT 0;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS turnover_risk TEXT;
    ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS is_magic BOOLEAN DEFAULT FALSE;

    RAISE NOTICE '✅ Tabela public.funcionarios atualizada com todas as colunas necessárias!';
END $$;
