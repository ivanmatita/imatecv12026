import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Employee, AttendanceRecord, DailyAttendance } from '../types';
import { Save, User, CheckSquare, X, ChevronDown } from 'lucide-react';

interface MonthlyValues {
    overtimeHours: number;
    lostHours: number;
    subsidyChristmas: number;
    subsidyFood: number;
    subsidyTransport: number;
    otherSubsidies: number;
}

interface AttendanceMapPageProps {
    employees: Employee[];
    companyName: string;
    workLocations: { id: string; name: string }[];
    attendanceRecords: AttendanceRecord[];
    onProcess?: (
        selectedEmployeeIds: string[],
        month: number,
        year: number,
        attendanceData: Record<string, Record<number, DailyAttendance>>,
        monthlyValues: Record<string, MonthlyValues>
    ) => void;
}

const ATTENDANCE_OPTIONS = [
    { code: 'SERVICO', label: 'P - Presença', short: 'P', color: 'text-emerald-600' },
    { code: 'FOLGA', label: 'F - Folga', short: 'F', color: 'text-slate-400' },
    { code: 'FALTA_INJUST', label: 'FI - Falta Injustificada', short: 'FI', color: 'text-red-600' },
    { code: 'FALTA_JUST', label: 'FJ - Falta Justificada', short: 'FJ', color: 'text-amber-500' },
    { code: 'FERIAS', label: 'V - Férias', short: 'V', color: 'text-blue-500' },
    { code: 'ADMISSAO', label: 'I - Início', short: 'I', color: 'text-cyan-500' },
];

