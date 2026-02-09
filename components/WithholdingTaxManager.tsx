
import React, { useState, useMemo } from 'react';
import { Invoice, Purchase, Company, InvoiceType, PurchaseType, InvoiceStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { printDocument, downloadPDF } from "../utils/exportUtils";
import { 
  Printer, Download, Calendar, DollarSign, Calculator, List, 
  ArrowRight, ShieldCheck, Landmark, CheckCircle, Info, ChevronRight, X
} from 'lucide-react';

interface WithholdingTaxManagerProps {
  invoices: Invoice[];
  purchases: Purchase[];
  company: Company;
}

type TabType = 'PAYABLE_PURCHASES' | 'RECEIVABLE_SALES';

const WithholdingTaxManager: React.FC<WithholdingTaxManagerProps> = ({ invoices, purchases, company }) => {
  const [activeTab, setActiveTab] = useState<TabType>('PAYABLE_PURCHASES');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Logic for Retenção a Fornecedores (Image 1) - Related to Purchases
  // Typically, when we buy services, we withhold tax (6.5%) to pay to AGT.
  const payableItems = useMemo(() => {
    return purchases.filter(p => {
        const d = new Date(p.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month && p.status !== 'CANCELLED';
    }).flatMap((p, idx) => {
        // Derive withholding from items marked with withholding or assume based on type
        return p.items.filter(it => (it.withholdingAmount || 0) > 0).map(item => ({
            id: item.id,
            nif: p.nif,
            provider: p.supplier,
            docNo: p.documentNumber,
            dateEmit: p.date,
            datePay: p.date, // Simplification: assume same day or recorded pay date
            total: p.total,
            paid: p.total,
            subject: item.total,
            rate: item.withholdingRate || 6.5,
            amount: item.withholdingAmount || (item.total * 0.065)
        }));
    });
  }, [purchases, year, month]);

  // Logic for Retenção de Clientes (Image 2) - Related to Sales
  const receivableItems = useMemo(() => {
    return invoices.filter(i => {
        const d = new Date(i.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month && i.isCertified && i.status !== InvoiceStatus.CANCELLED && (i.withholdingAmount || 0) > 0;
    }).map((inv, idx) => ({
        id: inv.id,
        order: idx + 1,
        client: inv.clientName,
        dateDoc: inv.date,
        docNo: inv.number,
        type: inv.type,
        rate: 6.5,
        base: inv.subtotal,
        creditNote: 0,
        receivable: inv.withholdingAmount || (inv.subtotal * 0.065)
    }));
  }, [invoices, year, month]);

  const totalPayable = payableItems.reduce((acc, i) => acc + i.amount, 0);
  const totalReceivable = receivableItems.reduce((acc, i) => acc + i.receivable, 0);

  const renderPayable = () => (
    <div className="bg-white p-8 border border-slate-300 shadow-2xl animate-in zoom-in-95 duration-300" id="payable-area">
        <div className="border-b-4 border-blue-900 pb-2 mb-6">
            <h2 className="bg-blue-900 text-white inline-block px-2 py-0.5 text-[10px] font-bold">01- IDENTIFICAÇÃO DO CONTRIBUINTE</h2>
            <div className="mt-4 space-y-1 text-sm">
                <p className="font-bold uppercase">EMPRESA: {company.name}</p>
                <p className="font-mono">NIF: {company.nif}</p>
            </div>
        </div>

        <div className="border-t-4 border-blue-900 pt-1">
            <h2 className="bg-blue-900 text-white inline-block px-2 py-0.5 text-[10px] font-bold">2 - LISTAGEM DE RETENÇÃO A FORNECEDORES</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-400 font-black text-slate-700">
                            <th className="p-1">Nº</th>
                            <th className="p-1">NIF AO</th>
                            <th className="p-1">NIF</th>
                            <th className="p-1">Prestador</th>
                            <th className="p-1">(a)</th>
                            <th className="p-1">(b)</th>
                            <th colSpan={6} className="p-1 text-center border-l border-slate-200">Dados da factura</th>
                            <th className="p-1 text-center border-l border-slate-200">Taxa</th>
                            <th className="p-1 text-right border-l border-slate-200">Imposto Retido</th>
                        </tr>
                        <tr className="border-b border-slate-300 text-[9px] text-slate-500">
                            <th colSpan={6}></th>
                            <th className="p-1 border-l border-slate-200">Nº</th>
                            <th className="p-1">Data Emissão</th>
                            <th className="p-1">Data Pagamento</th>
                            <th className="p-1 text-right">Valor Total</th>
                            <th className="p-1 text-right">Valor Pago</th>
                            <th className="p-1 text-right">Valor Sujeito</th>
                            <th colSpan={2}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {payableItems.map((item, idx) => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-1 font-bold">{idx + 1}</td>
                                <td className="p-1 font-mono">{item.nif}</td>
                                <td className="p-1">---</td>
                                <td className="p-1 uppercase font-medium">{item.provider}</td>
                                <td className="p-1">-</td>
                                <td className="p-1">-</td>
                                <td className="p-1 border-l font-bold text-blue-800">{item.docNo}</td>
                                <td className="p-1">{formatDate(item.dateEmit)}</td>
                                <td className="p-1">{formatDate(item.datePay)}</td>
                                <td className="p-1 text-right">{formatCurrency(item.total).replace('Kz','')}</td>
                                <td className="p-1 text-right">{formatCurrency(item.paid).replace('Kz','')}</td>
                                <td className="p-1 text-right">{formatCurrency(item.subject).replace('Kz','')}</td>
                                <td className="p-1 text-center border-l">{item.rate}%</td>
                                <td className="p-1 text-right font-black text-blue-900">{formatCurrency(item.amount).replace('Kz','')}</td>
                            </tr>
                        ))}
                        <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-blue-900">
                            <td colSpan={6} className="p-3">
                                <div className="text-[8px] space-y-0.5 text-slate-500">
                                    <p>(a) Nº da Declaração de Conformidade</p>
                                    <p>(b) Sector Petrolífero</p>
                                </div>
                            </td>
                            <td colSpan={3} className="text-right p-3">Totais Acumulados</td>
                            <td className="p-3 text-right">0,00</td>
                            <td className="p-3 text-right">0,00</td>
                            <td className="p-3 text-right">0,00</td>
                            <td className="p-3"></td>
                            <td className="p-3 text-right text-blue-900 text-sm">{formatCurrency(totalPayable).replace('Kz','')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div className="mt-12 text-[8px] text-slate-400 italic text-center font-mono">
            Mapa gerado por software certificado n. 25/AGT/2019 • IMATEC SOFTWARE V.2.0
        </div>
    </div>
  );

  const renderReceivable = () => (
    <div className="bg-white p-8 border border-slate-300 shadow-2xl animate-in zoom-in-95 duration-300" id="receivable-area">
        {/* Formal Declaration Header */}
        <div className="border-2 border-slate-800 mb-6">
            <div className="flex border-b-2 border-slate-400">
                <div className="w-48 p-4 border-r-2 border-slate-400 flex flex-col items-center justify-center bg-slate-50">
                    <Landmark className="text-blue-500 mb-2" size={32}/>
                    <div className="text-[10px] font-black text-slate-500 uppercase text-center">Powered By IMATEC SOFT</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Retenções na Fonte</h1>
                    <h2 className="text-lg font-bold text-blue-700 uppercase tracking-widest">A Receber de Clientes</h2>
                </div>
                <div className="w-48 p-4 border-l-2 border-slate-400 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-8 border-double border-slate-200 flex items-center justify-center font-serif font-black italic text-slate-300">IVA</div>
                </div>
            </div>
            
            <div className="grid grid-cols-12 text-[10px] font-bold">
                <div className="col-span-3 border-r-2 border-slate-400">
                    <div className="bg-blue-900 text-white px-2 py-1 uppercase">01- REGIME DO IVA</div>
                    <div className="p-4 space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={company.regime === 'Regime Geral'} readOnly/> 1 - REGIME GERAL</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={company.regime === 'Regime Simplificado'} readOnly/> 2 - REGIME DE CAIXA</label>
                        <label className="flex items-center gap-2"><input type="checkbox" readOnly/> 3 - REGIME TRANSITORIO</label>
                    </div>
                </div>
                <div className="col-span-4 border-r-2 border-slate-400">
                    <div className="bg-blue-900 text-white px-2 py-1 uppercase">02- PERIODO DA DECLARAÇÃO</div>
                    <div className="p-4 flex gap-4">
                        <div>
                            <span className="block text-[8px] text-slate-400 mb-1">Ano:</span>
                            <div className="border border-black p-2 font-black text-lg">{year}</div>
                        </div>
                        <div className="flex-1">
                            <span className="block text-[8px] text-slate-400 mb-1">Mês:</span>
                            <div className="flex items-end gap-2">
                                <div className="border border-black p-2 font-black text-lg w-16 text-center">{String(month).padStart(2,'0')}</div>
                                <span className="text-[8px] font-medium text-slate-400 italic">(Mês por extenso: {months[month-1]})</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-5">
                    <div className="bg-blue-900 text-white px-2 py-1 uppercase">03- NÚMERO DE IDENTIFICAÇÃO FISCAL</div>
                    <div className="p-4 flex items-center justify-center h-full pb-8">
                        <div className="flex gap-1">
                            {company.nif.padEnd(12, ' ').split('').map((c, i) => (
                                <div key={i} className="border border-black w-6 h-8 flex items-center justify-center font-black text-sm bg-white shadow-sm">{c}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="border-t-2 border-slate-400">
                <div className="bg-blue-900 text-white px-2 py-1 text-[10px] font-bold uppercase">04- IDENTIFICAÇÃO DO CONTRIBUINTE</div>
                <div className="p-3 flex items-end gap-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">1 - NOME OU DESIGNAÇÃO SOCIAL:</span>
                    <div className="flex-1 border-b border-black font-black text-sm uppercase">{company.name}</div>
                </div>
            </div>
        </div>

        <div className="border-t-4 border-blue-900 mt-8">
            <h2 className="bg-blue-900 text-white inline-block px-2 py-1 text-[10px] font-bold">9- Retenções na Fonte a Receber</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-800 font-black text-slate-700 text-center">
                            <th className="p-2 border-r border-slate-200 w-10">Nº</th>
                            <th className="p-2 border-r border-slate-200">Cliente</th>
                            <th className="p-2 border-r border-slate-200 w-24">Data Doc</th>
                            <th className="p-2 border-r border-slate-200 w-32">Doc Nº</th>
                            <th className="p-2 border-r border-slate-200 w-16">Tipo</th>
                            <th className="p-2 border-r border-slate-200 w-16">Taxa</th>
                            <th className="p-2 border-r border-slate-200 text-right w-32">Imposto Base</th>
                            <th className="p-2 border-r border-slate-200 text-right w-32">Nota Crédito</th>
                            <th className="p-2 text-right w-32">IMP A RECEBER</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receivableItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                <td className="p-2 border-r border-slate-100 text-center font-bold">{item.order}</td>
                                <td className="p-2 border-r border-slate-100 font-medium uppercase">{item.client}</td>
                                <td className="p-2 border-r border-slate-100 text-center">{formatDate(item.dateDoc)}</td>
                                <td className="p-2 border-r border-slate-100 font-bold text-blue-800">{item.docNo}</td>
                                <td className="p-2 border-r border-slate-100 text-center uppercase font-bold">{item.type.substring(0,2)}</td>
                                <td className="p-2 border-r border-slate-100 text-center font-black">{item.rate}%</td>
                                <td className="p-2 border-r border-slate-100 text-right font-mono">{formatCurrency(item.base).replace('Kz','')}</td>
                                <td className="p-2 border-r border-slate-100 text-right text-red-500 font-mono">0,00</td>
                                <td className="p-2 text-right font-black text-blue-900 bg-slate-50/50">{formatCurrency(item.receivable).replace('Kz','')}</td>
                            </tr>
                        ))}
                        {receivableItems.length === 0 && (
                            <tr><td colSpan={9} className="p-10 text-center text-slate-300 font-bold italic uppercase">Nenhuma retenção a receber encontrada para este período.</td></tr>
                        )}
                        <tr className="bg-slate-100 font-black border-t-2 border-slate-800">
                            <td colSpan={8} className="p-3 text-right uppercase tracking-widest text-[9px]">Valores Totais</td>
                            <td className="p-3 text-right text-blue-900 text-sm">{formatCurrency(totalReceivable).replace('Kz','')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in pb-20 max-w-7xl mx-auto">
        {/* Navigation Buttons with Icons */}
        <div className="flex justify-center gap-6 print:hidden">
            <button 
                onClick={() => setActiveTab('PAYABLE_PURCHASES')}
                className={`flex-1 max-w-sm p-6 rounded-3xl border-4 transition-all duration-300 flex items-center gap-6 shadow-xl transform hover:scale-105 active:scale-95 ${
                    activeTab === 'PAYABLE_PURCHASES' 
                    ? 'bg-blue-900 border-blue-600 text-white shadow-blue-900/20' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                }`}
            >
                <div className={`p-4 rounded-2xl ${activeTab === 'PAYABLE_PURCHASES' ? 'bg-blue-600' : 'bg-slate-100'} transition-colors`}>
                    <Calculator size={32}/>
                </div>
                <div className="text-left">
                    <p className="font-black uppercase text-sm leading-tight tracking-tighter">Retenção na Fonte a Pagar</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase mt-1">Vendas / Serviços</p>
                </div>
            </button>

            <button 
                onClick={() => setActiveTab('RECEIVABLE_SALES')}
                className={`flex-1 max-w-sm p-6 rounded-3xl border-4 transition-all duration-300 flex items-center gap-6 shadow-xl transform hover:scale-105 active:scale-95 ${
                    activeTab === 'RECEIVABLE_SALES' 
                    ? 'bg-blue-900 border-blue-600 text-white shadow-blue-900/20' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                }`}
            >
                <div className={`p-4 rounded-2xl ${activeTab === 'RECEIVABLE_SALES' ? 'bg-blue-600' : 'bg-slate-100'} transition-colors`}>
                    <Landmark size={32}/>
                </div>
                <div className="text-left">
                    <p className="font-black uppercase text-sm leading-tight tracking-tighter">Retenção na Fonte a Receber</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase mt-1">Compras / Fornecedores</p>
                </div>
            </button>
        </div>

        {/* Filters Area */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-4 print:hidden">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Mês de Apuramento</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                    <select className="pl-9 pr-4 py-2 border rounded-xl bg-slate-50 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[180px]" value={month} onChange={e => setMonth(Number(e.target.value))}>
                        {months.map((m, i) => <option key={i} value={i+1}>{m.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Ano Fiscal</label>
                <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                    <select className="pl-9 pr-4 py-2 border rounded-xl bg-slate-50 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[120px]" value={year} onChange={e => setYear(Number(e.target.value))}>
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </div>
            </div>
            <div className="ml-auto flex gap-3">
                <button onClick={() => downloadPDF(activeTab === 'PAYABLE_PURCHASES' ? 'payable-area' : 'receivable-area', `Mapa_Retencao_${activeTab}.pdf`)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-300 transition shadow-sm">
                    <Download size={16}/> Baixar PDF
                </button>
                <button onClick={() => printDocument(activeTab === 'PAYABLE_PURCHASES' ? 'payable-area' : 'receivable-area')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all shadow-blue-500/20">
                    <Printer size={16}/> Imprimir Mapa
                </button>
            </div>
        </div>

        {/* Content Render */}
        <div className="flex justify-center">
            <div className="w-full">
                {activeTab === 'PAYABLE_PURCHASES' ? renderPayable() : renderReceivable()}
            </div>
        </div>

        {/* Footer info */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-xl flex items-center gap-6 print:hidden">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Info size={32}/>
            </div>
            <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Aviso de Conformidade Fiscal</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl mt-1">
                    Este relatório é gerado automaticamente com base nos documentos certificados no sistema. 
                    Certifique-se de que todas as retenções foram devidamente marcadas nos documentos de origem (Facturas ou Recibos) para garantir a exatidão dos valores. 
                    O imposto retido deve ser entregue à AGT até ao final do mês seguinte ao da retenção.
                </p>
            </div>
        </div>

        <style>{`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            #payable-area, #receivable-area {
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            @page { margin: 15mm; size: A4; }
          }
        `}</style>
    </div>
  );
};

export default WithholdingTaxManager;
