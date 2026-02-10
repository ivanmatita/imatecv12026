import React, { useState, useEffect, useMemo } from 'react';
import { Supplier, Purchase, PurchaseItem, PurchaseType, Product, Warehouse, PaymentMethod, Company } from '../types';
import { generateId, formatCurrency, formatDate } from '../utils';
import { Plus, Trash, Save, ArrowLeft, FileText, List, X, Calendar, ChevronDown, ChevronUp, Ruler, Users, Briefcase, Percent, DollarSign, RefreshCw, Scale, ShieldCheck, Hash, Tag, UserPlus, Loader2, Package, AlertCircle, MapPin } from 'lucide-react';

interface PurchaseFormProps {
    onSave: (purchase: Purchase) => void;
    onCancel: () => void;
    onViewList: () => void;
    suppliers: Supplier[];
    products: Product[];
    warehouses: Warehouse[];
    initialData?: Partial<Purchase>;
    currentUser?: string;
    currentUserId?: string;
    currentCompany?: Company;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({
    onSave, onCancel, onViewList, suppliers, products, warehouses, initialData, currentUser, currentUserId, currentCompany
}) => {
    const [supplierId, setSupplierId] = useState(initialData?.supplierId || '');
    const [purchaseType, setPurchaseType] = useState<PurchaseType>(initialData?.type || PurchaseType.FT);
    const [documentNumber, setDocumentNumber] = useState(initialData?.documentNumber || '');
    const [documentHash, setDocumentHash] = useState(initialData?.documentHash || '');
    const [warehouseId, setWarehouseId] = useState(initialData?.warehouseId || '');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(initialData?.paymentMethod || '');

    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(initialData?.date || today);
    const [dueDate, setDueDate] = useState(initialData?.dueDate || today);
    const [accountingDate, setAccountingDate] = useState(initialData?.accountingDate || today);

    const [currency, setCurrency] = useState<string>(initialData?.currency || 'AOA');
    const [exchangeRate, setExchangeRate] = useState<number>(initialData?.exchangeRate || 1);

    // Seções expansíveis
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        documentData: true,
        supplierData: true,
        items: true,
        financial: false,
        notes: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [items, setItems] = useState<PurchaseItem[]>(() => {
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
            total: i.total !== undefined ? i.total : ((i.quantity || 1) * (i.length || 1) * (i.width || 1) * (i.height || 1) * (i.unitPrice || 0) * (1 - (i.discount || 0) / 100))
        }));
    });

    const [globalDiscount, setGlobalDiscount] = useState(initialData?.globalDiscount || 0);
    const [notes, setNotes] = useState(initialData?.notes || '');

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

    const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);
    const totalTaxAmount = useMemo(() => items.reduce((acc, item) => acc + (item.total * (item.taxRate / 100)), 0), [items]);
    const discountGlobalValue = subtotal * (globalDiscount / 100);
    const totalFinal = (subtotal + totalTaxAmount) - discountGlobalValue;
    const contraValue = totalFinal * exchangeRate;

    const handleAddItem = () => {
        setItems([...items, { id: generateId(), description: '', reference: '', quantity: 1, length: 1, width: 1, height: 1, unit: 'un', unitPrice: 0, discount: 0, taxRate: 14, total: 0, showMetrics: false }]);
    };

    const handleProductSelect = (index: number, productId: string) => {
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
                total: calculateLineTotal(newItems[index].quantity, newItems[index].length, newItems[index].width, newItems[index].height, unitPrice, newItems[index].discount)
            };
            setItems(newItems);
        }
    };

    const handleUpdateItem = (index: number, field: keyof PurchaseItem, value: any) => {
        const newItems = [...items];
        const item = newItems[index];
        (item as any)[field] = value;
        if (['quantity', 'unitPrice', 'discount', 'length', 'width', 'height'].includes(field as string)) {
            item.total = calculateLineTotal(item.quantity, item.length || 1, item.width || 1, item.height || 1, item.unitPrice, item.discount);
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!supplierId) return alert("Erro: Deve selecionar um Fornecedor.");
        if (!documentNumber) return alert("Erro: Número do Documento é obrigatório.");
        if (items.length === 0) return alert("Erro: O documento deve conter pelo menos um item.");

        const newPurchase: Purchase = {
            id: initialData?.id || generateId(),
            type: purchaseType,
            documentNumber,
            documentHash,
            date,
            time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
            dueDate,
            accountingDate,
            supplierId,
            supplierName: suppliers.find(s => s.id === supplierId)?.name || 'Fornecedor',
            supplierNif: suppliers.find(s => s.id === supplierId)?.vatNumber,
            items,
            subtotal,
            globalDiscount,
            taxAmount: totalTaxAmount,
            total: totalFinal,
            currency,
            exchangeRate,
            contraValue,
            notes,
            companyId: currentCompany?.id || '',
            warehouseId,
            paymentMethod: paymentMethod || undefined,
            operatorName: currentUser,
            source: 'MANUAL'
        };
        onSave(newPurchase);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-blue-600" /> Registar Compra
                    </h1>
                    <p className="text-xs text-slate-500">Registo de Documentos de Compra e Fornecedores</p>
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
                    <h2 className="font-black uppercase tracking-widest text-sm">Ficha de Compra - Edição</h2>
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
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Tipo de Documento</label>
                                    <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={purchaseType} onChange={(e) => setPurchaseType(e.target.value as PurchaseType)}>
                                        {Object.values(PurchaseType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Armazém de Destino</label>
                                    <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
                                        <option value="">Sem Armazém Associado</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-orange-600 uppercase block mb-1 flex items-center gap-1"><Hash size={10} /> Número do Documento *</label>
                                    <input className={`w-full border-2 p-2.5 rounded-2xl outline-none ${!documentNumber ? 'border-red-300' : 'border-orange-200'}`} placeholder="Ex: FT S/120" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-orange-600 uppercase block mb-1 flex items-center gap-1"><ShieldCheck size={10} /> Código Hash (AGT)</label>
                                    <input className="w-full border-2 p-2.5 rounded-2xl outline-none border-orange-200" placeholder="Assinatura Digital (Opcional)" value={documentHash} onChange={e => setDocumentHash(e.target.value)} />
                                </div>

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

                                <div>
                                    <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Forma Pagamento</label>
                                    <select className="w-full border border-emerald-200 p-2.5 rounded-2xl bg-emerald-50 outline-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}>
                                        <option value="">Selecione...</option>
                                        <option value="CASH">Dinheiro (AOA)</option>
                                        <option value="MULTICAIXA">Multicaixa</option>
                                        <option value="TRANSFER">Transferência</option>
                                        <option value="OTHERS">Outros</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DADOS DO FORNECEDOR */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('supplierData')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                            <span className="font-bold text-sm uppercase flex items-center gap-2"><Users size={16} className="text-green-600" /> Seleção de Fornecedor</span>
                            {expandedSections.supplierData ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.supplierData && (
                            <div className="p-6 bg-white animate-in slide-in-from-top-2">
                                <select className={`w-full border p-3 rounded-2xl outline-none ${!supplierId ? 'border-red-300' : 'border-slate-300'}`} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                                    <option value="">-- SELECIONAR FORNECEDOR (GESTÃO DE FORNECEDORES) * --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} (NIF: {s.vatNumber})</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* ITENS DO DOCUMENTO */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={() => toggleSection('items')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                            <span className="font-bold text-sm uppercase flex items-center gap-2"><List size={16} className="text-purple-600" /> Itens da Compra</span>
                            {expandedSections.items ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {expandedSections.items && (
                            <div className="p-6 bg-white animate-in slide-in-from-top-2">
                                <button onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2 mb-4">
                                    <Plus size={14} /> Adicionar Linha
                                </button>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="p-3 w-10 text-center"></th>
                                                <th className="p-3 w-32">Ref</th>
                                                <th className="p-3">Artigo / Descrição</th>
                                                <th className="p-3 w-20 text-center">Qtd</th>
                                                <th className="p-3 w-28 text-center">Unidade</th>
                                                <th className="p-3 w-28 text-right">Preço Un.</th>
                                                <th className="p-3 w-32 text-center">IVA Aplicado</th>
                                                <th className="p-3 w-16 text-center">Desc%</th>
                                                <th className="p-3 w-28 text-right">Total</th>
                                                <th className="p-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((item, index) => (
                                                <React.Fragment key={item.id}>
                                                    <tr className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="p-2 text-center"><button onClick={() => handleUpdateItem(index, 'showMetrics', !item.showMetrics)} className={`p-1.5 rounded-lg transition-all ${item.showMetrics ? 'bg-blue-100 text-blue-600 rotate-180' : 'text-slate-300 hover:text-blue-500'}`}><Ruler size={16} /></button></td>
                                                        <td className="p-2"><input className="w-full p-1 border border-slate-200 rounded text-[10px] font-mono focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Referência" value={item.reference || ''} onChange={e => handleUpdateItem(index, 'reference', e.target.value)} /></td>
                                                        <td className="p-2">
                                                            <div className="flex flex-col gap-1">
                                                                <select className="w-full p-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none font-bold text-blue-700 bg-blue-50" onChange={(e) => handleProductSelect(index, e.target.value)} value={item.productId || ''}>
                                                                    <option value="">-- SELECIONAR ARTIGO (STOCK REAL) * --</option>
                                                                    {products.map(p => (
                                                                        <option key={p.id} value={p.id}>
                                                                            {p.id.substring(0, 8).toUpperCase()} | {p.name} | STOCK: {p.stock} {p.unit}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <input className="w-full p-1 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-xs font-bold" placeholder="Descrição do item *..." value={item.description} onChange={(e) => handleUpdateItem(index, 'description', e.target.value)} />
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-center"><input type="number" className="w-full p-1.5 text-center border border-slate-200 rounded bg-white text-sm font-bold" value={item.quantity} onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value))} /></td>
                                                        <td className="p-2 text-center">
                                                            <select className="w-full p-1.5 border border-slate-200 rounded bg-white text-[10px] font-bold" value={item.unit || 'un'} onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}>
                                                                <option value="un">un</option>
                                                                <option value="kg">kg</option>
                                                                <option value="mês">mês</option>
                                                                <option value="dia">dia</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-right"><input type="number" className="w-full p-1.5 text-right border border-slate-200 rounded bg-white text-sm font-bold" value={item.unitPrice} onChange={(e) => handleUpdateItem(index, 'unitPrice', Number(e.target.value))} /></td>
                                                        <td className="p-2 text-center">
                                                            <select className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs font-bold" value={item.taxRate} onChange={(e) => handleUpdateItem(index, 'taxRate', Number(e.target.value))}>
                                                                <option value={14}>IVA 14%</option>
                                                                <option value={7}>IVA 7%</option>
                                                                <option value={0}>IVA Isento</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 text-center"><input type="number" className="w-full p-1.5 text-center border border-slate-200 rounded bg-white text-sm" value={item.discount} onChange={(e) => handleUpdateItem(index, 'discount', Number(e.target.value))} /></td>
                                                        <td className="p-2 text-right font-black text-slate-700 text-sm">{formatCurrency(item.total).replace('Kz', '')}</td>
                                                        <td className="p-2 text-center"><button onClick={() => handleRemoveItem(index)} className="text-slate-300 hover:text-red-500 p-1"><Trash size={16} /></button></td>
                                                    </tr>
                                                    {item.showMetrics && (
                                                        <tr className="bg-blue-50/50 animate-in slide-in-from-top-2">
                                                            <td className="p-2 border-r border-blue-100"></td>
                                                            <td colSpan={8} className="p-3">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-2"><span className="text-[10px] font-black text-blue-600 uppercase">Volume:</span><Ruler size={14} className="text-blue-400" /></div>
                                                                    <div className="flex flex-wrap gap-4">
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">C (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.length || 1} onChange={e => handleUpdateItem(index, 'length', Number(e.target.value))} /></div>
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">L (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.width || 1} onChange={e => handleUpdateItem(index, 'width', Number(e.target.value))} /></div>
                                                                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase">A (m)</label><input type="number" className="w-20 p-1 border border-blue-200 rounded bg-white text-xs font-bold" value={item.height || 1} onChange={e => handleUpdateItem(index, 'height', Number(e.target.value))} /></div>
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
                                        <select className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={currency} onChange={e => setCurrency(e.target.value)}>
                                            <option value="AOA">AOA (Kwanzas)</option><option value="USD">USD (Dólares)</option><option value="EUR">EUR (Euros)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Câmbio</label>
                                        <input type="number" className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Contravalor ({currency})</label>
                                        <div className="w-full border border-slate-300 bg-slate-50 p-2.5 rounded-2xl font-bold text-slate-600">{formatCurrency(contraValue).replace('Kz', currency)}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1 flex items-center gap-1"><Tag size={12} /> Desconto Global (%)</label>
                                        <input type="number" className="w-full border-2 border-blue-100 p-2.5 rounded-2xl outline-none" value={globalDiscount} onChange={e => setGlobalDiscount(Number(e.target.value))} placeholder="0%" />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-slate-100 text-[10px] uppercase font-bold">
                                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                    {globalDiscount > 0 && <div className="flex justify-between text-red-600"><span>Desc. Global</span><span>-{formatCurrency(discountGlobalValue)}</span></div>}
                                    <div className="flex justify-between text-slate-600 pt-2"><span>Imposto (IVA)</span><span>{formatCurrency(totalTaxAmount)}</span></div>
                                    <div className="pt-4 mt-4 border-t-2 border-slate-800 flex flex-col items-end gap-1">
                                        <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">Valor Final</span>
                                        <span className="font-black text-xl text-blue-600 tracking-tighter leading-none">{formatCurrency(totalFinal)}</span>
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
                                <textarea className="w-full border border-slate-300 p-3 rounded-2xl outline-none focus:border-blue-500 bg-slate-50 h-20 resize-none" placeholder="Notas do documento..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button onClick={onCancel} className="px-8 py-3 border-2 border-slate-200 rounded-xl font-black text-slate-400 uppercase text-[10px] hover:bg-white transition">Cancelar</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-black uppercase text-[10px] shadow-xl hover:bg-blue-700 transition flex items-center gap-2">
                        <Save size={16} /> Gravar Compra Cloud
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseForm;
