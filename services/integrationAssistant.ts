/**
 * ASSISTENTE DE INTEGRAÇÃO - IMATEC V.2.0
 * Responsável por sincronização e integração entre módulos
 */

import { BackendAssistant } from './backendAssistant';
import { SecurityAssistant } from './securityAssistant';

export class IntegrationAssistant {
    /**
     * Sincroniza dados entre estado local e Supabase
     */
    static async sincronizarDados(modulo: 'clientes' | 'fornecedores' | 'vendas' | 'compras' | 'caixas' | 'series' | 'utilizadores' | 'metricas' | 'armazens' | 'produtos') {
        console.log(`🔄 Integração: Iniciando sincronização de ${modulo}...`);

        try {
            let dados: any[] = [];
            let mappedData: any[] = [];

            switch (modulo) {
                case 'clientes':
                    dados = await BackendAssistant.clientes.listar();
                    mappedData = Array.isArray(dados) ? dados.map(d => IntegrationAssistant.mapearCliente(d)) : [];
                    break;
                case 'fornecedores':
                    dados = await BackendAssistant.fornecedores.listar();
                    mappedData = Array.isArray(dados) ? dados.map(d => IntegrationAssistant.mapearFornecedor(d)) : [];
                    break;
                case 'vendas': // Faturas
                    const resVendas = await BackendAssistant.vendas.listar();
                    dados = resVendas.success ? (resVendas.data || []) : [];
                    mappedData = dados.map(d => IntegrationAssistant.mapearFatura(d));
                    break;
                case 'compras':
                    const resCompras = await BackendAssistant.compras.listar();
                    dados = resCompras.success ? (resCompras.data || []) : [];
                    mappedData = dados.map(d => IntegrationAssistant.mapearCompra(d));
                    break;
                case 'caixas':
                    const resCaixas = await BackendAssistant.caixas.listar();
                    dados = resCaixas.success ? (resCaixas.data || []) : [];
                    mappedData = dados.map(d => IntegrationAssistant.mapearCaixa(d));
                    break;
                case 'series':
                    const resSeries = await BackendAssistant.series.listar();
                    dados = resSeries.success ? (resSeries.data || []) : [];
                    mappedData = dados.map(d => IntegrationAssistant.mapearSerie(d));
                    break;
                case 'utilizadores':
                    dados = await BackendAssistant.utilizadores.listar();
                    mappedData = Array.isArray(dados) ? dados.map(d => IntegrationAssistant.mapearUtilizador(d)) : [];
                    break;
                case 'metricas':
                    dados = await BackendAssistant.metricas.listar();
                    mappedData = Array.isArray(dados) ? dados.map(d => IntegrationAssistant.mapearMetrica(d)) : [];
                    break;
                case 'armazens':
                    const resArmazens = await BackendAssistant.armazens.listar();
                    dados = resArmazens.success ? (resArmazens.data || []) : [];
                    mappedData = dados.map(d => IntegrationAssistant.mapearArmazem(d));
                    break;
                case 'produtos':
                    dados = await BackendAssistant.produtos.listar();
                    mappedData = Array.isArray(dados) ? dados.map(d => IntegrationAssistant.mapearProduto(d)) : [];
                    break;
            }

            console.log(`✅ Integração: ${mappedData.length} registros de ${modulo} sincronizados`);
            return mappedData;
        } catch (error: any) {
            console.error(`❌ Integração: Erro ao sincronizar ${modulo}:`, error.message);
            throw error;
        }
    }
    /**
     * Salva dados (criar ou atualizar) de forma genérica
     */
    static async salvarDados(modulo: 'clientes' | 'fornecedores' | 'vendas' | 'compras' | 'caixas' | 'series' | 'utilizadores' | 'metricas' | 'armazens' | 'produtos', dados: any) {
        try {
            const isUpdate = !!dados.id;
            let entidade: 'cliente' | 'fornecedor' | 'fatura' | null = null;

            // Map module to entity type for processarOperacao
            if (modulo === 'clientes') entidade = 'cliente';
            else if (modulo === 'fornecedores') entidade = 'fornecedor';
            else if (modulo === 'vendas') entidade = 'fatura';

            if (entidade) {
                // Use robust flow with validation
                return await this.processarOperacao(isUpdate ? 'atualizar' : 'criar', entidade, dados, dados.id);
            } else {
                // Direct BackendAssistant call for others (bypass validation for now)
                if (isUpdate) {
                    // @ts-ignore
                    return await BackendAssistant[modulo].atualizar(dados.id, dados);
                } else {
                    // @ts-ignore
                    return await BackendAssistant[modulo].criar(dados);
                }
            }
        } catch (error: any) {
            console.error(`Erro ao salvar ${modulo}:`, error);
            throw error;
        }
    }

