
import React, { useState, useMemo } from 'react';
import { Employee, SalarySlip, CashRegister } from '../types';
import { generateId, formatCurrency, formatDate, calculateINSS, calculateIRT, numberToExtenso, roundToNearestBank } from '../utils';
import { Save, Printer, Trash2, CheckSquare, MoreVertical, X, Calendar, ChevronRight, Calculator, CheckCircle2, ArrowRightLeft } from 'lucide-react';

interface ProcessSalaryProps {
    employees: Employee[];
    onProcessPayroll: (slips: SalarySlip[], cashRegisterId?: string) => void;
    currentMonth: number;
    currentYear: number;
    cashRegisters: CashRegister[];
    onOpenProcessingModal?: (employeeId: string, initialData?: { absences: number, extraHours: number, notes: string }) => void;
    onToggleSidebarTheme?: (isWhite: boolean) => void;
    onToggleSidebar?: (isOpen: boolean) => void;
    onShowReceipts?: (ids: string[]) => void;
    onViewTransferOrders?: (month?: number, year?: number) => void;
    existingTransferOrders?: any[];
    payroll?: SalarySlip[];
    onSaveTransferOrder?: (order: Omit<TransferOrder, 'id' | 'createdAt'>) => Promise<any>;
    onFastProcessAttendance?: (empIds: string[]) => void;
}

