import React, { useState } from 'react';
import { FileText, ArrowLeft, Search, Printer, User, CreditCard } from 'lucide-react';
import { Employee } from '../types';

interface WorkCardProps {
    onClose?: () => void;
    employees?: Employee[];
}

const WorkCard: React.FC<WorkCardProps> = ({ onClose, employees = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Mock employees if empty (for dev purposes)
    const displayEmployees = employees.length > 0 ? employees : [
        { id: '1', name: 'João Manuel', role: 'Desenvolvedor Senior', department: 'TI', photoUrl: '', employeeNumber: 'A001', admissionDate: '2023-01-15', nif: '000123456BA010', status: 'Active' },
        { id: '2', name: 'Maria Silva', role: 'Gestora de RH', department: 'Recursos Humanos', photoUrl: '', employeeNumber: 'A002', admissionDate: '2022-05-10', nif: '000987654BA010', status: 'Active' },
    ] as Employee[];

    const filteredEmployees = displayEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeNumber && emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-2xl shadow-lg text-white mb-6">
                    <div>
                        <h1 className="text-2xl font-light flex items-center gap-3 tracking-tight">
                            <CreditCard className="text-white/80" size={32} />
                            Cartão de Trabalho
                        </h1>
                        <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">
                            Emissão e Impressão de Cartões de Identificação
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Employee List */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Pesquisar funcionário..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {filteredEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 border ${selectedEmployee?.id === emp.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedEmployee?.id === emp.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {emp.photoUrl ? (
                                            <img src={emp.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className={`font-bold text-sm truncate ${selectedEmployee?.id === emp.id ? 'text-orange-900' : 'text-slate-700'}`}>{emp.name}</h3>
                                        <p className="text-xs text-slate-400 truncate">{emp.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card Preview */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center relative min-h-[600px] bg-slate-50/50">
                        {selectedEmployee ? (
                            <div className="animate-in fade-in zoom-in duration-300 w-full flex flex-col items-center">
                                <div className="flex justify-end w-full mb-8 gap-3">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors shadow"
                                    >
                                        <Printer size={18} /> Imprimir Cartão
                                    </button>
                                </div>

                                {/* Work Card Design - Valid SVG/HTML Structure */}
                                <div id="work-card-print" className="bg-white w-[350px] h-[550px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col">
                                    {/* Top Pattern */}
                                    <div className="h-32 bg-slate-900 relative">
                                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                        <div className="absolute top-4 left-0 w-full text-center">
                                            <h2 className="text-white font-black tracking-widest text-lg uppercase">IMATEC</h2>
                                            <p className="text-white/60 text-[10px] uppercase tracking-widest">Tecnologia & Inovação</p>
                                        </div>
                                    </div>

                                    {/* Photo */}
                                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden">
                                        {selectedEmployee.photoUrl ? (
                                            <img src={selectedEmployee.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-full h-full p-6 text-slate-400" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="mt-20 px-6 text-center flex-1 flex flex-col items-center">
                                        <h2 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{selectedEmployee.name}</h2>
                                        <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-6">{selectedEmployee.role}</p>

                                        <div className="w-full space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Nº Mecanográfico</span>
                                                <span className="text-xs font-bold text-slate-700 font-mono">{selectedEmployee.employeeNumber || '0000'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Departamento</span>
                                                <span className="text-xs font-bold text-slate-700">{selectedEmployee.department}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Admissão</span>
                                                <span className="text-xs font-bold text-slate-700">{selectedEmployee.admissionDate ? new Date(selectedEmployee.admissionDate).toLocaleDateString('pt-AO') : '-'}</span>
                                            </div>
                                            <div className="flex justify-between text-center pt-2">
                                                <div className="w-full">
                                                    <span className="text-[8px] font-bold text-slate-300 uppercase block mb-1">Assinatura Autorizada</span>
                                                    <div className="h-8 border-b border-slate-300 w-2/3 mx-auto"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Bar */}
                                    <div className="h-4 bg-blue-600 w-full mt-auto"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 animate-pulse">
                                <CreditCard size={64} className="mx-auto mb-4 opacity-50" />
                                <p className="font-medium">Selecione um funcionário para visualizar o cartão</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkCard;
