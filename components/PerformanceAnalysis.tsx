
import React from 'react';
import { BarChart, Activity, TrendingUp, Users, Target } from 'lucide-react';

const PerformanceAnalysis: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans p-6 pb-20">
            {/* Teramind-style Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-900 to-indigo-800 p-6 rounded-t-2xl shadow-lg text-white">
                <div>
                    <h1 className="text-2xl font-light flex items-center gap-3 tracking-tight">
                        <Activity className="text-white/80" size={32} /> Análise de Desempenho
                    </h1>
                    <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        Recursos Humanos / Métricas e KPIs
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 shadow-xl p-8 -mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Target size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700">Objetivos Alcançados</h3>
                                <p className="text-xs text-slate-500">Média Global</p>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800">85%</p>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700">Produtividade</h3>
                                <p className="text-xs text-slate-500">Variação Mensal</p>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800">+12%</p>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-green-600 h-full rounded-full" style={{ width: '65%' }}></div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700">Assiduidade</h3>
                                <p className="text-xs text-slate-500">Presença Global</p>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800">96%</p>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: '96%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <BarChart size={64} className="text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-500">Gráficos Detalhados em Desenvolvimento</h3>
                    <p className="text-slate-400 max-w-md text-center mt-2">
                        Esta funcionalidade permitirá visualizar o desempenho individual e coletivo dos colaboradores com base em métricas personalizadas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalysis;
