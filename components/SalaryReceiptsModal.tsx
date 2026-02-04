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
    filterEmployeeIds?: string[];
}

const SalaryReceiptsModal: React.FC<SalaryReceiptsModalProps> = ({ company, payroll, employees, onClose, onGoToProcessing, filterEmployeeIds }) => {
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
        return currentPeriodSlips.filter(slip => {
            const matchesSearch = slip.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = !filterEmployeeIds || filterEmployeeIds.length === 0 || filterEmployeeIds.includes(slip.employeeId);
            return matchesSearch && matchesFilter;
        });
    }, [currentPeriodSlips, searchTerm, filterEmployeeIds]);

    const activeSlip = useMemo(() => {
        if (filteredSlips.length === 0) return null;
        if (!selectedSlipId) return filteredSlips[0];
        return filteredSlips.find(s => s.id === (selectedSlipId as any)) || filteredSlips[0];
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

    const renderReceiptContent = (slip: SalarySlip, emp: Employee, label: 'ORIGINAL' | 'DUPLICADO') => {
        const formatVal = (v: number) => {
            if (!v || v === 0) return '0,00';
            return v.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        const totalVencimento = slip.baseSalary + slip.allowances - (slip.absences * (slip.baseSalary / 30));
        const totalSubsidios = (slip.subsidyFamily || 0) + (slip.subsidyHousing || 0) + (slip.subsidyFood || 0) + (slip.subsidyTransport || 0);
        const totalAntesImpostos = slip.grossTotal;

        return (
            <div className="bg-white p-4 h-full flex flex-col text-[11px] font-sans text-black leading-tight">
                {/* Header Section */}
                <div className="text-center mb-4 pt-2">
                    <h1 className="text-[14px] font-bold tracking-widest uppercase">{company.name}</h1>
                    <p className="font-bold">NIF: {company.nif}</p>
                    <div className="flex justify-between items-end mt-1">
                        <div className="w-1/3"></div>
                        <div className="w-1/3">
                            <p className="text-[10px] font-bold mt-1">{label}</p>
                            <h2 className="text-[12px] font-extrabold uppercase">RECIBO DE VENCIMENTO</h2>
                        </div>
                        <div className="w-1/3 text-right">
                            <p className="font-bold">{months[(slip.month || 1) - 1]} de {slip.year}</p>
                        </div>
                    </div>
                </div>

                {/* Employee Info Section */}
                <div className="grid grid-cols-2 gap-x-12 mb-4 border-t border-black pt-2">
                    <div>
                        <div className="flex gap-2">
                            <span className="font-bold">{emp.employeeNumber || emp.id.substring(0, 2)}</span>
                            <span className="font-bold uppercase">{emp.name}</span>
                        </div>
                        <p className="mt-1 font-bold">Profissão: {emp.professionName || '---'}</p>
                        <p className="font-bold mt-1 text-[9px]">[ Admitido em {emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString('pt-PT') : '---'} ]</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">NIF Nº: {emp.nif || '---'}</p>
                        <p className="font-bold">INSS Nº: {emp.ssn || '00000'}</p>
                    </div>
                </div>

                {/* Table Header */}
                <div className="flex border-b-2 border-black pb-1 mb-1 font-bold">
                    <div className="w-[10%]">COD</div>
                    <div className="w-[50%]">Descrição</div>
                    <div className="w-[15%] text-center">QTD</div>
                    <div className="w-[25%] text-right">VALOR</div>
                </div>

                {/* Table Body */}
                <div className="flex-1 space-y-1">
                    <div className="flex">
                        <div className="w-[10%] text-center">01</div>
                        <div className="w-[50%]">Vencimento Base para a Categoria Profissional</div>
                        <div className="w-[15%] text-center">31</div>
                        <div className="w-[25%] text-right font-medium">{formatVal(slip.baseSalary)}</div>
                    </div>
                    {slip.allowances > 0 && (
                        <div className="flex">
                            <div className="w-[10%] text-center">02</div>
                            <div className="w-[50%]">Complemento Salarial</div>
                            <div className="w-[15%] text-center">27</div>
                            <div className="w-[25%] text-right font-medium">{formatVal(slip.allowances)}</div>
                        </div>
                    )}
                    {slip.absences > 0 && (
                        <div className="flex">
                            <div className="w-[10%] text-center">04</div>
                            <div className="w-[50%]">Abatimento de Faltas ({slip.absences})(Total Horas={slip.absences * 8}Hrs)</div>
                            <div className="w-[15%] text-center">{slip.absences}</div>
                            <div className="w-[25%] text-right font-medium">-{formatVal((slip.baseSalary / 30) * slip.absences)}</div>
                        </div>
                    )}

                    {/* Total Vencimento */}
                    <div className="flex pt-1 border-t border-gray-300">
                        <div className="w-[10%] text-center">07</div>
                        <div className="w-[50%] font-bold">[01+02+03-04+05-06] Total de Vencimento</div>
                        <div className="w-[15%] text-center"></div>
                        <div className="w-[25%] text-right font-bold border-t border-black">{formatVal(totalVencimento)}</div>
                    </div>

                    {/* Subsidies Section */}
                    <div className="mt-4 pl-4">
                        <p className="font-bold">Subsidios</p>
                        <div className="flex">
                            <div className="w-[10%] text-center pl-0">08</div>
                            <div className="w-[50%]">Subsídio de Férias</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[25%] text-right font-medium">{formatVal(0)}</div>
                        </div>
                        <div className="flex">
                            <div className="w-[10%] text-center pl-0">09</div>
                            <div className="w-[50%]">Subsídio de Natal</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[25%] text-right font-medium">{formatVal(0)}</div>
                        </div>
                        <div className="flex">
                            <div className="w-[10%] text-center pl-0">10</div>
                            <div className="w-[50%]">Abono de Familia</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[25%] text-right font-medium">{formatVal(slip.subsidyFamily)}</div>
                        </div>
                        <div className="flex">
                            <div className="w-[10%] text-center pl-0">13</div>
                            <div className="w-[50%]">Subsídio de Alojamento</div>
                            <div className="w-[15%] text-center">Vg</div>
                            <div className="w-[25%] text-right font-medium">{formatVal(slip.subsidyHousing)}</div>
                        </div>
                        {/* Subsídio Alimentação and Transporte should also be here as 11, 12 if needed to match the formula */}
                        {(slip.subsidyFood > 0 || slip.subsidyTransport > 0) && (
                            <div className="flex italic text-gray-500">
                                <div className="w-[10%] text-center">11-12</div>
                                <div className="w-[50%]">Subsidios (Alim./Transp.)</div>
                                <div className="w-[15%] text-center"></div>
                                <div className="w-[25%] text-right">{formatVal(slip.subsidyFood + slip.subsidyTransport)}</div>
                            </div>
                        )}

                        <div className="flex pt-1 border-t border-gray-300 font-bold">
                            <div className="w-[10%] text-center">15</div>
                            <div className="w-[50%]">[08+09+10+11+12+13+14] Total de Subsidios</div>
                            <div className="w-[15%] text-center"></div>
                            <div className="w-[25%] text-right border-t border-black">{formatVal(totalSubsidios)}</div>
                        </div>
                    </div>

                    {/* Total Antes Impostos */}
                    <div className="flex mt-2 font-bold bg-gray-50 px-1">
                        <div className="w-[10%] text-center">18</div>
                        <div className="w-[50%]">[07+15+16-17] Total de Vencimento Antes de Impostos</div>
                        <div className="w-[15%] text-center"></div>
                        <div className="w-[25%] text-right">{formatVal(totalAntesImpostos)}</div>
                    </div>

                    {/* Taxes Section */}
                    <div className="mt-2">
                        <p className="font-bold">Impostos</p>
                        <div className="flex">
                            <div className="w-[10%] text-center">19</div>
                            <div className="w-[50%]">Segurança Social do Trabalhador [18-08]x3%</div>
                            <div className="w-[15%] text-center"></div>
                            <div className="w-[25%] text-right font-medium">{formatVal(slip.inss)}</div>
                        </div>
                        <div className="flex">
                            <div className="w-[10%] text-center">20</div>
                            <div className="w-[50%] uppercase tracking-tighter">IRT [07+[11]&gt;30.000+[12]&gt;30.000+[13]50%+10+16-17-19]</div>
                            <div className="w-[15%] text-center"></div>
                            <div className="w-[25%] text-right font-medium">{formatVal(slip.irt)}</div>
                        </div>
                        <div className="flex pt-1 mt-1 border-t border-black font-bold">
                            <div className="w-[10%] text-center">21</div>
                            <div className="w-[50%]">Vencimento liquido depois de impostos [18-19-20]</div>
                            <div className="w-[15%] text-center"></div>
                            <div className="w-[25%] text-right">{formatVal(slip.netTotal)}</div>
                        </div>
                    </div>

                    {/* Vencimento Liquido Final Row */}
                    <div className="flex mt-4 font-black text-[12px]">
                        <div className="w-[10%] text-center">22</div>
                        <div className="w-[50%]">VENCIMENTO LIQUIDO</div>
                        <div className="w-[15%] text-center"></div>
                        <div className="w-[25%] text-right border-t border-black pt-1">{formatVal(slip.netTotal)}</div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto pt-4">
                    <div className="border-t border-black border-dashed pt-4 flex justify-between items-center font-black text-[12px]">
                        <div className="flex gap-4">
                            <span>24</span>
                            <span className="uppercase tracking-widest">TOTAL A RECEBER [22-23]</span>
                        </div>
                        <div className="w-[25%] text-right border-y-2 border-slate-300 py-1">
                            {formatVal(slip.netTotal)}
                        </div>
                    </div>

                    <div className="mt-12 flex justify-start">
                        <p className="font-bold">Recebi: __________________________________________________</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-0 md:p-2 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[98vw] h-full md:h-[98vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 origin-top transform scale-100 print:hidden">

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
                    <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col print:hidden shadow-inner h-1/3 md:h-auto shrink-0">
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
                                        key={slip.id || slip.employeeId}
                                        onClick={() => setSelectedSlipId((slip as any).id)}
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
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-300">
                        {activeSlip && activeEmployee ? (
                            <div className="w-full flex flex-col items-center">
                                {/* Actions */}
                                <div className="flex gap-2 md:gap-4 mb-6 print:hidden w-full max-w-[210mm] justify-end">
                                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg">
                                        <Printer size={14} /> <span className="hidden sm:inline">Imprimir Duplicado</span>
                                    </button>
                                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg">
                                        <Download size={14} /> <span className="hidden sm:inline">Baixar PDF</span>
                                    </button>
                                </div>

                                {/* DUPLICATE SIDE BY SIDE PREVIEW */}
                                <div id="receipt-content-area" className="flex flex-row w-full max-w-[297mm] h-[148mm] bg-white shadow-2xl print:shadow-none p-0 relative overflow-hidden">
                                    {/* Vertical Dash Line */}
                                    <div className="absolute left-1/2 top-4 bottom-4 border-l border-dashed border-slate-300 z-10"></div>

                                    <div className="w-1/2 border-r border-slate-100 p-2">
                                        {renderReceiptContent(activeSlip, activeEmployee, 'ORIGINAL')}
                                    </div>
                                    <div className="w-1/2 p-2">
                                        {renderReceiptContent(activeSlip, activeEmployee, 'DUPLICADO')}
                                    </div>
                                </div>

                                <div className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-widest text-center print:hidden">
                                    Recibo Gerado para Impressão em A4 (Horizontal/Lado a Lado)
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

            {/* Hidden Print Area - CSS forces this to fill the page */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: landscape; margin: 0; }
                    body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    #receipt-content-area { width: 100% !important; max-width: none !important; border: none !important; box-shadow: none !important; margin: 0 !important; }
                }
            ` }} />
            <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white z-[500]">
                {activeSlip && activeEmployee && (
                    <div className="flex flex-row w-full h-full items-stretch justify-center p-0">
                        <div className="w-1/2 p-2 border-r border-dashed border-black">
                            {renderReceiptContent(activeSlip, activeEmployee, 'ORIGINAL')}
                        </div>
                        <div className="w-1/2 p-2">
                            {renderReceiptContent(activeSlip, activeEmployee, 'DUPLICADO')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryReceiptsModal;
