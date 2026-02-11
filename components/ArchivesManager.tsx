import React, { useState, useEffect } from 'react';
import { Folder, Search, FileText, Download, Upload, Trash2, Filter, Edit, Plus, X, AlertCircle } from 'lucide-react';
import {
    listarArquivos,
    criarArquivo,
    atualizarArquivo,
    apagarArquivo,
    fetchLocalTrabalho
} from '../services/supabaseClient';

interface Arquivo {
    id: string;
    empresa_id?: string;
    nome: string;
    tipo: string;
    observacoes?: string;
    contacto?: string;
    responsavel?: string;
    data_registo?: string;
    file_url?: string;
    is_signed?: boolean;
    associated_doc_no?: string;
    ocorrencias?: any;
    created_at?: string;
    updated_at?: string;
}

interface LocalTrabalho {
    id: string;
    nome: string;
}

const ArchivesManager: React.FC = () => {
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const [locaisTrabalho, setLocaisTrabalho] = useState<LocalTrabalho[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Arquivo>>({
        nome: '',
        tipo: '',
        observacoes: '',
        contacto: '',
        responsavel: '',
        data_registo: new Date().toISOString().split('T')[0],
        file_url: '',
        is_signed: false,
        associated_doc_no: '',
        empresa_id: '',
        ocorrencias: null
    });

    // ================= FUNÇÕES DE CRUD =================

    /**
     * LISTAR (SELECT) - Carrega todos os arquivos do banco
     */
    const fetchArquivos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listarArquivos();
            setArquivos(data || []);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar arquivos');
            console.error('Erro ao carregar arquivos:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * CRIAR (INSERT) - Cria novo arquivo no banco
     */
    const createArquivo = async () => {
        if (!formData.nome || !formData.tipo) {
            setError('Nome e Tipo são obrigatórios');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await criarArquivo(formData);
            await fetchArquivos(); // Recarrega lista após criar
            setShowModal(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar arquivo');
            console.error('Erro ao criar arquivo:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * EDITAR (UPDATE) - Atualiza arquivo existente
     */
    const updateArquivo = async () => {
        if (!editingId || !formData.nome || !formData.tipo) {
            setError('Nome e Tipo são obrigatórios');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await atualizarArquivo(editingId, formData);
            await fetchArquivos(); // Recarrega lista após atualizar
            setShowModal(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar arquivo');
            console.error('Erro ao atualizar arquivo:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * APAGAR (DELETE) - Remove arquivo do banco
     */
    const deleteArquivo = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja apagar este arquivo?')) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await apagarArquivo(id);
            await fetchArquivos(); // Recarrega lista após apagar
        } catch (err: any) {
            setError(err.message || 'Erro ao apagar arquivo');
            console.error('Erro ao apagar arquivo:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Carrega locais de trabalho para dropdown
     */
    const loadLocaisTrabalho = async () => {
        try {
            const data = await fetchLocalTrabalho();
            setLocaisTrabalho(data || []);
        } catch (err: any) {
            console.error('Erro ao carregar locais de trabalho:', err);
        }
    };

    // ================= HANDLERS =================

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateArquivo();
        } else {
            createArquivo();
        }
    };

    const handleEdit = (arquivo: Arquivo) => {
        setEditingId(arquivo.id);
        setFormData({
            nome: arquivo.nome,
            tipo: arquivo.tipo,
            observacoes: arquivo.observacoes || '',
            contacto: arquivo.contacto || '',
            responsavel: arquivo.responsavel || '',
            data_registo: arquivo.data_registo || new Date().toISOString().split('T')[0],
            file_url: arquivo.file_url || '',
            is_signed: arquivo.is_signed || false,
            associated_doc_no: arquivo.associated_doc_no || '',
            empresa_id: arquivo.empresa_id || '',
            ocorrencias: arquivo.ocorrencias || null
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            tipo: '',
            observacoes: '',
            contacto: '',
            responsavel: '',
            data_registo: new Date().toISOString().split('T')[0],
            file_url: '',
            is_signed: false,
            associated_doc_no: '',
            empresa_id: '',
            ocorrencias: null
        });
        setEditingId(null);
        setError(null);
    };

    const handleOpenModal = () => {
        resetForm();
        setShowModal(true);
    };

    // ================= EFFECTS =================

    useEffect(() => {
        fetchArquivos();
        loadLocaisTrabalho();
    }, []);

    // ================= FILTROS =================

    const arquivosFiltrados = arquivos.filter(arquivo => {
        const matchSearch = arquivo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            arquivo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (arquivo.responsavel && arquivo.responsavel.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchTipo = !tipoFiltro || arquivo.tipo === tipoFiltro;
        return matchSearch && matchTipo;
    });

    // ================= RENDER =================

    return (
        <div className="p-6 space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Arquivo Digital</h1>
                    <p className="text-slate-500">Gerencie documentos digitalizados e arquivos fiscais.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Novo Arquivo
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

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
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value)}
                    >
                        <option value="">Todos os tipos</option>
                        <option value="Fatura">Faturas</option>
                        <option value="Recibo">Recibos</option>
                        <option value="Contrato">Contratos</option>
                        <option value="Certidão">Certidões</option>
                        <option value="Outro">Outros</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500 mt-2">Carregando...</p>
                </div>
            )}

            {/* Lista de Arquivos */}
            {!loading && arquivosFiltrados.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nome</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tipo</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Responsável</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Data Registro</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Assinado</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {arquivosFiltrados.map((arquivo) => (
                                <tr key={arquivo.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 text-sm text-slate-800">{arquivo.nome}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{arquivo.tipo}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{arquivo.responsavel || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {arquivo.data_registo ? new Date(arquivo.data_registo).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${arquivo.is_signed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {arquivo.is_signed ? 'Sim' : 'Não'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(arquivo)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteArquivo(arquivo.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                                title="Apagar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {!loading && arquivosFiltrados.length === 0 && (
                <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <Folder size={48} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum documento encontrado</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        {searchTerm || tipoFiltro ? 'Nenhum arquivo corresponde aos filtros aplicados.' : 'Clique em "Novo Arquivo" para adicionar documentos ao arquivo digital.'}
                    </p>
                </div>
            )}

            {/* Modal de Formulário */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingId ? 'Editar Arquivo' : 'Novo Arquivo'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Nome do Arquivo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Tipo *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Fatura">Fatura</option>
                                    <option value="Recibo">Recibo</option>
                                    <option value="Contrato">Contrato</option>
                                    <option value="Certidão">Certidão</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>

                            {/* Empresa/Local de Trabalho */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Local de Trabalho
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.empresa_id}
                                    onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {locaisTrabalho.map((local) => (
                                        <option key={local.id} value={local.id}>
                                            {local.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Responsável */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Responsável
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.responsavel}
                                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                />
                            </div>

                            {/* Contacto */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Contacto
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.contacto}
                                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                />
                            </div>

                            {/* Data de Registro */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Data de Registro
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.data_registo}
                                    onChange={(e) => setFormData({ ...formData, data_registo: e.target.value })}
                                />
                            </div>

                            {/* URL do Arquivo */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    URL do Arquivo
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.file_url}
                                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Número do Documento Associado */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Nº Documento Associado
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.associated_doc_no}
                                    onChange={(e) => setFormData({ ...formData, associated_doc_no: e.target.value })}
                                />
                            </div>

                            {/* Assinado */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_signed"
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                    checked={formData.is_signed}
                                    onChange={(e) => setFormData({ ...formData, is_signed: e.target.checked })}
                                />
                                <label htmlFor="is_signed" className="text-sm font-semibold text-slate-700">
                                    Documento Assinado
                                </label>
                            </div>

                            {/* Observações */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Observações
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                />
                            </div>

                            {/* Ocorrências (JSON) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Ocorrências (JSON)
                                </label>
                                <textarea
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                                    value={formData.ocorrencias ? JSON.stringify(formData.ocorrencias) : ''}
                                    onChange={(e) => {
                                        try {
                                            const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                                            setFormData({ ...formData, ocorrencias: parsed });
                                        } catch {
                                            // Ignora erro de parsing enquanto digita
                                        }
                                    }}
                                    placeholder='{"exemplo": "valor"}'
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchivesManager;
