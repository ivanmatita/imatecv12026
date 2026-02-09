import React, { useState, useMemo } from 'react';
import { Supplier, Invoice, InvoiceStatus, InvoiceType } from '../types';
import { Search, Plus, RefreshCw, Trash2, Edit, FileText, Filter, MoreHorizontal, Building2, Phone, Mail, MapPin, Database, UserPlus, Truck, List } from 'lucide-react';
import { IntegrationAssistant } from '../services';
import AccountExtract from './AccountExtract';

interface SupplierListProps {
    suppliers: Supplier[];
    onSaveSupplier: (supplier: Supplier) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onSaveSupplier }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'LIST' | 'FORM' | 'EXTRACT'>('LIST');
    const [formData, setFormData] = useState<Partial<Supplier>>({});
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    // ... (existing filteredSuppliers, loadSuppliers, handleSubmit)

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val);
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.vatNumber.includes(searchTerm)
        );
    }, [suppliers, searchTerm]);

    const loadSuppliers = async () => {
        setIsLoading(true);
        try {
            await IntegrationAssistant.sincronizarDados('fornecedores');
            // In a real app, parent would reload data or we'd trigger a callback
            // For now just simulate delay
            await new Promise(r => setTimeout(r, 800));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.vatNumber) return;

        const newSupplier: Supplier = {
            id: formData.id || crypto.randomUUID(),
            name: formData.name,
            vatNumber: formData.vatNumber,
            email: formData.email || '',
            phone: formData.phone || '',
            address: formData.address || '',
            city: formData.city || 'Luanda',
            province: formData.province || 'Luanda',
            country: formData.country || 'Angola',
            supplierType: formData.supplierType || 'Nacional',
            accountBalance: 0,
            transactions: []
        };

        try {
            await IntegrationAssistant.salvarDados('fornecedores', newSupplier);
            onSaveSupplier(newSupplier);
            setView('LIST');
            setFormData({});
        } catch (error) {
            console.error("Error saving supplier", error);
            alert("Erro ao salvar fornecedor");
        }
    };

    if (view === 'EXTRACT' && selectedSupplier) {
        // Mock/Default data for AccountExtract since we don't have full context here
        // In a real implementation, we would pass actual PGC accounts and invoices/purchases
        return (
            <AccountExtract
                company={{ name: 'Minha Empresa', nif: '500000000', address: 'Luanda', logo: '' }} // Dummy company
                accountCode={`32.1.${selectedSupplier.id.substring(0, 4)}`} // Dummy account code
                year={new Date().getFullYear()}
                pgcAccounts={[{ id: '1', code: `32.1.${selectedSupplier.id.substring(0, 4)}`, description: selectedSupplier.name, type: 'M', parentCode: '32.1', level: 3 }]}
                openingBalances={[]}
                invoices={[]} // We might not have access to purchases here, so it will be empty or we need to pass purchases to SupplierList
                onBack={() => setView('LIST')}
                onUpdateAccountCode={() => { }}
                onUpdateBalance={() => { }}
            />
        );
    }

    // We render the form as a modal overlay now, so we don't return early
    const renderFormModal = () => {
        if (view !== 'FORM') return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {formData.id ? <Building2 size={20} className="text-blue-600" /> : <Building2 size={20} className="text-green-600" />}
                            {formData.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                        </h2>
                        <button onClick={() => setView('LIST')} className="text-slate-400 hover:text-red-500 transition">
                            <Trash2 size={24} className="rotate-45" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                        <form id="supplier-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Nome da Empresa / Fornecedor <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Fornecedor Comercial Lda"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    NIF / N.º Contribuinte <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: 500123456"
                                    value={formData.vatNumber || ''}
                                    onChange={e => setFormData({ ...formData, vatNumber: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Email de Contacto
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="compras@empresa.ao"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Telefone
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+244 923 000 000"
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="mb-4 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Endereço Completo
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
                                    placeholder="Rua, Número, Bairro, Edifício..."
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Cidade / Província
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Luanda"
                                    value={formData.city || ''}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Tipo de Fornecedor
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.supplierType || 'Nacional'}
                                    onChange={e => setFormData({ ...formData, supplierType: e.target.value as any })}
                                >
                                    <option value="Nacional">Nacional</option>
                                    <option value="Estrangeiro">Estrangeiro</option>
                                    <option value="Prestador Serviço">Prestador Serviço</option>
                                </select>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setView('LIST')}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="supplier-form"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            Guardar Fornecedor
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Teramind-style Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-t-2xl shadow-lg text-white">
                <div>
                    <h1 className="text-2xl font-light flex items-center gap-2 tracking-tight">
                        <Truck className="text-white/80" /> Gestão de Fornecedores
                    </h1>
                    <p className="text-xs text-orange-100 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Database size={12} /> Base de Dados / Parceiros
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadSuppliers}
                        className="p-3 bg-white/10 text-white rounded hover:bg-white/20 transition backdrop-blur-sm border border-white/20"
                        title="Sincronizar"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => { setFormData({ country: 'Angola', city: 'Luanda' }); setView('FORM'); }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Plus size={18} /> Novo Fornecedor
                    </button>
                </div>
            </div>

            <div className="bg-white p-3 border-x border-slate-200 mt-0 flex items-center gap-3 shadow-inner bg-slate-50/50">
                <Search className="text-orange-400" size={18} />
                <input
                    className="flex-1 outline-none text-sm bg-transparent"
                    placeholder="Pesquisar fornecedor por nome ou NIF..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-xl overflow-hidden flex-1 -mt-6 pt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-bold text-slate-400">NIF</th>
                                <th className="p-4 font-bold text-slate-400">Nome da Entidade</th>
                                <th className="p-4 font-bold text-slate-400">Localização</th>
                                <th className="p-4 font-bold text-slate-400">Tipo</th>
                                <th className="p-4 font-bold text-slate-400">Contacto</th>
                                <th className="p-4 text-center font-bold text-slate-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-orange-50/50 transition-colors group">
                                    <td className="p-4 font-mono font-bold text-slate-500">{supplier.vatNumber}</td>
                                    <td className="p-4 font-bold text-slate-800">{supplier.name}</td>
                                    <td className="p-4 text-slate-600">{supplier.city}, {supplier.province}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase border border-slate-200">
                                            {supplier.supplierType || 'Geral'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 flex flex-col gap-0.5">
                                        <span className="flex items-center gap-1 text-[10px]"><Phone size={10} /> {supplier.phone || '---'}</span>
                                        <span className="flex items-center gap-1 text-[10px]"><Mail size={10} /> {supplier.email || '---'}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => { setSelectedSupplier(supplier); setView('EXTRACT'); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="Conta Corrente"
                                            >
                                                <List size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setFormData(supplier); setView('FORM'); }}
                                                className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded transition"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSuppliers.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400 font-light bg-slate-50/50">
                                        Nenhum fornecedor encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {renderFormModal()}
        </div>
    );
};

export default SupplierList;
