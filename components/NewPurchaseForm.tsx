
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Supplier, Purchase, PurchaseItem, PurchaseType, Product, Warehouse, PaymentMethod, Company, TaxRate, WorkLocation } from '../types';
import { generateId, formatCurrency } from '../utils';
import { Save, X, FileText, Briefcase, CreditCard, User, Plus, Ruler, Tag, Hash, ShieldCheck, MapPin, Calendar, DollarSign, ShoppingBag, ChevronDown, Search } from 'lucide-react';

interface NewPurchaseFormProps {
    onSave: (purchase: Purchase) => void;
    onCancel: () => void;
    suppliers: Supplier[];
    products: Product[];
    warehouses: Warehouse[];
    workLocations?: WorkLocation[];
    initialData?: Partial<Purchase>;
    currentUser?: string;
    currentUserId?: string;
    currentCompany?: Company;
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

const NewPurchaseForm: React.FC<NewPurchaseFormProps> = ({
    onSave, onCancel, suppliers, products, warehouses, workLocations = [], initialData, currentUser, currentCompany
}) => {
    const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'SUPPLIER' | 'ITEMS' | 'FINANCIAL'>('DOCUMENT');

    const [formData, setFormData] = useState({
        supplierId: initialData?.supplierId || '',
        purchaseType: initialData?.type || PurchaseType.FT,
        documentNumber: initialData?.documentNumber || '',
        hash: (initialData as any)?.hash || (initialData as any)?.documentHash || '',
        warehouseId: initialData?.warehouseId || '',
        workLocationId: (initialData as any)?.workLocationId || '',
        paymentMethod: initialData?.paymentMethod || '' as PaymentMethod | '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
        currency: initialData?.currency || 'AOA',
        exchangeRate: initialData?.exchangeRate || 1,
        globalDiscount: initialData?.globalDiscount || 0,
        notes: initialData?.notes || ''
    });

    const [items, setItems] = useState<PurchaseItem[]>(initialData?.items || []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddItem = () => {
        setItems([...items, {
            id: generateId(),
            description: '',
            reference: '',
            quantity: 1,
            unit: 'un',
            unitPrice: 0,
            discount: 0,
            taxRate: 14,
            total: 0,
            showMetrics: false,
            length: 1,
            width: 1,
            height: 1
        }]);
    };

    const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;

        // Recalcular total do item
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
    const taxAmount = taxableBase * 0.14; // Default 14%
    const total = taxableBase + taxAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplierId) return alert("Erro: Deve selecionar um Fornecedor.");
        if (!formData.documentNumber) return alert("Erro: Número do Documento é obrigatório.");
        if (items.length === 0) return alert("Erro: O documento deve conter pelo menos um item.");

        const newPurchase: Purchase = {
            id: initialData?.id || generateId(),
            type: formData.purchaseType,
            documentNumber: formData.documentNumber,
            hash: formData.hash,
            date: formData.date,
            dueDate: formData.dueDate,
            supplierId: formData.supplierId,
            supplier: suppliers.find(s => s.id === formData.supplierId)?.name || 'Fornecedor',
            nif: suppliers.find(s => s.id === formData.supplierId)?.vatNumber || '',
            items,
            subtotal,
            globalDiscount: formData.globalDiscount,
            taxAmount,
            total,
            currency: formData.currency,
            exchangeRate: formData.exchangeRate,
            status: 'PENDING',
            notes: formData.notes,
            warehouseId: formData.warehouseId,
            workLocationId: formData.workLocationId,
            paymentMethod: formData.paymentMethod || undefined,
            cashRegisterId: (initialData as any)?.cashRegisterId
        };

        onSave(newPurchase);
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-blue-600" />
                        {initialData ? 'Editar Compra' : 'Registar Compra'}
                    </h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    {[
                        { id: 'DOCUMENT', label: 'Documento', icon: FileText },
                        { id: 'SUPPLIER', label: 'Fornecedor', icon: User },
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
                    <form id="purchase-form" onSubmit={handleSubmit}>
                        {activeTab === 'DOCUMENT' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <SearchableSelect
                                    label="Tipo de Documento"
                                    value={formData.purchaseType}
                                    options={Object.values(PurchaseType).map(t => ({ value: t, label: t }))}
                                    onChange={(val) => handleChange('purchaseType', val)}
                                />
                                <InputField label="Número do Documento" field="documentNumber" required />
                                <InputField label="Código Hash (AGT)" field="hash" />
                                <SearchableSelect
                                    label="Armazém de Destino"
                                    value={formData.warehouseId}
                                    options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                                    onChange={(val) => handleChange('warehouseId', val)}
                                    placeholder="Sem Armazém Associado"
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
                            </div>
                        )}

                        {activeTab === 'SUPPLIER' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <div className="col-span-2">
                                    <SearchableSelect
                                        label="Fornecedor *"
                                        value={formData.supplierId}
                                        options={suppliers.map(s => ({ value: s.id, label: `${s.name} (NIF: ${s.vatNumber})` }))}
                                        onChange={(val) => handleChange('supplierId', val)}
                                        placeholder="Pesquisar fornecedor..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'ITEMS' && (
                            <div className="animate-in fade-in space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-slate-700">Itens da Compra</h3>
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
                                                <div className="col-span-12 md:col-span-4">
                                                    <SearchableSelect
                                                        label={`Artigo ${index + 1}`}
                                                        value={item.productId || ''}
                                                        options={products.map(p => ({ value: p.id, label: `${p.name} | STOCK: ${p.stock}` }))}
                                                        onChange={(val) => {
                                                            const product = products.find(p => p.id === val);
                                                            if (product) {
                                                                const newItems = [...items];
                                                                newItems[index] = {
                                                                    ...newItems[index],
                                                                    productId: product.id,
                                                                    description: product.name,
                                                                    unit: product.unit || 'un',
                                                                    unitPrice: product.costPrice || 0
                                                                };
                                                                setItems(newItems);
                                                            }
                                                        }}
                                                        placeholder="Selecione Artigo..."
                                                        className="mb-0"
                                                    />
                                                </div>
                                                <div className="col-span-6 md:col-span-3">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Descrição Alternativa</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Descrição..."
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-3 md:col-span-1">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Qtd</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Qtd"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-3 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Preço Un.</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Preço"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-12 md:col-span-2 flex items-center justify-between mt-6 md:mt-0">
                                                    <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded text-right font-mono font-bold text-slate-600 text-sm">
                                                        {formatCurrency(item.total)}
                                                    </div>
                                                    <div className="flex gap-1 ml-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleItemChange(index, 'showMetrics', !item.showMetrics)}
                                                            className={`p-1.5 rounded transition-all ${item.showMetrics ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:text-blue-500'}`}
                                                            title="Dimensões"
                                                        >
                                                            <Ruler size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
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
                                        options={[
                                            { value: 'AOA', label: 'AOA (Kwanzas)' },
                                            { value: 'USD', label: 'USD (Dólares)' },
                                            { value: 'EUR', label: 'EUR (Euros)' }
                                        ]}
                                        onChange={(val) => handleChange('currency', val)}
                                    />
                                    <InputField label="Taxa de Câmbio" field="exchangeRate" type="number" />
                                    <InputField label="Desconto Global (%)" field="globalDiscount" type="number" />
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
                                            <span className="text-slate-400 font-bold text-xs uppercase">Imposto (IVA 14%)</span>
                                            <span className="font-mono text-sm">{formatCurrency(taxAmount)}</span>
                                        </div>
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
                        form="purchase-form"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2"
                    >
                        <Save size={18} /> Gravar Cloud
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewPurchaseForm;
