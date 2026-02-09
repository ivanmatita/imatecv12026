import React, { useState, useMemo } from 'react';
import { Profession } from '../types';
import { generateId, formatCurrency } from '../utils';
import { Plus, Search, Edit, Trash2, Save, X, Briefcase } from 'lucide-react';

interface ProfessionManagerProps {
    professions: Profession[];
    onSave: (profession: Profession) => void;
    onDelete: (id: string) => void;
}

const ProfessionManager: React.FC<ProfessionManagerProps> = ({ professions, onSave, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProfession, setEditingProfession] = useState<Profession | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Profession>>({});

    const filteredProfessions = useMemo(() => {
        return professions.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [professions, searchTerm]);

    const handleOpenModal = (profession?: Profession) => {
        if (profession) {
            setEditingProfession(profession);
            setFormData({ ...profession });
        } else {
            setEditingProfession(null);
            setFormData({
                code: '',
                name: '',
                category: 'Geral',
                baseSalary: 0,
                complement: 0,
                description: '',
                group: 'A'
            });
        }
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.code) {
            alert("Nome e Código são obrigatórios.");
            return;
        }

        const profession: Profession = {
            id: editingProfession ? editingProfession.id : generateId(),
            code: formData.code || '',
            name: formData.name || '',
            category: formData.category || 'Geral',
            baseSalary: Number(formData.baseSalary) || 0,
            complement: Number(formData.complement) || 0,
            description: formData.description || '',
            group: formData.group || 'A',
            createdAt: editingProfession?.createdAt || new Date().toISOString(),
            ...formData
        } as Profession;

        onSave(profession);
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja eliminar esta profissão?")) {
            onDelete(id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <Briefcase className="text-orange-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Gestão de Profissões</h2>
                        <p className="text-xs text-slate-500">Defina cargos, salários base e categorias.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Pesquisar profissão..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm"
                    >
                        <Plus size={16} /> Nova Profissão
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider">
                            <th className="p-3 border-b border-slate-200">Código</th>
                            <th className="p-3 border-b border-slate-200">Nome da Função</th>
                            <th className="p-3 border-b border-slate-200">Categoria</th>
                            <th className="p-3 border-b border-slate-200">Grupo</th>
                            <th className="p-3 border-b border-slate-200 text-right">Salário Base</th>
                            <th className="p-3 border-b border-slate-200 text-right">Complemento</th>
                            <th className="p-3 border-b border-slate-200 text-center">Acções</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                        {filteredProfessions.map(prof => (
                            <tr key={prof.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-mono text-slate-500 text-xs">{prof.code}</td>
                                <td className="p-3 font-bold text-slate-700">{prof.name}</td>
                                <td className="p-3">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{prof.category}</span>
                                </td>
                                <td className="p-3 text-slate-600">{prof.group}</td>
                                <td className="p-3 text-right font-medium text-slate-800">{formatCurrency(prof.baseSalary || 0)}</td>
                                <td className="p-3 text-right text-slate-500">{formatCurrency(prof.complement || 0)}</td>
                                <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(prof)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(prof.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredProfessions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                    Nenhuma profissão encontrada. Clique em "Nova Profissão" para adicionar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Briefcase size={20} />
                                {editingProfession ? 'Editar Profissão' : 'Nova Profissão'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código</label>
                                    <input
                                        type="text"
                                        value={formData.code || ''}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full border border-slate-300 rounded p-2 text-sm focus:border-orange-500 outline-none"
                                        placeholder="EX: IT-DEV"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grupo</label>
                                    <select
                                        value={formData.group || 'A'}
                                        onChange={e => setFormData({ ...formData, group: e.target.value })}
                                        className="w-full border border-slate-300 rounded p-2 text-sm focus:border-orange-500 outline-none"
                                    >
                                        <option value="A">Grupo A</option>
                                        <option value="B">Grupo B</option>
                                        <option value="C">Grupo C</option>
                                        <option value="D">Grupo D</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Função</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded p-2 text-sm focus:border-orange-500 outline-none font-bold text-slate-700"
                                    placeholder="Ex: Desenvolvedor Senior"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                                    <input
                                        type="text"
                                        value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full border border-slate-300 rounded p-2 text-sm focus:border-orange-500 outline-none"
                                        placeholder="Ex: Técnico"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                                    <input
                                        type="text"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border border-slate-300 rounded p-2 text-sm focus:border-orange-500 outline-none"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Save size={12} /> Definição Salarial
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salário Base</label>
                                        <input
                                            type="number"
                                            value={formData.baseSalary || 0}
                                            onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded p-2 text-sm focus:border-orange-500 outline-none font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Complemento</label>
                                        <input
                                            type="number"
                                            value={formData.complement || 0}
                                            onChange={e => setFormData({ ...formData, complement: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded p-2 text-sm focus:border-orange-500 outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-bold uppercase text-xs transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold uppercase text-xs flex items-center gap-2 transition shadow-sm"
                            >
                                <Save size={16} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionManager;