    /**
     * Mapeia dados do Supabase para o formato da aplicação
     */
    static mapearCliente(clienteDB: any): any {
        return {
            id: clienteDB.id,
            name: clienteDB.nome || '',
            email: clienteDB.email || '',
            phone: clienteDB.telefone || '',
            vatNumber: clienteDB.nif || '',
            address: clienteDB.endereco || '',
            city: clienteDB.localidade || 'Luanda',
            country: clienteDB.pais || 'Angola',
            province: clienteDB.provincia || '',
            municipality: clienteDB.municipio || '',
            postalCode: clienteDB.codigo_postal || '',
            webPage: clienteDB.web_page || '',
            clientType: clienteDB.tipo_cliente || 'nao grupo nacional',
            iban: clienteDB.iban || '',
            isAccountShared: clienteDB.conta_partilhada || false,
            initialBalance: Number(clienteDB.saldo_inicial || 0),
            accountBalance: 0,
            transactions: []
        };
    }

    /**
     * Mapeia dados da aplicação para o formato do Supabase (Cliente)
     */
    static mapearClienteParaDB(cliente: any): any {
        return {
            nome: cliente.name,
            email: cliente.email || '',
            telefone: cliente.phone || '',
            nif: cliente.vatNumber,
            endereco: cliente.address || '',
            localidade: cliente.city || 'Luanda',
            provincia: cliente.province || '',
            municipio: cliente.municipality || '',
            codigo_postal: cliente.postalCode || '',
            pais: 'Angola',
            web_page: cliente.webPage || '',
            tipo_cliente: cliente.clientType || 'nao grupo nacional',
            iban: cliente.iban || '',
            conta_partilhada: cliente.isAccountShared || false,
            saldo_inicial: Number(cliente.initialBalance || 0)
        };
    }

    /**
     * Mapeia dados do Supabase para o formato da aplicação (Fornecedor)
     */
    static mapearFornecedor(fornecedorDB: any): any {
        return {
            id: fornecedorDB.id,
            name: fornecedorDB.nome,
            vatNumber: fornecedorDB.contribuinte,
            email: fornecedorDB.email || '',
            phone: fornecedorDB.telefone || '',
            address: fornecedorDB.morada || '',
            city: fornecedorDB.localidade || '',
            province: fornecedorDB.provincia || '',
            postalCode: fornecedorDB.codigo_postal || '',
            municipality: fornecedorDB.municipio || '',
            country: fornecedorDB.pais || 'Angola',
            webPage: fornecedorDB.web_page || '',
            inssNumber: fornecedorDB.num_inss || '',
            bankInitials: fornecedorDB.siglas_banco || '',
            iban: fornecedorDB.iban || '',
            swift: fornecedorDB.swift || '',
            supplierType: fornecedorDB.tipo_cliente || '',
            accountBalance: 0,
            transactions: []
        };
    }

    /**
     * Mapeia dados da aplicação para o formato do Supabase (Fornecedor)
     */
    static mapearFornecedorParaDB(fornecedor: any): any {
        return {
            contribuinte: fornecedor.vatNumber,
            nome: fornecedor.name,
            morada: fornecedor.address,
            localidade: fornecedor.city,
            codigo_postal: fornecedor.postalCode,
            provincia: fornecedor.province,
            municipio: fornecedor.municipality,
            pais: 'Angola',
            telefone: fornecedor.phone,
            email: fornecedor.email,
            web_page: fornecedor.webPage,
            num_inss: fornecedor.inssNumber,
            siglas_banco: fornecedor.bankInitials,
            iban: fornecedor.iban,
            swift: fornecedor.swift,
            tipo_cliente: fornecedor.supplierType
        };
    }

