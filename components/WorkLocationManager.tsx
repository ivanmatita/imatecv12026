
import React, { useState, useEffect } from 'react';
import { listarLocaisTrabalho, criarLocalTrabalho, atualizarLocalTrabalho, listarClientes } from '../services/supabaseClient';
import {
    MapPin, Plus, RefreshCw, Edit, Save, X, Loader2, Search, Download,
    FileText, PieChart, BarChart, Calendar, User, Phone, Building,
    Hash, Database, FileSpreadsheet, Printer, Eye, TrendingUp, Users,
    Briefcase, Target, Activity, DollarSign, Clock
} from 'lucide-react';
import { generateUUID, formatDate, formatCurrency, exportToExcel } from '../utils';

interface LocalTrabalhoForm {
    id?: string;
    nome: string;
    endereco: string;
    telefone: string;
    tipo: string;
    empresa_id: string;
    cliente_id: string;
    data_abertura: string;
    data_encerramento: string;
    efectivos_dia: number;
    total_efectivos: number;
    numero_trabalhadores: number;
    total_trabalhadores: number;
    localizacao: string;
    titulo: string;
    codigo: string;
    descricao: string;
    contacto: string;
    observacoes: string;
    responsavel: string;
}

interface Cliente {
    id: string;
    nome: string;
    nif?: string;
}

interface WorkLocationManagerProps {
    onNavigateToGestao?: (locationId: string) => void;
}

