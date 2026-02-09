import React, { useState } from 'react';
import { X, UserPlus, Calendar, User, FileText } from 'lucide-react';
import { Employee } from '../types';

interface ReadmitModalProps {
    employee: Employee;
    onClose: () => void;
    onConfirm: (data: { readmissionDate: string; mandatedBy: string; reason: string }) => void;
}

const ReadmitModal: React.FC<ReadmitModalProps> = ({ employee, onClose, onConfirm }) => {
    const [readmissionDate, setReadmissionDate] = useState(new Date().toISOString().split('T')[0]);
    const [mandatedBy, setMandatedBy] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ readmissionDate, mandatedBy, reason });
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus size={24} /> Readmitir Colaborador
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mb-4">
                        <p className="text-sm text-emerald-800 font-medium">
                            Você está prestes a reactivar o colaborador <span className="font-bold">{employee.name}</span>.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Data de Readmissão
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                required
                                value={readmissionDate}
                                onChange={(e) => setReadmissionDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Mandante (Quem autorizou?)
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                placeholder="Nome do Director/Gestor"
                                value={mandatedBy}
                                onChange={(e) => setMandatedBy(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Motivo da Readmissão
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea
                                required
                                placeholder="Descreva o motivo..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition flex items-center gap-2"
                        >
                            <UserPlus size={18} /> Readmitir
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReadmitModal;
