
import React, { useState, useEffect } from 'react';
import { Employee, DailyAttendance } from '../types';
import { formatDate } from '../utils';
import { X, Calculator, Save } from 'lucide-react';

interface DetailedAttendanceGridProps {
    employee: Employee;
    month: number;
    year: number;
    initialData?: Record<number, DailyAttendance>;
    onClose: () => void;
    onSave: (employeeId: string, data: Record<number, DailyAttendance>, summary: { absences: number, extraHours: number, notes: string }) => void;
}

const DetailedAttendanceGrid: React.FC<DetailedAttendanceGridProps> = ({
    employee,
    month,
    year,
    initialData,
    onClose,
    onSave
}) => {
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    // Initialize grid state
    const [grid, setGrid] = useState<Record<number, DailyAttendance>>(() => {
        if (initialData && Object.keys(initialData).length > 0) return initialData;
        const initial: Record<number, DailyAttendance> = {};
        days.forEach(d => {
            const date = new Date(year, month - 1, d);
            const isSunday = date.getDay() === 0;
            initial[d] = {
                status: isSunday ? 'FOLGA' : 'SERVICO',
                overtimeHours: 0,
                lostHours: 0,
                location: isSunday ? '' : '1',
                subsidyFoodValue: 0,
                subsidyTransportValue: 0
            };
        });
        return initial;
    });

    const getDayName = (day: number) => {
        const date = new Date(year, month - 1, day);
        return weekDays[date.getDay()];
    };

    const updateGrid = (day: number, field: keyof DailyAttendance, value: any) => {
        setGrid(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleFullRow = (status: DailyAttendance['status']) => {
        setGrid(prev => {
            const next = { ...prev };
            days.forEach(d => {
                next[d] = { ...next[d], status };
            });
            return next;
        });
    };

    const handleAutofill = () => {
        setGrid(prev => {
            const next = { ...prev };
            days.forEach(d => {
                const date = new Date(year, month - 1, d);
                const isSunday = date.getDay() === 0;
                next[d] = {
                    ...next[d],
                    status: isSunday ? 'FOLGA' : 'SERVICO',
                    location: isSunday ? '' : '1'
                };
            });
            return next;
        });
    };

    const handleProcessInfo = () => {
        let absentDays = 0;
        let totalOvertime = 0;

        Object.values(grid).forEach((d) => {
            if (d.status === 'FALTA_INJUST') absentDays++;
            totalOvertime += Number(d.overtimeHours || 0);
        });

        onSave(employee.id, grid, {
            absences: absentDays,
            extraHours: totalOvertime,
            notes: 'Processado via Grelha de Efetividade'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white border-b border-gray-300 p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-8 md:gap-12">
                    <div>
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">IDNF</span>
                        <span className="text-xl font-black text-gray-900">{employee.employeeNumber || '---'}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Colaborador</span>
                        <span className="text-xl font-black text-gray-900 uppercase">{employee.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                        <span className="block text-2xl font-black text-gray-900">{months[month - 1]} {year}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">Mapa de Efetividade</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden min-w-max">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="text-[10px] font-bold text-gray-800 bg-gray-50/50">
                                <th className="p-2 border border-gray-300 text-left bg-white w-[200px] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    CONCEITO
                                </th>
                                {days.map(d => (
                                    <th key={d} className="border border-gray-300 bg-white min-w-[40px]">
                                        <div className={`text-[9px] font-bold mb-0.5 ${['SAB', 'DOM'].includes(getDayName(d)) ? 'text-red-400' : 'text-gray-400'}`}>
                                            {getDayName(d)}
                                        </div>
                                        <div className="text-sm font-black text-gray-800">{d}</div>
                                    </th>
                                ))}
                                <th className="p-2 border border-gray-300 bg-white sticky right-0 z-20 w-[60px]">TODOS</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px]">
                            {/* Admissão / Demissão */}
                            <tr className="h-9 hover:bg-gray-50 transition-colors">
                                <td className="p-2 border border-gray-300 text-left bg-white sticky left-0 z-10 font-bold text-gray-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Admissão/Demissão
                                </td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-200 p-0 text-center align-middle">
                                        <div className="flex justify-center items-center h-full w-full">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'ADMISSAO'}
                                                onChange={() => updateGrid(d, 'status', 'ADMISSAO')}
                                                className="w-4 h-4 accent-purple-600 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10 text-center">
                                    <input type="radio" name="full-row" onChange={() => handleFullRow('ADMISSAO')} className="w-4 h-4 cursor-pointer" />
                                </td>
                            </tr>

                            {/* Folga */}
                            <tr className="h-9 hover:bg-green-50 transition-colors bg-green-50/10">
                                <td className="p-2 border border-gray-300 text-left bg-green-50 sticky left-0 z-10 font-bold text-green-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Folga / Fim de Semana
                                </td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0">
                                        <div className="flex justify-center items-center h-full w-full">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FOLGA'}
                                                onChange={() => updateGrid(d, 'status', 'FOLGA')}
                                                className="w-4 h-4 accent-green-600 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10 text-center">
                                    <input type="radio" name="full-row" onChange={() => handleFullRow('FOLGA')} className="w-4 h-4 cursor-pointer" />
                                </td>
                            </tr>

                            {/* Serviço */}
                            <tr className="h-9 hover:bg-blue-50 transition-colors">
                                <td className="p-2 border border-gray-300 text-left bg-white sticky left-0 z-10 font-bold text-blue-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Dia de Serviço
                                </td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0">
                                        <div className="flex justify-center items-center h-full w-full">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'SERVICO'}
                                                onChange={() => updateGrid(d, 'status', 'SERVICO')}
                                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10 text-center">
                                    <input type="radio" name="full-row" onChange={() => handleFullRow('SERVICO')} className="w-4 h-4 cursor-pointer" />
                                </td>
                            </tr>

                            {/* Faltas Justificadas */}
                            <tr className="h-9 hover:bg-gray-50 transition-colors">
                                <td className="p-2 border border-gray-300 text-left bg-white sticky left-0 z-10 font-bold text-gray-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Falta Justificada
                                </td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0">
                                        <div className="flex justify-center items-center h-full w-full">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FALTA_JUST'}
                                                onChange={() => updateGrid(d, 'status', 'FALTA_JUST')}
                                                className="w-4 h-4 accent-gray-500 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10 text-center">
                                    <input type="radio" name="full-row" onChange={() => handleFullRow('FALTA_JUST')} className="w-4 h-4 cursor-pointer" />
                                </td>
                            </tr>

                            {/* Faltas Injustificadas */}
                            <tr className="h-9 hover:bg-red-50 transition-colors">
                                <td className="p-2 border border-gray-300 text-left bg-white sticky left-0 z-10 font-bold text-red-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Falta Injustificada
                                </td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0">
                                        <div className="flex justify-center items-center h-full w-full">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FALTA_INJUST'}
                                                onChange={() => updateGrid(d, 'status', 'FALTA_INJUST')}
                                                className="w-4 h-4 accent-red-600 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10 text-center">
                                    <input type="radio" name="full-row" onChange={() => handleFullRow('FALTA_INJUST')} className="w-4 h-4 cursor-pointer" />
                                </td>
                            </tr>

                            {/* Férias */}
                            <tr className="h-9 hover:bg-amber-50 transition-colors">
                                <td className="p-2 border border-gray-300 text-left bg-white sticky left-0 z-10 font-bold text-amber-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Férias
                                </td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0">
                                        <div className="flex justify-center items-center h-full w-full">
                                            <input
                                                type="radio"
                                                checked={grid[d]?.status === 'FERIAS'}
                                                onChange={() => updateGrid(d, 'status', 'FERIAS')}
                                                className="w-4 h-4 accent-amber-500 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10 text-center">
                                    <input type="radio" name="full-row" onChange={() => handleFullRow('FERIAS')} className="w-4 h-4 cursor-pointer" />
                                </td>
                            </tr>

                            {/* Horas Extra */}
                            <tr className="h-9 bg-white">
                                <td className="p-2 border border-gray-300 text-left sticky left-0 z-10 bg-white font-bold text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Horas Extra</td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0">
                                        <input
                                            type="text"
                                            value={grid[d]?.overtimeHours || ''}
                                            onChange={(e) => updateGrid(d, 'overtimeHours', e.target.value)}
                                            className="w-full h-full text-center outline-none bg-transparent focus:bg-blue-50 border-transparent focus:border-blue-300 text-xs font-mono"
                                        />
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10"></td>
                            </tr>

                            {/* Horas Perdidas */}
                            <tr className="h-9 bg-white">
                                <td className="p-2 border border-gray-300 text-left sticky left-0 z-10 bg-white font-bold text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Horas Perdidas</td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0">
                                        <input
                                            type="text"
                                            value={grid[d]?.lostHours || ''}
                                            onChange={(e) => updateGrid(d, 'lostHours', e.target.value)}
                                            className="w-full h-full text-center outline-none bg-transparent focus:bg-red-50 border-transparent focus:border-red-300 text-xs font-mono text-red-600"
                                        />
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10"></td>
                            </tr>

                            {/* Subsidios Alimentacao */}
                            <tr className="h-9 bg-white">
                                <td className="p-2 border border-gray-300 text-left sticky left-0 z-10 bg-white font-bold text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">S. Alimentação</td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0 bg-white">
                                        <div className="flex justify-center items-center h-full">
                                            <input
                                                type="checkbox"
                                                checked={grid[d]?.status === 'SERVICO'} // Example logical default
                                                readOnly
                                                className="w-3 h-3 accent-gray-400 opacity-50"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10"></td>
                            </tr>

                            {/* Subsidios Transporte */}
                            <tr className="h-9 bg-white">
                                <td className="p-2 border border-gray-300 text-left sticky left-0 z-10 bg-white font-bold text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">S. Transporte</td>
                                {days.map(d => (
                                    <td key={d} className="border border-gray-300 p-0 bg-white">
                                        <div className="flex justify-center items-center h-full">
                                            <input
                                                type="checkbox"
                                                checked={grid[d]?.status === 'SERVICO'}
                                                readOnly
                                                className="w-3 h-3 accent-gray-400 opacity-50"
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td className="border border-gray-300 bg-gray-50 sticky right-0 z-10"></td>
                            </tr>

                        </tbody>
                    </table>
                </div>

                {/* Footer / Actions */}
                <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky bottom-0 z-30">
                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-600 rounded-sm"></span> Serviço
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-600 rounded-sm"></span> Folga
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-600 rounded-sm"></span> Falta Injust.
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAutofill}
                            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-xs uppercase hover:bg-gray-50 transition"
                        >
                            Preenchimento Automático
                        </button>
                        <button
                            onClick={handleProcessInfo}
                            className="px-8 py-2.5 rounded-lg bg-green-600 text-white font-bold text-xs uppercase hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2"
                        >
                            <Save size={18} />
                            Processar Efetividade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedAttendanceGrid;
