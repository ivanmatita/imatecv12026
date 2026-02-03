
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
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                        <MapPin className="text-blue-600" size={32} /> Locais de Trabalho
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        Gestão de Lojas, Armazéns e Escritórios
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadLocations}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                        title="Recarregar"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} /> Novo Local
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest border-b border-slate-800">
                            <tr>
                                <th className="p-5">Nome do Local</th>
                                <th className="p-5">Endereço</th>
                                <th className="p-5">Tipo</th>
                                <th className="p-5 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {locations.map(loc => (
                                <tr key={loc.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="p-5 font-black text-slate-800 uppercase tracking-tight">{loc.name}</td>
                                    <td className="p-5 text-slate-600 font-medium">{loc.address || '---'}</td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${loc.type === 'LOJA' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                            {loc.type}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition shadow-sm border border-transparent hover:border-red-100" title="Apagar">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {locations.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400 font-black uppercase tracking-[5px] bg-slate-50 italic">
                                        Nenhum local registado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b-4 border-blue-600">
                            <h3 className="font-black text-lg flex items-center gap-3 uppercase tracking-tighter">
                                <Plus className="text-blue-400" /> Novo Local
                            </h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nome *</label>
                                <input
                                    className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold focus:border-blue-600 outline-none transition"
                                    value={newLocation.name}
                                    onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                                    placeholder="Ex: Loja Benfica"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Endereço</label>
                                <input
                                    className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-medium focus:border-blue-600 outline-none transition"
                                    value={newLocation.address}
                                    onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
                                    placeholder="Rua, Cidade..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tipo</label>
                                <select
                                    className="w-full p-3 border-2 border-slate-100 bg-slate-50 rounded-xl font-bold focus:border-blue-600 outline-none transition"
                                    value={newLocation.type}
                                    onChange={e => setNewLocation({ ...newLocation, type: e.target.value })}
                                >
                                    <option value="LOJA">Loja</option>
                                    <option value="ARMAZEM">Armazém</option>
                                    <option value="ESCRITORIO">Escritório</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition">Cancelar</button>
                                <button onClick={handleSave} disabled={isLoading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-500 transition flex justify-center items-center gap-2">
                                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkLocationManager;
