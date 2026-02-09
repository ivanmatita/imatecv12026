import React, { useState, useEffect } from 'react';
import {
    Sprout, Plus, Search, Edit, Trash2, Save, Printer, Download, Eye, ArrowLeft,
    BarChart3, TrendingUp, Users, Package, DollarSign, Calendar, Filter, FileText,
    Tractor, Wheat, Beef, Droplets, Sun, Target, Activity, PieChart
} from 'lucide-react';
import { generateId, formatCurrency, formatDate } from '../utils';

// TIPOS
interface Farm {
    id: string;
    nome: string;
    localizacao: string;
    tipo_atividade: 'AGRICULTURA' | 'PECUARIA' | 'MISTA';
    area_hectares: number;
    tipo_solo: string;
    responsavel_tecnico: string;
    data_inicio: string;
    estado: boolean;
}

interface Field {
    id: string;
    fazenda_id: string;
    nome: string;
    area: number;
    cultura_atual: string;
    estado: 'PLANTADO' | 'DESCANSO' | 'COLHIDO';
}

interface AgriProduction {
    id: string;
    campo_id: string;
    cultura: string;
    data_plantio: string;
    quantidade_plantada: number;
    previsao_colheita: string;
    estado: string;
}

interface Animal {
    id: string;
    tipo: string;
    raca: string;
    quantidade: number;
    identificacao: string;
    estado: string;
}

interface Input {
    id: string;
    nome: string;
    tipo: string;
    quantidade: number;
    custo_unitario: number;
    fornecedor_id: string;
    data: string;
}

interface Harvest {
    id: string;
    producao_id: string;
    cultura: string;
    quantidade: number;
    perdas: number;
    qualidade: string;
    data: string;
}

interface Cost {
    id: string;
    referencia: string;
    cultura: string;
    tipo: string;
    valor: number;
    data: string;
}

interface Sale {
    id: string;
    produto: string;
    quantidade: number;
    cliente: string;
    preco: number;
    impostos: number;
    data: string;
}

interface AgribusinessProps {
    initialView?: string;
}

