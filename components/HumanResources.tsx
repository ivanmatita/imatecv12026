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
    Edit3, Trash, User, List, ShieldCheck, ArrowRightLeft, Edit, Settings, UserX
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SalaryMap from './SalaryMap';
import SalaryMapIRTINSS from './SalaryMapIRTINSS';
import SalaryReceiptsModal from './SalaryReceiptsModal';
import ProfessionManager from './ProfessionManager';
import Employees from './Employees';
import TransferOrderModal from './TransferOrderModal';
import ProcessSalary from './ProcessSalary';
import SalaryProcessingModal from './SalaryProcessingModal';
import DismissEmployeeModal from './DismissEmployeeModal';
import IRTTableManager from './IRTTableManager';

import DetailedAttendanceGrid from './DetailedAttendanceGrid';
import AttendanceMapPage from './AttendanceMapPage';
import EmployeeListPage from './EmployeeListPage';
import EmployeeForm from './EmployeeForm';
import ContractManagement from './ContractManagement';
import PersonalRegistration from './PersonalRegistration';
import HRMaps from './HRMaps';
import WorkCard from './WorkCard';
import LaborRegistration from './LaborRegistration';
import UniformsManagement from './UniformsManagement';
import PerformanceAnalysis from './PerformanceAnalysis';
import ReadmitModal from './ReadmitModal'; // New Import
import ContractGenerator from './ContractGenerator'; // New Import
import ListLaborExtinction from './ListLaborExtinction';
import WorkStationManagement from './WorkStationManagement';
import {
    saveSalarySlip, getSalarySlips, saveAttendance, getAttendance,
    saveTransferOrder, getTransferOrders, saveEmployee, deleteEmployee
} from '../services/payrollService';

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

    onToggleSidebarTheme?: (isWhite: boolean) => void;
    onToggleSidebar?: (isOpen: boolean) => void;
    transferOrders?: TransferOrder[];
    onViewTransferOrders?: () => void;
    onDeleteEmployee?: (id: string) => void;
    initialTab?: 'ASSIDUIDADE' | 'PROFISSÕES' | 'COLABORADORES' | 'PROCESSAMENTO' | 'PERFORMANCE' | 'EXTINCAO' | 'TRANSFERENCIA';
}

