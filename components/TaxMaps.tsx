import React, { useState, useMemo, useRef } from 'react';
import { Company, SalarySlip, Employee } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Printer, Download, X, Calendar, Search, CheckSquare, Square, Table } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TaxMapsProps {
    company: Company;
    payroll: SalarySlip[]; // All payroll history
    employees: Employee[];
    onClose: () => void;
}

const TaxMaps: React.FC<TaxMapsProps> = ({ company, payroll, employees, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showAnnexGuides, setShowAnnexGuides] = useState(false);
    const [showAnnexProofs, setShowAnnexProofs] = useState(false);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const currentPeriodPayroll = useMemo(() => {
        return payroll.filter(slip => slip.month === selectedMonth && slip.year === selectedYear);
    }, [payroll, selectedMonth, selectedYear]);

    // Calculate totals matching the image structure exactly
    const totals = useMemo(() => {
        const initial = {
            baseSalary: 0,
            subsidyTransport: 0,
            subsidyFood: 0,
            subsidyFamily: 0,
            subsidyHousing: 0,
            otherSubsidies: 0,
            vacation: 0,
            christmas: 0,
            allowances: 0,
            adjustments: 0,
            penalties: 0,
            grossTotal: 0,
            taxableINSS: 0,
            taxableIRT: 0,
            exempt: 0,
            notSubject: 0,
            subject: 0,
            inss3: 0,
            inss8: 0,
            irt: 0,
            netTotal: 0
        };

        return currentPeriodPayroll.reduce((acc, slip) => {
            // Simplified logic for mapping values to the complex image structure
            const sFood = slip.subsidyFood || 0;
            const sTrans = slip.subsidyTransport || 0;
            const sFam = slip.subsidyFamily || 0;
            const sHouse = slip.subsidyHousing || 0;
            const sVac = (slip as any).subsidyVacation || 0;
            const sChrist = (slip as any).subsidyChristmas || 0;

            // Tax bases
            const taxableINSS = slip.baseSalary + slip.allowances + sHouse + sVac + sChrist; // Approx standard
            const taxableIRT = taxableINSS - slip.inss;

            // Subject/Exempt partitioning (example logic matching common rules)
            const foodExempt = Math.min(sFood, 30000);
            const foodSubject = sFood - foodExempt;
            const transExempt = Math.min(sTrans, 30000);
            const transSubject = sTrans - transExempt;

            return {
                ...acc,
                baseSalary: acc.baseSalary + slip.baseSalary,
                subsidyTransport: acc.subsidyTransport + sTrans,
                subsidyFood: acc.subsidyFood + sFood,
                subsidyFamily: acc.subsidyFamily + sFam,
                subsidyHousing: acc.subsidyHousing + sHouse,
                otherSubsidies: acc.otherSubsidies + (slip.bonuses || 0),
                vacation: acc.vacation + sVac,
                christmas: acc.christmas + sChrist,
                allowances: acc.allowances + slip.allowances,
                adjustments: acc.adjustments + (slip.salaryAdjustments || 0),
                penalties: acc.penalties + (slip.penalties || 0),
                grossTotal: acc.grossTotal + slip.grossTotal,
                taxableINSS: acc.taxableINSS + taxableINSS,
                taxableIRT: acc.taxableIRT + taxableIRT,
                // Image columns partitioning
                exempt: acc.exempt + (sFam + sHouse + sVac + sChrist), // Summary of exempt items
                notSubject: acc.notSubject + (foodExempt + transExempt),
                subject: acc.subject + (taxableINSS + foodSubject + transSubject),
                inss3: acc.inss3 + slip.inss,
                inss8: acc.inss8 + (taxableINSS * 0.08),
                irt: acc.irt + slip.irt,
                netTotal: acc.netTotal + slip.netTotal
            };
        }, initial);
    }, [currentPeriodPayroll]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('tax-map-print-area');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`MAPA_GERAL_SALARIOS_${months[selectedMonth - 1]}_${selectedYear}.pdf`);
        } catch (error) {
            console.error('Error generating PDF', error);
            alert('Erro ao gerar PDF');
        }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-100 flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="flex justify-between items-center px-6 py-2 border-b border-slate-300 bg-white shrink-0 print:hidden shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-800 p-2 rounded text-white">
                        <Table size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Mapa Geral de Salários IRT/INSS</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Gestão de Recursos Humanos</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Período</span>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="text-xs font-black text-slate-700 bg-transparent outline-none cursor-pointer"
                        >
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="text-xs font-black text-slate-700 bg-transparent outline-none cursor-pointer"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-black uppercase transition shadow-sm">
                        <Printer size={14} /> Imprimir
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black uppercase transition shadow-sm">
                        <Download size={14} /> PDF
                    </button>
                    <button onClick={onClose} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded transition ml-2">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Print Area Container */}
            <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-200/50 print:p-0 print:bg-white">
                <div id="tax-map-print-area" className="bg-white shadow-2xl p-8 w-[380mm] min-h-[250mm] max-w-full print:shadow-none print:w-full print:p-4 font-sans border border-slate-300 scale-100 origin-top-left">

                    {/* Header Info */}
                    <div className="flex justify-between items-start mb-6 text-[11px] font-bold text-slate-800">
                        <div className="space-y-0.5">
                            <div>Empresa: <span className="font-bold uppercase">{company.name}</span></div>
                            <div>Contribuinte N. <span className="font-bold">{company.nif}</span></div>
                            <div>Numero INSS <span className="font-bold uppercase">{company.inssNumber || '000000'}</span></div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-sm font-black uppercase tracking-tight mb-2">{months[selectedMonth - 1]} de {selectedYear}</span>
                            <div className="w-16 h-px bg-slate-300 mb-1"></div>
                        </div>
                    </div>

                    {/* MAIN TABLE */}
                    <div className="border border-black overflow-hidden relative">
                        {/* Table Header Structure (Complex Grid) - Adjusted cols for better visibility */}
                        <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_1.8fr_1.2fr_1.2fr_3fr_3.5fr_1.5fr_1.8fr_1.1fr] text-[10px] font-black uppercase text-center bg-slate-50/50">

                            {/* No Identificação */}
                            <div className="border-r border-b border-black p-1 flex flex-col justify-between">
                                <span>No Identificação</span>
                                <div className="grid grid-cols-1 text-left mt-2 normal-case font-bold">
                                    <span>B. I.</span>
                                    <span>Contribuinte</span>
                                    <span>INSS Antigo/Novo</span>
                                </div>
                            </div>

                            {/* Exercício */}
                            <div className="border-r border-b border-black p-1 flex flex-col justify-between">
                                <span>Exercício</span>
                                <div className="grid grid-cols-1 text-left mt-2 normal-case font-bold">
                                    <span>Província</span>
                                    <span>Município</span>
                                </div>
                            </div>

                            {/* Data Vinculo */}
                            <div className="border-r border-b border-black p-1 flex flex-col justify-between">
                                <div className="flex justify-between px-1">
                                    <span>Data</span>
                                    <span>Vínculo</span>
                                </div>
                                <div className="grid grid-cols-1 text-left mt-2 normal-case font-bold">
                                    <span>Início</span>
                                    <span>Fim</span>
                                </div>
                            </div>

                            {/* Vencimento Base */}
                            <div className="border-r border-b border-black p-1 flex flex-col justify-between">
                                <span>Vencimento Base</span>
                                <div className="grid grid-cols-1 mt-2 normal-case font-bold">
                                    <span>Dias Base</span>
                                    <span>Vct Base</span>
                                </div>
                            </div>

                            {/* Faltas / Férias */}
                            <div className="border-r border-b border-black flex flex-col">
                                <div className="flex flex-1">
                                    <div className="flex-1 border-r border-black p-1">Faltas</div>
                                    <div className="flex-1 p-1">Férias</div>
                                </div>
                                <div className="grid grid-cols-2 mt-auto border-t border-black normal-case font-bold">
                                    <div className="border-r border-black py-0.5">Dias / Valor</div>
                                    <div className="py-0.5">Dias / Valor</div>
                                </div>
                            </div>

                            {/* Horas Perdidas / Extra */}
                            <div className="border-r border-b border-black flex flex-col">
                                <div className="flex flex-1">
                                    <div className="flex-1 border-r border-black p-1">Horas Perdidas</div>
                                    <div className="flex-1 p-1">Horas Extra</div>
                                </div>
                                <div className="grid grid-cols-2 mt-auto border-t border-black normal-case font-bold">
                                    <div className="border-r border-black flex flex-col">
                                        <span className="border-b border-black py-0.5 px-1 flex justify-between">Hrs<span>Valor</span></span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="border-b border-black py-0.5 px-1 flex justify-between">Hrs<span>Valor</span></span>
                                        <span className="py-0.5">Valor Ferias</span>
                                    </div>
                                </div>
                            </div>

                            {/* Subsídios Header */}
                            <div className="border-r border-b border-black flex flex-col">
                                <div className="p-1 border-b border-black">Subsídios</div>
                                <div className="flex flex-1 normal-case font-bold">
                                    <div className="flex-1 border-r border-black p-1 flex flex-col justify-center">Transporte<br />Alimentação</div>
                                    <div className="flex-1 p-1 flex flex-col justify-center">Alojamento<br />Ab Familia<br />Outros</div>
                                </div>
                            </div>

                            {/* Ajudas de Custo / Vencimentos */}
                            <div className="border-r border-b border-black flex flex-col">
                                <div className="p-4 opacity-0"></div>
                                <div className="flex flex-1 normal-case font-bold mt-auto border-t border-black">
                                    <div className="flex-1 border-r border-black p-1 flex flex-col justify-center">Ajudas de Custo<br />Acertos<br />Penalizações</div>
                                    <div className="flex-1 p-1 flex flex-col justify-center text-right">Vencimentos<br />Antes Impostos<br />Tributavel INSS<br />Tributavel IRT</div>
                                </div>
                            </div>

                            {/* Venct tributável IRT */}
                            <div className="border-r border-b border-black flex flex-col">
                                <div className="p-1 border-b border-black flex flex-col items-center">
                                    <span>Venct tributável IRT</span>
                                </div>
                                <div className="flex flex-1 normal-case font-bold">
                                    <div className="flex-1 border-r border-black p-1 flex flex-col justify-center">Isento<br />N/Sujeito</div>
                                    <div className="flex-1 p-1 flex items-center justify-center">Sujeito</div>
                                </div>
                            </div>

                            {/* Impostos */}
                            <div className="border-r border-b border-black flex flex-col justify-between">
                                <span className="p-1">Impostos</span>
                                <div className="grid grid-cols-1 mt-auto border-t border-black normal-case font-bold text-center">
                                    <span className="border-b border-black py-0.5">INSS 8%</span>
                                    <span className="border-b border-black py-0.5">INSS 3%</span>
                                    <span className="py-0.5">IRT</span>
                                </div>
                            </div>

                            {/* Vencimento Liquido */}
                            <div className="border-b border-black flex items-center justify-center p-1 font-black">
                                <span>Vencimento Liquido</span>
                            </div>

                        </div>

                        {/* EMPLOYEES LIST OR TOTALS MOCKUP IF EMPTY */}
                        {currentPeriodPayroll.length > 0 ? (
                            <div className="divide-y divide-slate-200">
                                {currentPeriodPayroll.map((slip) => {
                                    const emp = employees.find(e => e.id === slip.employeeId);
                                    return (
                                        <div key={slip.employeeId} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_1.8fr_1.2fr_1.2fr_3fr_3.5fr_1.5fr_1.8fr_1.1fr] text-[10px] font-bold text-slate-800 tracking-tighter hover:bg-slate-50">
                                            {/* Data cells matching header grid */}
                                            <div className="border-r border-slate-200 p-1 flex flex-col">
                                                <span className="uppercase text-[10px] truncate">{emp?.name || slip.employeeName}</span>
                                                <span className="text-slate-500">{emp?.biNumber || '---'}</span>
                                                <span className="text-slate-500">{emp?.nif || '---'}</span>
                                                <span className="text-slate-500">{emp?.ssn || '---'}</span>
                                            </div>
                                            <div className="border-r border-slate-200 p-1 flex flex-col text-slate-500">
                                                <span>{emp?.province || 'Luanda'}</span>
                                                <span>{emp?.municipality || 'Luanda'}</span>
                                            </div>
                                            <div className="border-r border-slate-200 p-1 flex flex-col text-slate-500">
                                                <span>{formatDate(emp?.admissionDate || slip.processedAt || '')}</span>
                                                <span>---</span>
                                            </div>
                                            <div className="border-r border-slate-200 p-1 flex flex-col text-right font-mono">
                                                <span className="opacity-0">.</span>
                                                <span>30</span>
                                                <span>{formatCurrency(slip.baseSalary).replace('Kz', '').trim()}</span>
                                            </div>
                                            <div className="border-r border-slate-200 flex flex-col font-mono text-right">
                                                <div className="flex h-1/2">
                                                    <div className="flex-1 border-r border-slate-100 p-1">0 / 0,00</div>
                                                    <div className="flex-1 p-1">0 / 0,00</div>
                                                </div>
                                                <div className="mt-auto border-t border-slate-100 p-1 opacity-0">.</div>
                                            </div>
                                            <div className="border-r border-slate-200 flex flex-col font-mono text-right">
                                                <div className="flex h-1/2">
                                                    <div className="flex-1 border-r border-slate-100 p-1 px-2 flex justify-between">0<span>0,00</span></div>
                                                    <div className="flex-1 p-1 px-2 flex justify-between">0<span>0,00</span></div>
                                                </div>
                                                <div className="mt-auto border-t border-slate-100 p-1">0,00</div>
                                            </div>
                                            <div className="border-r border-slate-200 flex flex-col font-mono text-right">
                                                <div className="flex h-full">
                                                    <div className="flex-1 border-r border-slate-100 p-1 flex flex-col justify-center">
                                                        <span>{formatCurrency(slip.subsidyTransport || 0).replace('Kz', '').trim()}</span>
                                                        <span>{formatCurrency(slip.subsidyFood || 0).replace('Kz', '').trim()}</span>
                                                    </div>
                                                    <div className="flex-1 p-1 flex flex-col justify-center">
                                                        <span>{formatCurrency(slip.subsidyHousing || 0).replace('Kz', '').trim()}</span>
                                                        <span>{formatCurrency(slip.subsidyFamily || 0).replace('Kz', '').trim()}</span>
                                                        <span>0,00</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-r border-slate-200 flex flex-col font-mono text-right">
                                                <div className="flex h-full mt-auto">
                                                    <div className="flex-1 border-r border-slate-100 p-1 flex flex-col justify-end">
                                                        <span>{formatCurrency(slip.allowances || 0).replace('Kz', '').trim()}</span>
                                                        <span>{formatCurrency(slip.salaryAdjustments || 0).replace('Kz', '').trim()}</span>
                                                        <span className="text-red-500">-{formatCurrency(slip.penalties || 0).replace('Kz', '').trim()}</span>
                                                    </div>
                                                    <div className="flex-1 p-1 flex flex-col justify-end">
                                                        <span>{formatCurrency(slip.grossTotal).replace('Kz', '').trim()}</span>
                                                        <span className="text-slate-400">---</span>
                                                        <span className="text-slate-400">---</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-r border-slate-200 flex flex-col font-mono text-right">
                                                <div className="flex-1 border-slate-100 p-1 flex flex-col justify-center">
                                                    <span>{formatCurrency(slip.subsidies).replace('Kz', '').trim()}</span>
                                                    <span>0,00</span>
                                                </div>
                                                <div className="flex-1 p-1 flex items-center justify-end font-black py-2">
                                                    {formatCurrency(slip.grossTotal - slip.subsidies).replace('Kz', '').trim()}
                                                </div>
                                            </div>
                                            <div className="border-r border-slate-200 flex flex-col font-mono text-right bg-slate-50/30">
                                                <span className="border-b border-slate-200 py-1 px-1">{(slip.grossTotal * 0.08).toPrecision(4).replace('.', ',')}</span>
                                                <span className="border-b border-slate-200 py-1 px-1">{formatCurrency(slip.inss).replace('Kz', '').trim()}</span>
                                                <span className="py-1 px-1 text-red-600">{formatCurrency(slip.irt).replace('Kz', '').trim()}</span>
                                            </div>
                                            <div className="bg-blue-50/40 font-black text-right p-1 flex items-center justify-end text-sm tracking-tighter">
                                                {formatCurrency(slip.netTotal).replace('Kz', '').trim()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-slate-300 font-bold italic">
                                Sem dados para o período selecionado
                            </div>
                        )}

                        {/* TOTALS ROW - MATCHING IMAGE */}
                        <div className="bg-[#f0f0f0] border-t-2 border-black">
                            <div className="p-1 px-4 text-[11px] font-black uppercase text-slate-700">Valores Totais mensais</div>
                            <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_1.8fr_1.2fr_1.2fr_3fr_3.5fr_1.5fr_1.8fr_1.1fr] text-[11px] font-black py-2 tracking-tighter">
                                <div></div>
                                <div></div>
                                <div></div>

                                <div className="text-right font-mono px-2 pr-4">
                                    <span className="block opacity-0">.</span>
                                    <span className="block opacity-0">.</span>
                                    <span>{formatCurrency(totals.baseSalary).replace('Kz', '').trim()}</span>
                                </div>

                                <div className="grid grid-cols-2 text-right font-mono px-1">
                                    <span>0 / 0,00</span>
                                    <span>0 / 0,00</span>
                                </div>

                                <div className="text-right font-mono pr-2">
                                    <div className="flex justify-between border-b border-slate-300 pb-0.5 px-2"><span>0</span><span>0,00</span></div>
                                    <div className="flex justify-between px-2"><span>0</span><span>0,00</span></div>
                                    <div className="bg-slate-200/50 mt-1">0,00</div>
                                </div>

                                <div className="flex text-right font-mono">
                                    <div className="flex-1 border-r border-slate-300 pr-1 flex flex-col justify-center">
                                        <span>{formatCurrency(totals.subsidyTransport).replace('Kz', '').trim()}</span>
                                        <span>{formatCurrency(totals.subsidyFood).replace('Kz', '').trim()}</span>
                                    </div>
                                    <div className="flex-1 pr-1 flex flex-col justify-center">
                                        <span>{formatCurrency(totals.subsidyHousing).replace('Kz', '').trim()}</span>
                                        <span>{formatCurrency(totals.subsidyFamily).replace('Kz', '').trim()}</span>
                                        <span>{formatCurrency(totals.otherSubsidies).replace('Kz', '').trim()}</span>
                                    </div>
                                </div>

                                <div className="flex text-right font-mono">
                                    <div className="flex-1 border-r border-slate-300 pr-1 flex flex-col justify-center">
                                        <span>{formatCurrency(totals.allowances).replace('Kz', '').trim()}</span>
                                        <span>{formatCurrency(totals.adjustments).replace('Kz', '').trim()}</span>
                                        <span className="text-red-600">-{formatCurrency(totals.penalties).replace('Kz', '').trim()}</span>
                                    </div>
                                    <div className="flex-1 pr-1 flex flex-col justify-center text-[11px] font-black">
                                        <span>{formatCurrency(totals.grossTotal).replace('Kz', '').trim()}</span>
                                        <span className="text-slate-400 opacity-0">---</span>
                                        <span className="text-slate-400 opacity-0">---</span>
                                    </div>
                                </div>

                                <div className="flex flex-col text-right font-mono">
                                    <div className="flex-1 pr-1 border-b border-slate-300 flex flex-col justify-center">
                                        <span>{formatCurrency(totals.exempt).replace('Kz', '').trim()}</span>
                                        <span>{formatCurrency(totals.notSubject).replace('Kz', '').trim()}</span>
                                    </div>
                                    <div className="flex-1 pr-1 flex items-center justify-end font-black py-1">
                                        {formatCurrency(totals.subject).replace('Kz', '').trim()}
                                    </div>
                                </div>

                                <div className="text-right font-mono bg-white/50 border-r border-slate-300">
                                    <div className="border-b border-slate-300 py-1 pr-1">{(totals.inss8).toFixed(2).replace('.', ',')}</div>
                                    <div className="border-b border-slate-300 py-1 pr-1">{formatCurrency(totals.inss3).replace('Kz', '').trim()}</div>
                                    <div className="py-1 pr-1 text-red-600">{formatCurrency(totals.irt).replace('Kz', '').trim()}</div>
                                </div>

                                <div className="text-right font-black px-2 pr-4 text-sm flex items-center justify-end bg-blue-100/50">
                                    {formatCurrency(totals.netTotal).replace('Kz', '').trim()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER SECTION MATCHING IMAGE */}
                    <div className="mt-8 flex justify-between items-start">
                        {/* Summary & Checkboxes Left */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-24">
                                <div className="text-[12px] font-black uppercase text-slate-800 tracking-tight">
                                    MAPA GERAL SALARIOS IRT/INSS<br />
                                    {months[selectedMonth - 1]} de {selectedYear}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setShowAnnexGuides(!showAnnexGuides)}>
                                        <div className="text-slate-900">
                                            {showAnnexGuides ? <CheckSquare size={22} className="text-blue-600" fill="currentColor" fillOpacity={0.1} /> : <Square size={22} className="text-slate-300" />}
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">Anexo Guias de Pagamento</span>
                                    </div>
                                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setShowAnnexProofs(!showAnnexProofs)}>
                                        <div className="text-slate-900">
                                            {showAnnexProofs ? <CheckSquare size={22} className="text-blue-600" fill="currentColor" fillOpacity={0.1} /> : <Square size={22} className="text-slate-300" />}
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">Anexo Comprovativos Pagamento</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grand Totals Right */}
                        <div className="bg-slate-50 border-2 border-slate-800 p-4 min-w-[320px] shadow-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center gap-8">
                                    <span className="text-[11px] font-black uppercase tracking-tight">Total Salarios a Liquidar</span>
                                    <span className="text-sm font-black font-mono">{formatCurrency(totals.netTotal).replace('Kz', 'akz')}</span>
                                </div>
                                <div className="flex justify-between items-center gap-8">
                                    <span className="text-[11px] font-black uppercase tracking-tight">Total Imposto IRT a pagar</span>
                                    <span className="text-sm font-black font-mono">{formatCurrency(totals.irt).replace('Kz', 'akz')}</span>
                                </div>
                                <div className="flex justify-between items-center gap-8">
                                    <span className="text-[11px] font-black uppercase tracking-tight">Total Imposto INSS a pagar</span>
                                    <span className="text-sm font-black font-mono">{formatCurrency(totals.inss8 + totals.inss3).replace('Kz', 'akz')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-4">
                        Processado por sistema soft-imatec v2.0
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TaxMaps;
