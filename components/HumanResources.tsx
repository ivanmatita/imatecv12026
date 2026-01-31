
import React, { useState, useMemo, useEffect } from 'react';
import {
    Employee, HrTransaction, HrVacation, SalarySlip, Profession,
    Contract, AttendanceRecord, Company, DailyAttendance, WorkLocation, CashRegister, TransferOrder
} from '../types';
import {
    generateId, formatCurrency, formatDate, calculateINSS, calculateIRT, roundToNearestBank, numberToExtenso, generateQrCodeUrl
} from '../utils';
import {
    Users, UserPlus, ClipboardList, Briefcase, Calculator, Calendar,
    FileText, Printer, Search, Plus, Trash2, X, Table,
    MoreVertical, RefreshCw, Loader2, CheckCircle, AlertTriangle,
    Clock, Shield, LayoutDashboard, ChevronDown, ListCheck,
    Gavel, HeartHandshake, Eye, Ruler, Gift, Wallet, TrendingUp,
    Sparkles, Database, ArrowLeft, ChevronRight, Save, Info, Zap,
    Edit3, Trash, User, List, ShieldCheck, ArrowRightLeft, Edit
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SalaryMap from './SalaryMap';
import TaxMaps from './TaxMaps';
import SalaryReceiptsModal from './SalaryReceiptsModal';
import ProfessionManager from './ProfessionManager';
import Employees from './Employees';
import TransferOrderModal from './TransferOrderModal';
import ProcessSalary from './ProcessSalary';

interface HumanResourcesProps {
    employees: Employee[];
    onSaveEmployee: (emp: Employee) => void;
    transactions: HrTransaction[];
    onSaveTransaction: (t: HrTransaction) => void;
    vacations: HrVacation[];
    onSaveVacation: (v: HrVacation) => void;
    payroll: SalarySlip[];
    onProcessPayroll: (slips: SalarySlip[]) => void;
    professions: Profession[];
    onSaveProfession: (p: Profession) => void;
    onDeleteProfession: (id: string) => void;
    contracts: Contract[];
    onSaveContract: (c: Contract) => void;
    attendance: AttendanceRecord[];
    onSaveAttendance: (a: AttendanceRecord) => void;
    company: Company;
    workLocations: WorkLocation[];
    onPrintSlip?: (emp: Employee) => void;
    cashRegisters?: CashRegister[];
    onUpdateCashRegister?: (cr: CashRegister) => void;
}

const HumanResources: React.FC<HumanResourcesProps> = ({
    employees, onSaveEmployee, transactions, onSaveTransaction,
    vacations, onSaveVacation, payroll, onProcessPayroll,
    professions, onSaveProfession, onDeleteProfession,
    contracts, onSaveContract, attendance, onSaveAttendance,
    company,
    workLocations,
    onPrintSlip,
    cashRegisters = [],
    onUpdateCashRegister
}) => {
    const [activeTab, setActiveTab] = useState<'ASSIDUIDADE' | 'PROFISSÕES' | 'COLABORADORES' | 'PROCESSAMENTO'>('ASSIDUIDADE');
    const [processingState, setProcessingState] = useState<'LIST' | 'DETAILED_ATTENDANCE' | 'SALARY_RESULT'>('LIST');
    const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
    const [currentAttendance, setCurrentAttendance] = useState<Record<number, DailyAttendance>>({});

    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
    const [editSlip, setEditSlip] = useState<SalarySlip | null>(null);
    const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<string>('');

    const [searchTerm, setSearchTerm] = useState('');
    const [processingMonth, setProcessingMonth] = useState(new Date().getMonth() + 1);
    const [processingYear, setProcessingYear] = useState(new Date().getFullYear());
    const [isProcessing, setIsProcessing] = useState(false);
    const [showTransferOrder, setShowTransferOrder] = useState<TransferOrder | null>(null);
    const [showTaxMaps, setShowTaxMaps] = useState(false);
    const [showReceipts, setShowReceipts] = useState(false);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const daysInMonth = useMemo(() => {
        return new Date(processingYear, processingMonth, 0).getDate();
    }, [processingMonth, processingYear]);

    const getDayName = (day: number, month: number, year: number) => {
        const date = new Date(year, month - 1, day);
        const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
        return days[date.getDay()];
    };

    const handleOpenDetailedAttendance = (emp: Employee) => {
        setActiveEmployee(emp);
        const initialAtt: Record<number, DailyAttendance> = {};
        for (let d = 1; d <= daysInMonth; d++) {
            initialAtt[d] = {
                day: d,
                present: true,
                worked: true,
                hours: 8,
                extraHours: 0,
                absences: 0,
                lateMinutes: 0
            };
        }
        setCurrentAttendance(initialAtt);
        setProcessingState('DETAILED_ATTENDANCE');
    };

    const calculateSlip = (emp: Employee, att: Record<number, DailyAttendance>): SalarySlip => {
        const totalWorkedDays = Object.values(att).filter(d => d.worked).length;
        const totalAbsences = Object.values(att).reduce((sum, d) => sum + (d.absences || 0), 0);
        const totalHours = Object.values(att).reduce((sum, d) => sum + (d.hours || 0), 0);
        const totalExtraHours = Object.values(att).reduce((sum, d) => sum + (d.extraHours || 0), 0);

        const profession = professions.find(p => p.id === emp.professionId);
        const baseSalary = profession?.baseSalary || 0;
        const dailyRate = baseSalary / 30;
        const hourlyRate = baseSalary / (30 * 8);

        const basePay = dailyRate * totalWorkedDays;
        const extraPay = hourlyRate * totalExtraHours * 1.5;
        const absenceDeduction = dailyRate * totalAbsences;

        const grossSalary = basePay + extraPay - absenceDeduction;

        const subsidyVacation = emp.subsidyVacation || 0;
        const subsidyChristmas = emp.subsidyChristmas || 0;
        const subsidyHousing = emp.subsidyHousing || 0;
        const allowances = emp.allowances || 0;
        const subsidyFood = emp.subsidyFood || 0;
        const subsidyTransport = emp.subsidyTransport || 0;

        const taxableIncome = grossSalary + subsidyVacation + subsidyChristmas + subsidyHousing + allowances;
        const exemptIncome = subsidyFood + subsidyTransport;

        const inss = calculateINSS(taxableIncome);
        const irt = calculateIRT(taxableIncome - inss);

        const salaryAdjustments = emp.salaryAdjustments || 0;
        const penalties = emp.penalties || 0;
        const advances = emp.advances || 0;

        const totalDeductions = inss + irt + penalties + advances;
        const netSalary = taxableIncome + exemptIncome + salaryAdjustments - totalDeductions;

        return {
            id: generateId(),
            employeeId: emp.id,
            employeeName: emp.name,
            month: processingMonth,
            year: processingYear,
            baseSalary,
            grossSalary,
            netSalary: roundToNearestBank(netSalary),
            subsidyVacation,
            subsidyChristmas,
            subsidyHousing,
            allowances,
            subsidyFood,
            subsidyTransport,
            inss,
            irt,
            totalDeductions,
            workDays: totalWorkedDays,
            absences: totalAbsences,
            extraHours: totalExtraHours,
            salaryAdjustments,
            penalties,
            advances,
            cashRegisterId: selectedCashRegisterId,
            processedAt: new Date().toISOString()
        };
    };

    const handleProcessDetailed = () => {
        if (!activeEmployee) return;
        const slip = calculateSlip(activeEmployee, currentAttendance);
        setEditSlip(slip);
        setProcessingState('SALARY_RESULT');
    };

    const handleConfirmFinalProcess = async (finalSlip: SalarySlip) => {
        if (!activeEmployee) return;

        setIsProcessing(true);
        try {
            onProcessPayroll([finalSlip]);

            const updatedEmp = { ...activeEmployee, isMagic: true };
            onSaveEmployee(updatedEmp);

            if (selectedCashRegisterId && onUpdateCashRegister) {
                const cashReg = cashRegisters.find(c => c.id === selectedCashRegisterId);
                if (cashReg) {
                    const updatedCashReg = {
                        ...cashReg,
                        balance: cashReg.balance - finalSlip.netSalary
                    };
                    onUpdateCashRegister(updatedCashReg);
                }
            }

            alert('Processamento concluído com sucesso!');
            setProcessingState('LIST');
            setActiveEmployee(null);
            setEditSlip(null);
        } catch (err) {
            alert('Erro ao processar: ' + (err as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProcessAll = async () => {
        if (!confirm(`Processar assiduidade de ${employees.length} funcionários para ${months[processingMonth - 1]}/${processingYear}?`)) return;
        if (!selectedCashRegisterId) return alert('Selecione um caixa de saída primeiro!');

        setIsProcessing(true);
        const slips: SalarySlip[] = [];
        let totalPayment = 0;

        try {
            for (const emp of employees) {
                if (emp.isMagic) continue;

                const initialAtt: Record<number, DailyAttendance> = {};
                for (let d = 1; d <= daysInMonth; d++) {
                    initialAtt[d] = {
                        day: d,
                        present: true,
                        worked: true,
                        hours: 8,
                        extraHours: 0,
                        absences: 0,
                        lateMinutes: 0
                    };
                }

                const slip = calculateSlip(emp, initialAtt);
                slips.push(slip);
                totalPayment += slip.netSalary;

                const updatedEmp = { ...emp, isMagic: true };
                onSaveEmployee(updatedEmp);
            }

            onProcessPayroll(slips);

            if (onUpdateCashRegister) {
                const cashReg = cashRegisters.find(c => c.id === selectedCashRegisterId);
                if (cashReg) {
                    const updatedCashReg = {
                        ...cashReg,
                        balance: cashReg.balance - totalPayment
                    };
                    onUpdateCashRegister(updatedCashReg);
                }
            }

            alert(`✅ ${slips.length} funcionários processados! Total pago: ${formatCurrency(totalPayment)}`);
        } catch (err) {
            alert('Erro: ' + (err as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnprocessAll = () => {
        const ids = Array.from(selectedEmployeeIds);
        if (ids.length === 0) return alert('Selecione pelo menos um funcionário!');
        if (!confirm(`Desprocessar ${ids.length} funcionário(s)?`)) return;

        setIsProcessing(true);
        try {
            ids.forEach(id => {
                const emp = employees.find(e => e.id === id);
                if (emp && emp.isMagic) {
                    const updatedEmp = { ...emp, isMagic: false };
                    onSaveEmployee(updatedEmp);
                }
            });

            setSelectedEmployeeIds(new Set());
            alert('Desprocessamento concluído!');
        } catch (err) {
            alert('Erro: ' + (err as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const onUpdateEmployeeField = (empId: string, field: keyof Employee, value: any) => {
        const emp = employees.find(e => e.id === empId);
        if (emp) {
            const updated = { ...emp, [field]: value };
            onSaveEmployee(updated);
        }
    };

    const toggleEmployeeSelection = (id: string) => {
        const newSet = new Set(selectedEmployeeIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedEmployeeIds(newSet);
    };

    const toggleSelectAll = () => {
        setSelectedEmployeeIds(selectedEmployeeIds.size === employees.length ? new Set() : new Set(employees.map(e => e.id)));
    };

    const renderAttendanceGrid = () => {
        if (!activeEmployee) return null;

        const isLocked = (d: number) => {
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();
            if (processingYear < currentYear) return true;
            if (processingYear === currentYear && processingMonth < currentMonth) return true;
            if (processingYear === currentYear && processingMonth === currentMonth && d > currentDay) return false;
            return false;
        };

        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Assiduidade Detalhada - {activeEmployee.name}</h3>
                            <p className="text-sm text-slate-500">{months[processingMonth - 1]} de {processingYear}</p>
                        </div>
                        <button onClick={() => setProcessingState('LIST')} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-6">
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayName = getDayName(day, processingMonth, processingYear);
                            const att = currentAttendance[day] || { day, present: true, worked: true, hours: 8, extraHours: 0, absences: 0, lateMinutes: 0 };

                            return (
                                <div key={day} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                                    <div className="text-xs font-bold text-slate-600 mb-2">{dayName} {day}</div>
                                    <label className="flex items-center gap-2 text-xs mb-1">
                                        <input type="checkbox" checked={att.worked} onChange={e => setCurrentAttendance({ ...currentAttendance, [day]: { ...att, worked: e.target.checked } })} className="rounded" />
                                        Trabalhou
                                    </label>
                                    <input type="number" className="w-full p-1 border rounded text-xs" placeholder="Horas" value={att.hours} onChange={e => setCurrentAttendance({ ...currentAttendance, [day]: { ...att, hours: Number(e.target.value) } })} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setProcessingState('LIST')} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button onClick={handleProcessDetailed} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Calculator size={16} /> Calcular Salário
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderEffectivityList = () => {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-3 font-semibold text-slate-700">Nome</th>
                            <th className="p-3 font-semibold text-slate-700">Profissão</th>
                            <th className="p-3 font-semibold text-slate-700">Salário Base</th>
                            <th className="p-3 font-semibold text-slate-700">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {employees.map(emp => {
                            const profession = professions.find(p => p.id === emp.professionId);
                            return (
                                <tr key={emp.id} className="hover:bg-slate-50">
                                    <td className="p-3">{emp.name}</td>
                                    <td className="p-3">{profession?.internalName || '---'}</td>
                                    <td className="p-3 font-mono">{formatCurrency(profession?.baseSalary || 0)}</td>
                                    <td className="p-3">
                                        {emp.isMagic ? (
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Processado</span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Pendente</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContent = () => {
        if (processingState === 'DETAILED_ATTENDANCE') return renderAttendanceGrid();
        if (processingState === 'SALARY_RESULT' && editSlip) return (
            <SalaryMap
                payroll={[editSlip]}
                employees={employees}
                company={company}
                onProcess={handleConfirmFinalProcess}
                onCancel={() => setProcessingState('DETAILED_ATTENDANCE')}
            />
        );

        return (
            <div className="space-y-4 animate-in fade-in">
                {/* Header similar to the image */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">ASSIDUIDADE DOS COLABORADORES</h2>
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Valores em AOA</span>
                        </div>

                        <button
                            onClick={() => setShowTaxMaps(true)}
                            className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <Table size={16} className="text-blue-600" />
                            <span className="hidden xl:inline">Mapas IRT/ INSS</span>
                        </button>

                        <button
                            onClick={() => setShowTransferOrder(true)}
                            className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <ArrowRightLeft size={16} className="text-green-600" />
                            <span className="hidden xl:inline">Ordem de Transferência</span>
                        </button>

                        <button
                            onClick={() => setShowReceipts(true)}
                            className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <Printer size={16} className="text-purple-600" />
                            <span className="hidden xl:inline">Recibos de Salário</span>
                        </button>

                        <button onClick={() => setActiveTab('COLABORADORES')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                            <Plus size={16} /> <span className="hidden sm:inline">CRIAR PROFISSÃO</span>
                        </button>
                    </div>
                </div>

                {/* Table with clean design like the image */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase">Data</th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase">User</th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase">Profissão Interna</th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase text-center">COD</th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase">Consultar INSS<br /><span className="text-blue-600">Profissão Indexada</span></th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase text-right">Salário Base</th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase text-right">Ajudas Custo Referenciada</th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase text-right">Vencimento Ilíquido</th>
                                <th className="p-3 text-xs font-semibold text-slate-600 uppercase text-center">Opções</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp, index) => {
                                const profession = professions.find(p => p.id === emp.professionId);
                                return (
                                    <tr key={emp.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="p-3 text-sm text-slate-700">{formatDate(emp.admissionDate)}</td>
                                        <td className="p-3 text-sm font-semibold text-slate-800">{emp.name.split(' ')[0]}</td>
                                        <td className="p-3 text-sm font-bold text-slate-900">{profession?.internalName || '---'}</td>
                                        <td className="p-3 text-sm text-center font-mono text-slate-600">{index + 1}</td>
                                        <td className="p-3 text-sm text-blue-600">{profession?.indexedName || '---'}</td>
                                        <td className="p-3 text-sm text-right font-mono font-bold text-blue-600">
                                            {formatCurrency(profession?.baseSalary || 0).replace('Kz', '')}
                                        </td>
                                        <td className="p-3 text-sm text-right font-mono font-bold">
                                            {formatCurrency(profession?.costReference || 0).replace('Kz', '')}
                                        </td>
                                        <td className="p-3 text-sm text-right font-mono font-black text-slate-800">
                                            {formatCurrency((profession?.baseSalary || 0) + (profession?.costReference || 0)).replace('Kz', '')}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenDetailedAttendance(emp)}
                                                    className="p-1.5 hover:bg-blue-100 rounded transition"
                                                    title="Processar"
                                                >
                                                    <Edit size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-red-100 rounded transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash size={16} className="text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Simple header */}
            <div className="mb-6">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">CLASSIFICADOR SALARIAL</h1>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('ASSIDUIDADE')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'ASSIDUIDADE'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Assiduidade
                    </button>
                    <button
                        onClick={() => setActiveTab('PROFISSÕES')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'PROFISSÕES'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Profissões
                    </button>
                    <button
                        onClick={() => setActiveTab('COLABORADORES')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'COLABORADORES'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Colaboradores
                    </button>
                    <button
                        onClick={() => setActiveTab('PROCESSAMENTO')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'PROCESSAMENTO'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Processar Salário
                    </button>
                </div>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'ASSIDUIDADE' && renderContent()}
                {activeTab === 'PROFISSÕES' && (
                    <ProfessionManager
                        professions={professions}
                        onSave={onSaveProfession}
                        onDelete={onDeleteProfession}
                    />
                )}
                {activeTab === 'COLABORADORES' && (
                    <Employees
                        employees={employees}
                        onSaveEmployee={onSaveEmployee}
                        workLocations={workLocations}
                        professions={professions}
                        onPrintSlip={onPrintSlip}
                    />
                )}
                {activeTab === 'PROCESSAMENTO' && (
                    <ProcessSalary
                        employees={employees}
                        onProcessPayroll={onProcessPayroll}
                        currentMonth={processingMonth}
                        currentYear={processingYear}
                        cashRegisters={cashRegisters}
                    />
                )}
                {showTaxMaps && (
                    <TaxMaps
                        company={company}
                        payroll={payroll}
                        onClose={() => setShowTaxMaps(false)}
                    />
                )}
                {showReceipts && (
                    <SalaryReceiptsModal
                        company={company}
                        payroll={payroll}
                        employees={employees}
                        onClose={() => setShowReceipts(false)}
                    />
                )}

                {showTransferOrder && (
                    <TransferOrderModal
                        company={company}
                        payroll={payroll}
                        employees={employees}
                        onClose={() => setShowTransferOrder(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default HumanResources;
