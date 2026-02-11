-- =====================================================
-- MIGRAÇÃO: TABELA SECRETARIA_DOCUMENTOS
-- Data: 2026-02-11
-- Descrição: Criação da tabela para gestão de documentos da secretaria
-- =====================================================

-- Criar tabela secretaria_documentos se não existir
CREATE TABLE IF NOT EXISTS secretaria_documentos (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id),
    
    -- Informações do Documento
    tipo TEXT NOT NULL DEFAULT 'Carta',
    serie_id UUID REFERENCES series(id),
    serie_codigo TEXT,
    numero TEXT NOT NULL,
    data_doc DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Destinatário
    destinatario_nome TEXT NOT NULL,
    destinatario_intro TEXT DEFAULT 'Exo(a) Sr(a)',
    
    -- Conteúdo
    assunto TEXT NOT NULL,
    corpo TEXT NOT NULL,
    
    -- Configurações
    confidencial BOOLEAN DEFAULT FALSE,
    imprimir_pagina BOOLEAN DEFAULT TRUE,
    
    -- Controle
    criado_por TEXT DEFAULT 'Admin',
    bloqueado BOOLEAN DEFAULT FALSE,
    departamento TEXT DEFAULT 'Geral',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_secretaria_documentos_empresa_id 
    ON secretaria_documentos(empresa_id);

CREATE INDEX IF NOT EXISTS idx_secretaria_documentos_created_at 
    ON secretaria_documentos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_secretaria_documentos_numero 
    ON secretaria_documentos(numero);

CREATE INDEX IF NOT EXISTS idx_secretaria_documentos_tipo 
    ON secretaria_documentos(tipo);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_secretaria_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_secretaria_documentos_updated_at 
    ON secretaria_documentos;

CREATE TRIGGER trigger_update_secretaria_documentos_updated_at
    BEFORE UPDATE ON secretaria_documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_secretaria_documentos_updated_at();

-- Comentários na tabela e colunas
COMMENT ON TABLE secretaria_documentos IS 
    'Tabela para gestão de documentos da secretaria (cartas, declarações, memorandos, etc.)';

COMMENT ON COLUMN secretaria_documentos.id IS 
    'Identificador único do documento (UUID)';

COMMENT ON COLUMN secretaria_documentos.empresa_id IS 
    'Referência à empresa proprietária do documento';

COMMENT ON COLUMN secretaria_documentos.tipo IS 
    'Tipo de documento (Carta, Declaração, Memorando, etc.)';

COMMENT ON COLUMN secretaria_documentos.serie_id IS 
    'Referência à série fiscal do documento';

COMMENT ON COLUMN secretaria_documentos.numero IS 
    'Número identificador do documento';

COMMENT ON COLUMN secretaria_documentos.data_doc IS 
    'Data de emissão do documento';

COMMENT ON COLUMN secretaria_documentos.destinatario_nome IS 
    'Nome completo do destinatário';

COMMENT ON COLUMN secretaria_documentos.destinatario_intro IS 
    'Introdução do destinatário (Ex: Exo(a) Sr(a))';

COMMENT ON COLUMN secretaria_documentos.assunto IS 
    'Assunto principal do documento';

COMMENT ON COLUMN secretaria_documentos.corpo IS 
    'Conteúdo completo do documento (HTML permitido)';

COMMENT ON COLUMN secretaria_documentos.confidencial IS 
    'Indica se o documento é confidencial';

COMMENT ON COLUMN secretaria_documentos.imprimir_pagina IS 
    'Indica se deve imprimir número de página';

COMMENT ON COLUMN secretaria_documentos.criado_por IS 
    'Nome do usuário que criou o documento';

COMMENT ON COLUMN secretaria_documentos.bloqueado IS 
    'Indica se o documento está bloqueado para edição';

COMMENT ON COLUMN secretaria_documentos.departamento IS 
    'Departamento responsável pelo documento';

COMMENT ON COLUMN secretaria_documentos.created_at IS 
    'Data e hora de criação do documento';

COMMENT ON COLUMN secretaria_documentos.updated_at IS 
    'Data e hora da última atualização do documento';

-- Habilitar Row Level Security (RLS)
ALTER TABLE secretaria_documentos ENABLE ROW LEVEL SECURITY;

-- Política de acesso: usuários autenticados podem ver documentos da sua empresa
CREATE POLICY "Usuários podem ver documentos da sua empresa"
    ON secretaria_documentos
    FOR SELECT
    USING (true); -- Ajustar conforme regras de negócio

-- Política de inserção: usuários autenticados podem criar documentos
CREATE POLICY "Usuários podem criar documentos"
    ON secretaria_documentos
    FOR INSERT
    WITH CHECK (true); -- Ajustar conforme regras de negócio

-- Política de atualização: usuários podem atualizar documentos não bloqueados
CREATE POLICY "Usuários podem atualizar documentos não bloqueados"
    ON secretaria_documentos
    FOR UPDATE
    USING (bloqueado = FALSE); -- Apenas documentos não bloqueados

-- Política de exclusão: usuários podem excluir documentos não bloqueados
CREATE POLICY "Usuários podem excluir documentos não bloqueados"
    ON secretaria_documentos
    FOR DELETE
    USING (bloqueado = FALSE); -- Apenas documentos não bloqueados

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTAR EM PRODUÇÃO)
-- =====================================================

/*
-- Inserir documento de exemplo
INSERT INTO secretaria_documentos (
    tipo,
    numero,
    data_doc,
    destinatario_nome,
    destinatario_intro,
    assunto,
    corpo,
    confidencial,
    criado_por,
    departamento
) VALUES (
    'Carta',
    'CARTA/001/2026',
    CURRENT_DATE,
    'MINISTÉRIO DAS FINANÇAS',
    'Exmo(a) Sr(a)',
    'Solicitação de Certidão de Quitação Fiscal',
    '<p>Vimos por este meio solicitar a emissão de Certidão de Quitação Fiscal para fins de participação em concurso público.</p><p>Agradecemos antecipadamente a atenção dispensada.</p>',
    FALSE,
    'Admin',
    'Financeiro'
);
*/

-- =====================================================
-- VERIFICAÇÕES
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'secretaria_documentos';

-- Verificar colunas da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'secretaria_documentos'
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'secretaria_documentos';

-- Verificar triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'secretaria_documentos';

-- Contar documentos
SELECT COUNT(*) as total_documentos FROM secretaria_documentos;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