    /**
     * Mapeia dados do Supabase para o formato da aplicação (Fatura/Venda)
     */
    static mapearFatura(faturaDB: any): any {
        return {
            id: faturaDB.id,
            type: faturaDB.tipo,
            seriesId: faturaDB.series_id || '',
            seriesCode: faturaDB.series_code || '',
            number: faturaDB.numero,
            date: faturaDB.data,
            dueDate: faturaDB.data_vencimento,
            accountingDate: faturaDB.data_lancamento || faturaDB.data, // Fallback
            clientId: faturaDB.cliente_id,
            clientName: faturaDB.cliente_nome || 'Cliente', // Should ideally fetch or join
            items: faturaDB.items || [],
            subtotal: faturaDB.subtotal,
            globalDiscount: faturaDB.desconto || 0,
            taxRate: 0, // Calculated from items or stored? Default 0
            taxAmount: faturaDB.imposto,
            withholdingAmount: faturaDB.retencao_fonte || 0,
            retentionAmount: faturaDB.retencao_iva || 0,
            total: faturaDB.total,
            paidAmount: faturaDB.valor_pago || 0,
            currency: faturaDB.moeda || 'AOA',
            exchangeRate: faturaDB.taxa_cambio || 1,
            status: faturaDB.status, // Ensure enum match
            notes: faturaDB.observacoes,
            isCertified: faturaDB.certificado || false,
            hash: faturaDB.hash,
            companyId: faturaDB.empresa_id,
            workLocationId: faturaDB.work_location_id,
            paymentMethod: faturaDB.payment_method,
            cashRegisterId: faturaDB.cash_register_id,
            operatorName: faturaDB.operator_name,
            sourceInvoiceId: faturaDB.source_invoice_id,
            cancellationReason: faturaDB.cancellation_reason
        };
    }

    static mapearCompra(compraDB: any): any {
        return {
            id: compraDB.id,
            type: compraDB.tipo,
            supplierId: compraDB.fornecedor_id,
            supplier: compraDB.fornecedor_nome || '',
            nif: compraDB.nif || '',
            date: compraDB.data_emissao,
            dueDate: compraDB.data_vencimento,
            documentNumber: compraDB.numero,
            items: compraDB.items || [],
            subtotal: compraDB.subtotal,
            taxAmount: compraDB.imposto,
            total: compraDB.total,
            status: compraDB.status,
            notes: compraDB.observacoes,
            workLocationId: compraDB.work_location_id,
            warehouseId: compraDB.warehouse_id,
            paymentMethod: compraDB.payment_method
        };
    }

    static mapearCaixa(caixaDB: any): any {
        return {
            id: caixaDB.id,
            name: caixaDB.nome,
            status: caixaDB.status || 'CLOSED',
            balance: caixaDB.saldo_atual || 0,
            initialBalance: caixaDB.saldo_inicial || 0,
            operatorId: caixaDB.operator_id,
            notes: caixaDB.descricao
        };
    }

    static mapearSerie(serieDB: any): any {
        return {
            id: serieDB.id,
            name: serieDB.nome,
            code: serieDB.codigo,
            type: serieDB.tipo,
            year: serieDB.ano,
            currentSequence: serieDB.sequencia_atual,
            sequences: serieDB.sequencias || {},
            isActive: serieDB.ativa,
            allowedUserIds: serieDB.allowed_users || [],
            bankDetails: serieDB.bank_details,
            footerText: serieDB.footer_text,
            logo: serieDB.logo
        };
    }

    static mapearUtilizador(userDB: any): any {
        return {
            id: userDB.id,
            name: userDB.nome,
            email: userDB.email,
            role: userDB.cargo || 'OPERATOR', // Map DB role to App role if needed
            companyId: userDB.empresa_id,
            permissions: userDB.permissoes || [],
            createdAt: userDB.created_at,
            avatar: userDB.foto,
            workLocationId: userDB.work_location_id
        };
    }

    static mapearMetrica(metricaDB: any): any {
        return {
            id: metricaDB.id,
            nome: metricaDB.tipo, // Using type as name for now
            sigla: metricaDB.unidade || '' // Fallback
        };
    }

    static mapearArmazem(armazemDB: any): any {
        return {
            id: armazemDB.id,
            name: armazemDB.nome,
            location: armazemDB.localizacao || '',
            description: armazemDB.descricao,
            managerName: armazemDB.responsavel
        };
    }

    static mapearProduto(produtoDB: any): any {
        return {
            id: produtoDB.id,
            name: produtoDB.nome,
            costPrice: Number(produtoDB.preco_custo || 0),
            price: Number(produtoDB.preco_venda || 0),
            unit: produtoDB.unidade || 'un',
            category: produtoDB.categoria || 'Geral',
            stock: Number(produtoDB.stock_atual || 0),
            minStock: Number(produtoDB.stock_minimo || 0),
            barcode: produtoDB.codigo_barras,
            imageUrl: produtoDB.imagem,
            warehouseId: produtoDB.armazem_id,
            priceTableId: produtoDB.tabela_preco_id
        };
    }

