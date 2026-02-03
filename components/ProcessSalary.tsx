
import React, { useState, useMemo } from 'react';
import { Employee, SalarySlip, CashRegister } from '../types';
import { formatCurrency, formatDate, calculateINSS, calculateIRT, numberToExtenso, roundToNearestBank } from '../utils';
import { Save, Printer, Trash2, CheckSquare, MoreVertical, X, Calendar, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';

interface ProcessSalaryProps {
    employees: Employee[];
    onProcessPayroll: (slips: SalarySlip[]) => void;
    currentMonth: number;
    currentYear: number;
    cashRegisters: CashRegister[];
    onOpenProcessingModal?: (employeeId?: string) => void;
    onToggleSidebarTheme?: (isWhite: boolean) => void;
}

const ProcessSalary: React.FC<ProcessSalaryProps> = ({ employees, onProcessPayroll, currentMonth, currentYear, cashRegisters, onOpenProcessingModal, onToggleSidebarTheme }) => {
    const [processedEmployees, setProcessedEmployees] = useState<Record<string, number>>({});
    const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

    // Header Controls State
    const [selectedCashRegister, setSelectedCashRegister] = useState<string>('');
    const [selectedAction, setSelectedAction] = useState<string>('');

    // Attendance Map Modal State
    // View State
    const [view, setView] = useState<'LIST' | 'ATTENDANCE' | 'SLIP'>('LIST');
    const [attendanceEmployeeId, setAttendanceEmployeeId] = useState<string | null>(null);
    const [slipData, setSlipData] = useState<any>(null); // Data for valid slip

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

    const handleProcessAction = () => {
        if (!selectedAction) return;

        if (selectedAction === 'PROCESS_SALARY') {
            const empId = Array.from(selectedEmployees)[0] || employees[0]?.id;
            if (empId) {
                if (onOpenProcessingModal) {
                    onOpenProcessingModal(empId);
                } else {
                    handleDirectProcess(empId);
                }
            } else {
                alert("Nenhum funcionário disponível para processar.");
            }
        } else if (selectedAction === 'PROCESS_ATTENDANCE') {
            const empId = Array.from(selectedEmployees)[0] || employees[0]?.id;
            if (empId) {
                setAttendanceEmployeeId(empId);
                setView('ATTENDANCE');
                if (onToggleSidebarTheme) onToggleSidebarTheme(true);
            } else {
                alert("Nenhum funcionário disponível para processar efetividade.");
            }
        } else if (selectedAction === 'PRINT_RECEIPT') {
            const empId = Array.from(selectedEmployees)[0] || employees[0]?.id;
            if (empId) {
                const emp = employees.find(e => e.id === empId);
                if (emp && onPrintSlip) {
                    onPrintSlip(emp);
                } else if (emp) {
                    handleDirectProcess(empId);
                }
            } else {
                alert("Nenhum funcionário disponível para imprimir.");
            }
        } else if (selectedAction === 'DELETE_SALARY') {
            if (selectedEmployees.size > 0) {
                if (confirm(`Deseja apagar o processamento de ${selectedEmployees.size} funcionário(s)?`)) {
                    const idsToRemove = Array.from(selectedEmployees);
                    setProcessedEmployees(prev => {
                        const next = { ...prev };
                        idsToRemove.forEach(id => delete next[id]);
                        return next;
                    });
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

        const [grid, setGrid] = useState<Record<number, {
            status: string;
            overtime: string;
            lost: string;
            location: string;
        }>>(() => {
            const initial: any = {};
            days.forEach(d => {
                const date = new Date(currentYear, currentMonth - 1, d);
                const isSunday = date.getDay() === 0;
                initial[d] = {
                    status: isSunday ? 'FOLGA' : 'SERVICO',
                    overtime: '00',
                    lost: '---',
                    location: isSunday ? '' : '1'
                };
            });
            return initial;
        });

        const getDayName = (day: number) => {
            const date = new Date(currentYear, currentMonth - 1, day);
            return weekDays[date.getDay()];
        };

        const updateGrid = (day: number, field: string, value: any) => {
            setGrid(prev => ({
                ...prev,
                [day]: { ...prev[day], [field]: value }
            }));
        };

        const handleFull = (status: string) => {
            setGrid(prev => {
                const next = { ...prev };
                days.forEach(d => {
                    next[d] = { ...next[d], status };
                });
                return next;
            });
        };

        const handleAutofill = () => {
            setGrid(prev => {
                const next = { ...prev };
                days.forEach(d => {
                    const date = new Date(currentYear, currentMonth - 1, d);
                    const isSunday = date.getDay() === 0;
                    next[d] = {
                        ...next[d],
                        status: isSunday ? 'FOLGA' : 'SERVICO',
                        location: isSunday ? '' : '1'
                    };
                });
                return next;
            });
        };

        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white border-b border-gray-300 p-3 flex justify-between items-center">
                    <div className="flex items-center gap-12">
                        <div>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">IDNF</span>
                            <span className="text-xl font-black text-gray-900">{emp.employeeNumber || '---'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">Nome</span>
                            <span className="text-xl font-black text-gray-900 uppercase">{emp.name}</span>
                        </div>
                        <div className="text-red-600 font-bold text-xs mt-2">
                            [ Admitido em {formatDate(emp.admissionDate)} ]
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-gray-900">{months[currentMonth - 1]} {currentYear}</span>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-auto p-2 bg-white">
                    <div className="border border-gray-300 shadow-sm min-w-max">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-800">
                                    <th className="p-2 border border-gray-300 text-left bg-white w-[180px] sticky left-0 z-20"></th>
                                    {days.map(d => (
                                        <th key={d} className="border border-gray-300 bg-white">
                                            <div className="text-[9px] font-medium text-gray-500">{getDayName(d)}</div>
                                            <div className="text-xs font-bold">{d}</div>
                                        </th>
                                    ))}
                                    <th className="p-1 border border-gray-300 bg-white sticky right-0 z-20">Full</th>
                                </tr>
                            </thead>
                            <tbody className="text-[10px]">
                                {/* Admissão / Demissão */}
                                <tr className="h-7">
                                    <td className="p-1 border border-gray-300 text-left bg-white sticky left-0 z-10">Admissão/Demissão</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-200">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'ADMISSAO'}
                                                onChange={() => updateGrid(d, 'status', 'ADMISSAO')}
                                                className="w-3 h-3 accent-blue-600"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0">
                                        <input type="radio" name="full-row" onChange={() => handleFull('ADMISSAO')} className="w-3 h-3" />
                                    </td>
                                </tr>

                                {/* Folga - Green Row */}
                                <tr className="h-7 bg-[#22c55e]">
                                    <td className="p-1 border border-gray-300 text-left sticky left-0 z-10 bg-inherit text-black">Folga</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FOLGA'}
                                                onChange={() => updateGrid(d, 'status', 'FOLGA')}
                                                className="w-3 h-3 accent-white"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0">
                                        <input type="radio" name="full-row" onChange={() => handleFull('FOLGA')} className="w-3 h-3" />
                                    </td>
                                </tr>

                                {/* Serviço */}
                                <tr className="h-7">
                                    <td className="p-1 border border-gray-300 text-left bg-white sticky left-0 z-10">Serviço</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'SERVICO'}
                                                onChange={() => updateGrid(d, 'status', 'SERVICO')}
                                                className="w-3 h-3 accent-blue-600"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0">
                                        <input type="radio" name="full-row" onChange={() => handleFull('SERVICO')} className="w-3 h-3" />
                                    </td>
                                </tr>

                                {/* Faltas Justificadas */}
                                <tr className="h-7">
                                    <td rowSpan={2} className="p-1 border border-gray-300 text-left bg-white sticky left-0 z-10 font-bold border-r-0">Faltas</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300 border-l-0">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'JUST'}
                                                onChange={() => updateGrid(d, 'status', 'JUST')}
                                                className="w-3 h-3 accent-gray-500"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0">
                                        <input type="radio" name="full-row" onChange={() => handleFull('JUST')} className="w-3 h-3" />
                                    </td>
                                </tr>
                                <tr className="h-7">
                                    {/* Rowspan handled header above */}
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'INJUST'}
                                                onChange={() => updateGrid(d, 'status', 'INJUST')}
                                                className="w-3 h-3 accent-red-600"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0">
                                        <input type="radio" name="full-row" onChange={() => handleFull('INJUST')} className="w-3 h-3" />
                                    </td>
                                </tr>

                                {/* Férias */}
                                <tr className="h-7">
                                    <td className="p-1 border border-gray-300 text-left bg-white sticky left-0 z-10">Férias</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FERIAS'}
                                                onChange={() => updateGrid(d, 'status', 'FERIAS')}
                                                className="w-3 h-3"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0">
                                        <input type="radio" name="full-row" onChange={() => handleFull('FERIAS')} className="w-3 h-3" />
                                    </td>
                                </tr>

                                {/* Horas Extra */}
                                <tr className="h-7 bg-white">
                                    <td className="p-1 border border-gray-300 text-left sticky left-0 z-10 bg-white">Horas Extra</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300">
                                            <input
                                                type="text"
                                                value={grid[d]?.overtime}
                                                onChange={(e) => updateGrid(d, 'overtime', e.target.value)}
                                                className="w-full text-center outline-none bg-transparent"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0"></td>
                                </tr>

                                {/* Horas Perdidas */}
                                <tr className="h-7 bg-white text-red-600">
                                    <td className="p-1 border border-gray-300 text-left sticky left-0 z-10 bg-white text-red-600">Horas Perdidas</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300">
                                            <input
                                                type="text"
                                                value={grid[d]?.lost}
                                                onChange={(e) => updateGrid(d, 'lost', e.target.value)}
                                                className="w-full text-center outline-none bg-transparent"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0"></td>
                                </tr>

                                {/* Local de Serviço */}
                                <tr className="h-7 bg-white">
                                    <td className="p-1 border border-gray-300 text-left sticky left-0 z-10 bg-white">Local de Serviço</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300">
                                            <input
                                                type="text"
                                                value={grid[d]?.location}
                                                onChange={(e) => updateGrid(d, 'location', e.target.value)}
                                                className="w-full text-center outline-none bg-transparent"
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0"></td>
                                </tr>

                                {/* Subsídios Section */}
                                <tr className="h-7 bg-[#dcfce7]">
                                    <td className="p-1 border border-gray-300 text-left sticky left-0 z-10 bg-[#dcfce7] font-bold" rowSpan={2}>Subsídios</td>
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300 text-emerald-800">xx</td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0"></td>
                                </tr>
                                <tr className="h-7 bg-[#dcfce7]">
                                    {/* Subsidies label handled by rowSpan */}
                                    {days.map(d => (
                                        <td key={d} className="border border-gray-300 text-emerald-800">xx</td>
                                    ))}
                                    <td className="border border-gray-300 bg-gray-50 sticky right-0"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Action Buttons (at bottom but fixed) */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={handleAutofill}
                            className="px-12 py-1.5 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 border border-gray-400 text-gray-800 font-bold uppercase text-[11px] shadow-sm hover:from-gray-200 hover:to-gray-400 active:scale-95 transition"
                        >
                            Autofill
                        </button>
                        <button
                            onClick={() => {
                                // Logic for "Processar" button
                                // Count days for different statuses
                                let workedDays = 0;
                                let absentDays = 0;
                                Object.values(grid).forEach((d: any) => {
                                    if (d.status === 'SERVICO') workedDays++;
                                    if (d.status === 'INJUST') absentDays++;
                                });

                                const currentEmp = employees.find(e => e.id === attendanceEmployeeId);
                                if (currentEmp) {
                                    const base = currentEmp.baseSalary;
                                    const manual = manualValues[currentEmp.id] || {};

                                    // Calculation logic for the slip
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
                                        sChrist, sVac, sFam, sHouse
                                    };

                                    setSlipData({ ...slip, emp: currentEmp });
                                    setView('SLIP');
                                }
                            }}
                            className="px-12 py-1.5 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 border border-gray-400 text-gray-800 font-bold uppercase text-[11px] shadow-sm hover:from-gray-200 hover:to-gray-400 active:scale-95 transition"
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
            sChrist: safeSubChristValues,
            sVac: safeSubVacValues,
            allowances: safeAllowances,
            absences: safeAbsences,
            inss,
            irt,
            netTotal,
            month,
            year,
            daysInMonth
        } = slipData;

        // Ensure we have numbers - handle potentially different prop names
        const safeSubVac = safeSubVacValues || 0;
        const safeSubChrist = safeSubChristValues || 0;
        const safeSubTrans = safeSubTransValues || 0;
        const safeSubFood = safeSubFoodValues || 0;
        const safeSubFam = safeSubFamValues || 0;
        const safeSubHouse = safeSubHouseValues || 0;

        const calculatedAbsentDays = safeBase > 0 ? Math.round(safeAbsences / (safeBase / 30)) : 0;
        const totalIliquido = safeBase + safeAllowances - safeAbsences;
        const totalSubs = safeSubVac + safeSubChrist + safeSubFam + safeSubTrans + safeSubFood + safeSubHouse;
        const totalBeforeTax = totalIliquido + totalSubs;

        return (
            <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300 overflow-hidden">
                <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center bg-slate-100/50">

                    {/* RECEIPT DESIGN - IMPROVED TABLE LAYOUT */}
                    <div id="receipt-print-area" className="bg-white shadow-xl w-full max-w-[95vw] md:max-w-4xl min-h-[148mm] mx-auto print:shadow-none print:w-full print:max-w-none font-sans text-slate-900 border border-slate-300 p-8 md:p-12 relative flex flex-col">

                        {/* Receipt Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                    <CheckCircle2 className="text-slate-300" size={32} />
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">IMATEC SOFTWARE</h1>
                                    <p className="text-xs text-slate-500 font-medium max-w-[250px]">Gestão e Processamento</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">NIF: 500000000</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-lg font-black text-slate-400 uppercase tracking-[0.2em]">RECIBO DE VENCIMENTO</h2>
                                <p className="text-sm font-bold text-slate-900 mt-2 uppercase">{months[month - 1]} / {year}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Período de Processamento</p>
                            </div>
                        </div>

                        {/* Employee Info */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Funcionário</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono bg-white px-1.5 py-0.5 border rounded text-xs text-slate-500">{emp.id.replace(/\D/g, '').substring(0, 3)}</span>
                                    <p className="text-base font-black text-slate-800 uppercase">{emp.name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria</p>
                                    <p className="text-xs font-bold text-slate-700 uppercase">{emp.professionName || 'Geral'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dias Úteis</p>
                                    <p className="text-xs font-bold text-slate-700 uppercase">{daysInMonth || 30} dias</p>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-slate-200 text-left">
                                        <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">Cód</th>
                                        <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Descrição</th>
                                        <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right w-24">Abonos</th>
                                        <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right w-24">Descontos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 divide-dashed">
                                    {/* Earnings */}
                                    <tr className="group hover:bg-slate-50">
                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">01</td>
                                        <td className="py-2 pl-2 font-medium text-slate-700">Vencimento Base</td>
                                        <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(safeBase).replace('Kz', '')}</td>
                                        <td className="py-2 text-right text-slate-300">---</td>
                                    </tr>

                                    {safeAllowances > 0 && (
                                        <tr className="group hover:bg-slate-50">
                                            <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">02</td>
                                            <td className="py-2 pl-2 font-medium text-slate-700">Complementos Salariais</td>
                                            <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(safeAllowances).replace('Kz', '')}</td>
                                            <td className="py-2 text-right text-slate-300">---</td>
                                        </tr>
                                    )}

                                    {safeSubFood > 0 && <tr className="group hover:bg-slate-50">
                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">S1</td>
                                        <td className="py-2 pl-2 font-medium text-slate-700">Subsídio de Alimentação</td>
                                        <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(safeSubFood).replace('Kz', '')}</td>
                                        <td className="py-2 text-right text-slate-300">---</td>
                                    </tr>}

                                    {safeSubTrans > 0 && <tr className="group hover:bg-slate-50">
                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">S2</td>
                                        <td className="py-2 pl-2 font-medium text-slate-700">Subsídio de Transporte</td>
                                        <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(safeSubTrans).replace('Kz', '')}</td>
                                        <td className="py-2 text-right text-slate-300">---</td>
                                    </tr>}

                                    {safeSubVac > 0 && <tr className="group hover:bg-slate-50">
                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">S3</td>
                                        <td className="py-2 pl-2 font-medium text-slate-700">Subsídio de Férias</td>
                                        <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(safeSubVac).replace('Kz', '')}</td>
                                        <td className="py-2 text-right text-slate-300">---</td>
                                    </tr>}

                                    {/* Deductions */}
                                    {safeAbsences > 0 && (
                                        <tr className="group hover:bg-slate-50">
                                            <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">D1</td>
                                            <td className="py-2 pl-2 font-medium text-slate-700">Faltas Injustificadas ({calculatedAbsentDays} dias)</td>
                                            <td className="py-2 text-right text-slate-300">---</td>
                                            <td className="py-2 text-right font-bold text-red-600">
                                                -{formatCurrency(safeAbsences).replace('Kz', '')}
                                            </td>
                                        </tr>
                                    )}

                                    <tr className="group hover:bg-slate-50">
                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">D2</td>
                                        <td className="py-2 pl-2 font-medium text-slate-700">Segurança Social (INSS 3%)</td>
                                        <td className="py-2 text-right text-slate-300">---</td>
                                        <td className="py-2 text-right font-bold text-red-600">-{formatCurrency(inss).replace('Kz', '')}</td>
                                    </tr>

                                    <tr className="group hover:bg-slate-50">
                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">D3</td>
                                        <td className="py-2 pl-2 font-medium text-slate-700">Imposto sobre Rendimento (IRT)</td>
                                        <td className="py-2 text-right text-slate-300">---</td>
                                        <td className="py-2 text-right font-bold text-red-600">-{formatCurrency(irt).replace('Kz', '')}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-slate-900">
                                        <td colSpan={2} className="pt-4 text-right pr-4 text-xs font-black uppercase text-slate-500 tracking-wider">Totais</td>
                                        <td className="pt-4 text-right font-black text-slate-800 bg-slate-50 rounded-l-lg py-2">
                                            {formatCurrency(totalBeforeTax).replace('Kz', '')}
                                        </td>
                                        <td className="pt-4 text-right font-black text-red-600 bg-slate-50 rounded-r-lg py-2">
                                            -{formatCurrency(irt + inss + safeAbsences).replace('Kz', '')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Net Pay Highlight */}
                        <div className="mt-8 bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center shadow-lg">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Líquido a Receber</p>
                                <p className="text-xs text-slate-500 font-medium">Transferência ou Numerário</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black tracking-tight">{formatCurrency(netTotal)}</p>
                            </div>
                        </div>

                        {/* Footer Signatures */}
                        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12">
                            <div className="text-center">
                                <div className="h-0.5 w-2/3 bg-slate-300 mx-auto mb-2"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A Entidade Patronal</p>
                            </div>
                            <div className="text-center">
                                <div className="h-0.5 w-2/3 bg-slate-300 mx-auto mb-2"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">O Colaborador</p>
                            </div>
                        </div>

                        {/* Process Actions */}
                        <div className="border-t border-slate-200 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center px-2 print:hidden">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4 md:mb-0">Processado por Soft-Imatec</span>

                            <div className="flex flex-col md:flex-row items-center gap-5">
                                {processedEmployees[emp.id] ? (
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center gap-2 text-green-700 font-black text-base">
                                            <CheckCircle2 size={24} />
                                            <span>PROCESSADO</span>
                                        </div>
                                        <button
                                            onClick={() => window.print()}
                                            className="bg-black text-white px-6 py-2 rounded shadow-xl font-black uppercase text-xs hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            <Printer size={16} /> Imprimir
                                        </button>
                                        <button
                                            onClick={() => {
                                                setView('LIST');
                                                if (onToggleSidebarTheme) onToggleSidebarTheme(false);
                                            }}
                                            className="bg-white border-2 border-slate-800 text-slate-800 px-4 py-2 rounded shadow-md font-black uppercase text-xs hover:bg-slate-50 transition"
                                        >
                                            Sair
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            if (slipData && slipData.netTotal) {
                                                setProcessedEmployees(prev => ({ ...prev, [emp.id]: slipData.netTotal }));
                                                if (onProcessPayroll) onProcessPayroll([slipData]);
                                            }
                                        }}
                                        className="bg-[#a3e4be] hover:bg-[#8fd9ad] text-[#0f3d24] px-12 py-3 rounded-[6px] shadow-lg font-black uppercase text-sm tracking-[0.1em] transition-all duration-300 active:scale-95 border-b-4 border-[#76c295]"
                                    >
                                        Processar
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

                {/* Navigation Controls */}
                <div className="bg-white p-5 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[110] shrink-0 border-t border-slate-200 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle2 size={20} className="text-green-600" />
                        </div>
                        <span className="text-slate-700 font-black text-xs uppercase tracking-widest px-2">Finalização do Processo de Salário</span>
                    </div>
                    <button
                        onClick={() => {
                            setView('LIST');
                            if (onToggleSidebarTheme) onToggleSidebarTheme(false);
                        }}
                        className="px-8 py-2.5 rounded-full border-2 border-slate-300 text-slate-600 font-black uppercase text-xs hover:bg-slate-50 transition-all duration-200 active:scale-95 flex items-center gap-2"
                    >
                        <X size={16} /> Cancelar Operação
                    </button>
                </div>
            </div >
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-white relative">
            {view === 'ATTENDANCE' && <AttendanceMapModal />}
            {view === 'SLIP' && <SalarySlipView />}

            {/* Top Toolbar - New Request */}
            <div className="p-2 bg-white border-b border-gray-200 flex gap-2 items-center">
                <select
                    className="border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
                    value={selectedCashRegister}
                    onChange={e => setSelectedCashRegister(e.target.value)}
                >
                    <option value="">Selecionar Caixa</option>
                    {cashRegisters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select
                    className="border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-blue-500 min-w-[200px]"
                    value={selectedAction}
                    onChange={e => {
                        setSelectedAction(e.target.value);
                        // If immediate action is desireable without a separate button, call function here
                        // User asks "selecionar: ...". Often implies a dual step or a menu. 
                        // I will add a 'Go' button if needed, but select onChange is faster for 'modal' type actions
                        if (e.target.value === 'PROCESS_ATTENDANCE') {
                            // Trigger immediately if one employee selected?
                            // Or wait for specific button? 
                            // I'll keep it manual trigger via button unless it's a direct command
                        }
                    }}
                >
                    <option value="">Selecionar Ação...</option>
                    <option value="PROCESS_SALARY">Processar Salário</option>
                    <option value="PROCESS_ATTENDANCE">Processar Efetividade</option>
                    <option value="DELETE_SALARY">Apagar Salário</option>
                    <option value="DELETE_ATTENDANCE">Apagar Efetividade</option>
                    <option value="PRINT_RECEIPT">Imprimir Recibo</option>
                </select>

                <button
                    onClick={handleProcessAction}
                    disabled={!selectedAction}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold uppercase hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    Executar
                </button>
            </div>

            {/* Header */}
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
                                                if (onOpenProcessingModal) {
                                                    onOpenProcessingModal(emp.id);
                                                } else {
                                                    setAttendanceEmployeeId(emp.id);
                                                    setView('ATTENDANCE');
                                                }
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
        </div>
    );
};

export default ProcessSalary;
