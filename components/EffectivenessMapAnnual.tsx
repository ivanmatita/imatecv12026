import React, { useState } from 'react';
import { Employee, Company, AttendanceRecord } from '../types';
import { formatDate } from '../utils';
import { Printer, Download, Search, ArrowLeft } from 'lucide-react';

interface EffectivenessMapAnnualProps {
    employees: Employee[];
    attendance: AttendanceRecord[];
    onClose: () => void;
    company: Company;
}

const EffectivenessMapAnnual: React.FC<EffectivenessMapAnnualProps> = ({ employees, attendance, onClose, company }) => {
    const [year, setYear] = useState(new Date().getFullYear());

    const handlePrint = () => {
        window.print();
    };

    // Helper to aggregate attendance data for the year per employee
    const getEmployeeAnnualStats = (empId: string) => {
        const empAttendance = attendance.filter(a => a.employeeId === empId && a.year === year);

        let serviceDays = 0;
        let daysOff = 0;
        let justifiedAbsences = 0;
        let unjustifiedAbsences = 0;
        let vacationDays = 0;

        empAttendance.forEach(record => {
            Object.values(record.days).forEach((day: any) => {
                if (day.status === 'SERVICO') serviceDays++;
                if (day.status === 'FOLGA') daysOff++;
                if (day.status === 'FALTA_JUST') justifiedAbsences++;
                if (day.status === 'FALTA_INJUST') unjustifiedAbsences++;
                if (day.status === 'FERIAS') vacationDays++;
            });
        });

        return { serviceDays, daysOff, justifiedAbsences, unjustifiedAbsences, vacationDays };
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
                        <h1 className="text-white font-bold text-lg">Mapa de Efectividade Anual</h1>
                    </div>
                    <div className="flex gap-2">
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
                        <div className="flex justify-center gap-4 text-sm font-bold text-slate-600 mt-1">
                            <span>NIF: {company.nif}</span>
                            <span>•</span>
                            <span>Exercício: {year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mt-4 underline decoration-2 underline-offset-4">
                            MAPA DE EFECTIVIDADE - RESUMO ANUAL
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse border border-slate-300">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-center">
                                <tr>
                                    <th className="border border-slate-300 px-2 py-2">Data de admissao</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">Nome do Beneficiário</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">Profissao</th>
                                    <th className="border border-slate-300 px-2 py-2">NIF</th>
                                    <th className="border border-slate-300 px-2 py-2">local de trabalho</th>
                                    <th className="border border-slate-300 px-2 py-2">Nº da INSS</th>
                                    <th className="border border-slate-300 px-2 py-2 bg-blue-50">Indicação dos dias Serviço</th>
                                    <th className="border border-slate-300 px-2 py-2">Folga</th>
                                    <th className="border border-slate-300 px-2 py-2 bg-yellow-50">faltas Justi</th>
                                    <th className="border border-slate-300 px-2 py-2 bg-red-50">faltas Injust</th>
                                    <th className="border border-slate-300 px-2 py-2 bg-green-50">Ferias</th>
                                    <th className="border border-slate-300 px-2 py-2">sub ferias</th>
                                    <th className="border border-slate-300 px-2 py-2">outros subsidios</th>
                                    <th className="border border-slate-300 px-2 py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, index) => {
                                    const stats = getEmployeeAnnualStats(emp.id);
                                    const totalDays = stats.serviceDays + stats.daysOff + stats.justifiedAbsences + stats.unjustifiedAbsences + stats.vacationDays;

                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-50">
                                            <td className="border border-slate-300 px-2 py-1 text-center">{emp.admissionDate ? formatDate(emp.admissionDate) : '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 font-bold">{emp.name}</td>
                                            <td className="border border-slate-300 px-2 py-1">{emp.role}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center">{emp.nif}</td>
                                            <td className="border border-slate-300 px-2 py-1">{emp.workLocationId || 'Sede'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center">{emp.socialSecurityNumber || '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center font-bold bg-blue-50/50">{stats.serviceDays}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center">{stats.daysOff}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center bg-yellow-50/50">{stats.justifiedAbsences}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center font-bold text-red-600 bg-red-50/50">{stats.unjustifiedAbsences}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center font-bold text-green-600 bg-green-50/50">{stats.vacationDays}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center">{(emp.subsidyVacation || 0).toLocaleString('pt-AO')}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center">{(emp.otherSubsidies || 0).toLocaleString('pt-AO')}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center font-bold">{totalDays}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 text-xs text-slate-500 text-center">
                        <p>Documento processado por computador • Imatec Soft 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EffectivenessMapAnnual;
