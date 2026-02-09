
import React, { useState, useMemo } from 'react';
import { Employee, WorkLocation, Company, DocumentSeries } from '../types';
import {
    Search, MapPin, Calendar, Clock, AlertTriangle, FileText,
    Printer, Download, Edit, Save, ArrowLeft, RefreshCw, User,
    DollarSign, Briefcase, ChevronDown, CheckCircle, Lock, Monitor
} from 'lucide-react';
import { FormStyles, ModalStyles } from './FormStyles';
import { formatDate, formatCurrency } from '../utils';

interface WorkStationManagementProps {
    employees: Employee[];
    workLocations: WorkLocation[];
    onClose: () => void;
    onUpdateEmployeeLocation: (empId: string, locationId: string, reason: string) => void;
    // Mocking permissions/series for now as per request
    series?: DocumentSeries[];
}

const WorkStationManagement: React.FC<WorkStationManagementProps> = ({
    employees, workLocations, onClose, onUpdateEmployeeLocation, series = []
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
    const [changeReason, setChangeReason] = useState('');
    const [newLocationId, setNewLocationId] = useState('');
    const [permissions, setPermissions] = useState<Record<string, string[]>>({}); // empId -> seriesIds[]
    const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');

    // Mock History Data (Local State)
    const [history, setHistory] = useState<any[]>([
        { id: 'h1', empId: 'e1', location: 'Sede Principal', startDate: '2022-01-01', endDate: null, duration: 'Ativo', reason: 'Admissão' }
    ]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e =>
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const handleOpenChangeModal = (emp: Employee) => {
        setSelectedEmployee(emp);
        setNewLocationId(emp.workLocationId || '');
        setChangeReason('');
        setIsChangeModalOpen(true);
    };

    const handleConfirmChange = () => {
        if (!selectedEmployee || !newLocationId) return;

        // Add to history (Mock logic)
        const currentLoc = workLocations.find(w => w.id === selectedEmployee.workLocationId)?.name || 'N/A';
        const newHistoryItem = {
            id: Date.now().toString(),
            empId: selectedEmployee.id,
            location: currentLoc,
            startDate: new Date().toISOString().split('T')[0], // Reset start date for new location
            endDate: null,
            duration: '0 Meses',
            reason: changeReason || 'Transferência Administrativa'
        };
        setHistory([newHistoryItem, ...history]);

        onUpdateEmployeeLocation(selectedEmployee.id, newLocationId, changeReason);
        setIsChangeModalOpen(false);
        // alert("Local de trabalho atualizado com sucesso!"); // Removed alert for smoother UX
    };

    const togglePermission = (empId: string, seriesId: string) => {
        setPermissions(prev => {
            const current = prev[empId] || [];
            if (current.includes(seriesId)) {
                return { ...prev, [empId]: current.filter(id => id !== seriesId) };
            } else {
                return { ...prev, [empId]: [...current, seriesId] };
            }
        });
    };

    const handleAddLocation = () => {
        if (!newLocationName) return;
        // In a real app, this would call a prop function to save the location
        // For now we just mock adding it to the local list (which comes from props, so we can't mutate it directly without a callback)
        // Assuming user just handles the UI part here as per instruction "registar os locais"
        alert(`Novo local "${newLocationName}" registado com sucesso! (Simulação)`);
        setIsAddLocationOpen(false);
        setNewLocationName('');
    };

    // Calculate time in current location
    const getTimeInLocation = (empId: string) => {
        const entry = history.find(h => h.empId === empId && !h.endDate);
        if (!entry) return 'Recente';
        const start = new Date(entry.startDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 365) return `${Math.floor(diffDays / 365)} Anos`;
        if (diffDays > 30) return `${Math.floor(diffDays / 30)} Meses`;
        return `${diffDays} Dias`;
    };

    return (
        <div className="fixed inset-0 bg-white z-[120] overflow-y-auto animate-in slide-in-from-right">
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase flex items-center gap-2">
                                <Briefcase className="text-blue-600" /> Gestão de Posto de Trabalho
                            </h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Recursos Humanos / Alocação</p>
                        </div>
                    </div>
                    <div>
                        <button onClick={() => setIsAddLocationOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200">
                            <MapPin size={16} /> Registar Local
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar funcionário, ID ou NIF..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-600 bg-white"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold uppercase text-xs hover:bg-slate-100 flex items-center gap-2">
                            <Printer size={16} /> Imprimir Lista
                        </button>
                        <button className="px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold uppercase text-xs hover:bg-slate-100 flex items-center gap-2">
                            <Download size={16} /> Baixar PDF
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Employee List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Colaborador</th>
                                        <th className="p-4">Posto Atual</th>
                                        <th className="p-4">Admissão</th>
                                        <th className="p-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEmployees.map(emp => {
                                        const location = workLocations.find(l => l.id === emp.workLocationId);
                                        return (
                                            <tr key={emp.id} className={`hover:bg-blue-50 transition cursor-pointer ${selectedEmployee?.id === emp.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`} onClick={() => setSelectedEmployee(emp)}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 uppercase">
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{emp.name}</p>
                                                            <p className="text-xs text-slate-500">{emp.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit ${location ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        <MapPin size={12} /> {location ? location.name : 'Não Alocado'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-slate-600">{formatDate(emp.admissionDate)}</td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleOpenChangeModal(emp); }}
                                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-full transition"
                                                        title="Alterar Local"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="space-y-6">
                        {selectedEmployee ? (
                            <div className="bg-white border rounded-xl shadow-lg p-6 animate-in slide-in-from-right duration-500 sticky top-6">
                                <div className="text-center mb-6 border-b pb-6">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-lg mb-3">
                                        <User size={40} className="text-slate-400" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase">{selectedEmployee.name}</h2>
                                    <p className="text-sm font-bold text-slate-500">{selectedEmployee.role}</p>

                                    <div className="mt-4 flex justify-center gap-2">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                                            {formatCurrency(selectedEmployee.baseSalary)} / Mês
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest border-b pb-2">Detalhes do Posto</h3>

                                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 flex items-center gap-2"><MapPin size={14} /> Local Atual</span>
                                            <span className="font-bold text-slate-800">
                                                {workLocations.find(l => l.id === selectedEmployee.workLocationId)?.name || 'Sem Local'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 flex items-center gap-2"><Clock size={14} /> Tempo no Local</span>
                                            <span className="font-bold text-slate-800">{getTimeInLocation(selectedEmployee.id)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 flex items-center gap-2"><AlertTriangle size={14} /> Ocorrências</span>
                                            <span className="font-bold text-orange-600">0 Registadas</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Início</span>
                                            <span className="font-bold text-slate-800">{formatDate(history.find(h => h.empId === selectedEmployee.id && !h.endDate)?.startDate || selectedEmployee.admissionDate)}</span>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest border-b pb-2 pt-2">Permissões de Faturação</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {series.map(s => {
                                            const isSelected = (permissions[selectedEmployee.id] || []).includes(s.id);
                                            return (
                                                <div
                                                    key={s.id}
                                                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                                                    onClick={() => togglePermission(selectedEmployee.id, s.id)}
                                                >
                                                    <span className="text-xs font-bold text-slate-600">{s.name} ({s.code})</span>
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>
                                                        {isSelected && <CheckCircle size={12} className="text-white" />}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {series.length === 0 && <p className="text-xs text-slate-400 italic">Nenhuma série disponível.</p>}
                                    </div>

                                    <div className="pt-4 flex gap-2">
                                        <button className="flex-1 py-2 bg-blue-600 text-white rounded font-bold text-xs uppercase hover:bg-blue-700 transition">
                                            Imprimir Ficha
                                        </button>
                                        <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded font-bold text-xs uppercase hover:bg-slate-200 transition">
                                            Histórico
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <Briefcase size={48} className="mb-4 opacity-50" />
                                <p className="font-medium text-center">Selecione um colaborador para ver detalhes do posto de trabalho e gerir permissões.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Location Modal */}
                {isChangeModalOpen && (
                    <div className={ModalStyles.overlay}>
                        <div className={ModalStyles.container}>
                            <div className={ModalStyles.header}>
                                <h3 className={ModalStyles.headerTitle}>Alterar Local de Trabalho</h3>
                            </div>
                            <div className={ModalStyles.body}>
                                <div>
                                    <label className={FormStyles.label}>Novo Local de Trabalho</label>
                                    <select
                                        className={FormStyles.select}
                                        value={newLocationId}
                                        onChange={e => setNewLocationId(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {workLocations.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={FormStyles.label}>Motivo da Alteração</label>
                                    <textarea
                                        className={FormStyles.textarea}
                                        rows={3}
                                        value={changeReason}
                                        onChange={e => setChangeReason(e.target.value)}
                                        placeholder="Ex: Transferência solicitada, Promoção, etc."
                                    />
                                </div>
                                <div className={FormStyles.buttonContainer}>
                                    <button onClick={handleConfirmChange} className={FormStyles.buttonPrimary}>
                                        Confirmar Transferência
                                    </button>
                                    <button onClick={() => setIsChangeModalOpen(false)} className={FormStyles.buttonCancel}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Location Modal */}
                {isAddLocationOpen && (
                    <div className={ModalStyles.overlay}>
                        <div className={ModalStyles.container}>
                            <div className={ModalStyles.header}>
                                <h3 className={ModalStyles.headerTitle}>Registar Novo Local de Trabalho</h3>
                            </div>
                            <div className={ModalStyles.body}>
                                <div>
                                    <label className={FormStyles.label}>Nome do Local / Filial</label>
                                    <input
                                        type="text"
                                        className={FormStyles.input}
                                        value={newLocationName}
                                        onChange={e => setNewLocationName(e.target.value)}
                                        placeholder="Ex: Filial Lubango"
                                    />
                                </div>
                                <div className={FormStyles.buttonContainer}>
                                    <button onClick={handleAddLocation} className={FormStyles.buttonPrimary}>
                                        Guardar Local
                                    </button>
                                    <button onClick={() => setIsAddLocationOpen(false)} className={FormStyles.buttonCancel}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkStationManagement;
