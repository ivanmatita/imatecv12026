import React, { useState, useMemo } from 'react';
import { Company, SalarySlip, Employee } from '../types';
import { formatCurrency, roundToNearestBank } from '../utils';
import { Printer, Download, X, Search, User, FileText, ChevronLeft, ChevronRight, Building2, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SalaryReceiptsModalProps {
    company: Company;
    payroll: SalarySlip[];
    employees: Employee[];
    onClose: () => void;
    onGoToProcessing: () => void;
}

const SalaryReceiptsModal: React.FC<SalaryReceiptsModalProps> = ({ company, payroll, employees, onClose, onGoToProcessing }) => {
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
        if (filteredSlips.length === 0) return null;
        if (!selectedSlipId) return filteredSlips[0];
        return filteredSlips.find(s => s.id === selectedSlipId) || filteredSlips[0];
    }, [filteredSlips, selectedSlipId]);

    const activeEmployee = useMemo(() => {
        if (!activeSlip) return null;
        return employees.find(e => e.id === activeSlip.employeeId);
    }, [activeSlip, employees]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('receipt-content-area');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`RECIBO_${activeSlip?.employeeName || 'FUNCIONARIO'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF', error);
            alert('Erro ao gerar PDF');
        }
    };

    const formattedNet = activeSlip ? roundToNearestBank(activeSlip.netTotal) : 0;
    const daysInMonth = activeSlip ? new Date(selectedYear, selectedMonth, 0).getDate() : 30;

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-0 md:p-2 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[98vw] h-full md:h-[98vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 origin-top transform scale-100">

                {/* Header Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center px-4 py-3 border-b border-slate-200 bg-white shrink-0 print:hidden gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-purple-600 p-2 rounded-lg text-white shadow-lg shadow-purple-200 hidden md:block">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Histórico de Recibos</h2>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Consultar e Imprimir</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <button
                            onClick={onGoToProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition flex items-center gap-2"
                        >
                            <User size={14} /> Processar
                        </button>

                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                            <span className="text-slate-400 uppercase hidden sm:inline">Período:</span>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-transparent outline-none cursor-pointer uppercase text-slate-700"
                            >
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <span className="text-slate-300">/</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-transparent outline-none cursor-pointer text-slate-700"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

                        <button onClick={onClose} className="p-1.5 bg-red-100/50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-slate-100">

                    {/* Sidebar Employee List */}
                    <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col print:hidden shadow-inner h-1/3 md:h-auto">
                        <div className="p-4 bg-slate-50/50">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar funcionário..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:font-normal uppercase"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredSlips.length > 0 ? (
                                filteredSlips.map(slip => (
                                    <button
                                        key={slip.id}
                                        onClick={() => setSelectedSlipId(slip.id)}
                                        className={`w-full text-left p-4 border-b border-slate-50 transition-all flex items-center gap-3 md:gap-4 group ${(selectedSlipId === slip.id || (!selectedSlipId && activeSlip?.id === slip.id))
                                            ? 'bg-purple-50 border-l-4 border-l-purple-600'
                                            : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 shrink-0 ${(selectedSlipId === slip.id || (!selectedSlipId && activeSlip?.id === slip.id))
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {slip.employeeName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs md:text-sm truncate uppercase tracking-tight ${(selectedSlipId === slip.id || (!selectedSlipId && activeSlip?.id === slip.id))
                                                ? 'font-black text-slate-900'
                                                : 'font-bold'
                                                }`}>
                                                {slip.employeeName}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formatCurrency(slip.netTotal)}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300">
                                        <User size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Nenhum recibo</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                            <span>{filteredSlips.length} REGISTOS</span>
                        </div>
                    </div>

                    {/* Receipt Preview Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-200/80">
                        {activeSlip && activeEmployee ? (
                            <div className="w-full flex flex-col items-center">
                                {/* Actions */}
                                <div className="flex gap-2 md:gap-4 mb-6 print:hidden w-full max-w-[210mm] justify-end">
                                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg">
                                        <Printer size={14} /> <span className="hidden sm:inline">Imprimir</span>
                                    </button>
                                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg">
                                        <Download size={14} /> <span className="hidden sm:inline">Baixar PDF</span>
                                    </button>
                                </div>

                                {/* Actual Receipt - A4/A5 mimic */}
                                <div id="receipt-content-area" className="bg-white shadow-xl w-full max-w-[210mm] min-h-[148mm] mx-auto print:shadow-none print:w-full print:m-0 print:border-none p-8 md:p-12 relative flex flex-col border border-slate-300">

                                    {/* Receipt Header */}
                                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                                        <div className="flex gap-4">
                                            <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                                <Building2 className="text-slate-300" size={32} />
                                            </div>
                                            <div>
                                                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{company.name}</h1>
                                                <p className="text-xs text-slate-500 font-medium max-w-[250px]">{company.address || 'Endereço da Empresa'}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-1">NIF: {company.nif || '000000000'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-lg font-black text-slate-400 uppercase tracking-[0.2em]">RECIBO DE VENCIMENTO</h2>
                                            <p className="text-sm font-bold text-slate-900 mt-2 uppercase">{months[selectedMonth - 1]} / {selectedYear}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Período de Processamento</p>
                                        </div>
                                    </div>

                                    {/* Employee Info */}
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Funcionário</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono bg-white px-1.5 py-0.5 border rounded text-xs text-slate-500">{activeEmployee.id.replace(/\D/g, '').substring(0, 3)}</span>
                                                <p className="text-base font-black text-slate-800 uppercase">{activeEmployee.name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria / Função</p>
                                                <p className="text-xs font-bold text-slate-700 uppercase">{activeEmployee.professionName || 'Geral'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dias Proc.</p>
                                                <p className="text-xs font-bold text-slate-700 uppercase">{daysInMonth} dias</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table Content */}
                                    <div className="flex-1">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-slate-200 text-left">
                                                    <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">Cód</th>
                                                    <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Descrição dos Abonos e Descontos</th>
                                                    <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right w-24">Abonos</th>
                                                    <th className="pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right w-24">Descontos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 divide-dashed">
                                                {/* Earnings */}
                                                <tr className="group hover:bg-slate-50">
                                                    <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">01</td>
                                                    <td className="py-2 pl-2 font-medium text-slate-700">Vencimento Base</td>
                                                    <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(activeSlip.baseSalary).replace('Kz', '')}</td>
                                                    <td className="py-2 text-right text-slate-300">---</td>
                                                </tr>

                                                {activeSlip.allowances > 0 && (
                                                    <tr className="group hover:bg-slate-50">
                                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">02</td>
                                                        <td className="py-2 pl-2 font-medium text-slate-700">Complementos / Outros Abonos</td>
                                                        <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(activeSlip.allowances).replace('Kz', '')}</td>
                                                        <td className="py-2 text-right text-slate-300">---</td>
                                                    </tr>
                                                )}

                                                <tr className="group hover:bg-slate-50">
                                                    <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">S1</td>
                                                    <td className="py-2 pl-2 font-medium text-slate-700">Subsídio de Alimentação</td>
                                                    <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(activeSlip.subsidyFood || 0).replace('Kz', '')}</td>
                                                    <td className="py-2 text-right text-slate-300">---</td>
                                                </tr>

                                                <tr className="group hover:bg-slate-50">
                                                    <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">S2</td>
                                                    <td className="py-2 pl-2 font-medium text-slate-700">Subsídio de Transporte</td>
                                                    <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(activeSlip.subsidyTransport || 0).replace('Kz', '')}</td>
                                                    <td className="py-2 text-right text-slate-300">---</td>
                                                </tr>

                                                {/* Deductions */}
                                                {activeSlip.absences > 0 && (
                                                    <tr className="group hover:bg-slate-50">
                                                        <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">D1</td>
                                                        <td className="py-2 pl-2 font-medium text-slate-700">Faltas Injustificadas ({activeSlip.absences} dias)</td>
                                                        <td className="py-2 text-right text-slate-300">---</td>
                                                        <td className="py-2 text-right font-bold text-red-600">
                                                            -{formatCurrency((activeSlip.baseSalary / 30) * activeSlip.absences).replace('Kz', '')}
                                                        </td>
                                                    </tr>
                                                )}

                                                <tr className="group hover:bg-slate-50">
                                                    <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">D2</td>
                                                    <td className="py-2 pl-2 font-medium text-slate-700">Segurança Social (INSS 3%)</td>
                                                    <td className="py-2 text-right text-slate-300">---</td>
                                                    <td className="py-2 text-right font-bold text-red-600">-{formatCurrency(activeSlip.inss).replace('Kz', '')}</td>
                                                </tr>

                                                <tr className="group hover:bg-slate-50">
                                                    <td className="py-2 text-xs font-bold text-slate-400 text-center bg-slate-50/50">D3</td>
                                                    <td className="py-2 pl-2 font-medium text-slate-700">Imposto sobre Rendimento (IRT)</td>
                                                    <td className="py-2 text-right text-slate-300">---</td>
                                                    <td className="py-2 text-right font-bold text-red-600">-{formatCurrency(activeSlip.irt).replace('Kz', '')}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-slate-900">
                                                    <td colSpan={2} className="pt-4 text-right pr-4 text-xs font-black uppercase text-slate-500 tracking-wider">Totais</td>
                                                    <td className="pt-4 text-right font-black text-slate-800 bg-slate-50 rounded-l-lg py-2">
                                                        {formatCurrency(activeSlip.grossSalary + activeSlip.subsidyFood + activeSlip.subsidyTransport).replace('Kz', '')}
                                                    </td>
                                                    <td className="pt-4 text-right font-black text-red-600 bg-slate-50 rounded-r-lg py-2">
                                                        -{formatCurrency(activeSlip.irt + activeSlip.inss + ((activeSlip.baseSalary / 30) * activeSlip.absences)).replace('Kz', '')}
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
                                            <p className="text-3xl font-black tracking-tight">{formatCurrency(formattedNet)}</p>
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

                                    <div className="mt-8 text-center">
                                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">Processado por Imatec Software System</p>
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                                <FileText size={48} className="mb-4" />
                                <p className="font-bold uppercase tracking-widest text-sm text-center">Selecione um funcionário<br />para visualizar o recibo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryReceiptsModal;
