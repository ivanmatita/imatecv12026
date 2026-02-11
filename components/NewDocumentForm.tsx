import React, { useState, useMemo } from 'react';
import {
    Client, Invoice, InvoiceItem, InvoiceType, Product, Warehouse,
    PaymentMethod, Company, TaxRate, Metric, InvoiceStatus,
    IntegrationStatus, WorkLocation, CashRegister, DocumentSeries
} from '../types';
import { generateId, formatCurrency } from '../utils';
import { Save, X, FileText, Briefcase, CreditCard, User, Plus, Ruler, Tag, Hash, ShieldCheck, MapPin, Calendar, DollarSign, Calculator } from 'lucide-react';

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

const NewDocumentForm: React.FC<NewDocumentFormProps> = ({
    onSave, onCancel, clients, products, workLocations, cashRegisters, series, warehouses, initialData, initialType, currentUser, currentCompany
}) => {
    const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'CLIENT' | 'ITEMS' | 'FINANCIAL'>('DOCUMENT');

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

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
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

    let taxAmount = taxableBase * 0.14; // 14% IVA
    if (formData.vatCativation === 'TOTAL') {
        taxAmount = 0;
    } else if (formData.vatCativation === 'PARCIAL') {
        taxAmount = taxAmount * 0.5;
    }

    const total = taxableBase + taxAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientId) return alert("Erro: Deve selecionar um Cliente.");
        if (!formData.seriesId) return alert("Erro: Deve selecionar uma Série Fiscal.");
        if (items.length === 0) return alert("Erro: O documento deve conter pelo menos um item.");

        const newInvoice: Invoice = {
            id: initialData?.id || generateId(),
            type: formData.invoiceType,
            seriesId: formData.seriesId,
            number: formData.manualNumber || '---',
            hash: formData.manualHash || '',
            date: formData.date,
            time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
            dueDate: formData.dueDate,
            accountingDate: formData.accountingDate,
            clientId: formData.clientId,
            clientName: clients.find(c => c.id === formData.clientId)?.name || 'Cliente Final',
            clientNif: clients.find(c => c.id === formData.clientId)?.vatNumber,
            items,
            subtotal,
            globalDiscount: formData.globalDiscount,
            taxRate: 14,
            taxAmount,
            total,
            currency: formData.currency,
            exchangeRate: formData.exchangeRate,
            contraValue: total * formData.exchangeRate,
            status: InvoiceStatus.PENDING,
            notes: formData.notes,
            isCertified: false,
            companyId: currentCompany?.id || '',
            workLocationId: formData.workLocationId,
            paymentMethod: formData.paymentMethod || undefined,
            cashRegisterId: formData.cashRegisterId,
            operatorName: currentUser,
            typology: 'Geral',
            source: 'MANUAL'
        };

        onSave(newInvoice, formData.seriesId, 'CERTIFY');
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

    const SelectField = ({ label, field, options, required = false }: { label: string, field: string, options: { value: string, label: string }[], required?: boolean }) => (
        <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={(formData as any)[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-white"
                required={required}
            >
                <option value="">Selecione...</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
                                <SelectField
                                    label="Tipo de Documento"
                                    field="invoiceType"
                                    options={Object.values(InvoiceType).map(t => ({ value: t, label: t }))}
                                    required
                                />
                                <InputField label="Data de Emissão" field="date" type="date" required />
                                <InputField label="Data Contabilística" field="accountingDate" type="date" />
                                <InputField label="Data de Vencimento" field="dueDate" type="date" />
                                <SelectField
                                    label="Forma de Pagamento"
                                    field="paymentMethod"
                                    options={[
                                        { value: 'CASH', label: 'Dinheiro (AOA)' },
                                        { value: 'MULTICAIXA', label: 'Multicaixa' },
                                        { value: 'TRANSFER', label: 'Transferência' },
                                        { value: 'OTHERS', label: 'Outros' }
                                    ]}
                                />
                                <SelectField
                                    label="Caixa de Recebimento"
                                    field="cashRegisterId"
                                    options={cashRegisters.map(c => ({ value: c.id, label: c.name }))}
                                />
                            </div>
                        )}

                        {activeTab === 'CLIENT' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <div className="col-span-2">
                                    <SelectField
                                        label="Cliente"
                                        field="clientId"
                                        options={clients.map(c => ({ value: c.id, label: `${c.name} (NIF: ${c.vatNumber})` }))}
                                        required
                                    />
                                </div>
                                <SelectField
                                    label="Série Fiscal"
                                    field="seriesId"
                                    options={series.filter(s => s.isActive).map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                                    required
                                />
                                <SelectField
                                    label="Local de Trabalho"
                                    field="workLocationId"
                                    options={workLocations.map(w => ({ value: w.id, label: w.name }))}
                                />
                                <InputField label="Número Manual (Série Manual)" field="manualNumber" />
                                <InputField label="Código Hash (Série Manual)" field="manualHash" />
                            </div>
                        )}

                        {activeTab === 'ITEMS' && (
                            <div className="animate-in fade-in space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-slate-700">Lista de Itens</h3>
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
                                                <div className="col-span-5">
                                                    <input
                                                        type="text"
                                                        placeholder="Descrição do item..."
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Qtd"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Preço"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded text-right font-mono font-bold text-slate-600 text-sm">
                                                        {formatCurrency(item.total)}
                                                    </div>
                                                </div>
                                                <div className="col-span-1 flex items-center gap-1">
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

                                            {item.showMetrics && (
                                                <div className="grid grid-cols-4 gap-3 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-2">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tipologia</label>
                                                        <select value={item.typology || 'Geral'} onChange={(e) => handleItemChange(index, 'typology', e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded font-bold text-xs">
                                                            <option value="Geral">Geral</option>
                                                            <option value="Serviço">Serviço</option>
                                                            <option value="Produto">Produto</option>
                                                        </select>
                                                    </div>
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
                                    <SelectField
                                        label="Moeda"
                                        field="currency"
                                        options={[
                                            { value: 'AOA', label: 'AOA (Kwanzas)' },
                                            { value: 'USD', label: 'USD (Dólares)' },
                                            { value: 'EUR', label: 'EUR (Euros)' }
                                        ]}
                                    />
                                    <InputField label="Taxa de Câmbio" field="exchangeRate" type="number" />
                                    <InputField label="Desconto Global (%)" field="globalDiscount" type="number" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <SelectField
                                            label="Cativação de IVA"
                                            field="vatCativation"
                                            options={[
                                                { value: 'NONE', label: 'Nenhuma' },
                                                { value: 'TOTAL', label: 'Total (100%)' },
                                                { value: 'PARCIAL', label: 'Parcial (50%)' }
                                            ]}
                                        />
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
                        form="document-form"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2"
                    >
                        <Save size={18} /> Gravar Cloud
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewDocumentForm;
