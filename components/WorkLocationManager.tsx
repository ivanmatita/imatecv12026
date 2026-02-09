
import React, { useState, useEffect } from 'react';
import { WorkLocation } from '../types';
import { listarLocaisTrabalho, criarLocalTrabalho } from '../services/supabaseClient';
import { MapPin, Plus, Trash2, Save, Loader2, RefreshCw } from 'lucide-react';
import { generateUUID } from '../utils';

interface WorkLocationManagerProps {
    workLocations?: WorkLocation[]; // Optional as we fetch internally
    onSave?: (wl: WorkLocation) => void;
    onDelete?: (id: string) => void;
}

const WorkLocationManager: React.FC<WorkLocationManagerProps> = ({ }) => {
    const [locations, setLocations] = useState<WorkLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', address: '', type: 'LOJA', managerName: '' });

    useEffect(() => {
        loadLocations();
    }, []);

    async function loadLocations() {
        setIsLoading(true);
        try {
            const data = await listarLocaisTrabalho();
            if (data) {
                const mapped: WorkLocation[] = data.map((d: any) => ({
                    id: d.id,
                    name: d.nome || d.name,
                    address: d.endereco || d.address || '',
                    type: d.tipo || d.type || 'LOJA',
                    managerId: d.responsavel_id || '',
                    companyId: d.empresa_id,
                    // Store extra fields if needed
                }));
                setLocations(mapped);
            }
        } catch (error) {
            console.error("Erro ao carregar locais:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave() {
        if (!newLocation.name) return alert("O nome é obrigatório!");

        setIsLoading(true);
        try {
            const payload = {
                id: generateUUID(),
                nome: newLocation.name || 'Sem Nome',
                titulo: newLocation.name || 'Sem Nome',
                endereco: newLocation.address,
                tipo: newLocation.type,
                empresa_id: '00000000-0000-0000-0000-000000000001',
                responsavel: newLocation.managerName || undefined
            };

            await criarLocalTrabalho(payload);

            await loadLocations();
            setIsModalOpen(false);
            setNewLocation({ name: '', address: '', type: 'LOJA', managerName: '' });
            alert("Local de trabalho criado com sucesso!");
        } catch (error: any) {
            alert("Erro ao criar local: " + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20 font-sans">
            {/* Teramind-style Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-t-2xl shadow-lg text-white">
                <div>
                    <h1 className="text-2xl font-light flex items-center gap-3 tracking-tight">
                        <MapPin className="text-white/80" size={32} /> Locais de Trabalho
                    </h1>
                    <p className="text-xs text-orange-100 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        Painel de Controlo / Lojas e Armazéns
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadLocations}
                        className="p-3 bg-white/10 text-white rounded hover:bg-white/20 transition backdrop-blur-sm border border-white/20"
                        title="Recarregar"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Plus size={18} /> ADICIONAR LOCAL
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 shadow-xl overflow-hidden relative -mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                            <tr>
                                <th className="p-5 font-bold text-slate-400">Nome do Local</th>
                                <th className="p-5 font-bold text-slate-400">Endereço</th>
                                <th className="p-5 font-bold text-slate-400">Tipo</th>
                                <th className="p-5 text-center font-bold text-slate-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {locations.map(loc => (
                                <tr key={loc.id} className="hover:bg-orange-50/50 transition-colors group">
                                    <td className="p-5 font-medium text-slate-700">{loc.name}</td>
                                    <td className="p-5 text-slate-500">{loc.address || '---'}</td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${loc.type === 'LOJA' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                            {loc.type}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Apagar">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {locations.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400 font-light bg-slate-50/50">
                                        Nenhum local registado no sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col animate-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Plus size={20} className="text-blue-600" />
                                {newLocation.name ? 'Editar Local' : 'Novo Local'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition">
                                <Trash2 size={24} className="rotate-45" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-slate-50 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Nome do Local <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newLocation.name}
                                    onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                                    placeholder="Ex: Loja Benfica"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Endereço
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newLocation.address}
                                    onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
                                    placeholder="Rua, Cidade..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Tipo
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newLocation.type}
                                    onChange={e => setNewLocation({ ...newLocation, type: e.target.value })}
                                >
                                    <option value="LOJA">Loja</option>
                                    <option value="ARMAZEM">Armazém</option>
                                    <option value="ESCRITORIO">Escritório</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkLocationManager;
