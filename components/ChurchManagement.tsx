
import React, { useState } from 'react';
import { Church, Users, Search, Printer, FileText, Plus, Database, Filter, Calendar, Heart, GraduationCap, Home, X, Save, MapPin, User } from 'lucide-react';
import { ChurchCongregation } from '../types';
import { generateId } from '../utils';

const ChurchManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [churches, setChurches] = useState<ChurchCongregation[]>([]);

    const [formData, setFormData] = useState<Partial<ChurchCongregation>>({
        status: 'ACTIVE',
        membersCount: 0,
        category: 'Sede'
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newChurch: ChurchCongregation = {
            id: generateId(),
            name: formData.name || '',
            pastor: formData.pastor || '',
            location: formData.location || '',
            membersCount: Number(formData.membersCount) || 0,
            foundedDate: formData.foundedDate || new Date().toISOString().split('T')[0],
            status: (formData.status as any) || 'ACTIVE',
            category: formData.category || 'Congregação'
        };
        setChurches([newChurch, ...churches]);
        setIsAdding(false);
        setFormData({ status: 'ACTIVE', membersCount: 0, category: 'Sede' });
    };

    const filteredChurches = churches.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.pastor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen relative">
            {/* Modal de Cadastro de Igreja */}
            {isAdding && (
                <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase">Registar Congregação</h2>
                                <p className="text-indigo-600/60 text-xs font-black uppercase tracking-widest mt-1">Gestão Administrativa Eclesiástica</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="p-3 hover:bg-white rounded-full transition-all text-indigo-300 hover:text-indigo-600 shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[2px] ml-1">Nome da Congregação / Sede</label>
                                    <div className="relative">
                                        <Church className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200" size={18} />
                                        <input
                                            required
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                            placeholder="Ex: Igreja Central Luanda"
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[2px] ml-1">Pastor Responsável</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200" size={18} />
                                        <input
                                            required
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                            placeholder="Nome do Pastor"
                                            value={formData.pastor || ''}
                                            onChange={e => setFormData({ ...formData, pastor: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[2px] ml-1">Localização / Província</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200" size={18} />
                                        <input
                                            required
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                            placeholder="Ex: Luanda, Viana"
                                            value={formData.location || ''}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[2px] ml-1">Número de Membros</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                        value={formData.membersCount || ''}
                                        onChange={e => setFormData({ ...formData, membersCount: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[2px] ml-1">Data de Fundação</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                        value={formData.foundedDate || ''}
                                        onChange={e => setFormData({ ...formData, foundedDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[2px] ml-1">Categoria</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Sede">Sede Nacional</option>
                                        <option value="Provincial">Sede Provincial</option>
                                        <option value="Congregação">Congregação Local</option>
                                        <option value="Missão">Campo Missionário</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-slate-100 flex gap-6">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 transform active:scale-95">
                                    Confirmar Registo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-[1500px] mx-auto">
                {/* Upper ToolBar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
                                <Church size={28} />
                            </div>
                            Gestão de Igreja
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Administração Eclesiástica Digital</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 transition transform active:scale-95">
                            <Plus size={18} /> Adicionar Igreja
                        </button>
                        <button className="bg-slate-800 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition">
                            <Printer size={18} /> Imprimir
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition">
                            <FileText size={18} /> Baixar PDF
                        </button>
                    </div>
                </div>

                {/* Search Panel */}
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-200 mb-8 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300" size={22} />
                        <input
                            type="text"
                            placeholder="Pesquisar por congregação, pastor responsável ou localidade..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-slate-100 hover:bg-indigo-50 text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
                        <Filter size={18} /> Filtros
                    </button>
                </div>

                {/* List Control */}
                {filteredChurches.length > 0 ? (
                    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden mb-12">
                        <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                            <h2 className="font-black uppercase tracking-[3px] text-xs">Congregações Registadas</h2>
                            <div className="bg-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">{filteredChurches.length} Unidades</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 italic">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Congregação</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pastor</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede/Local</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Membros</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredChurches.map(c => (
                                        <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-black text-slate-900 text-sm uppercase leading-none mb-1">{c.name}</div>
                                                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">{c.category}</div>
                                            </td>
                                            <td className="p-6 font-bold text-slate-600 text-xs uppercase">{c.pastor}</td>
                                            <td className="p-6 font-bold text-slate-500 text-xs uppercase">{c.location}</td>
                                            <td className="p-6 text-center">
                                                <div className="font-black text-indigo-600 text-sm">{c.membersCount}</div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">Ativo</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] border-4 border-dashed border-slate-100 p-24 text-center">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Database size={44} className="text-slate-200" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">Base de Dados Vazia</h2>
                        <p className="text-slate-400 font-bold text-sm max-w-lg mx-auto leading-relaxed uppercase tracking-widest opacity-60">
                            Ainda não existem congregações ou sedes registadas nesta unidade. Comece adicionando a sua sede regional.
                        </p>
                        <button onClick={() => setIsAdding(true)} className="mt-10 bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-2xl shadow-indigo-200 hover:scale-105 transition-all">
                            Registar Agora
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChurchManagement;