const HumanResources: React.FC<HumanResourcesProps> = ({
    employees, onSaveEmployee, transactions, onSaveTransaction,
    vacations, onSaveVacation, payroll, onProcessPayroll,
    professions, onSaveProfession, onDeleteProfession,
    contracts, onSaveContract, attendance, onSaveAttendance,
    company, workLocations, onPrintSlip, cashRegisters = [],
    onUpdateCashRegister,
    initialTab = 'ASSIDUIDADE', onToggleSidebarTheme,
    onToggleSidebar,
    transferOrders = [], onViewTransferOrders,
    onDeleteEmployee
}) => {
    // Determine strict initial tab view
    const resolvedTab = (!initialTab || initialTab === 'TRANSFERENCIA') ? 'ASSIDUIDADE' : initialTab;
    const [activeTab, setActiveTab] = useState<'ASSIDUIDADE' | 'PROFISSÕES' | 'COLABORADORES' | 'PROCESSAMENTO' | 'PERFORMANCE' | 'EXTINCAO'>(resolvedTab);

    // State initialization
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [processingState, setProcessingState] = useState<'LIST' | 'DETAILED_ATTENDANCE' | 'SALARY_RESULT'>('LIST');
    const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
    const [currentAttendance, setCurrentAttendance] = useState<Record<number, DailyAttendance>>({});

    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
    const [editSlip, setEditSlip] = useState<SalarySlip | null>(null);
    const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<string>('');
    const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<string | null>(null);
    const [showTransferOrder, setShowTransferOrder] = useState<boolean>(initialTab === 'TRANSFERENCIA');
    const [showWorkStationManagement, setShowWorkStationManagement] = useState(false);
    const [processingInitialData, setProcessingInitialData] = useState<{ absences: number; extraHours: number; notes: string; } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [processingMonth, setProcessingMonth] = useState(new Date().getMonth() + 1);
    const [processingYear, setProcessingYear] = useState(new Date().getFullYear());
    const [isProcessing, setIsProcessing] = useState(false);
    const [showReceipts, setShowReceipts] = useState(false);
    const [showGeneralSalaryMap, setShowGeneralSalaryMap] = useState(false);

    // Transfer Order View State
    const [transferOrderParams, setTransferOrderParams] = useState<{ month?: number, year?: number, viewMode?: 'LIST' | 'DETAIL' }>({});

    // Employee Form State
    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | undefined>(undefined);

    // Batch Processing State
    const [processingSlips, setProcessingSlips] = useState<SalarySlip[]>([]);
    const [isReceiptsEditable, setIsReceiptsEditable] = useState(false);

    // New HR Features State
    const [showIRTTable, setShowIRTTable] = useState(false);
    const [showDismissModal, setShowDismissModal] = useState(false);
    const [employeeToDismiss, setEmployeeToDismiss] = useState<Employee | null>(null);

    // Contract Management State
    const [showContractManagement, setShowContractManagement] = useState(false);

    // New Components State
    const [showPersonalRegistration, setShowPersonalRegistration] = useState(false);
    const [employeeForPersonalFile, setEmployeeForPersonalFile] = useState<Employee | null>(null);
    const [showHRMaps, setShowHRMaps] = useState(false);
    const [showWorkCard, setShowWorkCard] = useState(false);
    const [showLaborRegistration, setShowLaborRegistration] = useState(false);
    const [employeeForUniforms, setEmployeeForUniforms] = useState<Employee | null>(null);

    // Readmission State
    const [showReadmitModal, setShowReadmitModal] = useState(false);
    const [employeeToReadmit, setEmployeeToReadmit] = useState<Employee | null>(null);

    // Contract Generator State
    const [showContractGenerator, setShowContractGenerator] = useState(false);
    const [employeeForContract, setEmployeeForContract] = useState<Employee | null>(null);

    // Auto-open contract management if needed
    useEffect(() => {
        // This would be triggered from the menu, we'll use a different approach
        // For now, keep it simple
    }, []);

    const handleCreateEmployee = () => {
        setEmployeeToEdit(undefined);
        setShowEmployeeForm(true);
    };

    const handleEditEmployee = (emp: Employee) => {
        setEmployeeToEdit(emp);
        setShowEmployeeForm(true);
    };

    const handleSaveEmployeeInternal = async (emp: Employee) => {
        try {
            const saved = await saveEmployee(emp);
            onSaveEmployee(saved);
            setShowEmployeeForm(false);
            setEmployeeToEdit(undefined);
        } catch (e) {
            console.error("Erro ao salvar:", e);
            alert("Erro ao salvar colaborador.");
        }
    };

    const handleDeleteEmployeeInternal = async (empId: string) => {
        if (!confirm("Tem certeza que deseja eliminar este registo de colaborador? Esta acção é irreversível e deve ser usada apenas para erros de cadastro.")) return;
        try {
            await deleteEmployee(empId);
            if (onDeleteEmployee) onDeleteEmployee(empId);
        } catch (e) {
            console.error("Erro ao eliminar:", e);
            alert("Erro ao eliminar colaborador.");
        }
    };

    const handleDismissClick = (emp: Employee) => {
        setEmployeeToDismiss(emp);
        setShowDismissModal(true);
    };

    const handleConfirmDismiss = async (empId: string, dismissalData: { dismissalDate: string; dismissedBy: string; reason: string }) => {
        try {
            const emp = employees.find(e => e.id === empId);
            if (!emp) return;

            const updatedEmp: Employee = {
                ...emp,
                status: 'Terminated',
                dismissalDate: dismissalData.dismissalDate,
                dismissalReason: dismissalData.reason,
                dismissedBy: dismissalData.dismissedBy
            };

            await saveEmployee(updatedEmp);
            onSaveEmployee(updatedEmp);

            setShowDismissModal(false);
            setEmployeeToDismiss(null);
            alert(`Colaborador ${emp.name} demitido com sucesso.`);
        } catch (e) {
            console.error("Erro ao demitir:", e);
            alert("Erro ao processar demissão.");
        }
    };

    const handleReadmitClick = (emp: Employee) => {
        setEmployeeToReadmit(emp);
        setShowReadmitModal(true);
    };

    const handleConfirmReadmit = async (data: { readmissionDate: string; mandatedBy: string; reason: string }) => {
        if (!employeeToReadmit) return;

        const updatedEmp: Employee = {
            ...employeeToReadmit,
            status: 'Active',
            admissionDate: data.readmissionDate, // Updating admission date to readmission date? Or keeping original? Usually keep original and add readmission note. Let's update admission for now as per "Active" status logic often relying on it, or just clear dismissal.
            // Be careful not to lose history. Ideally we have a history table.
            dismissalDate: undefined,
            dismissalReason: undefined,
            dismissedBy: undefined
        };
        // In a real system we'd log the readmission event: { date: data.readmissionDate, type: 'READMISSION', reason: data.reason, mandatedBy: data.mandatedBy }

        try {
            await saveEmployee(updatedEmp);
            onSaveEmployee(updatedEmp);
            alert(`Colaborador ${employeeToReadmit.name} readmitido com sucesso.`);
            setShowReadmitModal(false);
            setEmployeeToReadmit(null);
        } catch (e) {
            console.error(e);
            alert("Erro ao readmitir colaborador.");
        }
    };

    // New state for Detailed Grid
    const [showDetailedGrid, setShowDetailedGrid] = useState(false);
    const [receiptFilterIds, setReceiptFilterIds] = useState<string[]>([]);
    const [attendanceDataMap, setAttendanceDataMap] = useState<Record<string, Record<number, DailyAttendance>>>({});

    // Local state for Supabase data
    const [remotePayroll, setRemotePayroll] = useState<SalarySlip[]>([]);
    const [remoteAttendance, setRemoteAttendance] = useState<AttendanceRecord[]>([]);
    const [remoteTransferOrders, setRemoteTransferOrders] = useState<TransferOrder[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [slips, atts, orders] = await Promise.all([
                    getSalarySlips(),
                    getAttendance(processingMonth, processingYear),
                    getTransferOrders()
                ]);
                setRemotePayroll(slips);
                setRemoteAttendance(atts);
                setRemoteTransferOrders(orders);
            } catch (error) {
                console.error("Error loading payroll data:", error);
            }
        };
        loadData();
    }, [processingMonth, processingYear]);

    // Merge props with remote data for display
    const displayPayroll = useMemo(() => {
        return remotePayroll.length > 0 ? remotePayroll : payroll;
    }, [payroll, remotePayroll]);

    useEffect(() => {
        if (remoteAttendance.length > 0) {
            const newMap: Record<string, Record<number, DailyAttendance>> = {};
            remoteAttendance.forEach(a => {
                newMap[a.employeeId] = a.days;
            });
            setAttendanceDataMap(prev => ({ ...prev, ...newMap }));
        }
    }, [remoteAttendance]);

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

    const handleProcessDetailed = () => {
        if (!activeEmployee) return;

        const totalAbsences = Object.values(currentAttendance).filter((d: DailyAttendance) => d.status === 'FALTA_INJUST').length;
        const totalExtraHours = Object.values(currentAttendance).reduce((sum: number, d: DailyAttendance) => sum + (Number(d.overtimeHours) || 0), 0);

        setProcessingInitialData({
            absences: totalAbsences,
            extraHours: totalExtraHours,
            notes: ''
        });

        setSelectedEmployeeForModal(activeEmployee.id);
        setShowProcessingModal(true);
        if (onToggleSidebarTheme) onToggleSidebarTheme(true);
    };

    const calculateSlip = (emp: Employee, att: Record<number, DailyAttendance>, monthlyExtras?: any): SalarySlip => {
        const totalWorkedDays = Object.values(att).filter(d => d.status === 'SERVICO').length;
        const totalAbsences = Object.values(att).filter(d => d.status === 'FALTA_INJUST').length;
        const totalJustified = Object.values(att).filter(d => d.status === 'FALTA_JUST').length;
        const totalVacation = Object.values(att).filter(d => d.status === 'FERIAS').length;

        // Overtime from Daily + Monthly Override
        const totalExtraHours = monthlyExtras?.overtimeHours || Object.values(att).reduce((sum, d) => sum + (d.overtimeHours || 0), 0);

        const profession = professions.find(p => p.id === emp.professionId);
        const baseSalary = profession?.baseSalary || emp.baseSalary || 0;
        const dailyRate = baseSalary / 30;
        const hourlyRate = baseSalary / (30 * 8);

        const basePay = baseSalary; // Assuming monthly salary
        const extraPay = hourlyRate * totalExtraHours * 1.5;
        const absenceDeduction = dailyRate * totalAbsences;
        const lostHoursDeduction = monthlyExtras?.lostHours ? (hourlyRate * monthlyExtras.lostHours) : 0;

        // Subsidies
        const subsidyVacation = monthlyExtras?.subsidyChristmas ?? emp.subsidyVacation ?? 0; // Fix: using xmas field from extras for now as per map? Or separate. Let's map carefully.
        // Map extras fields to slip fields
        const subsidyChristmas = monthlyExtras?.subsidyChristmas ?? emp.subsidyChristmas ?? 0;
        const subsidyHousing = emp.subsidyHousing || 0; // Not in extras map yet?
        const subsidyFood = monthlyExtras?.subsidyFood ?? emp.subsidyFood ?? 0;
        const subsidyTransport = monthlyExtras?.subsidyTransport ?? emp.subsidyTransport ?? 0;
        const otherSubsidies = monthlyExtras?.otherSubsidies ?? emp.otherSubsidies ?? 0;
        const allowances = emp.allowances || 0;

        const grossSalary = basePay + extraPay + allowances + otherSubsidies + subsidyChristmas + subsidyHousing - absenceDeduction - lostHoursDeduction;

        // Tax Calculation (Simplified)
        // INSS = 3% of (Base + subsidies subject to tax)
        const taxableForINSS = basePay + extraPay + allowances + otherSubsidies + subsidyChristmas + subsidyHousing - absenceDeduction - lostHoursDeduction;
        const inss = calculateINSS(taxableForINSS, subsidyFood, subsidyTransport);

        // IRT
        const taxableForIRT = taxableForINSS - inss;
        const irt = calculateIRT(taxableForIRT, inss, subsidyFood, subsidyTransport);

        const netTotal = grossSalary + subsidyFood + subsidyTransport - inss - irt;

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            month: processingMonth,
            year: processingYear,
            baseSalary,
            allowances,
            bonuses: 0,
            subsidies: subsidyHousing + subsidyChristmas + otherSubsidies,
            subsidyTransport,
            subsidyFood,
            subsidyFamily: emp.subsidyFamily || 0,
            subsidyHousing,
            subsidyChristmas,
            subsidyVacation,
            absences: totalAbsences,
            absencesJustified: totalJustified,
            advances: emp.advances || 0,
            penalties: lostHoursDeduction,
            grossTotal: grossSalary + subsidyFood + subsidyTransport,
            inss,
            irt,
            netTotal: roundToNearestBank(netTotal),
            daysWorked: totalWorkedDays,
            daysVacation: totalVacation,
            overtimeHours: totalExtraHours,
            processedAt: new Date().toISOString(),
            otherSubsidies // Store extra subsidies here
        } as any;
    };

    const handleBatchProcess = (
        selectedIds: string[],
        month: number,
        year: number,
        attendanceData: Record<string, Record<number, DailyAttendance>>,
        monthlyValues: any
    ) => {
        if (selectedIds.length === 0) return alert("Selecione pelo menos um funcionário.");

        setProcessingMonth(month);
        setProcessingYear(year);

        const newSlips: SalarySlip[] = [];

        selectedIds.forEach(id => {
            const emp = employees.find(e => e.id === id);
            if (!emp) return;

            const att = attendanceData[id] || {};
            const extras = monthlyValues[id] || {};

            // Fill gaps
            const fullAtt: Record<number, DailyAttendance> = {};
            const daysInM = new Date(year, month, 0).getDate();
            for (let d = 1; d <= daysInM; d++) {
                if (att[d]) {
                    fullAtt[d] = att[d];
                } else {
                    const date = new Date(year, month - 1, d);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    fullAtt[d] = {
                        status: isWeekend ? 'FOLGA' : 'SERVICO',
                        overtimeHours: 0,
                        lostHours: 0,
                        location: '1'
                    };
                }
            }

            const slip = calculateSlip(emp, fullAtt, extras);
            newSlips.push(slip);
        });

        setProcessingSlips(newSlips);
        setIsReceiptsEditable(true); // Enable edit mode!
        setShowReceipts(true);
    };

    const handleSaveBatchSlips = async (finalSlips: SalarySlip[]) => {
        try {
            await handleProcessSalaryCallback(finalSlips);
            setIsReceiptsEditable(false);
            setShowReceipts(false);
            alert("✅ Processamento salvo e concluído com sucesso!");
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar processamento.");
        }
    };

    // Callback to save plain slips
    const handleProcessSalaryCallback = async (slips: SalarySlip[]) => {
        try {
            // Save to Supabase
            await Promise.all(slips.map(s => saveSalarySlip(s)));

            // Update local remote state
            setRemotePayroll(prev => {
                const newIds = new Set(slips.map(s => `${s.employeeId}-${s.month}-${s.year}`));
                return [...prev.filter(s => !newIds.has(`${s.employeeId}-${s.month}-${s.year}`)), ...slips];
            });

            // Mark employees as "Processed" aka Magic
            const updatedEmployees = [...employees];
            for (const slip of slips) {
                const empIndex = updatedEmployees.findIndex(e => e.id === slip.employeeId);
                if (empIndex >= 0) {
                    updatedEmployees[empIndex] = { ...updatedEmployees[empIndex], isMagic: true };
                    // Ideally persist this too
                    onSaveEmployee(updatedEmployees[empIndex]);
                }
            }

            // Call parent prop
            onProcessPayroll(slips);
        } catch (error) {
            console.error("Error saving payroll:", error);
            alert("Erro ao salvar dados no banco de dados.");
        }
    };

    const handleSaveDetailedAttendance = (employeeId: string, data: Record<number, DailyAttendance>, summary: { absences: number, extraHours: number, notes: string }) => {
        setAttendanceDataMap(prev => ({ ...prev, [employeeId]: data }));
        const record: AttendanceRecord = {
            id: generateId(), employeeId, month: processingMonth, year: processingYear, days: data
        };

        saveAttendance(record).then(() => {
            setRemoteAttendance(prev => [...prev.filter(a => a.employeeId !== employeeId || a.month !== processingMonth || a.year !== processingYear), record]);
        }).catch(err => console.error(err));

        onSaveAttendance(record);
        setShowDetailedGrid(false);
    };

    const renderAttendanceGrid = () => {
        // ... (Keep existing implementation for backward compatibility if needed, but redundant with AttendanceMapPage)
        return null;
    };

    const renderContent = () => {
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

        // Main Attendance View
        const displayAttendance = remoteAttendance.length > 0 ? remoteAttendance : attendance;

        return (
            <div className="space-y-4 animate-in fade-in">
                <AttendanceMapPage
                    employees={employees}
                    companyName={company.name}
                    workLocations={workLocations}
                    attendanceRecords={displayAttendance}
                    onProcess={handleBatchProcess}
                />
            </div >
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {activeTab !== 'ASSIDUIDADE' && (
                <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-2">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-800">CLASSIFICADOR SALARIAL</h1>
                    </div>
                </div>
            )}

            {!showTransferOrder && (
                <div className="mb-6 flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <button onClick={() => setActiveTab('ASSIDUIDADE')} className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition ${activeTab === 'ASSIDUIDADE' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Assiduidade dos Colaboradores</button>
                    <button onClick={() => setActiveTab('PROFISSÕES')} className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition ${activeTab === 'PROFISSÕES' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Profissões</button>
                    <button onClick={() => setActiveTab('COLABORADORES')} className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition ${activeTab === 'COLABORADORES' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Colaboradores</button>
                    <button onClick={() => setActiveTab('PROCESSAMENTO')} className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition ${activeTab === 'PROCESSAMENTO' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Processamento</button>
                    <div className="w-px h-8 bg-slate-200 mx-2"></div>
                    <button onClick={() => setShowContractManagement(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><Briefcase size={14} className="text-indigo-600" /> Gestão de Contratos</button>
                    <button onClick={() => setShowIRTTable(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><Calculator size={14} className="text-emerald-600" /> Tabela IRT</button>
                    <button onClick={() => { setTransferOrderParams({ viewMode: 'LIST' }); setShowTransferOrder(true); }} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><ArrowRightLeft size={14} className="text-green-600" /> Ordem de Transferência</button>
                    <button onClick={() => { setIsReceiptsEditable(false); setShowReceipts(true); }} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><Printer size={14} className="text-purple-600" /> Recibos de Salário</button>
                    <button onClick={() => setShowGeneralSalaryMap(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><Table size={14} className="text-blue-600" /> Mapa Geral IRT/INSS</button>

                    {/* New Buttons for requested features */}
                    <button onClick={() => setShowPersonalRegistration(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><User size={14} className="text-blue-600" /> Cadastro Pessoal</button>
                    <button onClick={() => setShowHRMaps(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><Table size={14} className="text-teal-600" /> Mapas</button>
                    <button onClick={() => setShowWorkCard(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><FileText size={14} className="text-blue-600" /> Cartão de Trabalho</button>
                    <button onClick={() => setShowLaborRegistration(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><ClipboardList size={14} className="text-yellow-600" /> Inscrição Laboral</button>
                    <button onClick={() => setActiveTab('PERFORMANCE')} className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition flex items-center gap-2 ${activeTab === 'PERFORMANCE' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}><TrendingUp size={14} className={activeTab === 'PERFORMANCE' ? "text-white" : "text-cyan-600"} /> Análise de Desempenho</button>
                    <button onClick={() => setShowWorkStationManagement(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><Briefcase size={14} className="text-sky-600" /> Gestão de Posto de Trabalho</button>
                    <button onClick={() => setActiveTab('EXTINCAO')} className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition flex items-center gap-2 ${activeTab === 'EXTINCAO' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}><UserX size={14} className={activeTab === 'EXTINCAO' ? "text-white" : "text-blue-600"} /> Extinção Laboral</button>
                    <button onClick={() => setActiveTab('PROFISSÕES')} className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition flex items-center gap-2 ${activeTab === 'PROFISSÕES' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}><Briefcase size={14} className={activeTab === 'PROFISSÕES' ? "text-white" : "text-blue-600"} /> Definição de Profissões</button>


                    <button onClick={() => window.print()} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase hover:bg-slate-50 transition flex items-center gap-2"><Printer size={14} className="text-slate-600" /> Imprimir Lista</button>
                </div>
            )}

            <div>
                {showTransferOrder ? (
                    <TransferOrderModal
                        company={company}
                        payroll={displayPayroll}
                        employees={employees}
                        onClose={() => { setShowTransferOrder(false); setTransferOrderParams({}); }}
                        initialMonth={transferOrderParams.month}
                        initialYear={transferOrderParams.year}
                        initialViewMode={transferOrderParams.viewMode}
                    />
                ) : (
                    <>
                        {activeTab === 'ASSIDUIDADE' && renderContent()}
                        {activeTab === 'PROFISSÕES' && <ProfessionManager professions={professions} onSave={onSaveProfession} onDelete={onDeleteProfession} />}
                        {activeTab === 'COLABORADORES' && (
                            <EmployeeListPage
                                employees={employees}
                                onSaveEmployee={onSaveEmployee}
                                workLocations={workLocations}
                                professions={professions}
                                onCreate={handleCreateEmployee}
                                onEdit={handleEditEmployee}
                                onDelete={handleDeleteEmployeeInternal}
                                onViewDetails={handleEditEmployee}

                                onDismiss={handleDismissClick}
                                onReadmit={handleReadmitClick}
                                onIssueContract={(emp) => {
                                    setEmployeeForContract(emp);
                                    setShowContractGenerator(true);
                                }}
                                onViewPersonalFile={(emp) => {
                                    setEmployeeForPersonalFile(emp);
                                    setShowPersonalRegistration(true);
                                }}
                                onManageUniforms={(emp) => {
                                    setEmployeeForUniforms(emp);
                                }}
                            />
                        )}
                        {activeTab === 'PROCESSAMENTO' && (
                            <ProcessSalary
                                employees={employees}
                                onProcessPayroll={handleProcessSalaryCallback}
                                payroll={displayPayroll}
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
                                onToggleSidebar={onToggleSidebar}
                                onSaveTransferOrder={async (order) => {
                                    const saved = await saveTransferOrder(order);
                                    setRemoteTransferOrders(prev => [...prev, saved]);
                                    return saved;
                                }}
                                onShowReceipts={(ids) => {
                                    setReceiptFilterIds(ids || []);
                                    setShowReceipts(true);
                                }}
                                existingTransferOrders={transferOrders}
                                onViewTransferOrders={(month, year) => {
                                    setTransferOrderParams({ month, year, viewMode: month ? 'DETAIL' : 'LIST' });
                                    setShowTransferOrder(true);
                                }}
                                onFastProcessAttendance={async (empIds) => { /* Reuse logic */ }}
                                onNavigateToAttendance={() => setActiveTab('ASSIDUIDADE')}
                                onChangeMonth={(m, y) => { setProcessingMonth(m); setProcessingYear(y); }}
                            />
                        )}
                        {activeTab === 'PERFORMANCE' && <PerformanceAnalysis />}
                        {activeTab === 'EXTINCAO' && (
                            <ListLaborExtinction
                                employees={employees}
                                company={company}
                                workLocations={workLocations}
                                payrollHistory={displayPayroll} // Using displayPayroll to include remote state
                                attendanceHistory={remoteAttendance.length > 0 ? remoteAttendance : attendance}
                                contracts={contracts}
                                onSaveEmployee={onSaveEmployee}
                                onReadmit={handleReadmitClick}
                            />
                        )}
                        {showGeneralSalaryMap && <SalaryMapIRTINSS payroll={displayPayroll} employees={employees} company={company} onClose={() => setShowGeneralSalaryMap(false)} />}

                        {showReceipts && (
                            <SalaryReceiptsModal
                                company={company}
                                payroll={isReceiptsEditable ? processingSlips : displayPayroll}
                                employees={employees}
                                onClose={() => setShowReceipts(false)}
                                onSave={handleSaveBatchSlips}
                                onDismiss={handleDismissClick}
                                initialSelectedIds={receiptFilterIds}
                            />
                        )}
                        {showProcessingModal && <SalaryProcessingModal company={company} employees={employees} processingMonth={processingMonth} processingYear={processingYear} initialEmployeeId={selectedEmployeeForModal} initialData={processingInitialData} onProcess={(slip) => { handleProcessSalaryCallback([slip]); }} onClose={() => { setShowProcessingModal(false); setSelectedEmployeeForModal(null); setProcessingInitialData(null); if (onToggleSidebarTheme) onToggleSidebarTheme(false); }} />}
                    </>
                )}
            </div>
            {showEmployeeForm && <EmployeeForm initialData={employeeToEdit} onSave={handleSaveEmployeeInternal} onCancel={() => setShowEmployeeForm(false)} workLocations={workLocations} professions={professions} />}
            {showContractManagement && (
                <div className="fixed inset-0 z-[200] bg-white">
                    <ContractManagement
                        employees={employees}
                        company={company}
                        contracts={contracts}
                        onSave={onSaveContract}
                        onClose={() => setShowContractManagement(false)}
                    />
                </div>
            )}
            {showIRTTable && (
                <IRTTableManager onClose={() => setShowIRTTable(false)} />
            )}
            {showDismissModal && employeeToDismiss && (
                <DismissEmployeeModal
                    employee={employeeToDismiss}
                    onClose={() => setShowDismissModal(false)}
                    onConfirm={handleConfirmDismiss}
                />
            )}

            {/* New Component Renders */}
            {showPersonalRegistration && (
                <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
                    <PersonalRegistration
                        employee={employeeForPersonalFile}
                        employees={employees}
                        onClose={() => {
                            setShowPersonalRegistration(false);
                            setEmployeeForPersonalFile(null);
                        }}
                    />
                </div>
            )}
            {showHRMaps && (
                <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
                    <HRMaps onClose={() => setShowHRMaps(false)} employees={employees} attendance={attendance} company={company} />
                </div>
            )}
            {showWorkCard && (
                <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
                    <WorkCard onClose={() => setShowWorkCard(false)} />
                </div>
            )}
            {showLaborRegistration && (
                <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
                    <LaborRegistration onClose={() => setShowLaborRegistration(false)} />
                </div>
            )}
            {employeeForUniforms && (
                <UniformsManagement
                    employee={employeeForUniforms}
                    onClose={() => setEmployeeForUniforms(null)}
                />
            )}
            {showReadmitModal && employeeToReadmit && (
                <ReadmitModal
                    employee={employeeToReadmit}
                    onClose={() => setShowReadmitModal(false)}
                    onConfirm={handleConfirmReadmit}
                />
            )}
            {showWorkStationManagement && (
                <WorkStationManagement
                    employees={employees}
                    workLocations={workLocations}
                    onClose={() => setShowWorkStationManagement(false)}
                    onUpdateEmployeeLocation={async (empId, locId, reason) => {
                        // Mock update - in real app, update DB
                        const emp = employees.find(e => e.id === empId);
                        if (emp) {
                            onSaveEmployee({ ...emp, workLocationId: locId });
                        }
                    }}
                />
            )}
            {showContractGenerator && employeeForContract && (
                <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
                    <ContractGenerator
                        employee={employeeForContract}
                        company={company}
                        onSave={(contract) => {
                            onSaveContract(contract);
                            // Optionally navigate to list or close
                            setShowContractGenerator(false);
                            setShowContractManagement(true); // Now go to list
                        }}
                        onClose={() => setShowContractGenerator(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default HumanResources;