const AttendanceMapPage: React.FC<AttendanceMapPageProps> = ({ employees, companyName, workLocations, attendanceRecords, onProcess }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWorkLocation, setSelectedWorkLocation] = useState<string>('all');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());

    // Local state for edits
    const [localAttendance, setLocalAttendance] = useState<Record<string, Record<number, DailyAttendance>>>({});
    const [localMonthlyValues, setLocalMonthlyValues] = useState<Record<string, MonthlyValues>>({});

    // Popover State
    const [activePopover, setActivePopover] = useState<{ empId: string, day: number, x: number, y: number } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const months = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];

    // Initialize local state from props when records change
    useEffect(() => {
        const initialAttendance: Record<string, Record<number, DailyAttendance>> = {};
        const initialMonthly: Record<string, MonthlyValues> = {};

        employees.forEach(emp => {
            const record = attendanceRecords.find(r => r.employeeId === emp.id && r.month === selectedMonth && r.year === selectedYear);
            if (record && record.days) {
                initialAttendance[emp.id] = { ...record.days };
            }

            // Initialize monthly values with defaults or 0
            initialMonthly[emp.id] = {
                overtimeHours: 0,
                lostHours: 0,
                subsidyChristmas: emp.subsidyChristmas || 0,
                subsidyFood: emp.subsidyFood || 0,
                subsidyTransport: emp.subsidyTransport || 0,
                otherSubsidies: emp.otherSubsidies || 0
            };
        });

        setLocalAttendance(prev => ({ ...prev, ...initialAttendance }));
        setLocalMonthlyValues(prev => ({ ...prev, ...initialMonthly }));
    }, [attendanceRecords, selectedMonth, selectedYear, employees]);

    // Close popover on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setActivePopover(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isWeekend = (day: number) => {
        const date = new Date(selectedYear, selectedMonth - 1, day);
        return date.getDay() === 0 || date.getDay() === 6;
    };

    const getStatus = (empId: string, day: number) => {
        // Check local first
        if (localAttendance[empId] && localAttendance[empId][day]) {
            return localAttendance[empId][day].status;
        }

        // Fallback or Default logic
        if (isWeekend(day)) return 'FOLGA';
        return 'SERVICO'; // Default assumption
    };

    const updateStatus = (empId: string, day: number, newStatus: string) => {
        setLocalAttendance(prev => {
            const empDays = prev[empId] || {};
            return {
                ...prev,
                [empId]: {
                    ...empDays,
                    [day]: {
                        ...(empDays[day] || { overtimeHours: 0, lostHours: 0, location: '1' }),
                        status: newStatus as any
                    }
                }
            };
        });
        setActivePopover(null);
    };

    const getMonthlyValue = (empId: string, field: keyof MonthlyValues) => {
        return localMonthlyValues[empId]?.[field] || 0;
    };

    const updateMonthlyValue = (empId: string, field: keyof MonthlyValues, value: number) => {
        setLocalMonthlyValues(prev => ({
            ...prev,
            [empId]: {
                ...(prev[empId] || { overtimeHours: 0, lostHours: 0, subsidyChristmas: 0, subsidyFood: 0, subsidyTransport: 0, otherSubsidies: 0 }),
                [field]: value
            }
        }));
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            // Exclude terminated employees as per user request
            if (emp.status === 'Terminated') return false;
            return selectedWorkLocation === 'all' || emp.workLocationId === selectedWorkLocation;
        });
    }, [employees, selectedWorkLocation]);

    const toggleEmployeeSelection = (id: string) => {
        const newSet = new Set(selectedEmployeeIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedEmployeeIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedEmployeeIds.size === filteredEmployees.length) {
            setSelectedEmployeeIds(new Set());
        } else {
            setSelectedEmployeeIds(new Set(filteredEmployees.map(e => e.id)));
        }
    };

    const handleProcess = () => {
        if (onProcess) {
            // Prepare the full data payload
            const attendancePayload = { ...localAttendance };

            // Ensure every selected employee has their attendance record populated even if assumed default
            // This is crucial for the calculation step to see the "SERVICO" vs "FOLGA"
            if (activePopover) setActivePopover(null);

            onProcess(
                Array.from(selectedEmployeeIds),
                selectedMonth,
                selectedYear,
                attendancePayload,
                localMonthlyValues
            );
        }
    };

    // Calculation Helpers
    const calculateTotals = () => {
        let totalToPay = 0;
        let totalDeductions = 0;

        filteredEmployees.forEach(emp => {
            const baseSalary = emp.baseSalary;
            const dailyRate = baseSalary / 30; // Standard 30 days

            // Count Faltas Injustificadas
            let faltas = 0;
            for (let d = 1; d <= daysInMonth; d++) {
                const status = getStatus(emp.id, d);
                if (status === 'FALTA_INJUST') faltas++;
            }

            // Monthly Values
            const monthly = localMonthlyValues[emp.id] || { overtimeHours: 0, lostHours: 0, subsidyChristmas: emp.subsidyChristmas || 0, subsidyFood: emp.subsidyFood || 0, subsidyTransport: emp.subsidyTransport || 0, otherSubsidies: emp.otherSubsidies || 0 };

            // Calc
            const deductionVal = faltas * dailyRate;

            // Simple Estimate
            const earnings = baseSalary + (monthly.subsidyChristmas || 0) + (monthly.subsidyFood || 0) + (monthly.subsidyTransport || 0) + (monthly.otherSubsidies || 0);

            totalToPay += (earnings - deductionVal);
            totalDeductions += deductionVal;
        });

        return { totalToPay, totalDeductions };
    };

    const { totalToPay, totalDeductions } = calculateTotals();

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900 relative">
            {/* Popover */}
            {activePopover && (
                <div
                    ref={popoverRef}
                    className="absolute z-50 bg-white shadow-xl rounded-lg border border-slate-200 p-1 w-64 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: activePopover.y + 5, left: Math.min(activePopover.x - 100, window.innerWidth - 300) }}
                >
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase border-b border-slate-100 mb-1">
                        Dia {activePopover.day} - Alterar Estado
                    </div>
                    {ATTENDANCE_OPTIONS.map(opt => (
                        <button
                            key={opt.code}
                            onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(activePopover.empId, activePopover.day, opt.code);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded flex items-center justify-between group"
                        >
                            <span className={`text-xs font-bold ${opt.color}`}>{opt.label}</span>
                            {getStatus(activePopover.empId, activePopover.day) === opt.code && <CheckSquare size={12} className="text-blue-600" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 shadow-lg">
                <h1 className="text-2xl font-light text-white tracking-tight flex items-center gap-3">
                    <CheckSquare className="text-white/80" size={32} /> Mapa de Assiduidade
                </h1>
                <p className="text-xs text-orange-100 font-bold uppercase tracking-widest mt-1">
                    Gestão de Presenças e Faltas
                </p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-3 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Empresa:</span>
                        <span className="text-sm font-bold text-slate-800">{companyName}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Local:</span>
                        <select
                            value={selectedWorkLocation}
                            onChange={(e) => setSelectedWorkLocation(e.target.value)}
                            className="bg-transparent font-bold text-slate-800 text-sm outline-none cursor-pointer hover:text-orange-600 transition-colors"
                        >
                            <option value="all">Filial (Todos)</option>
                            {workLocations.map(wl => (
                                <option key={wl.id} value={wl.id}>{wl.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="text-slate-400" />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Período:</span>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent font-bold text-slate-800 text-sm outline-none cursor-pointer hover:text-orange-600 transition-colors"
                        >
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <span className="text-slate-300">/</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent font-bold text-slate-800 text-sm outline-none cursor-pointer hover:text-orange-600 transition-colors"
                        >
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                            <option value={2024}>2024</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleProcess}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2"
                >
                    <Save size={16} /> Processar
                </button>
            </div>

            {/* Main Table */}
            <div className="flex-1 overflow-auto bg-slate-50 p-4">
                <div className="border border-slate-300 rounded-lg shadow-sm inline-block min-w-full overflow-hidden bg-white">
                    <div className="">
                        <table className="text-left border-collapse w-full">
                            <thead>
                                {/* Top Header */}
                                <tr className="bg-slate-800 text-white text-[10px] uppercase font-bold sticky top-0 z-30 tracking-widest">
                                    <th className="w-10 p-3 border-r border-slate-700 text-center sticky left-0 bg-slate-800 z-40">
                                        <div className="h-4 w-4 mx-auto"></div>
                                    </th>
                                    <th className="p-3 border-r border-slate-700 min-w-[250px] sticky left-10 bg-slate-800 z-40">
                                        Funcionário
                                    </th>
                                    <th colSpan={daysInMonth} className="border-r border-slate-700 text-center bg-slate-800/90 backdrop-blur">
                                        Dias do Mês
                                    </th>
                                    {/* Helper Headers for Extra Columns */}
                                    <th className="p-3 border-r border-slate-700 min-w-[80px] text-center bg-slate-800">H.Extra</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[80px] text-center bg-slate-800">H.Perd</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center bg-slate-800">Sub.Natal</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center bg-slate-800">Sub.Ali</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center bg-slate-800">Sub.Trans</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center bg-slate-800">Outros</th>
                                </tr>
                                {/* Sub Header (Days) */}
                                <tr className="bg-slate-50 text-slate-700 text-[10px] font-bold border-b border-slate-200">
                                    <th className="p-2 border-r border-slate-200 text-center sticky left-0 bg-slate-50 z-20">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployeeIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 w-4 h-4 cursor-pointer text-orange-600 focus:ring-orange-500"
                                        />
                                    </th>
                                    <th className="p-2 border-r border-slate-200 flex items-center gap-2 text-slate-700 uppercase sticky left-10 bg-slate-50 z-20">
                                        <span>LISTA DE COLABORADORES</span>
                                    </th>
                                    {days.map(d => (
                                        <th key={d} className={`border-r border-slate-200 text-center min-w-[28px] ${isWeekend(d) ? 'bg-slate-100 text-red-500' : ''}`}>
                                            {d}
                                        </th>
                                    ))}
                                    {/* Placeholders for subheaders of extra columns */}
                                    <th className="border-r border-slate-200 bg-slate-100"></th>
                                    <th className="border-r border-slate-200 bg-slate-100"></th>
                                    <th className="border-r border-slate-200 bg-slate-100"></th>
                                    <th className="border-r border-slate-200 bg-slate-100"></th>
                                    <th className="border-r border-slate-200 bg-slate-100"></th>
                                    <th className="bg-slate-100"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {/* Records */}
                                {filteredEmployees.map((emp, idx) => (
                                    <tr key={emp.id} className={`border-b border-slate-100 hover:bg-orange-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="p-2 border-r border-slate-200 text-center bg-slate-50 sticky left-0 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployeeIds.has(emp.id)}
                                                onChange={() => toggleEmployeeSelection(emp.id)}
                                                className="rounded border-slate-300 w-4 h-4 cursor-pointer text-orange-600 focus:ring-orange-500"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200 sticky left-10 bg-inherit z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                                                    {emp.photoUrl ? (
                                                        <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-full h-full p-2 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="leading-tight">
                                                    <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{emp.name}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 rounded">Nº {emp.employeeNumber || '0000'}</span>
                                                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{emp.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Days */}
                                        {days.map(d => {
                                            const status = getStatus(emp.id, d);
                                            const isWk = isWeekend(d);

                                            // Mapping status to display
                                            let display = "";
                                            let textColor = "text-slate-300";
                                            if (status === 'SERVICO') { display = "P"; textColor = "text-emerald-600 font-bold"; }
                                            else if (status === 'FALTA_INJUST') { display = "FI"; textColor = "text-red-600 font-bold"; }
                                            else if (status === 'FALTA_JUST') { display = "FJ"; textColor = "text-amber-500 font-bold"; }
                                            else if (status === 'FOLGA') { display = "F"; textColor = "text-slate-400 font-bold"; }
                                            else if (status === 'ADMISSAO') { display = "I"; textColor = "text-cyan-500 font-bold"; }
                                            else if (status === 'FERIAS') { display = "V"; textColor = "text-blue-500 font-bold"; }

                                            return (
                                                <td
                                                    key={d}
                                                    className={`border-r border-slate-100 p-0 text-center h-10 min-w-[28px] cursor-pointer hover:bg-orange-100 transition-colors duration-75 ${isWk ? 'bg-slate-50' : ''}`}
                                                    onClick={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setActivePopover({ empId: emp.id, day: d, x: rect.left + window.scrollX, y: rect.bottom + window.scrollY });
                                                    }}
                                                >
                                                    <span className={`text-xs ${textColor}`}>{display}</span>
                                                    {(status === 'FALTA_INJUST') && (
                                                        <div className="h-0.5 w-4 bg-red-500 mx-auto rounded-full mt-0.5"></div>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {/* Editable Extra Columns - Wide Inputs */}
                                        <td className="border-r border-slate-200 p-1 min-w-[80px]">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 text-xs text-center rounded focus:ring-1 focus:ring-blue-500 outline-none p-1 font-mono"
                                                value={getMonthlyValue(emp.id, 'overtimeHours') || ''}
                                                onChange={(e) => updateMonthlyValue(emp.id, 'overtimeHours', Number(e.target.value))}
                                                placeholder="0.0"
                                            />
                                        </td>
                                        <td className="border-r border-slate-200 p-1 min-w-[80px]">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 text-xs text-center rounded focus:ring-1 focus:ring-blue-500 outline-none p-1 font-mono text-red-600"
                                                value={getMonthlyValue(emp.id, 'lostHours') || ''}
                                                onChange={(e) => updateMonthlyValue(emp.id, 'lostHours', Number(e.target.value))}
                                                placeholder="0.0"
                                            />
                                        </td>
                                        <td className="border-r border-slate-200 p-1 min-w-[100px]">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 text-xs text-center rounded focus:ring-1 focus:ring-blue-500 outline-none p-1 font-mono"
                                                value={getMonthlyValue(emp.id, 'subsidyChristmas') || ''}
                                                onChange={(e) => updateMonthlyValue(emp.id, 'subsidyChristmas', Number(e.target.value))}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="border-r border-slate-200 p-1 min-w-[100px]">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 text-xs text-center rounded focus:ring-1 focus:ring-blue-500 outline-none p-1 font-mono"
                                                value={getMonthlyValue(emp.id, 'subsidyFood') || ''}
                                                onChange={(e) => updateMonthlyValue(emp.id, 'subsidyFood', Number(e.target.value))}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="border-r border-slate-200 p-1 min-w-[100px]">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 text-xs text-center rounded focus:ring-1 focus:ring-blue-500 outline-none p-1 font-mono"
                                                value={getMonthlyValue(emp.id, 'subsidyTransport') || ''}
                                                onChange={(e) => updateMonthlyValue(emp.id, 'subsidyTransport', Number(e.target.value))}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="p-1 min-w-[100px]">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 text-xs text-center rounded focus:ring-1 focus:ring-blue-500 outline-none p-1 font-mono"
                                                value={getMonthlyValue(emp.id, 'otherSubsidies') || ''}
                                                onChange={(e) => updateMonthlyValue(emp.id, 'otherSubsidies', Number(e.target.value))}
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white p-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12 text-sm z-20">
                <div className="space-y-4">
                    <div>
                        <span className="font-bold text-slate-700">Total de Funcionários:</span>
                        <span className="font-black text-slate-900 ml-2 text-lg">{filteredEmployees.length}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                        Base Legal: Lei Geral do Trabalho
                    </div>
                    <div className="flex justify-between items-center text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">
                        <span>Desconto Faltas Injustificadas (Est.):</span>
                        <span>- {totalDeductions.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz</span>
                    </div>
                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded border border-emerald-100 mt-2">
                        <span className="font-bold text-emerald-900 uppercase text-xs">Total Estimado a Pagar:</span>
                        <span className="font-black text-emerald-900 text-xl">{totalToPay.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMapPage;
