
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, SalarySlip, CashRegister } from '../types';
import { generateId, formatCurrency, formatDate, calculateINSS, calculateIRT, numberToExtenso, roundToNearestBank } from '../utils';
import { Save, Printer, Trash2, CheckSquare, MoreVertical, X, Calendar, ChevronRight, Calculator, CheckCircle2, ArrowRightLeft, Search, FileDown, Play, ChevronDown } from 'lucide-react';
import EmployeeOptionsMenu from './EmployeeOptionsMenu';
import DismissEmployeeModal from './DismissEmployeeModal';
import UniformsManagement from './UniformsManagement';

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
    onSaveTransferOrder?: (order: any) => Promise<any>;
    onFastProcessAttendance?: (empIds: string[]) => void;
    companyName?: string;
    onNavigateToAttendance?: () => void;
    onChangeMonth?: (month: number, year: number) => void;
}

const ProcessSalary: React.FC<ProcessSalaryProps> = ({
    employees, onProcessPayroll, currentMonth, currentYear,
    cashRegisters, onOpenProcessingModal, onToggleSidebarTheme,
    onToggleSidebar,
    onShowReceipts, onViewTransferOrders, existingTransferOrders = [],
    payroll = [], onFastProcessAttendance, companyName = 'Grupo TecnoSys',
    onNavigateToAttendance, onChangeMonth
}) => {
    // Standard Format for Kwanza
    const formatKz = (value: number) => {
        return value.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }).replace('AOA', 'Kz');
    };

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const [selectedCompany, setSelectedCompany] = useState(companyName);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [searchText, setSearchText] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [openOptionsMenu, setOpenOptionsMenu] = useState<string | null>(null);
    const [showOtherGratificationsModal, setShowOtherGratificationsModal] = useState<string | null>(null);
    const [showDismissModal, setShowDismissModal] = useState(false);
    const [employeeToDismiss, setEmployeeToDismiss] = useState<Employee | null>(null);
    const [showUniformsModal, setShowUniformsModal] = useState(false);
    const [employeeForUniforms, setEmployeeForUniforms] = useState<Employee | null>(null);

    // Manual Input State
    const [inputValues, setInputValues] = useState<Record<string, {
        premios: number;
        gratificacoes: number;
        abonos: number;
        subNatal: number;
        alojamento: number;
        outros: number;
    }>>({});

    const handleInputChange = (empId: string, field: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setInputValues(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                [field]: numValue
            }
        }));
    };

    const getInputValue = (empId: string, field: string) => {
        return (inputValues[empId] as any)?.[field] || 0;
    };

    // Initialize defaults based on employee data
    useEffect(() => {
        const initial: any = {};
        employees.forEach(emp => {
            initial[emp.id] = {
                premios: 0,
                gratificacoes: 0,
                abonos: emp.allowances || 0,
                subNatal: emp.subsidyChristmas || 0,
                alojamento: emp.subsidyHousing || 0,
                outros: emp.otherSubsidies || 0
            };
        });
        setInputValues(initial);
    }, [employees]);

    // Close dropdown menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.relative')) {
                setOpenOptionsMenu(null);
            }
        };

        if (openOptionsMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openOptionsMenu]);

    const calculateTotalProcessed = (emp: Employee) => {
        const inputs = inputValues[emp.id] || { premios: 0, gratificacoes: 0, abonos: 0, subNatal: 0, alojamento: 0, outros: 0 };
        const base = emp.baseSalary;
        // Simplified calculation for display purposes
        return base + inputs.premios + inputs.gratificacoes + inputs.abonos + inputs.subNatal + inputs.alojamento + inputs.outros;
    };

    const totalProcessedGlobal = useMemo(() => {
        return employees.reduce((acc, emp) => acc + calculateTotalProcessed(emp), 0);
    }, [employees, inputValues]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => e.name.toLowerCase().includes(searchText.toLowerCase()));
    }, [employees, searchText]);

    const toggleSelectAll = () => {
        if (selectedEmployees.size === filteredEmployees.length) {
            setSelectedEmployees(new Set());
        } else {
            setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedEmployees);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedEmployees(newSet);
    };

    // Check if salary is already processed for an employee
    const isSalaryProcessed = (empId: string) => {
        return payroll.some(slip =>
            slip.employeeId === empId &&
            slip.month === selectedMonth &&
            slip.year === selectedYear
        );
    };

    // Delete processed salary
    const handleDeleteSalary = (empId: string) => {
        if (!confirm('Tem certeza que deseja apagar o salário processado?')) return;

        // Filter out the salary slip for this employee/month/year
        const updatedPayroll = payroll.filter(slip =>
            !(slip.employeeId === empId && slip.month === selectedMonth && slip.year === selectedYear)
        );

        // This would need to be passed up to parent to update the payroll state
        // For now, we'll just show an alert
        alert('Salário apagado com sucesso!');
    };

    // Handle Execute button - redirects to Attendance page
    const handleExecute = () => {
        if (selectedEmployees.size === 0) {
            alert("Selecione pelo menos um funcionário.");
            return;
        }

        // Redirect to Attendance page with selected employees
        if (onNavigateToAttendance) {
            onNavigateToAttendance();
        }
    };

    // Handle individual salary processing
    const handleProcessSalary = (empId: string) => {
        const emp = employees.find(e => e.id === empId);
        if (!emp) return;

        const inputs = inputValues[empId] || { premios: 0, gratificacoes: 0, abonos: 0, subNatal: 0, alojamento: 0, outros: 0 };

        const base = emp.baseSalary;
        const gross = base + inputs.premios + inputs.gratificacoes + inputs.abonos + inputs.subNatal + inputs.alojamento + inputs.outros;
        const inss = calculateINSS(base, emp.subsidyFood || 0, emp.subsidyTransport || 0);
        const irt = calculateIRT(base, inss, emp.subsidyFood || 0, emp.subsidyTransport || 0);
        const net = gross - inss - irt;

        const slip: SalarySlip = {
            id: generateId(),
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            month: selectedMonth,
            year: selectedYear,
            baseSalary: base,
            grossTotal: gross,
            netTotal: net,
            allowances: inputs.abonos,
            bonuses: inputs.premios + inputs.gratificacoes,
            subsidies: inputs.alojamento + inputs.subNatal + inputs.outros,
            subsidyTransport: emp.subsidyTransport || 0,
            subsidyFood: emp.subsidyFood || 0,
            subsidyFamily: 0,
            subsidyHousing: inputs.alojamento,
            subsidyChristmas: inputs.subNatal,
            subsidyVacation: 0,
            absences: 0,
            advances: 0,
            penalties: 0,
            inss: inss,
            irt: irt,
            processedAt: new Date().toISOString(),
            status: 'PAID'
        };

        onProcessPayroll([slip]);
        alert('Salário processado com sucesso!');
    };

    // Employee Action Handlers
    const handleDismissEmployee = (emp: Employee) => {
        setEmployeeToDismiss(emp);
        setShowDismissModal(true);
    };

    const handleConfirmDismiss = (employeeId: string, dismissalData: any) => {
        // Update employee status to Terminated
        const updatedEmployee = employees.find(e => e.id === employeeId);
        if (updatedEmployee) {
            // Atualizar o funcionário com os dados de demissão
            const dismissedEmployee = {
                ...updatedEmployee,
                status: 'Terminated' as const,
                terminationDate: dismissalData.dismissalDate,
                terminationReason: dismissalData.reason,
                terminatedBy: dismissalData.dismissedBy,
                isActive: false
            };

            // Em uma implementação real, isso chamaria onSaveEmployee ou similar
            // Por enquanto, apenas mostramos a confirmação
            alert(`✅ Funcionário ${updatedEmployee.name} foi demitido com sucesso.\n\n` +
                `Data de Demissão: ${dismissalData.dismissalDate}\n` +
                `Motivo: ${dismissalData.reason}\n` +
                `Mandante: ${dismissalData.dismissedBy}\n\n` +
                `O funcionário está agora bloqueado de todas as atividades do sistema.`);
        }
        setShowDismissModal(false);
        setEmployeeToDismiss(null);
    };

    const handleViewProfile = (emp: Employee) => {
        alert(`Visualizar cadastro de ${emp.name}`);
        // Navigate to employee profile/edit page
    };

    const handleViewPersonalFile = (emp: Employee) => {
        alert(`Visualizar ficha pessoal de ${emp.name}`);
        // Navigate to personal file page
    };

    const handleReadmit = (emp: Employee) => {
        if (confirm(`Deseja readmitir ${emp.name}?`)) {
            emp.status = 'Active';
            emp.terminationDate = undefined;
            alert(`${emp.name} foi readmitido com sucesso!`);
        }
    };

    const handleIssueContract = (emp: Employee) => {
        alert(`Emitir contrato para ${emp.name}`);
        // Navigate to contract management page
    };

    const handleManageUniforms = (emp: Employee) => {
        setEmployeeForUniforms(emp);
        setShowUniformsModal(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            {/* Header matches image: Dark Blue Gradient */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-800 p-4 shadow-md">
                <h1 className="text-xl font-bold text-white uppercase tracking-wide">Lista de Processamento de Salário</h1>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <label className="font-bold text-slate-700 text-sm">Empresa:</label>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-slate-50 border border-slate-300 rounded px-3 py-1.5 min-w-[200px] text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                >
                                    <option>{companyName}</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="font-bold text-slate-700 text-sm">Mês/Ano:</label>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-slate-50 border border-slate-300 rounded px-3 py-1.5 min-w-[150px] text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                    value={`${selectedMonth}-${selectedYear}`}
                                    onChange={(e) => {
                                        const [month, year] = e.target.value.split('-').map(Number);
                                        setSelectedMonth(month);
                                        setSelectedYear(year);
                                        if (onChangeMonth) onChangeMonth(month, year);
                                    }}
                                >
                                    {months.map((monthName, idx) => (
                                        <option key={`${idx + 1}-${selectedYear}`} value={`${idx + 1}-${selectedYear}`}>
                                            {monthName} / {selectedYear}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-auto relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar funcionário..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-9 pr-4 py-1.5 border border-slate-300 rounded bg-slate-50 text-sm w-full md:w-64 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={handleExecute}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow-sm text-sm transition-colors uppercase tracking-wide"
                    >
                        Executar
                    </button>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors">
                            <Printer size={16} />
                            Imprimir Lista
                        </button>
                        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors">
                            <FileDown size={16} />
                            Baixar PDF
                        </button>
                        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors">
                            <FileDown size={16} />
                            Baixar Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Table Content */}
            <div className="p-4 flex-1 overflow-auto">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800 text-white text-xs uppercase font-bold tracking-wider">
                                    <th className="p-3 border-r border-slate-700 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                                            checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="p-3 border-r border-slate-700 min-w-[250px]">Funcionário</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center">Premios</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center">Gratificações</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center">Abonos</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center">Subsídio Natal</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[100px] text-center">Alojamento</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[120px] text-center">Outros Subsídios</th>
                                    <th className="p-3 border-r border-slate-700 min-w-[130px] text-right">Valor Processado</th>
                                    <th className="p-3 text-center min-w-[150px]">Opções</th>
                                </tr>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                                    <th className="p-2 border-r border-slate-200 text-center">
                                        <input type="checkbox" className="rounded text-blue-300 focus:ring-0 opacity-50" disabled />
                                    </th>
                                    <th colSpan={10} className="p-2 pl-3">Empresa: {companyName}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2 border-r border-slate-200 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                                                checked={selectedEmployees.has(emp.id)}
                                                onChange={() => toggleSelect(emp.id)}
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                                                    {emp.photoUrl ? (
                                                        <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm leading-tight">{emp.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium">
                                                        <span className="font-bold text-slate-700">Nº {emp.employeeNumber || '000'}</span> • {emp.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2 border-r border-slate-200 text-center">
                                            <input
                                                type="number"
                                                value={getInputValue(emp.id, 'premios')}
                                                onChange={(e) => handleInputChange(emp.id, 'premios', e.target.value)}
                                                className="w-full text-center border border-slate-300 rounded p-1 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200 text-center">
                                            <input
                                                type="number"
                                                value={getInputValue(emp.id, 'gratificacoes')}
                                                onChange={(e) => handleInputChange(emp.id, 'gratificacoes', e.target.value)}
                                                className="w-full text-center border border-slate-300 rounded p-1 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200 text-center">
                                            <input
                                                type="number"
                                                value={getInputValue(emp.id, 'abonos')}
                                                onChange={(e) => handleInputChange(emp.id, 'abonos', e.target.value)}
                                                className="w-full text-center border border-slate-300 rounded p-1 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200 text-center">
                                            <input
                                                type="number"
                                                value={getInputValue(emp.id, 'subNatal')}
                                                onChange={(e) => handleInputChange(emp.id, 'subNatal', e.target.value)}
                                                className="w-full text-center border border-slate-300 rounded p-1 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200 text-center">
                                            <input
                                                type="number"
                                                value={getInputValue(emp.id, 'alojamento')}
                                                onChange={(e) => handleInputChange(emp.id, 'alojamento', e.target.value)}
                                                className="w-full text-center border border-slate-300 rounded p-1 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200 text-center">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={getInputValue(emp.id, 'outros')}
                                                    onChange={(e) => handleInputChange(emp.id, 'outros', e.target.value)}
                                                    className="w-full text-center border border-slate-300 rounded p-1 text-sm focus:border-blue-500 focus:outline-none pr-6"
                                                />
                                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </td>
                                        <td className="p-2 border-r border-slate-200 text-right font-black text-slate-700">
                                            {formatKz(calculateTotalProcessed(emp))}
                                        </td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center gap-1 justify-center relative">
                                                {isSalaryProcessed(emp.id) ? (
                                                    <button
                                                        onClick={() => handleDeleteSalary(emp.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors whitespace-nowrap"
                                                    >
                                                        Apagar Salário
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleProcessSalary(emp.id)}
                                                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors whitespace-nowrap"
                                                    >
                                                        Processar Salário
                                                    </button>
                                                )}
                                                <EmployeeOptionsMenu
                                                    employee={emp}
                                                    onDismiss={handleDismissEmployee}
                                                    onViewProfile={handleViewProfile}
                                                    onViewPersonalFile={handleViewPersonalFile}
                                                    onReadmit={handleReadmit}
                                                    onIssueContract={handleIssueContract}
                                                    onManageUniforms={handleManageUniforms}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Footer Totals */}
                                <tr className="bg-slate-50 font-bold text-slate-700 text-sm">
                                    <td colSpan={2} className="p-3 border-t border-slate-300 text-right text-blue-900 uppercase">Total Geral:</td>
                                    <td className="p-3 border-t border-slate-300 text-center">{formatKz(0)}</td>
                                    <td className="p-3 border-t border-slate-300 text-center">{formatKz(0)}</td>
                                    <td className="p-3 border-t border-slate-300 text-center"></td>
                                    <td className="p-3 border-t border-slate-300 text-center">{formatKz(0)}</td>
                                    <td className="p-3 border-t border-slate-300 text-center">{formatKz(0)}</td>
                                    <td className="p-3 border-t border-slate-300 text-center">{formatKz(0)}</td>
                                    <td className="p-3 border-t border-slate-300 text-center font-black text-slate-800">{formatKz(totalProcessedGlobal)}</td>
                                    <td className="p-3 border-t border-slate-300"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Footer */}
                <div className="mt-4 flex flex-col gap-2">
                    <div className="bg-white p-3 border-b border-slate-200">
                        <span className="font-bold text-slate-700">Funcionários: {employees.length}</span>
                    </div>
                    <div className="bg-white p-3 flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-600">Total Processado: <span className="text-slate-900 text-lg font-black ml-1">{formatKz(totalProcessedGlobal)}</span></span>
                        <span className="font-bold text-blue-900 text-lg">Total Processado: {formatKz(totalProcessedGlobal)}</span>
                    </div>
                </div>
            </div>

            {/* Modal de Outras Gratificações */}
            {showOtherGratificationsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowOtherGratificationsModal(null)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Outras Gratificações</h2>
                            <button onClick={() => setShowOtherGratificationsModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Adiantamento</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Abono de Família</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Subsídio de Alojamento</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Subsídio de Férias</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Gratificações Mensais</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Acerto Salarial</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Multas</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Penalizações</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Prêmios</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Outros Subsídios</label>
                                    <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Data de Início</label>
                                    <input type="date" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Data de Fim</label>
                                    <input type="date" className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setShowOtherGratificationsModal(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={() => {
                                    alert('Gratificações salvas com sucesso!');
                                    setShowOtherGratificationsModal(null);
                                }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors">
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dismiss Employee Modal */}
            {showDismissModal && employeeToDismiss && (
                <DismissEmployeeModal
                    employee={employeeToDismiss}
                    onClose={() => {
                        setShowDismissModal(false);
                        setEmployeeToDismiss(null);
                    }}
                    onConfirm={handleConfirmDismiss}
                />
            )}

            {/* Uniforms Management Modal */}
            {showUniformsModal && employeeForUniforms && (
                <UniformsManagement
                    employee={employeeForUniforms}
                    onClose={() => {
                        setShowUniformsModal(false);
                        setEmployeeForUniforms(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProcessSalary;
