import React, { useState, useMemo, useEffect } from 'react';
import { Company, Employee, SalarySlip, DailyAttendance } from '../types';
import { X, Save, Calculator, Calendar } from 'lucide-react';
import { formatCurrency, generateId, calculateINSS, calculateIRT } from '../utils';

interface SalaryProcessingModalProps {
    company: Company;
    employees: Employee[];
    processingMonth: number;
    processingYear: number;
    initialEmployeeId: string | null;
    initialData: { absences: number; extraHours: number; notes: string; } | null;
    onProcess: (slip: SalarySlip) => void;
    onClose: () => void;
}

const SalaryProcessingModal: React.FC<SalaryProcessingModalProps> = ({
    company, employees, processingMonth, processingYear,
    initialEmployeeId, initialData, onProcess, onClose
}) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(initialEmployeeId || '');
    const [absences, setAbsences] = useState(initialData?.absences || 0);
    const [extraHours, setExtraHours] = useState(initialData?.extraHours || 0);
    const [notes, setNotes] = useState(initialData?.notes || '');

    // Additional manual values
    const [bonus, setBonus] = useState(0);
    const [allowance, setAllowance] = useState(0);
    const [subsidyTransport, setSubsidyTransport] = useState(0);
    const [subsidyFood, setSubsidyFood] = useState(0);

    const activeEmployee = useMemo(() => employees.find(e => e.id === selectedEmployeeId), [selectedEmployeeId, employees]);

    useEffect(() => {
        if (activeEmployee) {
            setSubsidyTransport(activeEmployee.subsidyTransport || 0);
            setSubsidyFood(activeEmployee.subsidyFood || 0);
            setBonus(0);
            setAllowance(activeEmployee.allowances || 0);
        }
    }, [activeEmployee]);

    const handleProcess = () => {
        if (!activeEmployee) return;

        const baseSalary = activeEmployee.baseSalary || 0;

        // Simple Calc Logic (Shared with other components roughly)
        const hourlyRate = (baseSalary / 30) / 8;
        const dailyRate = baseSalary / 30;

        const overtimePay = extraHours * hourlyRate * 1.5;
        const absenceDeduction = absences * dailyRate;

        const grossIncome = baseSalary + overtimePay + bonus + allowance + subsidyTransport + subsidyFood;
        const taxableIncome = baseSalary + overtimePay + bonus + allowance; // Simplified

        const inss = calculateINSS(taxableIncome, subsidyFood, subsidyTransport);
        const irt = calculateIRT(taxableIncome - inss, inss, subsidyFood, subsidyTransport);

        const net = grossIncome - inss - irt - absenceDeduction;

        const slip: SalarySlip = {
            id: generateId(),
            employeeId: activeEmployee.id,
            employeeName: activeEmployee.name,
            employeeRole: activeEmployee.role,
            month: processingMonth,
            year: processingYear,
            baseSalary: baseSalary,
            allowances: allowance,
            bonuses: bonus,
            subsidies: 0, // Sum if needed
            subsidyTransport,
            subsidyFood,
            subsidyFamily: activeEmployee.subsidyFamily || 0,
            subsidyHousing: activeEmployee.subsidyHousing || 0,
            subsidyChristmas: activeEmployee.subsidyChristmas || 0,
            absences,
            overtimeHours: extraHours,
            grossTotal: grossIncome,
            inss,
            irt,
            netTotal: net,
            processedAt: new Date().toISOString(),
            status: 'PAID'
        };

        onProcess(slip);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold uppercase flex items-center gap-2">
                        <Calculator size={20} /> Processamento Individual
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Funcionário</label>
                            <select
                                className="w-full border border-slate-300 rounded p-2 text-sm font-bold"
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {employees.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Período</label>
                            <div className="flex items-center gap-2 border border-slate-300 rounded p-2 bg-slate-50 text-slate-700 font-bold text-sm">
                                <Calendar size={16} />
                                {processingMonth}/{processingYear}
                            </div>
                        </div>
                    </div>

                    {activeEmployee && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horas Extras</label>
                                    <input
                                        type="number"
                                        value={extraHours}
                                        onChange={e => setExtraHours(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Faltas (Dias)</label>
                                    <input
                                        type="number"
                                        value={absences}
                                        onChange={e => setAbsences(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded p-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bónus / Prémios</label>
                                    <input
                                        type="number"
                                        value={bonus}
                                        onChange={e => setBonus(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Abonos</label>
                                    <input
                                        type="number"
                                        value={allowance}
                                        onChange={e => setAllowance(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded p-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-bold uppercase text-xs">Cancelar</button>
                    <button onClick={handleProcess} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-bold uppercase text-xs flex items-center gap-2">
                        <Save size={16} /> Processar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalaryProcessingModal;
