import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { Calendar, Search, Filter, Save, FileSpreadsheet, Printer, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface AttendanceMapPageProps {
    employees: Employee[];
    companyName: string;
    workLocations: { id: string; name: string }[];
    attendanceRecords: AttendanceRecord[];
}

const AttendanceMapPage: React.FC<AttendanceMapPageProps> = ({ employees, companyName, workLocations, attendanceRecords }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWorkLocation, setSelectedWorkLocation] = useState<string>('all');
    const [searchText, setSearchText] = useState('');

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const months = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];

    const getDayLabel = (day: number) => {
        const date = new Date(selectedYear, selectedMonth - 1, day);
        const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        return labels[date.getDay()];
    };

    const isWeekend = (day: number) => {
        const date = new Date(selectedYear, selectedMonth - 1, day);
        return date.getDay() === 0 || date.getDay() === 6;
    };

    const getStatus = (empId: string, day: number) => {
        const record = attendanceRecords.find(r =>
            r.employeeId === empId &&
            r.month === selectedMonth &&
            r.year === selectedYear
        );

        if (!record || !record.days || !record.days[day]) {
            if (isWeekend(day)) return 'F'; // Folga default on weekends
            return ''; // Unknown/Empty default
        }

        const status = record.days[day].status;

        switch (status) {
            case 'FOLGA': return 'F';
            case 'SERVICO': return 'P';
            case 'FALTA_INJUST': return 'V';
            case 'FALTA_JUST': return 'J';
            case 'FERIAS': return 'A'; // Using A for Ferias/Absence based on original mock behavior
            case 'ADMISSAO': return 'I'; // Início
            default: return isWeekend(day) ? 'F' : '';
        }
    };

    const getStats = (empId: string) => {
        const record = attendanceRecords.find(r =>
            r.employeeId === empId &&
            r.month === selectedMonth &&
            r.year === selectedYear
        );

        let presencas = 0;
        let faltas = 0;

        if (record && record.days) {
            Object.values(record.days).forEach(d => {
                if (d.status === 'SERVICO') presencas++;
                if (d.status === 'FALTA_INJUST') faltas++;
            });
        }

        return { presencas, faltas };
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
                (emp.employeeNumber && emp.employeeNumber.includes(searchText));
            const matchesLocation = selectedWorkLocation === 'all' || emp.workLocationId === selectedWorkLocation;
            return matchesSearch && matchesLocation;
        });
    }, [employees, searchText, selectedWorkLocation]);

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 shadow-lg rounded-t-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Mapa de Assiduidade</h1>
                        <p className="text-blue-200 text-sm font-medium mt-1">Gestão de Presenças e Efetividade</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 p-1 rounded-lg backdrop-blur-sm border border-white/20">
                        <button
                            onClick={() => setSelectedMonth(m => m === 1 ? 12 : m - 1)}
                            className="p-2 text-white hover:bg-white/20 rounded transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-white font-bold uppercase min-w-[140px] text-center">
                            {months[selectedMonth - 1]} {selectedYear}
                        </span>
                        <button
                            onClick={() => setSelectedMonth(m => m === 12 ? 1 : m + 1)}
                            className="p-2 text-white hover:bg-white/20 rounded transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center shadow-sm z-10">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Unidade (Local)</label>
                        <div className="relative">
                            <select
                                value={selectedWorkLocation}
                                onChange={(e) => setSelectedWorkLocation(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none min-w-[200px]"
                            >
                                <option value="all">Todas as Unidades</option>
                                {workLocations.map(wl => (
                                    <option key={wl.id} value={wl.id}>{wl.name}</option>
                                ))}
                            </select>
                            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 flex-1 md:flex-none">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Pesquisar Colaborador</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Nome ou Nº de Processo..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium w-full md:w-64 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm transition">
                        <Printer size={16} />
                        <span className="hidden sm:inline">Imprimir</span>
                    </button>
                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm transition">
                        <FileSpreadsheet size={16} />
                        <span className="hidden sm:inline">Exportar Excel</span>
                    </button>
                    <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-orange-200 transition transform active:scale-95">
                        <Save size={18} />
                        Processar Assiduidade
                    </button>
                </div>
            </div>

            {/* Main Content - Table */}
            <div className="flex-1 overflow-auto bg-slate-100 p-4">
                <div className="bg-white border border-slate-300 shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                    <th className="p-3 border-r border-slate-200 min-w-[300px] sticky left-0 z-20 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                        Colaborador
                                    </th>
                                    {days.map(d => (
                                        <th key={d} className={`border-r border-slate-200 min-w-[34px] text-center ${isWeekend(d) ? 'bg-slate-100' : 'bg-white'}`}>
                                            <div className="flex flex-col items-center py-1">
                                                <span className={`text-[9px] font-bold ${isWeekend(d) ? 'text-red-400' : 'text-slate-400'}`}>{getDayLabel(d)}</span>
                                                <span className="text-xs font-bold text-slate-700">{d}</span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="p-2 border-r border-slate-200 bg-slate-50 text-center min-w-[80px]">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase leading-tight">Total<br />Presenças</div>
                                    </th>
                                    <th className="p-2 border-r border-slate-200 bg-slate-50 text-center min-w-[80px]">
                                        <div className="text-[10px] font-bold text-red-500 uppercase leading-tight">Total<br />Faltas</div>
                                    </th>
                                    <th className="p-2 bg-slate-50 text-right min-w-[120px] pr-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase leading-tight">Valor<br />Deduções (Kz)</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={days.length + 4} className="p-8 text-center text-slate-400 font-medium">
                                            Nenhum colaborador encontrado para os filtros selecionados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map(emp => {
                                        const { presencas, faltas } = getStats(emp.id);
                                        // Simple deduction calculation based on day value (approx)
                                        const dailyRate = emp.baseSalary / 30;
                                        const valorKz = faltas * dailyRate;

                                        return (
                                            <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="p-2 border-r border-slate-200 sticky left-0 z-10 bg-white group-hover:bg-blue-50/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                                            {emp.photoUrl ? (
                                                                <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={18} className="text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm leading-tight">{emp.name}</div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    {emp.employeeNumber || '---'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]" title={emp.role}>{emp.role}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {days.map(d => {
                                                    const status = getStatus(emp.id, d);
                                                    const isWk = isWeekend(d);
                                                    let cellClass = "";
                                                    let content = "";

                                                    if (status === 'F') { // Folga / Weekend
                                                        cellClass = "bg-slate-100";
                                                    } else if (status === 'P') { // Presente
                                                        cellClass = "text-emerald-600 font-bold";
                                                        content = "•";
                                                    } else if (status === 'V') { // Vermelho / Falta
                                                        cellClass = "bg-red-100 text-red-600 font-bold border-red-200";
                                                        content = "F";
                                                    } else if (status === 'A' || status === 'J') { // Amarelo
                                                        cellClass = "bg-amber-100 text-amber-600 font-bold border-amber-200";
                                                        content = "O";
                                                    } else if (status === 'I') { // Inicio
                                                        cellClass = "bg-blue-100 text-blue-600 font-bold border-blue-200";
                                                        content = "I";
                                                    }

                                                    // Handle weekend override if no status data
                                                    if (!content && isWk) {
                                                        cellClass = "bg-slate-100";
                                                    }

                                                    return (
                                                        <td key={d} className={`border-r border-slate-100 p-0 text-center h-12 relative ${isWk ? 'bg-slate-50/50' : ''}`}>
                                                            <div className={`w-full h-full flex items-center justify-center text-xs ${cellClass}`}>
                                                                {content}
                                                            </div>
                                                        </td>
                                                    );
                                                })}

                                                <td className="border-r border-slate-200 text-center font-bold text-slate-600 text-sm bg-slate-50/30">
                                                    {presencas}
                                                </td>
                                                <td className="border-r border-slate-200 text-center font-bold text-red-500 text-sm bg-red-50/10">
                                                    {faltas}
                                                </td>
                                                <td className="text-right pr-4 font-black text-slate-700 text-sm bg-slate-50/30">
                                                    {valorKz.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMapPage;
