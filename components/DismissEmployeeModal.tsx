import React, { useState } from 'react';
import { X, UserX, AlertTriangle } from 'lucide-react';
import { Employee } from '../types';
import { formatDate } from '../utils';

interface DismissEmployeeModalProps {
    employee: Employee;
    onClose: () => void;
    onConfirm: (employeeId: string, dismissalData: {
        dismissalDate: string;
        dismissedBy: string;
        reason: string;
    }) => void;
}

const DismissEmployeeModal: React.FC<DismissEmployeeModalProps> = ({
    employee,
    onClose,
    onConfirm
}) => {
    const [dismissalDate, setDismissalDate] = useState(new Date().toISOString().split('T')[0]);
    const [dismissedBy, setDismissedBy] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!dismissalDate || !dismissedBy || !reason) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (!confirm(`Tem certeza que deseja demitir ${employee.name}?\n\nEsta ação bloqueará o funcionário de todas as atividades do sistema.`)) {
            return;
        }

        onConfirm(employee.id, {
            dismissalDate,
            dismissedBy,
            reason
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <UserX size={28} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Demitir Funcionário</h2>
                                <p className="text-red-100 text-sm mt-1">Processo de demissão de colaborador</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6 rounded">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-yellow-800 text-sm">Atenção!</p>
                            <p className="text-yellow-700 text-sm mt-1">
                                Após a demissão, o funcionário ficará bloqueado de qualquer atividade no sistema e não aparecerá nas listas das páginas do sistema.
                                O status será alterado para "Inativo - Demitido" nas listas de colaboradores e funcionários.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="px-6 pb-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</p>
                                <p className="font-bold text-slate-800">{employee.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Nº Mecanográfico</p>
                                <p className="font-bold text-slate-800">{employee.employeeNumber || '---'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Função</p>
                                <p className="font-bold text-slate-800">{employee.role}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Data de Admissão</p>
                                <p className="font-bold text-slate-800">{employee.admissionDate ? formatDate(employee.admissionDate) : '---'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Data de Demissão <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={dismissalDate}
                                onChange={(e) => setDismissalDate(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Mandante (Responsável pela Demissão) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={dismissedBy}
                                onChange={(e) => setDismissedBy(e.target.value)}
                                placeholder="Nome do responsável pela demissão"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Motivo da Demissão <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Descreva o motivo da demissão..."
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <UserX size={18} />
                            Demitir Funcionário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DismissEmployeeModal;
