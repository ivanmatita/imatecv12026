
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
    Edit3, Trash, User, List, ShieldCheck, ArrowRightLeft, Edit, Settings
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SalaryMap from './SalaryMap';
import TaxMaps from './TaxMaps';
import SalaryReceiptsModal from './SalaryReceiptsModal';
import ProfessionManager from './ProfessionManager';
import Employees from './Employees';
import TransferOrderModal from './TransferOrderModal';
import ProcessSalary from './ProcessSalary';
import SalaryProcessingModal from './SalaryProcessingModal';
import DetailedAttendanceGrid from './DetailedAttendanceGrid';

interface HumanResourcesProps {
    employees: Employee[];
    onSaveEmployee: (emp: Employee) => void;
    transactions: HrTransaction[];
    onSaveTransaction: (t: HrTransaction) => void;
    vacations: HrVacation[];
    onSaveVacation: (v: HrVacation) => void;
    payroll: SalarySlip[];
    onProcessPayroll: (slips: SalarySlip[], cashRegisterId?: string) => void;
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
    initialTab?: 'ASSIDUIDADE' | 'PROFISSÕES' | 'COLABORADORES' | 'PROCESSAMENTO' | 'SALARY_MODAL';
    onToggleSidebarTheme?: (isWhite: boolean) => void;
    transferOrders?: TransferOrder[];
    onViewTransferOrders?: () => void;
}

