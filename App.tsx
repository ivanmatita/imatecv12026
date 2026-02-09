import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import { supabase } from './services/supabaseClient';
import LandingPage from './components/LandingPage';
import PurchaseList from './components/PurchaseList';
import PurchaseForm from './components/PurchaseForm';
import ClientList from './components/ClientList';
import SupplierList from './components/SupplierList';
import Settings from './components/Settings';
import StockManager from './components/StockManager';
import TaxManager from './components/TaxManager';
import CostRevenueMap from './components/CostRevenueMap';
import RegularizationMap from './components/RegularizationMap';
import Model7 from './components/Model7';
import CashManager from './components/CashManager';
import HumanResources from './components/HumanResources';
import ScreenshotButton from './components/ScreenshotButton';
import Workspace from './components/Workspace';
import SaftExport from './components/SaftExport';
import ManagementReports from './components/ManagementReports';
import Agribusiness from './components/Agribusiness';
import ChurchManagement from './components/ChurchManagement';
import AttendanceMapPage from './components/AttendanceMapPage';
import IRTTable from './components/IRTTable';
import ContractManagement from './components/ContractManagement';
import PersonalRegistration from './components/PersonalRegistration';
import HRMaps from './components/HRMaps';
import EmployeeListPage from './components/EmployeeListPage';
import WorkCard from './components/WorkCard';
import FileManager from './components/FileManager';
import LaborRegistration from './components/LaborRegistration';
import IRTTableManager from './components/IRTTableManager';

import {
    Invoice, InvoiceStatus, ViewState, Client, Product, InvoiceType,
    Warehouse, PriceTable, StockMovement, Purchase, Company, User,
    Employee, SalarySlip, HrTransaction, WorkLocation, CashRegister, DocumentSeries,
    Supplier, PaymentMethod, CashMovement, HrVacation, Profession, Contract, AttendanceRecord
} from './types';
import {
    Menu
} from 'lucide-react';
import { IntegrationAssistant } from './services';
import { generateId, generateInvoiceHash } from './utils';

// --- MOCK DATA ---
const MOCK_COMPANY: Company = {
    id: 'comp1', name: 'C & V - COMERCIO GERAL E PRESTAÇAO DE SERVIÇOS, LDA', nif: '5000780316',
    address: 'Luanda, Angola', email: 'geral@empresa.ao', phone: '+244 923 000 000',
    // Fix: Type '"Geral"' corrected to '"Regime Geral"' to match expected union type.
    regime: 'Regime Geral',
    licensePlan: 'ENTERPRISE', status: 'ACTIVE', validUntil: '2025-12-31', registrationDate: '2024-01-01'
};

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin', email: 'admin@sistema.ao', password: '123', role: 'ADMIN', companyId: 'comp1', permissions: [], createdAt: '2024-01-01' },
    { id: 'u2', name: 'João Operador', email: 'joao@sistema.ao', password: '123', role: 'OPERATOR', companyId: 'comp1', permissions: ['DASHBOARD', 'INVOICES', 'CREATE_INVOICE', 'POS'], createdAt: '2024-02-01' }
];

const MOCK_CLIENTS: Client[] = [
    // Fixed: Added mandatory initialBalance property to mock clients
    { id: '1', name: 'Angola Telecom', email: 'billing@angolatelecom.ao', vatNumber: '500123456', address: 'Rua Principal, 123', city: 'Luanda', country: 'Angola', phone: '+244 923 111 222', accountBalance: 250000, initialBalance: 0, clientType: 'Empresa Nacional', province: 'Luanda', transactions: [] },
    { id: '2', name: 'Tech Solutions Lda', email: 'contact@techsol.ao', vatNumber: '500987654', address: 'Av. Liberdade, 45', city: 'Benguela', country: 'Angola', phone: '+244 923 333 444', accountBalance: 1299600, initialBalance: 0, clientType: 'Empresa Nacional', province: 'Benguela', transactions: [] },
    { id: '3', name: 'Padaria Central', email: 'geral@padariacentral.ao', vatNumber: '500555444', address: 'Rua do Comércio', city: 'Lobito', country: 'Angola', phone: '+244 923 555 666', accountBalance: 0, initialBalance: 0, clientType: 'Empresa Nacional', province: 'Benguela', transactions: [] },
];

const MOCK_SUPPLIERS: Supplier[] = [
    // Fix: Added missing mandatory 'country' property to mock supplier
    { id: 's1', name: 'Fornecedor A', vatNumber: '500999888', email: 'compras@fornecedora.ao', phone: '923000111', address: 'Viana', city: 'Luanda', province: 'Luanda', country: 'Angola', accountBalance: 0, supplierType: 'Nacional', transactions: [] }
];

const MOCK_WAREHOUSES: Warehouse[] = [
    { id: 'wh1', name: 'Armazém Central', location: 'Viana, Luanda' },
    { id: 'wh2', name: 'Loja Benfica', location: 'Benfica, Luanda' }
];

const MOCK_PRICE_TABLES: PriceTable[] = [
    { id: 'pt1', name: 'PVP Geral', percentage: 30 },
    { id: 'pt2', name: 'Revenda', percentage: 15 },
    { id: 'pt3', name: 'VIP', percentage: 10 },
];

