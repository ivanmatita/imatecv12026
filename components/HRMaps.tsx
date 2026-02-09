import React, { useState, useMemo } from 'react';
import { Table, ArrowLeft, Users, Briefcase, DollarSign, PieChart as PieChartIcon, TrendingUp, FileText, Calendar } from 'lucide-react';
import { Employee, AttendanceRecord, Company } from '../types';
import WorkersSalaryMap from './WorkersSalaryMap';
import EffectivenessMapAnnual from './EffectivenessMapAnnual';

interface HRMapsProps {
    onClose?: () => void;
    employees?: Employee[];
    attendance?: AttendanceRecord[];
    company?: Company;
}

const HRMaps: React.FC<HRMapsProps> = ({ onClose, employees = [], attendance = [], company = { name: 'IMATEC SOFT', nif: '5000000000' } as any }) => {
    const [activeView, setActiveView] = React.useState<'DASHBOARD' | 'WORKERS_SALARY' | 'EFFECTIVENESS_ANNUAL'>('DASHBOARD');

    // Derived Statistics
    const stats: {
        total: number;
        active: number;
        onLeave: number;
        terminated: number;
        totalSalary: number;
        deptCounts: Record<string, number>;
        genderCounts: Record<string, number>;
    } = useMemo(() => {
        const total = employees.length;
        const active = employees.filter(e => e.status === 'Active').length;
        const onLeave = employees.filter(e => e.status === 'OnLeave').length; // Corrected status check
        const terminated = employees.filter(e => e.status === 'Terminated').length;

        const totalSalary = employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0);

        // Department Distribution
        const deptCounts = employees.reduce((acc, e) => {
            const dept = e.department || 'Geral';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Gender Distribution
        const genderCounts = employees.reduce((acc, e) => {
            const g = e.gender === 'M' ? 'Masculino' : e.gender === 'F' ? 'Feminino' : 'Outro';
            acc[g] = (acc[g] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { total, active, onLeave, terminated, totalSalary, deptCounts, genderCounts };
    }, [employees]);

    if (activeView === 'WORKERS_SALARY') {
        return <WorkersSalaryMap employees={employees} onClose={() => setActiveView('DASHBOARD')} company={company} />;
    }

    if (activeView === 'EFFECTIVENESS_ANNUAL') {
        return <EffectivenessMapAnnual employees={employees} attendance={attendance} onClose={() => setActiveView('DASHBOARD')} company={company} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-2xl shadow-lg text-white mb-6">
                    <div>
                        <h1 className="text-2xl font-light flex items-center gap-3 tracking-tight">
                            <Table className="text-white/80" size={32} />
                            Mapas de RH
                        </h1>
                        <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">
                            Indicadores e relatórios de Capital Humano
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-white/20 font-medium"
                        >
                            <ArrowLeft size={18} />
                            Voltar
                        </button>
                    )}
                </div>

                {/* Report Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setActiveView('WORKERS_SALARY')}
                        className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4 group"
                    >
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                            <FileText size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-slate-800">Trabalhadores por Vencimento</h3>
                            <p className="text-sm text-slate-500">Listagem detalhada de salários e subsídios</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveView('EFFECTIVENESS_ANNUAL')}
                        className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4 group"
                    >
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                            <Calendar size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-slate-800">Mapa de Efectividade Anual</h3>
                            <p className="text-sm text-slate-500">Resumo de presenças, faltas e férias</p>
                        </div>
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total de Funcionários"
                        value={stats.total}
                        icon={<Users className="text-blue-500" />}
                        bg="bg-blue-50"
                        border="border-blue-100"
                    />
                    <StatCard
                        title="Funcionários Activos"
                        value={stats.active}
                        icon={<Briefcase className="text-emerald-500" />}
                        bg="bg-emerald-50"
                        border="border-emerald-100"
                    />
                    <StatCard
                        title="Massa Salarial Mensal"
                        value={stats.totalSalary.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        icon={<DollarSign className="text-amber-500" />}
                        bg="bg-amber-50"
                        border="border-amber-100"
                        isCurrency
                    />
                    <StatCard
                        title="Em Licença"
                        value={stats.onLeave}
                        icon={<TrendingUp className="text-purple-500" />}
                        bg="bg-purple-50"
                        border="border-purple-100"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Department Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase size={18} className="text-slate-400" /> Distribuição por Departamento
                            </h3>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 border-b border-slate-200">Departamento</th>
                                        <th className="px-6 py-3 border-b border-slate-200 text-right">Funcionários</th>
                                        <th className="px-6 py-3 border-b border-slate-200 w-1/3">Percentagem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {Object.entries(stats.deptCounts).map(([dept, count], idx) => {
                                        const percentage = Math.round((count / (stats.total || 1)) * 100);
                                        return (
                                            <tr key={dept} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">{dept}</td>
                                                <td className="px-6 py-4 text-slate-600 text-right font-mono">{count}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'][idx % 5]}`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-slate-400 w-8 text-right">{percentage}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {stats.total === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">Sem dados disponíveis</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Gender Distribution & Others */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <PieChartIcon size={18} className="text-slate-400" /> Género
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {Object.entries(stats.genderCounts).map(([gender, count], idx) => {
                                        const percentage = Math.round((count / (stats.total || 1)) * 100);
                                        return (
                                            <div key={gender}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-bold text-slate-700">{gender}</span>
                                                    <span className="text-slate-500">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${gender === 'Masculino' ? 'bg-blue-500' : gender === 'Feminino' ? 'bg-pink-500' : 'bg-slate-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-light mb-2">Relatório Geral</h3>
                                <p className="text-slate-400 text-sm mb-6">Baixe o mapa completo de recursos humanos em formato Excel ou PDF.</p>
                                <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors shadow">
                                    Exportar Relatório
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Table size={120} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, bg, border, isCurrency = false }: { title: string, value: string | number, icon: React.ReactNode, bg: string, border: string, isCurrency?: boolean }) => (
    <div className={`rounded-xl shadow-sm border p-6 flex items-start justify-between ${bg} ${border}`}>
        <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <p className={`font-black text-slate-800 ${isCurrency ? 'text-2xl' : 'text-3xl'}`}>{value}</p>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm">
            {icon}
        </div>
    </div>
);

export default HRMaps;
