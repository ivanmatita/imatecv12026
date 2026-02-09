import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, Printer, Download, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Employee } from '../types';
import { formatDate } from '../utils';

interface PersonalRegistrationProps {
    onClose?: () => void;
    employee?: Employee | null;
    employees?: Employee[];
}

const PersonalRegistration: React.FC<PersonalRegistrationProps> = ({ onClose, employee: propEmployee, employees = [] }) => {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(propEmployee || null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (propEmployee) setSelectedEmployee(propEmployee);
    }, [propEmployee]);

    if (!selectedEmployee) {
        const filtered = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-start pt-20">
                {/* Selection View */}
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
                    <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
                        <div>
                            <h2 className="text-xl font-bold uppercase">Cadastro Pessoal</h2>
                            <p className="text-sm text-slate-300">Selecione um colaborador para visualizar a ficha</p>
                        </div>
                        <button onClick={onClose} className="text-slate-300 hover:text-white"><ArrowLeft /></button>
                    </div>
                    <div className="p-6 border-b border-slate-200">
                        <input
                            className="w-full p-3 border border-slate-300 rounded-lg"
                            placeholder="Pesquisar colaborador..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="p-4">Nome</th>
                                    <th className="p-4">Função</th>
                                    <th className="p-4">Departamento</th>
                                    <th className="p-4 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                                        <td className="p-4 font-bold text-slate-700">{emp.name}</td>
                                        <td className="p-4 text-slate-600">{emp.role}</td>
                                        <td className="p-4 text-slate-600">{emp.department || '-'}</td>
                                        <td className="p-4 text-center">
                                            <button className="text-blue-600 font-bold text-xs hover:underline">Selecionar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div className="p-8 text-center text-slate-400">Nenhum colaborador encontrado</div>}
                    </div>
                </div>
            </div>
        );
    }

    const employee = selectedEmployee;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white flex justify-center">
            {/* Control Bar - Hidden on print */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center z-50 print:hidden">
                <div className="max-w-[210mm] w-full mx-auto flex justify-between">
                    <button onClick={onClose} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold">
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition">
                            <Printer size={18} /> Imprimir
                        </button>
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                            <Download size={18} /> Baixar PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* A4 Sheet */}
            <div className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-[10mm] mx-auto mt-16 print:mt-0 relative text-slate-900">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2 mb-4">
                    <h1 className="text-2xl font-black uppercase text-slate-800 tracking-tight">FICHA PESSOAL FUNCIONARIO</h1>
                    <div className="text-right">
                        <p className="font-bold text-lg">{employee.name.toUpperCase()}</p>
                    </div>
                </div>

                {/* Top Info Grid */}
                <div className="grid grid-cols-12 gap-4 mb-6">
                    <div className="col-span-8 space-y-2 text-xs">
                        <div className="grid grid-cols-12">
                            <span className="col-span-2 font-bold">NIDF:</span>
                            <span className="col-span-10 font-mono font-bold">{employee.nif || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-12">
                            <span className="col-span-2 font-bold">Nome:</span>
                            <span className="col-span-10 font-bold">{employee.name}</span>
                        </div>
                        <div className="grid grid-cols-12">
                            <span className="col-span-2 font-bold">Rua:</span>
                            <span className="col-span-10">{employee.address || ''}</span>
                        </div>
                        <div className="grid grid-cols-12">
                            <span className="col-span-2 font-bold">Residência:</span>
                            <span className="col-span-5">{employee.address || ''}</span>
                            <span className="col-span-2 font-bold text-right pr-2">CASA Nº:</span>
                            <span className="col-span-3"></span>
                        </div>
                        <div className="grid grid-cols-12">
                            <span className="col-span-2 font-bold">C.Postal:</span>
                            <span className="col-span-4"></span>
                            <span className="col-span-2 font-bold">Provincia:</span>
                            <span className="col-span-4">{employee.province || 'Luanda'}</span>
                        </div>
                        <div className="grid grid-cols-12">
                            <span className="col-span-2 font-bold">Contactos:</span>
                            <span className="col-span-10 flex gap-4">
                                <span><span className="font-bold">Pessoal:</span> {employee.phone}</span>
                                <span><span className="font-bold">Movel:</span> {employee.phone}</span>
                                <span><span className="font-bold">Serviço:</span></span>
                            </span>
                        </div>
                        <div className="grid grid-cols-12">
                            <span className="col-span-2 font-bold">E-mail:</span>
                            <span className="col-span-10">{employee.email}</span>
                        </div>
                    </div>

                    {/* Photo Box */}
                    <div className="col-span-4 flex justify-end">
                        <div className="w-[35mm] h-[45mm] border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                            {employee.photoUrl ? (
                                <img src={employee.photoUrl} className="w-full h-full object-cover" alt="Foto" />
                            ) : (
                                <span className="text-[10px] text-slate-400 text-center">FOTO<br />Passporte</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section: IDENTIFICAÇÃO */}
                <SectionBox title="IDENTIFICAÇÃO">
                    <div className="grid grid-cols-5 gap-2 mb-2">
                        <Field label="Bilhete de Identidade Nº" value={employee.idCardNumber || ''} />
                        <Field label="Data de Emissão" value="0000-00-00" />
                        <Field label="Válido Até" value={employee.idCardExpiration ? formatDate(employee.idCardExpiration) : '0000-00-00'} />
                        <Field label="Arquivo Emissor" value="D.N.I" />
                        <Field label="Estado Civil" value={employee.maritalStatus} />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                            <Field label="Data Nascimento" value={employee.birthDate ? formatDate(employee.birthDate) : '0000-00-00'} />
                            <Field label="Natural de" value="Luanda" />
                        </div>
                        <div className="col-span-2 grid grid-cols-3 gap-2">
                            <Field label="Província" value={employee.province || 'Luanda'} />
                            <Field label="Nacionalidade" value={employee.nationality || 'Angolana'} />
                            <Field label="Sexo" value={employee.gender} />
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1">
                        <Field label="Nome Pai" value={employee.fatherName || ''} />
                        <Field label="Nome Mãe" value={employee.motherName || ''} />
                    </div>
                </SectionBox>

                {/* Section: CÔNJUGE (Simplified) */}
                <SectionBox title="CÔNJUGE">
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Nome" value={employee.spouseName || ''} />
                        <div className="grid grid-cols-2 gap-2">
                            <Field label="Pai" value="" />
                            <Field label="Mãe" value="" />
                        </div>
                    </div>
                </SectionBox>

                {/* Section: FAMILIAR DIRECTO */}
                <SectionBox title="FAMILIAR DIRECTO">
                    <table className="w-full text-[10px] mt-1">
                        <thead>
                            <tr className="border-b border-slate-300 font-bold text-left">
                                <th className="py-1">Nome</th>
                                <th className="py-1">Parentesco</th>
                                <th className="py-1">Contacto</th>
                                <th className="py-1">Morada</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2 border-b border-slate-100 h-6"></td>
                                <td className="border-b border-slate-100"></td>
                                <td className="border-b border-slate-100"></td>
                                <td className="border-b border-slate-100"></td>
                            </tr>
                        </tbody>
                    </table>
                </SectionBox>

                {/* Section: DADOS BANCARIOS */}
                <SectionBox title="DADOS BANCARIOS">
                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                            <Field label="Titular" value={employee.name} />
                        </div>
                        <div className="col-span-2">
                            <Field label="Banco" value={employee.bankName || ''} />
                        </div>
                        <div className="col-span-3">
                            <Field label="Nº de Conta" value={employee.accountNumber || ''} />
                        </div>
                        <div className="col-span-3">
                            <Field label="IBAN" value={employee.iban || ''} />
                        </div>
                        <div className="col-span-1">
                            <Field label="Cod. SWIFT" value="" />
                        </div>
                    </div>
                </SectionBox>

                {/* Section: DADOS FISCAIS E MILITARES */}
                <SectionBox title="DADOS FISCAIS E MILITARES">
                    <div className="grid grid-cols-4 gap-2">
                        <Field label="Nº Contribuinte" value={employee.nif || ''} />
                        <Field label="Repartição" value="3ª Repartição" />
                        <div className="col-span-1">
                            <p className="text-[9px] font-bold text-slate-500 mb-0.5">Nº Segurança Social</p>
                            <div className="text-[10px]">
                                <div className="flex justify-between"><span>Antigo:</span> <span></span></div>
                                <div className="flex justify-between"><span className="font-bold">Novo:</span> <span className="font-bold">{employee.socialSecurityNumber || ''}</span></div>
                            </div>
                        </div>
                        <Field label="Situação Militar" value="Regularizada" />
                    </div>
                </SectionBox>

                {/* Section: DADOS PROFISSIONAIS */}
                <SectionBox title="DADOS PROFISSIONAIS">
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        <Field label="Profissão" value={employee.role || ''} />
                        <Field label="Categ Carta Condução" value="" />
                        <Field label="Ultima Empresa Serviço" value="" />
                        <Field label="Tempo Serviço" value="" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Field label="Grau Académico" value={employee.educationLevel || ''} />
                        <Field label="Local de Estudo" value="" />
                        <Field label="Outras Aptidões" value="" />
                    </div>
                </SectionBox>

                {/* Section: DADOS PROFISSIONAL NA ADMISSÃO */}
                <SectionBox title="DADOS PROFISSIONAL NA ADMISSÃO">
                    <div className="grid grid-cols-7 gap-2">
                        <Field label="Data de Admissão" value={employee.admissionDate || ''} />
                        <Field label="Data de Fim" value="" />
                        <Field label="Categoria Profissional" value={employee.role} />
                        <Field label="Salario Base" value={employee.baseSalary?.toLocaleString('pt-AO') || '0,00'} align="right" />
                        <Field label="Transp/dia" value="0,00" align="right" />
                        <Field label="Aliment/dia" value="0,00" align="right" />
                        <Field label="Anotações" value="" />
                    </div>
                    <div className="mt-2 border-t border-slate-200 pt-1">
                        <p className="text-[10px] font-bold">Outros, Beneficios e Regalias:</p>
                        <p className="text-[10px] pl-2">- Subsídio de Transporte: {(employee.subsidyTransport || 0).toLocaleString('pt-AO')}</p>
                        <p className="text-[10px] pl-2">- Subsídio de Alimentação: {(employee.subsidyFood || 0).toLocaleString('pt-AO')}</p>
                    </div>
                </SectionBox>

                {/* Section: Data de Demissão */}
                <div className="border border-slate-300 p-1 mb-2 mt-4 bg-slate-50">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                            <Field label="Data de Demissão" value={employee.dismissalDate || '0000-00-00'} />
                        </div>
                        <div className="col-span-9">
                            <Field label="Motivo" value={employee.dismissalReason || ''} />
                        </div>
                    </div>
                </div>

                {/* Footer Checkboxes */}
                <div className="border-t-2 border-slate-800 pt-2 mt-4">
                    <h3 className="text-[10px] font-bold uppercase mb-1">OUTROS ELEMENTOS IDENTIFICATIVOS</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[9px]">
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Bilhete de Identidade</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> DRM - Situação Militar</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Cartão da INSS</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Comprovativo Bancario</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Cartão Contribuinte</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Parecer da Policia Nacional</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Atestado Médico</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Curriculum</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Registo Criminal</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Certificado Habilitações</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Ficha Assinada</label>
                        <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Contrato</label>
                    </div>
                </div>

                {/* Signature */}
                <div className="mt-12 flex justify-center">
                    <div className="border-t border-black w-64 text-center">
                        <p className="text-[10px] pt-1">assinatura conforme bilhete de identidade</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper Components for A4 Layout
const SectionBox = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-2">
        <h3 className="text-[10px] font-bold uppercase border-b border-slate-300 mb-1">{title}</h3>
        {children}
    </div>
);

const Field = ({ label, value, align = 'left' }: { label: string, value: string | number, align?: 'left' | 'right' | 'center' }) => (
    <div>
        <p className="text-[9px] font-bold text-slate-500 mb-0.5">{label}</p>
        <p className={`text-[10px] font-bold text-slate-900 border-b border-dotted border-slate-300 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}>
            {value}
        </p>
    </div>
);

export default PersonalRegistration;
