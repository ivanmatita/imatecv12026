
import React, { useState } from 'react';
import { Sprout, Tractor, Droplet, Wheat, BarChart3, Settings, Users, ClipboardList, Search, Plus, Printer, FileText, X, Save } from 'lucide-react';
import { AgriProject } from '../types';
import { generateId, formatCurrency } from '../utils';

const Agribusiness: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [projects, setProjects] = useState<AgriProject[]>([]);

    const [formData, setFormData] = useState<Partial<AgriProject>>({
        status: 'PLANNING',
        area: 0,
        costEstimate: 0,
        actualCost: 0
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newProject: AgriProject = {
            id: generateId(),
            name: formData.name || '',
            type: formData.type || '',
            area: Number(formData.area) || 0,
            startDate: formData.startDate || new Date().toISOString().split('T')[0],
            expectedHarvestDate: formData.expectedHarvestDate || '',
            status: (formData.status as any) || 'PLANNING',
            costEstimate: Number(formData.costEstimate) || 0,
            actualCost: Number(formData.actualCost) || 0
        };
        setProjects([newProject, ...projects]);
        setIsAdding(false);
        setFormData({ status: 'PLANNING', area: 0, costEstimate: 0, actualCost: 0 });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen relative">
            {/* Modal de Cadastro */}
            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Registar Novo Projeto</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase mt-1">Insira os detalhes da nova campanha agrícola</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome da Gleba / Projeto</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        placeholder="Ex: Gleba Sul Milho"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipo de Cultura</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner appearance-none"
                                        value={formData.type || ''}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Milho">Milho</option>
                                        <option value="Soja">Soja</option>
                                        <option value="Trigo">Trigo</option>
                                        <option value="Café">Café</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Área (Hectares)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        value={formData.area || ''}
                                        onChange={e => setFormData({ ...formData, area: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data de Início</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        value={formData.startDate || ''}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Previsão Colheita</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        value={formData.expectedHarvestDate || ''}
                                        onChange={e => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status Inicial</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner appearance-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="PLANNING">Planeamento</option>
                                        <option value="IN_PROGRESS">Em Curso</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-4">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xl shadow-emerald-200">
                                    Guardar Projeto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex-1 w-full">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-4">Gestão de Agronegócio</h1>
                        <div className="relative w-full max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Pesquisar glebas, safras, insumos ou máquinas..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button onClick={() => setIsAdding(true)} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-xl transform active:scale-95">
                            <Plus size={18} /> Adicionar Projeto
                        </button>
                        <button className="flex-1 md:flex-none bg-slate-800 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition shadow-lg">
                            <Printer size={18} /> Imprimir
                        </button>
                        <button className="flex-1 md:flex-none bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-lg">
                            <FileText size={18} /> Baixar PDF
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Tractor size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maquinaria</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">12 Ativos</h3>
                        <p className="text-xs text-slate-500 font-medium">8 em operação agora</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Droplet size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rega</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Automático</h3>
                        <p className="text-xs text-slate-500 font-medium">Próximo ciclo: 18:00</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-amber-100 p-3 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <Wheat size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumos</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Estoque Baixo</h3>
                        <p className="text-xs text-red-500 font-bold uppercase">Fertilizante NPK - Urgente</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <BarChart3 size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previsão Colheita</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">450 Ton</h3>
                        <p className="text-xs text-slate-500 font-medium">Estimativa para Outubro</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                <h2 className="font-black uppercase tracking-[2px] text-sm">Projetos Ativos / Glebas</h2>
                                <span className="bg-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white">{filteredProjects.length} Registos</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100 italic">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Projeto</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Tipo</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Área</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">Início</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredProjects.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="font-black text-slate-800 text-sm uppercase">{p.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold tracking-tight">ID: {p.id.slice(0, 8)}</div>
                                                </td>
                                                <td className="p-4 font-bold text-slate-600 text-xs uppercase">{p.type}</td>
                                                <td className="p-4 font-black text-slate-800 text-xs text-center">{p.area} ha</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                                                        }`}>
                                                        {p.status === 'IN_PROGRESS' ? 'Em Curso' : 'Planeado'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-500 text-xs">{new Date(p.startDate).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        {filteredProjects.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-20 text-center">
                                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Sprout size={32} className="text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Nenhum projeto encontrado</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                            <h2 className="font-black text-slate-800 uppercase tracking-tighter text-lg mb-6 flex items-center gap-2">
                                <BarChart3 className="text-emerald-500" /> Módulos Rápidos
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Maquinaria', icon: Tractor, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Sensores', icon: Droplet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Insumos', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { label: 'Equipa', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                                ].map((mod, i) => (
                                    <button key={i} className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50 transition group">
                                        <div className={`${mod.bg} ${mod.color} p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform`}>
                                            <mod.icon size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-700 uppercase">{mod.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                                <Droplet size={100} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">Clima em Tempo Real</h3>
                            <div className="text-5xl font-black mb-4 tracking-tighter">28°C</div>
                            <div className="font-bold text-sm mb-6 flex items-center gap-2">
                                <Droplet size={16} /> Humidade: 65%
                            </div>
                            <p className="text-xs text-emerald-100 italic leading-relaxed">
                                Condições ideais para aplicação de insumos nas glebas ativas hoje.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Agribusiness;
