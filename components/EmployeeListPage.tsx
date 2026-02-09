import React, { useState, useMemo } from 'react';
import { Employee, WorkLocation, Profession } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Search, Printer, Plus, Edit, Trash2, User, Eye } from 'lucide-react';
import EmployeeOptionsMenu from './EmployeeOptionsMenu';

interface EmployeeListPageProps {
    employees: Employee[];
    onSaveEmployee: (emp: Employee) => void;
    workLocations: WorkLocation[];
    professions: Profession[];
    onEdit?: (emp: Employee) => void;
    onDelete?: (empId: string) => void;
    onViewDetails?: (emp: Employee) => void;
    onCreate?: () => void;
    onDismiss?: (emp: Employee) => void;
    onIssueContract?: (emp: Employee) => void;
    onViewPersonalFile?: (emp: Employee) => void;
    onReadmit?: (emp: Employee) => void;
    onManageUniforms?: (emp: Employee) => void;
}

const EmployeeListPage: React.FC<EmployeeListPageProps> = ({
    employees,
    onSaveEmployee,
    workLocations,
    professions,
    onEdit,
    onDelete,
    onViewDetails,
    onCreate,
    onDismiss,
    onIssueContract,
    onViewPersonalFile,
    onReadmit,
    onManageUniforms
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Terminated' | 'OnLeave'>('ALL');

    // Get unique departments
    const departments = useMemo(() => {
        const depts = new Set(employees.map(e => e.department).filter(Boolean));
        return Array.from(depts);
    }, [employees]);

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch =
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp.employeeNumber && emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (emp.nif && emp.nif.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesDepartment = departmentFilter === 'ALL' || emp.department === departmentFilter;
            const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

            return matchesSearch && matchesDepartment && matchesStatus;
        });
    }, [employees, searchTerm, departmentFilter, statusFilter]);

    // Calculate estimated net salary
    const calculateEstimatedNet = (emp: Employee) => {
        const baseSalary = emp.baseSalary || 0;
        const subsidies =
            (emp.subsidyTransport || 0) +
            (emp.subsidyFood || 0) +
            (emp.subsidyFamily || 0) +
            (emp.subsidyHousing || 0) +
            (emp.subsidyChristmas || 0) +
            (emp.subsidyVacation || 0);

        const allowances = emp.allowances || 0;
        const grossTotal = baseSalary + subsidies + allowances;

        // Simplified INSS calculation (3% of base salary)
        const inss = baseSalary * 0.03;

        // Simplified IRT calculation (approximate)
        let irt = 0;
        if (grossTotal > 70000) {
            irt = (grossTotal - 70000) * 0.105;
        }

        const deductions = inss + irt + (emp.advances || 0) + (emp.penalties || 0);
        const netTotal = grossTotal - deductions;

        return netTotal;
    };

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Header with gradient */}
            {/* Teramind-style Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-2xl shadow-lg text-white">
                <div>
                    <h1 className="text-2xl font-light flex items-center gap-3 tracking-tight">
                        <User className="text-white/80" size={32} /> Lista de Colaboradores
                    </h1>
                    <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        Recursos Humanos / Colaboradores
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="p-3 bg-white/10 text-white rounded hover:bg-white/20 transition backdrop-blur-sm border border-white/20"
                        title="Imprimir Lista"
                    >
                        <Printer size={18} />
                    </button>
                    {onCreate && (
                        <button
                            onClick={onCreate}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all"
                        >
                            <Plus size={18} /> Novo Colaborador
                        </button>
                    )}
                </div>
            </div>

            {/* Filters and Search - Attached to header */}
            <div className="bg-white p-4 rounded-b-2xl shadow-xl border-x border-b border-slate-200 -mt-6 pt-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                            Pesquisar
                        </label>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 text-blue-400" size={18} />
                            <input
                                type="text"
                                placeholder="Nome, Nº Mecanográfico, NIF..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                            Departamento
                        </label>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                        >
                            <option value="ALL">Todos</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                            Estado
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                        >
                            <option value="ALL">Todos</option>
                            <option value="Active">Activo</option>
                            <option value="OnLeave">Em Licença</option>
                            <option value="Terminated">Demitido</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                        <span className="font-bold">{filteredEmployees.length}</span> colaborador(es) encontrado(s)
                    </div>
                    <div className="flex gap-2 invisible">
                        {/* Spacer or additional lower buttons if needed, but main actions are in header now */}
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-bold text-slate-400">
                                    Foto
                                </th>
                                <th className="p-4 font-bold text-slate-400">
                                    Nº Mec.
                                </th>
                                <th className="p-4 font-bold text-slate-400">
                                    Nome Completo
                                </th>
                                <th className="p-4 font-bold text-slate-400">
                                    Departamento
                                </th>
                                <th className="p-4 font-bold text-slate-400">
                                    Função
                                </th>
                                <th className="p-4 font-bold text-slate-400">
                                    Admissão
                                </th>
                                <th className="p-4 text-right font-bold text-slate-400">
                                    Salário Base
                                </th>
                                <th className="p-4 text-right font-bold text-slate-400">
                                    Líquido (Est.)
                                </th>
                                <th className="p-4 text-center font-bold text-slate-400">
                                    Estado
                                </th>
                                <th className="p-4 text-center font-bold text-slate-400">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <User size={48} className="text-slate-300" />
                                            <p className="text-sm font-medium">Nenhum colaborador encontrado</p>
                                            <p className="text-xs text-slate-400">Tente ajustar os filtros de pesquisa</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp, index) => {
                                    const profession = professions.find(p => p.id === emp.professionId);
                                    const estimatedNet = calculateEstimatedNet(emp);

                                    return (
                                        <tr
                                            key={emp.id}
                                            className={`hover:bg-slate-50 transition-colors group ${emp.status === 'Terminated' ? 'bg-red-50 hover:bg-red-100' : ''}`}
                                        >
                                            {/* Photo */}
                                            <td className="px-4 py-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                                                    {emp.photoUrl ? (
                                                        <img
                                                            src={emp.photoUrl}
                                                            alt={emp.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={24} className="text-slate-400" />
                                                    )}
                                                </div>
                                            </td>

                                            {/* Employee Number */}
                                            <td className="px-4 py-3">
                                                <span className={`font-mono text-sm font-bold ${emp.status === 'Terminated' ? 'text-red-700' : 'text-slate-700'}`}>
                                                    {emp.employeeNumber || '---'}
                                                </span>
                                            </td>

                                            {/* Name */}
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                                                    <p className="text-xs text-slate-500">NIF: {emp.nif || '---'}</p>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                                    {emp.department || 'Geral'}
                                                </span>
                                            </td>

                                            {/* Role/Function */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {emp.role || profession?.name || '---'}
                                                </span>
                                            </td>

                                            {/* Admission Date */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">
                                                    {emp.admissionDate ? formatDate(emp.admissionDate) : '---'}
                                                </span>
                                            </td>

                                            {/* Base Salary */}
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-mono font-bold text-slate-800">
                                                    {formatCurrency(emp.baseSalary || 0)}
                                                </span>
                                            </td>

                                            {/* Estimated Net */}
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-mono font-bold text-green-600">
                                                    {formatCurrency(estimatedNet)}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 text-center">
                                                {emp.status === 'Active' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                        Activo
                                                    </span>
                                                )}
                                                {emp.status === 'OnLeave' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                        Em Licença
                                                    </span>
                                                )}
                                                {emp.status === 'Terminated' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                        Demitido
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <EmployeeOptionsMenu
                                                        employee={emp}
                                                        onDismiss={onDismiss || (() => { })}
                                                        onViewProfile={onEdit || (() => { })}
                                                        onViewPersonalFile={onViewPersonalFile || (() => { })}
                                                        onReadmit={onReadmit || (() => { })}
                                                        onIssueContract={onIssueContract || (() => { })}
                                                        onManageUniforms={onManageUniforms || (() => { })}
                                                    />
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Tem certeza que deseja eliminar ${emp.name}?`)) {
                                                                    onDelete(emp.id);
                                                                }
                                                            }}
                                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Eliminar Registo"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Colaboradores</p>
                        <p className="text-2xl font-black text-slate-800">{filteredEmployees.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Activos</p>
                        <p className="text-2xl font-black text-green-600">
                            {filteredEmployees.filter(e => e.status === 'Active').length}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Salário Base Total</p>
                        <p className="text-2xl font-black text-slate-800">
                            {formatCurrency(filteredEmployees.reduce((sum, emp) => sum + (emp.baseSalary || 0), 0))}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Líquido Total (Est.)</p>
                        <p className="text-2xl font-black text-emerald-600">
                            {formatCurrency(filteredEmployees.reduce((sum, emp) => sum + calculateEstimatedNet(emp), 0))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeListPage;