    /**
     * Valida e prepara dados antes de enviar ao backend
     */
    static async prepararParaSalvar(tipo: 'cliente' | 'fornecedor' | 'fatura', dados: any): Promise<any> {
        let validacao: { valido: boolean; erros: string[] };

        switch (tipo) {
            case 'cliente':
                const clienteDB = this.mapearClienteParaDB(dados);
                validacao = SecurityAssistant.validarCliente(clienteDB);
                if (!validacao.valido) {
                    throw new Error(`Validação falhou: ${validacao.erros.join(', ')}`);
                }
                return clienteDB;

            case 'fornecedor':
                const fornecedorDB = this.mapearFornecedorParaDB(dados);
                validacao = SecurityAssistant.validarFornecedor(fornecedorDB);
                if (!validacao.valido) {
                    throw new Error(`Validação falhou: ${validacao.erros.join(', ')}`);
                }
                return fornecedorDB;

            case 'fatura':
                validacao = SecurityAssistant.validarFatura(dados);
                if (!validacao.valido) {
                    throw new Error(`Validação falhou: ${validacao.erros.join(', ')}`);
                }
                // TODO: Map Invoice -> DB using some mapearFaturaParaDB if strictly needed, 
                // but BackendAssistant.vendas.criar expects DB format, so we might need mapping here.
                // For now, assuming 'dados' is close to DB info or mapped before calling this.
                // NOTE: The validacao call above implies 'dados' is checked.
                return dados;

            default:
                throw new Error('Tipo de dados não suportado');
        }
    }

    /**
     * Processa operação completa com validação e auditoria
     */
    static async processarOperacao(
        tipo: 'criar' | 'atualizar' | 'excluir',
        entidade: 'cliente' | 'fornecedor' | 'fatura',
        dados: any,
        id?: string
    ): Promise<any> {
        try {
            console.log(`🔄 Integração: Processando ${tipo} de ${entidade}...`);

            // Registrar auditoria
            SecurityAssistant.registrarAuditoria(tipo, entidade, dados);

            let resultado: any;

            switch (entidade) {
                case 'cliente':
                    if (tipo === 'criar') {
                        const clienteDB = await this.prepararParaSalvar('cliente', dados);
                        resultado = await BackendAssistant.clientes.criar(clienteDB);
                    } else if (tipo === 'atualizar' && id) {
                        const clienteDB = await this.prepararParaSalvar('cliente', dados);
                        resultado = await BackendAssistant.clientes.atualizar(id, clienteDB);
                    } else if (tipo === 'excluir' && id) {
                        await BackendAssistant.clientes.excluir(id);
                        resultado = { sucesso: true };
                    }
                    break;

                case 'fornecedor':
                    if (tipo === 'criar') {
                        const fornecedorDB = await this.prepararParaSalvar('fornecedor', dados);
                        resultado = await BackendAssistant.fornecedores.criar(fornecedorDB);
                    } else if (tipo === 'atualizar' && id) {
                        const fornecedorDB = await this.prepararParaSalvar('fornecedor', dados);
                        resultado = await BackendAssistant.fornecedores.atualizar(id, fornecedorDB);
                    } else if (tipo === 'excluir' && id) {
                        await BackendAssistant.fornecedores.excluir(id);
                        resultado = { sucesso: true };
                    }
                    break;

                case 'fatura':
                    if (tipo === 'criar') {
                        const faturaDB = await this.prepararParaSalvar('fatura', dados);
                        resultado = await BackendAssistant.vendas.criar(faturaDB);
                    } else if (tipo === 'atualizar' && id) {
                        const faturaDB = await this.prepararParaSalvar('fatura', dados);
                        resultado = await BackendAssistant.vendas.atualizar(id, faturaDB);
                    } else if (tipo === 'excluir' && id) {
                        await BackendAssistant.vendas.excluir(id);
                        resultado = { sucesso: true };
                    }
                    break;
            }

            console.log(`✅ Integração: ${tipo} de ${entidade} concluído com sucesso`);
            return resultado;
        } catch (error: any) {
            console.error(`❌ Integração: Erro ao processar ${tipo} de ${entidade}:`, error.message);
            throw error;
        }
    }

    /**
     * Inicializa todos os assistentes
     */
    static async inicializar(): Promise<void> {
        console.log('🚀 Integração: Inicializando assistentes do sistema...');

        try {
            // Testar conexão
            const conectado = await BackendAssistant.testarConexao();
            if (!conectado) {
                throw new Error('Falha na conexão com o banco de dados');
            }

            // Carregar empresa ativa
            const { data: empresas } = await (await import('./supabaseClient')).supabase
                .from('empresas')
                .select('id')
                .limit(1);

            if (empresas && empresas.length > 0) {
                BackendAssistant.setEmpresaAtiva(empresas[0].id);
            }

            console.log('✅ Integração: Todos os assistentes inicializados com sucesso!');
        } catch (error: any) {
            console.error('❌ Integração: Erro ao inicializar assistentes:', error.message);
            throw error;
        }
    }
}

export default IntegrationAssistant;
