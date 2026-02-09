import React, { useState } from 'react';
import {
    Church, Users, DollarSign, Calendar, TrendingDown, FileText,
    Plus, Search, Edit, Trash2, Save, Printer, Download, Eye, ArrowLeft,
    Heart, Gift, BookOpen, UserCheck, Building2, PieChart
} from 'lucide-react';
import { generateId, formatCurrency, formatDate } from '../utils';

// TIPOS
interface Member {
    id: string;
    nome: string;
    telefone: string;
    email: string;
    endereco: string;
    data_nascimento: string;
    data_batismo: string;
    ministerio: string;
    situacao: 'ATIVO' | 'AFASTADO' | 'TRANSFERIDO';
    data_cadastro: string;
}

interface Offering {
    id: string;
    membro_id: string;
    membro_nome: string;
    tipo: 'DIZIMO' | 'OFERTA' | 'DOACAO' | 'CAMPANHA';
    valor: number;
    data: string;
    mes: string;
    ano: string;
    observacao: string;
}

interface Event {
    id: string;
    nome: string;
    tipo: 'CULTO' | 'CAMPANHA' | 'REUNIAO' | 'EVENTO_ESPECIAL';
    data: string;
    horario: string;
    local: string;
    responsavel: string;
    descricao: string;
}

interface Expense {
    id: string;
    tipo: string;
    descricao: string;
    valor: number;
    data: string;
    responsavel: string;
    categoria: 'MANUTENCAO' | 'SALARIOS' | 'UTILIDADES' | 'EVENTOS' | 'OUTROS';
}

interface ChurchManagementProps { }

