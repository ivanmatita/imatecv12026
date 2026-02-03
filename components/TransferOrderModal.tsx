import React, { useState, useRef } from 'react';
import { Company, Employee, SalarySlip } from '../types';
import { formatCurrency, formatDate, roundToNearestBank } from '../utils';
import { X, Printer, Download, Calendar, Send, CreditCard, User, Eye, Edit, Trash2, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TransferOrderModalProps {
    company: Company;
    payroll: SalarySlip[];
    employees: Employee[];
    onClose: () => void;
}

const TransferOrderModal: React.FC<TransferOrderModalProps> = ({ company, payroll, employees, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');

    const groupedOrders = React.useMemo(() => {
        const groups: Record<string, { month: number, year: number, count: number, total: number }> = {};
        payroll.forEach(slip => {
            const key = `${slip.month}-${slip.year}`;
            if (!groups[key]) {
                groups[key] = {
                    month: slip.month || 0,
                    year: slip.year || 0,
                    count: 0,
                    total: 0
                };
            }
            groups[key].count++;
            groups[key].total += slip.netTotal;
        });
        return Object.values(groups).sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
    }, [payroll]);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Filter slips for the selected period
    const filteredSlips = payroll.filter(slip =>
        slip.month === selectedMonth &&
        slip.year === selectedYear
    );

    const totalAmount = filteredSlips.reduce((sum, slip) => sum + slip.netTotal, 0);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('transfer-order-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`ORDEM_TRANSFERENCIA_${selectedMonth}_${selectedYear}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF');
        }
    };

    if (viewMode === 'LIST') {
        return (
            <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-hidden animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[85vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Ordens de Transferência</h2>
                            <p className="text-sm text-slate-500">Histórico de processamentos bancários</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSelectedMonth(new Date().getMonth() + 1);
                                    setSelectedYear(new Date().getFullYear());
                                    setViewMode('DETAIL');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                            >
                                <Plus size={16} /> Nova Ordem
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* List Content */}
                    <div className="overflow-auto p-6 bg-slate-50 flex-1">
                        {groupedOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">Nenhuma ordem encontrada</h3>
                                <p className="text-slate-500">Processe salários para gerar ordens de transferência.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {groupedOrders.map((order, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">
                                                    {months[order.month - 1]} de {order.year}
                                                </h3>
                                                <div className="flex gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1"><User size={14} /> {order.count} Colaboradores</span>
                                                    <span className="font-mono font-bold text-slate-600">{formatCurrency(order.total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedMonth(order.month);
                                                    setSelectedYear(order.year);
                                                    setViewMode('DETAIL');
                                                }}
                                                className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    alert('Esta funcionalidade apenas simula a remoção da visualização. Os dados de salário permanecerão salvos.')
                                                }}
                                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                                                title="Apagar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedMonth(order.month);
                                                    setSelectedYear(order.year);
                                                    setViewMode('DETAIL');
                                                }}
                                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition tooltip-trigger"
                                                title="Ver Transferência"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedMonth(order.month);
                                                    setSelectedYear(order.year);
                                                    setViewMode('DETAIL');
                                                    setTimeout(() => window.print(), 500);
                                                }}
                                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                                                title="Imprimir"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-full md:h-[95vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

                {/* Modern Toolbar */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white shrink-0 print:hidden shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition mr-2">
                            <Calendar size={20} />
                        </button>
                        <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200">
                            <Send size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Ordem de Transferência</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Pagamento Bancário de Salários</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-bold">
                            <span className="text-slate-400 uppercase tracking-tighter">Período:</span>
                            <div className="flex gap-2">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="bg-transparent outline-none cursor-pointer text-slate-700"
                                >
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="bg-transparent outline-none cursor-pointer text-slate-700"
                                >
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest transition shadow-xl shadow-slate-200 group">
                                <Printer size={16} className="group-hover:scale-110 transition-transform" /> Imprimir
                            </button>
                            <button onClick={() => setViewMode('LIST')} className="px-4 py-2 text-slate-600 font-bold text-xs uppercase hover:bg-slate-100 rounded-full transition">
                                Voltar
                            </button>
                            <button onClick={onClose} className="p-2 bg-red-100/50 hover:bg-red-100 text-red-600 rounded-full transition-colors flex items-center justify-center">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Area */}
                <div className="overflow-auto flex-1 bg-slate-100 p-4 md:p-12 print:p-0 print:bg-white print:overflow-visible custom-scrollbar">
                    <div id="transfer-order-content" className="bg-white shadow-2xl mx-auto p-12 w-[210mm] min-h-[297mm] print:shadow-none print:m-0 print:w-full font-serif border border-slate-200">

                        {/* Document Header */}
                        <div className="mb-12 border-b-4 border-slate-900 pb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">ORDEM DE<br />TRANSFERÊNCIA</h1>
                                <p className="mt-2 text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Documento de Instrução Bancária</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-slate-900">A DIRECÇÃO</div>
                                <div className="mt-4 space-y-1 text-xs font-bold text-slate-600">
                                    <div className="flex justify-end gap-2">
                                        <span className="text-slate-400">REF Nº :</span>
                                        <span>{`1250.1/${String(new Date().getDate()).padStart(2, '0')}${String(selectedMonth).padStart(2, '0')}${selectedYear}`}</span>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <span className="text-slate-400">DATA :</span>
                                        <span>{new Date().toLocaleDateString('pt-PT')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Total de Transferências</span>
                                <div className="text-3xl font-black text-slate-900">{filteredSlips.length}</div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Montante Global</span>
                                <div className="text-3xl font-black text-white">{formatCurrency(totalAmount).replace('Kz', '')} <span className="text-sm font-bold opacity-50">AKZ</span></div>
                            </div>
                        </div>

                        {/* List of Beneficiaries */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-100 pb-2">Beneficiários e Contas</h3>
                            {filteredSlips.length > 0 ? filteredSlips.map((slip, index) => {
                                const emp = employees.find(e => e.id === slip.employeeId);
                                return (
                                    <div key={slip.id} className="group relative border-b border-slate-100 pb-6 last:border-0 page-break-inside-avoid animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                        {index + 1}
                                                    </div>
                                                    <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">{slip.employeeName}</h4>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm px-12">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instituição Bancária</span>
                                                            <span className="font-bold text-slate-700">{emp?.bankName || "DEPÓSITO BANCÁRIO"}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nº de Conta</span>
                                                            <span className="font-mono font-bold text-slate-700">{emp?.bankAccount || "------------------"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IBAN</span>
                                                            <span className="font-mono font-bold text-slate-700">{emp?.iban || "---------------------------------"}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descrição</span>
                                                            <span className="font-bold text-slate-600 text-xs">Vencimento {months[selectedMonth - 1]} / {selectedYear}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm transition-all group-hover:bg-slate-900 group-hover:border-slate-800">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1 group-hover:text-slate-500">Valor Líquido</span>
                                                    <div className="text-xl font-black text-slate-900 group-hover:text-white">
                                                        {formatCurrency(roundToNearestBank(slip.netTotal)).replace('Kz', '')} <span className="text-[10px] opacity-40">AKZ</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 pr-2">
                                                    <span className="text-[8px] font-black text-slate-300 uppercase italic">RefID: {slip.employeeId.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Nenhuma transferência para este período</p>
                                </div>
                            )}
                        </div>

                        {/* Page Numbers / Footer */}
                        <div className="mt-20 flex justify-between items-end border-t border-slate-100 pt-8 opacity-50 grayscale transition hover:grayscale-0 hover:opacity-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase leading-none">
                                <p>Gerado por Soft-Imatec v2.0</p>
                                <p className="mt-1">Página 1 de 1</p>
                            </div>
                            <div className="w-32 h-px bg-slate-300"></div>
                            <div className="text-[10px] font-black text-slate-400 uppercase text-right">
                                <p>{company.name}</p>
                                <p className="mt-1">NIF: {company.nif}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferOrderModal;
