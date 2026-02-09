
import React, { useState, useMemo } from 'react';
import { SalarySlip, Employee, Company } from '../types';
import { formatCurrency, exportToExcel, formatDate } from '../utils';
import {
    Printer, Download, FileText, X, FileJson,
    FileSpreadsheet, Calendar, ChevronDown, CheckCircle2
} from 'lucide-react';

interface SalaryMapIRTINSSProps {
    payroll: SalarySlip[];
    employees: Employee[];
    company: Company;
    onClose: () => void;
}

const SalaryMapIRTINSS: React.FC<SalaryMapIRTINSSProps> = ({ payroll, employees, company, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

    // Totals
    const totals = useMemo(() => {
        return currentPeriodSlips.reduce((acc, slip) => ({
            base: acc.base + (slip.baseSalary || 0),
            food: acc.food + (slip.subsidyFood || 0),
            transp: acc.transp + (slip.subsidyTransport || 0),
            family: acc.family + (slip.subsidyFamily || 0),
            vacation: acc.vacation + (slip.subsidyVacation || 0),
            christmas: acc.christmas + (slip.subsidyChristmas || 0),
            others: acc.others + (slip.allowances || 0) + (slip.bonuses || 0),
            gross: acc.gross + (slip.grossTotal || 0),
            inssEmp: acc.inssEmp + (slip.inss || 0),
            irt: acc.irt + (slip.irt || 0),
            net: acc.net + (slip.netTotal || 0),
            inssEntity: acc.inssEntity + ((slip.baseSalary || 0) * 0.08)
        }), {
            base: 0, food: 0, transp: 0, family: 0, vacation: 0, christmas: 0,
            others: 0, gross: 0, inssEmp: 0, irt: 0, net: 0, inssEntity: 0
        });
    }, [currentPeriodSlips]);

    const handleDownloadXLSX = () => {
        const data = currentPeriodSlips.map((s, idx) => ({
            'Nº': idx + 1,
            'Nome Completo': s.employeeName,
            'Função': s.employeeRole,
            'Salário Base': s.baseSalary,
            'Sub. Alimentação': s.subsidyFood,
            'Sub. Transporte': s.subsidyTransport,
            'Sub. Família': s.subsidyFamily,
            'Sub. Férias': s.subsidyVacation,
            'Sub. Natal': s.subsidyChristmas,
            'Outros Abonos': s.allowances + s.bonuses,
            'Total Ilíquido': s.grossTotal,
            'INSS (3%)': s.inss,
            'IRT': s.irt,
            'Total Descontos': s.inss + s.irt + (s.penalties || 0),
            'Salário Líquido': s.netTotal,
            'SS Patronal (8%)': s.baseSalary * 0.08
        }));
        exportToExcel(data, `Mapa_Salarios_${months[selectedMonth - 1]}_${selectedYear}`);
    };

    const handleDownloadTXT = () => {
        const content = currentPeriodSlips.map(s =>
            `${s.employeeId}|${s.employeeName}|${s.baseSalary.toFixed(2)}|${s.inss.toFixed(2)}`
        ).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `INSS_${months[selectedMonth - 1]}_${selectedYear}.txt`;
        a.click();
    };

    const handleDownloadXML = () => {
        const content = `<?xml version="1.0" encoding="UTF-8"?>
<PayrollReport>
    <Company>${company.name}</Company>
    <Year>${selectedYear}</Year>
    <Month>${selectedMonth}</Month>
    <Employees>
        ${currentPeriodSlips.map(s => `
        <Employee>
            <Name>${s.employeeName}</Name>
            <Gross>${s.grossTotal}</Gross>
            <IRT>${s.irt}</IRT>
        </Employee>`).join('')}
    </Employees>
</PayrollReport>`;
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AGT_IRT_${months[selectedMonth - 1]}_${selectedYear}.xml`;
        a.click();
    };

    const formatMoney = (val: number) => {
        if (!val) return '0,00';
        return val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[98vw] h-[95vh] flex flex-col overflow-hidden">

                {/* Header Controls (No Print) */}
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center print:hidden shrink-0">
                    <div className="flex items-center gap-4">
                        <FileSpreadsheet className="text-emerald-400" size={24} />
                        <div>
                            <h2 className="text-lg font-bold uppercase">Mapa Geral de Salários IRT/INSS</h2>
                            <p className="text-xs text-slate-400">{company.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-700 rounded p-1">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer px-2"
                            >
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer px-2 border-l border-slate-600"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <button onClick={handleDownloadTXT} className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold uppercase" title="INSS TXT">TXT</button>
                        <button onClick={handleDownloadXML} className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold uppercase" title="AGT XML">XML</button>
                        <button onClick={handleDownloadXLSX} className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold uppercase flex items-center gap-1">
                            <Download size={14} /> Excel
                        </button>
                        <button onClick={() => window.print()} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold uppercase flex items-center gap-1">
                            <Printer size={14} /> Imprimir
                        </button>
                        <button onClick={onClose} className="p-2 bg-red-600 hover:bg-red-500 rounded">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Printable Map Area */}
                <div className="flex-1 overflow-auto bg-white p-8 print:p-0 custom-scrollbar">
                    <div className="min-w-[297mm] mx-auto print:w-full">
                        {/* Print Header */}
                        <div className="mb-6 border-b-2 border-black pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-xl font-black uppercase text-black">{company.name}</h1>
                                    <p className="text-xs font-bold uppercase">Contribunte: {company.nif}</p>
                                    <p className="text-xs font-bold uppercase">Endereço: {company.address}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-lg font-black uppercase">MAPA DE SALÁRIOS</h2>
                                    <p className="text-sm font-bold uppercase">{months[selectedMonth - 1]} de {selectedYear}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dense Table */}
                        <table className="w-full border-collapse border border-black text-[10px] font-sans">
                            <thead>
                                <tr className="bg-gray-200 text-black uppercase tracking-tight">
                                    <th className="border border-black p-1 w-8 text-center bg-gray-300">Nº</th>
                                    <th className="border border-black p-1 text-left min-w-[150px] bg-gray-300">Nome Completo</th>
                                    <th className="border border-black p-1 text-left bg-gray-300">Categoria</th>
                                    <th className="border border-black p-1 text-right bg-gray-300">Venc. Base</th>

                                    {/* Subsidies Group */}
                                    <th className="border border-black p-1 text-right bg-gray-100">Aliment.</th>
                                    <th className="border border-black p-1 text-right bg-gray-100">Transp.</th>
                                    <th className="border border-black p-1 text-right bg-gray-100">Família</th>
                                    <th className="border border-black p-1 text-right bg-gray-100">Férias</th>
                                    <th className="border border-black p-1 text-right bg-gray-100">Natal</th>
                                    <th className="border border-black p-1 text-right bg-gray-100">Outros</th>

                                    <th className="border border-black p-1 text-right font-black bg-gray-300">Total Ilíquido</th>

                                    <th className="border border-black p-1 text-right bg-gray-100">INSS (3%)</th>
                                    <th className="border border-black p-1 text-right bg-gray-100">IRT</th>
                                    <th className="border border-black p-1 text-right bg-gray-100">Faltas</th>

                                    <th className="border border-black p-1 text-right font-black bg-gray-300">Líquido</th>
                                    <th className="border border-black p-1 text-right italic bg-gray-50">SS (8%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPeriodSlips.length > 0 ? (
                                    currentPeriodSlips.map((slip, index) => (
                                        <tr key={slip.id} className="border-b border-black hover:bg-gray-50">
                                            <td className="border border-black p-1 text-center">{index + 1}</td>
                                            <td className="border border-black p-1 font-bold whitespace-nowrap">{slip.employeeName}</td>
                                            <td className="border border-black p-1 truncate max-w-[100px]">{slip.employeeRole}</td>
                                            <td className="border border-black p-1 text-right">{formatMoney(slip.baseSalary)}</td>

                                            <td className="border border-black p-1 text-right text-gray-700">{formatMoney(slip.subsidyFood)}</td>
                                            <td className="border border-black p-1 text-right text-gray-700">{formatMoney(slip.subsidyTransport)}</td>
                                            <td className="border border-black p-1 text-right text-gray-700">{formatMoney(slip.subsidyFamily)}</td>
                                            <td className="border border-black p-1 text-right text-gray-700">{formatMoney(slip.subsidyVacation)}</td>
                                            <td className="border border-black p-1 text-right text-gray-700">{formatMoney(slip.subsidyChristmas)}</td>
                                            <td className="border border-black p-1 text-right text-gray-700">{formatMoney((slip.allowances || 0) + (slip.bonuses || 0))}</td>

                                            <td className="border border-black p-1 text-right font-bold bg-gray-100">{formatMoney(slip.grossTotal)}</td>

                                            <td className="border border-black p-1 text-right text-red-700">{formatMoney(slip.inss)}</td>
                                            <td className="border border-black p-1 text-right text-red-700">{formatMoney(slip.irt)}</td>
                                            <td className="border border-black p-1 text-right text-red-700">{formatMoney((slip.baseSalary / 30) * slip.absences)}</td>

                                            <td className="border border-black p-1 text-right font-black bg-gray-100 border-l-2">{formatMoney(slip.netTotal)}</td>
                                            <td className="border border-black p-1 text-right italic text-gray-500">{formatMoney(slip.baseSalary * 0.08)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={16} className="p-10 text-center text-gray-400 font-bold uppercase">Sem dados para este período</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-black text-white font-bold uppercase text-[10px]">
                                    <td colSpan={3} className="border border-black p-2 text-center text-blue-300">TOTAIS GERAIS</td>
                                    <td className="border border-white p-2 text-right">{formatMoney(totals.base)}</td>
                                    <td className="border border-white p-2 text-right">{formatMoney(totals.food)}</td>
                                    <td className="border border-white p-2 text-right">{formatMoney(totals.transp)}</td>
                                    <td className="border border-white p-2 text-right">{formatMoney(totals.family)}</td>
                                    <td className="border border-white p-2 text-right">{formatMoney(totals.vacation)}</td>
                                    <td className="border border-white p-2 text-right">{formatMoney(totals.christmas)}</td>
                                    <td className="border border-white p-2 text-right">{formatMoney(totals.others)}</td>
                                    <td className="border border-white p-2 text-right text-blue-300">{formatMoney(totals.gross)}</td>
                                    <td className="border border-white p-2 text-right text-red-300">{formatMoney(totals.inssEmp)}</td>
                                    <td className="border border-white p-2 text-right text-red-300">{formatMoney(totals.irt)}</td>
                                    <td className="border border-white p-2 text-right"></td>
                                    <td className="border border-white p-2 text-right text-green-300">{formatMoney(totals.net)}</td>
                                    <td className="border border-white p-2 text-right text-gray-400">{formatMoney(totals.inssEntity)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Signatures */}
                        <div className="mt-12 grid grid-cols-3 gap-10">
                            <div className="text-center">
                                <p className="border-t border-black pt-2 font-bold uppercase text-[10px]">Elaborado Por</p>
                            </div>
                            <div className="text-center">
                                <p className="border-t border-black pt-2 font-bold uppercase text-[10px]">Verificado Por</p>
                            </div>
                            <div className="text-center">
                                <p className="border-t border-black pt-2 font-bold uppercase text-[10px]">Aprovado Por</p>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @media print {
                        @page { size: A4 landscape; margin: 10mm; }
                        body { background: white; }
                        .print\\:hidden { display: none !important; }
                        .print\\:w-full { width: 100% !important; max-width: none !important; }
                        .print\\:p-0 { padding: 0 !important; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default SalaryMapIRTINSS;
