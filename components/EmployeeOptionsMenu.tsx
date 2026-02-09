import React, { useState } from 'react';
import { UserX, FileText, UserCheck, FileSignature, Shirt, MoreVertical } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeOptionsMenuProps {
    employee: Employee;
    onDismiss: (emp: Employee) => void;
    onViewProfile: (emp: Employee) => void;
    onViewPersonalFile: (emp: Employee) => void;
    onReadmit: (emp: Employee) => void;
    onIssueContract: (emp: Employee) => void;
    onManageUniforms: (emp: Employee) => void;
}

const EmployeeOptionsMenu: React.FC<EmployeeOptionsMenuProps> = ({
    employee,
    onDismiss,
    onViewProfile,
    onViewPersonalFile,
    onReadmit,
    onIssueContract,
    onManageUniforms
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Opções"
            >
                <MoreVertical size={18} className="text-slate-600" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Dropdown - Centered on screen */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-slate-300 rounded-lg shadow-2xl min-w-[280px] py-2">
                        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
                            <p className="font-bold text-slate-800 text-sm">Opções - {employee.name}</p>
                            <p className="text-xs text-slate-500">Nº {employee.employeeNumber || '---'}</p>
                        </div>

                        <div className="py-1">
                            {employee.status !== 'Terminated' && (
                                <button
                                    onClick={() => handleOptionClick(() => onDismiss(employee))}
                                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-sm group"
                                >
                                    <UserX size={18} className="text-red-500 group-hover:text-red-600" />
                                    <span className="font-medium text-slate-700 group-hover:text-red-700">Demitir Funcionário</span>
                                </button>
                            )}

                            <button
                                onClick={() => handleOptionClick(() => onViewProfile(employee))}
                                className="w-full px-4 py-2.5 text-left hover:bg-slate-100 transition-colors flex items-center gap-3 text-sm group"
                            >
                                <FileText size={18} className="text-slate-500 group-hover:text-slate-700" />
                                <span className="font-medium text-slate-700">Cadastro</span>
                            </button>

                            <button
                                onClick={() => handleOptionClick(() => onViewPersonalFile(employee))}
                                className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 text-sm group"
                            >
                                <FileText size={18} className="text-orange-500 group-hover:text-orange-600" />
                                <span className="font-medium text-slate-700 group-hover:text-orange-700">Cadastro Pessoal</span>
                            </button>

                            {employee.status === 'Terminated' && (
                                <button
                                    onClick={() => handleOptionClick(() => onReadmit(employee))}
                                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 text-sm group"
                                >
                                    <UserCheck size={18} className="text-emerald-500 group-hover:text-emerald-600" />
                                    <span className="font-medium text-slate-700 group-hover:text-emerald-700">Readmitir</span>
                                </button>
                            )}

                            <button
                                onClick={() => handleOptionClick(() => onIssueContract(employee))}
                                className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 text-sm group"
                            >
                                <FileSignature size={18} className="text-slate-500 group-hover:text-orange-600" />
                                <span className="font-medium text-slate-700 group-hover:text-orange-700">Emitir Contrato</span>
                            </button>

                            <button
                                onClick={() => handleOptionClick(() => onManageUniforms(employee))}
                                className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 text-sm group"
                            >
                                <Shirt size={18} className="text-slate-500 group-hover:text-orange-600" />
                                <span className="font-medium text-slate-700 group-hover:text-orange-700">Fardas</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EmployeeOptionsMenu;
