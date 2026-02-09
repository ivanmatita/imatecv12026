import React, { useState, useEffect } from 'react';
import { Employee, WorkLocation, Profession } from '../types';
import { Save, X, User, Briefcase, CreditCard, FileText } from 'lucide-react';
import { generateId } from '../utils';

interface EmployeeFormProps {
    initialData?: Employee;
    onSave: (data: Employee) => void;
    onCancel: () => void;
    workLocations: WorkLocation[];
    professions: Profession[];
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
    initialData,
    onSave,
    onCancel,
    workLocations,
    professions
}) => {
    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'PROFESSIONAL' | 'FINANCIAL' | 'OTHER'>('PERSONAL');
    const [formData, setFormData] = useState<Partial<Employee>>({
        id: generateId(),
        status: 'Active',
        ...initialData
    });

    const handleChange = (field: keyof Employee, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation could go here
        onSave(formData as Employee);
    };

    const InputField = ({ label, field, type = 'text', required = false }: { label: string, field: keyof Employee, type?: string, required?: boolean }) => (
        <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={formData[field] as string || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={required}
            />
        </div>
    );

    const SelectField = ({ label, field, options, required = false }: { label: string, field: keyof Employee, options: { value: string, label: string }[], required?: boolean }) => (
        <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={formData[field] as string || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={required}
            >
                <option value="">Selecione...</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {initialData ? <User size={20} className="text-blue-600" /> : <User size={20} className="text-green-600" />}
                        {initialData ? 'Editar Colaborador' : 'Novo Colaborador'}
                    </h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('PERSONAL')}
                        className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition ${activeTab === 'PERSONAL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <User size={16} /> Dados Pessoais
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('PROFESSIONAL')}
                        className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition ${activeTab === 'PROFESSIONAL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Briefcase size={16} /> Dados Profissionais
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('FINANCIAL')}
                        className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition ${activeTab === 'FINANCIAL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CreditCard size={16} /> Financeiro
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('OTHER')}
                        className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition ${activeTab === 'OTHER' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <FileText size={16} /> Outros & Subsídios
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <form id="employee-form" onSubmit={handleSubmit}>
                        {activeTab === 'PERSONAL' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <InputField label="Nome Completo" field="name" required />
                                <InputField label="NIF" field="nif" required />
                                <InputField label="BI / Passaporte" field="idCardNumber" />
                                <InputField label="Data de Nascimento" field="birthDate" type="date" />
                                <SelectField label="Género" field="gender" options={[{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }]} />
                                <SelectField label="Estado Civil" field="maritalStatus" options={[{ value: 'Single', label: 'Solteiro(a)' }, { value: 'Married', label: 'Casado(a)' }, { value: 'Divorced', label: 'Divorciado(a)' }, { value: 'Widowed', label: 'Viúvo(a)' }]} />
                                <InputField label="Nacionalidade" field="nationality" />
                                <InputField label="Email" field="email" type="email" />
                                <InputField label="Telefone" field="phone" />
                                <InputField label="Morada" field="address" />
                            </div>
                        )}

                        {activeTab === 'PROFESSIONAL' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <InputField label="Número Mecanográfico" field="employeeNumber" />
                                <SelectField
                                    label="Departamento"
                                    field="department"
                                    options={[
                                        { value: 'Administrativo', label: 'Administrativo' },
                                        { value: 'Financeiro', label: 'Financeiro' },
                                        { value: 'Comercial', label: 'Comercial' },
                                        { value: 'Operacional', label: 'Operacional' },
                                        { value: 'RH', label: 'Recursos Humanos' },
                                        { value: 'TI', label: 'Tecnologia' }
                                    ]}
                                />
                                <SelectField
                                    label="Função / Cargo"
                                    field="professionId"
                                    options={professions.map(p => ({ value: p.id, label: p.name }))}
                                />
                                <InputField label="Cargo (Texto Livre)" field="role" />
                                <InputField label="Data de Admissão" field="admissionDate" type="date" required />
                                <SelectField
                                    label="Local de Trabalho"
                                    field="workLocationId"
                                    options={workLocations.map(w => ({ value: w.id, label: w.name }))}
                                />
                                <SelectField
                                    label="Estado"
                                    field="status"
                                    options={[
                                        { value: 'Active', label: 'Activo' },
                                        { value: 'OnLeave', label: 'Em Licença' },
                                        { value: 'Terminated', label: 'Demitido' }
                                    ]}
                                />
                                <SelectField
                                    label="Tipo de Contrato"
                                    field="contractType"
                                    options={[
                                        { value: 'Determinado', label: 'Determinado' },
                                        { value: 'Indeterminado', label: 'Indeterminado' },
                                        { value: 'Estagio', label: 'Estágio' }
                                    ]}
                                />
                            </div>
                        )}

                        {activeTab === 'FINANCIAL' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Salário Base</label>
                                    <input
                                        type="number"
                                        value={formData.baseSalary || 0}
                                        onChange={(e) => handleChange('baseSalary', Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <InputField label="IBAN" field="iban" />
                                <InputField label="Banco" field="bankName" />
                                <SelectField
                                    label="Método de Pagamento"
                                    field="paymentMethod"
                                    options={[
                                        { value: 'Bank Transfer', label: 'Transferência Bancária' },
                                        { value: 'Cash', label: 'Numerário' },
                                        { value: 'Check', label: 'Cheque' }
                                    ]}
                                />
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nº Segurança Social</label>
                                    <input
                                        type="text"
                                        value={formData.socialSecurityNumber || ''}
                                        onChange={(e) => handleChange('socialSecurityNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'OTHER' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                <div className="col-span-2 text-sm font-bold text-slate-500 bg-slate-100 p-2 rounded mb-2">Subsídios Fixos</div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Alimentação</label>
                                    <input type="number" value={formData.subsidyFood || 0} onChange={(e) => handleChange('subsidyFood', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Transporte</label>
                                    <input type="number" value={formData.subsidyTransport || 0} onChange={(e) => handleChange('subsidyTransport', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Habitação</label>
                                    <input type="number" value={formData.subsidyHousing || 0} onChange={(e) => handleChange('subsidyHousing', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Família</label>
                                    <input type="number" value={formData.subsidyFamily || 0} onChange={(e) => handleChange('subsidyFamily', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Outros Abonos</label>
                                    <input type="number" value={formData.allowances || 0} onChange={(e) => handleChange('allowances', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Subsídio de Natal (Duodécimo)</label>
                                    <input type="number" value={formData.subsidyChristmas || 0} onChange={(e) => handleChange('subsidyChristmas', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Subsídio de Férias (Duodécimo)</label>
                                    <input type="number" value={formData.subsidyVacation || 0} onChange={(e) => handleChange('subsidyVacation', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Outros Subsídios</label>
                                    <input type="number" value={formData.otherSubsidies || 0} onChange={(e) => handleChange('otherSubsidies', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="employee-form"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2"
                    >
                        <Save size={18} />
                        Guardar Ficha
                    </button>
                </div>
            </div >
        </div >
    );
};

export default EmployeeForm;
