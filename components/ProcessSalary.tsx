
import React, { useState, useMemo } from 'react';
import { Employee, SalarySlip, CashRegister } from '../types';
import { formatCurrency, formatDate, calculateINSS, calculateIRT, numberToExtenso, roundToNearestBank } from '../utils';
import { Save, Printer, Trash2, CheckSquare, MoreVertical, X, Calendar, ChevronRight, Calculator, CheckCircle2, ArrowRightLeft } from 'lucide-react';

interface ProcessSalaryProps {
    employees: Employee[];
    onProcessPayroll: (slips: SalarySlip[], cashRegisterId?: string) => void;
    currentMonth: number;
    currentYear: number;
    cashRegisters: CashRegister[];
    onOpenProcessingModal?: (employeeId: string, initialData?: { absences: number, extraHours: number, notes: string }) => void;
    onToggleSidebarTheme?: (isWhite: boolean) => void;
    onShowReceipts?: (ids: string[]) => void;
    onViewTransferOrders?: () => void;
    existingTransferOrders?: any[]; // Using any to avoid importing TransferOrder type here if not already imported, but should be typed properly
}

const ProcessSalary: React.FC<ProcessSalaryProps> = ({ employees, onProcessPayroll, currentMonth, currentYear, cashRegisters, onOpenProcessingModal, onToggleSidebarTheme, onShowReceipts, onViewTransferOrders, existingTransferOrders = [] }) => {
    const [processedEmployees, setProcessedEmployees] = useState<Record<string, number>>({});
    const [attendanceProcessed, setAttendanceProcessed] = useState<Set<string>>(new Set());
    const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

    // Header Controls State
    const [selectedCashRegister, setSelectedCashRegister] = useState<string>('');
    const [selectedAction, setSelectedAction] = useState<string>('');

    // Attendance Map Modal State
    // View State
    const [view, setView] = useState<'LIST' | 'ATTENDANCE' | 'SLIP' | 'SPLIT'>('LIST');
    const [attendanceEmployeeId, setAttendanceEmployeeId] = useState<string | null>(null);
    const [slipData, setSlipData] = useState<any>(null); // Data for valid slip

    // Grid state per employee for persistence
    const [grids, setGrids] = useState<Record<string, any>>({});

    // Temp state for manual salary inputs
    const [manualValues, setManualValues] = useState<Record<string, {
        vacation: number;
        christmas: number;
        housing: number;
        family: number;
        otherSubsidies: number;
        adjustments: number;
        penalties: number;
        magic: boolean;
        item: boolean;
    }>>({});

    const getManualValue = (id: string, field: string) => (manualValues[id] as any)?.[field] || 0;
    const getManualBool = (id: string, field: string) => (manualValues[id] as any)?.[field] || false;
    const updateManualValue = (id: string, field: string, value: any) => {
        setManualValues(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleActionClick = (id: string) => setActionMenuOpenId(id);
    const closeActionMenu = () => setActionMenuOpenId(null);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedEmployees);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedEmployees(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedEmployees.size === employees.length) {
            setSelectedEmployees(new Set());
        } else {
            setSelectedEmployees(new Set(employees.map(e => e.id)));
        }
    };

    const handleDirectProcess = (empId: string) => {
        const currentEmp = employees.find(e => e.id === empId);
        if (currentEmp) {
            const base = currentEmp.baseSalary;
            const manual = manualValues[currentEmp.id] || {};

            // Default days for direct process (can be adjusted)
            const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
            const absentDays = 0; // Default to 0 for direct process if not coming from attendance grid

            const absenceDeduction = (base / 30) * absentDays;
            const sFood = currentEmp.subsidyFood || 0;
            const sTrans = currentEmp.subsidyTransport || 0;
            const sFam = manual.family || currentEmp.subsidyFamily || 0;
            const sHouse = manual.housing || currentEmp.subsidyHousing || 0;
            const sChrist = manual.christmas || currentEmp.subsidyChristmas || 0;
            const sVac = manual.vacation || currentEmp.subsidyVacation || 0;
            const allowances = manual.otherSubsidies || currentEmp.allowances || 0;

            const gross = base + sFood + sTrans + sFam + sHouse + sChrist + sVac + allowances - absenceDeduction;
            const inss = calculateINSS(base, sFood, sTrans);
            const irt = calculateIRT(base, inss, sFood, sTrans);
            const net = gross - inss - irt - (manual.penalties || 0);

            const slip = {
                employeeId: currentEmp.id,
                employeeName: currentEmp.name,
                employeeRole: currentEmp.role,
                professionCode: currentEmp.professionName,
                baseSalary: base,
                allowances: allowances,
                bonuses: 0,
                subsidies: sFood + sTrans + sFam + sHouse + sChrist + sVac,
                subsidyTransport: sTrans,
                subsidyFood: sFood,
                subsidyFamily: sFam,
                subsidyHousing: sHouse,
                absences: absenceDeduction,
                advances: currentEmp.advances || 0,
                penalties: manual.penalties || 0,
                grossTotal: gross,
                inss: inss,
                irt: irt,
                netTotal: net,
                month: currentMonth,
                year: currentYear,
                sChrist, sVac, sFam, sHouse,
                daysInMonth
            };

            setSlipData({ ...slip, emp: currentEmp });
            setView('SLIP');
            if (onToggleSidebarTheme) onToggleSidebarTheme(true);
        }
    };

    // State for Attendance Grid (Lifted to preserve across renders if needed, or kept local if temporary)
    // We keep it simpler by calculating on demand.

    const calculateSlip = (employee: Employee, manualAbsences: number = 0, manualOvertime: number = 0, foodDays: number = -1, transDays: number = -1) => {
        const base = employee.baseSalary;
        const manual = manualValues[employee.id] || {};

        const absenceDeduction = (base / 30) * manualAbsences;

        // Subsidies Calculation
        const sFoodFull = employee.subsidyFood || 0;
        const sTransFull = employee.subsidyTransport || 0;

        // If specific days provided, calculate proportional; otherwise default to employee's full subsidy
        const sFood = foodDays >= 0 ? (sFoodFull / 30) * foodDays : sFoodFull;
        const sTrans = transDays >= 0 ? (sTransFull / 30) * transDays : sTransFull;

        const sFam = manual.family || employee.subsidyFamily || 0;
        const sHouse = manual.housing || employee.subsidyHousing || 0;
        const sChrist = manual.christmas || employee.subsidyChristmas || 0;
        const sVac = manual.vacation || employee.subsidyVacation || 0;
        const allowances = manual.otherSubsidies || employee.allowances || 0;

        // Overtime Value Calculation
        const hourlyRate = (base / 30) / 8;
        const overtimeValue = hourlyRate * 1.5 * manualOvertime;

        const gross = base + sFood + sTrans + sFam + sHouse + sChrist + sVac + allowances + overtimeValue - absenceDeduction;

        const inss = calculateINSS(base, sFood, sTrans);
        const irt = calculateIRT(base, inss, sFood, sTrans);
        const penalties = manual.penalties || 0;

        const net = gross - inss - irt - penalties;

        return {
            emp: employee, // Critical for SalarySlipView
            employeeId: employee.id,
            employeeName: employee.name,
            employeeRole: employee.role,
            professionCode: employee.professionName,
            baseSalary: base,
            allowances: allowances,
            bonuses: overtimeValue, // Using bonuses field for overtime for now
            subsidies: sFood + sTrans + sFam + sHouse + sChrist + sVac,
            subsidyTransport: sTrans,
            subsidyFood: sFood,
            subsidyFamily: sFam,
            subsidyHousing: sHouse,
            absences: absenceDeduction,
            advances: employee.advances || 0,
            penalties: penalties,
            grossTotal: gross,
            inss: inss,
            irt: irt,
            netTotal: net,
            month: currentMonth,
            year: currentYear,
            sChrist, sVac, sFam, sHouse,
            daysInMonth: new Date(currentYear, currentMonth, 0).getDate(),
            overtimeHours: manualOvertime,
            absenceDays: manualAbsences
        };
    };

    const handleProcessAction = (isTransfer: boolean = false) => {
        if (!selectedAction && !isTransfer) return;

        const action = isTransfer ? 'PROCESS_SALARY' : selectedAction;

        if (action === 'PROCESS_SALARY') {
            if (selectedEmployees.size > 0) {
                // Check if ALL selected employees have attendance processed
                const unprocessedAttendance = Array.from(selectedEmployees).filter(id => !attendanceProcessed.has(id));
                if (unprocessedAttendance.length > 0) {
                    return alert("A efetividade deve estar processada antes de processar o salário. Selecione 'Processar Efetividade' primeiro.");
                }

                // If processing (calculating), we DON'T need cash register anymore for that
                // Cash register is only for actual payment (transfer)
                // However, the current code structure uses selectedCashRegister for the payment check later

                const updates: Record<string, number> = {};
                const slips: SalarySlip[] = [];

                selectedEmployees.forEach(id => {
                    const currentEmp = employees.find(e => e.id === id);
                    if (currentEmp) {
                        const base = currentEmp.baseSalary;
                        const manual = manualValues[currentEmp.id] || {};
                        const absentDays = 0;
                        const absenceDeduction = (base / 30) * absentDays;
                        const sFood = currentEmp.subsidyFood || 0;
                        const sTrans = currentEmp.subsidyTransport || 0;
                        const sFam = manual.family || currentEmp.subsidyFamily || 0;
                        const sHouse = manual.housing || currentEmp.subsidyHousing || 0;
                        const sChrist = manual.christmas || currentEmp.subsidyChristmas || 0;
                        const sVac = manual.vacation || currentEmp.subsidyVacation || 0;
                        const allowances = manual.otherSubsidies || currentEmp.allowances || 0;

                        const gross = base + sFood + sTrans + sFam + sHouse + sChrist + sVac + allowances - absenceDeduction;
                        const inss = calculateINSS(base, sFood, sTrans);
                        const irt = calculateIRT(base, inss, sFood, sTrans);
                        const net = gross - inss - irt - (manual.penalties || 0);
                        updates[id] = net;

                        // Create actual slip object for backend
                        slips.push({
                            employeeId: currentEmp.id,
                            employeeName: currentEmp.name,
                            employeeRole: currentEmp.role,
                            professionCode: currentEmp.professionName,
                            baseSalary: base,
                            allowances: allowances,
                            bonuses: 0,
                            subsidies: sFood + sTrans + sFam + sHouse + sChrist + sVac,
                            subsidyTransport: sTrans,
                            subsidyFood: sFood,
                            subsidyFamily: sFam,
                            subsidyHousing: sHouse,
                            absences: absenceDeduction,
                            advances: currentEmp.advances || 0,
                            penalties: manual.penalties || 0,
                            grossTotal: gross,
                            inss: inss,
                            irt: irt,
                            netTotal: net,
                            month: currentMonth,
                            year: currentYear,
                            sChrist, sVac, sFam, sHouse,
                            daysInMonth: new Date(currentYear, currentMonth, 0).getDate()
                        } as any);
                    }
                });
                setProcessedEmployees(prev => ({ ...prev, ...updates }));

                // Trigger parent update (App -> Transfer Order -> View)
                if (onProcessPayroll) {
                    // Only pass cashRegisterId if it is a Transfer operation
                    onProcessPayroll(slips, isTransfer ? selectedCashRegister : undefined);
                }
            } else {
                alert("Selecione funcionários para processar o salário.");
            }

        } else if (selectedAction === 'PROCESS_ATTENDANCE') {
            const idsToProcess = Array.from(selectedEmployees);

            if (idsToProcess.length === 0) {
                return alert("Nenhum funcionário selecionado para processar efetividade.");
            }

            // 1. Mark as Attendance Processed ONLY
            setAttendanceProcessed(prev => {
                const next = new Set(prev);
                idsToProcess.forEach(id => next.add(id));
                return next;
            });

            // 2. Ensure NO Salary Value is shown yet (remove from processedEmployees if exists)
            setProcessedEmployees(prev => {
                const next: Record<string, number> = { ...prev };
                idsToProcess.forEach((id: string) => delete next[id]);
                return next;
            });

            // 3. No Redirect

        } else if (selectedAction === 'PRINT_RECEIPT') {
            if (onShowReceipts && selectedEmployees.size > 0) {
                onShowReceipts(Array.from(selectedEmployees));
            } else {
                const empId = Array.from(selectedEmployees)[0] || employees[0]?.id;
                if (empId) {
                    const emp = employees.find(e => e.id === empId);
                    if (emp) {
                        // Try to print or just open the slip view
                        handleDirectProcess(empId);
                    }
                } else {
                    alert("Nenhum funcionário disponível para imprimir.");
                }
            }
        } else if (selectedAction === 'DELETE_SALARY') {
            if (selectedEmployees.size > 0) {
                if (confirm(`Deseja apagar o processamento de ${selectedEmployees.size} funcionário(s)?`)) {
                    const idsToRemove = Array.from(selectedEmployees);
                    setProcessedEmployees(prev => {
                        const next: Record<string, number> = { ...prev };
                        idsToRemove.forEach((id: string) => delete next[id]);
                        return next;
                    });
                    // Also clear attendance status? User didn't specify, but implies "Delete Salary" only.
                    // If we want to fully reset:
                    // Keep attendance processed when deleting salary!
                    // setAttendanceProcessed(prev => { ... }); -> REMOVED
                    setSelectedEmployees(new Set());
                    setSelectedEmployees(new Set());
                }
            } else {
                alert("Selecione funcionários para apagar o salário.");
            }
        } else if (selectedAction === 'DELETE_ATTENDANCE') {
            alert("Funcionalidade de apagar efetividade em massa em desenvolvimento.");
        } else {
            console.log("Action:", selectedAction);
        }
    };

    // Direct action from dropdown menu on row
    const handleRowAction = (action: string, empId: string) => {
        if (action === 'PROCESS_ATTENDANCE') {
            setAttendanceEmployeeId(empId);
            setView('ATTENDANCE');
            if (onToggleSidebarTheme) onToggleSidebarTheme(true);
            closeActionMenu();
        } else if (action === 'PROCESS_SALARY') {
            if (onOpenProcessingModal) {
                onOpenProcessingModal(empId);
            } else {
                handleDirectProcess(empId);
            }
            closeActionMenu();
        } else if (action === 'PRINT_RECEIPT') {
            if (onOpenProcessingModal) {
                onOpenProcessingModal(empId);
            } else {
                handleDirectProcess(empId);
            }
            closeActionMenu();
        }
    };

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Attendance Map Component (Internal for simplicity as requested)
    const AttendanceMapModal = () => {
        if (!attendanceEmployeeId) return null;
        const emp = employees.find(e => e.id === attendanceEmployeeId);
        if (!emp) return null;

        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

        const grid = grids[attendanceEmployeeId] || {};

        const updateGrid = (day: number, field: string, value: any) => {
            setGrids(prev => ({
                ...prev,
                [attendanceEmployeeId]: {
                    ...prev[attendanceEmployeeId] || {},
                    [day]: { ...(prev[attendanceEmployeeId]?.[day] || {}), [field]: value }
                }
            }));
        };

        // Initialize grid if empty
        if (Object.keys(grid).length === 0) {
            const initial: any = {};
            days.forEach(d => {
                const date = new Date(currentYear, currentMonth - 1, d);
                const isSunday = date.getDay() === 0;
                initial[d] = {
                    status: isSunday ? 'FOLGA' : 'SERVICO',
                    overtime: '00',
                    lost: '---',
                    location: isSunday ? '' : '1',
                    subFood: !isSunday,
                    subTrans: !isSunday
                };
            });
            setGrids(prev => ({ ...prev, [attendanceEmployeeId]: initial }));
        }

        const getDayName = (day: number) => {
            const date = new Date(currentYear, currentMonth - 1, day);
            return weekDays[date.getDay()];
        };



        const handleFull = (status: string) => {
            const next = { ...grid };
            days.forEach(d => {
                next[d] = { ...next[d], status };
            });
            setGrids(prev => ({ ...prev, [attendanceEmployeeId]: next }));
        };

        const handleAutofill = () => {
            const next = { ...grid };
            days.forEach(d => {
                const date = new Date(currentYear, currentMonth - 1, d);
                const isSunday = date.getDay() === 0;
                next[d] = {
                    ...next[d],
                    status: isSunday ? 'FOLGA' : 'SERVICO',
                    location: isSunday ? '' : '1',
                    subFood: !isSunday,
                    subTrans: !isSunday
                };
            });
            setGrids(prev => ({ ...prev, [attendanceEmployeeId]: next }));
        };

        return (
            <div className={`flex flex-col h-full bg-[#a3e4be] ${view === 'SPLIT' ? 'overflow-hidden' : 'fixed inset-0 z-[100] animate-in zoom-in-95 duration-200'}`}>
                {/* Header */}
                <div className="bg-transparent p-2 flex justify-between items-center border-b border-green-300">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase leading-none">IDNF</span>
                            <span className="text-xl font-black text-emerald-900 leading-none">{emp.employeeNumber || '2'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase leading-none">Nome</span>
                            <span className="text-xl font-black text-emerald-900 uppercase leading-none">{emp.name}</span>
                        </div>
                        <div className="text-red-600 font-bold text-[10px] bg-white/50 px-2 rounded mt-2">
                            [ Admitido em {formatDate(emp.admissionDate)} ]
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-black text-emerald-900">{months[currentMonth - 1]} {currentYear}</span>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-auto p-2">
                    <div className="bg-[#a3e4be] min-w-max pb-12">
                        {/* Background matches image - Green throughout */}
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-800">
                                    <th className="p-1 text-right bg-transparent w-[140px] sticky left-0 z-20 border-b border-green-600/30"></th>
                                    {days.map(d => (
                                        <th key={d} className="bg-transparent border-b border-green-600/30 min-w-[24px]">
                                            <div className="text-[8px] font-bold uppercase text-emerald-800">{getDayName(d).substring(0, 3)}</div>
                                            <div className="text-[10px] font-black">{d}</div>
                                        </th>
                                    ))}
                                    <th className="p-1 bg-transparent sticky right-12 z-20 border-b border-green-600/30 text-[9px]">Full</th>
                                    <th className="p-1 bg-emerald-100 sticky right-0 z-20 border-b border-green-600/30 text-[9px] font-black text-emerald-800">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-[10px]">
                                {/* Admissão / Demissão */}
                                <tr className="h-6">
                                    <td className="p-1 text-left bg-[#a3e4be] sticky left-0 z-10 font-bold text-emerald-900 whitespace-nowrap">Admissão/Demissão</td>
                                    {days.map(d => (
                                        <td key={d}>
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'ADMISSAO'}
                                                onChange={() => updateGrid(d, 'status', 'ADMISSAO')}
                                                className="w-3 h-3 accent-blue-600 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#a3e4be]">
                                        <input type="radio" name="full-row" onChange={() => handleFull('ADMISSAO')} className="w-3 h-3 accent-slate-600" />
                                    </td>
                                    <td className="sticky right-0 bg-emerald-50 font-bold text-center border-l border-green-200">
                                        {Object.values(grid).filter((v: any) => v.status === 'ADMISSAO').length}
                                    </td>
                                </tr>

                                {/* Folga - Green Row */}
                                <tr className="h-6 bg-[#22c55e]">
                                    <td className="p-1 text-left sticky left-0 z-10 bg-[#22c55e] text-black font-bold border-y border-green-600 pl-2">Folga</td>
                                    {days.map(d => (
                                        <td key={d} className="border-y border-green-600">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FOLGA'}
                                                onChange={() => updateGrid(d, 'status', 'FOLGA')}
                                                className="w-3 h-3 accent-white cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#22c55e] border-y border-green-600">
                                        <input type="radio" name="full-row" onChange={() => handleFull('FOLGA')} className="w-3 h-3 accent-black" />
                                    </td>
                                    <td className="sticky right-0 bg-emerald-600 text-white font-bold text-center border-l border-green-700">
                                        {Object.values(grid).filter((v: any) => v.status === 'FOLGA').length}
                                    </td>
                                </tr>

                                {/* Serviço - White Row */}
                                <tr className="h-6 bg-white">
                                    <td className="p-1 text-left bg-white sticky left-0 z-10 font-bold text-gray-800 border-y border-gray-300 pl-2">Serviço</td>
                                    {days.map(d => (
                                        <td key={d} className="border-y border-gray-300">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'SERVICO'}
                                                onChange={() => updateGrid(d, 'status', 'SERVICO')}
                                                className="w-3 h-3 accent-blue-600 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                    <td className="bg-white sticky right-12 border-y border-gray-300">
                                        <input type="radio" name="full-row" onChange={() => handleFull('SERVICO')} className="w-3 h-3 accent-slate-600" />
                                    </td>
                                    <td className="sticky right-0 bg-slate-100 font-bold text-center border-l border-gray-300">
                                        {Object.values(grid).filter((v: any) => v.status === 'SERVICO').length}
                                    </td>
                                </tr>

                                {/* Faltas Justificadas */}
                                <tr className="h-6">
                                    <td className="p-1 text-left bg-[#a3e4be] sticky left-0 z-10 font-bold text-emerald-900 pl-4 relative">
                                        <span className="absolute left-1 top-1 text-[8px] -rotate-90 origin-center translate-y-2 opacity-70">Faltas</span>
                                        Justificadas
                                    </td>
                                    {days.map(d => (
                                        <td key={d}>
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'JUST'}
                                                onChange={() => updateGrid(d, 'status', 'JUST')}
                                                className="w-3 h-3 accent-orange-500 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#a3e4be]">
                                        <input type="radio" name="full-row" onChange={() => handleFull('JUST')} className="w-3 h-3 accent-slate-600" />
                                    </td>
                                    <td className="sticky right-0 bg-emerald-50 font-bold text-center border-l border-green-200">
                                        {Object.values(grid).filter((v: any) => v.status === 'JUST').length}
                                    </td>
                                </tr>

                                {/* Faltas Injustificadas */}
                                <tr className="h-6">
                                    <td className="p-1 text-left bg-[#a3e4be] sticky left-0 z-10 font-bold text-emerald-900 pl-4">Injustificadas</td>
                                    {days.map(d => (
                                        <td key={d}>
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'INJUST'}
                                                onChange={() => updateGrid(d, 'status', 'INJUST')}
                                                className="w-3 h-3 accent-red-600 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#a3e4be]">
                                        <input type="radio" name="full-row" onChange={() => handleFull('INJUST')} className="w-3 h-3 accent-slate-600" />
                                    </td>
                                    <td className="sticky right-0 bg-red-50 text-red-700 font-bold text-center border-l border-red-200">
                                        {Object.values(grid).filter((v: any) => v.status === 'INJUST').length}
                                    </td>
                                </tr>

                                {/* Férias */}
                                <tr className="h-6">
                                    <td className="p-1 text-left bg-[#a3e4be] sticky left-0 z-10 font-bold text-emerald-900 pl-4">Férias</td>
                                    {days.map(d => (
                                        <td key={d}>
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FERIAS'}
                                                onChange={() => updateGrid(d, 'status', 'FERIAS')}
                                                className="w-3 h-3 accent-purple-500 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#a3e4be]">
                                        <input type="radio" name="full-row" onChange={() => handleFull('FERIAS')} className="w-3 h-3 accent-slate-600" />
                                    </td>
                                    <td className="sticky right-0 bg-purple-50 text-purple-700 font-bold text-center border-l border-purple-200">
                                        {Object.values(grid).filter((v: any) => v.status === 'FERIAS').length}
                                    </td>
                                </tr>

                                {/* Horas Extra */}
                                <tr className="h-6">
                                    <td className="p-1 text-left bg-[#a3e4be] sticky left-0 z-10 font-bold text-emerald-900 border-t border-green-600/20">Horas Extra</td>
                                    {days.map(d => (
                                        <td key={d} className="border-t border-green-600/20">
                                            <input
                                                type="text"
                                                value={grid[d]?.overtime || '--'}
                                                onChange={(e) => updateGrid(d, 'overtime', e.target.value)}
                                                className="w-full text-center outline-none bg-transparent text-[9px] font-mono p-0 h-full"
                                                maxLength={2}
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#a3e4be] border-t border-green-600/20"></td>
                                    <td className="sticky right-0 bg-emerald-50 font-bold text-center border-l border-green-200">
                                        {Object.values(grid).reduce((acc: number, v: any) => acc + parseFloat(v.overtime || '0'), 0)}
                                    </td>
                                </tr>

                                {/* Horas Perdidas */}
                                <tr className="h-6">
                                    <td className="p-1 text-left bg-[#a3e4be] sticky left-0 z-10 font-bold text-red-600">Horas Perdidas</td>
                                    {days.map(d => (
                                        <td key={d}>
                                            <input
                                                type="text"
                                                value={grid[d]?.lost || '--'}
                                                onChange={(e) => updateGrid(d, 'lost', e.target.value)}
                                                className="w-full text-center outline-none bg-transparent text-[9px] font-mono text-red-600 p-0 h-full"
                                                maxLength={2}
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#a3e4be]"></td>
                                    <td className="sticky right-0 bg-red-50 text-red-700 font-bold text-center border-l border-red-200">
                                        {Object.values(grid).reduce((acc: number, v: any) => acc + (v.lost === '---' ? 0 : parseFloat(v.lost || '0')), 0)}
                                    </td>
                                </tr>

                                {/* Local de Serviço */}
                                <tr className="h-6">
                                    <td className="p-1 text-left bg-[#a3e4be] sticky left-0 z-10 font-bold text-emerald-900 border-b border-green-600/20">Local de Serviço</td>
                                    {days.map(d => (
                                        <td key={d} className="border-b border-green-600/20">
                                            <input
                                                type="text"
                                                value={grid[d]?.location || '--'}
                                                onChange={(e) => updateGrid(d, 'location', e.target.value)}
                                                className="w-full text-center outline-none bg-transparent text-[9px] font-mono p-0 h-full"
                                                maxLength={1}
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-12 bg-[#a3e4be] border-b border-green-600/20"></td>
                                    <td className="sticky right-0 bg-emerald-50 font-bold text-center border-l border-green-200">-</td>
                                </tr>

                                {/* Subsídios Section */}
                                <tr className="h-6 bg-[#dcfce7]">
                                    <td className="p-1 text-left sticky left-0 z-10 bg-[#dcfce7] font-bold text-emerald-900 border-b border-green-600/20 pl-2 text-[9px]" rowSpan={2}>
                                        Subsídios
                                    </td>
                                    {days.map(d => (
                                        <td key={d} className="border border-green-600/20">
                                            <input
                                                type="checkbox"
                                                checked={!!grid[d]?.subFood}
                                                onChange={() => updateGrid(d, 'subFood', !grid[d]?.subFood)}
                                                className="w-3 h-3 accent-emerald-600 rounded cursor-pointer"
                                                title="Alimentação"
                                            />
                                        </td>
                                    ))}
                                    <td className="bg-[#dcfce7] sticky right-12 border-b border-green-600/20">
                                        <input type="checkbox" className="w-4 h-4 rounded-full cursor-pointer accent-emerald-600" onChange={(e) => {
                                            const val = e.target.checked;
                                            const next = { ...grid };
                                            days.forEach(d => {
                                                next[d] = { ...next[d], subFood: val };
                                            });
                                            setGrids(p => ({ ...p, [attendanceEmployeeId]: next }));
                                        }} />
                                    </td>
                                    <td className="sticky right-0 bg-emerald-100 font-bold text-center border-l border-green-200">
                                        {Object.values(grid).filter((v: any) => v.subFood).length}
                                    </td>
                                </tr>
                                <tr className="h-6 bg-[#dcfce7]">
                                    {/* Label handled by rowSpan */}
                                    {days.map(d => (
                                        <td key={d} className="border border-green-600/20">
                                            <input
                                                type="checkbox"
                                                checked={!!grid[d]?.subTrans}
                                                onChange={() => updateGrid(d, 'subTrans', !grid[d]?.subTrans)}
                                                className="w-3 h-3 accent-emerald-600 rounded cursor-pointer"
                                                title="Transporte"
                                            />
                                        </td>
                                    ))}
                                    <td className="bg-[#dcfce7] sticky right-12 border-b border-green-600/20">
                                        <input type="checkbox" className="w-4 h-4 rounded-full cursor-pointer accent-emerald-600" onChange={(e) => {
                                            const val = e.target.checked;
                                            const next = { ...grid };
                                            days.forEach(d => {
                                                next[d] = { ...next[d], subTrans: val };
                                            });
                                            setGrids(p => ({ ...p, [attendanceEmployeeId]: next }));
                                        }} />
                                    </td>
                                    <td className="sticky right-0 bg-emerald-100 font-bold text-center border-l border-green-200">
                                        {Object.values(grid).filter((v: any) => v.subTrans).length}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>


                    {/* Action Buttons (at bottom right) */}
                    <div className="flex justify-end gap-2 mt-4 px-4 sticky bottom-2">
                        <button
                            onClick={handleAutofill}
                            className="px-8 py-1 rounded-2xl bg-gradient-to-b from-gray-200 to-gray-400 border border-gray-500 text-black font-bold uppercase text-[12px] shadow hover:brightness-110 active:scale-95 transition"
                        >
                            Autofill
                        </button>
                        <button
                            onClick={() => {
                                // Calculate derived values from Grid
                                let absentDays = 0;
                                let foodDays = 0;
                                let transDays = 0;
                                let totalOvertime = 0;

                                Object.values(grid).forEach((d: any) => {
                                    if (d.status === 'INJUST') absentDays++;
                                    if (d.subFood) foodDays++;
                                    if (d.subTrans) transDays++;
                                    totalOvertime += parseFloat(d.overtime || '0');
                                });

                                // Update Receipt immediately using common calculation logic
                                const slip = calculateSlip(emp, absentDays, totalOvertime, foodDays, transDays);

                                setSlipData(slip);

                                // Mark as processed in the main list
                                if (slip.netTotal) {
                                    setProcessedEmployees(prev => ({ ...prev, [emp.id]: slip.netTotal }));
                                }
                            }}
                            className="px-8 py-1 rounded-2xl bg-gradient-to-b from-gray-200 to-gray-400 border border-gray-500 text-black font-bold uppercase text-[12px] shadow hover:brightness-110 active:scale-95 transition"
                        >
                            Processar
                        </button>
                    </div>
                </div>
            </div>
        );
    };



    const SalarySlipView = () => {
        if (!slipData || !slipData.emp) return null;
        const {
            emp,
            baseSalary: safeBase,
            subsidyFood: safeSubFoodValues,
            subsidyTransport: safeSubTransValues,
            subsidyFamily: safeSubFamValues,
            subsidyHousing: safeSubHouseValues,
            allowances: safeAllowances,
            absences: safeAbsences,
            inss,
            irt,
            netTotal,
            month,
            year
        } = slipData;

        const renderReceipt = (label: 'ORIGINAL' | 'DUPLICADO') => {
            const formatVal = (v: number) => {
                if (!v || v === 0) return '0,00';
                return v.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            const totalVencimento = safeBase + safeAllowances - safeAbsences;
            const totalSubsidios = (safeSubFamValues || 0) + (safeSubHouseValues || 0) + (safeSubFoodValues || 0) + (safeSubTransValues || 0);
            const totalAntesImpostos = totalVencimento + totalSubsidios;

            return (
                <div className="bg-white p-4 h-full flex flex-col text-[11px] font-sans text-black leading-tight border border-gray-100">
                    <div className="text-center mb-4">
                        <h1 className="text-[14px] font-extrabold uppercase tracking-tight">IMATEC SOFTWARE</h1>
                        <p className="font-bold text-[10px]">NIF: 500000000</p>
                        <div className="flex justify-between items-end mt-2">
                            <div className="w-1/3"></div>
                            <div className="w-1/3">
                                <p className="text-[10px] font-bold text-gray-400">{label}</p>
                                <h2 className="text-[12px] font-black uppercase whitespace-nowrap">RECIBO DE VENCIMENTO</h2>
                            </div>
                            <div className="w-1/3 text-right">
                                <p className="font-bold text-[11px]">{months[(month || 1) - 1]} de {year}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 border-t-2 border-black pt-2">
                        <div>
                            <div className="flex gap-2 font-black text-[12px]">
                                <span>{emp.employeeNumber || '---'}</span>
                                <span className="uppercase">{emp.name}</span>
                            </div>
                            <p className="font-bold text-[10px] mt-1">Profissão: {emp.professionName || '---'}</p>
                            <p className="font-bold text-[9px] mt-1 opacity-70">[ Admitido em {emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString('pt-PT') : '---'} ]</p>
                        </div>
                        <div className="text-right font-bold text-[10px] space-y-1">
                            <p>NIF Nº: {emp.nif || '---'}</p>
                            <p>INSS Nº: {emp.ssn || '---'}</p>
                        </div>
                    </div>

                    <div className="flex border-b-2 border-black pb-1 mb-2 font-black text-[10px] bg-gray-50 px-1">
                        <div className="w-[10%]">COD</div>
                        <div className="w-[60%]">DESCRIÇÃO</div>
                        <div className="w-[30%] text-right font-black">VALOR (AKZ)</div>
                    </div>

                    <div className="flex-1 space-y-1 font-bold text-[10px]">
                        <div className="flex px-1">
                            <div className="w-[10%]">01</div>
                            <div className="w-[60%] font-black uppercase">Vencimento Base</div>
                            <div className="w-[30%] text-right">{formatVal(safeBase)}</div>
                        </div>
                        {safeAllowances > 0 && <div className="flex px-1">
                            <div className="w-[10%]">02</div>
                            <div className="w-[60%] font-black uppercase">Complemento Salarial</div>
                            <div className="w-[30%] text-right">{formatVal(safeAllowances)}</div>
                        </div>}
                        {safeAbsences > 0 && <div className="flex px-1 text-red-600">
                            <div className="w-[10%]">04</div>
                            <div className="w-[60%] font-black uppercase">Abatimento de Faltas ({safeAbsences})</div>
                            <div className="w-[30%] text-right">-{formatVal(safeAbsences)}</div>
                        </div>}
                        <div className="flex px-1 font-black border-t-2 border-gray-100 bg-gray-50 pt-1">
                            <div className="w-[10%]">07</div>
                            <div className="w-[60%]">[01+02-04] Total Vencimento</div>
                            <div className="w-[30%] text-right">{formatVal(totalVencimento)}</div>
                        </div>

                        <div className="mt-4 px-1 py-0.5 font-black text-[9px] uppercase bg-gray-100 tracking-widest border-l-4 border-black">Subsidios e Abonos</div>
                        <div className="flex px-1">
                            <div className="w-[10%]">10</div>
                            <div className="w-[60%] uppercase">Abono de Família</div>
                            <div className="w-[30%] text-right">{formatVal(safeSubFamValues)}</div>
                        </div>
                        <div className="flex px-1">
                            <div className="w-[10%]">13</div>
                            <div className="w-[60%] uppercase">Subsídio de Alojamento</div>
                            <div className="w-[30%] text-right">{formatVal(safeSubHouseValues)}</div>
                        </div>
                        <div className="flex px-1 opacity-80">
                            <div className="w-[10%]">11/12</div>
                            <div className="w-[60%] uppercase italic">Sub. Alimentação / Transporte</div>
                            <div className="w-[30%] text-right">{formatVal((safeSubFoodValues || 0) + (safeSubTransValues || 0))}</div>
                        </div>
                        <div className="flex px-1 font-black border-t-2 border-gray-100 bg-gray-50 pt-1">
                            <div className="w-[10%]">15</div>
                            <div className="w-[60%] uppercase">Total Subsidios e Abonos</div>
                            <div className="w-[30%] text-right">{formatVal(totalSubsidios)}</div>
                        </div>

                        <div className="flex px-1 font-black text-[11px] mt-2 bg-slate-100 py-1 border-y border-slate-200">
                            <div className="w-[10%]">18</div>
                            <div className="w-[60%] uppercase tracking-wider">TOTAL ILÍQUIDO</div>
                            <div className="w-[30%] text-right">{formatVal(totalAntesImpostos)}</div>
                        </div>

                        <div className="mt-4 px-1 py-0.5 font-black text-[9px] uppercase bg-gray-100 tracking-widest border-l-4 border-red-600 text-red-700">Descontos Obrigatórios</div>
                        <div className="flex px-1">
                            <div className="w-[10%]">19</div>
                            <div className="w-[60%] uppercase">Segurança Social (INSS 3%)</div>
                            <div className="w-[30%] text-right">-{formatVal(inss)}</div>
                        </div>
                        <div className="flex px-1">
                            <div className="w-[10%]">20</div>
                            <div className="w-[60%] uppercase">Imp. Rendimento Trabalho (IRT)</div>
                            <div className="w-[30%] text-right">-{formatVal(irt)}</div>
                        </div>

                        <div className="flex font-black text-[13px] border-t-4 border-black pt-2 mt-4 bg-slate-50 px-1">
                            <div className="w-[10%]">24</div>
                            <div className="w-[60%] uppercase tracking-tight">VALOR LÍQUIDO A RECEBER</div>
                            <div className="w-[30%] text-right underline decoration-double">{formatVal(netTotal)}</div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dashed border-gray-300 grid grid-cols-2 gap-8">
                        <div className="text-center font-black text-[9px] uppercase opacity-40">
                            <div className="border-t border-black w-2/3 mx-auto mt-4 pt-1">A Entidade Patronal</div>
                        </div>
                        <div className="text-center font-black text-[9px] uppercase opacity-40">
                            <div className="border-t border-black w-2/3 mx-auto mt-4 pt-1">O Colaborador</div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className={`${view === 'SPLIT' ? 'flex flex-col h-full w-full overflow-hidden' : 'fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300 overflow-hidden'}`}>
                <div className={`${view === 'SPLIT' ? 'flex-1 p-2 flex flex-col items-center bg-slate-300 overflow-y-auto' : 'flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center bg-slate-300'}`}>

                    <div id="receipt-print-area" className="flex flex-row w-full max-w-[297mm] h-[148mm] bg-white shadow-2xl print:shadow-none p-0 relative shrink-0 mb-8 border border-white">
                        {/* Vertical Dash Line */}
                        <div className="absolute left-1/2 top-4 bottom-4 border-l border-dashed border-slate-300 z-10"></div>

                        <div className="w-1/2 border-r border-slate-100 p-2">
                            {renderReceipt('ORIGINAL')}
                        </div>
                        <div className="w-1/2 p-2">
                            {renderReceipt('DUPLICADO')}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="w-full bg-white border-t border-slate-200 p-4 flex justify-between items-center shrink-0 print:hidden sticky bottom-0 z-[120]">
                        <div className="flex flex-col">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualização em Duplicado (A4 Paisagem)</div>
                            <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 uppercase">Pronto para Processar</div>
                        </div>

                        <div className="flex items-center gap-4">
                            {processedEmployees[emp.id] ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase px-3 py-1 bg-emerald-100 rounded-full">
                                        <CheckCircle2 size={14} /> Processado
                                    </div>
                                    <button onClick={() => window.print()} className="bg-slate-800 hover:bg-black text-white px-5 py-2 rounded font-black uppercase text-xs flex items-center gap-2 transition-all">
                                        <Printer size={14} /> Imprimir
                                    </button>
                                    <button
                                        onClick={() => {
                                            setView('LIST');
                                            if (onToggleSidebarTheme) onToggleSidebarTheme(false);
                                        }}
                                        className="bg-white border-2 border-slate-800 px-5 py-2 rounded font-black text-xs uppercase hover:bg-slate-50 transition-all"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setView('LIST');
                                            if (onToggleSidebarTheme) onToggleSidebarTheme(false);
                                        }}
                                        className="px-6 py-2.5 text-slate-500 font-black uppercase text-xs hover:text-slate-800 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (slipData && onProcessPayroll) {
                                                setProcessedEmployees(prev => ({ ...prev, [emp.id]: slipData.netTotal }));
                                                onProcessPayroll([slipData]);
                                            }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-lg font-black uppercase text-sm shadow-xl transition-all active:scale-95 border-b-4 border-emerald-800"
                                    >
                                        Processar Salário
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-white relative">
            {view === 'ATTENDANCE' && <AttendanceMapModal />}
            {view === 'SLIP' && <SalarySlipView />}
            {view === 'SPLIT' && (
                <div className="flex h-full w-full bg-slate-900 border-t-2 border-slate-700">
                    {/* Left: Attendance Grid (Using existing Modal logic but rendered inline) */}
                    <div className="w-[55%] h-full overflow-hidden border-r-4 border-slate-900">
                        <AttendanceMapModal />
                    </div>
                    {/* Right: Salary Receipt */}
                    <div className="w-[45%] h-full overflow-y-auto bg-slate-100 p-2 md:p-6 shadow-inner">
                        <SalarySlipView />
                    </div>
                </div>
            )}

            {/* Top Toolbar - New Request */}
            {view === 'LIST' && <div className="p-2 bg-white border-b border-gray-200 flex flex-wrap gap-2 items-center justify-between">

                <div className="flex items-center gap-2">
                    {onViewTransferOrders && (
                        <button
                            onClick={onViewTransferOrders}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-bold uppercase transition flex items-center gap-2"
                        >
                            <ArrowRightLeft size={14} /> Salários Transferidos
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
                        value={selectedCashRegister}
                        onChange={e => setSelectedCashRegister(e.target.value)}
                    >
                        <option value="">Selecionar Caixa</option>
                        {cashRegisters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    {selectedCashRegister && selectedEmployees.size > 0 && (
                        <button
                            onClick={() => {
                                // Must have processed status to transfer? User said: "primeiro o salario deve estar processado"
                                // We check if all selected are processed
                                const allProcessed = Array.from(selectedEmployees).every(id => processedEmployees[id] !== undefined);
                                if (!allProcessed) {
                                    alert("Todos os funcionários selecionados devem ter o salário processado antes de transferir.");
                                    return;
                                }
                                if (confirm("Confirmar transferência de salário?")) {
                                    handleProcessAction(true);
                                }
                            }}
                            className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase hover:bg-green-700 transition flex items-center gap-2 animate-in slide-in-from-left-2"
                        >
                            <ArrowRightLeft size={14} /> Transferir
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-blue-500 min-w-[200px]"
                        value={selectedAction}
                        onChange={e => setSelectedAction(e.target.value)}
                    >
                        <option value="">Selecionar Ação...</option>
                        <option value="PROCESS_SALARY">Processar Salário</option>
                        <option value="PROCESS_ATTENDANCE">Processar Efetividade</option>
                        <option value="DELETE_SALARY">Apagar Salário</option>
                        <option value="DELETE_ATTENDANCE">Apagar Efetividade</option>
                        <option value="PRINT_RECEIPT">Imprimir Recibo</option>
                    </select>

                    <button
                        onClick={() => handleProcessAction(false)}
                        disabled={!selectedAction}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold uppercase hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        Executar
                    </button>
                </div>
            </div>}

            {/* Header */}
            {view === 'LIST' && <>
                <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 p-2 text-center shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">PROCESSAMENTO AUTOMATICO DE SALARIOS</h2>
                </div>
                <div className="bg-gray-50 border-b border-gray-300 p-1 text-center text-xs font-semibold text-gray-600">
                    Processamento referente ao mês de
                </div>
                <div className="bg-white p-3 border-b border-gray-200 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800 ml-4">
                        {months[currentMonth - 1]} de {currentYear}
                    </h1>
                    <div className="text-xs font-bold text-gray-500 mr-4">
                        {Object.keys(processedEmployees).length} Processados / {employees.length} Total
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {/* Main Group Headers */}
                            <tr className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase border-b border-gray-300">
                                <th className="p-2 border-r border-gray-300 text-center w-10" rowSpan={2}>
                                    <input type="checkbox" onChange={toggleSelectAll} className="rounded text-blue-600 focus:ring-blue-500" checked={selectedEmployees.size === employees.length && employees.length > 0} />
                                </th>
                                <th className="p-2 border-r border-gray-300" rowSpan={2}>Nº</th>
                                <th className="p-2 border-r border-gray-300" rowSpan={2}>IDNF<br />POSTO</th>
                                <th className="p-2 border-r border-gray-300" rowSpan={2}>Nome<br />Profissão</th>
                                <th className="p-2 border-r border-gray-300" rowSpan={2}>Admissão<br />Demissão</th>
                                <th className="p-2 border-r border-gray-300" rowSpan={2}>Titular<br />Caixa</th>
                                <th className="p-2 border-r border-gray-300 text-center" colSpan={2}>Pagamentos (AKZ)</th>
                                <th className="p-2 border-r border-gray-300 text-center" colSpan={3}>Subsidios Pontuais Manuais</th>
                                <th className="p-2 border-r border-gray-300 text-center" rowSpan={2}>Abono<br />Familia</th>
                                <th className="p-2 border-r border-gray-300 text-center" colSpan={2}>Sub Isentos</th>
                                <th className="p-2 border-r border-gray-300 text-center" colSpan={3}>Outros Acertos Salariais</th>
                                <th className="p-2 border-r border-gray-300 text-center" rowSpan={2}>Magic</th>
                                <th className="p-2 border-r border-gray-300 text-center" colSpan={2}>Processamento</th>
                                <th className="p-2 border-r border-gray-300 text-center" rowSpan={2}>Item</th>
                                <th className="p-2 text-center w-16" rowSpan={2}>Ações</th>
                            </tr>
                            {/* Sub Headers */}
                            <tr className="bg-gray-50 text-gray-500 text-[9px] font-bold uppercase border-b border-gray-300">
                                <th className="p-2 border-r border-gray-300">S. base<br />Compl.Sal</th>
                                <th className="p-2 border-r border-gray-300">Abonos<br />Adianta</th>
                                <th className="p-2 border-r border-gray-300">Ferias</th>
                                <th className="p-2 border-r border-gray-300">Natal</th>
                                <th className="p-2 border-r border-gray-300">Alojamento</th>
                                <th className="p-2 border-r border-gray-300">SUB<br />ALIM</th>
                                <th className="p-2 border-r border-gray-300">SUB<br />TRANS</th>
                                <th className="p-2 border-r border-gray-300">Outros<br />Subsidios</th>
                                <th className="p-2 border-r border-gray-300">Acertos<br />Salariais</th>
                                <th className="p-2 border-r border-gray-300">Multas<br />Penaliza</th>
                                <th className="p-2 border-r border-gray-300">Processar<br />Assiduida</th>
                                <th className="p-2 border-r border-gray-300">Horas<br />Faltas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map((emp, index) => {
                                const isSelected = selectedEmployees.has(emp.id);
                                const processedValue = processedEmployees[emp.id];
                                const isProcessed = processedValue !== undefined;

                                // Initialize manual values if not present
                                const vacation = getManualValue(emp.id, 'vacation');
                                const christmas = getManualValue(emp.id, 'christmas');
                                const housing = getManualValue(emp.id, 'housing');
                                const family = getManualValue(emp.id, 'family');
                                const otherSubs = getManualValue(emp.id, 'otherSubsidies');
                                const adjustments = getManualValue(emp.id, 'adjustments');
                                const penalties = getManualValue(emp.id, 'penalties');
                                const isMagic = getManualBool(emp.id, 'magic');
                                const isItem = getManualBool(emp.id, 'item');

                                return (
                                    <tr key={emp.id} className={`transition-colors text-xs odd:bg-white even:bg-gray-50 hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                        <td className="p-2 border-r border-gray-200 text-center">
                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(emp.id)} className="rounded text-blue-600 focus:ring-blue-500" />
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-500">{index + 1}</td>
                                        <td className="p-2 border-r border-gray-200">
                                            <div className="font-bold text-gray-800">{emp.employeeNumber || '---'}</div>
                                            <div className="text-[10px] text-gray-500 truncate max-w-[100px]">{emp.role}</div>
                                        </td>
                                        <td className="p-2 border-r border-gray-200">
                                            <div className="font-bold text-gray-800 truncate max-w-[150px]">{emp.name}</div>
                                            <div className="text-[10px] text-gray-500">{emp.professionName || emp.role}</div>
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-[10px]">
                                            <div>{formatDate(emp.admissionDate)}</div>
                                            <div className="text-red-400">{emp.terminationDate ? formatDate(emp.terminationDate) : ''}</div>
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-center">
                                            {/* Checkbox placeholder/logic if needed */}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-right font-mono">
                                            <div className="font-bold text-gray-800">{formatCurrency(emp.baseSalary).replace('Kz', '')}</div>
                                            <div className="text-gray-500">{formatCurrency(emp.complementSalary || 0).replace('Kz', '')}</div>
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-right font-mono">
                                            <div className="text-gray-800">{formatCurrency(emp.allowances || 0).replace('Kz', '')}</div>
                                            <div className="text-gray-500">{formatCurrency(emp.advances || 0).replace('Kz', '')}</div>
                                        </td>
                                        <td className="p-1 border-r border-gray-200"><input type="number" className="w-16 bg-gray-100 border border-gray-300 px-1 rounded text-right text-[10px]" value={vacation || ''} onChange={(e) => updateManualValue(emp.id, 'vacation', Number(e.target.value))} /></td>
                                        <td className="p-1 border-r border-gray-200"><input type="number" className="w-16 bg-gray-100 border border-gray-300 px-1 rounded text-right text-[10px]" value={christmas || ''} onChange={(e) => updateManualValue(emp.id, 'christmas', Number(e.target.value))} /></td>
                                        <td className="p-1 border-r border-gray-200"><input type="number" className="w-16 bg-gray-100 border border-gray-300 px-1 rounded text-right text-[10px]" value={housing || ''} onChange={(e) => updateManualValue(emp.id, 'housing', Number(e.target.value))} /></td>
                                        <td className="p-1 border-r border-gray-200"><input type="number" className="w-16 bg-gray-100 border border-gray-300 px-1 rounded text-right text-[10px]" value={family || ''} onChange={(e) => updateManualValue(emp.id, 'family', Number(e.target.value))} /></td>

                                        <td className="p-2 border-r border-gray-200 text-center font-mono text-[10px] text-gray-500">{emp.subsidyFood ? formatCurrency(emp.subsidyFood).replace('Kz', '') : 'NA'}</td>
                                        <td className="p-2 border-r border-gray-200 text-center font-mono text-[10px] text-gray-500">{emp.subsidyTransport ? formatCurrency(emp.subsidyTransport).replace('Kz', '') : 'NA'}</td>

                                        <td className="p-1 border-r border-gray-200"><input type="number" className="w-16 text-right text-[10px] bg-transparent border-b border-gray-300 outline-none focus:border-blue-500" value={otherSubs || 0} onChange={(e) => updateManualValue(emp.id, 'otherSubsidies', Number(e.target.value))} /></td>
                                        <td className="p-1 border-r border-gray-200"><input type="number" className="w-16 text-right text-[10px] bg-transparent border-b border-gray-300 outline-none focus:border-blue-500" value={adjustments || 0} onChange={(e) => updateManualValue(emp.id, 'adjustments', Number(e.target.value))} /></td>
                                        <td className="p-1 border-r border-gray-200"><input type="number" className="w-16 text-right text-[10px] bg-transparent border-b border-gray-300 outline-none focus:border-blue-500" value={penalties || 0} onChange={(e) => updateManualValue(emp.id, 'penalties', Number(e.target.value))} /></td>

                                        <td className="p-2 border-r border-gray-200 text-center">
                                            <button
                                                onClick={() => {
                                                    // Switch to Split View with this employee active
                                                    setAttendanceEmployeeId(emp.id);
                                                    // Pre-calculate slip if not exists
                                                    const slip = calculateSlip(emp); // Assumes we have this or can derive it
                                                    setSlipData(slip);
                                                    if (onToggleSidebarTheme) onToggleSidebarTheme(true); // Maybe hide sidebar or change theme
                                                    setView('SPLIT');
                                                }}
                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm text-[10px] font-black uppercase transition active:scale-95"
                                            >
                                                Executar
                                            </button>
                                        </td>

                                        <td className="p-2 border-r border-gray-200 text-center">
                                            {isProcessed ? (
                                                <span className="font-black text-emerald-600 text-xs flex flex-col items-center animate-in zoom-in">
                                                    {formatCurrency(processedValue).replace('Kz', '')}
                                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded uppercase">Processado</span>
                                                </span>
                                            ) : attendanceProcessed.has(emp.id) ? (
                                                <span className="font-black text-emerald-600 text-xs flex flex-col items-center animate-in zoom-in">
                                                    <span>---</span>
                                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded uppercase">Processado</span>
                                                </span>
                                            ) : (
                                                <span className="text-red-500 font-bold text-[10px]">Incompleto</span>
                                            )}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-center">
                                            {/* Horas Faltas placeholder */}
                                        </td>

                                        <td className="p-2 border-r border-gray-200 text-center">
                                            <div
                                                onClick={() => updateManualValue(emp.id, 'item', !isItem)}
                                                className={`w-4 h-4 mx-auto border cursor-pointer ${isItem ? 'bg-red-600 border-red-700' : 'bg-white border-gray-400'}`}
                                            ></div>
                                        </td>

                                        <td className="p-2 text-center relative">
                                            <button onClick={() => handleActionClick(emp.id)} className="text-gray-400 hover:text-blue-600 transition">
                                                <MoreVertical size={16} />
                                            </button>
                                            <div className="text-[9px] text-gray-400 font-bold">Ações</div>
                                        </td>
                                    </tr>
                                );
                            })
                            }
                        </tbody>
                    </table>
                </div>

                {/* Action Menu Modal (Context Menu) */}
                {actionMenuOpenId && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={closeActionMenu}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                                <h3 className="font-bold uppercase tracking-wide">Ações do Funcionário</h3>
                                <button onClick={closeActionMenu} className="hover:bg-blue-700 p-1 rounded-full"><X size={18} /></button>
                            </div>
                            <div className="p-2">
                                <button onClick={() => handleRowAction('PRINT_RECEIPT', actionMenuOpenId)} className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 border-b border-gray-100">
                                    <Printer size={16} className="text-gray-500" />
                                    <span className="font-medium text-sm text-gray-700">Imprimir recibo</span>
                                </button>
                                <button onClick={() => handleRowAction('PROCESS_SALARY', actionMenuOpenId)} className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 border-b border-gray-100">
                                    <CheckSquare size={16} className="text-blue-500" />
                                    <span className="font-medium text-sm text-gray-700">Processar salario</span>
                                </button>
                                <button onClick={() => handleRowAction('PROCESS_ATTENDANCE', actionMenuOpenId)} className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 border-b border-gray-100">
                                    <CheckSquare size={16} className="text-green-500" />
                                    <span className="font-medium text-sm text-gray-700">Processar efetividade</span>
                                </button>
                                <button onClick={() => handleRowAction('DELETE_ATTENDANCE', actionMenuOpenId)} className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 border-b border-gray-100">
                                    <Trash2 size={16} className="text-orange-500" />
                                    <span className="font-medium text-sm text-gray-700">Apagar efetividade</span>
                                </button>
                                <button onClick={() => handleRowAction('DELETE_SALARY', actionMenuOpenId)} className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3">
                                    <Trash2 size={16} className="text-red-500" />
                                    <span className="font-medium text-sm text-gray-700">Apagar salario</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>}
        </div>
    );
};

export default ProcessSalary;