const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Computador HP i7', costPrice: 200000, price: 280000, unit: 'un', category: 'Informatica', stock: 15, warehouseId: 'wh1', priceTableId: 'pt1', minStock: 5 },
    { id: 'p2', name: 'Impressora Epson', costPrice: 80000, price: 120000, unit: 'un', category: 'Informatica', stock: 8, warehouseId: 'wh1', priceTableId: 'pt1', minStock: 2 },
    { id: 'p3', name: 'Café Grão 1kg', costPrice: 4000, price: 6500, unit: 'kg', category: 'Alimentar', stock: 50, warehouseId: 'wh2', priceTableId: 'pt1', minStock: 10 },
    { id: 'p4', name: 'Hambúrguer Simples', costPrice: 1500, price: 3500, unit: 'un', category: 'Restaurante', stock: 100, warehouseId: 'wh2', priceTableId: 'pt1', minStock: 20 },
    { id: 'p5', name: 'Sumo Natural', costPrice: 500, price: 1500, unit: 'un', category: 'Restaurante', stock: 200, warehouseId: 'wh2', priceTableId: 'pt1', minStock: 20 },
];

const MOCK_SERIES: DocumentSeries[] = [
    { id: 's1', name: 'Série Geral 2024', code: 'A', type: 'NORMAL', year: 2024, currentSequence: 120, sequences: {}, isActive: true, allowedUserIds: [], bankDetails: 'BFA: AO06 0001 0000 \nBAI: AO06 0040 0000', footerText: 'Processado por imatec soft' },
    { id: 's2', name: 'Recuperação 2023', code: 'REC', type: 'MANUAL', year: 2023, currentSequence: 50, sequences: {}, isActive: true, allowedUserIds: [], bankDetails: 'BFA: AO06 0001 0000', footerText: 'Documento Manual Recuperado' },
];

const MOCK_INVOICES: Invoice[] = [
    {
        /* Fix: Added mandatory accountingDate to mock invoice */
        id: 'inv1', number: 'FT A 2024/1', type: InvoiceType.FT, date: '2024-05-01', dueDate: '2024-05-15', accountingDate: '2024-05-01', clientId: '1', clientName: 'Angola Telecom',
        items: [{ id: 'i1', type: 'SERVICE', description: 'Consultoria', quantity: 10, unitPrice: 25000, discount: 0, taxRate: 14, total: 250000 }],
        subtotal: 250000, globalDiscount: 0, taxRate: 14, taxAmount: 35000, withholdingAmount: 16250, total: 268750, status: InvoiceStatus.PAID, paidAmount: 268750,
        currency: 'AOA', exchangeRate: 1, contraValue: 268750,
        companyId: 'comp1', isCertified: true, hash: 'X8jK', workLocationId: 'wl1', seriesId: 's1', seriesCode: 'A'
    },
];

const MOCK_WORK_LOCATIONS: WorkLocation[] = [
    { id: 'wl1', name: 'Sede Principal', address: 'Luanda, Centro', managerName: 'Admin' },
    { id: 'wl2', name: 'Filial Viana', address: 'Viana, Luanda', managerName: 'João' }
];

const MOCK_CASH_REGISTERS: CashRegister[] = [
    { id: 'cr1', name: 'Caixa Principal', status: 'OPEN', balance: 50000, initialBalance: 0 }
];

const SupplierManagementView: React.FC<{ suppliers: Supplier[], onSaveSupplier: (s: Supplier) => void }> = ({ suppliers, onSaveSupplier }) => {
    return (
        <SupplierList
            suppliers={suppliers}
            onSaveSupplier={onSaveSupplier}
        />
    );
}

const PurchaseAnalysisView: React.FC<{ purchases: Purchase[] }> = ({ purchases }) => {
    return <PurchaseList purchases={purchases} onDelete={() => { }} onCreateNew={() => { }} onUpload={() => { }} onSaveSupplier={() => { }} />;
};

