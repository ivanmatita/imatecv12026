import React, { useState, useRef } from 'react';
import { Company, Employee, SalarySlip } from '../types';
import { formatCurrency, numberToExtenso } from '../utils';
import { X, Printer, Download, Calendar } from 'lucide-react';
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
    const [isPrinting, setIsPrinting] = useState(false);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Filter slips for the selected period
    const filteredSlips = payroll.filter(slip =>
        slip.month === selectedMonth &&
        slip.year === selectedYear
    );

    const totalAmount = filteredSlips.reduce((sum, slip) => sum + slip.netSalary, 0);

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
            pdf.save(`Ordem_Transferencia_${selectedMonth}_${selectedYear}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] print:shadow-none print:w-full print:max-h-none print:max-w-none">

                {/* Toolbar - Hidden in Print */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 print:hidden shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800">Ordem de Transferência</h2>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm text-sm">
                            <span className="font-bold text-slate-500 uppercase">Período:</span>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                            >
                                {months.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition">
                            <Printer size={16} /> Imprimir
                        </button>
                        <button onClick={onClose} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="overflow-auto flex-1 bg-slate-100 p-8 print:p-0 print:bg-white print:overflow-visible">
                    <div id="transfer-order-content" className="bg-white shadow-lg mx-auto p-12 max-w-[210mm] min-h-[297mm] print:shadow-none print:m-0 print:w-full font-Arial">

                        {/* Header Section */}
                        <div className="mb-12">
                            <div className="flex justify-center mb-2">
                                <button className="print:hidden border border-slate-400 px-3 py-1 text-xs text-slate-600 rounded">Imprimir</button>
                            </div>

                            <h1 className="text-2xl font-bold uppercase text-left mb-2">ORDEM TRANSFERENCIA</h1>
                            <div className="text-center text-xl mb-8">A Direcção</div>

                            <div className="flex justify-end text-sm font-bold text-slate-800">
                                <div className="grid grid-cols-[160px_1fr] gap-y-1 text-right">
                                    <span className="text-slate-900">N/ Ref Nº :</span>
                                    <span>{`1250.1/${String(new Date().getDate()).padStart(2, '0')}${String(selectedMonth).padStart(2, '0')}${selectedYear}`}</span>

                                    <span className="text-slate-900">Data :</span>
                                    <span>{new Date().toLocaleDateString('pt-PT')}</span>

                                    <span className="text-slate-900">Nº Total Transferencias :</span>
                                    <span>{filteredSlips.length}</span>

                                    <span className="text-slate-900">Montante Total :</span>
                                    <span>{formatCurrency(totalAmount).replace('Kz', '')} akz</span>
                                </div>
                            </div>

                            <div className="border-b-2 border-slate-800 mt-4 mb-8 w-2/3"></div>
                        </div>

                        {/* List of Transfers */}
                        <div className="space-y-6">
                            {filteredSlips.map((slip, index) => {
                                const emp = employees.find(e => e.id === slip.employeeId);
                                const bankName = emp?.bankName || "Pagamento em Mão";
                                const accountNum = emp?.bankAccount || "---";
                                const iban = emp?.iban || "---";

                                return (
                                    <div key={slip.id} className="border-b border-slate-300 pb-6 mb-6 last:border-0 page-break-inside-avoid">
                                        <div className="flex justify-between items-start">
                                            {/* Left Info */}
                                            <div className="flex-1 max-w-2xl">
                                                <div className="grid grid-cols-[100px_1fr] gap-y-1 mb-4 font-serif text-lg">
                                                    <span className="font-medium">Nome</span>
                                                    <span className="font-bold">{slip.employeeName}</span>

                                                    <span className="font-medium">Banco</span>
                                                    <span>{bankName}</span>

                                                    <span className="font-medium">Conta Nº</span>
                                                    <span>{accountNum}</span>

                                                    <span className="font-medium">Iban</span>
                                                    <span>{iban}</span>
                                                </div>

                                                <div className="text-sm border-b border-slate-800 inline-block pb-0.5 mt-2">
                                                    Transferência Salario de {months[selectedMonth - 1]} de {selectedYear} de {slip.employeeName.split(' ')[0]}.
                                                </div>
                                            </div>

                                            {/* Right Amount Box */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-64">
                                                    <div className="bg-slate-100 py-1 px-2 text-center font-bold text-sm text-slate-700">
                                                        Montante a Transferir
                                                    </div>
                                                    <div className="bg-white py-2 px-2 text-center text-xl font-bold">
                                                        {formatCurrency(slip.netSalary).replace('Kz', '')} akz
                                                    </div>
                                                </div>

                                                <div className="text-center">
                                                    <div className="text-5xl font-bold mb-1">{index + 1}</div>
                                                    <div className="border-t border-slate-400 w-full mb-1"></div>
                                                    <div className="text-xs font-medium">IDNF:{slip.employeeId.replace(/\D/g, '')}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkbox */}
                                        <div className="flex justify-end mt-2">
                                            <div className="w-4 h-4 border border-slate-400 rounded-sm"></div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredSlips.length === 0 && (
                                <div className="text-center text-slate-500 py-12">
                                    Nenhuma transferência encontrada para este período.
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