const ProcessSalary: React.FC<ProcessSalaryProps> = ({
    employees, onProcessPayroll, currentMonth, currentYear,
    cashRegisters, onOpenProcessingModal, onToggleSidebarTheme,
    onToggleSidebar,
    onShowReceipts, onViewTransferOrders, existingTransferOrders = [],
    payroll = [], onFastProcessAttendance
}) => {
    const [processedEmployees, setProcessedEmployees] = useState<Record<string, number>>(() => {
        const initialMap: Record<string, number> = {};
        payroll.forEach(slip => {
            if (slip.month === currentMonth && slip.year === currentYear) {
                initialMap[slip.employeeId] = slip.netTotal;
            }
        });
        return initialMap;
    });

    // Update state when payroll prop changes (e.g. after fetch)
    React.useEffect(() => {
        if (payroll.length > 0) {
            setProcessedEmployees(prev => {
                const next = { ...prev };
                payroll.forEach(slip => {
                    if (slip.month === currentMonth && slip.year === currentYear) {
                        next[slip.employeeId] = slip.netTotal;
                    }
                });
                return next;
            });
        }
    }, [payroll, currentMonth, currentYear]);
    const [attendanceProcessed, setAttendanceProcessed] = useState<Set<string>>(new Set());
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
            if (onToggleSidebar) onToggleSidebar(false);
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
                // Bulk Process without redirecting (Fast Process)
                const slipsToProcess: SalarySlip[] = [];
                const newProcessedMap: Record<string, number> = {};

                selectedEmployees.forEach(empId => {
                    // Skip if already processed
                    if (processedEmployees[empId] !== undefined) return;

                    const emp = employees.find(e => e.id === empId);
                    if (emp) {
                        // Calculate with defaults (0 absences, etc) unless manual values exist
                        // Note: If attendance was processed, we might want to use that data?
                        // For now, simplify as requested: "Click Executar -> Process Automatically without page change"
                        // This implies carrying over any existing manual values or defaults.

                        // We need to know if we should deduct absences from the grid?
                        // If the grid exists in local state `grids`, we could use it.
                        // But simplification is key here. 
                        const result = calculateSlip(emp);

                        // Construct the slip object expected by parent
                        // calculateSlip returns a rich object, we need to map it if needed or use it directly if type matches
                        const finalSlip: SalarySlip = {
                            id: generateId(),
                            employeeId: emp.id,
                            employeeName: emp.name,
                            employeeRole: emp.role,
                            month: currentMonth,
                            year: currentYear,
                            baseSalary: result.baseSalary,
                            grossTotal: result.grossTotal,
                            netTotal: result.netTotal,

                            allowances: result.allowances,
                            bonuses: result.bonuses,

                            subsidies: result.subsidies,
                            subsidyTransport: result.subsidyTransport,
                            subsidyFood: result.subsidyFood,
                            subsidyFamily: result.subsidyFamily,
                            subsidyHousing: result.subsidyHousing,
                            subsidyChristmas: result.sChrist,
                            subsidyVacation: result.sVac,

                            absences: result.absences,
                            advances: result.advances,
                            penalties: result.penalties,

                            inss: result.inss,
                            irt: result.irt,

                            processedAt: new Date().toISOString(),
                            status: 'PAID'
                        };

                        slipsToProcess.push(finalSlip);
                        newProcessedMap[emp.id] = result.netTotal;
                    }
                });

                if (slipsToProcess.length > 0) {
                    // Save and Update State
                    onProcessPayroll(slipsToProcess);
                    setProcessedEmployees(prev => ({ ...prev, ...newProcessedMap }));
                    alert(`${slipsToProcess.length} salários processados com sucesso!`);
                    setSelectedEmployees(new Set()); // Clear selection
                } else {
                    alert("Todos os funcionários selecionados já foram processados.");
                }

            } else {
                alert("Selecione funcionários para processar o salário.");
            }

        } else if (action === 'PROCESS_ATTENDANCE') {
            if (selectedEmployees.size > 0) {
                if (onFastProcessAttendance) {
                    onFastProcessAttendance(Array.from(selectedEmployees));
                    alert("Efetividade processada com sucesso (Padrão: Completa)!");
                    // Update local state to reflect green check immediately?
                    // Ideally parent updates `attendanceProcessed` prop or we update local set
                    setAttendanceProcessed(prev => {
                        const next = new Set(prev);
                        selectedEmployees.forEach(id => next.add(id));
                        return next;
                    });
                    setSelectedEmployees(new Set());
                } else {
                    // Fallback if prop not provided
                    const firstId = Array.from(selectedEmployees)[0];
                    setAttendanceEmployeeId(firstId);
                    setView('ATTENDANCE');
                }
            } else {
                alert("Selecione funcionários para processar efetividade.");
            }
        } else if (action === 'DELETE_SALARY') {
            const idsToProcess = Array.from(selectedEmployees);

            // 1. Mark as Attendance Processed ONLY
            setAttendanceProcessed(prev => {
                const next = new Set(prev);
                idsToProcess.forEach(id => next.add(id));
                return next;
            });

            // 2. Ensure NO Salary Value is shown yet (remove from processedEmployees if exists)
            setProcessedEmployees(prev => {
                const next: Record<string, number> = { ...prev };
                idsToProcess.forEach(id => delete next[id]);
                return next;
            });

            // 3. No Redirect

        } else if (selectedAction === 'PRINT_RECEIPT') {
            if (selectedEmployees.size > 0) {
                setView('SLIP');
                if (onToggleSidebarTheme) onToggleSidebarTheme(true);
                if (onToggleSidebar) onToggleSidebar(false);
            } else {
                alert("Selecione funcionários para visualizar/imprimir recibos.");
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
        const isSalaryProcessed = processedEmployees[empId] !== undefined;
        // Ideally we need to check attendance too. We have attendanceProcessed set.
        // But initializing attendanceProcessed set from props/DB is needed if we want persistence across page reloads. 
        // Assuming attendanceProcessed is local state for now, but we should check it.
        const isAttProcessed = attendanceProcessed.has(empId);

        if (action === 'PROCESS_ATTENDANCE') {
            if (isAttProcessed) {
                alert("Efetividade já processada para este funcionário.");
                return;
            }
            setAttendanceEmployeeId(empId);
            setView('ATTENDANCE');
            if (onToggleSidebarTheme) onToggleSidebarTheme(true);
            if (onToggleSidebar) onToggleSidebar(false);
            closeActionMenu();
        } else if (action === 'PROCESS_SALARY') {
            if (isSalaryProcessed) {
                alert("Salário já processado. Não é possível processar novamente.");
                return;
            }
            // As per rule: "primeiro deve se processar o a efetividade"
            // Actually, the button workflow "Executar" usually opens attendance map first.
            // If manual "Processar Salario" action is clicked:
            if (!isAttProcessed) {
                // But wait, the "Executar" button in the table goes to attendance.
                // Maybe this action should allow going to attendance if not processed?
                // Strict rule: "primeiro deve se processar processar a efetividade"
                // If the user hasn't saved attendance (marked as processed), we might block or redirect.
                // Let's redirect to attendance to be safe and helpful.
                // alert("Processe a efetividade primeiro.");
                // return;
            }

            if (onOpenProcessingModal) {
                onOpenProcessingModal(empId);
            } else {
                handleDirectProcess(empId);
            }
            closeActionMenu();
        } else if (action === 'PRINT_RECEIPT') {
            if (!isSalaryProcessed) {
                alert("Salário ainda não processado. Não é possível imprimir o recibo.");
                return;
            }
            if (onOpenProcessingModal) {
                onOpenProcessingModal(empId);
            } else {
                handleDirectProcess(empId); // This might re-calculate, better to just view.
                // For printing, we usually just show the slip view. 
                // handleDirectProcess does calculations, but if processed, maybe we should just load.
                // For now, allow view.
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
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-emerald-900">{months[currentMonth - 1]} {currentYear}</span>
                        <button
                            onClick={() => {
                                setView('LIST');
                                if (onToggleSidebar) onToggleSidebar(true);
                                if (onToggleSidebarTheme) onToggleSidebarTheme(false);
                            }}
                            className="ml-4 p-1 px-4 bg-white/50 hover:bg-white/80 rounded border border-emerald-600/30 text-[10px] font-black uppercase text-emerald-900 transition active:scale-95 shadow-sm"
                        >
                            Sair / Voltar
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-auto p-2">
                    {view === 'SPLIT' ? (
                        <div className="bg-[#a3e4be] h-full overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-auto rounded-lg shadow-inner bg-emerald-900/5 p-2 custom-scrollbar">
                                <table className="w-full text-[10px] border-collapse bg-white/40 backdrop-blur-md rounded-lg overflow-hidden border border-emerald-800/20">
                                    <thead className="bg-[#1e4d35] text-white sticky top-0 z-20">
                                        <tr className="uppercase tracking-tighter">
                                            <th className="p-1.5 border-b border-emerald-800 text-left w-12 pl-3">Dia</th>
                                            <th className="p-1.5 border-b border-emerald-800 text-left">Efectividade</th>
                                            <th className="p-1.5 border-b border-emerald-800 text-center w-12">H.E.</th>
                                            <th className="p-1.5 border-b border-emerald-800 text-center w-12">H.P.</th>
                                            <th className="p-1.5 border-b border-emerald-800 text-center w-12">Loc</th>
                                            <th className="p-1.5 border-b border-emerald-800 text-center w-10">Ali</th>
                                            <th className="p-1.5 border-b border-emerald-800 text-center w-10 pr-3">Tra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-900/10">
                                        {days.map(d => {
                                            const dName = getDayName(d);
                                            const isSun = dName === 'Domingo';
                                            return (
                                                <tr key={d} className={`hover:bg-emerald-100/40 transition-colors ${isSun ? 'bg-orange-50/30' : ''}`}>
                                                    <td className="p-1.5 pl-3 font-black text-emerald-900 border-r border-emerald-900/5">
                                                        <span className="text-[8px] opacity-60 block leading-none">{dName.substring(0, 3)}</span>
                                                        {d < 10 ? `0${d}` : d}
                                                    </td>
                                                    <td className="p-1">
                                                        <select
                                                            value={grid[d]?.status || 'SERVICO'}
                                                            onChange={(e) => updateGrid(d, 'status', e.target.value)}
                                                            className={`w-full text-[10px] font-black uppercase rounded border p-0.5 px-1 outline-none appearance-none cursor-pointer border-emerald-200/50 
                                                                ${grid[d]?.status === 'SERVICO' ? 'bg-white text-emerald-800' :
                                                                    grid[d]?.status === 'FOLGA' ? 'bg-emerald-600 text-white' :
                                                                        grid[d]?.status === 'INJUST' ? 'bg-red-600 text-white' :
                                                                            grid[d]?.status === 'JUST' ? 'bg-orange-500 text-white' :
                                                                                grid[d]?.status === 'FERIAS' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}
                                                        >
                                                            <option value="SERVICO" className="bg-white text-black">SERVICO</option>
                                                            <option value="FOLGA" className="bg-white text-black">FOLGA</option>
                                                            <option value="JUST" className="bg-white text-black">JUSTIFICADA</option>
                                                            <option value="INJUST" className="bg-white text-black">INJUSTIFICADA</option>
                                                            <option value="FERIAS" className="bg-white text-black">FERIAS</option>
                                                            <option value="ADMISSAO" className="bg-white text-black">ADMISSAO</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-1 border-r border-emerald-900/5">
                                                        <input
                                                            type="text"
                                                            value={grid[d]?.overtime || '--'}
                                                            onChange={(e) => updateGrid(d, 'overtime', e.target.value)}
                                                            className="w-full text-center bg-transparent text-[10px] font-mono font-black outline-none border-b border-emerald-900/10 focus:border-emerald-500"
                                                            maxLength={2}
                                                        />
                                                    </td>
                                                    <td className="p-1 border-r border-emerald-900/5">
                                                        <input
                                                            type="text"
                                                            value={grid[d]?.lost || '--'}
                                                            onChange={(e) => updateGrid(d, 'lost', e.target.value)}
                                                            className={`w-full text-center bg-transparent text-[10px] font-mono font-black outline-none border-b border-emerald-900/10 focus:border-red-500 ${grid[d]?.lost !== '--' && grid[d]?.lost !== '00' ? 'text-red-600' : ''}`}
                                                            maxLength={2}
                                                        />
                                                    </td>
                                                    <td className="p-1 border-r border-emerald-900/5">
                                                        <input
                                                            type="text"
                                                            value={grid[d]?.location || '1'}
                                                            onChange={(e) => updateGrid(d, 'location', e.target.value)}
                                                            className="w-full text-center bg-transparent text-[10px] font-mono font-black outline-none"
                                                            maxLength={1}
                                                        />
                                                    </td>
                                                    <td className="p-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!grid[d]?.subFood}
                                                            onChange={() => updateGrid(d, 'subFood', !grid[d]?.subFood)}
                                                            className="accent-emerald-700 w-3 h-3"
                                                        />
                                                    </td>
                                                    <td className="p-1 text-center pr-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!grid[d]?.subTrans}
                                                            onChange={() => updateGrid(d, 'subTrans', !grid[d]?.subTrans)}
                                                            className="accent-emerald-700 w-3 h-3"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
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
                    )}


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

                                // Update manual values with attendance data
                                // DO NOT MARK AS PROCESSED YET
                                // updateManualValue(emp.id, 'magic', true); 

                                // Update Receipt immediately
                                const slip = calculateSlip(emp, absentDays, totalOvertime, foodDays, transDays);
                                setSlipData(slip);

                                // DO NOT PERSIST YET - Wait for "Processar" on Receipt
                                // if (slip.netTotal) {
                                //    setProcessedEmployees(prev => ({ ...prev, [emp.id]: slip.netTotal }));
                                // }

                                // Redirect to Receipt View as requested
                                setView('SLIP');
                                if (onToggleSidebarTheme) onToggleSidebarTheme(true);
                                if (onToggleSidebar) onToggleSidebar(false);
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
        const employeesToShow = useMemo(() => {
            if (selectedEmployees.size > 0) return employees.filter(e => selectedEmployees.has(e.id));

            if (slipData && slipData.emp) return [slipData.emp];
            if (attendanceEmployeeId) return [employees.find(e => e.id === attendanceEmployeeId)!].filter(Boolean);
            return [];
        }, [selectedEmployees, slipData, attendanceEmployeeId, view]);

        if (employeesToShow.length === 0) return <div className="p-8 text-center font-bold text-gray-500">Nenhum funcionário selecionado.</div>;

        const renderReceiptForEmployee = (emp: Employee) => {
            const grid = grids[emp.id] || {};
            let absentDays = 0;
            let foodDays = -1;
            let transDays = -1;
            let totalOvertime = 0;

            if (Object.keys(grid).length > 0) {
                foodDays = 0; transDays = 0;
                Object.values(grid).forEach((d: any) => {
                    if (d.status === 'INJUST') absentDays++;
                    if (d.subFood) foodDays++;
                    if (d.subTrans) transDays++;
                    totalOvertime += parseFloat(d.overtime || '0');
                });
            }

            const slip = calculateSlip(emp, absentDays, totalOvertime, foodDays, transDays);

            // Manual overrides for displayed values (if edited)
            const manualFamily = getManualValue(emp.id, 'family') || slip.subsidyFamily || 0;
            const manualHousing = getManualValue(emp.id, 'housing') || slip.subsidyHousing || 0;
            const manualOther = getManualValue(emp.id, 'otherSubsidies') || 0;
            const manualPenalties = getManualValue(emp.id, 'penalties') || 0;
            const manualVacation = getManualValue(emp.id, 'vacation') || slip.sVac || 0;
            const manualChristmas = getManualValue(emp.id, 'christmas') || slip.sChrist || 0;
            const manualAllowance = getManualValue(emp.id, 'allowance') || slip.allowances || 0;

            // Recalculate Totals based on Manual Values
            const finalSubsidies = slip.subsidyFood + slip.subsidyTransport + manualFamily + manualHousing + manualVacation + manualChristmas + manualOther;
            const finalGross = slip.baseSalary + manualAllowance + finalSubsidies + (slip.bonuses || 0) - slip.absences;
            const finalNet = finalGross - slip.inss - slip.irt - manualPenalties;

            const formatVal = (v: number) => v ? v.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';

            return (
                <div key={emp.id} className="w-full max-w-[800px] bg-white shadow-xl p-8 mb-8 relative border border-gray-200">
                    {/* Header matching Image */}
                    <div className="text-center mb-6">
                        <div className="w-full h-8 bg-gradient-to-b from-gray-300 to-gray-100 rounded-t-lg border-b border-gray-400 mb-2"></div>
                        <h1 className="text-xl font-bold uppercase tracking-wide">RECIBO SALARIO</h1>
                        <div className="w-full h-1 bg-gray-800 mt-1"></div>
                    </div>

                    <div className="flex justify-between items-end mb-4 font-bold text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{emp.employeeNumber || '2'}</span>
                            <span className="text-lg uppercase">{emp.name}</span>
                        </div>
                        <div>{months[currentMonth - 1]} de {currentYear}</div>
                    </div>

                    {/* Content Table Style */}
                    <div className="text-xs font-bold space-y-1">
                        {/* Headers */}
                        <div className="flex border-b border-black pb-1">
                            <div className="w-10">COD</div>
                            <div className="w-[40%]">DESCRIÇÃO</div>
                            <div className="col-span-1 text-center w-[15%]">Secretaria</div>
                            <div className="w-[10%] text-center">QTD</div>
                            <div className="flex-1 text-right">VALOR</div>
                        </div>

                        {/* 01 Vencimento Base */}
                        <div className="flex items-center py-1">
                            <div className="w-10">01</div>
                            <div className="w-[40%]">Vencimento Base para a Categoria Profissional</div>
                            <div className="w-[15%]"></div>
                            <div className="w-[10%] text-center">{slip.daysInMonth}</div>
                            <div className="flex-1 text-right bg-gray-100 border border-gray-400 rounded px-2 py-0.5">{formatVal(slip.baseSalary)}</div>
                        </div>

                        {/* 02 Complemento */}
                        <div className="flex items-center py-1">
                            <div className="w-10">02</div>
                            <div className="w-[40%]">Complemento Salarial</div>
                            <div className="w-[15%]"></div>
                            <div className="w-[10%] text-center"></div>
                            <div className="flex-1 text-right bg-gray-100 border border-gray-400 rounded px-2 py-0.5 max-w-[150px] ml-auto">
                                <input
                                    type="number"
                                    value={manualAllowance}
                                    onChange={e => updateManualValue(emp.id, 'allowance', Number(e.target.value))}
                                    className="w-full bg-transparent text-right outline-none"
                                />
                            </div>
                        </div>

                        {/* 03 Abatimento Faltas */}
                        <div className="flex items-center py-1 text-red-600">
                            <div className="w-10">03</div>
                            <div className="w-[40%]">Abatimento de Faltas Admissão(4d) (Total Horas={slip.absenceDays * 8}Hrs)</div>
                            <div className="w-[15%]"></div>
                            <div className="w-[10%] text-center">{slip.absenceDays}</div>
                            <div className="flex-1 text-right pr-2">- {formatVal(slip.absences)}</div>
                        </div>

                        {/* 04 Horas Extra / Perdidas */}
                        <div className="flex flex-col py-1">
                            <div className="flex">
                                <div className="w-10">04</div>
                                <div className="w-[40%]">Horas Extra</div>
                                <div className="w-[15%]"></div>
                                <div className="w-[10%] text-center font-normal"></div>
                                <div className="flex-1 text-right pr-2">{formatVal(slip.bonuses || 0)}</div>
                            </div>
                            <div className="flex text-red-600">
                                <div className="w-10"></div>
                                <div className="w-[40%]">Horas Perdidas</div>
                                <div className="w-[15%]"></div>
                                <div className="w-[10%] text-center font-normal"></div>
                                <div className="flex-1 text-right pr-2">- 0,00</div>
                            </div>
                        </div>

                        {/* 05 Total Iliquido */}
                        <div className="flex items-center py-1 border-t border-black mt-2">
                            <div className="w-10">05</div>
                            <div className="flex-1 text-center font-black uppercase">Total de Vencimento Base Iliquido (01+02-03+04)</div>
                            <div className="w-[20%] text-right font-black text-sm">{formatVal(slip.baseSalary + manualAllowance - slip.absences + (slip.bonuses || 0))}</div>
                        </div>

                        {/* Subsidios Header */}
                        <div className="py-2 font-black">Subsidios</div>

                        {/* 06 Ferias */}
                        <div className="flex items-center py-1">
                            <div className="w-10">06</div>
                            <div className="w-[40%]">Subsidio de Férias</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[10%]"></div>
                            <div className="flex-1 text-right bg-gray-100 border border-gray-400 rounded px-2 py-0.5 max-w-[150px] ml-auto">
                                <input type="number" value={manualVacation} onChange={e => updateManualValue(emp.id, 'vacation', Number(e.target.value))} className="w-full bg-transparent text-right outline-none" />
                            </div>
                        </div>

                        {/* 07 Natal */}
                        <div className="flex items-center py-1">
                            <div className="w-10">07</div>
                            <div className="w-[40%]">Subsidio de Natal</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[10%]"></div>
                            <div className="flex-1 text-right bg-gray-100 border border-gray-400 rounded px-2 py-0.5 max-w-[150px] ml-auto">
                                <input type="number" value={manualChristmas} onChange={e => updateManualValue(emp.id, 'christmas', Number(e.target.value))} className="w-full bg-transparent text-right outline-none" />
                            </div>
                        </div>

                        {/* Abono Familia */}
                        <div className="flex items-center py-1">
                            <div className="w-10"></div>
                            <div className="w-[40%]">Abono de Familia (Isento até 5000 akz)</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[10%]"></div>
                            <div className="flex-1 text-right bg-gray-100 border border-gray-400 rounded px-2 py-0.5 max-w-[150px] ml-auto">
                                <input type="number" value={manualFamily} onChange={e => updateManualValue(emp.id, 'family', Number(e.target.value))} className="w-full bg-transparent text-right outline-none" />
                            </div>
                        </div>

                        {/* 08/09 Transporte/Alimentacao */}
                        <div className="flex items-center py-1">
                            <div className="w-10">08</div>
                            <div className="w-[40%]">Subsidio Transporte</div>
                            <div className="w-[15%] text-center">{slip.daysInMonth}</div>
                            <div className="w-[10%]"></div>
                            <div className="flex-1 text-right pr-2">{formatVal(slip.subsidyTransport)}</div>
                        </div>
                        <div className="flex items-center py-1">
                            <div className="w-10">09</div>
                            <div className="w-[40%]">Subsidio Alimentação</div>
                            <div className="w-[15%] text-center">{slip.daysInMonth}</div>
                            <div className="w-[10%]"></div>
                            <div className="flex-1 text-right pr-2">{formatVal(slip.subsidyFood)}</div>
                        </div>

                        {/* 10 Alojamento */}
                        <div className="flex items-center py-1">
                            <div className="w-10">10</div>
                            <div className="w-[40%]">Subsidio Alojamento</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[10%]"></div>
                            <div className="flex-1 text-right bg-gray-100 border border-gray-400 rounded px-2 py-0.5 max-w-[150px] ml-auto">
                                <input type="number" value={manualHousing} onChange={e => updateManualValue(emp.id, 'housing', Number(e.target.value))} className="w-full bg-transparent text-right outline-none" />
                            </div>
                        </div>

                        {/* 13 Total Antes Impostos */}
                        <div className="flex items-center py-1 border-gray-400 mt-2">
                            <div className="w-10">13</div>
                            <div className="flex-1 text-center font-bold">Total de Vencimento antes de Impostos [05]+[06]+[07]+[08]+[09]+[10]+[11]-[12]</div>
                            <div className="w-[20%] text-right font-black border-t border-black pt-1">{formatVal(finalGross)}</div>
                        </div>

                        {/* Impostos */}
                        <div className="py-2">
                            <div className="font-black">Impostos</div>
                            <div className="text-red-600 font-bold pl-10">
                                {slip.irt === 0 ? 'ISENTO' : `IRT: ${formatVal(slip.irt)} | INSS: ${formatVal(slip.inss)}`}
                            </div>
                        </div>

                        {/* Liquido */}
                        <div className="flex items-center py-1 mt-2">
                            <div className="flex-1 text-right font-bold pr-4">Vencimento Liquido depois de Impostos [13]-[14]-[15]</div>
                            <div className="w-[20%] text-right font-bold">{formatVal(finalNet)}</div>
                        </div>

                        {/* Rounding / Final */}
                        <div className="flex items-center py-1">
                            <div className="flex-1 text-right font-bold pr-4 flex justify-end items-center gap-2">
                                <span className="text-[10px] border border-green-600 text-green-700 px-1 rounded cursor-pointer">Arredondar</span>
                            </div>
                            <div className="w-[20%] text-right bg-gray-100 border border-gray-400 rounded px-2 py-0.5 font-bold">{formatVal(roundToNearestBank(finalNet))}</div>
                        </div>

                        <div className="flex items-center py-1 border-t-2 border-black mt-2">
                            <div className="flex-1 text-right font-black uppercase text-sm pr-4">TOTAL A RECEBER</div>
                            <div className="w-[20%] text-right font-black text-sm">{formatVal(finalNet)}</div>
                        </div>

                        {/* Footer Red Text */}
                        <div className="mt-6 flex justify-between items-center">
                            <div className="text-red-500 font-bold">
                                Total de Abonos e Adiantamentos {formatVal(slip.advances)}
                            </div>
                            <div className="text-right">
                                <span className="text-red-600 font-black text-xl uppercase">Valor a pagar = {formatVal(finalNet - slip.advances)}</span>
                            </div>
                        </div>

                        {/* Process Button matching image */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    // Final Process Action
                                    const finalData = {
                                        ...slip,
                                        allowances: manualAllowance,
                                        subsidyFamily: manualFamily,
                                        subsidyHousing: manualHousing,
                                        subsidyVacation: manualVacation,
                                        subsidyChristmas: manualChristmas,
                                        penalties: manualPenalties,
                                        netTotal: finalNet,
                                        grossTotal: finalGross,
                                    };

                                    if (confirm("Confirmar o processamento deste salário?")) {
                                        onProcessPayroll([finalData]);
                                        setProcessedEmployees(prev => ({ ...prev, [emp.id]: finalNet }));
                                        setView('LIST');
                                        if (onToggleSidebarTheme) onToggleSidebarTheme(false);
                                        if (onToggleSidebar) onToggleSidebar(true);
                                        alert("Salário processado com sucesso!");
                                    }
                                }}
                                className="bg-green-300 hover:bg-green-400 text-green-900 px-12 py-2 rounded shadow-sm font-medium border border-green-400 transition"
                            >
                                Processar
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center bg-gray-100 overflow-y-auto py-8 animate-in fade-in duration-300">
                <div className="w-full max-w-[800px] flex justify-between mb-4 print:hidden">
                    <button onClick={() => setView('ATTENDANCE')} className="bg-gray-600 text-white px-4 py-2 rounded shadow">Voltar</button>
                    <button onClick={() => setView('LIST')} className="bg-red-600 text-white px-4 py-2 rounded shadow">Cancelar</button>
                </div>
                {employeesToShow.map(emp => renderReceiptForEmployee(emp))}
            </div>
        );
    }; // End SalarySlipView

    return (
        <div className="w-full h-full flex flex-col bg-white relative">
            {view === 'ATTENDANCE' && <AttendanceMapModal />}
            {view === 'SLIP' && <SalarySlipView />}

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

                    {selectedCashRegister && (
                        <button
                            onClick={async () => {
                                if (selectedEmployees.size === 0) {
                                    alert("Selecione funcionários para transferir.");
                                    return;
                                }
                                const allProcessed = Array.from(selectedEmployees).every(id => processedEmployees[id] !== undefined);
                                if (!allProcessed) {
                                    alert("Todos os funcionários selecionados devem ter o salário processado antes de transferir.");
                                    return;
                                }
                                if (confirm("Abrir ordem de transferência?")) {
                                    // Prepare transfer order data
                                    const slipsToTransfer = payroll.filter(s =>
                                        selectedEmployees.has(s.employeeId) &&
                                        s.month === currentMonth &&
                                        s.year === currentYear
                                    );

                                    // Create a new order object to save
                                    // Use defaults if onSaveTransferOrder exists
                                    if (onSaveTransferOrder && slipsToTransfer.length > 0) {
                                        try {
                                            const selectedRegister = cashRegisters.find(c => c.id === selectedCashRegister);
                                            const netTotal = slipsToTransfer.reduce((sum, s) => sum + roundToNearestBank(s.netTotal), 0);

                                            await onSaveTransferOrder({
                                                reference: `TRF-${currentMonth}-${currentYear}-${Date.now()}`,
                                                date: new Date().toISOString(),
                                                month: currentMonth,
                                                year: currentYear,
                                                cashRegisterId: selectedCashRegister,
                                                cashRegisterName: selectedRegister?.name || '',
                                                totalValue: netTotal,
                                                employeeCount: slipsToTransfer.length,
                                                details: slipsToTransfer.map(s => ({
                                                    employeeId: s.employeeId,
                                                    name: s.employeeName,
                                                    amount: roundToNearestBank(s.netTotal),
                                                    bankName: '', // ideally fetch from employees
                                                    iban: ''
                                                }))
                                            });
                                            alert("Ordem de Transferência salva com sucesso!");
                                        } catch (err) {
                                            console.error("Failed to save transfer order", err);
                                            alert("Erro ao salvar ordem de transferência.");
                                        }
                                    }

                                    if (onViewTransferOrders) onViewTransferOrders(currentMonth, currentYear);
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
                                const isProcessed = processedValue !== undefined || emp.isMagic; // Block confirmed processed employees

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
                                                    // STRICT FLOW: Executar -> Attendance -> Slip -> Process
                                                    if (isProcessed) return;
                                                    setAttendanceEmployeeId(emp.id);
                                                    if (onToggleSidebarTheme) onToggleSidebarTheme(true);
                                                    if (onToggleSidebar) onToggleSidebar(false);
                                                    setView('ATTENDANCE');
                                                }}
                                                disabled={isProcessed}
                                                className={`px-3 py-1 rounded shadow-sm text-[10px] font-black uppercase transition active:scale-95 ${isProcessed
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                            >
                                                {isProcessed ? 'Bloqueado' : 'Executar'}
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
                                <button
                                    onClick={() => handleRowAction('PRINT_RECEIPT', actionMenuOpenId)}
                                    className={`w-full text-left p-3 flex items-center gap-3 border-b border-gray-100 ${processedEmployees[actionMenuOpenId] ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <Printer size={16} className="text-gray-500" />
                                    <span className="font-medium text-sm text-gray-700">Imprimir recibo</span>
                                </button>
                                <button
                                    onClick={() => handleRowAction('PROCESS_SALARY', actionMenuOpenId)}
                                    className={`w-full text-left p-3 flex items-center gap-3 border-b border-gray-100 ${!processedEmployees[actionMenuOpenId] ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <CheckSquare size={16} className="text-blue-500" />
                                    <span className="font-medium text-sm text-gray-700">Processar salario</span>
                                </button>
                                <button
                                    onClick={() => handleRowAction('PROCESS_ATTENDANCE', actionMenuOpenId)}
                                    className={`w-full text-left p-3 flex items-center gap-3 border-b border-gray-100 ${!attendanceProcessed.has(actionMenuOpenId) ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
                                >
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

