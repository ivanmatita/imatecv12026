import React, { useState, useMemo } from 'react';
import { Employee, WorkLocation, Profession } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Search, Printer, Plus, Edit, Trash2, User, Eye } from 'lucide-react';

interface EmployeeListPageProps {
    employees: Employee[];
    onSaveEmployee: (emp: Employee) => void;
    workLocations: WorkLocation[];
    professions: Profession[];
    onEdit?: (emp: Employee) => void;
    onDelete?: (empId: string) => void;
    onViewDetails?: (emp: Employee) => void;
    onCreate?: () => void;
}

const EmployeeListPage: React.FC<EmployeeListPageProps> = ({
    employees,
    onSaveEmployee,
    workLocations,
    professions,
    onEdit,
    onDelete,
    onViewDetails,
    onCreate
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
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold">Lista de Colaboradores</h1>
                <p className="text-blue-100 text-sm mt-1">Gestão completa de funcionários da empresa</p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 uppercase block mb-2">
                            Pesquisar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Nome, Nº Mecanográfico, NIF..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase block mb-2">
                            Departamento
                        </label>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                            <option value="ALL">Todos</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase block mb-2">
                            Estado
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
                    <div className="flex gap-2">
                        {onCreate && (
                            <button
                                onClick={onCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold text-sm shadow-sm"
                            >
                                <Plus size={16} />
                                Novo Colaborador
                            </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 font-bold text-sm"
                        >
                            <Printer size={16} />
                            Imprimir
                        </button>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-300">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Foto
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Nº Mec.
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Nome Completo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Departamento
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Função
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Admissão
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Salário Base
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Líquido (Est.)
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                                            className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
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
                                                <span className="font-mono text-sm font-bold text-slate-700">
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
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                    {emp.department || 'Não definido'}
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
                                                    {onViewDetails && (
                                                        <button
                                                            onClick={() => onViewDetails(emp)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                            title="Ver Detalhes"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(emp)}
                                                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                                            title="Editar"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Tem certeza que deseja eliminar ${emp.name}?`)) {
                                                                    onDelete(emp.id);
                                                                }
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                            title="Eliminar"
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
                        <p className="text-2xl font-black text-blue-600">
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
