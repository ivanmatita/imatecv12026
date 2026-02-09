// @ts-nocheck
/**
 * EXEMPLO DE INTEGRAÇÃO - Backend Assistant
 * 
 * Este arquivo mostra como integrar o BackendAssistant nas páginas existentes
 * sem perder nenhuma funcionalidade.
 */

import React, { useState, useEffect } from 'react';
import BackendAssistant from '../services/BackendAssistant';

// ============================================
// EXEMPLO 1: INTEGRAÇÃO EM INVOICELIST
// ============================================

export const InvoiceListExample = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carregar faturas do Supabase
    const loadInvoices = async () => {
        setLoading(true);
        const result = await BackendAssistant.Invoice.fetchAll();

        if (result.success) {
            // Mapear dados do Supabase para o formato da aplicação
            const mappedInvoices = result.data.map((inv: any) => ({
                id: inv.id,
                number: inv.numero,
                type: inv.tipo,
                date: inv.data_emissao,
                clientName: inv.cliente_nome,
                clientNif: inv.cliente_nif,
                total: Number(inv.total),
                status: inv.status,
                certified: inv.certificado,
                items: typeof inv.itens === 'string' ? JSON.parse(inv.itens) : inv.itens,
                // ... outros campos conforme necessário
            }));

            setInvoices(mappedInvoices);
            console.log(`✅ ${mappedInvoices.length} faturas carregadas`);
        } else {
            console.error('❌ Erro ao carregar faturas:', result.error);
            alert(`Erro: ${result.error}`);
        }

        setLoading(false);
    };

    // Salvar fatura
    const saveInvoice = async (invoice: any) => {
        setLoading(true);

        const result = await BackendAssistant.Invoice.save({
            id: invoice.id,
            seriesId: invoice.seriesId,
            seriesCode: invoice.seriesCode,
            number: invoice.number,
            type: invoice.type,
            date: invoice.date,
            clientId: invoice.clientId,
            clientName: invoice.clientName,
            clientNif: invoice.clientNif,
            clientAddress: invoice.clientAddress,
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxAmount,
            total: invoice.total,
            status: invoice.status,
            items: invoice.items,
            // ... outros campos
        });

        if (result.success) {
            console.log('✅ Fatura salva:', result.data);
            await loadInvoices(); // Recarregar lista
            return true;
        } else {
            console.error('❌ Erro ao salvar:', result.error);
            alert(`Erro: ${result.error}`);
            return false;
        }
    };

    // Deletar fatura
    const deleteInvoice = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar esta fatura?')) return;

        const result = await BackendAssistant.Invoice.delete(id);

        if (result.success) {
            console.log('✅ Fatura deletada');
            await loadInvoices();
        } else {
            alert(`Erro: ${result.error}`);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    return (
        <div>
            {loading && <p>Carregando...</p>}
            {/* Renderizar lista de faturas */}
        </div>
    );
};

// ============================================
// EXEMPLO 2: INTEGRAÇÃO EM PURCHASEFORM
// ============================================

export const PurchaseFormExample = () => {
    const [formData, setFormData] = useState({
        supplierName: '',
        documentNumber: '',
        items: [],
        total: 0
    });

    const handleSubmit = async () => {
        const result = await BackendAssistant.Purchase.save({
            supplierName: formData.supplierName,
            documentNumber: formData.documentNumber,
            type: 'FT',
            date: new Date().toISOString().split('T')[0],
            subtotal: formData.total,
            total: formData.total,
            items: formData.items,
            status: 'PENDING'
        });

        if (result.success) {
            alert('✅ Compra registrada com sucesso!');
            // Limpar formulário ou redirecionar
        } else {
            alert(`❌ Erro: ${result.error}`);
        }
    };

    return (
        <div>
            {/* Formulário de compra */}
            <button onClick={handleSubmit}>Salvar Compra</button>
        </div>
    );
};

// ============================================
// EXEMPLO 3: INTEGRAÇÃO DE SÉRIES
// ============================================

export const SeriesManagerExample = () => {
    const [series, setSeries] = useState([]);

    const loadSeries = async () => {
        const result = await BackendAssistant.Series.fetchAll();
        if (result.success) {
            setSeries(result.data);
        }
    };

    const createSeries = async () => {
        const result = await BackendAssistant.Series.save({
            name: 'Série Principal',
            code: 'FT',
            type: 'NORMAL',
            year: 2026,
            currentSequence: 1,
            active: true
        });

        if (result.success) {
            alert('✅ Série criada!');
            loadSeries();
        }
    };

    const getNextNumber = async (seriesId: string) => {
        const result = await BackendAssistant.Series.getNextNumber(seriesId, 'FT');

        if (result.success) {
            console.log('Próximo número:', result.data.number);
            // Usar result.data.number no formulário de fatura
            return result.data.number;
        }
    };

    useEffect(() => {
        loadSeries();
    }, []);

    return <div>{/* UI de gerenciamento de séries */}</div>;
};

// ============================================
// EXEMPLO 4: INTEGRAÇÃO DE CAIXAS
// ============================================

