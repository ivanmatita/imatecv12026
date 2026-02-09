
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Invoice, Company, WorkLocation, InvoiceType, InvoiceStatus } from '../types';
import { generateId, formatCurrency, formatDate } from '../utils';
import { supabase } from '../services/supabaseClient';
import { printDocument, downloadPDF, downloadExcel } from "../utils/exportUtils";
import {
    Search, MapPin, ArrowLeft, X, RefreshCw, UserPlus, Printer,
    Database, Loader2, Save, Send, Share2, FileSearch, History,
    DollarSign, FileCheck, Landmark, FileSpreadsheet, Calendar,
    MoreVertical, Edit2, Globe, Phone, Mail, Building2, User, ChevronDown, FileText, Filter
} from 'lucide-react';

interface ClientListProps {
    clients: Client[];
    onSaveClient: (client: Client) => void;
    initialSelectedClientId?: string | null;
    onClearSelection?: () => void;
    companyId?: string;
    currentCompany?: Company;
    invoices?: Invoice[];
    workLocations?: WorkLocation[];
}

const ClientList: React.FC<ClientListProps> = ({
    clients, onSaveClient, initialSelectedClientId, onClearSelection, companyId,
    currentCompany, invoices = [], workLocations = []
}) => {
    const [view, setView] = useState<'LIST' | 'FORM' | 'CONTA_CORRENTE'>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [dbClients, setDbClients] = useState<Client[]>([]);
    const [activeEmpresaId, setActiveEmpresaId] = useState<string | null>(null);

    // Filtros Conta Corrente
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterDocType, setFilterDocType] = useState('ALL');

    useEffect(() => {
        inicializarSupabase();
    }, []);

    useEffect(() => {
        if (initialSelectedClientId) {
            const found = allClients.find(c => c.id === initialSelectedClientId);
            if (found) {
                setSelectedClient(found);
                setView('CONTA_CORRENTE');
            }
        }
    }, [initialSelectedClientId, clients, dbClients]);

    async function inicializarSupabase() {
        setIsLoading(true);
        try {
            let { data: empresas } = await supabase.from('empresas').select('id').limit(1);
            if (empresas && empresas.length > 0) {
                setActiveEmpresaId(empresas[0].id);
            } else {
                setActiveEmpresaId('00000000-0000-0000-0000-000000000001');
            }
            await carregarClientesSupabase();
        } catch (err: any) {
            console.error("Erro Supabase:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function carregarClientesSupabase() {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;

            if (data) {
                const mapped: Client[] = data.map(c => ({
                    id: c.id,
                    name: c.nome || '',
                    email: c.email || '',
                    phone: c.telefone || '',
                    vatNumber: c.nif || '',
                    address: c.endereco || '',
                    city: c.localidade || 'Luanda',
                    country: c.pais || 'Angola',
                    province: c.provincia || '',
                    municipality: c.municipio || '',
                    postalCode: c.codigo_postal || '',
                    webPage: c.web_page || '',
                    clientType: c.tipo_cliente || 'nao grupo nacional',
                    iban: c.iban || '',
                    isAccountShared: c.conta_partilhada || false,
                    initialBalance: Number(c.saldo_inicial || 0),
                    accountBalance: 0,
                    transactions: []
                }));
                setDbClients(mapped);
            }
        } catch (err: any) {
            console.error(err);
        }
    }

    const allClients = useMemo(() => {
        const combined = [...dbClients, ...clients];
        const uniqueMap = new Map();
        combined.forEach(c => {
            if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
        });
        const unique = Array.from(uniqueMap.values());
        const sTerm = searchTerm.toLowerCase();

        return unique.filter(c => {
            const name = (c.name || '').toLowerCase();
            const nif = (c.vatNumber || '');
            return name.includes(sTerm) || nif.includes(sTerm);
        });
    }, [dbClients, clients, searchTerm]);

    const accountMovements = useMemo(() => {
        if (!selectedClient) return [];

        const movements = invoices.filter(inv => {
            if (inv.clientId !== selectedClient.id) return false;
            if (!inv.isCertified) return false;

            const d = new Date(inv.date);
            if (filterStartDate && d < new Date(filterStartDate)) return false;
            if (filterEndDate && d > new Date(filterEndDate)) return false;
            if (filterDocType !== 'ALL' && inv.type !== filterDocType) return false;

            return true;
        }).map(inv => {
            const amount = inv.currency === 'AOA' ? inv.total : inv.contraValue || inv.total;
            const isDebit = [InvoiceType.FT, InvoiceType.FR, InvoiceType.VD, InvoiceType.ND].includes(inv.type);

            return {
                id: inv.id,
                date: inv.date,
                docNo: inv.number,
                type: inv.type,
                description: inv.type === InvoiceType.FT ? 'Factura Emitida' :
                    inv.type === InvoiceType.FR ? 'Factura Recibo Emitida' :
                        inv.type === InvoiceType.NC ? 'Nota de Crédito' :
                            inv.type === InvoiceType.RG ? 'Recibo de Pagamento' : inv.type,
                debit: isDebit ? amount : 0,
                credit: !isDebit ? amount : 0,
                project: workLocations.find(w => w.id === inv.workLocationId)?.name || 'Obra Generica'
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningBalance = selectedClient.initialBalance || 0;
        return movements.map(m => {
            runningBalance = runningBalance + m.debit - m.credit;
            return { ...m, balance: runningBalance };
        });
    }, [selectedClient, invoices, filterStartDate, filterEndDate, filterDocType, workLocations]);

    const totalPeriodDebit = accountMovements.reduce((a, b) => a + b.debit, 0);
    const totalPeriodCredit = accountMovements.reduce((a, b) => a + b.credit, 0);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.vatNumber) return alert('Contribuinte e Nome são obrigatórios');

        setIsLoading(true);
        const payload: any = {
            nome: formData.name,
            email: formData.email || '',
            telefone: formData.phone || '',
            nif: formData.vatNumber,
            endereco: formData.address || '',
            localidade: formData.city || 'Luanda',
            provincia: formData.province || '',
            municipio: formData.municipality || '',
            codigo_postal: formData.postalCode || '',
            pais: 'Angola',
            web_page: formData.webPage || '',
            tipo_cliente: formData.clientType || 'nao grupo nacional',
            iban: formData.iban || '',
            conta_partilhada: formData.isAccountShared || false,
            saldo_inicial: Number(formData.initialBalance || 0),
            empresa_id: activeEmpresaId
        };

        try {
            const { error } = await supabase
                .from('clientes')
                .upsert(formData.id ? { ...payload, id: formData.id } : payload);

            if (error) throw error;

            await carregarClientesSupabase();
            setView('LIST');
            alert("Cliente registado com sucesso!");
        } catch (err: any) {
            alert("Erro ao salvar: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderList = () => (
        <div className="space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Teramind Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-t-2xl shadow-lg text-white">
                <div>
                    <h1 className="text-2xl font-light flex items-center gap-2">
                        <User /> Gestão de Clientes
                    </h1>
                    <p className="text-xs text-orange-100 flex items-center gap-1 font-bold uppercase tracking-widest">
                        <Database size={12} /> Base de Dados / Clientes
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={carregarClientesSupabase} className="px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Sincronizar
                    </button>
                    <button onClick={() => { setFormData({ clientType: 'não grupo nacional', city: 'Luanda', country: 'Angola' }); setView('FORM'); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600 font-bold shadow-lg uppercase tracking-wider">
                        <UserPlus size={16} /> NOVO CLIENTE
                    </button>
                </div>
            </div>

            <div className="bg-white p-3 border-x border-slate-200 mt-0 flex items-center gap-3 shadow-inner bg-slate-50/50">
                <Search className="text-orange-400" size={18} />
                <input className="flex-1 outline-none text-sm bg-transparent" placeholder="Pesquisar cliente por nome ou NIF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-xl overflow-hidden flex-1 -mt-6 pt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-bold text-slate-400">Contribuinte</th>
                                <th className="p-4 font-bold text-slate-400">Nome do Cliente</th>
                                <th className="p-4 font-bold text-slate-400">Localidade</th>
                                <th className="p-4 font-bold text-slate-400">Tipo</th>
                                <th className="p-4 text-right font-bold text-slate-400">Saldo Corrente</th>
                                <th className="p-4 text-center font-bold text-slate-400">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allClients.map((client) => {
                                const currentBal = (client.initialBalance || 0) + invoices.filter(i => i.clientId === client.id && i.isCertified && i.status !== InvoiceStatus.CANCELLED).reduce((acc, i) => {
                                    const isDebit = [InvoiceType.FT, InvoiceType.FR, InvoiceType.VD, InvoiceType.ND].includes(i.type);
                                    return acc + (isDebit ? i.total : -i.total);
                                }, 0);
                                return (
                                    <tr key={client.id} className="hover:bg-orange-50/50 transition-colors">
                                        <td className="p-4 font-mono text-slate-600">{client.vatNumber}</td>
                                        <td className="p-4 font-medium text-slate-800">{client.name}</td>
                                        <td className="p-4 text-slate-500">{client.city}</td>
                                        <td className="p-4 text-[10px] uppercase font-bold text-slate-400">{client.clientType}</td>
                                        <td className={`p-4 text-right font-bold ${currentBal > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{formatCurrency(currentBal)}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => { setSelectedClient(client); setView('CONTA_CORRENTE'); }} className="text-orange-500 font-bold hover:underline hover:bg-orange-50 px-3 py-1.5 rounded transition">Ver Conta</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderContaCorrente = () => {
        if (!selectedClient) return null;
        return (
            <div className="p-6 bg-white min-h-screen animate-in fade-in flex flex-col" id="extractArea">
                {/* Header / Toolbar - Estilo Imagem */}
                <div className="flex justify-between items-start mb-8 print:hidden">
                    <button onClick={() => { setView('LIST'); onClearSelection?.(); }} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-3 py-1.5 rounded-lg transition-colors border">
                        <ArrowLeft size={16} /> Voltar para Lista
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => downloadExcel("extractTable", `CC_${selectedClient.name}`)} className="p-2 bg-slate-100 hover:bg-green-100 rounded-full text-slate-600 transition-colors border shadow-sm">
                            <span className="text-[10px] font-black mr-1">XLSX</span>
                            <FileSpreadsheet size={16} />
                        </button>
                        <button className="p-2 bg-slate-100 hover:bg-blue-100 rounded-full text-slate-600 transition-colors border shadow-sm">
                            <span className="text-[10px] font-black mr-1">JAN</span>
                            <Calendar size={16} />
                        </button>
                        <button className="p-2 bg-slate-100 hover:bg-red-100 rounded-full text-slate-600 transition-colors border shadow-sm">
                            <span className="text-[10px] font-black mr-1">$</span>
                            <DollarSign size={16} />
                        </button>
                        <button onClick={() => printDocument("extractArea")} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors border shadow-sm">
                            <Printer size={16} />
                        </button>
                    </div>
                </div>

                {/* Identificação do Cliente e Empresa - Estilo Imagem */}
                <div className="flex justify-between items-start mb-10 text-[10px] font-sans">
                    <div className="space-y-1">
                        <div className="text-slate-400">Data de Emissão</div>
                        <div className="font-bold">{new Date().toLocaleString('pt-AO')}</div>
                        <div className="font-bold uppercase mt-2">ADMINISTRADOR DO SISTEMA</div>
                        <div className="mt-4">
                            <h2 className="text-lg font-black text-slate-800 uppercase">Extrato Cliente</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest">CC-3 {selectedClient.name} {formatDate(new Date().toISOString()).replace(/ /g, '')}</p>
                        </div>
                    </div>

                    <div className="text-right space-y-1">
                        <div className="text-slate-400">Nº Contribuinte</div>
                        <div className="font-black text-sm">{selectedClient.vatNumber}</div>
                        <div className="text-slate-500 mt-2">Descrição do extrato Conta Corrente</div>
                        <div className="text-slate-500 font-bold">Período: Início a {formatDate(new Date().toISOString())}</div>
                        <div className="mt-4 text-[9px] text-slate-400 uppercase">Cod. 3</div>
                    </div>

                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 w-full max-w-[350px] relative">
                        <div className="absolute top-0 right-0 h-4 w-48 bg-gradient-to-l from-slate-300 to-transparent opacity-20"></div>
                        <h3 className="font-black text-sm text-slate-800 uppercase border-b border-slate-300 pb-1 mb-2">{selectedClient.name}</h3>
                        <div className="space-y-0.5 text-slate-600 font-bold uppercase">
                            <p>{selectedClient.address || 'LUANDA'}</p>
                            <p>{selectedClient.city || 'LUANDA'}</p>
                            <p>{selectedClient.postalCode || '0000-000'}</p>
                            <p>{selectedClient.province || 'LUANDA'}</p>
                            <p>{selectedClient.country || 'AO'}</p>
                        </div>
                    </div>
                </div>

                {/* Filtros de Operação */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap gap-4 items-end print:hidden">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Filtrar por Documento</label>
                        <select className="w-full border p-2 rounded bg-white font-bold text-xs" value={filterDocType} onChange={e => setFilterDocType(e.target.value)}>
                            <option value="ALL">Todos os Documentos</option>
                            {Object.values(InvoiceType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Início</label>
                        <input type="date" className="border p-2 rounded bg-white text-xs font-bold" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Fim</label>
                        <input type="date" className="border p-2 rounded bg-white text-xs font-bold" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
                    </div>
                    <button className="bg-slate-800 text-white px-4 py-2 rounded font-bold text-xs flex items-center gap-2" onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterDocType('ALL'); }}>
                        <Filter size={14} /> Limpar
                    </button>
                </div>

                {/* Cabeçalho da Tabela - Estilo Imagem */}
                <div className="border-t border-slate-300 pt-1 flex justify-between items-end mb-4 font-bold text-[10px] text-slate-600">
                    <div className="flex gap-16">
                        <span className="uppercase tracking-widest">Conta Corrente de Cliente</span>
                        <span className="text-slate-900">AOA</span>
                    </div>
                    <div className="flex gap-16">
                        <span>[ AOA ]</span>
                        <span className="uppercase flex gap-4">Saldo Acumulado Geral <span className="text-slate-900 font-black text-sm">{formatCurrency(selectedClient.accountBalance).replace('Kz', '')}</span></span>
                    </div>
                </div>

                {/* Table Extract */}
                <div className="flex-1 overflow-auto border-t border-slate-300">
                    <table className="w-full text-left text-[9px] border-collapse" id="extractTable">
                        <thead className="text-slate-500 font-bold uppercase border-b-2 border-slate-900">
                            <tr>
                                <th className="py-2 pr-4">Data Valor<br />Data Documento</th>
                                <th className="py-2 pr-4">File Interno<br />File Cliente</th>
                                <th className="py-2 pr-4">URN<br />EndService</th>
                                <th className="py-2 pr-4">Doc Nº<br />OriginatingOn</th>
                                <th className="py-2 pr-4">Descricao<br />Doc. Suporte</th>
                                <th className="py-2 text-right w-32">Credito</th>
                                <th className="py-2 text-right w-32">Debito</th>
                                <th className="py-2 text-right w-32">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                            {/* Acumulados do Periodo */}
                            <tr className="bg-white font-bold text-slate-700">
                                <td colSpan={5} className="py-3 text-right pr-4 uppercase tracking-widest text-[8px] font-black">Acumulados do Periodo ────</td>
                                <td className="py-3 text-right">{formatCurrency(totalPeriodCredit).replace('Kz', '')}</td>
                                <td className="py-3 text-right">{formatCurrency(totalPeriodDebit).replace('Kz', '')}</td>
                                <td className="py-3 text-right">0,00</td>
                            </tr>

                            {accountMovements.map((m, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="py-2 font-black text-slate-800 border-l-8 border-slate-300 pl-2 group-hover:border-blue-500">
                                        {formatDate(m.date).replace(/ /g, '-')}<br />
                                        {formatDate(m.date).replace(/ /g, '-')}
                                    </td>
                                    <td className="py-2 font-bold text-slate-700">
                                        {m.project}<br />
                                        ---
                                    </td>
                                    <td className="py-2 text-slate-400">
                                        ---<br />
                                        ---
                                    </td>
                                    <td className="py-2 font-black text-blue-900">
                                        {m.docNo}<br />
                                        ---
                                    </td>
                                    <td className="py-2 font-black text-slate-700 uppercase">
                                        {m.description}<br />
                                        ---
                                    </td>
                                    <td className="py-2 text-right text-emerald-600 font-black">{m.credit > 0 ? formatCurrency(m.credit).replace('Kz', '') : '0,00'}</td>
                                    <td className="py-2 text-right text-red-600 font-black">{m.debit > 0 ? formatCurrency(m.debit).replace('Kz', '') : '0,00'}</td>
                                    <td className="py-2 text-right font-black text-slate-900 bg-slate-50/50">{formatCurrency(m.balance).replace('Kz', '')}</td>
                                </tr>
                            ))}

                            {/* Saldo Inicial - Estilo Imagem */}
                            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                                <td colSpan={5} className="py-2 px-2 uppercase text-[8px] font-black">Saldo Inicial</td>
                                <td className="py-2"></td>
                                <td className="py-2"></td>
                                <td className="py-2 text-right font-black">{formatCurrency(selectedClient.initialBalance || 0).replace('Kz', '')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 text-[8px] text-slate-400 font-mono flex justify-between items-center">
                    <span>Processado por computador | Licença ERP IMATEC V.2.0</span>
                    <span className="font-bold">Página 1 de 1</span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full">
            {view === 'LIST' && renderList()}
            {view === 'FORM' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <UserPlus size={20} className="text-blue-600" />
                                {formData.id ? 'Editar Cliente' : 'Novo Cliente'}
                            </h2>
                            <button onClick={() => setView('LIST')} className="text-slate-400 hover:text-red-500 transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <form id="client-form" onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Contribuinte (NIF) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="999999999"
                                            value={formData.vatNumber || ''}
                                            onChange={e => setFormData({ ...formData, vatNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Nome Completo <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome do Cliente"
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Morada
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Endereço oficial"
                                        value={formData.address || ''}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Localidade
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.city || ''}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Província
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.province || ''}
                                            onChange={e => setFormData({ ...formData, province: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Município
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.municipality || ''}
                                            onChange={e => setFormData({ ...formData, municipality: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Código Postal
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.postalCode || ''}
                                            onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Telefone
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="+244..."
                                            value={formData.phone || ''}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="cliente@email.ao"
                                            value={formData.email || ''}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            WebPage
                                        </label>
                                        <input
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="www.cliente.ao"
                                            value={formData.webPage || ''}
                                            onChange={e => setFormData({ ...formData, webPage: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Saldo Inicial (Kz)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                            value={formData.initialBalance || 0}
                                            onChange={e => setFormData({ ...formData, initialBalance: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                            Tipo de Cliente
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.clientType}
                                            onChange={e => setFormData({ ...formData, clientType: e.target.value })}
                                        >
                                            <option value="nacional">Nacional</option>
                                            <option value="não grupo nacional">Não Grupo Nacional</option>
                                            <option value="estrangeiro">Estrangeiro</option>
                                            <option value="associados">Associados</option>
                                            <option value="outros">Outros</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-2">
                            <button
                                onClick={() => setView('LIST')}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="client-form"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Guardar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {view === 'CONTA_CORRENTE' && renderContaCorrente()}
        </div>
    );
};

export default ClientList;
