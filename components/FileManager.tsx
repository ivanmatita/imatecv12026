import React, { useState } from 'react';
import {
    Folder, FileText, Search, Upload, RefreshCw, Grid, List, MoreVertical,
    File, Download, Trash2, Eye
} from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    type: 'FOLDER' | 'PDF' | 'IMAGE' | 'DOC' | 'VIDEO' | 'AUDIO' | 'OTHER';
    size?: string;
    date: string;
    items?: number; // for folders
}

const MOCK_FILES: FileItem[] = [
    { id: '1', name: 'Documentos Fiscais', type: 'FOLDER', date: '2025-02-01', items: 12 },
    { id: '2', name: 'Contratos RH', type: 'FOLDER', date: '2025-01-20', items: 5 },
    { id: '3', name: 'Comprovativos Pagamento', type: 'FOLDER', date: '2025-02-05', items: 34 },
    { id: '4', name: 'Relatório Anual 2024.pdf', type: 'PDF', size: '2.4 MB', date: '2025-01-15' },
    { id: '5', name: 'Logotipo Empresa.png', type: 'IMAGE', size: '1.2 MB', date: '2024-11-10' },
    { id: '6', name: 'Lista de Preços.xlsx', type: 'DOC', size: '450 KB', date: '2025-02-01' },
];

const FileManager: React.FC = () => {
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPath, setCurrentPath] = useState<string[]>(['Raiz']);

    const getIcon = (type: string) => {
        switch (type) {
            case 'FOLDER': return <Folder className="text-orange-400 fill-orange-100" size={40} />;
            case 'PDF': return <FileText className="text-red-500" size={40} />;
            case 'IMAGE': return <File className="text-purple-500" size={40} />; // Simplified
            case 'DOC': return <FileText className="text-blue-500" size={40} />;
            case 'VIDEO': return <File className="text-pink-500" size={40} />; // Simplified
            case 'AUDIO': return <File className="text-yellow-500" size={40} />; // Simplified
            default: return <File className="text-slate-400" size={40} />;
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col font-sans animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-t-2xl shadow-lg text-white shrink-0">
                <div>
                    <h1 className="text-2xl font-light flex items-center gap-2 tracking-tight">
                        <Folder className="text-white/80" /> Gestor de Arquivos
                    </h1>
                    <p className="text-xs text-orange-100 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        Documentos / {currentPath.join(' / ')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 bg-white/10 text-white rounded hover:bg-white/20 transition backdrop-blur-sm border border-white/20">
                        <RefreshCw size={18} />
                    </button>
                    <div className="bg-white/10 rounded p-1 flex items-center backdrop-blur-sm border border-white/20">
                        <button
                            onClick={() => setViewMode('GRID')}
                            className={`p-1.5 rounded transition ${viewMode === 'GRID' ? 'bg-white text-orange-600 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-1.5 rounded transition ${viewMode === 'LIST' ? 'bg-white text-orange-600 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all">
                        <Upload size={18} /> Upload
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-3 border-x border-b border-slate-200 shadow-sm flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 bg-slate-100 px-3 py-2 rounded-lg flex-1 border border-slate-200 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100 transition-all">
                    <Search className="text-slate-400" size={18} />
                    <input
                        className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700"
                        placeholder="Pesquisar arquivos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {MOCK_FILES.length} Itens
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-50 border-x border-b border-slate-200 rounded-b-xl overflow-y-auto p-4 shadow-inner relative">
                {viewMode === 'GRID' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {MOCK_FILES.map(file => (
                            <div key={file.id} className="group bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all p-4 flex flex-col items-center cursor-pointer relative">
                                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                                    {getIcon(file.type)}
                                </div>
                                <span className="text-sm font-bold text-slate-700 text-center line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                                    {file.name}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">
                                    {file.type === 'FOLDER' ? `${file.items} itens` : file.size}
                                </span>

                                <button className="absolute top-2 right-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                            <tr>
                                <th className="pb-3 pl-4">Nome</th>
                                <th className="pb-3 text-center">Tipo</th>
                                <th className="pb-3 text-center">Tamanho</th>
                                <th className="pb-3 text-center">Data</th>
                                <th className="pb-3 text-right pr-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {MOCK_FILES.map(file => (
                                <tr key={file.id} className="hover:bg-white transition-colors group">
                                    <td className="py-3 pl-4 flex items-center gap-3">
                                        <div className="transform scale-75 origin-left">
                                            {getIcon(file.type)}
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm group-hover:text-orange-600 transition-colors cursor-pointer">{file.name}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase border border-slate-200">{file.type}</span>
                                    </td>
                                    <td className="py-3 text-center text-slate-500 font-mono text-xs">
                                        {file.type === 'FOLDER' ? `${file.items} itens` : file.size}
                                    </td>
                                    <td className="py-3 text-center text-slate-500 text-xs font-medium">
                                        {file.date}
                                    </td>
                                    <td className="py-3 pr-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Visualizar">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded" title="Baixar">
                                                <Download size={16} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Apagar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-4 text-center text-slate-400 text-xs font-medium uppercase tracking-widest shrink-0">
                Imatec Cloud Storage &copy; 2026
            </div>
        </div>
    );
};

export default FileManager;
