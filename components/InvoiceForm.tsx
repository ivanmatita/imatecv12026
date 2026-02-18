
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Invoice, InvoiceItem, InvoiceStatus, InvoiceType, Product, WorkLocation, PaymentMethod, CashRegister, DocumentSeries, Warehouse, Company, TaxRate, Metric } from '../types';
import { generateId, formatCurrency, formatDate, generateQrCodeUrl, numberToExtenso } from '../utils';
import { supabase } from '../services/supabaseClient';
import { Plus, Trash, Save, ArrowLeft, Lock, FileText, List, X, Calendar, CreditCard, ChevronDown, ChevronUp, Ruler, Users, Briefcase, Percent, DollarSign, RefreshCw, Scale, ShieldCheck, Hash, Tag, UserPlus, Loader2, Package, AlertCircle, MapPin, Search } from 'lucide-react';

interface InvoiceFormProps {
    onSave: (invoice: Invoice, seriesId: string, action?: 'PRINT' | 'CERTIFY') => void;
    onCancel: () => void;
    onViewList: () => void;
    onAddWorkLocation: () => void;
    onSaveClient: (client: Client) => void;
    onSaveWorkLocation: (wl: WorkLocation) => void;
    clients: Client[];
    products: Product[];
    workLocations: WorkLocation[];
    cashRegisters: CashRegister[];
    series: DocumentSeries[];
    warehouses?: Warehouse[];
    initialType?: InvoiceType;
    initialData?: Partial<Invoice>;
    currentUser?: string;
    currentUserId?: string;
    currentCompany?: Company;
    taxRates?: TaxRate[];
    metrics?: Metric[];
}

