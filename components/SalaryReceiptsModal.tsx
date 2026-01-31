import React, { useState, useMemo, useRef } from 'react';
import { Company, SalarySlip, Employee } from '../types';
import { formatCurrency, numberToExtenso } from '../utils';
import { Printer, Download, X, Calendar, ChevronLeft, ChevronRight, Search, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SalaryReceiptsModalProps {
    company: Company;
    payroll: SalarySlip[];
    employees: Employee[];
    onClose: () => void;
}

const SalaryReceiptsModal: React.FC<SalaryReceiptsModalProps> = ({ company, payroll, employees, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const currentPeriodSlips = useMemo(() => {
        return payroll.filter(slip =>
            slip.month === selectedMonth &&
            slip.year === selectedYear
        );
    }, [payroll, selectedMonth, selectedYear]);

    const filteredSlips = useMemo(() => {
        return currentPeriodSlips.filter(slip =>
            slip.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [currentPeriodSlips, searchTerm]);

    const activeSlip = useMemo(() => {
        if (!selectedSlipId && filteredSlips.length > 0) return filteredSlips[0];
        return filteredSlips.find(s => s.id === selectedSlipId) || filteredSlips[0];
    }, [filteredSlips, selectedSlipId]);

    const activeEmployee = useMemo(() => {
        if (!activeSlip) return null;
        return employees.find(e => e.id === activeSlip.employeeId);
    }, [activeSlip, employees]);

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-print-area');
        if (!printContent) return;

        // Create a temporary iframe for printing specific content
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Recibo de Vencimento</title>
                    <style>
                        body { font-family: sans-serif; -webkit-print-color-adjust: exact; }
                        @page { size: A4; margin: 20mm; }
                        .receipt-container { margin: 0 auto; max-width: 210mm; }
                    </style>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        setTimeout(() => { window.print(); window.close(); }, 500);
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('receipt-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin each side
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
            pdf.save(`Recibo_${activeSlip?.employeeName}_${months[selectedMonth - 1]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF', error);
            alert('Erro ao gerar PDF');
        }
    };

    if (!activeSlip || !activeEmployee) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
                    <p className="text-slate-600 mb-4">Nenhum recibo encontrado para {months[selectedMonth - 1]} de {selectedYear}.</p>
                    <p className="text-sm text-slate-500 mb-6">Certifique-se que o processamento salarial foi efetuado.</p>
                    <div className="flex gap-2 justify-center mb-6">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-slate-100 border border-slate-300 rounded p-2 text-sm"
                        >
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-slate-100 border border-slate-300 rounded p-2 text-sm"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg w-full">Fechar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
                {/* Header Toolbar */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                            <Printer size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Recibos de Salário</h2>
                            <p className="text-xs text-slate-500">Documento comprovativo de rendimentos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm">
                            <span className="text-xs font-bold text-slate-500 uppercase">Período:</span>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                            >
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                        <div className="h-8 w-px bg-slate-300"></div>
                        <button onClick={onClose} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Fechar">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: List of Employees */}
                    <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
                        <div className="p-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar funcionário..."
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredSlips.map(slip => (
                                <button
                                    key={slip.id}
                                    onClick={() => setSelectedSlipId(slip.id)}
                                    className={`w-full text-left p-3 border-b border-slate-100 hover:bg-white transition flex items-center gap-3 ${(selectedSlipId === slip.id || (!selectedSlipId && activeSlip.id === slip.id))
                                        ? 'bg-white border-l-4 border-l-purple-600 shadow-sm'
                                        : 'text-slate-600'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedSlipId === slip.id ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                        {slip.employeeName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${selectedSlipId === slip.id ? 'font-bold text-slate-800' : ''}`}>
                                            {slip.employeeName}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{formatCurrency(slip.netSalary)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-white">
                            <p className="text-xs text-slate-500 text-center">{filteredSlips.length} recibo(s) encontrado(s)</p>
                        </div>
                    </div>

                    {/* Main Content: Receipt Preview */}
                    <div className="flex-1 bg-slate-100 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                        <div className="flex gap-4 mb-4">
                            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm">
                                <Printer size={16} /> Imprimir Recibo
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm">
                                <Download size={16} /> Baixar PDF
                            </button>
                        </div>

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
                                        <span className="text-xl font-bold">{activeEmployee.id.replace(/\D/g, '').substring(0, 4) || '0001'}</span>
                                        <span className="text-xl font-bold uppercase">{activeSlip.employeeName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold">{months[selectedMonth - 1]} de {selectedYear}</span>
                                    </div>
                                </div>

                                {/* Profession Centered */}
                                <div className="flex justify-center mb-4">
                                    <span className="font-bold">{activeEmployee.profession || activeEmployee.category || 'Geral'}</span>
                                </div>

                                {/* Main Content Grid */}
                                <div className="space-y-1 text-sm font-medium text-black">

                                    {/* 01 Vencimento Base */}
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600">01</span>
                                        <span className="flex-1">Vencimento Base para a Categoria Profissional</span>
                                        <span className="w-16 text-center">{activeSlip.workDays}</span>
                                        <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                            {formatCurrency(activeSlip.baseSalary).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* 02 Complemento */}
                                    {activeSlip.allowances > 0 && (
                                        <div className="flex items-center">
                                            <span className="w-8 text-slate-600">02</span>
                                            <span className="flex-1">Complemento Salarial</span>
                                            <span className="w-16 text-center"></span>
                                            <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                                {formatCurrency(activeSlip.allowances).replace('Kz', '').trim()}
                                            </div>
                                        </div>
                                    )}

                                    {/* 03 Faltas */}
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600">03</span>
                                        <span className="flex-1">Abatimento de Faltas ({activeSlip.absences}d) (Total Horas={activeSlip.absences * 8}Hrs)</span>
                                        <span className="w-16 text-center">{activeSlip.absences}</span>
                                        <div className="w-48 text-right pr-3">
                                            {activeSlip.absences > 0 ? `-${formatCurrency(activeSlip.absences * (activeSlip.baseSalary / 30)).replace('Kz', '').trim()}` : '0,00'}
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
                                            {formatCurrency(activeSlip.baseSalary + activeSlip.allowances - (activeSlip.absences * (activeSlip.baseSalary / 30))).replace('Kz', '').trim()}
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
                                            {formatCurrency(activeSlip.subsidyVacation).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* 07 Subsidio Natal */}
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600">07</span>
                                        <span className="flex-1">Subsidio de Natal</span>
                                        <span className="w-16 text-center text-xs">Vg</span>
                                        <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">
                                            {formatCurrency(activeSlip.subsidyChristmas).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* Abono Familia */}
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600"></span>
                                        <span className="flex-1">Abono de Familia (Isento até 5000 akz)</span>
                                        <span className="w-16 text-center text-xs">Vg</span>
                                        <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">0</div>
                                    </div>

                                    {/* 08 Transporte */}
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600">08</span>
                                        <span className="flex-1">Subsidio Transporte</span>
                                        <span className="w-16 text-center">0</span>
                                        <div className="w-48 text-right pr-3">
                                            {formatCurrency(activeSlip.subsidyTransport).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* 09 Alimentação */}
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600">09</span>
                                        <span className="flex-1">Subsidio Alimentação</span>
                                        <span className="w-16 text-center">0</span>
                                        <div className="w-48 text-right pr-3">
                                            {formatCurrency(activeSlip.subsidyFood).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* 10 Alojamento */}
                                    <div className="flex items-center">
                                        <span className="w-8 text-slate-600">10</span>
                                        <span className="flex-1">Subsidio Alojamento</span>
                                        <span className="w-16 text-center text-xs">Vg</span>
                                        <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6">0</div>
                                    </div>

                                    {/* 13 Total Antes Impostos */}
                                    <div className="flex items-center mt-2 border-t border-black pt-1 mb-4">
                                        <span className="w-8 text-slate-600">13</span>
                                        <span className="flex-1 text-center font-bold text-xs mt-1">Total de Vencimento antes de Impostos [05]+[06]+[07]+[08]+[09]+[10]+[11]-[12]</span>
                                        <span className="w-16 text-center"></span>
                                        <div className="w-48 text-right font-bold pr-3">
                                            {formatCurrency(activeSlip.grossSalary + activeSlip.subsidyTransport + activeSlip.subsidyFood + activeSlip.subsidyVacation + activeSlip.subsidyChristmas + activeSlip.allowances).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* Impostos */}
                                    <div className="flex items-start">
                                        <span className="w-8"></span>
                                        <div className="flex-1">
                                            <span className="font-bold block">Impostos</span>
                                            {activeSlip.irt === 0 && activeSlip.inss === 0 ? (
                                                <span className="font-bold text-red-600 ml-4">ISENTO</span>
                                            ) : (
                                                <div className="ml-4 text-xs">
                                                    {activeSlip.irt > 0 && <div className="text-red-600 font-bold">IRT: {formatCurrency(activeSlip.irt)}</div>}
                                                    {activeSlip.inss > 0 && <div className="text-red-600 font-bold">INSS: {formatCurrency(activeSlip.inss)}</div>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vencimento Liquido Calc */}
                                    <div className="flex items-center mt-6">
                                        <span className="flex-1 text-center font-medium">Vencimento Liquido depois de Impostos [13]-[14]-[15]</span>
                                        <div className="w-48 text-right font-bold pr-3">
                                            {formatCurrency(activeSlip.netSalary).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* Arredondar Box */}
                                    <div className="flex justify-end items-center mt-1">
                                        <div className="text-[10px] border border-green-600 text-green-700 font-bold px-1 mr-2 rounded-sm cursor-help" title="Arredondamento automático">Arredondar</div>
                                        <div className="w-48 bg-slate-100 rounded-full border border-slate-300 px-3 text-right shadow-inner flex items-center justify-end h-6 font-bold">
                                            {formatCurrency(Math.floor(activeSlip.netSalary)).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* TOTAL A RECEBER */}
                                    <div className="flex justify-end items-center mt-1 border-t-2 border-black pt-1">
                                        <span className="font-bold mr-4">TOTAL A RECEBER</span>
                                        <div className="w-48 text-right font-bold pr-3">
                                            {formatCurrency(activeSlip.netSalary).replace('Kz', '').trim()}
                                        </div>
                                    </div>

                                    {/* Abonos e Adiantamentos (Red) */}
                                    <div className="mt-4 font-bold text-red-600 text-sm">
                                        Total de Abonos e Adiantamentos 0,00
                                    </div>

                                    {/* Valor a pagar Grande */}
                                    <div className="mt-6 flex justify-center items-center gap-4">
                                        <div className="text-xl font-bold text-red-600">
                                            Valor a pagar = {formatCurrency(activeSlip.netSalary).replace('Kz', '').trim()}
                                        </div>

                                        {/* Processar Button Fake */}
                                        <div className="bg-green-300 bg-opacity-50 border border-green-400 text-green-800 px-8 py-1 rounded shadow-sm font-medium">
                                            Processar
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

export default SalaryReceiptsModal;
