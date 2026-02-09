
import React from 'react';
import { TransferOrder, Company } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Printer, X } from 'lucide-react';
import { printDocument } from '../utils/exportUtils';

interface TransferOrderViewProps {
  order: TransferOrder;
  company: Company;
  onClose: () => void;
}

const TransferOrderView: React.FC<TransferOrderViewProps> = ({ order, company, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl border-4 border-slate-900">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
          <h2 className="font-bold uppercase tracking-tighter">Visualização: Ordem de Transferência</h2>
          <div className="flex gap-2">
            <button onClick={() => printDocument('print-transfer-area')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2">
              <Printer size={16}/> Imprimir
            </button>
            <button onClick={onClose} className="p-2 hover:bg-red-600 rounded-full transition"><X/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-white" id="print-transfer-area">
          <div className="max-w-[210mm] mx-auto text-black font-sans">
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h1 className="text-2xl font-black uppercase tracking-widest border-b-4 border-black pb-2">ORDEM TRANSFERENCIA</h1>
               </div>
               <div className="text-right space-y-1 text-xs">
                  <div className="flex justify-between gap-8"><span className="font-bold">N/ Ref Nº :</span> <span className="font-mono font-black">{order.reference}</span></div>
                  <div className="flex justify-between gap-8"><span className="font-bold">Data :</span> <span className="font-bold">{formatDate(order.date)}</span></div>
                  <div className="flex justify-between gap-8"><span className="font-bold">Nº Total Transferências :</span> <span className="font-black">{order.employeeCount}</span></div>
                  <div className="flex justify-between gap-8"><span className="font-bold">Montante Total :</span> <span className="font-black">{formatCurrency(order.totalValue).replace('AOA', 'akz')}</span></div>
               </div>
            </div>

            <div className="text-center mb-10">
                <h3 className="text-xl font-bold">A Direcção</h3>
                <div className="h-0.5 bg-black w-1/2 mx-auto mt-1"></div>
            </div>

            <div className="border-t-2 border-black pt-4">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b-2 border-slate-200 text-slate-500 uppercase font-bold">
                            <th className="text-left py-2">Nome</th>
                            <th className="text-left py-2">Banco</th>
                            <th className="text-right py-2">Montante a Transferir</th>
                            <th className="text-center py-2 w-20">IDNF</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {order.details.map((det, idx) => (
                            <React.Fragment key={idx}>
                                <tr className="font-bold text-sm">
                                    <td className="py-3 uppercase">{det.employeeName || '.'}</td>
                                    <td className="py-3">{det.bankName || 'Pagamento em Mão'}</td>
                                    <td className="py-3 text-right bg-slate-50 px-4">
                                        <div className="text-[10px] text-slate-400 uppercase font-black text-center mb-1 border-b">Montante a Transferir</div>
                                        <div className="text-lg font-black">{formatCurrency(det.amount).replace('AOA', 'akz')}</div>
                                    </td>
                                    <td className="py-3 text-center text-2xl font-black border-l border-slate-100">{idx + 1}</td>
                                </tr>
                                <tr className="text-[10px] text-slate-500">
                                    <td className="pb-3 border-b-2 border-black" colSpan={3}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><span className="font-bold">Conta Nº:</span> {det.accountNumber || '---'}</div>
                                            <div><span className="font-bold">Iban:</span> {det.iban || '---'}</div>
                                        </div>
                                        <div className="mt-2 text-slate-900 font-bold">
                                            Transferência Salário de {new Date(0, order.month - 1).toLocaleString('pt-PT', {month:'long'})} de {order.year} de {company.name}.
                                        </div>
                                    </td>
                                    <td className="text-center pb-3 border-b-2 border-black border-l border-slate-100 flex flex-col items-center justify-center">
                                        <span className="font-bold text-[9px] mb-1">IDNF:{idx + 1}</span>
                                        <div className="w-4 h-4 border border-black rounded"></div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-12 text-[10px] text-slate-400 italic">
                Documento gerado automaticamente por IMATEC SOFTWARE V.2.0 • Software Certificado n. 25/AGT/2019
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferOrderView;