// --- APP COMPONENT ---

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentUser, setCurrentUser] = useState<User>({
        id: 'u-001',
        name: 'Administrador Imatec',
        email: 'admin@imatec.ao',
        role: 'ADMIN',
        companyId: '00000000-0000-0000-0000-000000000001',
        permissions: ['DASHBOARD', 'INVOICES', 'CLIENTS', 'SUPPLIERS', 'PURCHASES', 'STOCK', 'FINANCE_GROUP', 'SETTINGS', 'HR']
    });

    const [isSidebarWhite, setIsSidebarWhite] = useState(true);

    const handleLogin = (userData: any) => {
        setIsLoggedIn(true);
        if (userData) {
            setCurrentUser(prev => ({ ...prev, ...userData }));
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser({
            id: '',
            name: '',
            email: '',
            role: 'USER',
            companyId: '',
            permissions: []
        });
    };

    // Data State
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
    const [priceTables, setPriceTables] = useState<PriceTable[]>(MOCK_PRICE_TABLES);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [workLocations, setWorkLocations] = useState<WorkLocation[]>(MOCK_WORK_LOCATIONS);
    const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(MOCK_CASH_REGISTERS);
    const [series, setSeries] = useState<DocumentSeries[]>(MOCK_SERIES);

    // HR & Cash State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [hrTransactions, setHrTransactions] = useState<HrTransaction[]>([]);
    const [hrVacations, setHrVacations] = useState<HrVacation[]>([]);
    const [payrollHistory, setPayrollHistory] = useState<SalarySlip[]>([]);
    const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    // Invoice Form State
    const [invoiceInitialType, setInvoiceInitialType] = useState<InvoiceType>(InvoiceType.FT);
    const [invoiceInitialData, setInvoiceInitialData] = useState<Partial<Invoice> | undefined>(undefined);

    // Selection State
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    // --- INITIAL DATA LOADING ---
    useEffect(() => {
        const loadSystemData = async () => {
            try {
                console.log('🚀 App: Initializing connection...');
                await IntegrationAssistant.inicializar();

                console.log('🔄 App: Fetching data from Supabase...');
                const [
                    fetchedClients,
                    fetchedSuppliers,
                    fetchedInvoices,
                    fetchedPurchases,
                    fetchedWarehouses,
                    fetchedSeries,
                    fetchedUsers,
                    fetchedCashRegisters,
                    fetchedProducts
                ] = await Promise.all([
                    IntegrationAssistant.sincronizarDados('clientes'),
                    IntegrationAssistant.sincronizarDados('fornecedores'),
                    IntegrationAssistant.sincronizarDados('vendas'),
                    IntegrationAssistant.sincronizarDados('compras'),
                    IntegrationAssistant.sincronizarDados('armazens'),
                    IntegrationAssistant.sincronizarDados('series'),
                    IntegrationAssistant.sincronizarDados('utilizadores'),
                    IntegrationAssistant.sincronizarDados('caixas'),
                    IntegrationAssistant.sincronizarDados('produtos'),
                    IntegrationAssistant.sincronizarDados('metricas')
                ]);

                // Only override mocks if data is found or connection is definitely successful and we want to show "empty" state.
                // For now, let's override if we get an array (even empty) to prove connection works.
                // BUT if DB is empty, user sees nothing. Maybe keep mocks if DB is empty?
                // User asked to "implement functionalities without erasing existing ones".
                // If I replace Mocks with empty DB, they lose their demo data.
                // I'll check length.

                if (fetchedClients) setClients(fetchedClients.length > 0 ? fetchedClients : MOCK_CLIENTS);
                if (fetchedSuppliers) setSuppliers(fetchedSuppliers.length > 0 ? fetchedSuppliers : MOCK_SUPPLIERS);
                if (fetchedInvoices) setInvoices(fetchedInvoices);
                if (fetchedPurchases) setPurchases(fetchedPurchases);
                if (fetchedWarehouses) setWarehouses(fetchedWarehouses.length > 0 ? fetchedWarehouses : MOCK_WAREHOUSES);
                if (fetchedSeries) setSeries(fetchedSeries.length > 0 ? fetchedSeries : MOCK_SERIES);
                if (fetchedUsers) setUsers(fetchedUsers.length > 0 ? fetchedUsers : MOCK_USERS);
                if (fetchedCashRegisters) setCashRegisters(fetchedCashRegisters.length > 0 ? fetchedCashRegisters : MOCK_CASH_REGISTERS);
                if (fetchedProducts) setProducts(fetchedProducts.length > 0 ? fetchedProducts : MOCK_PRODUCTS);

                console.log('✅ App: Supabase data loaded.');
            } catch (error) {
                console.error('❌ App: Error loading data (falling back to mocks):', error);
            }
        };

        loadSystemData();
    }, []);

    // --- FILTERED DATA FOR ANALYTICS (CERTIFIED ONLY) ---
    const certifiedInvoices = useMemo(() => invoices.filter(i => i.isCertified), [invoices]);
    const certifiedPurchases = useMemo(() => purchases.filter(p => p.status !== 'PENDING'), [purchases]); // Assuming non-pending purchases are valid/certified

    const handleCreateInvoice = (type: InvoiceType = InvoiceType.FT, initialItems: any[] = [], notes: string = '') => {
        setInvoiceInitialType(type);
        setInvoiceInitialData(initialItems.length > 0 ? { items: initialItems, notes } : undefined);
        setCurrentView('CREATE_INVOICE');
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setInvoiceInitialType(invoice.type);
        setInvoiceInitialData(invoice);
        setCurrentView('CREATE_INVOICE');
    };

    const handleViewClientAccount = (clientId: string) => {
        setSelectedClientId(clientId);
        setCurrentView('CLIENTS');
    };

    const handleSaveInvoice = async (invoice: Invoice, seriesId: string, action?: 'PRINT' | 'CERTIFY') => {
        let finalInvoice = { ...invoice };
        const docSeries = series.find(s => s.id === seriesId);

        // LOGIC: Generate Number & Hash ONLY on Certification
        if (action === 'CERTIFY' && !finalInvoice.isCertified) {
            if (docSeries) {
                try {
                    // Fetch next number atomically from DB
                    const nextNumRes = await import('./services/backendAssistant').then(m => m.BackendAssistant.series.proximoNumero(seriesId, finalInvoice.type));

                    if (nextNumRes.success && nextNumRes.data) {
                        finalInvoice.number = nextNumRes.data.number;
                        // Update local series state
                        setSeries(prev => prev.map(s => s.id === seriesId ? {
                            ...s,
                            sequences: { ...s.sequences, [finalInvoice.type]: nextNumRes.data.sequence }
                        } : s));
                    } else {
                        throw new Error(nextNumRes.error || "Falha ao gerar sequência");
                    }

                    finalInvoice.isCertified = true;
                    finalInvoice.hash = generateInvoiceHash(finalInvoice);
                } catch (e: any) {
                    alert("Erro ao certificar documento: " + e.message);
                    return;
                }
            } else {
                alert("Série não encontrada!");
                return;
            }
        } else if (!finalInvoice.id || !finalInvoice.number) {
            // New Draft
            if (!finalInvoice.number) finalInvoice.number = 'RASCUNHO';
        }

        finalInvoice.seriesCode = docSeries?.code;

        // --- SUPABSE INTEGRATION: SAVE INVOICE ---
        try {
            await IntegrationAssistant.salvarDados('vendas', finalInvoice);
        } catch (err) {
            console.error("Erro ao salvar venda:", err);
            alert("Erro ao salvar documento na nuvem.");
        }
        // ---------------------------------------------------------

        const existingIndex = invoices.findIndex(i => i.id === finalInvoice.id);
        if (existingIndex >= 0) {
            const newInvoices = [...invoices];
            newInvoices[existingIndex] = finalInvoice;
            setInvoices(newInvoices);
        } else {
            setInvoices([finalInvoice, ...invoices]);
        }

        // ONLY if Certified, trigger Movements
        if (finalInvoice.isCertified) {
            const clientIndex = clients.findIndex(c => c.id === finalInvoice.clientId);
            if (clientIndex >= 0) {
                const client = clients[clientIndex];
                const amount = finalInvoice.currency === 'AOA' ? finalInvoice.total : finalInvoice.contraValue || finalInvoice.total;
                let newBalance = client.accountBalance;
                const newTransactions = [...(client.transactions || [])];

                if (finalInvoice.type === InvoiceType.FT || finalInvoice.type === InvoiceType.VD || finalInvoice.type === InvoiceType.ND) {
                    newBalance += amount;
                    newTransactions.push({ id: generateId(), date: finalInvoice.date, type: 'DEBIT', description: `Emissão ${finalInvoice.type}`, documentNumber: finalInvoice.number, amount });
                } else if (finalInvoice.type === InvoiceType.NC || finalInvoice.type === InvoiceType.RG) {
                    newBalance -= amount;
                    newTransactions.push({ id: generateId(), date: finalInvoice.date, type: 'CREDIT', description: `Emissão ${finalInvoice.type}`, documentNumber: finalInvoice.number, amount });
                } else if (finalInvoice.type === InvoiceType.FR) {
                    newTransactions.push({ id: generateId(), date: finalInvoice.date, type: 'DEBIT', description: `Emissão ${finalInvoice.type}`, documentNumber: finalInvoice.number, amount });
                    newTransactions.push({ id: generateId(), date: finalInvoice.date, type: 'CREDIT', description: `Pagamento Imediato ${finalInvoice.type}`, documentNumber: finalInvoice.number, amount });
                }

                const updatedClients = [...clients];
                updatedClients[clientIndex] = { ...client, accountBalance: newBalance, transactions: newTransactions };
                setClients(updatedClients);
            }

            if (finalInvoice.cashRegisterId && finalInvoice.paymentMethod) {
                if (finalInvoice.type === InvoiceType.FR || finalInvoice.type === InvoiceType.RG || finalInvoice.type === InvoiceType.VD) {
                    const amount = finalInvoice.currency === 'AOA' ? finalInvoice.total : finalInvoice.contraValue || finalInvoice.total;
                    setCashRegisters(prev => prev.map(cr => cr.id === finalInvoice.cashRegisterId ? { ...cr, balance: cr.balance + amount } : cr));
                }
            }

            // Stock update logic usually runs on certification too
            if (finalInvoice.type !== InvoiceType.PP && finalInvoice.type !== InvoiceType.OR) {
                finalInvoice.items.forEach(item => {
                    if (item.type === 'PRODUCT' && item.productId) {
                        const productIndex = products.findIndex(p => p.id === item.productId);
                        if (productIndex >= 0) {
                            const newProducts = [...products];
                            if (finalInvoice.type === InvoiceType.NC) {
                                newProducts[productIndex].stock += item.quantity;
                            } else {
                                newProducts[productIndex].stock -= item.quantity;
                            }
                            setProducts(newProducts);
                            setStockMovements(prev => [...prev, {
                                id: generateId(), date: new Date().toISOString(), type: finalInvoice.type === InvoiceType.NC ? 'ENTRY' : 'EXIT',
                                productId: item.productId!, productName: item.description, quantity: item.quantity,
                                warehouseId: products[productIndex].warehouseId, documentRef: finalInvoice.number, notes: `Via ${finalInvoice.type}`
                            }]);
                        }
                    }
                });
            }
        }

        setCurrentView('INVOICES');
    };

    const handleLiquidate = (invoice: Invoice, amount: number, method: PaymentMethod, registerId: string) => {
        const seriesRec = series.find(s => s.code === 'REC') || series[0];
        const number = `RG ${seriesRec.year}/${seriesRec.currentSequence + 1}`;

        /* Fix: Added mandatory accountingDate to the receipt invoice object */
        const receipt: Invoice = {
            id: generateId(),
            type: InvoiceType.RG,
            seriesId: seriesRec.id,
            number,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            accountingDate: new Date().toISOString().split('T')[0],
            clientId: invoice.clientId,
            clientName: invoice.clientName,
            clientNif: invoice.clientNif,
            items: [{ id: generateId(), type: 'SERVICE', description: `Pagamento Ref: ${invoice.number}`, quantity: 1, unitPrice: amount, discount: 0, taxRate: 0, total: amount }],
            subtotal: amount, globalDiscount: 0, taxRate: 0, taxAmount: 0, withholdingAmount: 0, retentionAmount: 0, total: amount,
            currency: invoice.currency, exchangeRate: invoice.exchangeRate,
            status: InvoiceStatus.PAID,
            isCertified: true,
            hash: generateInvoiceHash(invoice),
            companyId: invoice.companyId,
            workLocationId: invoice.workLocationId,
            sourceInvoiceId: invoice.id,
            paymentMethod: method,
            cashRegisterId: registerId
        };

        const updatedInvoice = {
            ...invoice,
            paidAmount: (invoice.paidAmount || 0) + amount,
            status: ((invoice.paidAmount || 0) + amount) >= invoice.total ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL
        };
        setInvoices(invoices.map(i => i.id === invoice.id ? updatedInvoice : i).concat(receipt));

        // Trigger Movements directly since RG is created Certified
        const clientIndex = clients.findIndex(c => c.id === invoice.clientId);
        if (clientIndex >= 0) {
            const client = clients[clientIndex];
            const newTransactions = [...(client.transactions || [])];
            newTransactions.push({ id: generateId(), date: receipt.date, type: 'CREDIT', description: `Pagamento RG ${receipt.number}`, documentNumber: receipt.number, amount: amount });
            const updatedClients = [...clients];
            updatedClients[clientIndex] = { ...client, accountBalance: client.accountBalance - amount, transactions: newTransactions };
            setClients(updatedClients);
        }
        setCashRegisters(prev => prev.map(cr => cr.id === registerId ? { ...cr, balance: cr.balance + amount } : cr));
    };

    const handleCreateDerived = (source: Invoice, type: InvoiceType) => {
        setInvoiceInitialType(type);
        setInvoiceInitialData({
            clientId: source.clientId,
            items: source.items.map(i => ({ ...i, id: generateId() })),
            sourceInvoiceId: source.id,
            currency: source.currency,
            exchangeRate: source.exchangeRate
        });
        setCurrentView('CREATE_INVOICE');
    }

    const handleCancelInvoice = async (id: string, reason: string) => {
        const original = invoices.find(i => i.id === id);
        if (!original) return;

        // 1. Cancel Original
        const updatedOriginal = { ...original, status: InvoiceStatus.CANCELLED, cancellationReason: reason };

        // 2. Auto-Generate NC
        let newNC: Invoice | null = null;
        let updatedSeries = [...series];

        if (original.isCertified && original.type !== InvoiceType.NC) {
            const seriesId = original.seriesId;
            const docSeries = series.find(s => s.id === seriesId);

            if (docSeries) {
                try {
                    // Get Sequential Number for NC
                    const nextNumRes = await import('./services/backendAssistant').then(m => m.BackendAssistant.series.proximoNumero(seriesId, InvoiceType.NC));

                    if (nextNumRes.success && nextNumRes.data) {
                        const number = nextNumRes.data.number;

                        newNC = {
                            ...original,
                            id: generateId(),
                            type: InvoiceType.NC,
                            number,
                            date: new Date().toISOString().split('T')[0],
                            time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                            status: InvoiceStatus.PAID, // NC is final
                            sourceInvoiceId: original.id,
                            notes: `Estorno referente a anulação do documento ${original.number}. Motivo: ${reason}`,
                            hash: generateInvoiceHash({ ...original, uniqueId: generateId() }), // Simplistic hash generation
                            createdAt: new Date().toISOString()
                        };

                        // Update series locally
                        updatedSeries = series.map(s => s.id === seriesId ? {
                            ...s,
                            sequences: { ...s.sequences, [InvoiceType.NC]: nextNumRes.data.sequence }
                        } : s);
                    }
                } catch (e) {
                    console.error("Erro ao gerar NC:", e);
                    alert("Erro ao gerar nota de crédito. Verifique a conexão.");
                    return;
                }
            }
        }

        // Update Local State
        const newInvoicesList = invoices.map(i => i.id === id ? updatedOriginal : i);
        if (newNC) newInvoicesList.unshift(newNC);
        setInvoices(newInvoicesList);
        setSeries(updatedSeries);

        // Save to Supabase
        try {
            await IntegrationAssistant.salvarDados('vendas', updatedOriginal);
            if (newNC) {
                await IntegrationAssistant.salvarDados('vendas', newNC);
                const s = series.find(s => s.id === original.seriesId);
                if (s) await IntegrationAssistant.salvarDados('series', { ...s, currentSequence: s.currentSequence + 1 });
            }
            alert("Documento anulado e Nota de Crédito gerada com sucesso.");
        } catch (error) {
            console.error("Erro ao salvar anulação no Supabase:", error);
            alert("Erro ao salvar alterações na nuvem.");
        }
    };

    const handleSavePurchase = (purchase: Purchase) => {
        setPurchases([...purchases, purchase]);
        // Stock updates happen here for simplicity (Mock), real app would use strict warehouse entry docs
        purchase.items.forEach(item => {
            if (item.productId) {
                const productIndex = products.findIndex(p => p.id === item.productId);
                if (productIndex >= 0) {
                    const newProducts = [...products];
                    newProducts[productIndex].stock += item.quantity;
                    setProducts(newProducts);
                }
            }
        });
        setCurrentView('PURCHASES');
    };

    const renderView = () => {
        switch (currentView) {
            case 'DASHBOARD':
                return <Dashboard invoices={certifiedInvoices} />;
            case 'WORKSPACE':
                // Workspace should usually see all active things but emphasize certified
                return <Workspace invoices={certifiedInvoices} purchases={certifiedPurchases} onViewInvoice={(inv) => handleEditInvoice(inv)} />;
            case 'INVOICES':
                return <InvoiceList
                    invoices={invoices}
                    onDelete={(id) => setInvoices(invoices.filter(i => i.id !== id))}
                    onUpdate={handleEditInvoice}
                    onLiquidate={handleLiquidate}
                    onCancelInvoice={handleCancelInvoice}
                    onCertify={(inv) => handleSaveInvoice(inv, inv.seriesId, 'CERTIFY')}
                    onCreateNew={() => handleCreateInvoice()}
                    onCreateDerived={handleCreateDerived}
                    onUpload={(id, file) => { const url = URL.createObjectURL(file); setInvoices(invoices.map(i => i.id === id ? { ...i, attachment: url } : i)); }}
                    onViewReports={() => setCurrentView('FINANCE_REPORTS')}
                    onQuickUpdate={(id, updates) => setInvoices(invoices.map(i => i.id === id ? { ...i, ...updates } : i))}
                    onViewClientAccount={handleViewClientAccount}
                    currentCompany={MOCK_COMPANY}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    series={series}
                />;
            case 'CREATE_INVOICE':
                return <InvoiceForm
                    onSave={handleSaveInvoice}
                    onCancel={() => setCurrentView('INVOICES')}
                    onViewList={() => setCurrentView('INVOICES')}
                    onAddWorkLocation={() => setCurrentView('SETTINGS')}
                    onSaveClient={(c) => setClients([...clients, c])}
                    onSaveWorkLocation={(wl) => setWorkLocations([...workLocations, wl])}
                    clients={clients}
                    products={products}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    series={series}
                    warehouses={warehouses}
                    initialType={invoiceInitialType}
                    initialData={invoiceInitialData}
                    currentUser={currentUser.name}
                    currentUserId={currentUser.id}
                />;
            case 'PURCHASES':
                return <PurchaseList
                    purchases={purchases}
                    onDelete={(id) => setPurchases(purchases.filter(p => p.id !== id))}
                    onCreateNew={() => setCurrentView('CREATE_PURCHASE')}
                    onUpload={(id, file) => { const url = URL.createObjectURL(file); setPurchases(purchases.map(p => p.id === id ? { ...p, attachment: url } : p)); }}
                    onSaveSupplier={(s) => setSuppliers([...suppliers, s])}
                />;
            case 'CREATE_PURCHASE':
                return <PurchaseForm
                    onSave={handleSavePurchase}
                    onCancel={() => setCurrentView('PURCHASES')}
                    products={products}
                    suppliers={suppliers}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    warehouses={warehouses}
                    onSaveSupplier={(s) => setSuppliers([...suppliers, s])}
                />;
            case 'CLIENTS':
                return <ClientList
                    clients={clients}
                    onSaveClient={(c) => setClients([...clients, c])}
                    initialSelectedClientId={selectedClientId}
                    onClearSelection={() => setSelectedClientId(null)}
                />;
            case 'SUPPLIERS':
                return <SupplierManagementView suppliers={suppliers} onSaveSupplier={(s) => setSuppliers([...suppliers, s])} />;
            case 'PURCHASE_ANALYSIS':
                return <PurchaseAnalysisView purchases={purchases} />;
            case 'STOCK':
                return <StockManager
                    products={products}
                    setProducts={setProducts}
                    warehouses={warehouses}
                    setWarehouses={setWarehouses}
                    priceTables={priceTables}
                    setPriceTables={setPriceTables}
                    movements={stockMovements}
                    onStockMovement={(m) => setStockMovements([...stockMovements, m])}
                    onCreateDocument={handleCreateInvoice}
                    onOpenReportOverlay={() => alert("Report Overlay")}
                />;
            case 'SETTINGS':
                return <Settings
                    series={series}
                    onSaveSeries={(s) => setSeries([...series, s])}
                    onEditSeries={(s) => setSeries(series.map(ser => ser.id === s.id ? s : ser))}
                    users={users}
                    onSaveUser={(u) => setUsers([...users.filter(x => x.id !== u.id), u])}
                    onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
                    workLocations={workLocations}
                    onSaveWorkLocation={(wl) => setWorkLocations([...workLocations, wl])}
                    onDeleteWorkLocation={(id) => setWorkLocations(workLocations.filter(w => w.id !== id))}
                    cashRegisters={cashRegisters}
                    onSaveCashRegister={(cr) => setCashRegisters([...cashRegisters.filter(x => x.id !== cr.id), cr])}
                    onDeleteCashRegister={(id) => setCashRegisters(cashRegisters.filter(c => c.id !== id))}
                />;
            case 'FINANCE_CASH':
                return <CashManager
                    cashRegisters={cashRegisters}
                    onUpdateCashRegister={(cr) => setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c).concat(prev.find(c => c.id === cr.id) ? [] : [cr]))}
                    movements={cashMovements}
                    onAddMovement={(m) => setCashMovements([...cashMovements, m])}
                    invoices={certifiedInvoices}
                    purchases={certifiedPurchases}
                />;
            case 'FINANCE_MAPS':
                return <CostRevenueMap invoices={certifiedInvoices} purchases={certifiedPurchases} />;
            case 'FINANCE_REPORTS':
                // Replaced with new detailed report component
                return <ManagementReports invoices={certifiedInvoices} products={products} />;
            case 'ACCOUNTING_DECLARATIONS':
                return <Model7 invoices={certifiedInvoices} purchases={certifiedPurchases} company={MOCK_COMPANY} />;
            case 'ACCOUNTING_TAXES':
                return <TaxManager
                    invoices={invoices}
                    company={MOCK_COMPANY}
                    purchases={purchases} // Passed purchases
                    payroll={payrollHistory} // Passed payroll
                    stockMovements={stockMovements} // Passed stock for variation if needed
                />;
            case 'ACCOUNTING_REGULARIZATION':
                return <RegularizationMap invoices={invoices} onViewInvoice={(inv) => handleEditInvoice(inv)} />;
            case 'ACCOUNTING_SAFT':
                return <SaftExport invoices={invoices} purchases={purchases} />;
            case 'HR_ATTENDANCE_MAP':
                return <AttendanceMapPage
                    employees={employees}
                    companyName={MOCK_COMPANY.name}
                    workLocations={workLocations}
                    attendanceRecords={attendance}
                />;
            case 'HR_EMPLOYEES':
                return <HumanResources
                    employees={employees}
                    onSaveEmployee={(e) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
                    transactions={hrTransactions}
                    onSaveTransaction={(t) => setHrTransactions([...hrTransactions, t])}
                    vacations={hrVacations}
                    onSaveVacation={(v) => setHrVacations([...hrVacations, v])}
                    payroll={payrollHistory}
                    onProcessPayroll={(p) => setPayrollHistory([...payrollHistory, ...p])}
                    professions={professions}
                    onSaveProfession={(p) => setProfessions([...professions.filter(pr => pr.id !== p.id), p])}
                    onDeleteProfession={(id) => setProfessions(professions.filter(p => p.id !== id))}
                    contracts={contracts}
                    onSaveContract={(c) => setContracts([...contracts, c])}
                    attendance={attendance}
                    onSaveAttendance={(a) => setAttendance([...attendance, a])}
                    company={MOCK_COMPANY}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    onUpdateCashRegister={(cr) => setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c))}
                    initialTab="COLABORADORES"
                    onToggleSidebarTheme={(white) => setIsSidebarWhite(white)}
                    onToggleSidebar={(open) => setIsSidebarOpen(open)}
                />;
            case 'HR':
            case 'HR_SALARY_PROC':
                return <HumanResources
                    employees={employees}
                    onSaveEmployee={(e) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
                    transactions={hrTransactions}
                    onSaveTransaction={(t) => setHrTransactions([...hrTransactions, t])}
                    vacations={hrVacations}
                    onSaveVacation={(v) => setHrVacations([...hrVacations, v])}
                    payroll={payrollHistory}
                    onProcessPayroll={(p) => setPayrollHistory([...payrollHistory, ...p])}
                    professions={professions}
                    onSaveProfession={(p) => setProfessions([...professions.filter(pr => pr.id !== p.id), p])}
                    onDeleteProfession={(id) => setProfessions(professions.filter(p => p.id !== id))}
                    contracts={contracts}
                    onSaveContract={(c) => setContracts([...contracts, c])}
                    attendance={attendance}
                    onSaveAttendance={(a) => setAttendance([...attendance, a])}
                    company={MOCK_COMPANY}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    onUpdateCashRegister={(cr) => setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c))}
                    initialTab={currentView === 'HR_SALARY_PROC' ? 'PROCESSAMENTO' : undefined}
                    onToggleSidebarTheme={(white) => setIsSidebarWhite(white)}
                    onToggleSidebar={(open) => setIsSidebarOpen(open)}
                />;
            case 'HR_LABOR_EXTINCTION':
                return <HumanResources
                    employees={employees}
                    onSaveEmployee={(e) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
                    transactions={hrTransactions}
                    onSaveTransaction={(t) => setHrTransactions([...hrTransactions, t])}
                    vacations={hrVacations}
                    onSaveVacation={(v) => setHrVacations([...hrVacations, v])}
                    payroll={payrollHistory}
                    onProcessPayroll={(p) => setPayrollHistory([...payrollHistory, ...p])}
                    professions={professions}
                    onSaveProfession={(p) => setProfessions([...professions.filter(pr => pr.id !== p.id), p])}
                    onDeleteProfession={(id) => setProfessions(professions.filter(p => p.id !== id))}
                    contracts={contracts}
                    onSaveContract={(c) => setContracts([...contracts, c])}
                    attendance={attendance}
                    onSaveAttendance={(a) => setAttendance([...attendance, a])}
                    company={MOCK_COMPANY}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    onUpdateCashRegister={(cr) => setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c))}
                    initialTab="EXTINCAO"
                    onToggleSidebarTheme={(white) => setIsSidebarWhite(white)}
                    onToggleSidebar={(open) => setIsSidebarOpen(open)}
                />;
            case 'HR_PROFESSIONS':
                return <HumanResources
                    employees={employees}
                    onSaveEmployee={(e) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
                    transactions={hrTransactions}
                    onSaveTransaction={(t) => setHrTransactions([...hrTransactions, t])}
                    vacations={hrVacations}
                    onSaveVacation={(v) => setHrVacations([...hrVacations, v])}
                    payroll={payrollHistory}
                    onProcessPayroll={(p) => setPayrollHistory([...payrollHistory, ...p])}
                    professions={professions}
                    onSaveProfession={(p) => setProfessions([...professions.filter(pr => pr.id !== p.id), p])}
                    onDeleteProfession={(id) => setProfessions(professions.filter(p => p.id !== id))}
                    contracts={contracts}
                    onSaveContract={(c) => setContracts([...contracts, c])}
                    attendance={attendance}
                    onSaveAttendance={(a) => setAttendance([...attendance, a])}
                    company={MOCK_COMPANY}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    onUpdateCashRegister={(cr) => setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c))}
                    initialTab="PROFISSÕES"
                    onToggleSidebarTheme={(white) => setIsSidebarWhite(white)}
                    onToggleSidebar={(open) => setIsSidebarOpen(open)}
                />;
            case 'HR_CONTRACTS':
                return <ContractManagement
                    employees={employees}
                    company={MOCK_COMPANY}
                    contracts={contracts}
                    onSave={c => setContracts([...contracts, c])}
                    onClose={() => setCurrentView('HR')}
                />;
            case 'HR_PERSONAL_REGISTRATION':
                return <PersonalRegistration
                    employees={employees}
                    onClose={() => setCurrentView('HR')}
                />;
            case 'HR_MAPS':
                return <HRMaps onClose={() => setCurrentView('HR')} employees={employees} attendance={attendance} company={MOCK_COMPANY} />;
            case 'HR_EMPLOYEE_LIST':
                return <EmployeeListPage
                    onClose={() => setCurrentView('HR')}
                    employees={employees}
                    onSaveEmployee={(e) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
                    workLocations={workLocations}
                    professions={professions}
                />;
            case 'HR_WORK_CARD':
                return <WorkCard onClose={() => setCurrentView('HR')} employees={employees} />;
            case 'HR_LABOR_REGISTRATION':
                return <LaborRegistration onClose={() => setCurrentView('HR')} employees={employees} />;
            case 'HR_IRT_TABLE':
                // Abrir em nova aba
                // window.open('/irt-table.html', '_blank');
                // return null;
                // Running in-app for better UX as requested
                return <IRTTableManager onClose={() => setCurrentView('HR')} />;
            case 'ARCHIVES':
                return <FileManager />;
            case 'AGRIBUSINESS':
            case 'AGRI_DASHBOARD':
            case 'AGRI_FARMS':
            case 'AGRI_PRODUCTION':
            case 'AGRI_LIVESTOCK':
            case 'AGRI_FIELDS':
            case 'AGRI_INPUTS':
            case 'AGRI_HARVEST':
            case 'AGRI_COSTS':
            case 'AGRI_SALES':
            case 'AGRI_WORKERS':
            case 'AGRI_MACHINERY':
            case 'AGRI_REPORTS':
            case 'AGRI_ACCOUNTING':
                return <Agribusiness initialView={currentView.replace('AGRI_', '')} />;
            case 'HR_TRANSFER_ORDERS':
                return <HumanResources
                    employees={employees}
                    onSaveEmployee={(e) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
                    transactions={hrTransactions}
                    onSaveTransaction={(t) => setHrTransactions([...hrTransactions, t])}
                    vacations={hrVacations}
                    onSaveVacation={(v) => setHrVacations([...hrVacations, v])}
                    payroll={payrollHistory}
                    onProcessPayroll={(p) => setPayrollHistory([...payrollHistory, ...p])}
                    professions={professions}
                    onSaveProfession={(p) => setProfessions([...professions.filter(pr => pr.id !== p.id), p])}
                    onDeleteProfession={(id) => setProfessions(professions.filter(p => p.id !== id))}
                    contracts={contracts}
                    onSaveContract={(c) => setContracts([...contracts, c])}
                    attendance={attendance}
                    onSaveAttendance={(a) => setAttendance([...attendance, a])}
                    company={MOCK_COMPANY}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    onUpdateCashRegister={(cr) => setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c))}
                    initialTab="TRANSFERENCIA"
                    onToggleSidebarTheme={(white) => setIsSidebarWhite(white)}
                    onToggleSidebar={(open) => setIsSidebarOpen(open)}
                />;
            case 'HR_PERFORMANCE':
                return <HumanResources
                    employees={employees}
                    onSaveEmployee={(e) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
                    transactions={hrTransactions}
                    onSaveTransaction={(t) => setHrTransactions([...hrTransactions, t])}
                    vacations={hrVacations}
                    onSaveVacation={(v) => setHrVacations([...hrVacations, v])}
                    payroll={payrollHistory}
                    onProcessPayroll={(p) => setPayrollHistory([...payrollHistory, ...p])}
                    professions={professions}
                    onSaveProfession={(p) => setProfessions([...professions.filter(pr => pr.id !== p.id), p])}
                    onDeleteProfession={(id) => setProfessions(professions.filter(p => p.id !== id))}
                    contracts={contracts}
                    onSaveContract={(c) => setContracts([...contracts, c])}
                    attendance={attendance}
                    onSaveAttendance={(a) => setAttendance([...attendance, a])}
                    company={MOCK_COMPANY}
                    workLocations={workLocations}
                    cashRegisters={cashRegisters}
                    onUpdateCashRegister={(cr) => setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c))}
                    initialTab="PERFORMANCE"
                    onToggleSidebarTheme={(white) => setIsSidebarWhite(white)}
                    onToggleSidebar={(open) => setIsSidebarOpen(open)}
                />;
            case 'CHURCH_MANAGEMENT':
                return <ChurchManagement />;
            default:
                return <div className="p-8 text-center text-slate-400">Módulo em desenvolvimento...</div>;
        }
    };

    if (!isLoggedIn) {
        return <LandingPage onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar
                currentView={currentView}
                onChangeView={setCurrentView}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                currentUser={currentUser}
                onLogout={handleLogout}
                isWhite={isSidebarWhite}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded">
                        <Menu />
                    </button>
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-slate-700 hidden sm:block">{MOCK_COMPANY.name}</h2>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-200">{MOCK_COMPANY.licensePlan}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ScreenshotButton />
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-700">{currentUser.name}</p>
                            <p className="text-xs text-slate-500">{currentUser.email}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-100">
                            {currentUser.name.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-6 relative">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default App;