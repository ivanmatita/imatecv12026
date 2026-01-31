
import React, { useState, useMemo } from 'react';
import { Employee, SalarySlip, CashRegister } from '../types';
import { formatCurrency, formatDate, calculateINSS, calculateIRT, numberToExtenso } from '../utils';
import { Save, Printer, Trash2, CheckSquare, MoreVertical, X, Calendar, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';

interface ProcessSalaryProps {
    employees: Employee[];
    onProcessPayroll: (slips: SalarySlip[]) => void;
    currentMonth: number;
    currentYear: number;
    cashRegisters: CashRegister[]; // Added prop
}

const ProcessSalary: React.FC<ProcessSalaryProps> = ({ employees, onProcessPayroll, currentMonth, currentYear, cashRegisters }) => {
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

    const handleProcessAction = () => {
        if (!selectedAction) return;

        if (selectedAction === 'PROCESS_ATTENDANCE' || selectedAction === 'PROCESS_SALARY') {
            if (selectedEmployees.size === 1) {
                setAttendanceEmployeeId(Array.from(selectedEmployees)[0]);
                setView('ATTENDANCE');
            } else if (selectedEmployees.size > 1) {
                alert("Por favor, selecione apenas um funcionário por vez.");
            } else {
                alert("Selecione um funcionário na lista.");
            }
        } else {
            console.log("Action:", selectedAction);
        }
    };

    // Direct action from dropdown menu on row
    const handleRowAction = (action: string, empId: string) => {
        if (action === 'PROCESS_ATTENDANCE') {
            setAttendanceEmployeeId(empId);
            setView('ATTENDANCE');
            closeActionMenu();
        }
        // Handle other actions...
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
                                Object.values(grid).forEach(d => {
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
            baseSalary,
            subsidyFood,
            subsidyTransport,
            subsidyFamily,
            subsidyHousing,
            sChrist,
            sVac,
            allowances, // Complemento Salarial
            absences,
            inss,
            irt,
            grossTotal,
            netTotal,
            month,
            year
        } = slipData;

        // Ensure we have numbers
        const safeBase = baseSalary || 0;
        const safeAllowances = allowances || 0;
        const safeAbsences = absences || 0;
        const safeSubVac = sVac || 0;
        const safeSubChrist = sChrist || 0;
        const safeSubTrans = subsidyTransport || 0;
        const safeSubFood = slipData.subsidyFood || 0; // Use slipData.subsidyFood as it's passed directly
        const safeSubFam = subsidyFamily || 0;
        const safeSubHouse = subsidyHousing || 0;

        // Derived calculations matching the image logic
        // 05 Total Iliquido (01+02-03+04)
        // Note: absences in slipData is the money amount deducted? Or days?
        // In ProcessSalary logic: const absenceDeduction = (base / 30) * absentDays; slip.absences = absenceDeduction.
        // So slipData.absences is a VALUE. 
        // We need days for the display "Abatimento de Faltas (Xd)".
        // We can reverse calc or pass it. 
        // Looking at ProcessSalary logic: 
        // let absentDays = 0; ... if (d.status === 'INJUST') absentDays++;
        // We didn't pass 'absentDays' to slip object explicitly in setSlipData except implied in calculation.
        // Let's assume we can get it or default to calculation (absences / (base/30)).
        const calculatedAbsentDays = safeBase > 0 ? Math.round(safeAbsences / (safeBase / 30)) : 0;
        const totalIliquido = safeBase + safeAllowances - safeAbsences; // Assuming 04 Overtime is 0 for now as it wasn't in slipData explicity

        // 13 Total Vencimento antes de Impostos
        // [05]+[06]+[07]+[08]+[09]+[10]+[11]-[12]
        // 05 (Iliquido) + Subs
        const totalSubs = safeSubVac + safeSubChrist + safeSubFam + safeSubTrans + safeSubFood + safeSubHouse;
        const totalBeforeTax = totalIliquido + totalSubs;

        return (
            <div className="fixed inset-0 z-[100] bg-slate-800/95 backdrop-blur-sm flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center bg-slate-100">

                    {/* RECEIPT DESIGN MATCHING IMAGE */}
                    <div id="receipt-print-area" className="bg-white shadow-lg p-0 w-[210mm] min-h-[148mm] max-w-full print:shadow-none print:w-full font-Arial">
                        <div id="receipt-content" className="p-8 md:p-12 relative">

                            {/* Header Gradient Bar */}
                            <div className="w-full h-8 bg-gradient-to-b from-slate-300 to-white border-b border-slate-400 mb-6 flex items-center justify-center">
                                <h1 className="font-bold text-center text-black uppercase tracking-wider">RECIBO SALARIO</h1>
                            </div>

                            {/* Employee & Date Header */}
                            <div className="flex justify-between items-end mb-2 border-b-2 border-black pb-1">
                                <div className="flex items-end gap-2">
                                    <span className="text-xl font-bold">{emp.employeeNumber || '0001'}</span>
                                    <span className="text-xl font-bold uppercase">{emp.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold">{months[month - 1]} de {year}</span>
                                </div>
                            </div>

                            {/* Profession Centered */}
                            <div className="flex justify-center mb-4">
                                <span className="font-bold">{emp.professionName || emp.role || 'Geral'}</span>
                            </div>

                            {/* Main Content Grid */}
                            <div className="space-y-1 text-sm font-medium text-black">

                                {/* 01 Vencimento Base */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">01</span>
                                    <span className="flex-1">Vencimento Base para a Categoria Profissional</span>
                                    <span className="w-16 text-center">30</span>
                                    <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                        {formatCurrency(safeBase).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* 02 Complemento */}
                                {safeAllowances > 0 && (
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600">02</span>
                                        <span className="flex-1">Complemento Salarial</span>
                                        <span className="w-16 text-center"></span>
                                        <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                            {formatCurrency(safeAllowances).replace('Kz', '').trim()}
                                        </div>
                                    </div>
                                )}

                                {/* 03 Faltas */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">03</span>
                                    <span className="flex-1">Abatimento de Faltas ({calculatedAbsentDays}d) (Total Horas={calculatedAbsentDays * 8}Hrs)</span>
                                    <span className="w-16 text-center">{calculatedAbsentDays}</span>
                                    <div className="w-48 text-right pr-3">
                                        {safeAbsences > 0 ? `-${formatCurrency(safeAbsences).replace('Kz', '').trim()}` : '0,00'}
                                    </div>
                                </div>

                                {/* 04 Horas Extra */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">04</span>
                                    <span className="flex-1">Horas Extra</span>
                                    <span className="w-16 text-center"></span>
                                    <div className="w-48 text-right pr-3">0,00</div>
                                </div>

                                {/* Horas Perdidas */}
                                <div className="flex items-center">
                                    <span className="w-8"></span>
                                    <span className="flex-1 pl-0">Horas Perdidas</span>
                                    <span className="w-16 text-center"></span>
                                    <div className="w-48 text-right pr-3">- 0,00</div>
                                </div>

                                {/* 05 Total Iliquido */}
                                <div className="flex items-center mt-2 border-t border-black pt-1 mb-4">
                                    <span className="w-8 text-slate-600">05</span>
                                    <span className="flex-1 text-center font-bold">Total de Vencimento Base Iliquido (01+02-03+04)</span>
                                    <span className="w-16 text-center"></span>
                                    <div className="w-48 text-right font-bold pr-3">
                                        {formatCurrency(totalIliquido).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* Subsidios Header */}
                                <div className="flex items-center">
                                    <span className="w-8"></span>
                                    <span className="font-bold">Subsidios</span>
                                </div>

                                {/* 06 Subsidio Ferias */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">06</span>
                                    <span className="flex-1">Subsidio de Férias</span>
                                    <span className="w-16 text-center text-xs">Vg</span>
                                    <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                        {formatCurrency(safeSubVac).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* 07 Subsidio Natal */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">07</span>
                                    <span className="flex-1">Subsidio de Natal</span>
                                    <span className="w-16 text-center text-xs">Vg</span>
                                    <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                        {formatCurrency(safeSubChrist).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* Abono Familia */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600"></span>
                                    <span className="flex-1">Abono de Familia (Isento até 5000 akz)</span>
                                    <span className="w-16 text-center text-xs">Vg</span>
                                    <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                        {formatCurrency(safeSubFam).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* 08 Transporte */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">08</span>
                                    <span className="flex-1">Subsidio Transporte</span>
                                    <span className="w-16 text-center">0</span>
                                    <div className="w-48 text-right pr-3">
                                        {formatCurrency(safeSubTrans).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* 09 Alimentação */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">09</span>
                                    <span className="flex-1">Subsidio Alimentação</span>
                                    <span className="w-16 text-center">0</span>
                                    <div className="w-48 text-right pr-3">
                                        {formatCurrency(safeSubFood).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* 10 Alojamento */}
                                <div className="flex items-center">
                                    <span className="w-8 text-slate-600">10</span>
                                    <span className="flex-1">Subsidio Alojamento</span>
                                    <span className="w-16 text-center text-xs">Vg</span>
                                    <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                        {formatCurrency(safeSubHouse).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* 13 Total Antes Impostos */}
                                <div className="flex items-center mt-2 border-t border-black pt-1 mb-4">
                                    <span className="w-8 text-slate-600">13</span>
                                    <span className="flex-1 text-center font-bold text-xs mt-1">Total de Vencimento antes de Impostos [05]+[06]+[07]+[08]+[09]+[10]+[11]-[12]</span>
                                    <span className="w-16 text-center"></span>
                                    <div className="w-48 text-right font-bold pr-3">
                                        {formatCurrency(totalBeforeTax).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* Impostos */}
                                <div className="flex items-start">
                                    <span className="w-8"></span>
                                    <div className="flex-1">
                                        <span className="font-bold block">Impostos</span>
                                        {irt === 0 && inss === 0 ? (
                                            <span className="font-bold text-red-600 ml-4">ISENTO</span>
                                        ) : (
                                            <div className="ml-4 text-xs">
                                                {irt > 0 && <div className="text-red-600 font-bold">IRT: {formatCurrency(irt)}</div>}
                                                {inss > 0 && <div className="text-red-600 font-bold">INSS: {formatCurrency(inss)}</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Vencimento Liquido Calc */}
                                <div className="flex items-center mt-6">
                                    <span className="flex-1 text-center font-medium">Vencimento Liquido depois de Impostos [13]-[14]-[15]</span>
                                    <div className="w-48 text-right font-bold pr-3">
                                        {formatCurrency(netTotal).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* Arredondar Box */}
                                <div className="flex justify-end items-center mt-1">
                                    <div className="text-[10px] border border-green-600 text-green-700 font-bold px-1 mr-2 rounded-sm cursor-help" title="Arredondamento automático">Arredondar</div>
                                    <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6 font-bold">
                                        {formatCurrency(Math.floor(netTotal)).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* TOTAL A RECEBER */}
                                <div className="flex justify-end items-center mt-1 border-t-2 border-black pt-1">
                                    <span className="font-bold mr-4">TOTAL A RECEBER</span>
                                    <div className="w-48 text-right font-bold pr-3">
                                        {formatCurrency(netTotal).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* Abonos e Adiantamentos (Red) */}
                                <div className="mt-4 font-bold text-red-600 text-sm">
                                    Total de Abonos e Adiantamentos 0,00
                                </div>

                                {/* Valor a pagar Grande */}
                                <div className="mt-6 flex justify-center items-center gap-4">
                                    <div className="text-xl font-bold text-red-600">
                                        Valor a pagar = {formatCurrency(netTotal).replace('Kz', '').trim()}
                                    </div>

                                    {/* Processar Button - Actual Action */}
                                    <button
                                        onClick={async () => {
                                            // Finalize Process
                                            if (slipData && slipData.netTotal) {
                                                setProcessedEmployees(prev => ({ ...prev, [emp.id]: slipData.netTotal }));
                                                if (onProcessPayroll) onProcessPayroll([slipData]);
                                                alert("Salário Processado e Arquivado com Sucesso!");
                                                setView('LIST');
                                            }
                                        }}
                                        className="bg-green-300 bg-opacity-75 border border-green-400 text-green-900 px-8 py-1 rounded shadow-sm font-medium hover:bg-green-400 transition"
                                    >
                                        Processar
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls for Modal */}
                <div className="bg-white p-4 flex justify-between items-center shadow-lg z-20 shrink-0">
                    <div className="text-slate-600 font-bold text-xs uppercase flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" /> Pré-visualização de Recibo
                    </div>
                    <button onClick={() => setView('ATTENDANCE')} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold uppercase text-xs hover:bg-slate-50 transition">Voltar</button>
                </div>
            </div>
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
                                                setAttendanceEmployeeId(emp.id);
                                                setView('ATTENDANCE');
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
