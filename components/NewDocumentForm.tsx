import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Client, Invoice, InvoiceItem, InvoiceType, Product, Warehouse,
    PaymentMethod, Company, TaxRate, Metric, InvoiceStatus,
    IntegrationStatus, WorkLocation, CashRegister, DocumentSeries
} from '../types';
import { generateId, formatCurrency } from '../utils';
import { Save, X, FileText, Briefcase, CreditCard, User, Plus, Ruler, Tag, Hash, ShieldCheck, MapPin, Calendar, DollarSign, Calculator, ChevronDown, ChevronUp, Search, UserPlus, Landmark, List, ArrowLeft, Trash, Users } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useClickOutside } from '../services/hooks';

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

    // REMOVED useClickOutside to stay open until selection
    // useClickOutside(containerRef, () => setIsOpen(false));

    return (
        <div className={`mb-4 relative ${className}`} ref={containerRef}>
            <label className="text-[10px] font-bold text-slate-600 block mb-1 leading-tight uppercase">
                {label}
            </label>
            <div
                onClick={() => !disabled && setIsOpen(true)}
                className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm flex justify-between items-center transition-all ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50/50 text-slate-800 hover:border-blue-400 cursor-pointer'}`}
            >
                <span className="truncate uppercase">{selectedOption ? selectedOption.label : (placeholder || `Selecione ${label.toLowerCase()}...`)}</span>
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

    // Seções expansíveis (Layout Accordion)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        documentData: true,
        clientData: true,
        items: true,
        financial: true,
        notes: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [isLoading, setIsLoading] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', nif: '', email: '', phone: '' });

    const [listaClientes, setListaClientes] = useState<Client[]>(clients);
    const [listaProdutos, setListaProdutos] = useState<Product[]>(products);

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
            typology: 'Geral'
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
                typology: produto.typology || 'Produto', // Changed Logic to adapt type but keep fields
                unit: produto.unit || 'un'
            };

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

        const item = newItems[index];
        const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
        const itemDiscount = itemSubtotal * ((item.discount || 0) / 100);
        newItems[index].total = itemSubtotal - itemDiscount;

        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

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

        if (formData.vatCativation === 'TOTAL') {
            lineTax = 0;
        } else if (formData.vatCativation === 'PARCIAL') {
            lineTax = lineTax * 0.5;
        }
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

            if (seqError || !sequencia) {
                throw new Error("Série ou Sequência não configurada para este ano.");
            }

            const novoNumero = (sequencia.ultimo_numero || 0) + 1;
            const docPrefix = formData.invoiceType;
            const fullDocNumber = `${docPrefix} / ${novoNumero}`;

            const { data: duplicado } = await supabase
                .from("faturas")
                .select("id")
                .eq("numero", fullDocNumber)
                .eq("series_id", formData.seriesId);

            if (duplicado && duplicado.length > 0) {
                throw new Error("Número de documento duplicado detectado no sistema!");
            }

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

            if (sequencia) {
                await supabase
                    .from("documento_sequencias")
                    .update({ ultimo_numero: novoNumero })
                    .eq("id", sequencia.id);
            } else {
                await supabase
                    .from("documento_sequencias")
                    .insert({
                        tipo_documento: formData.invoiceType,
                        serie_id: formData.seriesId,
                        ano: currentYear,
                        ultimo_numero: novoNumero
                    });
            }

            alert("Documento certificado com sucesso!");
            onSave(invoiceObj as Invoice, formData.seriesId, 'CERTIFY');
        } catch (err: any) {
            alert("Erro na certificação AGT: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
            {/* Header matches PurchaseForm */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-blue-600" /> {initialData ? 'Editar Documento' : 'Novo Documento'}
                    </h1>
                    <p className="text-xs text-slate-500">Emissão e Certificação de Documentos Comerciais</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border transition-all shadow-sm flex items-center gap-2">
                        <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
                    </button>
                    {/* No ViewList button here as per props */}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h2 className="font-black uppercase tracking-widest text-sm">Ficha de Documento - Edição</h2>
                </div>

                <div className="p-6 space-y-4 max-w-6xl mx-auto">
                    {/* DADOS DO DOCUMENTO */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('documentData')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                            <span className="font-bold text-sm uppercase flex items-center gap-2"><FileText size={16} className="text-blue-500" /> Dados e Datas do Documento</span>
                            {expandedSections.documentData ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.documentData && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white animate-in slide-in-from-top-2">
                                <div>
                                    <SearchableSelect
                                        label="Tipo de Documento"
                                        value={formData.invoiceType}
                                        onChange={(val) => handleChange('invoiceType', val)}
                                        options={Object.values(InvoiceType).map(t => ({ value: t, label: t }))}
                                    />
                                </div>

                                {(formData.invoiceType === InvoiceType.FR || formData.invoiceType === InvoiceType.RG) && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Forma Pagamento</label>
                                            <select className="w-full border border-emerald-200 p-2.5 rounded-2xl bg-emerald-50 outline-none" value={formData.paymentMethod} onChange={e => handleChange('paymentMethod', e.target.value)}>
                                                <option value="">Selecione...</option>
                                                <option value="CASH">Dinheiro (AOA)</option>
                                                <option value="MULTICAIXA">Multicaixa</option>
                                                <option value="TRANSFER">Transferência</option>
                                                <option value="OTHERS">Outros</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Caixa</label>
                                            <select className="w-full border border-emerald-200 p-2.5 rounded-2xl bg-emerald-50 outline-none" value={formData.cashRegisterId} onChange={e => handleChange('cashRegisterId', e.target.value)}>
                                                <option value="">Selecione...</option>
                                                {cashRegisters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1 uppercase"><Calendar size={10} /> Data Emissão</label>
                                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.date} onChange={e => handleChange('date', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1 uppercase"><Calendar size={10} /> Data Contabilística</label>
                                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none bg-blue-50" value={formData.accountingDate} onChange={e => handleChange('accountingDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1 uppercase"><Calendar size={10} /> Data Vencimento</label>
                                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none bg-orange-50" value={formData.dueDate} onChange={e => handleChange('dueDate', e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DADOS DO CLIENTE */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('clientData')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                            <span className="font-bold text-sm uppercase flex items-center gap-2"><Users size={16} className="text-green-600" /> Seleção de Cliente e Série</span>
                            {expandedSections.clientData ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.clientData && (
                            <div className="p-6 bg-white animate-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-2">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <SearchableSelect
                                                label="Cliente *"
                                                placeholder="Pesquisar cliente (Nome ou NIF)"
                                                options={listaClientes.map(c => ({ value: c.id, label: `${c.name} (NIF: ${c.vatNumber})` }))}
                                                value={formData.clientId}
                                                onChange={(val) => handleChange('clientId', val)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewClientModal(true)}
                                            className="mb-4 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-lg flex items-center justify-center"
                                        >
                                            <UserPlus size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase">Série Fiscal</label>
                                    <SearchableSelect
                                        label=""
                                        placeholder="Selecione a Série..."
                                        options={series.filter(s => s.isActive).map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                                        value={formData.seriesId}
                                        onChange={(val) => handleChange('seriesId', val)}
                                    />
                                    {series.find(s => s.id === formData.seriesId)?.type === 'MANUAL' && (
                                        <div className="mt-2 text-[10px] font-bold text-orange-600">Série Manual - Requer numeração manual</div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase">Local de Trabalho</label>
                                    <SearchableSelect
                                        label=""
                                        placeholder="Selecione o Local..."
                                        options={workLocations.map(w => ({ value: w.id, label: w.name }))}
                                        value={formData.workLocationId}
                                        onChange={(val) => handleChange('workLocationId', val)}
                                    />
                                </div>

                                {series.find(s => s.id === formData.seriesId)?.type === 'MANUAL' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-orange-600 uppercase block mb-1 flex items-center gap-1"><Hash size={10} /> Número do Documento</label>
                                            <input className="w-full border-2 p-2.5 rounded-2xl outline-none border-orange-200" placeholder="Ex: 1" value={formData.manualNumber} onChange={e => handleChange('manualNumber', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-orange-600 uppercase block mb-1 flex items-center gap-1"><ShieldCheck size={10} /> Código Hash (AGT)</label>
                                            <input className="w-full border-2 p-2.5 rounded-2xl outline-none border-orange-200" placeholder="Hash AGT..." value={formData.manualHash} onChange={e => handleChange('manualHash', e.target.value)} />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ITENS DO DOCUMENTO */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('items')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                            <span className="font-bold text-sm uppercase flex items-center gap-2"><List size={16} className="text-purple-600" /> Itens do Documento</span>
                            {expandedSections.items ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.items && (
                            <div className="p-6 bg-white animate-in slide-in-from-top-2">
                                <button onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2 mb-4">
                                    <Plus size={14} /> Adicionar Linha
                                </button>
                                <div className="overflow-x-auto min-h-[300px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="p-3 w-10 text-center"></th>
                                                <th className="p-3">Artigo / Descrição</th>
                                                <th className="p-3 w-24">Tipo</th>
                                                <th className="p-3 w-20 text-center">Qtd</th>
                                                <th className="p-3 w-24 text-center">Unidade</th>
                                                <th className="p-3 w-28 text-right">Preço Un.</th>
                                                <th className="p-3 w-32 text-center">IVA</th>
                                                <th className="p-3 w-16 text-center">Desc%</th>
                                                <th className="p-3 w-28 text-right">Total</th>
                                                <th className="p-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((item, index) => (
                                                <React.Fragment key={item.id}>
                                                    <tr className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="p-2 text-center"><button onClick={() => handleItemChange(index, 'showMetrics', !item.showMetrics)} className={`p-1.5 rounded-lg transition-all ${item.showMetrics ? 'bg-blue-100 text-blue-600 rotate-180' : 'text-slate-300 hover:text-blue-500'}`}><Ruler size={16} /></button></td>
                                                        <td className="p-2">
                                                            <div className="flex flex-col gap-1">
                                                                <select
                                                                    className="w-full p-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none font-bold text-blue-700 bg-blue-50"
                                                                    onChange={(e) => handleItemProductSelect(index, e.target.value)}
                                                                    value={item.productId || ''}
                                                                >
                                                                    <option value="">-- SELECIONAR ARTIGO --</option>
                                                                    {listaProdutos.map(p => (
                                                                        <option key={p.id} value={p.id}>
                                                                            {p.name} | STOCK: {p.stock} {p.unit}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <input className="w-full p-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-xs font-bold" placeholder="Descrição..." value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <select className="w-full p-1 border border-slate-200 rounded text-[10px] font-bold" value={item.typology || 'Geral'} onChange={(e) => handleItemChange(index, 'typology', e.target.value)}>
                                                                <option value="Geral">Geral</option>
                                                                <option value="Serviço">Serviço</option>
                                                                <option value="Produto">Produto</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-center"><input type="number" className="w-full p-1.5 text-center border border-slate-200 rounded bg-white text-sm font-bold" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} /></td>
                                                        <td className="p-2 text-center">
                                                            <select className="w-full p-1.5 border border-slate-200 rounded bg-white text-[10px] font-bold" value={item.unit || 'un'} onChange={(e) => handleItemChange(index, 'unit', e.target.value)}>
                                                                <option value="un">un</option>
                                                                <option value="kg">kg</option>
                                                                <option value="mês">mês</option>
                                                                <option value="dia">dia</option>
                                                                <option value="h">h</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-right"><input type="number" className="w-full p-1.5 text-right border border-slate-200 rounded bg-white text-sm font-bold" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))} /></td>
                                                        <td className="p-2 text-center">
                                                            <select className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs font-bold" value={item.taxRate} onChange={(e) => handleItemChange(index, 'taxRate', Number(e.target.value))}>
                                                                {taxRates?.map(t => <option key={t.id} value={t.percentage}>{t.percentage}%</option>) || <option value={14}>14%</option>}
                                                                <option value={0}>0%</option>
                                                                <option value={7}>7%</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-center"><input type="number" className="w-full p-1.5 text-center border border-slate-200 rounded bg-white text-sm" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))} /></td>
                                                        <td className="p-2 text-right font-black text-slate-700 text-sm">{formatCurrency(item.total).replace('Kz', '')}</td>
                                                        <td className="p-2 text-center"><button onClick={() => handleRemoveItem(index)} className="text-slate-300 hover:text-red-500 p-1"><Trash size={16} /></button></td>
                                                    </tr>
                                                    {item.showMetrics && (
                                                        <tr className="bg-blue-50/50 animate-in slide-in-from-top-2">
                                                            <td className="p-2 border-r border-blue-100"></td>
                                                            <td colSpan={9} className="p-3">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-2"><span className="text-[10px] font-black text-blue-600 uppercase">Volume:</span><Ruler size={14} className="text-blue-400" /></div>
                                                                    <div className="flex flex-wrap gap-4">
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">C (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.length || 1} onChange={e => handleItemChange(index, 'length', Number(e.target.value))} /></div>
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">L (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.width || 1} onChange={e => handleItemChange(index, 'width', Number(e.target.value))} /></div>
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">A (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.height || 1} onChange={e => handleItemChange(index, 'height', Number(e.target.value))} /></div>
                                                                        <div className="flex items-center gap-2 ml-4"><span className="text-[10px] font-bold text-slate-400 uppercase">Total m³:</span><span className="text-xs font-black text-blue-700">{(Number(item.length || 1) * Number(item.width || 1) * Number(item.height || 1)).toFixed(2)}</span></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RESUMO FINANCEIRO */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('financial')} className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border-b border-blue-200">
                            <div className="flex items-center gap-2"><span className="font-black text-sm uppercase text-blue-600">Resumo Financeiro</span></div>
                            {expandedSections.financial ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.financial && (
                            <div className="p-6 bg-white space-y-6 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase">Moeda</label>
                                        <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.currency} onChange={e => handleChange('currency', e.target.value)}>
                                            <option value="AOA">AOA (Kwanzas)</option><option value="USD">USD (Dólares)</option><option value="EUR">EUR (Euros)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase">Câmbio</label>
                                        <input type="number" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.exchangeRate} onChange={e => handleChange('exchangeRate', Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1 uppercase">Cativação IVA</label>
                                        <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.vatCativation} onChange={e => handleChange('vatCativation', e.target.value)}>
                                            <option value="NONE">Nenhuma</option><option value="TOTAL">Total (100%)</option><option value="PARCIAL">Parcial (50%)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1 flex items-center gap-1"><Tag size={12} /> Desconto Global (%)</label>
                                        <input type="number" className="w-full border-2 border-blue-100 p-2.5 rounded-2xl outline-none" value={formData.globalDiscount} onChange={e => handleChange('globalDiscount', Number(e.target.value))} placeholder="0%" />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-slate-100 text-[10px] uppercase font-bold">
                                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                    {globalDiscountValue > 0 && <div className="flex justify-between text-red-600"><span>Desc. Global</span><span>-{formatCurrency(globalDiscountValue)}</span></div>}
                                    <div className="flex justify-between text-slate-600 pt-2"><span>Imposto (IVA)</span><span>{formatCurrency(taxAmount)}</span></div>
                                    {withholdingAmount > 0 && <div className="flex justify-between text-orange-600 pt-2"><span>Retenção AGT (6.5%)</span><span>-{formatCurrency(withholdingAmount)}</span></div>}
                                    <div className="pt-4 mt-4 border-t-2 border-slate-800 flex flex-col items-end gap-1">
                                        <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">Valor Final</span>
                                        <span className="font-black text-xl text-blue-600 tracking-tighter leading-none">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* OBSERVAÇÕES */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('notes')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                            <span className="font-bold text-sm uppercase flex items-center gap-2"><FileText size={16} className="text-slate-500" /> Observações Adicionais</span>
                            {expandedSections.notes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.notes && (
                            <div className="p-6 bg-white animate-in slide-in-from-top-2">
                                <textarea className="w-full border border-slate-300 p-3 rounded-2xl outline-none focus:border-blue-500 bg-slate-50 h-20 resize-none" placeholder="Notas do documento..." value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)}></textarea>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button onClick={onCancel} className="px-8 py-3 border-2 border-slate-200 rounded-xl font-black text-slate-400 uppercase text-[10px] hover:bg-white transition">Cancelar</button>
                    <button onClick={() => handleSubmit()} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-black uppercase text-[10px] shadow-xl hover:bg-blue-700 transition flex items-center gap-2">
                        <Save size={16} /> Gravar Documento Cloud
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
