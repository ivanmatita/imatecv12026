import React, { useState, useMemo, useEffect } from 'react';
import { Company, SalarySlip, Employee } from '../types';
import { formatCurrency, roundToNearestBank, calculateINSS, calculateIRT } from '../utils';
import { Printer, Download, X, Search, User, FileText, Save, RefreshCw, MoreVertical, UserX } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SalaryReceiptsModalProps {
    company: Company;
    payroll: SalarySlip[]; // Initial calculated slips
    employees: Employee[];
    onClose: () => void;
    onSave: (finalSlips: SalarySlip[]) => void; // Save to database
    onDismiss?: (employee: Employee) => void;
    initialSelectedIds?: string[];
}

const SalaryReceiptsModal: React.FC<SalaryReceiptsModalProps> = ({ company, payroll, employees, onClose, onSave, onDismiss, initialSelectedIds = [] }) => {
    const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set(initialSelectedIds));
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Local state for editable slips
    const [editableSlips, setEditableSlips] = useState<SalarySlip[]>([]);

    useEffect(() => {
        // Deep copy only if empty or payroll changes significantly (initial load)
        if (payroll.length > 0) {
            setEditableSlips(JSON.parse(JSON.stringify(payroll)));
        }
    }, [payroll]);

    const filteredSlips = useMemo(() => {
        let slips = editableSlips.filter(slip => {
            const matchesSearch = slip.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        return slips;
    }, [editableSlips, searchTerm]); // Removed selectedEmployeeIds dependency to keep sidebar full

    useEffect(() => {
        if (initialSelectedIds.length > 0 && !selectedSlipId) {
            setSelectedSlipId(initialSelectedIds[0]);
        }
    }, [initialSelectedIds]);

    const activeSlip = useMemo(() => {
        if (filteredSlips.length === 0) return null;
        if (!selectedSlipId) return filteredSlips[0];
        return filteredSlips.find(s => s.id === selectedSlipId) || filteredSlips[0];
    }, [filteredSlips, selectedSlipId]);

    const activeEmployee = useMemo(() => {
        if (!activeSlip) return null;
        return employees.find(e => e.id === activeSlip.employeeId);
    }, [activeSlip, employees]);

    // Update Field & Recalculate
    const handleUpdateSlip = (id: string, field: keyof SalarySlip | string, value: number) => {
        setEditableSlips(prev => prev.map(slip => {
            if (slip.id !== id) return slip;

            const updated = { ...slip, [field]: value };

            // Re-calculate totals
            // Earnings
            const base = updated.baseSalary || 0;
            const allowances = updated.allowances || 0;
            const subXmas = updated.subsidyChristmas || 0;
            const subVac = updated.subsidyVacation || 0;
            const subFood = updated.subsidyFood || 0;
            const subTrans = updated.subsidyTransport || 0;
            const subHouse = updated.subsidyHousing || 0;
            const subFamily = updated.subsidyFamily || 0;
            const otherSub = (updated as any).otherSubsidies || 0; // Use 'any' if field not in interface yet

            // Deductions
            // Logic: Absences value is usually deducted from Base. 
            // If the user edits the 'Absence Value' directly, we use that.
            // But usually absences count * daily rate.
            // Let's assume the user edits the VALUES directly in this mode for simplicity and flexibility.

            // Recalculate Totals
            // Gross Total (Subject to tax usually) could vary.
            // Total Income
            const totalIncome = base + allowances + subXmas + subVac + subFood + subTrans + subHouse + subFamily + otherSub;

            // Taxable Income (Simplified for this context, reusing utils if possible)
            // Assuming strict recalc of taxes based on new Base+Allowances
            // Note: If user edits specific tax fields, we might overwrite them here. 
            // Ideally, we should have a "Auto-Calc" toggle, but auto-recalc is safer for consistency.

            const taxableForINSS = base + allowances + subXmas + subVac + subHouse + otherSub; // Usually Food/Trans exempt up to limit
            const inss = calculateINSS(taxableForINSS, subFood, subTrans);

            const taxableForIRT = taxableForINSS - inss; // Simplified
            const irt = calculateIRT(taxableForIRT, inss, subFood, subTrans);

            // Deductions (Absences value needs to be calculated if not manual)
            // We'll trust the passed absence deduction or assume user updates it.
            // Let's auto-calc absence deduction if we have days.
            let absenceDeduction = 0;
            if (updated.absences > 0) {
                absenceDeduction = (base / 30) * updated.absences;
            }

            const totalDeductions = inss + irt + absenceDeduction;
            const netTotal = totalIncome - totalDeductions;

            return {
                ...updated,
                inss,
                irt,
                netTotal,
                grossTotal: totalIncome // Updating gross total to reflect all income
            };
        }));
    };

    const handleSaveAll = () => {
        onSave(editableSlips);
    };

    const handlePrint = () => {
        window.print();
    };

    const renderReceipt = (slip: SalarySlip, emp: Employee, isEditable: boolean = false) => {
        if (!slip || !emp) return null;

        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        // Derived Values for Display
        const absenceVal = (slip.baseSalary / 30) * (slip.absences || 0);
        const totalVencimentos = (slip.baseSalary || 0) + (slip.allowances || 0) - absenceVal
            + (slip.overtimeHours ? (slip.baseSalary / 30 / 8 * 1.5 * slip.overtimeHours) : 0);

        const totalSubsidios = (slip.subsidyFamily || 0) + (slip.subsidyHousing || 0) + (slip.subsidyFood || 0) + (slip.subsidyTransport || 0) + (slip.subsidyChristmas || 0) + (slip.subsidyVacation || 0) + ((slip as any).otherSubsidies || 0);

        const totalLiquido = slip.netTotal;

        const InputField = ({ val, field, width = "w-24" }: { val: number, field: string, width?: string }) => (
            isEditable ? (
                <input
                    type="number"
                    value={val || 0}
                    onChange={(e) => handleUpdateSlip(slip.id!, field, parseFloat(e.target.value))}
                    className={`bg-blue-50 border border-blue-200 text-right px-1 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-900 ${width}`}
                    step="0.01"
                />
            ) : (
                <span>{formatCurrency(val)}</span>
            )
        );

        return (
            <div className="bg-white p-6 max-w-[210mm] mx-auto text-xs font-sans text-slate-900 leading-snug h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        {/* Make Logo Optional or Placeholder */}
                        <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center font-bold text-slate-400">LOGO</div>
                        <div>
                            <h1 className="text-lg font-black uppercase text-slate-800 tracking-tighter">{company.name}</h1>
                            <p className="font-bold text-slate-500">NIF: {company.nif}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-black text-blue-900 uppercase tracking-wide">RECIBO DE SALÁRIO</h2>
                        <p className="font-bold text-slate-600 mt-1 uppercase">
                            Período: {months[(slip.month || 1) - 1]} / {slip.year}
                        </p>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <p className="mb-1"><span className="font-bold text-slate-500 uppercase text-[10px] w-24 inline-block">Funcionário Nº:</span> <span className="font-bold text-sm">{emp.employeeNumber || '---'}</span></p>
                        <p className="mb-1"><span className="font-bold text-slate-500 uppercase text-[10px] w-24 inline-block">Nome:</span> <span className="font-bold text-sm uppercase">{emp.name}</span></p>
                        <p><span className="font-bold text-slate-500 uppercase text-[10px] w-24 inline-block">Função:</span> <span className="font-bold">{emp.role}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="mb-1"><span className="font-bold text-slate-500 uppercase text-[10px]">Data de Pagamento:</span> <span className="font-bold ml-2">{new Date().toLocaleDateString('pt-PT')}</span></p>
                        <p className="mb-1"><span className="font-bold text-slate-500 uppercase text-[10px]">NIF Func.:</span> <span className="font-bold ml-2">{emp.nif || '---'}</span></p>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-blue-900 text-white uppercase text-[10px]">
                                <th className="p-2 text-left rounded-tl">Descrição</th>
                                <th className="p-2 text-center w-16">Qtd</th>
                                <th className="p-2 text-right w-32 rounded-tr">Valor (Kz)</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px]">
                            {/* Salary */}
                            <tr className="border-b border-slate-100">
                                <td className="p-2 font-bold">01 - Vencimento Base</td>
                                <td className="p-2 text-center">30</td>
                                <td className="p-2 text-right"><InputField val={slip.baseSalary} field="baseSalary" /></td>
                            </tr>

                            {/* Allowances */}
                            {(slip.allowances > 0 || isEditable) && (
                                <tr className="border-b border-slate-100">
                                    <td className="p-2">02 - Complemento Salarial</td>
                                    <td className="p-2 text-center"></td>
                                    <td className="p-2 text-right"><InputField val={slip.allowances} field="allowances" /></td>
                                </tr>
                            )}

                            {/* Absences */}
                            {(slip.absences > 0 || isEditable) && (
                                <tr className="border-b border-slate-100 text-red-600 bg-red-50/30">
                                    <td className="p-2">03 - Abatimento de Faltas ({slip.absences} dias)</td>
                                    <td className="p-2 text-center">{slip.absences}</td>
                                    <td className="p-2 text-right font-medium">
                                        - {formatCurrency(absenceVal)}
                                    </td>
                                </tr>
                            )}

                            {/* Overtime */}
                            {((slip.overtimeHours || 0) > 0 || isEditable) && (
                                <tr className="border-b border-slate-100">
                                    <td className="p-2">04 - Horas Extras</td>
                                    <td className="p-2 text-center">{slip.overtimeHours}</td>
                                    <td className="p-2 text-right">
                                        {/* Simplified editing of hours not value directly here, OR edit value. Let's make Hours editable? No, keep visual value edit as per request */}
                                        <span>{formatCurrency(slip.overtimeHours ? (slip.baseSalary / 30 / 8 * 1.5 * slip.overtimeHours) : 0)}</span>
                                    </td>
                                </tr>
                            )}

                            {/* Subtotals Row */}
                            <tr className="bg-slate-50 font-bold border-y-2 border-slate-200">
                                <td className="p-2 uppercase text-slate-500 text-[10px]">Total de Vencimentos</td>
                                <td></td>
                                <td className="p-2 text-right text-slate-800">{formatCurrency(totalVencimentos)}</td>
                            </tr>

                            {/* Subsidies */}
                            <tr className="border-b border-slate-100"><td colSpan={3} className="p-2 font-bold text-slate-400 uppercase text-[10px] pt-4">Subsídios e Abonos</td></tr>

                            <tr className="border-b border-slate-100">
                                <td className="p-2">Subsídio de Transporte</td>
                                <td className="p-2 text-center"></td>
                                <td className="p-2 text-right"><InputField val={slip.subsidyTransport} field="subsidyTransport" /></td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-2">Subsídio de Alimentação</td>
                                <td className="p-2 text-center"></td>
                                <td className="p-2 text-right"><InputField val={slip.subsidyFood} field="subsidyFood" /></td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-2">Subsídio de Natal</td>
                                <td className="p-2 text-center"></td>
                                <td className="p-2 text-right"><InputField val={slip.subsidyChristmas || 0} field="subsidyChristmas" /></td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-2">Outros Subsídios</td>
                                <td className="p-2 text-center"></td>
                                <td className="p-2 text-right"><InputField val={(slip as any).otherSubsidies || 0} field="otherSubsidies" /></td>
                            </tr>

                            {/* Taxes */}
                            <tr className="border-b border-slate-100"><td colSpan={3} className="p-2 font-bold text-slate-400 uppercase text-[10px] pt-4">Deduções e Impostos</td></tr>

                            <tr className="border-b border-slate-100">
                                <td className="p-2">Segurança Social (3%)</td>
                                <td className="p-2 text-center">3%</td>
                                <td className="p-2 text-right text-red-600 font-medium">- {formatCurrency(slip.inss)}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-2">IRT (Imposto sobre Rendimento)</td>
                                <td className="p-2 text-center">Tab</td>
                                <td className="p-2 text-right text-red-600 font-medium">- {formatCurrency(slip.irt)}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                <div className="mt-8 border-t-2 border-slate-800 pt-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-xs text-red-600 font-bold uppercase">
                            Total de Descontos: {formatCurrency(slip.inss + slip.irt + absenceVal)}
                        </div>
                        <div className="bg-slate-100 px-6 py-3 rounded-lg border border-slate-300">
                            <span className="text-xs font-bold text-slate-500 uppercase mr-4">Total Líquido a Receber:</span>
                            <span className="text-2xl font-black text-blue-900">{formatCurrency(totalLiquido)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end text-[10px] text-slate-400 uppercase">
                        <div className="border-t border-slate-300 w-64 pt-1 text-center">
                            Assinatura da Entidade Patronal
                        </div>
                        <div className="border-t border-slate-300 w-64 pt-1 text-center">
                            Assinatura do Funcionário
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in">
            <div className="w-full h-full max-w-[95vw] bg-slate-100 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

                {/* Sidebar - List */}
                <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-black text-slate-800 uppercase tracking-tight mb-4">Processamento Salarial</h2>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all uppercase"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredSlips.map(slip => {
                            const isSelected = selectedEmployeeIds.has(slip.employeeId);
                            return (
                                <div key={slip.id} className="flex items-center gap-2 border-b border-slate-100">
                                    <div className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                                const newSet = new Set(selectedEmployeeIds);
                                                if (isSelected) {
                                                    newSet.delete(slip.employeeId);
                                                } else {
                                                    newSet.add(slip.employeeId);
                                                }
                                                setSelectedEmployeeIds(newSet);
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setSelectedSlipId(slip.id)}
                                        className={`flex-1 text-left p-4 pl-2 transition-all flex items-center gap-3 ${(selectedSlipId === slip.id || (!selectedSlipId && activeSlip?.id === slip.id))
                                            ? 'bg-blue-50'
                                            : ''
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${(selectedSlipId === slip.id || (!selectedSlipId && activeSlip?.id === slip.id)) ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {slip.employeeName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-800 text-xs uppercase truncate">{slip.employeeName}</div>
                                            <div className="text-[10px] text-slate-500 font-bold">{formatCurrency(slip.netTotal)}</div>
                                        </div>
                                    </button>

                                    {/* Options Button */}
                                    <div className="pr-2 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === slip.id ? null : slip.id);
                                            }}
                                            className={`p-2 rounded-lg transition-all ${openMenuId === slip.id ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === slip.id && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-[200] animate-in fade-in zoom-in-95 origin-top-right overflow-hidden">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const emp = employees.find(e => e.id === slip.employeeId);
                                                        if (emp && onDismiss) {
                                                            onDismiss(emp);
                                                            setOpenMenuId(null);
                                                        } else {
                                                            alert("Funcionalidade indisponível para este item.");
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 uppercase"
                                                >
                                                    <UserX size={14} /> Demitir Funcionário
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                        <button
                            onClick={handleSaveAll}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-black uppercase tracking-wide text-xs hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <Save size={16} /> Confirmar & Salvar
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white text-slate-600 border border-slate-200 rounded-lg font-bold uppercase tracking-wide text-xs hover:bg-slate-50 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* Main Content - Preview */}
                <div className="flex-1 bg-slate-200/50 overflow-y-auto p-4 md:p-8 flex flex-col items-center gap-8 print:p-0 print:overflow-visible print:bg-white print:block">
                    {selectedEmployeeIds.size > 0 ? (
                        Array.from(selectedEmployeeIds).map(empId => {
                            const slip = filteredSlips.find(s => s.employeeId === empId);
                            const emp = employees.find(e => e.id === empId);
                            if (!slip || !emp) return null;
                            return (
                                <div key={slip.id} className="animate-in slide-in-from-bottom-5 duration-300 w-full max-w-[210mm] shadow-2xl print:shadow-none print:w-full print:max-w-none print:break-after-page mb-8 print:mb-0">
                                    {renderReceipt(slip, emp, true)}
                                </div>
                            );
                        })
                    ) : activeSlip && activeEmployee ? (
                        <div className="animate-in slide-in-from-bottom-5 duration-300 w-full max-w-[210mm] shadow-2xl print:shadow-none print:w-full print:max-w-none">
                            {renderReceipt(activeSlip, activeEmployee, true)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                            <User size={64} className="mb-4 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-sm">Selecione um funcionário</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SalaryReceiptsModal;
