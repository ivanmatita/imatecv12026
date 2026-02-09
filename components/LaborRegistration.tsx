import React, { useState } from 'react';
import { ScrollText, ArrowLeft, Search, Edit2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Employee } from '../types';

interface LaborRegistrationProps {
    onClose?: () => void;
    employees?: Employee[];
}

const LaborRegistration: React.FC<LaborRegistrationProps> = ({ onClose, employees = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    // Mock employees for dev if empty
    const displayEmployees = employees.length > 0 ? employees : [
        { id: '1', name: 'João Manuel', role: 'Desenvolvedor', socialSecurityNumber: '12345678901', department: 'TI' },
        { id: '2', name: 'Maria Silva', role: 'RH', socialSecurityNumber: '', department: 'RH' },
    ] as Employee[];

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const filteredEmployees = displayEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (emp: Employee) => {
        setEditingId(emp.id);
        setEditValue(emp.socialSecurityNumber || '');
    };

    const handleSave = (empId: string) => {
        // Implement save logic here
        console.log(`Saving SSN ${editValue} for employee ${empId}`);
        setEditingId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-2xl shadow-lg text-white mb-6">
                    <div>
                        <h1 className="text-2xl font-light flex items-center gap-3 tracking-tight">
                            <ScrollText className="text-white/80" size={32} />
                            Inscrição Laboral
                        </h1>
                        <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">
                            Gestão de Nº de Segurança Social e MAPTSS
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-white/20 font-medium"
                        >
                            <ArrowLeft size={18} />
                            Voltar
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-2.5 text-orange-400" size={18} />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-4 text-sm font-bold text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Inscritos
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-300"></span> Pendentes
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="p-4">Funcionário</th>
                                    <th className="p-4">Departamento</th>
                                    <th className="p-4">Nº Segurança Social</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 font-bold text-slate-700">{emp.name}</td>
                                        <td className="p-4 text-slate-500">{emp.department}</td>
                                        <td className="p-4 font-mono text-slate-600">
                                            {editingId === emp.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="border border-orange-300 rounded px-2 py-1 focus:ring-1 focus:ring-orange-500 outline-none w-40"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                emp.socialSecurityNumber || <span className="text-slate-300 italic">Não Registado</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {emp.socialSecurityNumber ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                                                    <CheckCircle size={12} /> Inscrito
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                                                    <AlertCircle size={12} /> Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {editingId === emp.id ? (
                                                <button
                                                    onClick={() => handleSave(emp.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors text-xs font-bold shadow-sm"
                                                >
                                                    <Save size={14} /> Salvar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(emp)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors text-xs font-bold"
                                                >
                                                    <Edit2 size={14} /> Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaborRegistration;
