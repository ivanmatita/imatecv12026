import React, { useState } from 'react';
import { Folder, Search, FileText, Download, Upload, Trash2, Filter } from 'lucide-react';

const ArchivesManager: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="p-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Arquivo Digital</h1>
                    <p className="text-slate-500">Gerencie documentos digitalizados e arquivos fiscais.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <Upload size={18} /> Upload
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar arquivos..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
                        <option>Todos os tipos</option>
                        <option>Faturas</option>
                        <option>Recibos</option>
                        <option>Contratos</option>
                        <option>Outros</option>
                    </select>
                    <select className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
                        <option>Este Mês</option>
                        <option>Mês Passado</option>
                        <option>Este Ano</option>
                    </select>
                </div>
            </div>

            {/* Empty State / Placeholder */}
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Folder size={48} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum documento encontrado</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    Selecione "Upload" para adicionar novos documentos ao arquivo digital da empresa.
                </p>
            </div>
        </div>
    );
};

export default ArchivesManager;
