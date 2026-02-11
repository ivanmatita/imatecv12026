
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Briefcase, TrendingUp, FileText, Calendar, DollarSign, Activity, Download, Printer } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { formatDate, formatCurrency } from '../utils';

interface GestaoLocalTrabalhoProps {
    locationId: string;
    onClose: () => void;
}

const GestaoLocalTrabalho: React.FC<GestaoLocalTrabalhoProps> = ({ locationId, onClose }) => {
    const [location, setLocation] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'movements' | 'reports'>('overview');

    useEffect(() => {
        fetchLocationData();
        fetchEmployees();
    }, [locationId]);

    async function fetchLocationData() {
        try {
            const { data, error } = await supabase
                .from('local_trabalho')
                .select('*')
                .eq('id', locationId)
                .single();

            if (error) throw error;
            setLocation(data);
        } catch (error) {
            console.error("❌ Erro ao carregar local de trabalho:", error);
            alert("Erro ao carregar dados do local de trabalho.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchEmployees() {
        try {
            // ✅ CORRIGIDO: Tabela correta é 'funcionarios', não 'employees'
            const { data, error } = await supabase
                .from('funcionarios')
                .select('*')
                .eq('work_location_id', locationId);

            if (error) {
                console.error("❌ Erro ao carregar colaboradores:", error);
                // Não mostrar alert, apenas logar o erro
                setEmployees([]);
            } else {
                setEmployees(data || []);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar colaboradores:", error);
            setEmployees([]);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!location) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-bold">Local de trabalho não encontrado.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                                title="Voltar"
                            >
                                <ArrowLeft size={24} className="text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <Briefcase size={28} className="text-blue-600" />
                                    Gestão de Local de Trabalho
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    {location.nome} • {location.codigo || 'Sem código'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 transition font-medium">
                                <Printer size={16} /> Imprimir
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                                <Download size={16} /> Exportar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === 'overview'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <TrendingUp size={16} className="inline mr-2" />
                            Visão Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === 'employees'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Users size={16} className="inline mr-2" />
                            Colaboradores ({employees.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('movements')}
                            className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === 'movements'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Activity size={16} className="inline mr-2" />
                            Movimentos
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === 'reports'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <FileText size={16} className="inline mr-2" />
                            Relatórios
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                    <Users size={20} />
                                    <span className="text-xs font-bold uppercase">Trabalhadores</span>
                                </div>
                                <p className="text-3xl font-black text-slate-800">
                                    {location.numero_trabalhadores || 0}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    de {location.total_trabalhadores || 0} total
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                    <Activity size={20} />
                                    <span className="text-xs font-bold uppercase">Efetivos/Dia</span>
                                </div>
                                <p className="text-3xl font-black text-slate-800">
                                    {location.efectivos_dia || 0}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    de {location.total_efectivos || 0} total
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-purple-600 mb-2">
                                    <Calendar size={20} />
                                    <span className="text-xs font-bold uppercase">Data Abertura</span>
                                </div>
                                <p className="text-lg font-bold text-slate-800">
                                    {location.data_abertura ? formatDate(location.data_abertura) : 'N/A'}
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-orange-600 mb-2">
                                    <Briefcase size={20} />
                                    <span className="text-xs font-bold uppercase">Tipo</span>
                                </div>
                                <p className="text-lg font-bold text-slate-800">
                                    {location.tipo || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Detalhes */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Informações Detalhadas</h3>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                    <span className="text-slate-500 font-bold">Nome:</span>
                                    <p className="text-slate-800 mt-1">{location.nome}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-bold">Código:</span>
                                    <p className="text-slate-800 mt-1">{location.codigo || '---'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-bold">Endereço:</span>
                                    <p className="text-slate-800 mt-1">{location.endereco || '---'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-bold">Telefone:</span>
                                    <p className="text-slate-800 mt-1">{location.telefone || '---'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-bold">Responsável:</span>
                                    <p className="text-slate-800 mt-1">{location.responsavel || '---'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-bold">Localização:</span>
                                    <p className="text-slate-800 mt-1">{location.localizacao || '---'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-500 font-bold">Descrição:</span>
                                    <p className="text-slate-800 mt-1">{location.descricao || '---'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-500 font-bold">Observações:</span>
                                    <p className="text-slate-800 mt-1">{location.observacoes || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">
                                Colaboradores Alocados ({employees.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-left text-xs font-bold text-slate-500 uppercase">
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Cargo</th>
                                        <th className="p-3">Departamento</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Salário Base</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-400">
                                                Nenhum colaborador alocado a este local de trabalho.
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map(emp => (
                                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 font-medium text-slate-800">{emp.nome}</td>
                                                <td className="p-3 text-slate-600">{emp.cargo || '---'}</td>
                                                <td className="p-3 text-slate-600">{emp.departamento || '---'}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {emp.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {emp.salario_base ? formatCurrency(emp.salario_base) : '---'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'movements' && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Movimentos Relacionados</h3>
                        <p className="text-slate-500 text-sm">
                            Funcionalidade em desenvolvimento. Aqui serão exibidos todos os movimentos (vendas, compras, transferências) relacionados a este local de trabalho.
                        </p>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Relatório de Posto</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2">Período de Atividade</h4>
                                <p className="text-slate-600">
                                    <strong>Abertura:</strong> {location.data_abertura ? formatDate(location.data_abertura) : 'Não definida'}<br />
                                    <strong>Encerramento:</strong> {location.data_encerramento ? formatDate(location.data_encerramento) : 'Em atividade'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2">Recursos Humanos</h4>
                                <p className="text-slate-600">
                                    <strong>Trabalhadores Atuais:</strong> {location.numero_trabalhadores || 0}<br />
                                    <strong>Capacidade Total:</strong> {location.total_trabalhadores || 0}<br />
                                    <strong>Efetivos por Dia:</strong> {location.efectivos_dia || 0}<br />
                                    <strong>Total de Efetivos:</strong> {location.total_efectivos || 0}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2">Observações</h4>
                                <p className="text-slate-600">{location.observacoes || 'Nenhuma observação registada.'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestaoLocalTrabalho;
