import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { Calendar, Search, Filter, Save, FileSpreadsheet, Printer, ChevronLeft, ChevronRight, User, CheckSquare } from 'lucide-react';

interface AttendanceMapPageProps {
    employees: Employee[];
    companyName: string;
    workLocations: { id: string; name: string }[];
    attendanceRecords: AttendanceRecord[];
    onProcess?: (selectedEmployeeIds: string[], month: number, year: number) => void;
}

const AttendanceMapPage: React.FC<AttendanceMapPageProps> = ({ employees, companyName, workLocations, attendanceRecords, onProcess }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWorkLocation, setSelectedWorkLocation] = useState<string>('all');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const months = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];

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
            return isWeekend(day) ? 'F' : '';
        }
        const status = record.days[day].status;
        switch (status) {
            case 'FOLGA': return 'F';
            case 'SERVICO': return 'P';
            case 'FALTA_INJUST': return 'F'; 
            case 'FALTA_JUST': return 'O'; // Changed to O (Outro/Justificada)
            case 'FERIAS': return 'A'; // Absence/Ausencia 
            case 'ADMISSAO': return 'I'; // Inicio
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
            const matchesLocation = selectedWorkLocation === 'all' || emp.workLocationId === selectedWorkLocation;
            return matchesLocation;
        });
    }, [employees, selectedWorkLocation]);

    const toggleEmployeeSelection = (id: string) => {
        const newSet = new Set(selectedEmployeeIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedEmployeeIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedEmployeeIds.size === filteredEmployees.length) {
            setSelectedEmployeeIds(new Set());
        } else {
            setSelectedEmployeeIds(new Set(filteredEmployees.map(e => e.id)));
        }
    };

    const handleProcess = () => {
        if (onProcess) {
            onProcess(Array.from(selectedEmployeeIds), selectedMonth, selectedYear);
        } else {
            alert(`Processando assiduidade para ${selectedEmployeeIds.size} funcionários... (Simulação)`);
        }
    };

    // Calculate totals
    const totalDeductions = filteredEmployees.reduce((acc, emp) => {
        const { faltas } = getStats(emp.id);
        const dailyRate = emp.baseSalary / 30;
        return acc + (faltas * dailyRate);
    }, 0);
    
    // Mock Total To Pay logic
    const totalToPay = filteredEmployees.reduce((acc, emp) => acc + emp.baseSalary, 0) - totalDeductions;

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-800 p-4 shadow-md">
                <h1 className="text-xl font-bold text-white tracking-tight">Mapa de Assiduidade dos Funcionários</h1>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-3 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                        <span className="text-xs font-bold text-slate-600 uppercase">Empresa:</span>
                        <span className="text-sm font-bold text-slate-800">{companyName}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                        <span className="text-xs font-bold text-slate-600 uppercase">Local de Trabalho:</span>
                        <select 
                            value={selectedWorkLocation}
                            onChange={(e) => setSelectedWorkLocation(e.target.value)}
                            className="bg-transparent font-bold text-slate-800 text-sm outline-none cursor-pointer"
                        >
                            <option value="all">Filial (Todos)</option>
                            {workLocations.map(wl => (
                                <option key={wl.id} value={wl.id}>{wl.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                        <span className="text-xs font-bold text-slate-600 uppercase">Mês/Ano:</span>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent font-bold text-slate-800 text-sm outline-none cursor-pointer"
                        >
                            {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                        </select>
                        <span className="text-slate-400">/</span>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent font-bold text-slate-800 text-sm outline-none cursor-pointer"
                        >
                             <option value={2023}>2023</option>
                             <option value={2024}>2024</option>
                             <option value={2025}>2025</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleProcess}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow-lg shadow-orange-500/20 transition-transform active:scale-95 text-sm uppercase tracking-wide flex items-center gap-2"
                >
                    <Save size={16} /> Processar Assiduidade
                </button>
            </div>

            {/* Main Table */}
            <div className="flex-1 overflow-auto bg-white p-4">
                <div className="border border-blue-900 rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {/* Top Header */}
                                <tr className="bg-blue-900 text-white text-xs uppercase font-bold">
                                    <th className="w-10 p-2 border-r border-blue-800 text-center">
                                       <div className="h-4 w-4 mx-auto"></div>
                                    </th>
                                    <th className="p-2 border-r border-blue-800 min-w-[250px]">
                                        Funcionário
                                    </th>
                                    <th colSpan={daysInMonth} className="border-r border-blue-800 text-center bg-blue-900/50">
                                        
                                    </th>
                                    <th className="w-10"></th>
                                </tr>
                                {/* Sub Header (Days) */}
                                <tr className="bg-blue-50 text-blue-900 text-[10px] font-bold border-b border-blue-200">
                                    <th className="p-2 border-r border-blue-200 text-center">
                                         <input 
                                            type="checkbox" 
                                            checked={selectedEmployeeIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-2 border-r border-blue-200 flex items-center gap-2 text-blue-800 uppercase">
                                        <span>MOSTRAR HORAS</span>
                                    </th>
                                    {days.map(d => (
                                        <th key={d} className={`border-r border-blue-200 text-center min-w-[28px] ${isWeekend(d) ? 'bg-slate-200 text-red-500' : ''}`}>
                                            {d}
                                        </th>
                                    ))}
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {/* Seldet Row */}
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <td className="p-2 border-r border-slate-200 text-center">
                                         <div className="w-4 h-4 border border-slate-300 bg-white rounded cursor-pointer mx-auto"></div>
                                    </td>
                                    <td className="p-2 border-r border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-700 text-xs uppercase">Seldet:</span>
                                            <select className="bg-transparent text-xs text-slate-500 outline-none w-full cursor-pointer">
                                                <option>Selecionar funcionários</option>
                                            </select>
                                        </div>
                                    </td>
                                    {days.map(d => (
                                        <td key={d} className="border-r border-slate-200 text-center p-0">
                                            <div className="w-full h-8 flex items-center justify-center">
                                                <div className="w-4 h-4 bg-emerald-500 rounded text-white flex items-center justify-center">
                                                    <CheckSquare size={10} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                    <td></td>
                                </tr>

                                {/* Records */}
                                {filteredEmployees.map((emp, idx) => (
                                    <tr key={emp.id} className={`border-b border-slate-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        <td className="p-2 border-r border-slate-200 text-center bg-blue-50/30">
                                             <input 
                                                type="checkbox" 
                                                checked={selectedEmployeeIds.has(emp.id)}
                                                onChange={() => toggleEmployeeSelection(emp.id)}
                                                className="rounded border-slate-300 w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                                                    {emp.photoUrl ? (
                                                        <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-full h-full p-2 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="leading-tight">
                                                    <div className="font-bold text-blue-900 text-sm">{emp.name}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 rounded">Nº {emp.employeeNumber || '0000'}</span>
                                                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{emp.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {days.map(d => {
                                            const status = getStatus(emp.id, d);
                                            const isWk = isWeekend(d);
                                            let display = "";
                                            let textColor = "text-slate-300";

                                            if (status === 'P') { display = "P"; textColor = "text-emerald-600 font-bold"; }
                                            else if (status === 'F') { display = "F"; textColor = "text-blue-600 font-bold"; } // F for Falta Injust (Blue per image?)
                                            else if (status === 'O') { display = "O"; textColor = "text-amber-500 font-bold"; } // O for Justified/Other
                                            else if (status === 'I') { display = "I"; textColor = "text-cyan-500 font-bold"; } // I for Intro/Admission
                                            else if (status === 'A') { display = "F"; textColor = "text-red-500 font-bold"; } // A (Ferias/Other)

                                            // Weekend override
                                            if (isWk && !display) {
                                                // Empty
                                            }

                                            return (
                                                <td key={d} className={`border-r border-slate-100 p-0 text-center h-10 ${isWk ? 'bg-slate-50' : ''}`}>
                                                    <span className={`text-xs ${textColor}`}>{display}</span>
                                                    {(status === 'F' || status === 'A') && !isWk && (
                                                         <div className="flex justify-center -mt-0.5">
                                                            <div className="w-2.5 h-2.5 border border-slate-300 rounded bg-white"></div>
                                                         </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td></td>
                                    </tr>
                                ))}
                                
                                <tr className="bg-slate-50 border-t-2 border-blue-900 font-bold text-slate-700 text-xs">
                                    <td colSpan={2} className="p-2 text-right uppercase">Total Geral:</td>
                                    <td colSpan={daysInMonth} className="p-2 text-center text-blue-900">
                                        <div className="flex gap-4 justify-center">
                                            <span>61</span>
                                            <span>15</span>
                                            <span>10</span>
                                            <span>2</span>
                                            <span>2</span>
                                            {/* Mock total numbers just for visual match */}
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white p-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
                <div className="space-y-4">
                     <div>
                        <span className="font-bold text-slate-700">Horas Totais Trabalhadas:</span>
                        <span className="font-black text-slate-900 ml-2 text-lg">435.00</span>
                     </div>
                     <div className="border-t border-slate-100 pt-2">
                        <span className="font-bold text-slate-700">Horas Totais Perdidas:</span>
                        <span className="font-black text-slate-900 ml-2 text-lg">11:00</span>
                     </div>
                </div>
                
                <div className="space-y-2">
                     <div className="flex justify-between items-center text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                        Base Legal: Lei Geral do Trabalho
                     </div>
                     <div className="flex justify-between items-center text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">
                        <span>Desconto Faltas Injustificadas:</span>
                        <span>- {totalDeductions.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz</span>
                     </div>
                      <div className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-100 mt-2">
                        <span className="font-bold text-blue-900 uppercase text-xs">Total de Vencimentos a Pagar:</span>
                        <span className="font-black text-blue-900 text-xl">{totalToPay.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMapPage;
