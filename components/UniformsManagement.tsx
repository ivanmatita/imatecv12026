import React from 'react';
import { X, Shirt, Plus, Edit, Trash2 } from 'lucide-react';
import { Employee } from '../types';

interface UniformsManagementProps {
    employee: Employee;
    onClose: () => void;
}

const UniformsManagement: React.FC<UniformsManagementProps> = ({ employee, onClose }) => {
    const [uniforms, setUniforms] = React.useState([
        { id: '1', item: 'Camisa', size: 'M', quantity: 2, deliveryDate: '2025-01-15' },
        { id: '2', item: 'Calça', size: 'M', quantity: 2, deliveryDate: '2025-01-15' },
    ]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <Shirt size={28} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Gestão de Fardas</h2>
                                <p className="text-orange-100 text-sm mt-1">{employee.name}</p>
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

                {/* Content */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Fardas Entregues</h3>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <Plus size={18} />
                            Nova Entrega
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-800 text-white text-sm uppercase font-bold">
                                    <th className="p-3 text-left">Item</th>
                                    <th className="p-3 text-center">Tamanho</th>
                                    <th className="p-3 text-center">Quantidade</th>
                                    <th className="p-3 text-center">Data de Entrega</th>
                                    <th className="p-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {uniforms.map(uniform => (
                                    <tr key={uniform.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium">{uniform.item}</td>
                                        <td className="p-3 text-center">{uniform.size}</td>
                                        <td className="p-3 text-center font-bold">{uniform.quantity}</td>
                                        <td className="p-3 text-center">{new Date(uniform.deliveryDate).toLocaleDateString('pt-PT')}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-bold">
                                                    <Edit size={14} />
                                                </button>
                                                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UniformsManagement;