export const CashRegisterExample = () => {
    const [cashRegisters, setCashRegisters] = useState([]);

    const loadCashRegisters = async () => {
        const result = await BackendAssistant.CashRegister.fetchAll();
        if (result.success) {
            const mapped = result.data.map((cr: any) => ({
                id: cr.id,
                name: cr.nome,
                balance: Number(cr.saldo_atual),
                // ... outros campos
            }));
            setCashRegisters(mapped);
        }
    };

    const registerPayment = async (invoiceId: string, amount: number, cashRegisterId: string) => {
        // 1. Registrar movimento
        const movResult = await BackendAssistant.CashRegister.registerMovement({
            cashRegisterId: cashRegisterId,
            type: 'ENTRY',
            amount: amount,
            description: `Pagamento Fatura ${invoiceId}`,
            paymentMethod: 'CASH',
            operatorName: 'Sistema',
            source: 'INVOICE'
        });

        if (!movResult.success) {
            alert(`Erro ao registrar movimento: ${movResult.error}`);
            return;
        }

        // 2. Atualizar saldo
        const currentCash = cashRegisters.find(cr => cr.id === cashRegisterId);
        if (currentCash) {
            const newBalance = currentCash.balance + amount;

            const balanceResult = await BackendAssistant.CashRegister.updateBalance(
                cashRegisterId,
                newBalance
            );

            if (balanceResult.success) {
                console.log('✅ Saldo atualizado:', newBalance);
                loadCashRegisters(); // Recarregar
            }
        }
    };

    useEffect(() => {
        loadCashRegisters();
    }, []);

    return <div>{/* UI de caixas */}</div>;
};

// ============================================
// EXEMPLO 5: INTEGRAÇÃO DE ARMAZÉNS
// ============================================

export const WarehouseExample = () => {
    const [warehouses, setWarehouses] = useState([]);

    const loadWarehouses = async () => {
        const result = await BackendAssistant.Warehouse.fetchAll();
        if (result.success) {
            const mapped = result.data.map((wh: any) => ({
                id: wh.id,
                name: wh.nome,
                code: wh.codigo,
                type: wh.tipo,
                active: wh.ativo,
                // ... outros campos
            }));
            setWarehouses(mapped);
        }
    };

    const createWarehouse = async () => {
        const result = await BackendAssistant.Warehouse.save({
            name: 'Armazém Central',
            code: 'ARM001',
            type: 'PRINCIPAL',
            address: 'Rua Principal, 123',
            manager: 'João Silva',
            active: true
        });

        if (result.success) {
            alert('✅ Armazém criado!');
            loadWarehouses();
        }
    };

    useEffect(() => {
        loadWarehouses();
    }, []);

    return <div>{/* UI de armazéns */}</div>;
};

// ============================================
// EXEMPLO 6: FLUXO COMPLETO DE VENDA
// ============================================

export const CompleteSaleFlowExample = async () => {
    // 1. Obter próximo número da série
    const seriesResult = await BackendAssistant.Series.getNextNumber('serie-id', 'FT');
    if (!seriesResult.success) {
        alert('Erro ao obter número da fatura');
        return;
    }

    const invoiceNumber = seriesResult.data.number;

    // 2. Criar fatura
    const invoiceResult = await BackendAssistant.Invoice.save({
        number: invoiceNumber,
        type: 'FT',
        date: new Date().toISOString().split('T')[0],
        clientName: 'Cliente Teste',
        clientNif: '123456789',
        subtotal: 10000,
        taxAmount: 1400,
        total: 11400,
        status: 'Pendente',
        items: [
            {
                productId: 'prod-1',
                productName: 'Produto A',
                quantity: 1,
                price: 10000,
                taxRate: 14
            }
        ]
    });

    if (!invoiceResult.success) {
        alert('Erro ao criar fatura');
        return;
    }

    console.log('✅ Fatura criada:', invoiceResult.data);

    // 3. Registrar pagamento no caixa
    const paymentResult = await BackendAssistant.CashRegister.registerMovement({
        cashRegisterId: 'caixa-id',
        type: 'ENTRY',
        amount: 11400,
        description: `Pagamento ${invoiceNumber}`,
        paymentMethod: 'CASH',
        operatorName: 'Sistema'
    });

    if (!paymentResult.success) {
        alert('Erro ao registrar pagamento');
        return;
    }

    // 4. Atualizar saldo do caixa
    await BackendAssistant.CashRegister.updateBalance('caixa-id', 11400);

    // 5. Atualizar status da fatura para "Pago"
    await BackendAssistant.Invoice.save({
        id: invoiceResult.data.id,
        status: 'Pago',
        paidAmount: 11400
    });

    console.log('✅ Venda completa registrada!');
};

// ============================================
// DICAS DE USO
// ============================================

/*
IMPORTANTE:

1. SEMPRE verificar result.success antes de usar result.data
2. SEMPRE tratar erros (result.error)
3. Recarregar listas após operações de save/delete
4. Usar loading states para melhor UX
5. Mapear dados do Supabase para o formato da aplicação

EXEMPLO DE TRATAMENTO DE ERRO:
```typescript
const result = await BackendAssistant.Invoice.save(data);

if (result.success) {
    // Sucesso
    console.log('Salvo:', result.data);
} else {
    // Erro
    console.error('Erro:', result.error);
    alert(`Erro: ${result.error}`);
}
```

MAPEAMENTO DE CAMPOS:
- Supabase usa snake_case (cliente_nome, data_emissao)
- Aplicação usa camelCase (clientName, date)
- BackendAssistant faz a conversão automaticamente
- Ao buscar dados, você precisa mapear de volta

PERFORMANCE:
- Use índices (já criados nas tabelas)
- Evite buscar todos os dados se não necessário
- Use filtros e paginação quando possível
*/