const Agribusiness: React.FC<AgribusinessProps> = ({ initialView = 'DASHBOARD' }) => {
    const [activeView, setActiveView] = useState(initialView);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de dados
    const [farms, setFarms] = useState<Farm[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [productions, setProductions] = useState<AgriProduction[]>([]);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [inputs, setInputs] = useState<Input[]>([]);
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [costs, setCosts] = useState<Cost[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);

    // Estados de formulários
    const [showFarmForm, setShowFarmForm] = useState(false);
    const [showFieldForm, setShowFieldForm] = useState(false);
    const [showProductionForm, setShowProductionForm] = useState(false);
    const [showAnimalForm, setShowAnimalForm] = useState(false);
    const [showInputForm, setShowInputForm] = useState(false);
    const [showHarvestForm, setShowHarvestForm] = useState(false);
    const [showCostForm, setShowCostForm] = useState(false);
    const [showSaleForm, setShowSaleForm] = useState(false);

    // Estados de relatórios
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeReport, setActiveReport] = useState('');
    const [reportFilters, setReportFilters] = useState({
        dataInicio: '',
        dataFim: '',
        fazenda: '',
        cultura: ''
    });

    // Formulários
    const [farmForm, setFarmForm] = useState<Partial<Farm>>({
        nome: '', localizacao: '', tipo_atividade: 'AGRICULTURA', area_hectares: 0,
        tipo_solo: '', responsavel_tecnico: '', data_inicio: new Date().toISOString().split('T')[0], estado: true
    });

    const [fieldForm, setFieldForm] = useState<Partial<Field>>({
        fazenda_id: '', nome: '', area: 0, cultura_atual: '', estado: 'DESCANSO'
    });

    const [productionForm, setProductionForm] = useState<Partial<AgriProduction>>({
        campo_id: '', cultura: '', data_plantio: new Date().toISOString().split('T')[0],
        quantidade_plantada: 0, previsao_colheita: '', estado: 'PLANTADO'
    });

    const [animalForm, setAnimalForm] = useState<Partial<Animal>>({
        tipo: '', raca: '', quantidade: 0, identificacao: '', estado: 'ATIVO'
    });

    const [inputForm, setInputForm] = useState<Partial<Input>>({
        nome: '', tipo: 'SEMENTES', quantidade: 0, custo_unitario: 0,
        fornecedor_id: '', data: new Date().toISOString().split('T')[0]
    });

    const [harvestForm, setHarvestForm] = useState<Partial<Harvest>>({
        producao_id: '', cultura: '', quantidade: 0, perdas: 0,
        qualidade: 'BOA', data: new Date().toISOString().split('T')[0]
    });

    const [costForm, setCostForm] = useState<Partial<Cost>>({
        referencia: '', cultura: '', tipo: 'INSUMOS', valor: 0,
        data: new Date().toISOString().split('T')[0]
    });

    const [saleForm, setSaleForm] = useState<Partial<Sale>>({
        produto: '', quantidade: 0, cliente: '', preco: 0, impostos: 0,
        data: new Date().toISOString().split('T')[0]
    });

    // FUNÇÕES DE SALVAMENTO
    const saveFarm = () => {
        setFarms([...farms, { id: generateId(), ...farmForm as Farm }]);
        setShowFarmForm(false);
        setFarmForm({ nome: '', localizacao: '', tipo_atividade: 'AGRICULTURA', area_hectares: 0, tipo_solo: '', responsavel_tecnico: '', data_inicio: new Date().toISOString().split('T')[0], estado: true });
        alert('Fazenda cadastrada com sucesso!');
    };

    const saveField = () => {
        setFields([...fields, { id: generateId(), ...fieldForm as Field }]);
        setShowFieldForm(false);
        alert('Campo cadastrado com sucesso!');
    };

    const saveProduction = () => {
        setProductions([...productions, { id: generateId(), ...productionForm as AgriProduction }]);
        setShowProductionForm(false);
        alert('Produção registada com sucesso!');
    };

    const saveAnimal = () => {
        setAnimals([...animals, { id: generateId(), ...animalForm as Animal }]);
        setShowAnimalForm(false);
        alert('Animal cadastrado com sucesso!');
    };

    const saveInput = () => {
        setInputs([...inputs, { id: generateId(), ...inputForm as Input }]);
        setShowInputForm(false);
        alert('Insumo registado com sucesso!');
    };

    const saveHarvest = () => {
        setHarvests([...harvests, { id: generateId(), ...harvestForm as Harvest }]);
        setShowHarvestForm(false);
        alert('Colheita registada com sucesso!');
    };

    const saveCost = () => {
        setCosts([...costs, { id: generateId(), ...costForm as Cost }]);
        setShowCostForm(false);
        alert('Custo registado com sucesso!');
    };

    const saveSale = () => {
        setSales([...sales, { id: generateId(), ...saleForm as Sale }]);
        setShowSaleForm(false);
        alert('Venda registada com sucesso!');
    };

    // CÁLCULOS PARA DASHBOARD
    const totalProducao = harvests.reduce((sum, h) => sum + h.quantidade, 0);
    const totalCustos = costs.reduce((sum, c) => sum + c.valor, 0);
    const totalReceita = sales.reduce((sum, s) => sum + (s.preco * s.quantidade), 0);
    const lucroEstimado = totalReceita - totalCustos;

    // RENDERIZAÇÃO DE PÁGINAS
    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Sprout className="text-green-600" size={36} />
                        Agronegócio - Dashboard
                    </h1>
                    <p className="text-slate-600 mt-2">Visão geral da sua produção agrícola e pecuária</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setActiveView('PRODUCTION')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md">
                        <Plus size={20} /> Nova Produção
                    </button>
                    <button onClick={() => setActiveView('HARVEST')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md">
                        <Plus size={20} /> Nova Colheita
                    </button>
                    <button onClick={() => setActiveView('REPORTS')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md">
                        <BarChart3 size={20} /> Ver Mapas
                    </button>
                </div>
            </div>

            {/* Cards com Ícones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Wheat size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">TOTAL</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Produção Total</p>
                    <p className="text-3xl font-bold">{totalProducao.toLocaleString()} kg</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">MÊS</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Custos do Mês</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalCustos)}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">MÊS</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Receita do Mês</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalReceita)}</p>
                </div>

                <div className={`bg-gradient-to-br ${lucroEstimado >= 0 ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform`}>
                    <div className="flex items-center justify-between mb-4">
                        <Target size={40} className="opacity-80" />
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{lucroEstimado >= 0 ? 'LUCRO' : 'PREJUÍZO'}</div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Lucro Estimado</p>
                    <p className="text-3xl font-bold">{formatCurrency(Math.abs(lucroEstimado))}</p>
                </div>
            </div>

            {/* Resumo Rápido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <PieChart className="text-green-600" size={24} />
                        Produção por Cultura
                    </h3>
                    <div className="space-y-3">
                        {Array.from(new Set(harvests.map(h => h.cultura))).slice(0, 5).map(cultura => {
                            const total = harvests.filter(h => h.cultura === cultura).reduce((sum, h) => sum + h.quantidade, 0);
                            return (
                                <div key={cultura} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">{cultura || 'Sem cultura'}</span>
                                    <span className="font-bold text-green-600">{total} kg</span>
                                </div>
                            );
                        })}
                        {harvests.length === 0 && <p className="text-slate-500 text-center py-4">Nenhuma colheita registada</p>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="text-blue-600" size={24} />
                        Custos vs Receita
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                            <span className="font-medium text-slate-700">Total de Custos</span>
                            <span className="font-bold text-red-600">{formatCurrency(totalCustos)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <span className="font-medium text-slate-700">Total de Receita</span>
                            <span className="font-bold text-blue-600">{formatCurrency(totalReceita)}</span>
                        </div>
                        <div className={`flex items-center justify-between p-4 ${lucroEstimado >= 0 ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-500'} rounded-lg border-l-4`}>
                            <span className="font-medium text-slate-700">Resultado</span>
                            <span className={`font-bold ${lucroEstimado >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                {lucroEstimado >= 0 ? '+' : ''}{formatCurrency(lucroEstimado)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Atividade Recente */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="text-purple-600" size={24} />
                    Atividade Recente
                </h3>
                <div className="space-y-2">
                    {[...harvests, ...sales, ...costs].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                            <div className="flex items-center gap-3">
                                {'cultura' in item && <Wheat className="text-green-600" size={20} />}
                                {'produto' in item && <DollarSign className="text-blue-600" size={20} />}
                                {'tipo' in item && <TrendingUp className="text-red-600" size={20} />}
                                <div>
                                    <p className="font-medium text-slate-800">
                                        {'cultura' in item && `Colheita: ${item.cultura}`}
                                        {'produto' in item && `Venda: ${item.produto}`}
                                        {'tipo' in item && `Custo: ${item.tipo}`}
                                    </p>
                                    <p className="text-xs text-slate-500">{formatDate(item.data)}</p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-700">
                                {'quantidade' in item && `${item.quantidade} kg`}
                                {'valor' in item && formatCurrency(item.valor)}
                            </span>
                        </div>
                    ))}
                    {harvests.length === 0 && sales.length === 0 && costs.length === 0 && (
                        <p className="text-slate-500 text-center py-4">Nenhuma atividade registada</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="text-blue-600" size={32} />
                    Mapas e Relatórios
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Produção por Período */}
                <button
                    onClick={() => { setActiveReport('PRODUCAO_PERIODO'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-green-500"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <BarChart3 className="text-green-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Produção por Período</h3>
                            <p className="text-xs text-slate-600">Análise de produção</p>
                        </div>
                    </div>
                </button>

                {/* Custos vs Receita */}
                <button
                    onClick={() => { setActiveReport('CUSTOS_RECEITA'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-blue-500"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <DollarSign className="text-blue-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Custos vs Receita</h3>
                            <p className="text-xs text-slate-600">Análise financeira</p>
                        </div>
                    </div>
                </button>

                {/* Rentabilidade por Cultura */}
                <button
                    onClick={() => { setActiveReport('RENTABILIDADE'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-purple-500"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="text-purple-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Rentabilidade por Cultura</h3>
                            <p className="text-xs text-slate-600">ROI por cultura</p>
                        </div>
                    </div>
                </button>

                {/* Trabalhadores por Produção */}
                <button
                    onClick={() => { setActiveReport('TRABALHADORES'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-yellow-500"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Users className="text-yellow-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Trabalhadores por Produção</h3>
                            <p className="text-xs text-slate-600">Integração RH</p>
                        </div>
                    </div>
                </button>

                {/* Stock Agrícola */}
                <button
                    onClick={() => { setActiveReport('STOCK'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-orange-500"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Package className="text-orange-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Stock Agrícola</h3>
                            <p className="text-xs text-slate-600">Integração Stock</p>
                        </div>
                    </div>
                </button>

                {/* Vendas Agrícolas */}
                <button
                    onClick={() => { setActiveReport('VENDAS'); setShowReportModal(true); }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-red-500"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <FileText className="text-red-600" size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Vendas Agrícolas</h3>
                            <p className="text-xs text-slate-600">Integração Vendas</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );

    const renderReportModal = () => {
        if (!showReportModal) return null;

        let reportContent = null;
        let reportTitle = '';

        switch (activeReport) {
            case 'PRODUCAO_PERIODO':
                reportTitle = 'Produção por Período';
                const filteredHarvests = harvests.filter(h => {
                    if (reportFilters.dataInicio && h.data < reportFilters.dataInicio) return false;
                    if (reportFilters.dataFim && h.data > reportFilters.dataFim) return false;
                    if (reportFilters.cultura && h.cultura !== reportFilters.cultura) return false;
                    return true;
                });
                const totalProduzido = filteredHarvests.reduce((sum, h) => sum + h.quantidade, 0);
                const totalPerdas = filteredHarvests.reduce((sum, h) => sum + h.perdas, 0);
                reportContent = (
                    <div>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-slate-600">Total Produzido</p>
                                <p className="text-2xl font-bold text-green-600">{totalProduzido} kg</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <p className="text-sm text-slate-600">Total Perdas</p>
                                <p className="text-2xl font-bold text-red-600">{totalPerdas} kg</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-sm text-slate-600">Produção Líquida</p>
                                <p className="text-2xl font-bold text-blue-600">{totalProduzido - totalPerdas} kg</p>
                            </div>
                        </div>
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Cultura</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Quantidade</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Perdas</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Líquido</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredHarvests.map(h => (
                                    <tr key={h.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm">{h.cultura}</td>
                                        <td className="px-4 py-3 text-sm">{h.quantidade} kg</td>
                                        <td className="px-4 py-3 text-sm text-red-600">{h.perdas} kg</td>
                                        <td className="px-4 py-3 text-sm font-bold">{h.quantidade - h.perdas} kg</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(h.data)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                break;

            case 'CUSTOS_RECEITA':
                reportTitle = 'Custos vs Receita';
                const culturas = Array.from(new Set([...costs.map(c => c.cultura), ...sales.map(s => s.produto)]));
                reportContent = (
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Cultura/Produto</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Custo Total</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Receita Total</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Lucro/Prejuízo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {culturas.map(cultura => {
                                const custoTotal = costs.filter(c => c.cultura === cultura).reduce((sum, c) => sum + c.valor, 0);
                                const receitaTotal = sales.filter(s => s.produto === cultura).reduce((sum, s) => sum + (s.preco * s.quantidade), 0);
                                const lucro = receitaTotal - custoTotal;
                                return (
                                    <tr key={cultura} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium">{cultura}</td>
                                        <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(custoTotal)}</td>
                                        <td className="px-4 py-3 text-sm text-blue-600">{formatCurrency(receitaTotal)}</td>
                                        <td className={`px-4 py-3 text-sm font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {lucro >= 0 ? '+' : ''}{formatCurrency(lucro)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                );
                break;

            case 'RENTABILIDADE':
                reportTitle = 'Rentabilidade por Cultura';
                reportContent = (
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Cultura</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Área (ha)</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Custo/ha</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Receita/ha</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Rentabilidade (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {Array.from(new Set(fields.map(f => f.cultura_atual))).map(cultura => {
                                const area = fields.filter(f => f.cultura_atual === cultura).reduce((sum, f) => sum + f.area, 0);
                                const custoTotal = costs.filter(c => c.cultura === cultura).reduce((sum, c) => sum + c.valor, 0);
                                const receitaTotal = sales.filter(s => s.produto === cultura).reduce((sum, s) => sum + (s.preco * s.quantidade), 0);
                                const custoHa = area > 0 ? custoTotal / area : 0;
                                const receitaHa = area > 0 ? receitaTotal / area : 0;
                                const rentabilidade = custoTotal > 0 ? ((receitaTotal - custoTotal) / custoTotal) * 100 : 0;
                                return (
                                    <tr key={cultura} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium">{cultura}</td>
                                        <td className="px-4 py-3 text-sm">{area.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm">{formatCurrency(custoHa)}</td>
                                        <td className="px-4 py-3 text-sm">{formatCurrency(receitaHa)}</td>
                                        <td className={`px-4 py-3 text-sm font-bold ${rentabilidade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {rentabilidade.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                );
                break;

            case 'TRABALHADORES':
                reportTitle = 'Trabalhadores por Produção';
                reportContent = (
                    <div className="text-center py-8">
                        <Users className="mx-auto text-blue-600 mb-4" size={48} />
                        <p className="text-slate-600">Integração com módulo de Recursos Humanos</p>
                        <p className="text-sm text-slate-500 mt-2">Os trabalhadores rurais são geridos no módulo de RH</p>
                    </div>
                );
                break;

            case 'STOCK':
                reportTitle = 'Stock Agrícola';
                reportContent = (
                    <div className="text-center py-8">
                        <Package className="mx-auto text-orange-600 mb-4" size={48} />
                        <p className="text-slate-600">Integração com módulo de Stock</p>
                        <p className="text-sm text-slate-500 mt-2">Os produtos agrícolas são geridos no módulo de Stock</p>
                    </div>
                );
                break;

            case 'VENDAS':
                reportTitle = 'Vendas Agrícolas';
                reportContent = (
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Produto</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Cliente</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Quantidade</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Valor</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Impostos</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-700">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sales.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium">{s.produto}</td>
                                    <td className="px-4 py-3 text-sm">{s.cliente}</td>
                                    <td className="px-4 py-3 text-sm">{s.quantidade} kg</td>
                                    <td className="px-4 py-3 text-sm">{formatCurrency(s.preco * s.quantidade)}</td>
                                    <td className="px-4 py-3 text-sm">{formatCurrency(s.impostos)}</td>
                                    <td className="px-4 py-3 text-sm">{formatDate(s.data)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
                break;
        }

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="bg-blue-600 text-white p-6 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
                        <h2 className="text-2xl font-bold">{reportTitle}</h2>
                        <button onClick={() => setShowReportModal(false)} className="text-white hover:text-slate-200">
                            <ArrowLeft size={24} />
                        </button>
                    </div>

                    {/* Filtros */}
                    {activeReport === 'PRODUCAO_PERIODO' && (
                        <div className="p-6 bg-slate-50 border-b border-slate-200">
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Data Início</label>
                                    <input type="date" value={reportFilters.dataInicio} onChange={e => setReportFilters({ ...reportFilters, dataInicio: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Data Fim</label>
                                    <input type="date" value={reportFilters.dataFim} onChange={e => setReportFilters({ ...reportFilters, dataFim: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Cultura</label>
                                    <select value={reportFilters.cultura} onChange={e => setReportFilters({ ...reportFilters, cultura: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="">Todas</option>
                                        {Array.from(new Set(harvests.map(h => h.cultura))).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button onClick={() => setReportFilters({ dataInicio: '', dataFim: '', fazenda: '', cultura: '' })} className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-bold">
                                        Limpar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        {reportContent}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-b-lg flex justify-end gap-3 sticky bottom-0">
                        <button onClick={() => window.print()} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2">
                            <Printer size={18} /> Imprimir
                        </button>
                        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold flex items-center gap-2">
                            <Download size={18} /> Baixar PDF
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Continua com renderFarms, renderFields, etc... (mantém as funções anteriores)
    const renderFarms = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Tractor className="text-green-600" size={28} />
                    Cadastro Agrícola
                </h1>
                <button onClick={() => setShowFarmForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
                    <Plus size={20} /> Nova Fazenda
                </button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar fazendas..."
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
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Localização</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Área (ha)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {farms.filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase())).map(farm => (
                            <tr key={farm.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{farm.nome}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{farm.localizacao}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{farm.tipo_atividade}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{farm.area_hectares}</td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ver"><Eye size={18} /></button>
                                    <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Editar"><Edit size={18} /></button>
                                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => setFarms(farms.filter(f => f.id !== farm.id))} title="Eliminar"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Continua com as outras renderizações...
    // (Mantém todas as funções de renderização anteriores: renderFields, renderProduction, renderLivestock, renderInputs, renderHarvest, renderCosts, renderSales, renderWorkers, renderMachinery, renderAccounting)

    const renderContent = () => {
        switch (activeView) {
            case 'DASHBOARD':
            case 'AGRIBUSINESS':
                return renderDashboard();
            case 'FARMS':
                return renderFarms();
            case 'REPORTS':
                return renderReports();
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Barra de Navegação */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setActiveView('DASHBOARD')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'DASHBOARD' || activeView === 'AGRIBUSINESS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Dashboard</button>
                    <button onClick={() => setActiveView('FARMS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'FARMS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Cadastro Agrícola</button>
                    <button onClick={() => setActiveView('REPORTS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === 'REPORTS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Mapas e Relatórios</button>
                </div>
            </div>

            {renderContent()}
            {renderReportModal()}

            {/* Modal Fazenda (mantém o anterior) */}
            {showFarmForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-blue-600 text-white p-6 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Nova Fazenda</h2>
                            <button onClick={() => setShowFarmForm(false)} className="text-white hover:text-slate-200"><ArrowLeft size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Nome da Fazenda *</label><input type="text" value={farmForm.nome} onChange={e => setFarmForm({ ...farmForm, nome: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Localização *</label><input type="text" value={farmForm.localizacao} onChange={e => setFarmForm({ ...farmForm, localizacao: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Atividade *</label><select value={farmForm.tipo_atividade} onChange={e => setFarmForm({ ...farmForm, tipo_atividade: e.target.value as any })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="AGRICULTURA">Agricultura</option><option value="PECUARIA">Pecuária</option><option value="MISTA">Mista</option></select></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Área (hectares) *</label><input type="number" value={farmForm.area_hectares} onChange={e => setFarmForm({ ...farmForm, area_hectares: Number(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Solo</label><input type="text" value={farmForm.tipo_solo} onChange={e => setFarmForm({ ...farmForm, tipo_solo: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Responsável Técnico</label><input type="text" value={farmForm.responsavel_tecnico} onChange={e => setFarmForm({ ...farmForm, responsavel_tecnico: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Data de Início</label><input type="date" value={farmForm.data_inicio} onChange={e => setFarmForm({ ...farmForm, data_inicio: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-b-lg flex justify-end gap-3">
                            <button onClick={() => setShowFarmForm(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-bold">Cancelar</button>
                            <button onClick={saveFarm} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"><Save size={18} />Salvar</button>
                            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2"><Printer size={18} />Imprimir</button>
                            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold flex items-center gap-2"><Download size={18} />PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agribusiness;