const WorkLocationManager: React.FC<WorkLocationManagerProps> = ({ onNavigateToGestao }) => {
    const [locations, setLocations] = useState<any[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFilter, setTipoFilter] = useState('ALL');

    const [formData, setFormData] = useState<LocalTrabalhoForm>({
        nome: '',
        endereco: '',
        telefone: '',
        tipo: 'LOJA',
        empresa_id: '00000000-0000-0000-0000-000000000001',
        cliente_id: '',
        data_abertura: '',
        data_encerramento: '',
        efectivos_dia: 0,
        total_efectivos: 0,
        numero_trabalhadores: 0,
        total_trabalhadores: 0,
        localizacao: '',
        titulo: '',
        codigo: '',
        descricao: '',
        contacto: '',
        observacoes: '',
        responsavel: ''
    });

    // ==================== SELECT ====================
    useEffect(() => {
        fetchLocalTrabalho();
        fetchClientes();
    }, []);

    async function fetchLocalTrabalho() {
        setIsLoading(true);
        try {
            const data = await listarLocaisTrabalho();
            if (data) {
                setLocations(data);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar locais de trabalho:", error);
            alert("Erro ao carregar locais de trabalho.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchClientes() {
        try {
            const data = await listarClientes();
            if (data) {
                setClientes(data);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar clientes:", error);
        }
    }

    // ==================== INSERT ====================
    async function createLocalTrabalho() {
        if (!formData.nome) {
            alert("❌ O nome é obrigatório!");
            return;
        }

        if (!formData.cliente_id) {
            alert("❌ O cliente é obrigatório!");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                // ❌ NÃO enviar ID - deixar o banco gerar automaticamente
                nome: formData.nome,
                endereco: formData.endereco,
                telefone: formData.telefone,
                tipo: formData.tipo,
                empresa_id: formData.empresa_id,
                cliente_id: formData.cliente_id,
                data_abertura: formData.data_abertura || null,
                data_encerramento: formData.data_encerramento || null,
                // ✅ Converter corretamente: string vazia → null, número → number
                efectivos_dia: formData.efectivos_dia ? Number(formData.efectivos_dia) : null,
                total_efectivos: formData.total_efectivos ? Number(formData.total_efectivos) : null,
                numero_trabalhadores: formData.numero_trabalhadores ? Number(formData.numero_trabalhadores) : null,
                total_trabalhadores: formData.total_trabalhadores ? Number(formData.total_trabalhadores) : null,
                localizacao: formData.localizacao,
                titulo: formData.titulo,
                codigo: formData.codigo,
                descricao: formData.descricao,
                contacto: formData.contacto,
                observacoes: formData.observacoes,
                responsavel: formData.responsavel
            };

            console.log("📤 Payload completo:", JSON.stringify(payload, null, 2));

            await criarLocalTrabalho(payload);

            // SELECT após INSERT
            await fetchLocalTrabalho();

            closeModal();
            alert("✅ Local de trabalho criado com sucesso!");
        } catch (error: any) {
            console.error("❌ Erro completo ao criar local:", JSON.stringify(error, null, 2));
            alert("❌ Erro ao criar local: " + (error.message || JSON.stringify(error)));
        } finally {
            setIsLoading(false);
        }
    }

    // ==================== UPDATE ====================
    async function updateLocalTrabalho() {
        if (!editingId || !formData.nome) {
            alert("❌ O nome é obrigatório!");
            return;
        }

        if (!formData.cliente_id) {
            alert("❌ O cliente é obrigatório!");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                nome: formData.nome,
                endereco: formData.endereco,
                telefone: formData.telefone,
                tipo: formData.tipo,
                empresa_id: formData.empresa_id,
                cliente_id: formData.cliente_id,
                data_abertura: formData.data_abertura || null,
                data_encerramento: formData.data_encerramento || null,
                // ✅ Converter corretamente: string vazia → null, número → number
                efectivos_dia: formData.efectivos_dia ? Number(formData.efectivos_dia) : null,
                total_efectivos: formData.total_efectivos ? Number(formData.total_efectivos) : null,
                numero_trabalhadores: formData.numero_trabalhadores ? Number(formData.numero_trabalhadores) : null,
                total_trabalhadores: formData.total_trabalhadores ? Number(formData.total_trabalhadores) : null,
                localizacao: formData.localizacao,
                titulo: formData.titulo,
                codigo: formData.codigo,
                descricao: formData.descricao,
                contacto: formData.contacto,
                observacoes: formData.observacoes,
                responsavel: formData.responsavel
            };

            console.log("📤 Update Payload:", JSON.stringify(payload, null, 2));

            await atualizarLocalTrabalho(editingId, payload);

            // SELECT após UPDATE
            await fetchLocalTrabalho();

            closeModal();
            alert("✅ Local de trabalho atualizado com sucesso!");
        } catch (error: any) {
            console.error("❌ Erro completo ao atualizar local:", JSON.stringify(error, null, 2));
            alert("❌ Erro ao atualizar local: " + (error.message || JSON.stringify(error)));
        } finally {
            setIsLoading(false);
        }
    }

    // ==================== HELPERS ====================
    function openCreateModal() {
        setEditingId(null);
        setFormData({
            nome: '',
            endereco: '',
            telefone: '',
            tipo: 'LOJA',
            empresa_id: '00000000-0000-0000-0000-000000000001',
            cliente_id: '',
            data_abertura: '',
            data_encerramento: '',
            efectivos_dia: 0,
            total_efectivos: 0,
            numero_trabalhadores: 0,
            total_trabalhadores: 0,
            localizacao: '',
            titulo: '',
            codigo: '',
            descricao: '',
            contacto: '',
            observacoes: '',
            responsavel: ''
        });
        setIsModalOpen(true);
    }

    function openEditModal(location: any) {
        setEditingId(location.id);
        setFormData({
            nome: location.nome || '',
            endereco: location.endereco || '',
            telefone: location.telefone || '',
            tipo: location.tipo || 'LOJA',
            empresa_id: location.empresa_id || '00000000-0000-0000-0000-000000000001',
            cliente_id: location.cliente_id || '',
            data_abertura: location.data_abertura || '',
            data_encerramento: location.data_encerramento || '',
            efectivos_dia: location.efectivos_dia || 0,
            total_efectivos: location.total_efectivos || 0,
            numero_trabalhadores: location.numero_trabalhadores || 0,
            total_trabalhadores: location.total_trabalhadores || 0,
            localizacao: location.localizacao || '',
            titulo: location.titulo || '',
            codigo: location.codigo || '',
            descricao: location.descricao || '',
            contacto: location.contacto || '',
            observacoes: location.observacoes || '',
            responsavel: location.responsavel || ''
        });
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            nome: '',
            endereco: '',
            telefone: '',
            tipo: 'LOJA',
            empresa_id: '00000000-0000-0000-0000-000000000001',
            cliente_id: '',
            data_abertura: '',
            data_encerramento: '',
            efectivos_dia: 0,
            total_efectivos: 0,
            numero_trabalhadores: 0,
            total_trabalhadores: 0,
            localizacao: '',
            titulo: '',
            codigo: '',
            descricao: '',
            contacto: '',
            observacoes: '',
            responsavel: ''
        });
    }

    function handleSubmit() {
        if (editingId) {
            updateLocalTrabalho();
        } else {
            createLocalTrabalho();
        }
    }

    // Filtrar locais
    const filteredLocations = locations.filter(loc => {
        const matchesSearch =
            (loc.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (loc.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (loc.responsavel || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTipo = tipoFilter === 'ALL' || loc.tipo === tipoFilter;

        return matchesSearch && matchesTipo;
    });

    // Exportar para Excel
    function handleExportExcel() {
        const data = filteredLocations.map(loc => ({
            Código: loc.codigo || '',
            Nome: loc.nome,
            Tipo: loc.tipo,
            Endereço: loc.endereco || '',
            Telefone: loc.telefone || '',
            Responsável: loc.responsavel || '',
            'Nº Trabalhadores': loc.numero_trabalhadores || 0,
            'Total Trabalhadores': loc.total_trabalhadores || 0,
            'Data Abertura': loc.data_abertura ? formatDate(loc.data_abertura) : '',
            Localização: loc.localizacao || ''
        }));
        exportToExcel(data, 'Locais_de_Trabalho');
    }

    // Abrir Gestão de Local de Trabalho (navegação para nova página)
    function openGestao(location: any) {
        if (onNavigateToGestao) {
            onNavigateToGestao(location.id);
        }
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header - Padrão InvoiceList */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Local de Trabalho
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Database size={10} /> Cloud Sync
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500">Gestão de locais de trabalho (Sincronizado com Supabase)</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition font-medium"
                        disabled={isLoading}
                    >
                        <Plus size={16} /> Novo Local
                    </button>
                    <button
                        onClick={() => alert('Relatórios em desenvolvimento')}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded text-sm hover:bg-slate-200 transition font-medium"
                    >
                        <PieChart size={16} /> Relatórios
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition font-medium"
                        disabled={isLoading}
                    >
                        <Download size={16} /> Excel
                    </button>
                    <button
                        onClick={fetchLocalTrabalho}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded text-sm hover:bg-slate-200 transition font-medium"
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Atualizar
                    </button>
                </div>
            </div>

            {/* Filtros - Padrão InvoiceList */}
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex flex-wrap items-end gap-3 text-sm">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Pesquisa Geral</label>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Nome, Código, Responsável..."
                            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tipo</label>
                    <select
                        className="py-1.5 px-2 border border-slate-300 rounded w-32 outline-none"
                        value={tipoFilter}
                        onChange={e => setTipoFilter(e.target.value)}
                    >
                        <option value="ALL">Todos</option>
                        <option value="LOJA">Loja</option>
                        <option value="ARMAZEM">Armazém</option>
                        <option value="ESCRITORIO">Escritório</option>
                        <option value="FABRICA">Fábrica</option>
                        <option value="OUTRO">Outro</option>
                    </select>
                </div>
            </div>

            {/* Tabela - Padrão InvoiceList */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" id="localTrabalhoTable">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-3">Código</th>
                                <th className="p-3">Nome</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Responsável</th>
                                <th className="p-3">Trabalhadores</th>
                                <th className="p-3">Data Abertura</th>
                                <th className="p-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLocations.map(loc => {
                                const cliente = clientes.find(c => c.id === loc.cliente_id);
                                return (
                                    <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3 font-mono text-slate-600">{loc.codigo || '---'}</td>
                                        <td className="p-3 font-medium text-slate-800">{loc.nome}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${loc.tipo === 'LOJA' ? 'bg-blue-100 text-blue-700' :
                                                loc.tipo === 'ARMAZEM' ? 'bg-green-100 text-green-700' :
                                                    loc.tipo === 'ESCRITORIO' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {loc.tipo}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-600">{cliente?.nome || '---'}</td>
                                        <td className="p-3 text-slate-600">{loc.responsavel || '---'}</td>
                                        <td className="p-3 text-slate-600">{loc.numero_trabalhadores || 0} / {loc.total_trabalhadores || 0}</td>
                                        <td className="p-3 text-slate-600">{loc.data_abertura ? formatDate(loc.data_abertura) : '---'}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openGestao(loc)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                    title="Gestão de Local de Trabalho"
                                                >
                                                    <Briefcase size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(loc)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Editar"
                                                    disabled={isLoading}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => alert('Detalhes: ' + loc.nome)}
                                                    className="p-1.5 text-slate-600 hover:bg-slate-50 rounded transition"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredLocations.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-slate-400">
                                        Nenhum local de trabalho encontrado.
                                    </td>
                                </tr>
                            )}
                            {isLoading && (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-slate-400">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                        <p>Carregando...</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulário */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {editingId ? <Edit size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
                                {editingId ? 'Editar Local de Trabalho' : 'Novo Local de Trabalho'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-red-500 transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-slate-50 space-y-6">
                            {/* Seção 1: Informações Básicas */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Informações Básicas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Nome <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.nome}
                                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                            placeholder="Ex: Loja Benfica"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.titulo}
                                            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                            placeholder="Ex: Filial Principal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Código</label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.codigo}
                                            onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                            placeholder="Ex: LJ-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.tipo}
                                            onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                        >
                                            <option value="LOJA">Loja</option>
                                            <option value="ARMAZEM">Armazém</option>
                                            <option value="ESCRITORIO">Escritório</option>
                                            <option value="FABRICA">Fábrica</option>
                                            <option value="OUTRO">Outro</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Cliente <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.cliente_id}
                                            onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
                                        >
                                            <option value="">Selecione um cliente...</option>
                                            {clientes.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>
                                                    {cliente.nome} {cliente.nif ? `(NIF: ${cliente.nif})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Seção 2: Localização e Contato */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Localização e Contato</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Endereço</label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.endereco}
                                            onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                                            placeholder="Rua, Cidade..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Localização</label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.localizacao}
                                            onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                                            placeholder="Ex: Zona Norte"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Telefone</label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.telefone}
                                            onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                            placeholder="Ex: +244 923 456 789"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Contacto</label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.contacto}
                                            onChange={e => setFormData({ ...formData, contacto: e.target.value })}
                                            placeholder="Email ou outro contacto"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção 3: Gestão e Operação */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Gestão e Operação</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Responsável</label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.responsavel}
                                            onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                                            placeholder="Nome do responsável"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Data Abertura</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.data_abertura}
                                            onChange={e => setFormData({ ...formData, data_abertura: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Data Encerramento</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.data_encerramento}
                                            onChange={e => setFormData({ ...formData, data_encerramento: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Efetivos por Dia</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.efectivos_dia}
                                            onChange={e => setFormData({ ...formData, efectivos_dia: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Total Efetivos</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.total_efectivos}
                                            onChange={e => setFormData({ ...formData, total_efectivos: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Número de Trabalhadores</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.numero_trabalhadores}
                                            onChange={e => setFormData({ ...formData, numero_trabalhadores: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Total Trabalhadores</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.total_trabalhadores}
                                            onChange={e => setFormData({ ...formData, total_trabalhadores: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção 4: Descrição e Observações */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Descrição e Observações</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            value={formData.descricao}
                                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                            placeholder="Descrição detalhada do local..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Observações</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            value={formData.observacoes}
                                            onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                                            placeholder="Observações adicionais..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-2 sticky bottom-0">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold transition"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {editingId ? 'Atualizar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkLocationManager;
