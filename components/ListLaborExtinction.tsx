
import React, { useState, useMemo } from 'react';
import { Employee, SalarySlip, AttendanceRecord, Company, WorkLocation, Contract } from '../types';
import {
    Search, UserX, FileText, Printer, Save, ArrowLeft, MoreHorizontal,
    Briefcase, AlertTriangle, CheckCircle, Calculator, Clock, DollarSign
} from 'lucide-react';
import { FormStyles } from './FormStyles';
import { formatDate } from '../utils';
import LaborExtinction from './LaborExtinction';

interface ListLaborExtinctionProps {
    employees: Employee[];
    company: Company;
    workLocations: WorkLocation[];
    payrollHistory: SalarySlip[];
    attendanceHistory: AttendanceRecord[];
    contracts: Contract[];
    onSaveEmployee: (emp: Employee) => void;
    onReadmit?: (emp: Employee) => void;
}

const ListLaborExtinction: React.FC<ListLaborExtinctionProps> = ({
    employees, company, workLocations, payrollHistory, attendanceHistory, contracts, onSaveEmployee, onReadmit
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    // Filter only Terminated employees
    const terminatedEmployees = useMemo(() => {
        return employees.filter(e =>
            e.status === 'Terminated' &&
            (e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.id.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [employees, searchTerm]);

    const handleSelectEmployee = (emp: Employee) => {
        setSelectedEmployee(emp);
        setShowDetail(true);
    };

    if (showDetail && selectedEmployee) {
        return (
            <LaborExtinction
                employee={selectedEmployee}
                company={company}
                payrollHistory={payrollHistory}
                attendanceHistory={attendanceHistory}
                contracts={contracts}
                onClose={() => { setShowDetail(false); setSelectedEmployee(null); }}
                onSave={(data) => {
                    // Handle saving extinction data if needed
                    console.log('Saved extinction data', data);
                }}
                onReadmit={(emp) => {
                    if (onReadmit) onReadmit(emp);
                    setShowDetail(false);
                }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase flex items-center gap-2">
                        <UserX className="text-red-500" /> Extinção Laboral
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de Demissões e Rescisões</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar demitidos..."
                            className="pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold focus:border-red-500 outline-none w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-4">Colaborador</th>
                            <th className="p-4">Data Demissão</th>
                            <th className="p-4">Motivo</th>
                            <th className="p-4">Responsável</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {terminatedEmployees.map(emp => (
                            <tr key={emp.id} className="hover:bg-red-50 transition cursor-pointer" onClick={() => handleSelectEmployee(emp)}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-600 text-xs">
                                            {emp.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{emp.name}</p>
                                            <p className="text-xs text-slate-500">{emp.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 font-medium text-slate-700">
                                    {emp.dismissalDate ? formatDate(emp.dismissalDate) : '-'}
                                </td>
                                <td className="p-4 text-slate-600 max-w-xs truncate">
                                    {emp.dismissalReason || 'Não especificado'}
                                </td>
                                <td className="p-4 text-slate-600">
                                    {emp.dismissedBy || '-'}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSelectEmployee(emp); }}
                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition"
                                        title="Ver Detalhes / Ficha"
                                    >
                                        <FileText size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {terminatedEmployees.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                    Nenhum colaborador com contrato extinto encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4 text-blue-800 text-sm">
                <div className="bg-blue-100 p-2 rounded-full"><Clock size={20} /></div>
                <div>
                    <h4 className="font-bold">Histórico e Arquivo Morto</h4>
                    <p>Os colaboradores nesta lista não aparecem nos processamentos salariais ativos. A readmissão restaura o status "Ativo".</p>
                </div>
            </div>
        </div>
    );
};

export default ListLaborExtinction;
