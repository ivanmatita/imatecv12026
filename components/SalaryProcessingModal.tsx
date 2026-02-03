import React, { useState, useMemo } from 'react';
import { Company, SalarySlip, Employee } from '../types';
import { formatCurrency, generateId, calculateINSS, calculateIRT, roundToNearestBank } from '../utils';
import { Printer, X, Calculator, Search, CheckCircle2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SalaryProcessingModalProps {
    company: Company;
    employees: Employee[];
    onProcess: (slip: SalarySlip) => void;
    onClose: () => void;
    processingMonth: number;
    processingYear: number;
    initialEmployeeId?: string | null;
    initialData?: {
        absences: number;
        extraHours: number;
        notes: string;
    } | null;
}

const SalaryProcessingModal: React.FC<SalaryProcessingModalProps> = ({
    employees,
    onProcess,
    onClose,
    processingMonth,
    processingYear,
    initialEmployeeId,
    initialData
}) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployeeId || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [manualAdjustments, setManualAdjustments] = useState<Record<string, number>>({});
    const [processedEmployees, setProcessedEmployees] = useState<Set<string>>(new Set());
    const [isArredondado, setIsArredondado] = useState(false);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const activeEmployee = useMemo(() => {
        const selected = employees.find(e => e.id === selectedEmployeeId);
        if (selected) return selected;
        return filteredEmployees[0] || employees[0];
    }, [employees, filteredEmployees, selectedEmployeeId]);

    const activeSlip = useMemo(() => {
        if (!activeEmployee) return null;

        const manualAdj = manualAdjustments[activeEmployee.id] || 0;
        const daysInMonth = new Date(processingYear, processingMonth, 0).getDate();

        const baseSalary = activeEmployee.baseSalary || 0;
        const allowances = activeEmployee.allowances || 0; // Complemento Salarial

        // Use initialData if we are on the initially selected employee
        const isTargetEmployee = initialEmployeeId === activeEmployee.id;
        const absences = (isTargetEmployee && initialData) ? initialData.absences : (activeEmployee.absences || 0);
        const extraHours = (isTargetEmployee && initialData) ? initialData.extraHours : 0;

        // Absence Deduction: matching image style (4 days example)
        const absenceDeduction = (baseSalary / 30) * absences;

        // Gross Iliquido (05) = 01+02-03+04
        // Assuming extraHours value is monetary for now, or if it's hours we need a rate. 
        // Let's assume input is hours and calculate rate based on baseSalary/30/8 * 1.5? 
        // For simplicity reusing logic or assuming 0 if not defined properly. 
        // The user didn't specify extra hour formula, so let's just add it if it's monetary, or calculate.
        // Let's assume the field `extraHours` in initialData is Quantity of hours.
        const hourlyRate = (baseSalary / 30) / 8;
        const extraHoursValue = extraHours * hourlyRate * 1.5; // 150% rate assumption

        const grossIliquido = baseSalary + allowances - absenceDeduction + extraHoursValue;

        const subsidyVacation = activeEmployee.subsidyVacation || 0;
        const subsidyChristmas = activeEmployee.subsidyChristmas || 0;
        const subsidyHousing = activeEmployee.subsidyHousing || 0;
        const subsidyFood = activeEmployee.subsidyFood || 0;
        const subsidyTransport = activeEmployee.subsidyTransport || 0;
        const subsidyFamily = activeEmployee.subsidyFamily || 0;

        const totalBeforeTax = grossIliquido + subsidyVacation + subsidyChristmas + subsidyFamily + subsidyTransport + subsidyFood + subsidyHousing;

        const inss = calculateINSS(baseSalary, subsidyFood, subsidyTransport);
        const irt = calculateIRT(baseSalary, inss, subsidyFood, subsidyTransport);

        const totalDeductions = inss + irt + (activeEmployee.penalties || 0) + (activeEmployee.advances || 0);
        const netSalary = totalBeforeTax - totalDeductions + manualAdj;

        return {
            id: generateId(),
            employeeId: activeEmployee.id,
            employeeName: activeEmployee.name,
            month: processingMonth,
            year: processingYear,
            baseSalary,
            grossSalary: grossIliquido,
            netSalary: netSalary,
            subsidyVacation,
            subsidyChristmas,
            subsidyHousing,
            allowances,
            subsidyFood,
            subsidyTransport,
            subsidyFamily,
            inss,
            irt,
            totalDeductions,
            workDays: daysInMonth - absences,
            daysInMonth,
            absences,
            extraHours: extraHoursValue,
            salaryAdjustments: manualAdj,
            penalties: activeEmployee.penalties || 0,
            advances: activeEmployee.advances || 0,
            processedAt: new Date().toISOString()
        };
    }, [activeEmployee, manualAdjustments, processingMonth, processingYear, initialData, initialEmployeeId]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('receipt-print-area');
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Recibo_Salario_${activeEmployee.name}_${months[processingMonth - 1]}_${processingYear}.pdf`);
    };

    const handleProcessAction = () => {
        if (activeSlip) {
            const finalNet = isArredondado ? roundToNearestBank(activeSlip.netSalary) : activeSlip.netSalary;
            onProcess({ ...activeSlip, netSalary: finalNet });
            setProcessedEmployees(prev => new Set(prev).add(activeSlip.employeeId));

            // Show feedback
            // alert('Salário processado com sucesso!');
        }
    };

    const isProcessed = activeEmployee ? processedEmployees.has(activeEmployee.id) : false;

    if (!activeEmployee || !activeSlip) return null;

    const netVal = isArredondado ? roundToNearestBank(activeSlip.netSalary) : activeSlip.netSalary;

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Sidebar with employees - Left side */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 print:hidden">
                <div className="p-6 bg-slate-900 text-white">
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Calculator size={20} className="text-emerald-400" />
                        Processamento
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recursos Humanos IMATEC</p>
                </div>

                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Pesquisar funcionário..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredEmployees.map(emp => (
                        <button
                            key={emp.id}
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className={`w-full text-left px-5 py-4 border-b border-slate-50 transition-all flex items-center gap-4 ${(selectedEmployeeId === emp.id || (!selectedEmployeeId && activeEmployee.id === emp.id))
                                ? 'bg-emerald-50 border-r-4 border-r-emerald-600'
                                : 'hover:bg-slate-50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${(selectedEmployeeId === emp.id || (!selectedEmployeeId && activeEmployee.id === emp.id))
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-500'
                                }`}>
                                {emp.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate font-black uppercase tracking-tight ${(selectedEmployeeId === emp.id || (!selectedEmployeeId && activeEmployee.id === emp.id))
                                    ? 'text-emerald-900'
                                    : 'text-slate-700'
                                    }`}>
                                    {emp.name}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">IDNF: {emp.employeeNumber || '---'}</p>
                            </div>
                            {(emp.isMagic || processedEmployees.has(emp.id)) && <CheckCircle2 size={16} className="text-emerald-500" />}
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <button onClick={onClose} className="p-2 text-red-500 hover:bg-white rounded-lg transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <X size={18} /> Sair
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredEmployees.length} Colaboradores</span>
                </div>
            </div>

            {/* Main Receipt Content - Right side */}
            <div className="flex-1 bg-slate-200 overflow-y-auto p-4 md:p-10 flex flex-col items-center">

                {/* Actions Bar */}
                <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-300">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Período de Referência</span>
                            <span className="text-sm font-black text-slate-900 uppercase">{months[processingMonth - 1]} de {processingYear}</span>
                        </div>
                    </div>
                    <button onClick={handlePrint} className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <Printer size={18} /> Imprimir Recibo
                    </button>
                </div>

                {/* THE ACTUAL RECEIPT MATCHING THE IMAGE */}
                <div id="receipt-print-area" className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-0 w-[210mm] max-w-full print:shadow-none print:w-full font-sans border border-slate-300">
                    <div className="p-10 md:p-14 relative flex flex-col h-full bg-white">

                        {/* Header Gradient (Metallic Bar) */}
                        <div className="w-full h-11 bg-gradient-to-b from-[#999] via-[#ccc] to-white border-b-2 border-slate-500 mb-10 flex items-center justify-center rounded-sm print:h-11">
                            <h1 className="font-black text-center text-black uppercase tracking-[0.3em] text-[15px]">RECIBO SALARIO</h1>
                        </div>

                        {/* Top Info Section */}
                        <div className="flex justify-between items-end border-b-[4px] border-black pb-2 mb-2">
                            <div className="flex items-end gap-5">
                                <span className="text-4xl font-black text-black leading-none">{activeEmployee.employeeNumber || '2'}</span>
                                <span className="text-4xl font-black text-black uppercase tracking-tight leading-none">{activeEmployee.name}</span>
                            </div>
                            <div className="flex gap-4 mb-4 print:hidden">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm">
                                    <Printer size={16} /> Imprimir
                                </button>
                                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 shadow-sm">
                                    <Download size={16} /> Baixar PDF
                                </button>
                            </div>
                        </div>

                        {/* Column Header Labels */}
                        <div className="flex px-4 py-2 border-b border-slate-200 mb-2">
                            <span className="flex-1 text-center font-black text-[11px] uppercase tracking-widest text-slate-800">Secretaria</span>
                            <span className="w-24 text-center font-black text-[11px] uppercase tracking-widest text-slate-800">QTD</span>
                            <span className="w-52 font-black text-[11px] uppercase tracking-widest text-slate-800"></span>
                        </div>

                        {/* Line Items */}
                        <div className="flex-1 space-y-3 font-bold text-black text-[15px]">

                            {/* 01 Vencimento Base */}
                            <div className="flex items-center px-4">
                                <span className="w-10 text-slate-400 font-bold">01</span>
                                <span className="flex-1">Vencimento Base para a Categoria Profissional</span>
                                <span className="w-24 text-center">{activeSlip.daysInMonth || 31}</span>
                                <div className="w-52 h-9 bg-white border border-slate-300 rounded-full flex items-center justify-end px-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] text-black font-black">
                                    {Math.round(activeSlip.baseSalary)}
                                </div>
                            </div>

                            {/* 02 Complemento */}
                            <div className="flex items-center px-4">
                                <span className="w-10 text-slate-400 font-bold">02</span>
                                <span className="flex-1">Complemento Salarial</span>
                                <span className="w-24 text-center">27</span>
                                <div className="w-52 h-9 bg-white border border-slate-300 rounded-full flex items-center justify-end px-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] text-black font-black">
                                    {Math.round(activeSlip.allowances)}
                                </div>
                            </div>

                            {/* 03 Faltas */}
                            <div className="flex items-center px-4">
                                <span className="w-10 text-slate-400 font-bold">03</span>
                                <span className="flex-1">Abatimento de Faltas Admissão({activeSlip.absences}d) (Total Horas={activeSlip.absences * 8}Hrs)</span>
                                <span className="w-24 text-center">{activeSlip.absences}</span>
                                <div className="w-52 text-right pr-6 font-black text-black">
                                    {activeSlip.absences > 0 ? `- ${formatCurrency(activeSlip.absences * (activeSlip.baseSalary / 30)).replace('Kz', '').trim()}` : '0,00'}
                                </div>
                            </div>

                            {/* 04 Horas Extra */}
                            <div className="flex items-center px-4">
                                <span className="w-10 text-slate-400 font-bold">04</span>
                                <span className="flex-1 font-bold">Horas Extra</span>
                                <span className="w-24 text-center">{formatCurrency(activeSlip.extraHours || 0).replace('Kz', '').trim()}</span>
                                <div className="w-52 text-right pr-6 font-black">Horas Perdidas</div>
                            </div>

                            {/* Adjusted Extra Line for alignment */}
                            <div className="flex items-center px-4 -mt-2">
                                <span className="w-10"></span>
                                <span className="flex-1"></span>
                                <span className="w-24 text-center"></span>
                                <div className="w-52 text-right pr-6 font-black">- 0,00</div>
                            </div>

                            {/* 05 Total Iliquido Bar */}
                            <div className="flex items-center border-t-2 border-black mt-4 pt-3 mb-4 px-4 bg-slate-50/50">
                                <span className="w-10 text-slate-400 font-bold">05</span>
                                <span className="flex-1 text-center font-black uppercase text-xs tracking-wider">Total de Vencimento Base lliquido (01+02-03+04)</span>
                                <span className="w-24"></span>
                                <div className="w-52 text-right pr-6 font-black text-2xl tracking-tighter">
                                    {formatCurrency(activeSlip.grossSalary).replace('Kz', '').trim()}
                                </div>
                            </div>

                            {/* Subsidios Group */}
                            <div className="space-y-3">
                                <h3 className="px-14 font-black uppercase text-xs tracking-widest mb-1 text-slate-800">Subsidios</h3>

                                <div className="flex items-center px-4">
                                    <span className="w-10 text-slate-400 font-bold">06</span>
                                    <span className="flex-1">Subsidio de Férias</span>
                                    <span className="w-24 text-center text-xs font-black">Vg</span>
                                    <div className="w-52 h-9 bg-white border border-slate-300 rounded-full flex items-center justify-end px-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] text-black font-black">
                                        {Math.round(activeSlip.subsidyVacation)}
                                    </div>
                                </div>

                                <div className="flex items-center px-4">
                                    <span className="w-10 text-slate-400 font-bold">07</span>
                                    <span className="flex-1">Subsidio de Natal</span>
                                    <span className="w-24 text-center text-xs font-black">Vg</span>
                                    <div className="w-52 h-9 bg-white border border-slate-300 rounded-full flex items-center justify-end px-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] text-black font-black">
                                        {Math.round(activeSlip.subsidyChristmas)}
                                    </div>
                                </div>

                                <div className="flex items-center px-4">
                                    <span className="w-10"></span>
                                    <span className="flex-1">Abono de Familia (Isento até 5000 akz)</span>
                                    <span className="w-24 text-center text-xs font-black">Vg</span>
                                    <div className="w-52 h-9 bg-white border border-slate-300 rounded-full flex items-center justify-end px-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] text-black font-black">
                                        {Math.round(activeSlip.subsidyFamily)}
                                    </div>
                                </div>

                                <div className="flex items-center px-4">
                                    <span className="w-10 text-slate-400 font-bold">08</span>
                                    <span className="flex-1">Subsidio Transporte</span>
                                    <span className="w-24 text-center">0</span>
                                    <div className="w-52 text-right pr-6 font-black">{formatCurrency(activeSlip.subsidyTransport).replace('Kz', '').trim()}</div>
                                </div>

                                <div className="flex items-center px-4">
                                    <span className="w-10 text-slate-400 font-bold">09</span>
                                    <span className="flex-1">Subsidio Alimentação</span>
                                    <span className="w-24 text-center">0</span>
                                    <div className="w-52 text-right pr-6 font-black">{formatCurrency(activeSlip.subsidyFood).replace('Kz', '').trim()}</div>
                                </div>

                                <div className="flex items-center px-4">
                                    <span className="w-10 text-slate-400 font-bold">10</span>
                                    <span className="flex-1">Subsidio Alojamento</span>
                                    <span className="w-24 text-center text-xs font-black">Vg</span>
                                    <div className="w-52 h-9 bg-white border border-slate-300 rounded-full flex items-center justify-end px-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] text-black font-black">
                                        {Math.round(activeSlip.subsidyHousing)}
                                    </div>
                                </div>
                            </div>

                            {/* 13 Total Antes Impostos */}
                            <div className="flex items-center border-t-2 border-black mt-6 pt-3 px-4 bg-slate-50/50">
                                <span className="w-10 text-slate-400 font-bold">13</span>
                                <span className="flex-1 text-center font-black uppercase text-[10px] tracking-tight text-slate-500">Total de Vencimento antes de Impostos [05]+[06]+[07]+[08]+[09]+[10]+[11]-[12]</span>
                                <span className="w-24"></span>
                                <div className="w-52 text-right pr-6 font-black text-2xl tracking-tighter">
                                    {formatCurrency(activeSlip.grossSalary + activeSlip.subsidyVacation + activeSlip.subsidyChristmas + activeSlip.subsidyFamily + activeSlip.subsidyTransport + activeSlip.subsidyFood + activeSlip.subsidyHousing).replace('Kz', '').trim()}
                                </div>
                            </div>

                            {/* Taxes Section */}
                            <div className="px-4 py-3 border-b-2 border-slate-100 mb-2">
                                <h4 className="font-black uppercase text-xs tracking-widest mb-1 text-slate-800 pl-10">Impostos</h4>
                                {activeSlip.irt === 0 && activeSlip.inss === 0 ? (
                                    <div className="pl-10 text-3xl font-black text-red-600 tracking-[0.2em]">ISENTO</div>
                                ) : (
                                    <div className="pl-10 space-y-1">
                                        <div className="flex justify-between w-64">
                                            <span className="text-red-600 font-black">INSS:</span>
                                            <span className="text-red-600 font-black">{formatCurrency(activeSlip.inss).replace('Kz', '').trim()}</span>
                                        </div>
                                        {activeSlip.irt > 0 &&
                                            <div className="flex justify-between w-64">
                                                <span className="text-red-600 font-black">IRT:</span>
                                                <span className="text-red-600 font-black">{formatCurrency(activeSlip.irt).replace('Kz', '').trim()}</span>
                                            </div>}
                                    </div>
                                )}
                            </div>

                            {/* Calculation Summary Footer */}
                            <div className="space-y-4 px-4 pt-2">
                                <div className="flex items-center">
                                    <span className="flex-1 text-right font-black uppercase text-[11px] pr-8 tracking-tighter text-slate-500">Vencimento Liquido depois de Impostos [13]-[14]-[15]</span>
                                    <div className="w-52 text-right pr-6 font-black text-2xl tracking-tighter">
                                        {formatCurrency(activeSlip.netSalary).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                <div className="flex justify-end items-center">
                                    <button
                                        onClick={() => setIsArredondado(!isArredondado)}
                                        className={`px-3 py-1 border-2 font-black text-[10px] uppercase rounded-[4px] mr-6 transition-all print:hidden ${isArredondado ? 'bg-black text-white border-black' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        Arredondar
                                    </button>
                                    <span className="font-black text-[10px] uppercase text-slate-500 mr-2">Arredondar</span>
                                    <div className="w-52 h-11 bg-[#f0f0f0] border-2 border-slate-400 rounded-full flex items-center justify-end px-7 shadow-inner text-2xl font-black tracking-tighter text-slate-700">
                                        {Math.round(netVal)}
                                    </div>
                                </div>

                                <div className="flex items-center border-t-4 border-black pt-4">
                                    <span className="flex-1 text-right font-black uppercase text-lg pr-8 tracking-tighter text-black">TOTAL A RECEBER</span>
                                    <div className="w-52 text-right pr-6 font-black text-3xl tracking-tighter text-black">
                                        {formatCurrency(activeSlip.netSalary).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                {/* RED TEXT INFO */}
                                <div className="pt-6 space-y-4">
                                    <p className="font-black text-red-600 text-[15px] uppercase text-right w-full pr-[250px]">Total de Abonos e Adiantamentos 0,00</p>

                                    <div className="flex justify-between items-center mt-8">
                                        <div className="flex-1 text-right pr-8">
                                            <p className="font-black text-red-600 text-3xl uppercase tracking-tighter leading-none inline-block border-b-2 border-red-600 pb-1">Valor a pagar ={formatCurrency(netVal).replace('Kz', '').trim()}</p>
                                        </div>

                                        <div className="print:hidden w-52 flex justify-end">
                                            {isProcessed ? (
                                                <div className="flex items-center gap-4 bg-emerald-50 px-6 py-4 rounded-3xl border-2 border-emerald-200">
                                                    <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm uppercase">
                                                        <CheckCircle2 size={24} />
                                                        <span>Processado</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleProcessAction}
                                                    className="bg-[#a3e4be] hover:bg-[#8fd9ad] text-[#0f3d24] px-10 py-4 rounded-[12px] font-black uppercase text-xl shadow-xl hover:scale-105 transition-all active:scale-95 border-b-4 border-[#7ab594]"
                                                >
                                                    Processar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default SalaryProcessingModal;
