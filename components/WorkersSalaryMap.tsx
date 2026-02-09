import React, { useState, useMemo } from 'react';
import { Employee, Company } from '../types';
import { formatDate } from '../utils';
import { Printer, Download, Search, ArrowLeft, Filter } from 'lucide-react';

interface WorkersSalaryMapProps {
    employees: Employee[];
    onClose: () => void;
    company: Company;
}

const WorkersSalaryMap: React.FC<WorkersSalaryMapProps> = ({ employees, onClose, company }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    // Filter Active Employees
    const activeEmployees = useMemo(() => {
        return employees.filter(e => {
            const isActive = e.status === 'Active';
            const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (e.employeeNumber && e.employeeNumber.includes(searchTerm));
            return isActive && matchesSearch;
        });
    }, [employees, searchTerm]);

    const calculateAntiquity = (admissionDate?: string) => {
        if (!admissionDate) return 0;
        const start = new Date(admissionDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 print:p-0 print:bg-white">
            <div className="max-w-[1400px] mx-auto bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none">

                {/* Header NOT for Print */}
                <div className="bg-slate-800 p-4 flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="text-slate-300 hover:text-white transition">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-white font-bold text-lg">Mapa de Trabalhadores por Vencimento</h1>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-700 border-none rounded text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
                            />
                        </div>
                        <select
                            value={month}
                            onChange={e => setMonth(Number(e.target.value))}
                            className="bg-slate-700 text-white text-sm rounded px-3 border-none focus:ring-1 focus:ring-blue-500"
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('pt-AO', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="bg-slate-700 text-white text-sm rounded px-3 border-none focus:ring-1 focus:ring-blue-500"
                        >
                            {[2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm transition">
                            <Printer size={16} /> Imprimir
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm transition">
                            <Download size={16} /> PDF
                        </button>
                    </div>
                </div>

                {/* Print Content */}
                <div className="p-8 print:p-4">
                    <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">{company.name}</h2>
                        <p className="text-sm font-bold text-slate-600 mt-1">NIF: {company.nif}</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-4 underline decoration-2 underline-offset-4">
                            LISTAGEM DE TRABALHADORES ACTIVOS POR VENCIMENTO
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-2">
                            Referente a: {new Date(year, month - 1).toLocaleString('pt-AO', { month: 'long' })} / {year}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse border border-slate-300">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                                <tr>
                                    <th className="border border-slate-300 px-2 py-2">IDNF</th>
                                    <th className="border border-slate-300 px-2 py-2">Data Admissão</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center">Antiguidade Dias</th>
                                    <th className="border border-slate-300 px-2 py-2">Nome Funcionario</th>
                                    <th className="border border-slate-300 px-2 py-2">Profissão</th>
                                    <th className="border border-slate-300 px-2 py-2">Local de Trabalho</th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">Salário Base</th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">Ajudas Custo</th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">Total de Subsídios</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center">Carga Horária</th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">VCT TOTAL</th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">Total de Vencimentos</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeEmployees.map((emp) => {
                                    const helpCosts = (emp.subsidyFood || 0) + (emp.subsidyTransport || 0);
                                    const otherSubs = (emp.otherSubsidies || 0) + (emp.subsidyFamily || 0) + (emp.subsidyHousing || 0);
                                    const totalSubs = helpCosts + otherSubs;
                                    const totalVenc = (emp.baseSalary || 0) + totalSubs;

                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-50">
                                            <td className="border border-slate-300 px-2 py-1 font-mono">{emp.employeeNumber}</td>
                                            <td className="border border-slate-300 px-2 py-1">{emp.admissionDate ? formatDate(emp.admissionDate) : '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center bg-slate-50">{calculateAntiquity(emp.admissionDate)}</td>
                                            <td className="border border-slate-300 px-2 py-1 font-bold">{emp.name}</td>
                                            <td className="border border-slate-300 px-2 py-1">{emp.role}</td>
                                            <td className="border border-slate-300 px-2 py-1">{emp.workLocationId || 'Sede'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-right font-medium">{(emp.baseSalary || 0).toLocaleString('pt-AO')}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-right text-slate-500">{helpCosts.toLocaleString('pt-AO')}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-right text-slate-500">{totalSubs.toLocaleString('pt-AO')}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center">8h</td>
                                            <td className="border border-slate-300 px-2 py-1 text-right font-bold bg-slate-50">{totalVenc.toLocaleString('pt-AO')}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-right font-bold bg-slate-100">{totalVenc.toLocaleString('pt-AO')}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center font-bold text-green-700">ACTIVO</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold">
                                <tr>
                                    <td colSpan={6} className="border border-slate-300 px-4 py-2 text-right uppercase">Totais:</td>
                                    <td className="border border-slate-300 px-2 py-2 text-right">
                                        {activeEmployees.reduce((sum, e) => sum + (e.baseSalary || 0), 0).toLocaleString('pt-AO')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2 text-right">
                                        {activeEmployees.reduce((sum, e) => sum + (e.subsidyFood || 0) + (e.subsidyTransport || 0), 0).toLocaleString('pt-AO')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2 text-right">
                                        {activeEmployees.reduce((sum, e) => {
                                            const help = (e.subsidyFood || 0) + (e.subsidyTransport || 0);
                                            const other = (e.otherSubsidies || 0) + (e.subsidyFamily || 0) + (e.subsidyHousing || 0);
                                            return sum + help + other;
                                        }, 0).toLocaleString('pt-AO')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2"></td>
                                    <td className="border border-slate-300 px-2 py-2 text-right text-blue-800">
                                        {activeEmployees.reduce((sum, e) => {
                                            const total = (e.baseSalary || 0) + (e.subsidyFood || 0) + (e.subsidyTransport || 0) + (e.otherSubsidies || 0) + (e.subsidyFamily || 0) + (e.subsidyHousing || 0);
                                            return sum + total;
                                        }, 0).toLocaleString('pt-AO')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2 text-right text-blue-800">
                                        {activeEmployees.reduce((sum, e) => {
                                            const total = (e.baseSalary || 0) + (e.subsidyFood || 0) + (e.subsidyTransport || 0) + (e.otherSubsidies || 0) + (e.subsidyFamily || 0) + (e.subsidyHousing || 0);
                                            return sum + total;
                                        }, 0).toLocaleString('pt-AO')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-between items-end">
                        <div className="text-xs text-slate-500">
                            <p>Processado por: Sistema Integrado</p>
                            <p>Data: {new Date().toLocaleDateString('pt-AO')}</p>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded text-right">
                            <p className="text-xs font-bold uppercase text-slate-500">Total de Trabalhadores Activos</p>
                            <p className="text-3xl font-black text-slate-800 leading-none">{activeEmployees.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkersSalaryMap;