const ChurchManagement: React.FC<ChurchManagementProps> = () => {
    const [activeView, setActiveView] = useState('DASHBOARD');
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de dados
    const [members, setMembers] = useState<Member[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Estados de formulários
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [showOfferingForm, setShowOfferingForm] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);

    // Estados de relatórios
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeReport, setActiveReport] = useState('');
    const [reportFilters, setReportFilters] = useState({
        mesInicio: '',
        mesFim: '',
        ano: new Date().getFullYear().toString(),
        tipo: ''
    });

    // Formulários
    const [memberForm, setMemberForm] = useState<Partial<Member>>({
        nome: '', telefone: '', email: '', endereco: '', data_nascimento: '',
        data_batismo: '', ministerio: '', situacao: 'ATIVO',
        data_cadastro: new Date().toISOString().split('T')[0]
    });

    const [offeringForm, setOfferingForm] = useState<Partial<Offering>>({
        membro_id: '', membro_nome: '', tipo: 'DIZIMO', valor: 0,
        data: new Date().toISOString().split('T')[0],
        mes: (new Date().getMonth() + 1).toString().padStart(2, '0'),
        ano: new Date().getFullYear().toString(),
        observacao: ''
    });

    const [eventForm, setEventForm] = useState<Partial<Event>>({
        nome: '', tipo: 'CULTO', data: new Date().toISOString().split('T')[0],
        horario: '', local: '', responsavel: '', descricao: ''
    });

    const [expenseForm, setExpenseForm] = useState<Partial<Expense>>({
        tipo: '', descricao: '', valor: 0,
        data: new Date().toISOString().split('T')[0],
        responsavel: '', categoria: 'OUTROS'
    });

    // FUNÇÕES DE SALVAMENTO
    const saveMember = () => {
        setMembers([...members, { id: generateId(), ...memberForm as Member }]);
        setShowMemberForm(false);
        setMemberForm({
            nome: '', telefone: '', email: '', endereco: '', data_nascimento: '',
            data_batismo: '', ministerio: '', situacao: 'ATIVO',
            data_cadastro: new Date().toISOString().split('T')[0]
        });
        alert('Membro cadastrado com sucesso!');
    };

    const saveOffering = () => {
        const selectedMember = members.find(m => m.id === offeringForm.membro_id);
        setOfferings([...offerings, {
            id: generateId(),
            ...offeringForm,
            membro_nome: selectedMember?.nome || ''
        } as Offering]);
        setShowOfferingForm(false);
        setOfferingForm({
            membro_id: '', membro_nome: '', tipo: 'DIZIMO', valor: 0,
            data: new Date().toISOString().split('T')[0],
            mes: (new Date().getMonth() + 1).toString().padStart(2, '0'),
            ano: new Date().getFullYear().toString(),
            observacao: ''
        });
        alert('Contribuição registada com sucesso!');
    };

    const saveEvent = () => {
        setEvents([...events, { id: generateId(), ...eventForm as Event }]);
        setShowEventForm(false);
        setEventForm({
            nome: '', tipo: 'CULTO', data: new Date().toISOString().split('T')[0],
            horario: '', local: '', responsavel: '', descricao: ''
        });
        alert('Evento cadastrado com sucesso!');
    };

    const saveExpense = () => {
        setExpenses([...expenses, { id: generateId(), ...expenseForm as Expense }]);
        setShowExpenseForm(false);
        setExpenseForm({
            tipo: '', descricao: '', valor: 0,
            data: new Date().toISOString().split('T')[0],
            responsavel: '', categoria: 'OUTROS'
        });
        alert('Despesa registada com sucesso!');
    };

    // CÁLCULOS
    const totalDizimos = offerings.filter(o => o.tipo === 'DIZIMO').reduce((sum, o) => sum + o.valor, 0);
    const totalOfertas = offerings.filter(o => o.tipo === 'OFERTA').reduce((sum, o) => sum + o.valor, 0);
    const totalDoacoes = offerings.filter(o => o.tipo === 'DOACAO').reduce((sum, o) => sum + o.valor, 0);
    const totalEntradas = offerings.reduce((sum, o) => sum + o.valor, 0);
    const totalDespesas = expenses.reduce((sum, e) => sum + e.valor, 0);
    const saldo = totalEntradas - totalDespesas;

    // RENDERIZAÇÕES
    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Church className="text-purple-600" size={36} />
                        Gestão de Igreja - Dashboard
                    </h1>
                    <p className="text-slate-600 mt-2">Administração completa da sua igreja</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setActiveView('MEMBERS')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md">
                        <Plus size={20} /> Novo Membro
                    </button>
                    <button onClick={() => setActiveView('OFFERINGS')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md">
                        <Plus size={20} /> Nova Contribuição
                    </button>
                    <button onClick={() => setActiveView('REPORTS')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md">
                        <FileText size={20} /> Relatórios
                    </button>
                </div>
            </div>

            {/* Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Users size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">TOTAL</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Membros Ativos</p>
                    <p className="text-3xl font-bold">{members.filter(m => m.situacao === 'ATIVO').length}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Heart size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">MÊS</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Dízimos</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalDizimos)}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Gift size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">MÊS</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Ofertas</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalOfertas)}</p>
                </div>

                <div className={`bg-gradient-to-br ${saldo >= 0 ? 'from-teal-500 to-teal-600' : 'from-red-500 to-red-600'} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform`}>
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">SALDO</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Saldo Atual</p>
                    <p className="text-3xl font-bold">{formatCurrency(Math.abs(saldo))}</p>
                </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <PieChart className="text-green-600" size={24} />
                        Entradas por Tipo
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <span className="font-medium text-slate-700">Dízimos</span>
                            <span className="font-bold text-green-600">{formatCurrency(totalDizimos)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <span className="font-medium text-slate-700">Ofertas</span>
                            <span className="font-bold text-blue-600">{formatCurrency(totalOfertas)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <span className="font-medium text-slate-700">Doações</span>
                            <span className="font-bold text-purple-600">{formatCurrency(totalDoacoes)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingDown className="text-red-600" size={24} />
                        Resumo Financeiro
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <span className="font-medium text-slate-700">Total Entradas</span>
                            <span className="font-bold text-green-600">{formatCurrency(totalEntradas)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                            <span className="font-medium text-slate-700">Total Despesas</span>
                            <span className="font-bold text-red-600">{formatCurrency(totalDespesas)}</span>
                        </div>
                        <div className={`flex items-center justify-between p-4 ${saldo >= 0 ? 'bg-teal-50 border-teal-500' : 'bg-orange-50 border-orange-500'} rounded-lg border-l-4`}>
                            <span className="font-medium text-slate-700">Saldo</span>
                            <span className={`font-bold ${saldo >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                                {saldo >= 0 ? '+' : ''}{formatCurrency(saldo)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Próximos Eventos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={24} />
                    Próximos Eventos
                </h3>
                <div className="space-y-2">
                    {events.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()).slice(0, 5).map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-blue-600" size={20} />
                                <div>
                                    <p className="font-medium text-slate-800">{event.nome}</p>
                                    <p className="text-xs text-slate-500">{formatDate(event.data)} - {event.horario}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{event.tipo}</span>
                        </div>
                    ))}
                    {events.length === 0 && <p className="text-slate-500 text-center py-4">Nenhum evento cadastrado</p>}
                </div>
            </div>
        </div>
    );

    const renderMembers = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-purple-600" size={28} />
                    Membros da Igreja
                </h1>
                <button onClick={() => setShowMemberForm(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md">
                    <Plus size={20} /> Novo Membro
                </button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar membros..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ministério</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Situação</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {members.filter(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase())).map(member => (
                            <tr key={member.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{member.nome}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{member.telefone}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{member.ministerio}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${member.situacao === 'ATIVO' ? 'bg-green-100 text-green-700' :
                                            member.situacao === 'AFASTADO' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>{member.situacao}</span>
                                </td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ver"><Eye size={18} /></button>
                                    <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Editar"><Edit size={18} /></button>
                                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => setMembers(members.filter(m => m.id !== member.id))} title="Eliminar"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOfferings = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Heart className="text-green-600" size={28} />
                    Dízimos e Ofertas
                </h1>
                <button onClick={() => setShowOfferingForm(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md">
                    <Plus size={20} /> Nova Contribuição
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Membro</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {offerings.map(offering => (
                            <tr key={offering.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{offering.membro_nome}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${offering.tipo === 'DIZIMO' ? 'bg-green-100 text-green-700' :
                                            offering.tipo === 'OFERTA' ? 'bg-blue-100 text-blue-700' :
                                                offering.tipo === 'DOACAO' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-orange-100 text-orange-700'
                                        }`}>{offering.tipo}</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-green-600">{formatCurrency(offering.valor)}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(offering.data)}</td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ver"><Eye size={18} /></button>
                                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => setOfferings(offerings.filter(o => o.id !== offering.id))} title="Eliminar"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderEvents = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={28} />
                    Eventos da Igreja
                </h1>
                <button onClick={() => setShowEventForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
                    <Plus size={20} /> Novo Evento
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Horário</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Local</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {events.map(event => (
                            <tr key={event.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{event.nome}</td>
                                <td className="px-6 py-4 text-sm">{event.tipo}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(event.data)}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{event.horario}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{event.local}</td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Editar"><Edit size={18} /></button>
                                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => setEvents(events.filter(e => e.id !== event.id))} title="Eliminar"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderExpenses = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingDown className="text-red-600" size={28} />
                    Despesas da Igreja
                </h1>
                <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md">
                    <Plus size={20} /> Nova Despesa
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Responsável</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {expenses.map(expense => (
                            <tr key={expense.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{expense.tipo}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{expense.descricao}</td>
                                <td className="px-6 py-4 text-sm font-bold text-red-600">{formatCurrency(expense.valor)}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(expense.data)}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{expense.responsavel}</td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Editar"><Edit size={18} /></button>
                                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))} title="Eliminar"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={28} />
                Relatórios da Igreja
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                    onClick={() => { setActiveReport('DIZIMOS_PERIODO'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-green-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Heart className="text-green-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Dízimos por Período</h3>
                            <p className="text-xs text-slate-600">Análise mensal/anual</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => { setActiveReport('OFERTAS_MEMBRO'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-blue-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Gift className="text-blue-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Ofertas por Membro</h3>
                            <p className="text-xs text-slate-600">Contribuições individuais</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => { setActiveReport('DESPESAS_ENTRADAS'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-purple-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <PieChart className="text-purple-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Despesas vs Entradas</h3>
                            <p className="text-xs text-slate-600">Balanço financeiro</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'DASHBOARD': return renderDashboard();
            case 'MEMBERS': return renderMembers();
            case 'OFFERINGS': return renderOfferings();
            case 'EVENTS': return renderEvents();
            case 'EXPENSES': return renderExpenses();
            case 'REPORTS': return renderReports();
            default: return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Navegação */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setActiveView('DASHBOARD')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Dashboard</button>
                    <button onClick={() => setActiveView('MEMBERS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'MEMBERS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Membros</button>
                    <button onClick={() => setActiveView('OFFERINGS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'OFFERINGS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Dízimos e Ofertas</button>
                    <button onClick={() => setActiveView('EVENTS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'EVENTS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Eventos</button>
                    <button onClick={() => setActiveView('EXPENSES')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'EXPENSES' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Despesas</button>
                    <button onClick={() => setActiveView('REPORTS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'REPORTS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Relatórios</button>
                </div>
            </div>

            {renderContent()}

            {/* MODAL MEMBRO */}
            {showMemberForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-purple-600 text-white p-6 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Novo Membro</h2>
                            <button onClick={() => setShowMemberForm(false)} className="text-white"><ArrowLeft size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo *</label><input type="text" value={memberForm.nome} onChange={e => setMemberForm({ ...memberForm, nome: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Telefone</label><input type="text" value={memberForm.telefone} onChange={e => setMemberForm({ ...memberForm, telefone: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Email</label><input type="email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
                            </div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Endereço</label><input type="text" value={memberForm.endereco} onChange={e => setMemberForm({ ...memberForm, endereco: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Data de Nascimento</label><input type="date" value={memberForm.data_nascimento} onChange={e => setMemberForm({ ...memberForm, data_nascimento: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Data de Batismo</label><input type="date" value={memberForm.data_batismo} onChange={e => setMemberForm({ ...memberForm, data_batismo: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Ministério</label><input type="text" value={memberForm.ministerio} onChange={e => setMemberForm({ ...memberForm, ministerio: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Ex: Louvor, Intercessão" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Situação</label><select value={memberForm.situacao} onChange={e => setMemberForm({ ...memberForm, situacao: e.target.value as any })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"><option value="ATIVO">Ativo</option><option value="AFASTADO">Afastado</option><option value="TRANSFERIDO">Transferido</option></select></div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-b-lg flex justify-end gap-3">
                            <button onClick={() => setShowMemberForm(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold">Cancelar</button>
                            <button onClick={saveMember} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold flex items-center gap-2"><Save size={18} />Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONTRIBUIÇÃO */}
            {showOfferingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="bg-green-600 text-white p-6 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Nova Contribuição</h2>
                            <button onClick={() => setShowOfferingForm(false)} className="text-white"><ArrowLeft size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Membro *</label><select value={offeringForm.membro_id} onChange={e => setOfferingForm({ ...offeringForm, membro_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"><option value="">Selecione...</option>{members.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Tipo *</label><select value={offeringForm.tipo} onChange={e => setOfferingForm({ ...offeringForm, tipo: e.target.value as any })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"><option value="DIZIMO">Dízimo</option><option value="OFERTA">Oferta</option><option value="DOACAO">Doação</option><option value="CAMPANHA">Campanha</option></select></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Valor *</label><input type="number" value={offeringForm.valor} onChange={e => setOfferingForm({ ...offeringForm, valor: Number(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" /></div>
                            </div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Data</label><input type="date" value={offeringForm.data} onChange={e => setOfferingForm({ ...offeringForm, data: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Observação</label><textarea value={offeringForm.observacao} onChange={e => setOfferingForm({ ...offeringForm, observacao: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" rows={3}></textarea></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-b-lg flex justify-end gap-3">
                            <button onClick={() => setShowOfferingForm(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold">Cancelar</button>
                            <button onClick={saveOffering} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2"><Save size={18} />Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EVENTO */}
            {showEventForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="bg-blue-600 text-white p-6 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Novo Evento</h2>
                            <button onClick={() => setShowEventForm(false)} className="text-white"><ArrowLeft size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Nome do Evento *</label><input type="text" value={eventForm.nome} onChange={e => setEventForm({ ...eventForm, nome: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Tipo *</label><select value={eventForm.tipo} onChange={e => setEventForm({ ...eventForm, tipo: e.target.value as any })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="CULTO">Culto</option><option value="CAMPANHA">Campanha</option><option value="REUNIAO">Reunião</option><option value="EVENTO_ESPECIAL">Evento Especial</option></select></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Data *</label><input type="date" value={eventForm.data} onChange={e => setEventForm({ ...eventForm, data: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Horário</label><input type="time" value={eventForm.horario} onChange={e => setEventForm({ ...eventForm, horario: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Local</label><input type="text" value={eventForm.local} onChange={e => setEventForm({ ...eventForm, local: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            </div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Responsável</label><input type="text" value={eventForm.responsavel} onChange={e => setEventForm({ ...eventForm, responsavel: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label><textarea value={eventForm.descricao} onChange={e => setEventForm({ ...eventForm, descricao: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3}></textarea></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-b-lg flex justify-end gap-3">
                            <button onClick={() => setShowEventForm(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold">Cancelar</button>
                            <button onClick={saveEvent} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2"><Save size={18} />Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DESPESA */}
            {showExpenseForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="bg-red-600 text-white p-6 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Nova Despesa</h2>
                            <button onClick={() => setShowExpenseForm(false)} className="text-white"><ArrowLeft size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Tipo *</label><input type="text" value={expenseForm.tipo} onChange={e => setExpenseForm({ ...expenseForm, tipo: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Categoria *</label><select value={expenseForm.categoria} onChange={e => setExpenseForm({ ...expenseForm, categoria: e.target.value as any })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"><option value="MANUTENCAO">Manutenção</option><option value="SALARIOS">Salários</option><option value="UTILIDADES">Utilidades</option><option value="EVENTOS">Eventos</option><option value="OUTROS">Outros</option></select></div>
                            </div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label><textarea value={expenseForm.descricao} onChange={e => setExpenseForm({ ...expenseForm, descricao: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500" rows={2}></textarea></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Valor *</label><input type="number" value={expenseForm.valor} onChange={e => setExpenseForm({ ...expenseForm, valor: Number(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-2">Data</label><input type="date" value={expenseForm.data} onChange={e => setExpenseForm({ ...expenseForm, data: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                            </div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Responsável</label><input type="text" value={expenseForm.responsavel} onChange={e => setExpenseForm({ ...expenseForm, responsavel: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500" /></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-b-lg flex justify-end gap-3">
                            <button onClick={() => setShowExpenseForm(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold">Cancelar</button>
                            <button onClick={saveExpense} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2"><Save size={18} />Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChurchManagement;