const HumanResources: React.FC<HumanResourcesProps> = ({
    employees, onSaveEmployee, transactions, onSaveTransaction,
    vacations, onSaveVacation, payroll, onProcessPayroll,
    professions, onSaveProfession, onDeleteProfession,
    contracts, onSaveContract, attendance, onSaveAttendance,
    company, workLocations, onPrintSlip, cashRegisters = [],
    onUpdateCashRegister,
    initialTab = 'ASSIDUIDADE', onToggleSidebarTheme,
    transferOrders = [], onViewTransferOrders
}) => {
    // Determine strict initial tab view
    const resolvedTab = (initialTab === 'SALARY_MODAL' || !initialTab) ? 'ASSIDUIDADE' : initialTab;
    const [activeTab, setActiveTab] = useState<'ASSIDUIDADE' | 'PROFISSÕES' | 'COLABORADORES' | 'PROCESSAMENTO'>(resolvedTab);

    // State initialization
    const [showProcessingModal, setShowProcessingModal] = useState(initialTab === 'SALARY_MODAL');
    const [processingState, setProcessingState] = useState<'LIST' | 'DETAILED_ATTENDANCE' | 'SALARY_RESULT'>('LIST');
    const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
    const [currentAttendance, setCurrentAttendance] = useState<Record<number, DailyAttendance>>({});

    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
    const [editSlip, setEditSlip] = useState<SalarySlip | null>(null);
    const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<string>('');
    const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<string | null>(null);
    const [showTransferOrder, setShowTransferOrder] = useState<boolean>(false);
    const [processingInitialData, setProcessingInitialData] = useState<{ absences: number; extraHours: number; notes: string; } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [processingMonth, setProcessingMonth] = useState(new Date().getMonth() + 1);
    const [processingYear, setProcessingYear] = useState(new Date().getFullYear());
    const [isProcessing, setIsProcessing] = useState(false);
    const [showTaxMaps, setShowTaxMaps] = useState(false);
    const [showReceipts, setShowReceipts] = useState(false);

    // New state for Detailed Grid
    const [showDetailedGrid, setShowDetailedGrid] = useState(false);
    const [receiptFilterIds, setReceiptFilterIds] = useState<string[]>([]);
    const [attendanceDataMap, setAttendanceDataMap] = useState<Record<string, Record<number, DailyAttendance>>>({});

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
                status: 'SERVICO',
                overtimeHours: 0,
                lostHours: 0,
                location: '1'
            };
        }
        setCurrentAttendance(initialAtt);
        setProcessingState('DETAILED_ATTENDANCE');
    };

    const calculateSlip = (emp: Employee, att: Record<number, DailyAttendance>): SalarySlip => {
        const totalWorkedDays = Object.values(att).filter(d => d.status === 'SERVICO').length;
        const totalAbsences = Object.values(att).filter(d => d.status === 'FALTA_INJUST').length;
        // Approximation if needed, but following types:
        const totalExtraHours = Object.values(att).reduce((sum, d) => sum + (d.overtimeHours || 0), 0);

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

        const coreTaxable = grossSalary + subsidyVacation + subsidyChristmas + subsidyHousing + allowances;
        const exemptIncome = subsidyFood + subsidyTransport;

        const inss = calculateINSS(coreTaxable, subsidyFood, subsidyTransport);
        const irt = calculateIRT(coreTaxable, inss, subsidyFood, subsidyTransport);

        const salaryAdjustments = emp.salaryAdjustments || 0;
        const penalties = emp.penalties || 0;
        const advances = emp.advances || 0;

        const totalDeductions = inss + irt + penalties + advances;
        const netTotal = coreTaxable + subsidyFood + subsidyTransport + salaryAdjustments - totalDeductions;

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            month: processingMonth,
            year: processingYear,
            baseSalary,
            allowances,
            bonuses: 0,
            subsidies: exemptIncome + subsidyVacation + subsidyChristmas + subsidyHousing,
            subsidyTransport,
            subsidyFood,
            subsidyFamily: emp.subsidyFamily || 0,
            subsidyHousing,
            absences: totalAbsences,
            advances,
            penalties,
            grossTotal: coreTaxable + exemptIncome,
            inss,
            irt,
            netTotal: roundToNearestBank(netTotal),
            daysWorked: totalWorkedDays,
            overtimeHours: totalExtraHours,
            processedAt: new Date().toISOString()
        } as any; // Using any temporarily if types are still drifting, but attempting match
    };

    const handleProcessDetailed = () => {
        if (!activeEmployee) return;

        const totalAbsences = Object.values(currentAttendance).filter(d => d.status === 'FALTA_INJUST').length;
        const totalExtraHours = Object.values(currentAttendance).reduce((sum, d) => sum + (d.overtimeHours || 0), 0);

        // Pass data to modal
        setProcessingInitialData({
            absences: totalAbsences,
            extraHours: totalExtraHours,
            notes: '' // DailyAttendance type does not have a 'notes' field, setting to empty string
        });

        // Redirect to new Salary Processing Modal (Recibo Salario) as requested
        setSelectedEmployeeForModal(activeEmployee.id);
        setShowProcessingModal(true);
        if (onToggleSidebarTheme) onToggleSidebarTheme(true);
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
                        balance: cashReg.balance - (finalSlip.netTotal || 0)
                    };
                    onUpdateCashRegister(updatedCashReg);
                }
            }

            // alert('Processamento concluído com sucesso!'); // Removed alert for smoother UI
            // setProcessingState('LIST'); // Stay on the current view to allow printing
            alert('Salário processado com sucesso! Utilize os botões acima para imprimir.');
            // Removed automatic reset to LIST to allow the user to print from the result view
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
                        status: 'SERVICO',
                        overtimeHours: 0,
                        lostHours: 0,
                        location: '1'
                    };
                }

                const slip = calculateSlip(emp, initialAtt);
                slips.push(slip);
                totalPayment += (slip.netTotal || 0);

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

    const handleSaveDetailedAttendance = (employeeId: string, data: Record<number, DailyAttendance>, summary: { absences: number, extraHours: number, notes: string }) => {
        // Save local map
        setAttendanceDataMap(prev => ({ ...prev, [employeeId]: data }));

        // Save to global attendance prop/store
        const record: AttendanceRecord = {
            id: generateId(),
            employeeId,
            month: processingMonth,
            year: processingYear,
            days: data
        };
        onSaveAttendance(record);

        // Update employee status to Green (Processed)
        const emp = employees.find(e => e.id === employeeId);
        if (emp) {
            // We use isMagic to denote "Processed" visually in the list for now
            const updatedEmp = {
                ...emp,
                isMagic: true,
                // Temporarily store summary stats if needed for the payroll step
                tempAbsences: summary.absences,
                tempExtraHours: summary.extraHours
            };
            onSaveEmployee(updatedEmp);
        }

        setShowDetailedGrid(false);
        // alert("Efetividade processada com sucesso!");
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
                                        <input type="checkbox" checked={att.status === 'SERVICO'} onChange={e => setCurrentAttendance({ ...currentAttendance, [day]: { ...att, status: e.target.checked ? 'SERVICO' : 'FOLGA' } })} className="rounded" />
                                        Trabalhou
                                    </label>
                                    <input type="number" className="w-full p-1 border rounded text-xs" placeholder="H.Extra" value={att.overtimeHours} onChange={e => setCurrentAttendance({ ...currentAttendance, [day]: { ...att, overtimeHours: Number(e.target.value) } })} />
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
            <div className="space-y-4">
                {/* Month Selector for Assiduidade */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Mês de Processamento</label>
                            <select
                                value={processingMonth}
                                onChange={(e) => setProcessingMonth(Number(e.target.value))}
                                className="border border-slate-300 rounded px-3 py-1.5 text-slate-700 font-bold bg-slate-50 min-w-[150px]"
                            >
                                {months.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Ano</label>
                            <input
                                type="number"
                                value={processingYear}
                                onChange={(e) => setProcessingYear(Number(e.target.value))}
                                className="border border-slate-300 rounded px-3 py-1.5 text-slate-700 font-bold bg-slate-50 w-24"
                            />
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium">Total Funcionários via Efetividade</span>
                        <p className="text-xl font-black text-slate-800">{employees.filter(e => e.status !== 'Terminated').length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 font-semibold text-slate-700 uppercase text-xs">Nome</th>
                                <th className="p-3 font-semibold text-slate-700 uppercase text-xs">Profissão</th>
                                <th className="p-3 font-semibold text-slate-700 uppercase text-xs">Categoria</th>
                                <th className="p-3 font-semibold text-slate-700 uppercase text-xs text-right">Salário Base</th>
                                <th className="p-3 font-semibold text-slate-700 uppercase text-xs text-center">Estado</th>
                                <th className="p-3 font-semibold text-slate-700 uppercase text-xs text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {employees.map(emp => {
                                const profession = professions.find(p => p.id === emp.professionId);
                                const isProcessed = emp.isMagic; // Using isMagic as "Green/Processed" flag

                                return (
                                    <tr
                                        key={emp.id}
                                        className={`hover:bg-slate-50 transition cursor-pointer ${isProcessed ? 'bg-green-50' : ''}`}
                                        onClick={() => {
                                            setActiveEmployee(emp);
                                            setShowDetailedGrid(true);
                                        }}
                                    >
                                        <td className="p-3">
                                            <div className="font-bold text-slate-800">{emp.name}</div>
                                            <div className="text-[10px] text-slate-500">{emp.employeeNumber || '---'}</div>
                                        </td>
                                        <td className="p-3">{profession?.internalName || '---'}</td>
                                        <td className="p-3">
                                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                {profession?.category || 'Geral'}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-right font-bold text-slate-600">{formatCurrency(profession?.baseSalary || 0)}</td>
                                        <td className="p-3 text-center">
                                            {isProcessed ? (
                                                <span className="text-[10px] px-3 py-1 bg-green-100 text-green-700 font-bold uppercase rounded-full border border-green-200 shadow-sm">
                                                    Processado
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-3 py-1 bg-slate-100 text-slate-500 font-bold uppercase rounded-full border border-slate-200">
                                                    Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Editar Efetividade"
                                                >
                                                    <Edit3 size={16} />
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

    const renderContent = () => {
        // Detailed Grid Overlay
        if (showDetailedGrid && activeEmployee) {
            return (
                <DetailedAttendanceGrid
                    employee={activeEmployee}
                    month={processingMonth}
                    year={processingYear}
                    initialData={attendanceDataMap[activeEmployee.id]}
                    onClose={() => setShowDetailedGrid(false)}
                    onSave={handleSaveDetailedAttendance}
                />
            );
        }

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

                        <button
                            onClick={() => setShowProcessingModal(true)}
                            className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <Calculator size={16} className="text-green-600" />
                            <span className="hidden xl:inline">Processamento</span>
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <Printer size={16} className="text-slate-600" />
                            <span className="hidden xl:inline">Imprimir Lista</span>
                        </button>

                    </div>
                </div>


                {/* Table with clean design like the image */}
                {/* Render the Effectivity List with Month Selector */}
                {renderEffectivityList()}
            </div >
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Simple header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-2"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">CLASSIFICADOR SALARIAL</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('PROFISSÕES')}
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition shadow-sm"
                    >
                        <Settings size={16} /> <span className="hidden sm:inline">Definição de Profissões</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('COLABORADORES')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-blue-700 transition shadow-md"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Novo Colaborador</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('ASSIDUIDADE')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'ASSIDUIDADE'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Assiduidade dos Colaboradores
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
                        Processamento
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
                        onExecuteProcess={(empId) => {
                            setSelectedEmployeeForModal(empId);
                            setActiveTab('PROCESSAMENTO');
                        }}
                    />
                )}
                {activeTab === 'PROCESSAMENTO' && (
                    <ProcessSalary
                        employees={employees}
                        onProcessPayroll={onProcessPayroll}
                        currentMonth={processingMonth}
                        currentYear={processingYear}
                        cashRegisters={cashRegisters}
                        onOpenProcessingModal={(empId, data) => {
                            setSelectedEmployeeForModal(empId || null);
                            if (data) setProcessingInitialData(data);
                            setShowProcessingModal(true);
                            if (onToggleSidebarTheme) onToggleSidebarTheme(true);
                        }}
                        onToggleSidebarTheme={onToggleSidebarTheme}
                        onShowReceipts={(ids) => {
                            setReceiptFilterIds(ids || []);
                            setShowReceipts(true);
                        }}
                        existingTransferOrders={transferOrders}
                        onViewTransferOrders={onViewTransferOrders}
                    />
                )}
                {showTaxMaps && (
                    <TaxMaps
                        company={company}
                        payroll={payroll}
                        employees={employees}
                        onClose={() => setShowTaxMaps(false)}
                    />
                )}
                {showReceipts && (
                    <SalaryReceiptsModal
                        company={company}
                        payroll={payroll}
                        employees={employees}
                        onClose={() => setShowReceipts(false)}
                        onGoToProcessing={() => {
                            setShowReceipts(false);
                            setShowProcessingModal(true);
                            if (onToggleSidebarTheme) onToggleSidebarTheme(true);
                        }}
                        filterEmployeeIds={receiptFilterIds}
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
                {showProcessingModal && (
                    <SalaryProcessingModal
                        company={company}
                        employees={employees}
                        processingMonth={processingMonth}
                        processingYear={processingYear}
                        initialEmployeeId={selectedEmployeeForModal}
                        initialData={processingInitialData}
                        onProcess={(slip) => {
                            onProcessPayroll([slip]);
                        }}
                        onClose={() => {
                            setShowProcessingModal(false);
                            setSelectedEmployeeForModal(null);
                            setProcessingInitialData(null);
                            if (onToggleSidebarTheme) onToggleSidebarTheme(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default HumanResources;
