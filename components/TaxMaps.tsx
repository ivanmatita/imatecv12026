import React, { useState, useMemo } from 'react';
import { Company, SalarySlip } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Printer, Download, X, Calendar, Search } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TaxMapsProps {
    company: Company;
    payroll: SalarySlip[]; // All payroll history
    onClose: () => void;
}

const TaxMaps: React.FC<TaxMapsProps> = ({ company, payroll, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const currentPeriodPayroll = useMemo(() => {
        return payroll.filter(slip => slip.month === selectedMonth && slip.year === selectedYear);
    }, [payroll, selectedMonth, selectedYear]);

    // Calculate totals similar to the image structure
    const totals = useMemo(() => {
        const initial = {
            baseSalary: 0,
            subsidyTransport: 0,
            subsidyFood: 0,
            subsidyFamily: 0, // Ab Familia in image
            otherSubsidies: 0,
            vacation: 0,
            christmas: 0,
            allowances: 0, // Ajudas de Custo
            adjustments: 0, // Acertos/Penalizações
            grossTaxableINSS: 0, // Antes Impostos / Tributavel INSS
            grossTaxableIRT: 0, // Tibutavel IRT
            exempt: 0, // Isento / N/Sujeito
            inss8: 0, // INSS 8% (Worker)
            inss3: 0, // INSS 3% (Company - usually calculated separately but let's assume standard)
            irt: 0,
            netSalary: 0
        };

        return currentPeriodPayroll.reduce((acc, slip) => {
            const slipExempt = (slip.subsidyFood || 0) + (slip.subsidyTransport || 0);
            const slipTaxable = slip.grossSalary + (slip.subsidyVacation || 0) + (slip.subsidyChristmas || 0) + (slip.allowances || 0);

            return {
                baseSalary: acc.baseSalary + slip.baseSalary,
                subsidyTransport: acc.subsidyTransport + (slip.subsidyTransport || 0),
                subsidyFood: acc.subsidyFood + (slip.subsidyFood || 0),
                subsidyFamily: acc.subsidyFamily + 0, // Placeholder as not in standard types yet
                otherSubsidies: acc.otherSubsidies + (slip.subsidyHousing || 0), // Mapping housing to others for now
                vacation: acc.vacation + (slip.subsidyVacation || 0),
                christmas: acc.christmas + (slip.subsidyChristmas || 0),
                allowances: acc.allowances + (slip.allowances || 0),
                adjustments: acc.adjustments + (slip.salaryAdjustments || 0) - (slip.penalties || 0),
                grossTaxableINSS: acc.grossTaxableINSS + slipTaxable, // Rough approx
                grossTaxableIRT: acc.grossTaxableIRT + (slipTaxable - slip.inss), // IRT Base usually
                exempt: acc.exempt + slipExempt,
                inss8: acc.inss8 + slip.inss,
                inss3: acc.inss3 + (slipTaxable * 0.03), // Estimating comp part
                irt: acc.irt + slip.irt,
                netSalary: acc.netSalary + slip.netSalary
            };
        }, initial);
    }, [currentPeriodPayroll]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('tax-map-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Mapa_IRT_INSS_${months[selectedMonth - 1]}_${selectedYear}.pdf`);
        } catch (error) {
            console.error('Error generating PDF', error);
            alert('Erro ao gerar PDF');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col h-screen w-screen overflow-hidden">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center px-6 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Mapa Mensal de Remunerações (IRT/INSS)</h2>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-lg border border-slate-300 shadow-sm">
                        <span className="text-sm font-bold text-slate-500 uppercase">Período:</span>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="text-base font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:text-blue-600 border-none focus:ring-0"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="text-base font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:text-blue-600 border-none focus:ring-0"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>

                    <div className="h-8 w-px bg-slate-300"></div>

                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium">
                        <Printer size={18} /> Imprimir
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium">
                        <Download size={18} /> PDF
                    </button>
                    <button onClick={onClose} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition" title="Fechar">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content - The Map - Full Size */}
            <div className="flex-1 bg-white p-4 h-full w-full overflow-hidden flex flex-col" id="tax-map-wrapper">
                <div id="tax-map-content" className="w-full h-full flex flex-col bg-white">

                    {/* Simplified Header for Screen View */}
                    <div className="flex justify-between items-end mb-4 px-2 shrink-0">
                        <div>
                            <div className="text-2xl font-bold text-slate-900 uppercase">{company.name}</div>
                            <div className="text-sm text-slate-500 font-mono">NIF: {company.nif}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-slate-800 text-xl uppercase">Mapa de Salários</div>
                            <div className="text-blue-700 font-bold">{months[selectedMonth - 1]} / {selectedYear}</div>
                        </div>
                    </div>

                    {/* Table Container - Auto Sizing */}
                    <div className="flex-1 border-2 border-slate-800 flex flex-col">
                        {/* Table Headers */}
                        <div className="grid grid-cols-[1.2fr_1fr_2fr_1fr_1.2fr_1.8fr_2.5fr_1.5fr_1.5fr_1.2fr] border-b-2 border-slate-800 bg-slate-100 text-xs 2xl:text-sm font-bold shrink-0">

                            {/* Col 1 */}
                            <div className="p-2 border-r border-slate-400 flex flex-col justify-center">
                                <span>No Identificação</span>
                                <div className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">B.I. / NIF / INSS</div>
                            </div>

                            {/* Col 2 */}
                            <div className="p-2 border-r border-slate-400 flex flex-col justify-center">
                                <span>Exercício</span>
                                <div className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">Prov. / Mun.</div>
                            </div>

                            {/* Col 3 */}
                            <div className="p-2 border-r border-slate-400 flex flex-col justify-center">
                                <div className="flex justify-between">
                                    <span>Vínculo</span>
                                    <span>Venc. Base</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 font-normal mt-1 text-center leading-tight">
                                    <span>Início</span><span>Vcto</span><span>Dias</span><span>Valor</span>
                                </div>
                            </div>

                            {/* Col 4 */}
                            <div className="p-2 border-r border-slate-400 text-center flex flex-col justify-center">
                                <span>Faltas</span>
                                <div className="text-[10px] text-slate-500 font-normal mt-1">Hrs/Valor</div>
                            </div>

                            {/* Col 5 */}
                            <div className="p-2 border-r border-slate-400 text-center flex flex-col justify-center">
                                <span>Hrs Extra</span>
                                <div className="text-[10px] text-slate-500 font-normal mt-1">Natal/Férias</div>
                            </div>

                            {/* Col 6 */}
                            <div className="border-r border-slate-400 flex flex-col">
                                <div className="p-1 border-b border-slate-400 text-center bg-slate-200">Subsídios</div>
                                <div className="flex flex-1">
                                    <div className="flex-1 p-1 border-r border-slate-400 flex items-center justify-center text-center text-[10px] text-slate-500 font-normal leading-tight">
                                        Transp.<br />Alim.
                                    </div>
                                    <div className="flex-1 p-1 flex items-center justify-center text-center text-[10px] text-slate-500 font-normal leading-tight">
                                        Fam.<br />Outros
                                    </div>
                                </div>
                            </div>

                            {/* Col 7 */}
                            <div className="border-r border-slate-400 flex flex-col">
                                <div className="p-1 border-b border-slate-400 text-right opacity-0">.</div>
                                <div className="flex flex-1">
                                    <div className="flex-[0.8] p-1 border-r border-slate-400 flex items-center justify-end text-right text-[10px] text-slate-500 font-normal leading-tight">
                                        Outros<br />Acertos
                                    </div>
                                    <div className="flex-[1.2] p-1 flex flex-col justify-center text-right">
                                        <div className="text-[10px] text-slate-500 font-normal leading-tight">
                                            Bruto<br />T. INSS<br />T. IRT
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Col 8 */}
                            <div className="p-2 border-r border-slate-400 text-right flex flex-col justify-center">
                                <span className="text-red-600">IRT</span>
                                <div className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">Isento/Sujeito</div>
                            </div>

                            {/* Col 9 */}
                            <div className="p-2 border-r border-slate-400 text-right flex flex-col justify-center">
                                <span>Impostos</span>
                                <div className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">INSS/IRT</div>
                            </div>

                            {/* Col 10 */}
                            <div className="p-2 bg-blue-50 text-right flex flex-col justify-center">
                                <span>Líquido</span>
                            </div>
                        </div>

                        {/* Rows Area - Empty for now but could list employees */}
                        <div className="flex-1 bg-white overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 uppercase font-bold text-4xl tracking-widest opacity-20 pointer-events-none">
                                {company.name}
                            </div>
                        </div>

                        {/* Totals Row - Fixed at Bottom of Table */}
                        <div className="border-t-2 border-slate-800 bg-slate-50">
                            <div className="p-2 font-bold text-slate-800 text-xs uppercase">Valores Totais Mensais</div>

                            <div className="grid grid-cols-[1.2fr_1fr_2fr_1fr_1.2fr_1.8fr_2.5fr_1.5fr_1.5fr_1.2fr] bg-white py-3 font-bold text-sm leading-relaxed border-t border-slate-300">
                                <div></div>
                                <div></div>

                                <div className="grid grid-cols-4 gap-1 text-right font-mono px-1">
                                    <span></span>
                                    <span className="text-slate-900">{formatCurrency(totals.baseSalary).replace('Kz', '')}</span>
                                    <span></span>
                                    <span></span>
                                </div>

                                <div className="text-right font-mono px-2">0,00</div>

                                <div className="text-right font-mono px-2">0,00</div>

                                <div className="flex text-[11px]">
                                    <div className="flex-1 text-right font-mono px-1 border-r border-dashed border-slate-300">
                                        {formatCurrency(totals.subsidyTransport).replace('Kz', '')}<br />
                                        {formatCurrency(totals.subsidyFood).replace('Kz', '')}
                                    </div>
                                    <div className="flex-1 text-right font-mono px-1">
                                        {formatCurrency(totals.otherSubsidies + totals.subsidyFamily).replace('Kz', '')}<br />
                                        0,00
                                    </div>
                                </div>

                                <div className="flex text-[11px]">
                                    <div className="flex-[0.8] text-right font-mono px-1 border-r border-dashed border-slate-300">
                                        {formatCurrency(totals.allowances + totals.adjustments).replace('Kz', '')}<br />
                                        0,00
                                    </div>
                                    <div className="flex-[1.2] text-right font-mono px-1">
                                        {formatCurrency(totals.grossTaxableINSS + totals.exempt).replace('Kz', '')}<br />
                                        {formatCurrency(totals.grossTaxableINSS).replace('Kz', '')}<br />
                                        {formatCurrency(totals.grossTaxableIRT).replace('Kz', '')}
                                    </div>
                                </div>

                                <div className="text-right font-mono px-2 text-[11px]">
                                    {formatCurrency(totals.exempt).replace('Kz', '')}<br />
                                    0,00
                                </div>

                                <div className="text-right font-mono px-2 text-red-600 text-[11px]">
                                    {formatCurrency(totals.inss8 + totals.inss3).replace('Kz', '')}<br />
                                    {formatCurrency(totals.irt).replace('Kz', '')}
                                </div>

                                <div className="text-right font-mono font-black px-3 text-blue-800 text-lg flex items-center justify-end bg-blue-50">
                                    {formatCurrency(totals.netSalary).replace('Kz', '')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simplified Footer */}
                    <div className="mt-2 text-center text-[10px] text-slate-400 shrink-0">
                        Processado por sistema soft-imatec
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxMaps;
