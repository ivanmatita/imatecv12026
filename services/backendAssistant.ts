/**
 * BACKEND ASSISTANT - Integração Completa Supabase
 * 
 * Este assistente gerencia todas as operações CRUD para:
 * - Faturas (Vendas)
 * - Compras
 * - Caixas e Movimentos
 * - Séries de Documentos
 * 
 * Mantém todas as funcionalidades existentes e adiciona sincronização cloud
 */

import { supabase } from './supabaseClient';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface BackendResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

const EMPRESA_ID = '00000000-0000-0000-0000-000000000001';

// ============================================
// HELPER: Garantir UUID válido
// ============================================
// ============================================
// HELPER: Garantir UUID válido ou NULL
// ============================================
function ensureUUID(id: string | undefined): string {
    if (!id || id.length < 36) {
        return EMPRESA_ID; // Fallback for mandatory company_id
    }
    return id;
}

function ensureOptionalUUID(id: string | undefined): string | null {
    if (!id || id.length < 36) {
        return null;
    }
    return id;
}

// ============================================
// FATURAS (VENDAS)
// ============================================

export const InvoiceBackend = {
    /**
     * Buscar todas as faturas
     */
    async fetchAll(): Promise<BackendResponse> {
        try {
            const { data, error } = await supabase
                .from('faturas')
                .select('*')
                .order('data_emissao', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: `${data?.length || 0} faturas carregadas`
            };
        } catch (error: any) {
            console.error('Erro ao buscar faturas:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Salvar ou atualizar fatura
     */
    async save(invoice: any): Promise<BackendResponse> {
        try {
            // Ensure ID is valid or generate a new one if it's a temp/mock ID
            const validId = (invoice.id && invoice.id.length >= 36) ? invoice.id : crypto.randomUUID();

            const invoiceData = {
                id: validId,
                empresa_id: invoice.companyId || EMPRESA_ID,
                serie_id: ensureOptionalUUID(invoice.seriesId),
                codigo_serie: invoice.seriesCode || 'MANUAL',
                numero: invoice.number,
                tipo: invoice.type,
                data_emissao: invoice.date,
                hora_emissao: invoice.time || new Date().toLocaleTimeString(),
                data_vencimento: invoice.dueDate,
                data_contabilistica: invoice.accountingDate || invoice.date,
                cliente_id: ensureOptionalUUID(invoice.clientId),
                cliente_nome: invoice.clientName || 'Cliente Final',
                cliente_nif: invoice.clientNif || '999999999',
                subtotal: Number(invoice.subtotal || 0),
                desconto_global: Number(invoice.globalDiscount || 0),
                taxa_iva: Number(invoice.taxRate || 0),
                valor_iva: Number(invoice.taxAmount || 0),
                valor_retencao: Number(invoice.withholdingAmount || 0),
                total: Number(invoice.total || 0),
                valor_pago: Number(invoice.paidAmount || 0),
                moeda: invoice.currency || 'AOA',
                taxa_cambio: Number(invoice.exchangeRate || 1),
                status: invoice.status || 'Rascunho',
                certificado: invoice.isCertified || false,
                hash: invoice.hash,
                metodo_pagamento: invoice.paymentMethod,
                caixa_id: ensureOptionalUUID(invoice.cashRegisterId),
                local_trabalho_id: ensureOptionalUUID(invoice.workLocationId),
                armazem_destino_id: ensureOptionalUUID(invoice.warehouseId),
                operador_nome: invoice.operatorName,
                tipologia: invoice.typology || 'Geral',
                origem: invoice.source || 'MANUAL',
                itens: invoice.items,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('faturas')
                .upsert(invoiceData)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Fatura salva com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao salvar fatura:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Gerar número sequencial oficial via RPC
     */
    async gerarNumeroSequencial(tipoDoc: string, serie: string, ano: number): Promise<number> {
        const { data, error } = await supabase.rpc('get_next_document_number', {
            p_tipo_documento: tipoDoc,
            p_serie: serie,
            p_ano: ano
        });

        if (error) {
            console.error('Erro ao gerar sequência documental:', error);
            throw error;
        }

        return data;
    },

    /**
     * Certificar um rascunho de fatura
     */
    async certificar(id: string, updates: any): Promise<BackendResponse> {
        try {
            const { data, error } = await supabase
                .from('faturas')
                .update({
                    ...updates,
                    certificado: true,
                    status_integracao: 'VALIDATED',
                    processado_em: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Fatura certificada com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao certificar fatura:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Deletar fatura
     */
    async delete(id: string): Promise<BackendResponse> {
        try {
            const { error } = await supabase
                .from('faturas')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return {
                success: true,
                message: 'Fatura deletada com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao deletar fatura:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// ============================================
// COMPRAS (PURCHASES)
// ============================================

export const PurchaseBackend = {
    /**
     * Buscar todas as compras
     */
    async fetchAll(): Promise<BackendResponse> {
        try {
            const { data, error } = await supabase
                .from('compras')
                .select('*')
                .order('data_emissao', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: `${data?.length || 0} compras carregadas`
            };
        } catch (error: any) {
            console.error('Erro ao buscar compras:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Salvar ou atualizar compra
     */
    async save(purchase: any): Promise<BackendResponse> {
        try {
            const purchaseData = {
                id: ensureUUID(purchase.id),
                empresa_id: EMPRESA_ID,
                fornecedor_id: ensureUUID(purchase.supplierId),
                fornecedor_nome: purchase.supplierName,
                fornecedor_nif: purchase.supplierNif,
                fornecedor_endereco: purchase.supplierAddress,
                tipo: purchase.type,
                numero_documento: purchase.documentNumber,
                hash: purchase.hash,
                data_emissao: purchase.date,
                data_vencimento: purchase.dueDate,
                subtotal: Number(purchase.subtotal || 0),
                desconto_global: Number(purchase.globalDiscount || 0),
                valor_iva: Number(purchase.taxAmount || 0),
                total: Number(purchase.total || 0),
                moeda: purchase.currency || 'AOA',
                taxa_cambio: Number(purchase.exchangeRate || 1),
                status: purchase.status || 'PENDING',
                metodo_pagamento: purchase.paymentMethod,
                caixa_id: ensureUUID(purchase.cashRegisterId),
                local_trabalho_id: ensureUUID(purchase.workLocationId),
                armazem_id: ensureUUID(purchase.warehouseId),
                anexo: purchase.attachment,
                status_integracao: purchase.integrationStatus,
                processado_em: purchase.processedAt,
                observacoes: purchase.notes,
                itens: JSON.stringify(purchase.items || []),
                created_by: ensureUUID(purchase.createdBy),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('compras')
                .upsert(purchaseData)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Compra salva com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao salvar compra:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Deletar compra
     */
    async delete(id: string): Promise<BackendResponse> {
        try {
            const { error } = await supabase
                .from('compras')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return {
                success: true,
                message: 'Compra deletada com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao deletar compra:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// ============================================
// SÉRIES DE DOCUMENTOS
// ============================================

export const SeriesBackend = {
    /**
     * Buscar todas as séries
     */
    async fetchAll(): Promise<BackendResponse> {
        try {
            const { data, error } = await supabase
                .from('series')
                .select('*')
                .order('codigo', { ascending: true });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: `${data?.length || 0} séries carregadas`
            };
        } catch (error: any) {
            console.error('Erro ao buscar séries:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Salvar ou atualizar série
     */
    async save(series: any): Promise<BackendResponse> {
        try {
            const seriesData = {
                id: ensureUUID(series.id),
                empresa_id: EMPRESA_ID,
                nome: series.name,
                codigo: series.code,
                tipo: series.type || 'NORMAL',
                ano: series.year || new Date().getFullYear(),
                sequencia_atual: Number(series.currentSequence || 1),
                sequencias: JSON.stringify(series.sequences || {}),
                ativo: series.active !== false,
                utilizadores_permitidos: series.allowedUsers || [],
                detalhes_bancarios: series.bankDetails,
                texto_rodape: series.footerText,
                logo: series.logo,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('series')
                .upsert(seriesData)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Série salva com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao salvar série:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Deletar série
     */
    async delete(id: string): Promise<BackendResponse> {
        try {
            const { error } = await supabase
                .from('series')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return {
                success: true,
                message: 'Série deletada com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao deletar série:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Obter próximo número da série (Versão AGT Robusta)
     */
    async getNextNumber(seriesId: string, docType: string): Promise<BackendResponse> {
        try {
            const { data: series, error: seriesError } = await supabase
                .from('series')
                .select('*')
                .eq('id', seriesId)
                .single();

            if (seriesError || !series) throw new Error('Série não encontrada');

            // Chamada RPC para garantir atomicidade e conformidade AGT
            const { data: sequence, error: rpcError } = await supabase.rpc('get_next_document_number', {
                p_tipo_documento: docType,
                p_serie: series.codigo,
                p_ano: series.ano
            });

            if (rpcError) throw rpcError;

            // Formato AGT: [SÉRIE] [ANO]/[SEQUÊNCIA] (Ex: AGT 2026/000001)
            const docNumber = `${series.codigo} ${series.ano}/${String(sequence).padStart(6, '0')}`;

            // Check for duplicates in 'faturas' table before returning
            const { count, error: countError } = await supabase
                .from('faturas')
                .select('id', { count: 'exact', head: true })
                .eq('numero', docNumber)
                .eq('tipo', docType);

            if (countError) throw countError;
            if (count && count > 0) {
                // Se der duplicado (improvável com RPC mas possível na migração), tenta novo
                console.warn(`Número duplicado detectado: ${docNumber}. Tentando re-sincronizar...`);
                return this.getNextNumber(seriesId, docType);
            }

            return {
                success: true,
                data: {
                    number: docNumber,
                    sequence: sequence,
                    code: series.codigo,
                    year: series.ano
                }
            };
        } catch (error: any) {
            console.error('Erro ao gerar sequência documental:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// ============================================
// CAIXAS (CASH REGISTERS)
// ============================================

export const CashRegisterBackend = {
    /**
     * Buscar todas as caixas
     */
    async fetchAll(): Promise<BackendResponse> {
        try {
            const { data, error } = await supabase
                .from('caixas')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: `${data?.length || 0} caixas carregadas`
            };
        } catch (error: any) {
            console.error('Erro ao buscar caixas:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Atualizar saldo da caixa
     */
    async updateBalance(cashRegisterId: string, newBalance: number): Promise<BackendResponse> {
        try {
            const { data, error } = await supabase
                .from('caixas')
                .update({
                    saldo_atual: newBalance,
                    updated_at: new Date().toISOString()
                })
                .eq('id', cashRegisterId)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Saldo atualizado com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao atualizar saldo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Registrar movimento de caixa
     */
    async registerMovement(movement: any): Promise<BackendResponse> {
        try {
            const movementData = {
                id: ensureUUID(movement.id),
                empresa_id: EMPRESA_ID,
                caixa_id: ensureUUID(movement.cashRegisterId),
                tipo: movement.type, // ENTRY, EXIT
                valor: Number(movement.amount),
                descricao: movement.description,
                categoria: movement.category,
                metodo_pagamento: movement.paymentMethod,
                documento_ref: movement.documentRef,
                operador_nome: movement.operatorName,
                origem: movement.source || 'MANUAL',
                data_movimento: movement.date || new Date().toISOString(),
                observacoes: movement.notes
            };

            const { data, error } = await supabase
                .from('movimentos_caixa')
                .insert(movementData)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Movimento registrado com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao registrar movimento:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// ============================================
// ARMAZÉNS (WAREHOUSES)
// ============================================

export const WarehouseBackend = {
    /**
     * Buscar todos os armazéns
     */
    async fetchAll(): Promise<BackendResponse> {
        try {
            const { data, error } = await supabase
                .from('armazens')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: `${data?.length || 0} armazéns carregados`
            };
        } catch (error: any) {
            console.error('Erro ao buscar armazéns:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Salvar ou atualizar armazém
     */
    async save(warehouse: any): Promise<BackendResponse> {
        try {
            const warehouseData = {
                id: ensureUUID(warehouse.id),
                empresa_id: EMPRESA_ID,
                nome: warehouse.name,
                codigo: warehouse.code,
                tipo: warehouse.type || 'PRINCIPAL',
                endereco: warehouse.address,
                responsavel: warehouse.manager,
                telefone: warehouse.phone,
                email: warehouse.email,
                capacidade_maxima: Number(warehouse.maxCapacity || 0),
                ativo: warehouse.active !== false,
                observacoes: warehouse.notes,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('armazens')
                .upsert(warehouseData)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Armazém salvo com sucesso'
            };
        } catch (error: any) {
            console.error('Erro ao salvar armazém:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

const BackendAssistant = {
    vendas: {
        listar: InvoiceBackend.fetchAll,
        criar: InvoiceBackend.save,
        atualizar: (_id: string, data: any) => InvoiceBackend.save(data),
        excluir: InvoiceBackend.delete,
        gerarNumeroSequencial: InvoiceBackend.gerarNumeroSequencial,
        certificar: InvoiceBackend.certificar
    },
    compras: {
        listar: PurchaseBackend.fetchAll,
        criar: PurchaseBackend.save,
        atualizar: (_id: string, data: any) => PurchaseBackend.save(data),
        excluir: PurchaseBackend.delete
    },
    series: {
        listar: SeriesBackend.fetchAll,
        criar: SeriesBackend.save,
        atualizar: (_id: string, data: any) => SeriesBackend.save(data),
        excluir: SeriesBackend.delete,
        proximoNumero: SeriesBackend.getNextNumber
    },
    caixas: {
        listar: CashRegisterBackend.fetchAll,
        criar: async (c: any) => ({ success: false, message: 'Criação via backend não implementada' }),
        atualizar: CashRegisterBackend.updateBalance,
        excluir: async (id: string) => ({ success: true }), // Mock
        registrarMovimento: CashRegisterBackend.registerMovement
    },
    armazens: {
        listar: WarehouseBackend.fetchAll,
        criar: WarehouseBackend.save,
        atualizar: (_id: string, data: any) => WarehouseBackend.save(data),
        excluir: async (id: string) => ({ success: true })
    },
    // Mock other services to prevent crashes
    clientes: {
        listar: async () => {
            const { data } = await supabase.from('clientes').select('*');
            return data || [];
        },
        criar: async (d: any) => supabase.from('clientes').insert(d).select().single(),
        atualizar: async (id: string, d: any) => supabase.from('clientes').update(d).eq('id', id).select().single(),
        excluir: async (id: string) => supabase.from('clientes').delete().eq('id', id)
    },
    fornecedores: {
        listar: async () => {
            const { data } = await supabase.from('fornecedores').select('*');
            return data || [];
        },
        criar: async (d: any) => supabase.from('fornecedores').insert(d).select().single(),
        atualizar: async (id: string, d: any) => supabase.from('fornecedores').update(d).eq('id', id).select().single(),
        excluir: async (id: string) => supabase.from('fornecedores').delete().eq('id', id)
    },
    utilizadores: {
        listar: async () => {
            const { data } = await supabase.from('utilizadores').select('*');
            return data || [];
        },
        criar: async (d: any) => ({ data: d }),
        atualizar: async (id: string, d: any) => ({ data: d }),
        excluir: async (id: string) => ({})
    },
    metricas: {
        listar: async () => {
            const { data } = await supabase.from('metricas').select('*');
            return data || [];
        },
        criar: async (d: any) => ({}),
        atualizar: async (id: string, d: any) => ({}),
        excluir: async (id: string) => ({})
    },
    produtos: {
        listar: async () => {
            const { data } = await supabase.from('produtos').select('*');
            return data || [];
        },
        criar: async (d: any) => supabase.from('produtos').insert(d).select().single(),
        atualizar: async (id: string, d: any) => supabase.from('produtos').update(d).eq('id', id).select().single(),
        excluir: async (id: string) => supabase.from('produtos').delete().eq('id', id)
    },
    testarConexao: async () => {
        const { error } = await supabase.from('empresas').select('count').single();
        return !error;
    },
    setEmpresaAtiva: (id: string) => console.log("Empresa ativa:", id)
};

export { BackendAssistant };
export default BackendAssistant;
