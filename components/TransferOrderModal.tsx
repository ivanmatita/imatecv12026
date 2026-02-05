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
    initialMonth?: number;
    initialYear?: number;
    initialViewMode?: 'LIST' | 'DETAIL';
}

const TransferOrderModal: React.FC<TransferOrderModalProps> = ({ company, payroll, employees, onClose, initialMonth, initialYear, initialViewMode = 'LIST' }) => {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(initialYear || new Date().getFullYear());
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>(initialViewMode);

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
                <div className="flex justify-center items-center py-4 bg-white print:hidden">
                    <button onClick={handlePrint} className="px-6 py-1 border border-slate-400 rounded hover:bg-slate-100 text-xs text-slate-800">
                        Imprimir
                    </button>
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Area */}
                <div className="overflow-auto flex-1 bg-slate-100 p-4 md:p-12 print:p-0 print:bg-white print:overflow-visible custom-scrollbar">
                    <div id="transfer-order-content" className="bg-white shadow-2xl mx-auto p-12 w-[210mm] min-h-[297mm] print:shadow-none print:m-0 print:w-full font-serif border border-slate-200">

                        {/* Document Header */}
                        <div className="mb-8 flex justify-between items-start">
                            <div className="flex-1 text-center">
                                <h1 className="text-xl font-bold uppercase text-slate-900 ml-32">ORDEM TRANSFERENCIA</h1>
                                <div className="text-md mt-1 text-center font-normal ml-32">A DIRECÇÃO</div>
                            </div>
                            <div className="text-right text-xs font-bold leading-relaxed w-64">
                                <div className="flex justify-between">
                                    <span>N/ Ref Nº :</span>
                                    <span>{`1250.1/${String(new Date().getDate()).padStart(2, '0')}${String(selectedMonth).padStart(2, '0')}${selectedYear}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Data :</span>
                                    <span>{new Date().toLocaleDateString('pt-PT').replace(/\//g, '-')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Nº Total Transferencias :</span>
                                    <span>{filteredSlips.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Montante Total :</span>
                                    <span className="font-black">{formatCurrency(totalAmount).replace('Kz', '')} akz</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-b-2 border-black w-3/4 mx-auto mb-8"></div>

                        {/* List of Beneficiaries - Redesigned to match Exact Image */}
                        <div className="space-y-4">
                            {filteredSlips.length > 0 ? filteredSlips.map((slip, index) => {
                                const emp = employees.find(e => e.id === slip.employeeId);
                                const isBankPayment = emp?.paymentMethod === 'Transferencia'; // heuristic
                                
                                return (
                                    <div key={slip.id} className="relative border-b border-black pb-2 mb-2 last:border-0 page-break-inside-avoid">
                                        <div className="flex justify-between items-end">
                                            {/* Left Information Block */}
                                            <div className="flex-1 text-sm text-slate-900 font-bold space-y-1">
                                                <div className="flex gap-2">
                                                    <span className="w-20">Nome</span>
                                                    <span>{slip.employeeName}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="w-20">Banco</span>
                                                    <span>{isBankPayment && emp?.bankName ? emp.bankName : "Pagamento em Mão"}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="w-20">Conta Nº</span>
                                                    <span>{isBankPayment ? emp?.bankAccount : ''}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="w-20">Iban</span>
                                                    <span>{isBankPayment ? emp?.iban : ''}</span>
                                                </div>
                                                
                                                <div className="pt-2 text-xs font-normal">
                                                    Transferência Salario de {months[selectedMonth - 1]} de {selectedYear} de {slip.employeeName}.
                                                </div>
                                            </div>

                                            {/* Right Amount Block */}
                                            <div className="flex items-end gap-4">
                                                <div className="text-center">
                                                    <div className="bg-gray-200 px-4 py-1 text-xs font-bold uppercase mb-1">
                                                        Montante a Transferir
                                                    </div>
                                                    <div className="text-xl font-bold">
                                                        {formatCurrency(roundToNearestBank(slip.netTotal)).replace('Kz', '')} <span className="text-xs font-normal">akz</span>
                                                    </div>
                                                </div>

                                                {/* Big Number / Index */}
                                                <div className="flex flex-col items-center justify-end pl-4">
                                                    <div className="text-6xl font-black leading-none">{index + 1}</div>
                                                    <div className="text-xs font-bold mt-1">IDNF:{emp?.employeeNumber || (index + 1)}</div>
                                                    <div className="w-6 h-6 border-2 border-slate-800 mt-2"></div>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferOrderModal;
