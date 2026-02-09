import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit3, X, ArrowLeft } from 'lucide-react';

interface IRTBracket {
    id: string;
    minValue: number;
    maxValue: number | null; // null = sem limite
    rate: number;
    year: number;
}

interface IRTTableProps {
    onClose?: () => void;
}

const IRTTable: React.FC<IRTTableProps> = ({ onClose }) => {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [brackets, setBrackets] = useState<IRTBracket[]>([
        { id: '1', minValue: 0, maxValue: 70000, rate: 0, year: currentYear },
        { id: '2', minValue: 70001, maxValue: 100000, rate: 10, year: currentYear },
        { id: '3', minValue: 100001, maxValue: 150000, rate: 13, year: currentYear },
        { id: '4', minValue: 150001, maxValue: 200000, rate: 16, year: currentYear },
        { id: '5', minValue: 200001, maxValue: 300000, rate: 18, year: currentYear },
        { id: '6', minValue: 300001, maxValue: 500000, rate: 19, year: currentYear },
        { id: '7', minValue: 500001, maxValue: null, rate: 20, year: currentYear }
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<IRTBracket>>({});

    const formatCurrency = (value: number | null) => {
        if (value === null) return '∞';
        return value.toLocaleString('pt-AO') + ' Kz';
    };

    const handleEdit = (bracket: IRTBracket) => {
        setEditingId(bracket.id);
        setEditValues(bracket);
    };

    const handleSave = () => {
        if (editingId) {
            setBrackets(brackets.map(b =>
                b.id === editingId ? { ...b, ...editValues } : b
            ));
            setEditingId(null);
            setEditValues({});
            alert('Escalão atualizado com sucesso!');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleAdd = () => {
        const newId = (brackets.length + 1).toString();
        const lastBracket = brackets[brackets.length - 1];
        const newMinValue = lastBracket.maxValue ? lastBracket.maxValue + 1 : 500001;

        const newBracket: IRTBracket = {
            id: newId,
            minValue: newMinValue,
            maxValue: null,
            rate: 0,
            year: currentYear
        };

        setBrackets([...brackets, newBracket]);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja eliminar este escalão?')) {
            setBrackets(brackets.filter(b => b.id !== id));
        }
    };

    const calculateIRT = (salaryBase: number): number => {
        const bracket = brackets.find(b => {
            if (b.maxValue === null) {
                return salaryBase >= b.minValue;
            }
            return salaryBase >= b.minValue && salaryBase <= b.maxValue;
        });

        if (!bracket) return 0;
        return (salaryBase * bracket.rate) / 100;
    };

    // Exemplo de cálculo
    const [testSalary, setTestSalary] = useState(150000);
    const calculatedIRT = calculateIRT(testSalary);

    return (
        <div className="bg-slate-50 min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-t-2xl shadow-lg text-white">
                    <div className="flex items-center gap-4">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors font-bold backdrop-blur-sm border border-white/20"
                                title="Voltar"
                            >
                                <ArrowLeft size={20} />
                                Voltar
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-light text-white tracking-tight flex items-center gap-2">
                                Tabela de IRT
                            </h1>
                            <p className="text-xs text-orange-100 font-bold uppercase tracking-widest mt-1">
                                Imposto sobre Rendimento do Trabalho
                            </p>
                        </div>
                    </div>
                </div>

                {/* Year Selector */}
                <div className="bg-white border-x border-slate-200 p-4">
                    <div className="flex items-center gap-4">
                        <label className="font-bold text-slate-700">Ano de Referência:</label>
                        <select
                            value={currentYear}
                            onChange={(e) => setCurrentYear(Number(e.target.value))}
                            className="border border-slate-300 rounded px-4 py-2 font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                            {[2024, 2025, 2026, 2027, 2028].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAdd}
                            className="ml-auto flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"
                        >
                            <Plus size={18} />
                            Adicionar Escalão
                        </button>
                    </div>
                </div>

                {/* IRT Table */}
                <div className="bg-white border border-slate-200 rounded-b-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-800 text-white text-sm uppercase font-bold">
                                    <th className="p-4 text-left border-r border-slate-700">Escalão</th>
                                    <th className="p-4 text-right border-r border-slate-700">Valor Mínimo (Kz)</th>
                                    <th className="p-4 text-right border-r border-slate-700">Valor Máximo (Kz)</th>
                                    <th className="p-4 text-center border-r border-slate-700">Taxa (%)</th>
                                    <th className="p-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {brackets.map((bracket, index) => (
                                    <tr key={bracket.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 border-r border-slate-200 font-bold text-slate-700">
                                            Escalão {index + 1}
                                        </td>
                                        <td className="p-4 border-r border-slate-200 text-right">
                                            {editingId === bracket.id ? (
                                                <input
                                                    type="number"
                                                    value={editValues.minValue || 0}
                                                    onChange={(e) => setEditValues({ ...editValues, minValue: Number(e.target.value) })}
                                                    className="w-full border border-slate-300 rounded px-2 py-1 text-right"
                                                />
                                            ) : (
                                                <span className="font-medium">{formatCurrency(bracket.minValue)}</span>
                                            )}
                                        </td>
                                        <td className="p-4 border-r border-slate-200 text-right">
                                            {editingId === bracket.id ? (
                                                <input
                                                    type="number"
                                                    value={editValues.maxValue || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, maxValue: e.target.value ? Number(e.target.value) : null })}
                                                    className="w-full border border-slate-300 rounded px-2 py-1 text-right"
                                                    placeholder="Sem limite"
                                                />
                                            ) : (
                                                <span className="font-medium">{formatCurrency(bracket.maxValue)}</span>
                                            )}
                                        </td>
                                        <td className="p-4 border-r border-slate-200 text-center">
                                            {editingId === bracket.id ? (
                                                <input
                                                    type="number"
                                                    value={editValues.rate || 0}
                                                    onChange={(e) => setEditValues({ ...editValues, rate: Number(e.target.value) })}
                                                    className="w-20 mx-auto border border-slate-300 rounded px-2 py-1 text-center"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                />
                                            ) : (
                                                <span className="font-bold text-orange-600 text-lg">{bracket.rate}%</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {editingId === bracket.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={handleSave}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Save size={14} />
                                                        Salvar
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="bg-slate-400 hover:bg-slate-500 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(bracket)}
                                                        className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Edit3 size={14} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bracket.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Trash2 size={14} />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Calculator Section */}
                <div className="mt-6 bg-white border border-slate-200 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Calculadora de IRT</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Salário Base Tributável (Kz)
                            </label>
                            <input
                                type="number"
                                value={testSalary}
                                onChange={(e) => setTestSalary(Number(e.target.value))}
                                className="w-full border border-slate-300 rounded px-4 py-2 text-lg font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                IRT Calculado
                            </label>
                            <div className="w-full bg-orange-50 border-2 border-orange-500 rounded px-4 py-2 text-lg font-bold text-orange-900">
                                {calculatedIRT.toLocaleString('pt-AO')} Kz
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
                        <p className="text-sm text-yellow-800">
                            <strong>Nota:</strong> O IRT é calculado sobre o salário bruto menos o INSS do trabalhador (3%).
                            Esta calculadora mostra apenas o valor do IRT baseado no escalão correspondente.
                        </p>
                    </div>
                </div>

                {/* Legal Information */}
                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="font-bold text-slate-800 mb-2">📋 Base Legal</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>• <strong>Código do IRT</strong> – Decreto Presidencial n.º 147/13 (e atualizações)</li>
                        <li>• <strong>Lei Geral do Trabalho</strong> – Lei n.º 7/15</li>
                        <li>• As percentagens podem ser atualizadas por decreto anual</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default IRTTable;
