import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle, Info, Table as TableIcon } from 'lucide-react';
import { formatCurrency } from '../utils';

interface IRTBracket {
    id: string;
    minValue: number;
    maxValue: number | null;
    rate: number;
    year: number;
}

interface IRTTableManagerProps {
    onClose?: () => void;
}

const IRTTableManager: React.FC<IRTTableManagerProps> = ({ onClose }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [brackets, setBrackets] = useState<IRTBracket[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newBracket, setNewBracket] = useState<Partial<IRTBracket>>({});
    const [showAddForm, setShowAddForm] = useState(false);

    // Tabela IRT padrão conforme a lei angolana
    const DEFAULT_IRT_TABLE: Omit<IRTBracket, 'id'>[] = [
        { minValue: 0, maxValue: 70000, rate: 0, year: selectedYear },
        { minValue: 70001, maxValue: 100000, rate: 10, year: selectedYear },
        { minValue: 100001, maxValue: 150000, rate: 13, year: selectedYear },
        { minValue: 150001, maxValue: 200000, rate: 16, year: selectedYear },
        { minValue: 200001, maxValue: 300000, rate: 18, year: selectedYear },
        { minValue: 300001, maxValue: 500000, rate: 19, year: selectedYear },
        { minValue: 500001, maxValue: null, rate: 20, year: selectedYear }
    ];

    useEffect(() => {
        loadBrackets();
    }, [selectedYear]);

    const loadBrackets = () => {
        // Carregar da localStorage ou usar padrão
        const stored = localStorage.getItem(`irt_brackets_${selectedYear}`);
        if (stored) {
            setBrackets(JSON.parse(stored));
        } else {
            // Criar tabela padrão
            const defaultBrackets = DEFAULT_IRT_TABLE.map((b, idx) => ({
                ...b,
                id: `bracket_${selectedYear}_${idx}`
            }));
            setBrackets(defaultBrackets);
            saveBrackets(defaultBrackets);
        }
    };

    const saveBrackets = (updatedBrackets: IRTBracket[]) => {
        localStorage.setItem(`irt_brackets_${selectedYear}`, JSON.stringify(updatedBrackets));
        setBrackets(updatedBrackets);
    };

    const handleAddBracket = () => {
        if (!newBracket.minValue || newBracket.rate === undefined) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        const bracket: IRTBracket = {
            id: `bracket_${selectedYear}_${Date.now()}`,
            minValue: newBracket.minValue,
            maxValue: newBracket.maxValue || null,
            rate: newBracket.rate,
            year: selectedYear
        };

        const updated = [...brackets, bracket].sort((a, b) => a.minValue - b.minValue);
        saveBrackets(updated);
        setNewBracket({});
        setShowAddForm(false);
    };

    const handleEditBracket = (id: string) => {
        setEditingId(id);
    };

    const handleSaveEdit = (id: string, updated: Partial<IRTBracket>) => {
        const updatedBrackets = brackets.map(b =>
            b.id === id ? { ...b, ...updated } : b
        );
        saveBrackets(updatedBrackets);
        setEditingId(null);
    };

    const handleDeleteBracket = (id: string) => {
        if (!confirm('Tem certeza que deseja eliminar este escalão?')) return;
        const updated = brackets.filter(b => b.id !== id);
        saveBrackets(updated);
    };

    const handleResetToDefault = () => {
        if (!confirm('Restaurar tabela padrão? Isto irá apagar todas as personalizações.')) return;
        const defaultBrackets = DEFAULT_IRT_TABLE.map((b, idx) => ({
            ...b,
            id: `bracket_${selectedYear}_${idx}`
        }));
        saveBrackets(defaultBrackets);
    };

    const calculateIRTExample = (salary: number): { bracket: IRTBracket | null, irt: number } => {
        const bracket = brackets.find(b => {
            if (b.maxValue === null) return salary >= b.minValue;
            return salary >= b.minValue && salary <= b.maxValue;
        });

        if (!bracket || bracket.rate === 0) return { bracket, irt: 0 };

        return {
            bracket,
            irt: (salary * bracket.rate) / 100
        };
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Calculator className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold uppercase">Tabela de IRT</h2>
                            <p className="text-sm text-blue-200">Imposto sobre Rendimento do Trabalho - Lei Angolana</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-white/20 text-white border border-white/30 rounded px-4 py-2 font-bold"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y} className="text-slate-900">{y}</option>
                            ))}
                        </select>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 flex items-start gap-3">
                    <Info className="text-blue-600 mt-0.5" size={20} />
                    <div className="text-sm text-blue-900">
                        <p className="font-bold mb-1">Base Legal: Código do IRT - Decreto Presidencial n.º 147/13</p>
                        <p>A tabela IRT é aplicada sobre a base tributável (Salário Bruto - INSS do Trabalhador). Os escalões e taxas podem ser atualizados anualmente por decreto.</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6">

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition"
                        >
                            <Plus size={18} />
                            Adicionar Escalão
                        </button>
                        <button
                            onClick={handleResetToDefault}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700 transition"
                        >
                            Restaurar Padrão {selectedYear}
                        </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-6">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Plus size={16} />
                                Novo Escalão
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Valor Mínimo (Kz)</label>
                                    <input
                                        type="number"
                                        value={newBracket.minValue || ''}
                                        onChange={(e) => setNewBracket({ ...newBracket, minValue: Number(e.target.value) })}
                                        className="w-full p-2 border border-slate-300 rounded"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Valor Máximo (Kz)</label>
                                    <input
                                        type="number"
                                        value={newBracket.maxValue || ''}
                                        onChange={(e) => setNewBracket({ ...newBracket, maxValue: Number(e.target.value) || null })}
                                        className="w-full p-2 border border-slate-300 rounded"
                                        placeholder="Sem limite"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Taxa (%)</label>
                                    <input
                                        type="number"
                                        value={newBracket.rate || ''}
                                        onChange={(e) => setNewBracket({ ...newBracket, rate: Number(e.target.value) })}
                                        className="w-full p-2 border border-slate-300 rounded"
                                        placeholder="0"
                                        step="0.1"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={handleAddBracket}
                                        className="flex-1 bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700"
                                    >
                                        <Save size={16} className="inline mr-1" />
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => { setShowAddForm(false); setNewBracket({}); }}
                                        className="p-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* IRT Table */}
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800 text-white">
                                <tr>
                                    <th className="p-3 text-left font-bold uppercase">Escalão Mensal (Kz)</th>
                                    <th className="p-3 text-center font-bold uppercase">Taxa (%)</th>
                                    <th className="p-3 text-center font-bold uppercase">Exemplo (Kz 150.000)</th>
                                    <th className="p-3 text-center font-bold uppercase w-32">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brackets.map((bracket, idx) => {
                                    const isEditing = editingId === bracket.id;
                                    const example = calculateIRTExample(150000);
                                    const isExampleBracket = example.bracket?.id === bracket.id;

                                    return (
                                        <tr
                                            key={bracket.id}
                                            className={`border-b border-slate-200 hover:bg-slate-50 ${isExampleBracket ? 'bg-yellow-50' : ''}`}
                                        >
                                            <td className="p-3">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            defaultValue={bracket.minValue}
                                                            onChange={(e) => handleSaveEdit(bracket.id, { minValue: Number(e.target.value) })}
                                                            className="w-32 p-1 border rounded"
                                                        />
                                                        <span className="self-center">até</span>
                                                        <input
                                                            type="number"
                                                            defaultValue={bracket.maxValue || ''}
                                                            onChange={(e) => handleSaveEdit(bracket.id, { maxValue: Number(e.target.value) || null })}
                                                            className="w-32 p-1 border rounded"
                                                            placeholder="Sem limite"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="font-mono font-bold">
                                                        {bracket.maxValue === null
                                                            ? `Acima de ${formatCurrency(bracket.minValue)}`
                                                            : `${formatCurrency(bracket.minValue)} - ${formatCurrency(bracket.maxValue)}`
                                                        }
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        defaultValue={bracket.rate}
                                                        onChange={(e) => handleSaveEdit(bracket.id, { rate: Number(e.target.value) })}
                                                        className="w-20 p-1 border rounded text-center"
                                                        step="0.1"
                                                    />
                                                ) : (
                                                    <span className={`font-bold text-lg ${bracket.rate === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {bracket.rate}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                {isExampleBracket && (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs text-slate-500">IRT a pagar:</span>
                                                        <span className="font-bold text-red-600">{formatCurrency(example.irt)}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    {isEditing ? (
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                            title="Concluir"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEditBracket(bracket.id)}
                                                            className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                            title="Editar"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteBracket(bracket.id)}
                                                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Calculation Examples */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[100000, 200000, 600000].map(salary => {
                            const result = calculateIRTExample(salary);
                            return (
                                <div key={salary} className="bg-slate-50 border border-slate-300 rounded-lg p-4">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Exemplo de Cálculo</div>
                                    <div className="text-lg font-bold text-slate-800 mb-2">{formatCurrency(salary)}</div>
                                    <div className="text-xs text-slate-600 mb-1">
                                        Taxa aplicada: <span className="font-bold text-red-600">{result.bracket?.rate || 0}%</span>
                                    </div>
                                    <div className="text-sm font-bold text-red-600">
                                        IRT: {formatCurrency(result.irt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legal Notice */}
                    <div className="mt-6 bg-amber-50 border border-amber-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-amber-600 mt-0.5" size={20} />
                            <div className="text-xs text-amber-900">
                                <p className="font-bold mb-1">⚠️ AVISO IMPORTANTE</p>
                                <p>As percentagens e escalões podem ser alterados anualmente por decreto presidencial. Certifique-se de atualizar a tabela conforme as publicações oficiais da AGT (Administração Geral Tributária).</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-slate-100 border-t border-slate-300 p-4 flex justify-between items-center">
                    <div className="text-xs text-slate-600">
                        <p className="font-bold">Base Legal:</p>
                        <p>Código do IRT - Decreto Presidencial n.º 147/13 e atualizações</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition"
                        >
                            Fechar
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default IRTTableManager;
