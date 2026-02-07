import React, { useState, useRef } from 'react';
import { Company, Employee, SalarySlip } from '../types';
import { formatCurrency, formatDate, roundToNearestBank } from '../utils';
import { X, Printer, Download, Calendar, Send, CreditCard, User, Eye, Edit, Trash2, Plus, ArrowRightLeft } from 'lucide-react';
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
            <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white p-6 flex justify-between items-center shadow-lg z-10">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <ArrowRightLeft size={28} className="text-blue-200" />
                                Ordem de Transferência
                            </h2>
                            <p className="text-blue-100 text-sm mt-1 ml-10">Gestão e controlo de pagamentos bancários</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedMonth(new Date().getMonth() + 1);
                                    setSelectedYear(new Date().getFullYear());
                                    setViewMode('DETAIL');
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-bold shadow-md transition"
                            >
                                <Plus size={18} /> Nova Ordem
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-auto bg-slate-50 flex-1 p-6">
                        {groupedOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <Send size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700">Nenhuma ordem encontrada</h3>
                                <p className="text-slate-500 mt-2">Processe salários para gerar ordens de transferência.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Referência</th>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Referente a</th>
                                            <th className="px-6 py-4 text-right">Montante Total</th>
                                            <th className="px-6 py-4 text-center w-40">Opções</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {groupedOrders.map((order, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition duration-150 group">
                                                <td className="px-6 py-4 font-mono font-bold text-slate-600">
                                                    TRF/{order.year}/{String(order.month).padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {new Date(order.year, order.month, 0).toLocaleDateString('pt-PT')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-800">
                                                        Salários de {months[order.month - 1]} {order.year}
                                                    </span>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {order.count} colaboradores incluídos
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">
                                                    {formatCurrency(order.total).replace('AOA', 'Kz')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMonth(order.month);
                                                                setSelectedYear(order.year);
                                                                setViewMode('DETAIL');
                                                            }}
                                                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition tooltip-trigger"
                                                            title="Ver Detalhes"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMonth(order.month);
                                                                setSelectedYear(order.year);
                                                                setViewMode('DETAIL');
                                                            }}
                                                            className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                                                            title="Imprimir"
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                alert('Esta funcionalidade apenas simula a remoção da visualização. Os dados de salário permanecerão salvos.')
                                                            }}
                                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
