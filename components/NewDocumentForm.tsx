
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Client, Invoice, InvoiceItem, InvoiceType, Product, Warehouse,
    PaymentMethod, Company, TaxRate, Metric, InvoiceStatus,
    IntegrationStatus, WorkLocation, CashRegister, DocumentSeries
} from '../types';
import { generateId, formatCurrency } from '../utils';
import { Save, X, FileText, Briefcase, CreditCard, User, Plus, Ruler, Tag, Hash, ShieldCheck, MapPin, Calendar, DollarSign, Calculator, ChevronDown, Search, UserPlus, ShoppingBag, Trash } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface NewDocumentFormProps {
    onSave: (invoice: Invoice, seriesId: string, action: 'SAVE' | 'CERTIFY') => void;
    onCancel: () => void;
    clients: Client[];
    products: Product[];
    workLocations: WorkLocation[];
    cashRegisters: CashRegister[];
    series: DocumentSeries[];
    warehouses: Warehouse[];
    initialData?: Partial<Invoice>;
    initialType?: InvoiceType;
    currentUser?: string;
    currentUserId?: string;
    currentCompany?: Company;
    taxRates?: TaxRate[];
    metrics?: Metric[];
}

const SearchableSelect = ({ label, value, onChange, options, disabled, placeholder, className = "" }: { label: string, value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() =>
        options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase())),
        [options, searchTerm]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`mb-4 relative ${className}`} ref={containerRef}>
            <label className="text-sm font-bold text-slate-700 block mb-1 leading-tight">
                {label}
            </label>
            <div
                onClick={() => !disabled && setIsOpen(true)}
                className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm flex justify-between items-center transition-all ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800 hover:border-blue-400 cursor-pointer'}`}
            >
                <span className="truncate uppercase">{selectedOption ? selectedOption.label : (placeholder || `Selecione ${label}...`)}</span>
                <ChevronDown size={16} className={`shrink-0 transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''} ml-2`} />
            </div>
            {isOpen && (
                <div className="absolute z-[100] w-full min-w-[250px] mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                autoFocus
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold"
                                placeholder="Pesquisar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    {/* Removed max-h-60 and overflow-y-auto to show all items without scrollbar */}
                    <div className="">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors border-b border-slate-50 last:border-0 whitespace-normal ${value === opt.value ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-slate-700'}`}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-sm text-slate-400 italic text-center">Nenhum resultado encontrado</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const NewDocumentForm: React.FC<NewDocumentFormProps> = ({
    onSave, onCancel, clients, products, workLocations, cashRegisters, series, warehouses, initialData, initialType, currentUser, currentCompany, taxRates
}) => {
    const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'CLIENT' | 'ITEMS' | 'FINANCIAL'>('DOCUMENT');
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', nif: '', email: '', phone: '' });

    const [listaClientes, setListaClientes] = useState<Client[]>(clients);
    const [listaProdutos, setListaProdutos] = useState<Product[]>(products);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchInitialData() {
            const { data: dbClientes } = await supabase.from("clientes").select("*").order("nome", { ascending: true });
            if (dbClientes) {
                setListaClientes(dbClientes.map((c: any) => ({
                    id: c.id,
                    name: c.nome,
                    vatNumber: c.nif,
                    email: c.email || '',
                    phone: c.telefone || '',
                    address: c.endereco || '',
                    city: c.localidade || '',
                    province: c.provincia || '',
                    country: 'Angola',
                    accountBalance: 0,
                    initialBalance: 0,
                    clientType: c.tipo_cliente || 'Nacional',
                    transactions: []
                })));
            }
            const { data: dbProdutos } = await supabase.from("produtos").select("*").order("descricao", { ascending: true });
            if (dbProdutos) {
                setListaProdutos(dbProdutos.map((p: any) => ({
                    id: p.id,
                    name: p.descricao,
                    costPrice: p.preco_custo || 0,
                    price: p.preco_venda || 0,
                    unit: p.unidade || 'un',
                    category: p.categoria || 'Geral',
                    stock: p.quantidade_stock || 0
                })));
            }
        }
        fetchInitialData();
    }, [clients, products]);

    const [formData, setFormData] = useState({
        clientId: initialData?.clientId || '',
        invoiceType: initialType || initialData?.type || InvoiceType.FT,
        seriesId: initialData?.seriesId || '',
        manualNumber: initialData?.number || '',
        manualHash: initialData?.hash || '',
        warehouseId: initialData?.targetWarehouseId || '',
        workLocationId: initialData?.workLocationId || '',
        paymentMethod: initialData?.paymentMethod || '' as PaymentMethod | '',
        cashRegisterId: initialData?.cashRegisterId || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
        accountingDate: initialData?.accountingDate || new Date().toISOString().split('T')[0],
        currency: initialData?.currency || 'AOA',
        exchangeRate: initialData?.exchangeRate || 1,
        globalDiscount: initialData?.globalDiscount || 0,
        notes: initialData?.notes || '',
        vatCativation: 'NONE' as 'NONE' | 'TOTAL' | 'PARCIAL'
    });

    const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddItem = () => {
        setItems([...items, {
            id: generateId(),
            description: '',
            reference: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            taxRate: 14,
            total: 0,
            showMetrics: false,
            length: 1,
            width: 1,
            height: 1,
            typology: 'Geral',
            unit: 'un'
        }]);
    };

    const handleItemProductSelect = (index: number, productId: string) => {
        const produto = listaProdutos.find(p => p.id === productId);
        if (produto) {
            const newItems = [...items];
            newItems[index] = {
                ...newItems[index],
                productId: produto.id,
                description: produto.name,
                unitPrice: produto.price,
                reference: produto.id.substring(0, 8).toUpperCase(),
                typology: produto.typology || 'Produto',
                unit: produto.unit || 'un'
            };

            // Recalculate
            const item = newItems[index];
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemDiscount = itemSubtotal * (item.discount / 100);
            newItems[index].total = itemSubtotal - itemDiscount;
            setItems(newItems);
        }
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;

        // Recalculate
        const item = newItems[index];
        const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
        const itemDiscount = itemSubtotal * ((item.discount || 0) / 100);
        newItems[index].total = itemSubtotal - itemDiscount;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
    const globalDiscountValue = subtotal * (formData.globalDiscount / 100);
    const taxableBase = subtotal - globalDiscountValue;

    const withholdingAmount = useMemo(() => {
        return items.reduce((acc, item) => {
            if (item.typology === 'Serviço' && item.total > 20000) {
                return acc + (item.total * 0.065);
            }
            return acc;
        }, 0);
    }, [items]);

    const taxAmount = items.reduce((acc, item) => {
        const itemTax = (item.taxRate || 0) / 100;
        let lineTax = item.total * itemTax;
        if (formData.vatCativation === 'TOTAL') lineTax = 0;
        else if (formData.vatCativation === 'PARCIAL') lineTax = lineTax * 0.5;
        return acc + lineTax;
    }, 0);

    const total = taxableBase + taxAmount - withholdingAmount;

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!formData.clientId) return alert("Selecione um cliente.");
        if (items.length === 0) return alert("Adicione pelo menos um item.");

        setIsLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            const { data: sequencia, error: seqError } = await supabase
                .from("documento_sequencias")
                .select("*")
                .eq("tipo_documento", formData.invoiceType)
                .eq("serie_id", formData.seriesId)
                .eq("ano", currentYear)
                .single();

            if (seqError || !sequencia) throw new Error("Série ou Sequência não configurada para este ano.");

            const novoNumero = (sequencia.ultimo_numero || 0) + 1;
            const docPrefix = formData.invoiceType;
            const fullDocNumber = `${docPrefix} / ${novoNumero}`;

            const { data: duplicado } = await supabase
                .from("faturas")
                .select("id")
                .eq("numero", fullDocNumber)
                .eq("series_id", formData.seriesId);

            if (duplicado && duplicado.length > 0) throw new Error("Número de documento duplicado detectado no sistema!");

            const invoiceObj = {
                id: generateId(),
                number: fullDocNumber,
                type: formData.invoiceType,
                date: formData.date,
                dueDate: formData.dueDate,
                clientId: formData.clientId,
                seriesId: formData.seriesId,
                workLocationId: formData.workLocationId,
                currency: formData.currency,
                exchangeRate: formData.exchangeRate,
                globalDiscount: formData.globalDiscount,
                taxAmount: taxAmount,
                subtotal: subtotal,
                total: total,
                withholdingAmount: withholdingAmount,
                status: InvoiceStatus.PENDING,
                isCertified: true,
                items: items,
                paymentMethod: formData.paymentMethod,
                cashRegisterId: formData.cashRegisterId,
                notes: formData.notes,
                processedAt: new Date().toISOString(),
                time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                accountingDate: formData.accountingDate,
                clientName: listaClientes.find(c => c.id === formData.clientId)?.name || 'Cliente Final',
                clientNif: listaClientes.find(c => c.id === formData.clientId)?.vatNumber,
                taxRate: 14,
                contraValue: total * formData.exchangeRate,
                companyId: currentCompany?.id || '',
                operatorName: currentUser,
                typology: 'Geral',
                source: 'MANUAL'
            };

            await supabase
                .from("documento_sequencias")
                .update({ ultimo_numero: novoNumero })
                .eq("id", sequencia.id);

            alert("Documento certificado com sucesso!");
            onSave(invoiceObj as Invoice, formData.seriesId, 'CERTIFY');
        } catch (err: any) {
            alert("Erro na certificação AGT: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = ({ label, field, type = 'text', required = false }: { label: string, field: string, type?: string, required?: boolean }) => (
        <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={(formData as any)[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                required={required}
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        {initialData ? 'Editar Documento' : 'Novo Documento'}
                    </h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    {[
                        { id: 'DOCUMENT', label: 'Documento', icon: FileText },
                        { id: 'CLIENT', label: 'Cliente', icon: User },
                        { id: 'ITEMS', label: 'Itens', icon: Briefcase },
                        { id: 'FINANCIAL', label: 'Financeiro', icon: CreditCard }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <tab.icon size={16} /> {tab.label}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <form id="document-form" onSubmit={handleSubmit}>
                        {activeTab === 'DOCUMENT' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <SearchableSelect
                                    label="Tipo de Documento"
                                    value={formData.invoiceType}
                                    options={Object.values(InvoiceType).map(t => ({ value: t, label: t }))}
                                    onChange={(val) => handleChange('invoiceType', val)}
                                />
                                <SearchableSelect
                                    label="Série Fiscal"
                                    value={formData.seriesId}
                                    options={series.filter(s => s.isActive).map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                                    onChange={(val) => handleChange('seriesId', val)}
                                    placeholder="Selecione a Série..."
                                />
                                <SearchableSelect
                                    label="Local de Trabalho"
                                    value={formData.workLocationId}
                                    options={workLocations.map(w => ({ value: w.id, label: w.name }))}
                                    onChange={(val) => handleChange('workLocationId', val)}
                                    placeholder="Sem Local Associado"
                                />
                                <InputField label="Data de Emissão" field="date" type="date" required />
                                <InputField label="Data de Vencimento" field="dueDate" type="date" />
                                <InputField label="Data Contabilística" field="accountingDate" type="date" />

                                {(formData.invoiceType === InvoiceType.FR || formData.invoiceType === InvoiceType.RG) && (
                                    <>
                                        <SearchableSelect
                                            label="Forma de Pagamento"
                                            value={formData.paymentMethod}
                                            options={[
                                                { value: 'CASH', label: 'Dinheiro (AOA)' },
                                                { value: 'MULTICAIXA', label: 'Multicaixa' },
                                                { value: 'TRANSFER', label: 'Transferência' },
                                                { value: 'OTHERS', label: 'Outros' }
                                            ]}
                                            onChange={(val) => handleChange('paymentMethod', val)}
                                        />
                                        <SearchableSelect
                                            label="Caixa"
                                            value={formData.cashRegisterId}
                                            options={cashRegisters.map(c => ({ value: c.id, label: c.name }))}
                                            onChange={(val) => handleChange('cashRegisterId', val)}
                                            placeholder="Selecione..."
                                        />
                                    </>
                                )}

                                {series.find(s => s.id === formData.seriesId)?.type === 'MANUAL' && (
                                    <>
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg col-span-2">
                                            <h4 className="text-orange-600 font-bold text-xs uppercase mb-2 flex items-center gap-1"><ShieldCheck size={14} /> Série Manual</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Número Manual" field="manualNumber" />
                                                <InputField label="Hash AGT" field="manualHash" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'CLIENT' && (
                            <div className="animate-in fade-in space-y-4">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label="Cliente *"
                                            value={formData.clientId}
                                            options={listaClientes.map(c => ({ value: c.id, label: `${c.name} (NIF: ${c.vatNumber})` }))}
                                            onChange={(val) => handleChange('clientId', val)}
                                            placeholder="Pesquisar cliente..."
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewClientModal(true)}
                                        className="mb-4 p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm flex items-center justify-center"
                                        title="Novo Cliente"
                                    >
                                        <UserPlus size={20} />
                                    </button>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                                    <h4 className="font-bold flex items-center gap-2 mb-2"><User size={16} /> Dados do Cliente Selecionado</h4>
                                    {formData.clientId ? (
                                        <div className="space-y-1">
                                            <p><span className="font-bold">Nome:</span> {listaClientes.find(c => c.id === formData.clientId)?.name}</p>
                                            <p><span className="font-bold">NIF:</span> {listaClientes.find(c => c.id === formData.clientId)?.vatNumber}</p>
                                            <p><span className="font-bold">Endereço:</span> {listaClientes.find(c => c.id === formData.clientId)?.address || '-'}</p>
                                        </div>
                                    ) : (
                                        <p className="italic opacity-70">Nenhum cliente selecionado.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'ITEMS' && (
                            <div className="animate-in fade-in space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-slate-700">Itens do Documento</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2 text-sm"
                                    >
                                        <Plus size={16} /> Adicionar Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:border-blue-300 group">
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-12 md:col-span-5">
                                                    <SearchableSelect
                                                        label={`Artigo ${index + 1}`}
                                                        value={item.productId || ''}
                                                        options={listaProdutos.map(p => ({ value: p.id, label: `${p.name} | STOCK: ${p.stock}` }))}
                                                        onChange={(val) => handleItemProductSelect(index, val)}
                                                        placeholder="Selecione Artigo..."
                                                        className="mb-0"
                                                    />
                                                </div>
                                                <div className="col-span-6 md:col-span-4">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Descrição</label>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-3 md:col-span-3">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tipologia</label>
                                                    <select
                                                        value={item.typology || 'Geral'}
                                                        onChange={(e) => handleItemChange(index, 'typology', e.target.value)}
                                                        className="w-full px-2 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-xs"
                                                    >
                                                        <option value="Geral">Geral</option>
                                                        <option value="Serviço">Serviço</option>
                                                        <option value="Produto">Produto</option>
                                                    </select>
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Qtd</label>
                                                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full px-2 py-2 border border-slate-200 rounded font-bold text-sm text-center" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unidade</label>
                                                    <select value={item.unit || 'un'} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="w-full px-2 py-2 border border-slate-200 rounded font-bold text-xs">
                                                        <option value="un">un</option><option value="kg">kg</option><option value="mês">mês</option><option value="dia">dia</option><option value="h">h</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Preço Un.</label>
                                                    <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))} className="w-full px-2 py-2 border border-slate-200 rounded font-bold text-sm text-right" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Imposto</label>
                                                    <select value={item.taxRate} onChange={(e) => handleItemChange(index, 'taxRate', Number(e.target.value))} className="w-full px-2 py-2 border border-slate-200 rounded font-bold text-xs">
                                                        {taxRates?.map(t => <option key={t.id} value={t.percentage}>{t.percentage}%</option>) || <option value={14}>14%</option>}
                                                        <option value={0}>0%</option><option value={7}>7%</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Desc%</label>
                                                    <input type="number" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))} className="w-full px-2 py-2 border border-slate-200 rounded font-bold text-sm text-center" />
                                                </div>
                                                <div className="col-span-1 flex items-end justify-center pb-2">
                                                    <button onClick={() => handleRemoveItem(index)} className="text-slate-300 hover:text-red-500 transition"><Trash size={18} /></button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={() => handleItemChange(index, 'showMetrics', !item.showMetrics)}
                                                    className={`text-xs font-bold flex items-center gap-1 ${item.showMetrics ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
                                                >
                                                    <Ruler size={14} /> {item.showMetrics ? 'Ocultar Dimensões' : 'Adicionar Dimensões'}
                                                </button>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">Total Item:</span>
                                                    <span className="font-mono font-bold text-slate-700">{formatCurrency(item.total)}</span>
                                                </div>
                                            </div>

                                            {item.showMetrics && (
                                                <div className="grid grid-cols-3 gap-3 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-2">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Comp. (m)</label>
                                                        <input type="number" step="0.01" value={item.length || 1} onChange={(e) => handleItemChange(index, 'length', Number(e.target.value))} className="w-full px-2 py-1 border border-slate-200 rounded font-bold text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Larg. (m)</label>
                                                        <input type="number" step="0.01" value={item.width || 1} onChange={(e) => handleItemChange(index, 'width', Number(e.target.value))} className="w-full px-2 py-1 border border-slate-200 rounded font-bold text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Alt. (m)</label>
                                                        <input type="number" step="0.01" value={item.height || 1} onChange={(e) => handleItemChange(index, 'height', Number(e.target.value))} className="w-full px-2 py-1 border border-slate-200 rounded font-bold text-xs" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 font-bold text-sm italic">
                                            Nenhum item adicionado
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'FINANCIAL' && (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <SearchableSelect
                                        label="Moeda"
                                        value={formData.currency}
                                        options={[{ value: 'AOA', label: 'AOA (Kwanzas)' }, { value: 'USD', label: 'USD (Dólares)' }, { value: 'EUR', label: 'EUR (Euros)' }]}
                                        onChange={(val) => handleChange('currency', val)}
                                    />
                                    <InputField label="Taxa de Câmbio" field="exchangeRate" type="number" />
                                    <InputField label="Desconto Global (%)" field="globalDiscount" type="number" />
                                    <SearchableSelect
                                        label="Cativação IVA"
                                        value={formData.vatCativation}
                                        options={[{ value: 'NONE', label: 'Nenhuma' }, { value: 'TOTAL', label: 'Total (100%)' }, { value: 'PARCIAL', label: 'Parcial (50%)' }]}
                                        onChange={(val) => handleChange('vatCativation', val)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-700 block mb-1">Observações / Notas</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm h-32 resize-none"
                                            placeholder="Informações adicionais..."
                                        />
                                    </div>

                                    <div className="bg-slate-800 rounded-lg p-6 text-white shadow-lg space-y-3">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-slate-400 font-bold text-xs uppercase">Subtotal</span>
                                            <span className="font-mono text-sm">{formatCurrency(subtotal)}</span>
                                        </div>
                                        {formData.globalDiscount > 0 && (
                                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                                <span className="text-red-400 font-bold text-xs uppercase">Desconto Global</span>
                                                <span className="font-mono text-sm text-red-400">-{formatCurrency(globalDiscountValue)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-slate-400 font-bold text-xs uppercase">Base Tributável</span>
                                            <span className="font-mono text-sm">{formatCurrency(taxableBase)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-slate-400 font-bold text-xs uppercase">Imposto (IVA)</span>
                                            <span className="font-mono text-sm">{formatCurrency(taxAmount)}</span>
                                        </div>
                                        {withholdingAmount > 0 && (
                                            <div className="flex justify-between items-center border-b border-white/10 pb-2 text-orange-400">
                                                <span className="font-bold text-xs uppercase">Retenção (6.5%)</span>
                                                <span className="font-mono text-sm">-{formatCurrency(withholdingAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-blue-400 font-bold text-sm uppercase">Total</span>
                                            <span className="font-mono text-2xl font-bold text-blue-400">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="document-form"
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Processando...' : <><Save size={18} /> Gravar Documento Cloud</>}
                    </button>
                </div>
            </div>

            {/* New Client Modal */}
            {showNewClientModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><User size={18} /> Novo Cliente</h3>
                            <button onClick={() => setShowNewClientModal(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo / Empresa</label>
                                <input
                                    type="text"
                                    value={newClientData.name}
                                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                                    placeholder="Ex: Manuel Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NIF (Contribuinte)</label>
                                <input
                                    type="text"
                                    value={newClientData.nif}
                                    onChange={(e) => setNewClientData({ ...newClientData, nif: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                                    placeholder="Ex: 5000..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button onClick={() => setShowNewClientModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">Cancelar</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Criar Cliente</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewDocumentForm;
