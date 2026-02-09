
import React, { useState, useMemo } from 'react';
import { SalarySlip, Employee, Company } from '../types';
import { formatCurrency, exportToExcel, formatDate, numberToExtenso, roundToNearestBank, calculateINSS, calculateIRT } from '../utils';
import { Printer, Download, FileText, X, Eye, ArrowLeft, CheckCircle, RefreshCw, Zap, Save, Calculator } from 'lucide-react';

interface SalaryMapProps {
  payroll: SalarySlip[];
  employees: Employee[];
  company: Company;
  onProcess?: (slip: SalarySlip) => void;
  onCancel?: () => void;
}

const SalaryMap: React.FC<SalaryMapProps> = ({ payroll, employees, company, onProcess, onCancel }) => {
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(payroll[0] || null);
  const [isFinalView, setIsFinalView] = useState(false);
  const [manualAdjustment, setManualAdjustment] = useState<number>(0);

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handleManualRecalculate = () => {
    if (!selectedSlip) return;
    const roundedAdjustment = roundToNearestBank(manualAdjustment);
    const newBase = selectedSlip.baseSalary + roundedAdjustment;
    const inss = calculateINSS(newBase, selectedSlip.subsidyFood, selectedSlip.subsidyTransport);
    const irt = calculateIRT(newBase, inss, selectedSlip.subsidyFood, selectedSlip.subsidyTransport);
    const gross = newBase + selectedSlip.allowances + selectedSlip.bonuses + selectedSlip.subsidyFood + selectedSlip.subsidyTransport + selectedSlip.subsidyFamily + selectedSlip.subsidyHousing;
    const net = gross - inss - irt - selectedSlip.advances - (selectedSlip.penalties || 0);

    setSelectedSlip({
        ...selectedSlip,
        baseSalary: newBase,
        grossTotal: gross,
        inss: inss,
        irt: irt,
        netTotal: net
    });
    alert(`Recalculado com ajuste de ${formatCurrency(roundedAdjustment)}`);
  };

  const SlipComponent = ({ slip, copyLabel, isPreview = false }: { slip: SalarySlip, copyLabel: string, isPreview?: boolean }) => {
      const emp = employees.find(e => e.id === slip.employeeId);
      return (
          <div className={`bg-white text-black font-sans p-10 mb-12 border-2 border-slate-200 shadow-xl print:m-0 print:border-none print:shadow-none min-h-[140mm] relative ${isFinalView ? 'w-full' : 'max-w-[210mm]'}`}>
              <div className="flex justify-between items-start mb-10 border-b-2 border-black pb-6">
                 <div>
                    <h1 className="text-xl font-black uppercase tracking-[3px] text-slate-800">Recibo de Salário</h1>
                    <div className="mt-2 text-[10px] font-bold text-slate-700 uppercase">
                        <p>{company.name}</p>
                        <p>NIF: {company.nif}</p>
                        <p>{company.address}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="bg-slate-900 text-white px-4 py-1 rounded font-black text-[10px] uppercase tracking-widest inline-block mb-2">{copyLabel}</div>
                    <p className="text-xs font-black uppercase">{months[(slip.month || 1) - 1]} de {slip.year || 2024}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Colaborador / Agente</p>
                      <h2 className="text-xl font-black uppercase text-slate-900">{slip.employeeName}</h2>
                      <p className="text-[10px] font-bold text-blue-700 uppercase">Cargo: {slip.employeeRole}</p>
                  </div>
                  <div className="text-right space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IDNF / BI</p>
                      <p className="text-sm font-black font-mono">{emp?.biNumber || '---'}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Seg. Social: {emp?.ssn || '---'}</p>
                  </div>
              </div>

              <table className="w-full text-xs mb-8 border-collapse">
                  <thead className="border-b-2 border-black">
                      <tr className="font-black uppercase text-[9px] text-slate-500">
                          <th className="py-2 text-left w-12">Cod</th>
                          <th className="py-2 text-left">Descriçao das Remunerações e Descontos</th>
                          <th className="py-2 text-center w-20">Qtd/Ref</th>
                          <th className="py-2 text-right w-40">Valores (AOA)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      <tr><td className="py-2 font-mono">001</td><td className="py-2">Vencimento Base Mensal</td><td className="py-2 text-center font-bold">{slip.daysWorked || 30} dias</td><td className="py-2 text-right font-black">{formatCurrency(slip.baseSalary).replace('Kz','')}</td></tr>
                      <tr><td className="py-2 font-mono">002</td><td className="py-2">Abonos / Ajustes de Custo</td><td className="py-2 text-center">-</td><td className="py-2 text-right font-black">{formatCurrency(slip.allowances).replace('Kz','')}</td></tr>
                      <tr><td className="py-2 font-mono">003</td><td className="py-2">Subsidio de Alimentação (Isento até 30k)</td><td className="py-2 text-center">{slip.daysService}d</td><td className="py-2 text-right font-black">{formatCurrency(slip.subsidyFood).replace('Kz','')}</td></tr>
                      <tr><td className="py-2 font-mono">004</td><td className="py-2">Subsidio de Transporte (Isento até 30k)</td><td className="py-2 text-center">{slip.daysService}d</td><td className="py-2 text-right font-black">{formatCurrency(slip.subsidyTransport).replace('Kz','')}</td></tr>
                      {slip.overtimeHours! > 0 && <tr><td className="py-2 font-mono">005</td><td className="py-2">Horas Extraordinárias</td><td className="py-2 text-center font-bold">{slip.overtimeHours}h</td><td className="py-2 text-right font-black">{formatCurrency(0).replace('Kz','')}</td></tr>}
                      
                      <tr className="bg-slate-50 font-black"><td colSpan={3} className="py-2 text-right uppercase tracking-widest text-[10px]">Total de Rendimentos Brutos</td><td className="py-2 text-right text-sm">{formatCurrency(slip.grossTotal).replace('Kz','')}</td></tr>
                      
                      <tr><td className="py-2 font-mono text-red-600">D01</td><td className="py-2 text-red-600 font-bold">Segurança Social (3%)</td><td className="py-2 text-center">3%</td><td className="py-2 text-right font-black text-red-600">-{formatCurrency(slip.inss).replace('Kz','')}</td></tr>
                      <tr><td className="py-2 font-mono text-red-600">D02</td><td className="py-2 text-red-600 font-bold">IRT (Tabela Progressiva 2024)</td><td className="py-2 text-center">%</td><td className="py-2 text-right font-black text-red-600">-{formatCurrency(slip.irt).replace('Kz','')}</td></tr>
                      {slip.advances > 0 && <tr><td className="py-2 font-mono text-red-600">D03</td><td className="py-2 text-red-600">Adiantamentos / Empréstimos</td><td className="py-2 text-center">-</td><td className="py-2 text-right font-black text-red-600">-{formatCurrency(slip.advances).replace('Kz','')}</td></tr>}
                  </tbody>
              </table>

              <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center shadow-xl mb-8">
                  <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[4px] mb-1">Liquido a Receber</p>
                      <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(slip.netTotal)}</h3>
                  </div>
                  <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase italic mb-1">{numberToExtenso(slip.netTotal)}</p>
                      <div className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">Confirmado</div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-16 mt-12 pt-8 border-t-2 border-slate-100 text-center font-black text-[10px] uppercase tracking-widest">
                  <div><div className="h-px bg-slate-300 mb-2 w-48 mx-auto"></div>O Trabalhador</div>
                  <div><div className="h-px bg-slate-300 mb-2 w-48 mx-auto"></div>O Empregador (Carimbo/Ass.)</div>
              </div>

              <div className="mt-12 text-center text-[7px] text-slate-300 font-mono uppercase tracking-[4px]">
                  Processado por software certificado n. 25/AGT/2019 • IMATEC SOFTWARE V.2.0
              </div>
          </div>
      );
  };

  if (!selectedSlip) return <div className="p-20 text-center text-slate-300 font-black uppercase italic tracking-[5px]">A carregar dados do recibo...</div>;

  return (
    <div className="bg-slate-100 min-h-screen animate-in fade-in flex flex-col font-sans">
        <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center shadow-md print:hidden">
            <div className="flex items-center gap-4">
                <button onClick={onCancel} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition shadow-inner"><ArrowLeft size={20}/></button>
                <div><h1 className="text-lg font-black uppercase tracking-tighter text-slate-800">Gestão de Recibos</h1><p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Visualização e Ajustes Pré-Processamento</p></div>
            </div>
            
            {!isFinalView && (
                <div className="flex items-center gap-4 bg-blue-50 px-4 py-1.5 rounded-2xl border border-blue-100">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-blue-400">Ajuste Manual (Arredondar)</span>
                        <input 
                            type="number" 
                            className="bg-transparent font-black text-blue-800 outline-none text-sm w-32" 
                            value={manualAdjustment} 
                            onChange={e => setManualAdjustment(Number(e.target.value))}
                            placeholder="Valor Kz..."
                        />
                    </div>
                    <button onClick={handleManualRecalculate} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition shadow-sm"><Calculator size={16}/></button>
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={() => window.print()} className="bg-slate-800 hover:bg-black text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition"><Printer size={18}/> Imprimir A4</button>
                {isFinalView ? (
                    <button onClick={() => onProcess?.(selectedSlip)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl transition transform active:scale-95"><Save size={18}/> GUARDAR RECIBO</button>
                ) : (
                    <button onClick={() => setIsFinalView(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl transition transform active:scale-95"><Zap size={18} className="text-blue-200"/> CONFIRMAR E PROCESSAR</button>
                )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center bg-slate-200 custom-scrollbar print:bg-white print:p-0" id="print-area">
            {isFinalView ? (
                <div className="w-full flex gap-8 justify-center items-start overflow-x-auto min-w-[1000px]">
                    <div className="shrink-0 w-[210mm]">
                        <SlipComponent slip={selectedSlip} copyLabel="Original (Contabilidade)" />
                    </div>
                    <div className="shrink-0 w-[210mm]">
                        <SlipComponent slip={selectedSlip} copyLabel="Duplicado (Trabalhador)" />
                    </div>
                </div>
            ) : (
                <div className="max-w-[210mm] w-full">
                    <SlipComponent slip={selectedSlip} copyLabel="Pré-Visualização (Editável)" isPreview={true} />
                </div>
            )}
        </div>

        <style>{`
            @media print {
              body * { visibility: hidden; }
              #print-area, #print-area * { visibility: visible; }
              #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; background: white; }
              @page { size: ${isFinalView ? 'landscape' : 'A4'}; margin: 10mm; }
            }
        `}</style>
    </div>
  );
};

export default SalaryMap;
