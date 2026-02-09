
import React, { useState, useMemo } from 'react';
import {
    Employee, SalarySlip, HrTransaction, AttendanceRecord, Company,
    WorkLocation, Contract
} from '../types';
import {
    FileText, Printer, Download, Save, ArrowLeft, Calculator,
    Calendar, DollarSign, Clock, AlertTriangle, CheckCircle,
    UserX, History, Briefcase, MinusCircle
} from 'lucide-react';
import { FormStyles } from './FormStyles';
import { formatCurrency, formatDate } from '../utils';

interface LaborExtinctionProps {
    employee: Employee;
    company: Company;
    payrollHistory: SalarySlip[];
    attendanceHistory: AttendanceRecord[];
    contracts: Contract[];
    onClose: () => void;
    onSave: (data: any) => void;
    onReadmit?: (emp: Employee) => void;
}

const LaborExtinction: React.FC<LaborExtinctionProps> = ({
    employee, company, payrollHistory, attendanceHistory, contracts, onClose, onSave, onReadmit
}) => {
    const [activeTab, setActiveTab] = useState<'CONTRACT' | 'SALARY' | 'TIME' | 'ATTENDANCE' | 'FINANCE' | 'CALC'>('CALC');
    const [indemnityConfig, setIndemnityConfig] = useState({
        baseSalaryRef: 'CURRENT', // CURRENT or AVERAGE_12
        yearsMultiplier: 1.0, // months per year of service usually
        includeVacation: true,
        includeChristmas: true,
        otherCompensation: 0
    });

    // --- 2. IDENTIFICAÇÃO (HEADER) ---
    const renderHeader = () => (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 border-2 border-red-200">
                    <UserX size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase">{employee.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded">ID: {employee.id}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded">NIF: {employee.nif}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded border border-red-200 flex items-center gap-1">
                            <MinusCircle size={10} /> DEMITIDO
                        </span>
                    </div>
                </div>
            </div>
            <div className="text-right text-sm text-slate-600">
                <p><strong>Admissão:</strong> {formatDate(employee.admissionDate)}</p>
                <p><strong>Demissão:</strong> {employee.dismissalDate ? formatDate(employee.dismissalDate) : '-'}</p>
                <p className="text-red-600"><strong>Motivo:</strong> {employee.dismissalReason || 'Não especificado'}</p>
            </div>
        </div>
    );

    // --- 3. HISTÓRICO ---
    const empContracts = useMemo(() => contracts.filter(c => c.employeeId === employee.id), [contracts, employee.id]);
    const empSlips = useMemo(() => payrollHistory.filter(p => p.employeeId === employee.id).sort((a, b) => b.month - a.month || b.year - a.year), [payrollHistory, employee.id]);

    // Service Time Calculation
    const serviceTime = useMemo(() => {
        const start = new Date(employee.admissionDate);
        const end = employee.dismissalDate ? new Date(employee.dismissalDate) : new Date();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        const days = (diffDays % 365) % 30;
        return { years, months, days, totalDays: diffDays };
    }, [employee]);

    // Financials
    const calculateIndemnity = () => {
        const salaryBase = indemnityConfig.baseSalaryRef === 'CURRENT'
            ? (employee.baseSalary || 0)
            : (empSlips.slice(0, 12).reduce((acc, curr) => acc + curr.grossTotal, 0) / (empSlips.length || 1));

        const yearsValue = serviceTime.years * salaryBase * indemnityConfig.yearsMultiplier;
        const vacationValue = indemnityConfig.includeVacation ? salaryBase : 0; // Simplification
        const christmasValue = indemnityConfig.includeChristmas ? (salaryBase / 12) * serviceTime.months : 0;

        return {
            salaryBase,
            timeIndemnity: yearsValue,
            vacationIndemnity: vacationValue,
            christmasIndemnity: christmasValue,
            other: indemnityConfig.otherCompensation,
            total: yearsValue + vacationValue + christmasValue + indemnityConfig.otherCompensation
        };
    };

    const indemnityResult = calculateIndemnity();

    // --- RENDER TABS ---
    const renderContent = () => {
        switch (activeTab) {
            case 'CONTRACT':
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 border-b pb-2">Histórico Contratual</h3>
                        {empContracts.length > 0 ? (
                            empContracts.map(c => (
                                <div key={c.id} className="bg-white p-4 rounded border flex justify-between">
                                    <div>
                                        <p className="font-bold">{c.type}</p>
                                        <p className="text-sm text-slate-500">{formatDate(c.startDate)} - {formatDate(c.endDate)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                                </div>
                            ))
                        ) : <p className="text-slate-500 italic">Sem contratos registados.</p>}
                    </div>
                );
            case 'SALARY':
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 border-b pb-2">Histórico Salarial (Últimos 12 meses)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                                    <tr>
                                        <th className="p-2">Mês/Ano</th>
                                        <th className="p-2">Salário Base</th>
                                        <th className="p-2">Subsídios</th>
                                        <th className="p-2">Bruto</th>
                                        <th className="p-2">Líquido</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empSlips.slice(0, 12).map(slip => (
                                        <tr key={slip.id} className="border-b hover:bg-slate-50">
                                            <td className="p-2">{slip.month}/{slip.year}</td>
                                            <td className="p-2">{formatCurrency(slip.baseSalary)}</td>
                                            <td className="p-2">{formatCurrency(slip.subsidies)}</td>
                                            <td className="p-2">{formatCurrency(slip.grossTotal)}</td>
                                            <td className="p-2 font-bold text-blue-600">{formatCurrency(slip.netTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'TIME':
                return (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <p className="text-3xl font-black text-blue-600">{serviceTime.years}</p>
                            <p className="text-xs uppercase font-bold text-blue-400">Anos</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <p className="text-3xl font-black text-blue-600">{serviceTime.months}</p>
                            <p className="text-xs uppercase font-bold text-blue-400">Meses</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <p className="text-3xl font-black text-blue-600">{serviceTime.days}</p>
                            <p className="text-xs uppercase font-bold text-blue-400">Dias</p>
                        </div>
                        <div className="col-span-3 bg-slate-100 p-4 rounded text-center mt-4">
                            <p className="font-bold text-slate-700">Total de Dias de Serviço: {serviceTime.totalDays}</p>
                        </div>
                    </div>
                );
            case 'CALC':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2"><SettingsIcon /> Configuração do Cálculo</h3>
                                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
                                    <div>
                                        <label className={FormStyles.label}>Base Salarial</label>
                                        <select
                                            className={FormStyles.select}
                                            value={indemnityConfig.baseSalaryRef}
                                            onChange={e => setIndemnityConfig({ ...indemnityConfig, baseSalaryRef: e.target.value })}
                                        >
                                            <option value="CURRENT">Salário Atual</option>
                                            <option value="AVERAGE_12">Média 12 Meses</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={FormStyles.label}>Meses por Ano (Indemnização)</label>
                                        <input
                                            type="number" className={FormStyles.input}
                                            value={indemnityConfig.yearsMultiplier}
                                            onChange={e => setIndemnityConfig({ ...indemnityConfig, yearsMultiplier: Number(e.target.value) })}
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            checked={indemnityConfig.includeVacation}
                                            onChange={e => setIndemnityConfig({ ...indemnityConfig, includeVacation: e.target.checked })}
                                        />
                                        <label className="text-sm">Incluir Férias não gozadas</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={indemnityConfig.includeChristmas}
                                            onChange={e => setIndemnityConfig({ ...indemnityConfig, includeChristmas: e.target.checked })}
                                        />
                                        <label className="text-sm">Incluir Subsídio de Natal Prop.</label>
                                    </div>
                                    <div>
                                        <label className={FormStyles.label}>Compensação Adicional</label>
                                        <input
                                            type="number" className={FormStyles.input}
                                            value={indemnityConfig.otherCompensation}
                                            onChange={e => setIndemnityConfig({ ...indemnityConfig, otherCompensation: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Calculator size={16} /> Resultado (Simulação)</h3>
                                <div className="bg-white p-0 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="p-4 border-b bg-slate-50 flex justify-between">
                                        <span className="text-sm text-slate-600">Base de Cálculo</span>
                                        <span className="font-bold text-slate-800">{formatCurrency(indemnityResult.salaryBase)}</span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Por Tempo de Serviço ({serviceTime.years} anos)</span>
                                            <span>{formatCurrency(indemnityResult.timeIndemnity)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Férias não gozadas</span>
                                            <span>{formatCurrency(indemnityResult.vacationIndemnity)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Sub. Natal Proporcional</span>
                                            <span>{formatCurrency(indemnityResult.christmasIndemnity)}</span>
                                        </div>
                                        {indemnityResult.other > 0 && (
                                            <div className="flex justify-between text-sm text-blue-600">
                                                <span>Compensação Adicional</span>
                                                <span>{formatCurrency(indemnityResult.other)}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2 mt-2 flex justify-between font-black text-lg text-slate-800">
                                            <span>TOTAL A PAGAR</span>
                                            <span>{formatCurrency(indemnityResult.total)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-4 border-t border-green-100 text-center">
                                        <p className="text-xs font-bold text-green-700 uppercase mb-2">Estado do Pagamento</p>
                                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                                            ⏳ PENDENTE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button className={`${FormStyles.buttonPrimary} bg-slate-800`} onClick={() => window.print()}>
                                <Printer size={18} /> Imprimir Termo de Rescisão
                            </button>
                            <button className={FormStyles.buttonSecondary}>
                                <Download size={18} /> Baixar PDF
                            </button>
                            <button className={FormStyles.buttonPrimary}>
                                <Save size={18} /> Registar Extinção
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    const SettingsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    );

    return (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto animate-in fade-in">
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-black text-slate-800 uppercase">Extinção Laboral</h1>
                </div>

                {renderHeader()}

                {/* TABS HEADER */}
                <div className="flex overflow-x-auto border-b border-slate-200 mb-6 gap-6">
                    <button onClick={() => setActiveTab('CALC')} className={`pb-3 font-bold text-sm uppercase whitespace-nowrap px-2 border-b-2 transition ${activeTab === 'CALC' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        Cálculo Automático
                    </button>
                    <button onClick={() => setActiveTab('CONTRACT')} className={`pb-3 font-bold text-sm uppercase whitespace-nowrap px-2 border-b-2 transition ${activeTab === 'CONTRACT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        Histórico Contratual
                    </button>
                    <button onClick={() => setActiveTab('SALARY')} className={`pb-3 font-bold text-sm uppercase whitespace-nowrap px-2 border-b-2 transition ${activeTab === 'SALARY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        Histórico Salarial
                    </button>
                    <button onClick={() => setActiveTab('TIME')} className={`pb-3 font-bold text-sm uppercase whitespace-nowrap px-2 border-b-2 transition ${activeTab === 'TIME' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        Tempo de Serviço
                    </button>
                    {/* Reuse/Link Readmission here if needed */}
                </div>

                <div className="animate-in slide-in-from-bottom-2 duration-300">
                    {renderContent()}
                </div>

                {onReadmit && (
                    <div className="mt-10 border-t pt-6">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <History size={18} /> Opções Futuras
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-blue-900">Readmissão de Colaborador</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Iniciar novo ciclo contratual mantendo histórico anterior.
                                </p>
                            </div>
                            <button
                                onClick={() => onReadmit(employee)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm"
                            >
                                Readmitir Funcionário
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LaborExtinction;
