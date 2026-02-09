import React, { useState } from 'react';
import { Calendar, Search, Download, Printer, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

const TaxDocsManager: React.FC = () => {
    return (
        <div className="p-6 space-y-6 animate-in fade-in">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Documentos Fiscais</h1>
                    <p className="text-slate-500">Gestão de Modelos 7, SAF-T e outros documentos obrigatórios.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-sm">
                        <Download size={18} /> Exportar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
                        <Printer size={18} /> Imprimir
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <BarChart3 size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">Modelo 7</h3>
                    <p className="text-sm text-slate-500 mb-4">Declaração anual de rendimentos.</p>
                    <div className="flex items-center text-xs font-medium text-slate-400">
                        <AlertCircle size={14} className="mr-1 text-orange-500" />
                        Pendente de envio
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">SAF-T (AO)</h3>
                    <p className="text-sm text-slate-500 mb-4">Ficheiro normalizado de auditoria tributária.</p>
                    <div className="flex items-center text-xs font-medium text-emerald-600">
                        <AlertCircle size={14} className="mr-1" />
                        Validado e Atualizado
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                        <Printer size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">Resumo de IVA</h3>
                    <p className="text-sm text-slate-500 mb-4">Relatórios para apuramento mensal/trimestral.</p>
                    <div className="flex items-center text-xs font-medium text-slate-400">
                        Agendado para dia 10
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-400 italic">
                Painel de gestão de documentos fiscais em desenvolvimento. Mais funcionalidades em breve.
            </div>
        </div>
    );
};

export default TaxDocsManager;