// --- SEARCHABLE SELECT COMPONENT ---
interface SearchableSelectProps {
    options: { id: string; label: string; sublabel?: string }[];
    value: string;
    onChange: (id: string) => void;
    placeholder: string;
    disabled?: boolean;
    className?: string;
    label?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, disabled, className, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.id === value);

    const filteredOptions = options.filter(o =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="text-[10px] font-bold text-slate-600 block mb-1">{label}</label>}
            <div
                className={`w-full border p-2.5 rounded-2xl flex items-center justify-between cursor-pointer bg-white transition-all ${isOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-300 hover:border-slate-400'} ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70' : ''}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!disabled) setIsOpen(!isOpen);
                }}
            >
                <span className={`text-sm ${!selectedOption ? 'text-slate-400' : 'text-slate-900 font-bold'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-[110] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                    <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                        <Search size={14} className="text-slate-400" />
                        <input
                            autoFocus
                            className="bg-transparent border-none outline-none text-xs w-full font-medium"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors flex flex-col ${opt.id === value ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    <span className={`text-[11px] font-black uppercase ${opt.id === value ? 'text-blue-700' : 'text-slate-700'}`}>{opt.label}</span>
                                    {opt.sublabel && <span className="text-[9px] text-slate-500 font-bold">{opt.sublabel}</span>}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-slate-400 text-xs italic">Nenhum resultado encontrado</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const InvoiceForm: React.FC<InvoiceFormProps> = ({
    onSave, onCancel, onViewList, onSaveClient, onSaveWorkLocation, clients, products, workLocations, cashRegisters, series, warehouses = [],
    initialType, initialData, currentUser, currentUserId, currentCompany, taxRates = [], metrics = []
}) => {
    const isRestricted = initialData?.isCertified || false;

    const [selectedSeriesId, setSelectedSeriesId] = useState(initialData?.seriesId || '');
    const [clientId, setClientId] = useState(initialData?.clientId || '');
    const [invoiceType, setInvoiceType] = useState<InvoiceType>(initialType || initialData?.type || InvoiceType.FT);
    const [workLocationId, setWorkLocationId] = useState(initialData?.workLocationId || '');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(initialData?.paymentMethod || '');
    const [cashRegisterId, setCashRegisterId] = useState(initialData?.cashRegisterId || '');
    const [typology, setTypology] = useState('Geral');

    const [manualNumber, setManualNumber] = useState(initialData?.number || '');
    const [manualHash, setManualHash] = useState(initialData?.hash || '');

    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(initialData?.date || today);
    const [dueDate, setDueDate] = useState(initialData?.dueDate || today);
    const [accountingDate, setAccountingDate] = useState(initialData?.accountingDate || today);

    const [currency, setCurrency] = useState<string>(initialData?.currency || 'AOA');
    const [exchangeRate, setExchangeRate] = useState<number>(initialData?.exchangeRate || 1);

    const [retentionType, setRetentionType] = useState<'NONE' | 'CAT_50' | 'CAT_100'>(initialData?.retentionType || 'NONE');
    const [hasWithholding, setHasWithholding] = useState<boolean>(!!initialData?.withholdingAmount);

    const [showClientModal, setShowClientModal] = useState(false);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClient, setNewClient] = useState({
        vatNumber: '', name: '', address: '', city: '', postalCode: '', province: '', municipality: '', country: 'Angola', phone: '', email: '', webPage: '', clientType: 'não grupo nacional', initialBalance: 0
    });

    // Seções expansíveis
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        documentData: true,
        clientData: true,
        items: true,
        financial: false,
        notes: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const allowedSeries = useMemo(() => series.filter(s => s.isActive), [series]);
    const selectedSeriesObj = useMemo(() => series.find(s => s.id === selectedSeriesId), [series, selectedSeriesId]);
    const isManualSeries = selectedSeriesObj?.type === 'MANUAL';
    const showPaymentFields = (invoiceType === InvoiceType.FR || invoiceType === InvoiceType.RG || invoiceType === InvoiceType.VD); // Fatura Recibo, Recibo, Venda a Dinheiro

    const [items, setItems] = useState<InvoiceItem[]>(() => {
        const rawItems = initialData?.items || [];
        return rawItems.map((i: any) => ({
            id: i.id || generateId(),
            productId: i.productId,
            description: i.description || '',
            reference: i.reference || '',
            quantity: i.quantity || 1,
            unit: i.unit || 'un',
            unitPrice: i.unitPrice || 0,
            discount: i.discount || 0,
            taxRate: i.taxRate !== undefined ? i.taxRate : 14,
            length: i.length || 1,
            width: i.width || 1,
            height: i.height || 1,
            showMetrics: i.showMetrics || false,
            total: i.total !== undefined ? i.total : ((i.quantity || 1) * (i.length || 1) * (i.width || 1) * (i.height || 1) * (i.unitPrice || 0) * (1 - (i.discount || 0) / 100)),
            type: i.type || 'PRODUCT',
            expiryDate: i.expiryDate || '',
            valueDate: i.valueDate || today,
            rubrica: i.rubrica || (i.type === 'SERVICE' ? '62.1' : '61.1'),
            typology: i.typology || 'Geral'
        }));
    });

    const [globalDiscount, setGlobalDiscount] = useState(initialData?.globalDiscount || 0);
    const [notes, setNotes] = useState(initialData?.notes || '');

    useEffect(() => {
        if (allowedSeries.length > 0 && !selectedSeriesId) {
            if (initialData?.seriesId && allowedSeries.find(s => s.id === initialData.seriesId)) {
                setSelectedSeriesId(initialData.seriesId);
            } else {
                setSelectedSeriesId(allowedSeries[0].id);
            }
        }
    }, [initialData, allowedSeries, selectedSeriesId]);

    useEffect(() => { if (initialType) setInvoiceType(initialType); }, [initialType]);

    useEffect(() => {
        if (currency === 'AOA') setExchangeRate(1);
        else if (currency === 'USD') setExchangeRate(850);
        else if (currency === 'EUR') setExchangeRate(920);
    }, [currency]);

    const calculateLineTotal = (qty: number, length: number = 1, width: number = 1, height: number = 1, price: number, discount: number) => {
        const actualLength = length > 0 ? length : 1;
        const actualWidth = width > 0 ? width : 1;
        const actualHeight = height > 0 ? height : 1;
        const base = qty * actualLength * actualWidth * actualHeight * price;
        const discAmount = base * (discount / 100);
        return base - discAmount;
    };

    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = items.reduce((acc, item) => acc + (item.total * (item.taxRate / 100)), 0);

    const withholdingAmount = items.reduce((acc, item) => {
        const isService = item.type === 'SERVICE' || item.typology === 'Serviço';
        const lineTotal = item.quantity * (item.length || 1) * (item.width || 1) * (item.height || 1) * item.unitPrice * (1 - (item.discount / 100));
        return isService && lineTotal > 20000 ? acc + (lineTotal * 0.065) : acc;
    }, 0);

    const retentionAmount = useMemo(() => {
        if (retentionType === 'CAT_50') return taxAmount * 0.5;
        if (retentionType === 'CAT_100') return taxAmount;
        return 0;
    }, [retentionType, taxAmount]);

    const discountGlobalValue = subtotal * (globalDiscount / 100);
    const total = (subtotal + taxAmount) - discountGlobalValue - withholdingAmount - retentionAmount;
    const contraValue = total * exchangeRate;

    const handleAddItem = () => {
        if (isRestricted) return;
        setItems([...items, { id: generateId(), description: '', reference: '', quantity: 1, length: 1, width: 1, height: 1, unit: 'un', unitPrice: 0, discount: 0, taxRate: 14, total: 0, type: 'PRODUCT', expiryDate: '', valueDate: today, showMetrics: false, rubrica: '61.1', typology: 'Geral' }]);
    };

    const handleProductSelect = (index: number, productId: string) => {
        if (isRestricted) return;
        const product = products.find(p => p.id === productId);
        if (product) {
            const newItems = [...items];
            const unitPrice = product.price;
            newItems[index] = {
                ...newItems[index],
                productId: product.id,
                description: product.name,
                reference: product.barcode || product.id.substring(0, 6).toUpperCase(),
                unit: product.unit || 'un',
                unitPrice: unitPrice,
                type: 'PRODUCT',
                rubrica: '61.1',
                total: calculateLineTotal(newItems[index].quantity, newItems[index].length, newItems[index].width, newItems[index].height, unitPrice, newItems[index].discount)
            };
            setItems(newItems);
        }
    };

    const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        if (isRestricted) return;
        const newItems = [...items];
        const item = newItems[index];
        (item as any)[field] = value;
        if (['quantity', 'unitPrice', 'discount', 'length', 'width', 'height'].includes(field as string)) {
            item.total = calculateLineTotal(item.quantity, item.length || 1, item.width || 1, item.height || 1, item.unitPrice, item.discount);
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        if (isRestricted) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSaveClientFromPOS = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClient.name || !newClient.vatNumber) return alert('Contribuinte e Nome são obrigatórios');

        setIsCreatingClient(true);
        try {
            const { data, error } = await supabase
                .from('clientes')
                .insert({
                    nome: newClient.name,
                    nif: newClient.vatNumber,
                    email: newClient.email,
                    telefone: newClient.phone,
                    endereco: newClient.address,
                    localidade: newClient.city,
                    codigo_postal: newClient.postalCode,
                    provincia: newClient.province,
                    municipio: newClient.municipality,
                    pais: 'Angola',
                    web_page: newClient.webPage,
                    tipo_cliente: newClient.clientType,
                    saldo_inicial: Number(newClient.initialBalance || 0),
                    empresa_id: currentCompany?.id || '00000000-0000-0000-0000-000000000001'
                })
                .select();

            if (error) throw error;
            const saved = data[0];
            const mappedClient: Client = {
                id: saved.id,
                name: saved.nome,
                vatNumber: saved.nif,
                email: saved.email || '',
                phone: saved.telefone || '',
                address: saved.endereco || '',
                city: saved.localidade || '',
                country: 'Angola',
                province: saved.provincia || '',
                accountBalance: 0,
                initialBalance: Number(saved.saldo_inicial || 0),
                clientType: saved.tipo_cliente || 'não grupo nacional',
                transactions: []
            };
            onSaveClient(mappedClient);
            setClientId(saved.id);
            setShowClientModal(false);
            alert("Cliente registado e selecionado!");
        } catch (err: any) {
            alert("Erro ao registar cliente: " + err.message);
        } finally {
            setIsCreatingClient(false);
        }
    };

    const handleSave = (action?: 'PRINT' | 'CERTIFY') => {
        if (!clientId) return alert("Erro: Deve selecionar um Cliente.");
        if (!selectedSeriesId) return alert("Erro: Deve selecionar uma Série Fiscal.");
        if (items.length === 0) return alert("Erro: O documento deve conter pelo menos um item.");

        if (isManualSeries && action === 'CERTIFY') {
            if (!manualNumber) return alert("Erro: Número do Documento é obrigatório para séries de recuperação.");
            if (!manualHash) return alert("Erro: Código Hash é obrigatório para séries de recuperação.");
        }

        const newInvoice: Invoice = {
            id: initialData?.id || generateId(),
            type: invoiceType,
            seriesId: selectedSeriesId,
            number: isManualSeries ? manualNumber : (initialData?.number || '---'),
            hash: isManualSeries ? manualHash : (initialData?.hash || ''),
            date,
            time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
            dueDate,
            accountingDate,
            clientId,
            clientName: clients.find(c => c.id === clientId)?.name || 'Cliente Final',
            clientNif: clients.find(c => c.id === clientId)?.vatNumber,
            items,
            subtotal,
            globalDiscount,
            taxRate: 14,
            taxAmount,
            withholdingAmount,
            retentionType,
            retentionAmount,
            total,
            currency,
            exchangeRate,
            contraValue,
            status: (invoiceType === InvoiceType.FR || invoiceType === InvoiceType.RG || invoiceType === InvoiceType.VD) ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
            notes,
            isCertified: isRestricted,
            companyId: currentCompany?.id || '',
            workLocationId,
            paymentMethod: paymentMethod || undefined,
            cashRegisterId,
            operatorName: currentUser,
            typology,
            source: 'MANUAL'
        };
        onSave(newInvoice, selectedSeriesId, action);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
            {showClientModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-slate-900 text-white p-5 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="font-bold text-lg flex items-center gap-2 uppercase tracking-tighter"><UserPlus size={20} /> Registar Cliente na Cloud</h3>
                            <button onClick={() => setShowClientModal(false)} className="hover:bg-red-600 p-1 rounded-full transition"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveClientFromPOS} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Contribuinte (NIF) *</label>
                                <input required className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600 font-mono font-bold" placeholder="999999999" value={newClient.vatNumber} onChange={e => setNewClient({ ...newClient, vatNumber: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo do Cliente *</label>
                                <input required className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600 font-bold" placeholder="Nome Comercial ou Próprio" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Morada</label>
                                <input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} />
                            </div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Localidade</label><input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" value={newClient.city} onChange={e => setNewClient({ ...newClient, city: e.target.value })} /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Código Postal</label><input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" value={newClient.postalCode} onChange={e => setNewClient({ ...newClient, postalCode: e.target.value })} /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Província</label><input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" value={newClient.province} onChange={e => setNewClient({ ...newClient, province: e.target.value })} /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Município</label><input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" value={newClient.municipality} onChange={e => setNewClient({ ...newClient, municipality: e.target.value })} /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">País</label><input className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 outline-none" value="Angola" readOnly /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Telefone</label><input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" placeholder="(+244) 000 000 000" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Email</label><input type="email" className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WebPage</label><input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600" value={newClient.webPage} onChange={e => setNewClient({ ...newClient, webPage: e.target.value })} /></div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Saldo Inicial (Kz)</label>
                                <input type="number" className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600 font-bold" value={newClient.initialBalance} onChange={e => setNewClient({ ...newClient, initialBalance: Number(e.target.value) })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tipo de Cliente</label>
                                <select className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-600 font-bold" value={newClient.clientType} onChange={e => setNewClient({ ...newClient, clientType: e.target.value })}>
                                    <option value="nacional">nacional</option>
                                    <option value="não grupo nacional">não grupo nacional</option>
                                    <option value="estrangeiro">estrangeiro</option>
                                    <option value="associados">associados</option>
                                    <option value="outros">outros</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowClientModal(false)} className="px-8 py-3 border-2 border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50">Cancelar</button>
                                <button type="submit" disabled={isCreatingClient} className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                                    {isCreatingClient ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Registar Agora
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-blue-600" /> Novo Documento
                        <button onClick={() => setShowClientModal(true)} className="ml-2 p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm border border-blue-200" title="Criar Cliente">
                            <UserPlus size={16} />
                        </button>
                    </h1>
                    <p className="text-xs text-slate-500">Emissão de Faturas e Documentos Fiscais</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border transition-all shadow-sm flex items-center gap-2">
                        <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
                    </button>
                    <button onClick={onViewList} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 border"><List size={18} /></button>
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
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Tipo</label>
                                    <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as InvoiceType)} disabled={isRestricted}>
                                        {Object.values(InvoiceType).filter(t => t !== InvoiceType.RG).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                {isManualSeries && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-orange-600 uppercase block mb-1 flex items-center gap-1"><Hash size={10} /> Número do Documento (Manual) *</label>
                                            <input className={`w-full border-2 p-2.5 rounded-2xl outline-none ${!manualNumber ? 'border-red-300' : 'border-orange-200'}`} placeholder="Ex: FT S/120" value={manualNumber} onChange={e => setManualNumber(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-orange-600 uppercase block mb-1 flex items-center gap-1"><ShieldCheck size={10} /> Código Hash (AGT) *</label>
                                            <input className={`w-full border-2 p-2.5 rounded-2xl outline-none ${!manualHash ? 'border-red-300' : 'border-orange-200'}`} placeholder="Assinatura Digital" value={manualHash} onChange={e => setManualHash(e.target.value)} />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1"><Calendar size={10} /> Data Emissão</label>
                                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1"><Calendar size={10} /> Data Contabilística</label>
                                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none bg-blue-50" value={accountingDate} onChange={e => setAccountingDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1"><Calendar size={10} /> Data Vencimento</label>
                                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none bg-orange-50" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                                </div>

                                {showPaymentFields && (
                                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1 flex items-center gap-1"><CreditCard size={10} /> Forma Pagamento</label>
                                            <select className="w-full border border-emerald-200 p-2.5 rounded-2xl bg-white outline-none font-bold" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} required={showPaymentFields}>
                                                <option value="">Selecione...</option>
                                                <option value="CASH">Dinheiro (AOA)</option>
                                                <option value="MULTICAIXA">Multicaixa</option>
                                                <option value="TRANSFER">Transferência</option>
                                                <option value="OTHERS">Outros</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1 flex items-center gap-1"><MapPin size={10} /> Caixa de Recebimento</label>
                                            <select className="w-full border border-emerald-200 p-2.5 rounded-2xl bg-white outline-none font-bold" value={cashRegisterId} onChange={e => setCashRegisterId(e.target.value)} required={showPaymentFields}>
                                                <option value="">Selecione...</option>
                                                {cashRegisters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* DADOS DO CLIENTE */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('clientData')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                            <span className="font-bold text-sm uppercase flex items-center gap-2"><Users size={16} className="text-green-600" /> Seleção de Cliente</span>
                            {expandedSections.clientData ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.clientData && (
                            <div className="p-6 bg-white animate-in slide-in-from-top-2 space-y-4">
                                <div>
                                    <SearchableSelect
                                        label="Cliente *"
                                        placeholder="Pesquisar cliente por nome ou NIF..."
                                        options={clients.map(c => ({ id: c.id, label: c.name, sublabel: `NIF: ${c.vatNumber}` }))}
                                        value={clientId}
                                        onChange={setClientId}
                                        disabled={isRestricted}
                                        className={!clientId ? 'ring-1 ring-red-300 rounded-2xl' : ''}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <SearchableSelect
                                            label="Série Fiscal *"
                                            placeholder="Selecionar série..."
                                            options={allowedSeries.map(s => ({ id: s.id, label: `${s.name} (${s.code})`, sublabel: `Tipo: ${s.type} | Ano: ${s.year}` }))}
                                            value={selectedSeriesId}
                                            onChange={setSelectedSeriesId}
                                            disabled={isRestricted}
                                            className={!selectedSeriesId ? 'ring-1 ring-red-300 rounded-2xl' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Local de Trabalho</label>
                                        <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50 font-bold text-sm" value={workLocationId} onChange={e => setWorkLocationId(e.target.value)} disabled={isRestricted}>
                                            <option value="">Sem Local Associado</option>
                                            {workLocations.map(wl => <option key={wl.id} value={wl.id}>{wl.name}</option>)}
                                        </select>
                                    </div>
                                </div>
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
                                {!isRestricted && (
                                    <div className="flex justify-end mb-4">
                                        <button onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2">
                                            <Plus size={14} /> Adicionar Item
                                        </button>
                                    </div>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="p-3 w-10 text-center"></th>
                                                <th className="p-3 w-28">Ref</th>
                                                <th className="p-3">Artigo / Descrição</th>
                                                <th className="p-3 w-20 text-center bg-blue-100 text-blue-900 border-x border-slate-200 uppercase tracking-tighter">Quantidade</th>
                                                <th className="p-3 w-32 text-right bg-blue-100 text-blue-900 border-x border-slate-200 uppercase tracking-tighter">Valor Unitário</th>
                                                <th className="p-3 w-32 text-center">Tipo de Artigo</th>
                                                <th className="p-3 w-32 text-center">Taxa Imposto</th>
                                                <th className="p-3 w-20 text-center">Unidade</th>
                                                <th className="p-3 w-16 text-center">Desc%</th>
                                                <th className="p-3 w-28 text-right">Total</th>
                                                {!isRestricted && <th className="p-3 w-10"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((item, index) => (
                                                <React.Fragment key={item.id}>
                                                    <tr className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="p-2 text-center"><button onClick={() => handleUpdateItem(index, 'showMetrics', !item.showMetrics)} className={`p-1.5 rounded-lg transition-all ${item.showMetrics ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-transparent text-slate-300 hover:text-blue-400'}`}><Ruler size={16} /></button></td>
                                                        <td className="p-2"><input className="w-full p-1 border border-slate-200 rounded text-[10px] font-mono focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Referência" value={item.reference || ''} onChange={e => handleUpdateItem(index, 'reference', e.target.value)} disabled={isRestricted} /></td>
                                                        <td className="p-2">
                                                            <div className="flex flex-col gap-1 w-full relative">
                                                                {item.type === 'PRODUCT' && (
                                                                    <select
                                                                        className="w-full p-1.5 border border-slate-200 rounded text-[11px] focus:ring-1 focus:ring-blue-500 outline-none font-black text-blue-800 bg-blue-50/50 appearance-none"
                                                                        onChange={(e) => handleProductSelect(index, e.target.value)}
                                                                        value={item.productId || ''}
                                                                        disabled={isRestricted}
                                                                    >
                                                                        <option value="">-- SELECIONAR ARTIGO --</option>
                                                                        {products.map(p => (
                                                                            <option key={p.id} value={p.id}>
                                                                                {p.name} | STOCK: {p.stock}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                                <input className="w-full p-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-[11px] font-bold" placeholder="Descrição do item *..." value={item.description} onChange={(e) => handleUpdateItem(index, 'description', e.target.value)} disabled={isRestricted} />
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-center bg-blue-50/50 border-x border-slate-100">
                                                            <input
                                                                type="number"
                                                                className="w-full p-2 text-center border-2 border-blue-200 rounded-xl bg-white text-sm font-black text-blue-800 focus:border-blue-500 shadow-inner"
                                                                placeholder="Qtd"
                                                                value={item.quantity}
                                                                onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value))}
                                                                disabled={isRestricted}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right bg-blue-50/50 border-x border-slate-100">
                                                            <input
                                                                type="number"
                                                                className="w-full p-2 text-right border-2 border-blue-200 rounded-xl bg-white text-sm font-black text-blue-800 focus:border-blue-500 shadow-inner"
                                                                placeholder="Valor Unit."
                                                                value={item.unitPrice}
                                                                onChange={(e) => handleUpdateItem(index, 'unitPrice', Number(e.target.value))}
                                                                disabled={isRestricted}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <div className="flex border border-slate-200 rounded-lg overflow-hidden h-8">
                                                                <button
                                                                    type="button"
                                                                    className={`flex-1 text-[8px] font-black uppercase transition-all ${item.type === 'PRODUCT' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}
                                                                    onClick={() => handleUpdateItem(index, 'type', 'PRODUCT')}
                                                                    disabled={isRestricted}
                                                                >
                                                                    Prod
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`flex-1 text-[8px] font-black uppercase transition-all ${item.type === 'SERVICE' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}
                                                                    onClick={() => handleUpdateItem(index, 'type', 'SERVICE')}
                                                                    disabled={isRestricted}
                                                                >
                                                                    Serv
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <select
                                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 appearance-none text-center"
                                                                value={item.taxRate}
                                                                onChange={(e) => handleUpdateItem(index, 'taxRate', Number(e.target.value))}
                                                                disabled={isRestricted}
                                                            >
                                                                <option value={14}>IVA 14%</option>
                                                                <option value={7}>IVA 7%</option>
                                                                <option value={5}>IVA 5%</option>
                                                                <option value={2}>IVA 2%</option>
                                                                <option value={0}>ISE 0%</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <select className="w-full p-1.5 border border-slate-200 rounded bg-transparent text-[10px] font-bold" value={item.unit || 'un'} onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)} disabled={isRestricted}>
                                                                <option value="un">un</option>
                                                                <option value="kg">kg</option>
                                                                <option value="cx">cx</option>
                                                                <option value="mês">mês</option>
                                                                <option value="dia">dia</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-center"><input type="number" className="w-full p-1.5 text-center border border-slate-200 rounded bg-white text-sm" value={item.discount} onChange={(e) => handleUpdateItem(index, 'discount', Number(e.target.value))} disabled={isRestricted} /></td>
                                                        <td className="p-2 text-right font-black text-slate-800 text-sm">{formatCurrency(item.total).replace('Kz', '')}</td>
                                                        {!isRestricted && <td className="p-2 text-center"><button onClick={() => handleRemoveItem(index)} className="text-slate-300 hover:text-red-500 p-1"><Trash size={16} /></button></td>}
                                                    </tr>
                                                    {item.showMetrics && (
                                                        <tr className="bg-blue-50/50 animate-in slide-in-from-top-2">
                                                            <td className="p-2 border-r border-blue-100"></td>
                                                            <td colSpan={10} className="p-3">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-2"><span className="text-[10px] font-black text-blue-600 uppercase">Volume:</span><Ruler size={14} className="text-blue-400" /></div>
                                                                    <div className="flex flex-wrap gap-4">
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">C (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.length || 1} onChange={e => handleUpdateItem(index, 'length', Number(e.target.value))} disabled={isRestricted} /></div>
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">L (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.width || 1} onChange={e => handleUpdateItem(index, 'width', Number(e.target.value))} disabled={isRestricted} /></div>
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">A (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.height || 1} onChange={e => handleUpdateItem(index, 'height', Number(e.target.value))} disabled={isRestricted} /></div>
                                                                        <div className="flex items-center gap-2 ml-4"><span className="text-[10px] font-bold text-slate-400 uppercase">Total m³:</span><span className="text-xs font-black text-blue-700">{(Number(item.length || 1) * Number(item.width || 1) * Number(item.height || 1)).toFixed(2)}</span></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td></td>
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
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Moeda</label>
                                        <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={currency} onChange={e => setCurrency(e.target.value)} disabled={isRestricted}>
                                            <option value="AOA">AOA (Kwanzas)</option><option value="USD">USD (Dólares)</option><option value="EUR">EUR (Euros)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Câmbio</label>
                                        <input type="number" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value))} disabled={isRestricted} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Contravalor ({currency})</label>
                                        <div className="w-full border border-slate-300 bg-slate-50 p-2.5 rounded-2xl font-bold text-slate-600">{formatCurrency(contraValue).replace('Kz', currency)}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1 flex items-center gap-1"><Tag size={12} /> Desconto Global (%)</label>
                                        <input type="number" className="w-full border-2 border-blue-100 p-2.5 rounded-2xl outline-none" value={globalDiscount} onChange={e => setGlobalDiscount(Number(e.target.value))} disabled={isRestricted} placeholder="0%" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-indigo-600 uppercase block mb-1 flex items-center gap-1"><Scale size={12} /> Retenção na Fonte (6,5%)</label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-100 p-2.5 rounded-2xl border border-slate-200"><input type="checkbox" checked={hasWithholding} readOnly className="w-4 h-4 accent-blue-600" /><span className="text-[10px] font-black text-slate-500 uppercase">Aplicação Automática AGT</span></label>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-blue-800 uppercase block mb-1 flex items-center gap-1"><ShieldCheck size={12} /> Cativação de IVA</label>
                                        <select
                                            className="w-full border-2 border-blue-100 p-2.5 rounded-2xl outline-none"
                                            value={retentionType}
                                            onChange={e => setRetentionType(e.target.value as any)}
                                            disabled={isRestricted}
                                        >
                                            <option value="NONE">Sem Cativação</option>
                                            <option value="CAT_50">Cativação 50%</option>
                                            <option value="CAT_100">Cativação 100%</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-200">
                                    <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-xl">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Subtotal</span>
                                        <span className="font-black text-sm text-slate-800">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {globalDiscount > 0 && (
                                        <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-xl">
                                            <span className="text-[10px] font-black text-red-500 uppercase">Desconto Global ({globalDiscount}%)</span>
                                            <span className="font-black text-sm text-red-600">-{formatCurrency(discountGlobalValue)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-xl">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Imposto (IVA)</span>
                                        <span className="font-black text-sm text-slate-800">{formatCurrency(taxAmount)}</span>
                                    </div>
                                    {hasWithholding && (
                                        <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-xl">
                                            <span className="text-[10px] font-black text-red-500 uppercase">Retenção na Fonte (6,5%)</span>
                                            <span className="font-black text-sm text-red-600">-{formatCurrency(withholdingAmount)}</span>
                                        </div>
                                    )}
                                    <div className="pt-6 mt-4 border-t-2 border-slate-900 flex flex-col items-end gap-1">
                                        <span className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em]">Total do Documento</span>
                                        <span className="font-black text-3xl text-blue-700 tracking-tighter leading-none flex items-baseline gap-1">
                                            <span className="text-sm font-bold opacity-50">Kz</span>
                                            {formatCurrency(total).replace('Kz', '').trim()}
                                        </span>
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
                                <textarea className="w-full border border-slate-300 p-3 rounded-2xl outline-none focus:border-blue-500 bg-slate-50 h-20 resize-none" placeholder="Notas do documento..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isRestricted}></textarea>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button onClick={onCancel} className="px-8 py-3 border-2 border-slate-200 rounded-xl font-black text-slate-400 uppercase text-[10px] hover:bg-white transition">Cancelar</button>
                    <button onClick={() => handleSave('CERTIFY')} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-black uppercase text-[10px] shadow-xl hover:bg-blue-700 transition flex items-center gap-2">
                        <Save size={16} /> Emitir Documento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceForm;
