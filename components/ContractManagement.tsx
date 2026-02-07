import React, { useState, useEffect } from 'react';
import { FileSignature, Save, Printer, ArrowLeft, Plus, Eye } from 'lucide-react';
import { Employee, Company } from '../types';
import { formatDate } from '../utils';

interface ContractData {
    id: string;
    employeeId: string;
    startDate: string;
    duration: number; // em meses
    durationUnit: 'months' | 'years';
    contractType: 'Determinado' | 'Indeterminado';
    trialPeriod: number; // em dias
    reason: string;
    workSchedule: string;
    workLocation: string;
    responsibleName: string;
    responsibleRole: string;
    responsibleNationality: string;
    responsibleIdNumber: string;
    responsibleIdType: string;
}

interface ContractManagementProps {
    employees: Employee[];
    company: Company;
    onClose?: () => void;
}

const ContractManagement: React.FC<ContractManagementProps> = ({
    employees,
    company,
    onClose
}) => {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [contractData, setContractData] = useState<ContractData>({
        id: '',
        employeeId: '',
        startDate: new Date().toISOString().split('T')[0],
        duration: 2,
        durationUnit: 'months',
        contractType: 'Determinado',
        trialPeriod: 30,
        reason: 'trabalho sazonal',
        workSchedule: '8 horas diárias, prefazendo um total de 44 horas semanais',
        workLocation: 'Sede da Empresa',
        responsibleName: 'ivan',
        responsibleRole: 'hhh',
        responsibleNationality: 'mjj',
        responsibleIdNumber: '00000000',
        responsibleIdType: 'Bilhete Identidade'
    });

    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        if (selectedEmployee) {
            setContractData(prev => ({
                ...prev,
                employeeId: selectedEmployee.id
            }));
        }
    }, [selectedEmployee]);

    const handleInputChange = (field: keyof ContractData, value: any) => {
        setContractData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateEndDate = () => {
        if (!contractData.startDate) return '';
        const start = new Date(contractData.startDate);
        const months = contractData.durationUnit === 'years'
            ? contractData.duration * 12
            : contractData.duration;
        start.setMonth(start.getMonth() + months);
        return start.toLocaleDateString('pt-PT');
    };

    const formatDateExtended = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate();
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        if (!selectedEmployee) {
            alert('Por favor, selecione um funcionário.');
            return;
        }
        alert('Contrato salvo com sucesso!');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <FileSignature size={32} />
                                Gestão de Contratos
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">Emissão e gestão de contratos de trabalho</p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Voltar
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Side - Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" />
                            Dados do Contrato
                        </h2>

                        <div className="space-y-4">
                            {/* Employee Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Funcionário <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedEmployee?.id || ''}
                                    onChange={(e) => {
                                        const emp = employees.find(emp => emp.id === e.target.value);
                                        setSelectedEmployee(emp || null);
                                    }}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Selecione um funcionário</option>
                                    {employees.filter(e => e.status === 'Active').map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} - {emp.employeeNumber || 'S/N'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Contract Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Tipo de Contrato
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="contractType"
                                            value="Indeterminado"
                                            checked={contractData.contractType === 'Indeterminado'}
                                            onChange={(e) => handleInputChange('contractType', e.target.value as any)}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">Tempo Indeterminado</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="contractType"
                                            value="Determinado"
                                            checked={contractData.contractType === 'Determinado'}
                                            onChange={(e) => handleInputChange('contractType', e.target.value as any)}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">Tempo Determinado</span>
                                    </label>
                                </div>
                            </div>

                            {/* Start Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Data Início Contrato
                                    </label>
                                    <input
                                        type="date"
                                        value={contractData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Data Fim
                                    </label>
                                    <input
                                        type="text"
                                        value={calculateEndDate()}
                                        disabled
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Duração
                                    </label>
                                    <input
                                        type="number"
                                        value={contractData.duration}
                                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                                        min="1"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Unidade
                                    </label>
                                    <select
                                        value={contractData.durationUnit}
                                        onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="months">Meses</option>
                                        <option value="years">Anos</option>
                                    </select>
                                </div>
                            </div>

                            {/* Trial Period */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Período Experimental (dias)
                                </label>
                                <input
                                    type="number"
                                    value={contractData.trialPeriod}
                                    onChange={(e) => handleInputChange('trialPeriod', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Motivo
                                </label>
                                <select
                                    value={contractData.reason}
                                    onChange={(e) => handleInputChange('reason', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="trabalho sazonal">Trabalho sazonal</option>
                                    <option value="Execução de trabalhos urgentes necessários ou para organizar medidas de salvaguarda para impedir danos iminentes e outros bens ou para pôr em forma a impedir riscos para esta e para os seus trabalhadores">
                                        Execução de trabalhos urgentes necessários
                                    </option>
                                    <option value="Acréscimo temporário ou excepcional da actividade normal da empresa resultante de acréscimo de tarefas, excesso de encomendas, razão de mercado ou razões sazonais">
                                        Acréscimo temporário ou excepcional da actividade
                                    </option>
                                    <option value="Realização de tarefas ocasionais e pontuais que não entram no quadro de actividade corrente da empresa">
                                        Realização de tarefas ocasionais e pontuais
                                    </option>
                                    <option value="Quando a actividade a desenvolver, por ser temporariamente limitada, não aconselha o alargamento do quadro do pessoal permanente da empresa">
                                        Quando a actividade a desenvolver é temporariamente limitada
                                    </option>
                                    <option value="Substituição de trabalhador temporariamente ausente">
                                        Substituição de trabalhador temporariamente ausente
                                    </option>
                                    <option value="Aprendizagem e formação profissional prática">
                                        Aprendizagem e formação profissional prática
                                    </option>
                                    <option value="Lançamento de actividades novas de duração incerta, início da actividade laboral, reestruturação e ampliação das actividades duma entidade empregadora ou centro de trabalho">
                                        Lançamento de actividades novas de duração incerta
                                    </option>
                                </select>
                            </div>

                            {/* Responsible Person Info */}
                            <div className="border-t border-slate-200 pt-4 mt-4">
                                <h3 className="font-bold text-slate-700 mb-3">Dados do Responsável (Empresa)</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Nome do Responsável
                                        </label>
                                        <input
                                            type="text"
                                            value={contractData.responsibleName}
                                            onChange={(e) => handleInputChange('responsibleName', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Cargo
                                        </label>
                                        <input
                                            type="text"
                                            value={contractData.responsibleRole}
                                            onChange={(e) => handleInputChange('responsibleRole', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Nacionalidade
                                        </label>
                                        <input
                                            type="text"
                                            value={contractData.responsibleNationality}
                                            onChange={(e) => handleInputChange('responsibleNationality', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Nº Documento
                                        </label>
                                        <input
                                            type="text"
                                            value={contractData.responsibleIdNumber}
                                            onChange={(e) => handleInputChange('responsibleIdNumber', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors"
                                >
                                    <Save size={18} />
                                    Salvar Contrato
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors"
                                >
                                    <Printer size={18} />
                                    Imprimir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Contract Preview */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8" style={{ minHeight: '800px' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Eye size={20} className="text-blue-600" />
                                Pré-visualização do Contrato
                            </h2>
                        </div>

                        {/* Contract Content - A4 Size */}
                        <div className="contract-preview bg-white border border-slate-300 p-8 text-sm leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                            <div className="text-center mb-6">
                                <h1 className="text-xl font-bold mb-2">Contrato de Trabalho por Tempo {contractData.contractType}</h1>
                                <p className="text-sm">Lei 12/23 de 27 de Dezembro</p>
                            </div>

                            <div className="space-y-4 text-justify">
                                <p><strong>Entre</strong></p>
                                <p>
                                    <strong>{company.name.toUpperCase()}</strong>, com sede em ANGOLA- LUANDA,LUANDA,LUANDA,
                                    contribuinte fiscal Nº{company.nif}, representada neste acto por {contractData.responsibleName},
                                    de nacionalidade {contractData.responsibleNationality}, portador do {contractData.responsibleIdType}
                                    nº{contractData.responsibleIdNumber}, na qualidade de {contractData.responsibleRole},
                                    com plenos poderes para o acto, adiante designado por <strong>EMPREGADOR</strong>
                                </p>

                                <p><strong>E</strong></p>
                                <p>
                                    <strong>{selectedEmployee?.name || '_______________'}</strong>, estado civil {selectedEmployee?.maritalStatus || '_______________'},
                                    nascido em {selectedEmployee?.birthDate ? formatDate(selectedEmployee.birthDate) : '_______________'},
                                    residente em Rua {selectedEmployee?.street || '_______________'}, Casa Nº{selectedEmployee?.houseNumber || '_______________'},
                                    Zona {selectedEmployee?.zone || '_______________'}, Bairro {selectedEmployee?.neighborhood || '_______________'},
                                    Município de {selectedEmployee?.municipality || '_______________'}, Província de {selectedEmployee?.province || '_______________'},
                                    Titular do Bilhete de Identidade Nº {selectedEmployee?.biNumber || '_______________'},
                                    emitido em {selectedEmployee?.issueDate ? formatDate(selectedEmployee.issueDate) : '_______________'},
                                    pelo {selectedEmployee?.issuer || '_______________'}, contribuinte fiscal Nº{selectedEmployee?.nif || '_______________'}
                                    adiante designado por <strong>TRABALHADOR</strong>.
                                </p>

                                <p>
                                    É celebrado o presente Contrato de Trabalho que se rege pelas disposições da Lei Geral do Trabalho e respectiva
                                    Legislação Complementar, Regulamentos Internos, Acordos Colectivos e ainda pelas cláusulas seguintes:
                                </p>

                                <div className="mt-6">
                                    <p className="font-bold mb-2">Cláusula 1: Das Tarefas do Trabalhador</p>
                                    <p>
                                        A Actividade do trabalhador consiste em trabalhos inerentes á actividade de {selectedEmployee?.role || '_______________'},
                                        e é prestado em local trabalho {contractData.workLocation}, por motivos adequados ao interesse da economia nacional
                                        e nos limites da Lei, reserva a faculdade de transferir o trabalhador para outro local de trabalho.
                                        É objecto do presente contrato, a prestação de serviços de {selectedEmployee?.role || '_______________'},
                                        do TRABALHADOR à EMPRESA, de acordo com o Estatuto da {company.name}, Regulamentos da {company.name},
                                        a Lei Geral do Trabalho e estipulado entre as partes.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 2: Categoria Profissional</p>
                                    <p>
                                        Ao TRABALHADOR é garantida a ocupação efectiva do posto de trabalho de {selectedEmployee?.role || '_______________'}
                                        pertencentes ao qualificador ocupacional NA e integrado no grupo NA da escala salarial com a categoria ocupacional de NA.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 3: Duração do Trabalho</p>
                                    <p>O periodo normal de trabalho diário é de {contractData.workSchedule}.</p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 4: Remuneração do Trabalhador</p>
                                    <p>
                                        O TRABALHADOR tem direito a uma remuneração paga mensal, sob a forma monetária no valor de {selectedEmployee?.baseSalary?.toLocaleString('pt-AO') || '0,00'} AKZ
                                        ( são ), integrado pelos seguintes elementos: gratificações e/ou outros subsidios, a título de subsídio de férias (50%)
                                        e de subsídio de Natal (50%) do salário base, nos termos da lei.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 5: Segurança, higiene e segurança.</p>
                                    <p>O posto de trabalho obedece as condições de segurança, higiene e saúde no trabalho legalmente exigidas.</p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 6: Duração do Contrato</p>
                                    <p>
                                        O contrato é celebrado por periodo {contractData.contractType === 'Determinado' ? 'determinado' : 'indeterminado'} com
                                        inicio em {formatDateExtended(contractData.startDate)} e duração de ({contractData.duration}) {contractData.durationUnit === 'months' ? 'meses' : 'anos'},
                                        renováveis por iguais periodos de tempo, com um periodo experimental de {contractData.trialPeriod} dias.
                                    </p>
                                </div>

                                {contractData.contractType === 'Determinado' && (
                                    <div className="mt-4">
                                        <p className="font-bold mb-2">Cláusula 6a: Motivo</p>
                                        <p>
                                            O contrato é celebrado a Tempo Determinado pelo motivo de {contractData.reason}, com uma duração máxima de 6 meses,
                                            após o qual o contrato se converte automaticamente para Contrato por Tempo Indeterminado.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 7: Confidencialidade</p>
                                    <p>
                                        No acto de assinatura do contrato o trabalhador obriga-se a não divulgar a terceiros ou mesmo em repartições da propria empresa,
                                        a natureza do seu trabalho, dados técnicos ou outra informações relevantes a que tiver acesso em função das suas actividades,
                                        decorrentes da execução do contrato.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 8: Da nulidade do Contrato</p>
                                    <p>O contrato apenas pode ser modificado nas condições previstas na Lei Geral do Trabalho.</p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 9: Pré-Aviso de Rescisão</p>
                                    <p>
                                        Ocorrendo algum dos motivos que justifiquem a rescisão com aviso prévio, a parte a quem couber a iniciativa avisa a outra
                                        com uma antecedência de 30 dias especificando as razões que considera justificativas da rescisao que pretende concretizar,
                                        depois de observar os requisitos previstos na Lei Geral do Trabalho.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 10: Renovação do Contrato</p>
                                    <p>O contrato cessa no termo do periodo pelo qual foi celebrado e renova-se automaticamente se nenhuma das partes se manifestar.</p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 11: Horário de Trabalho</p>
                                    <p>
                                        No momento da celebração do presente contrato, o trabalhador tomou conhecimento do horário de trabalho, regulamento interno
                                        e cordo colectivo em vigor na empresa.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 12: Trâmites legais</p>
                                    <p>
                                        O presente contrato é reproduzido em três vias, sendo uma para o trabalhador, a outra para a entidade empregadora e a
                                        teceira remetida ao Centro de Emprego competente da respectiva área de actividade.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 13: Responsabilidade acessória</p>
                                    <p>
                                        O TRABALHADOR deverá ainda, acessoriamente, realizar quaisquer outras tarefas que lhe sejam indicadas, para as quais tenha
                                        qualificação ou capacidade bastantes e que tenha afinidade funcional com as que habitualmente correspondem as suas funções normais,
                                        sem qualquer prejuízo para a sua posição na EMPRESA.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 14: Responsabilidade Civil</p>
                                    <p>
                                        Findo o presente contrato, seja qual for o motivo ou forma, o segundo outorgante deve devolver, os instrumentos de trabalhos
                                        e qualquer outro objeto que seja pertença desta, sob pena de incorrer em responsabilidade criminal e em responsabilidade civil
                                        pelos danos causados.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="font-bold mb-2">Cláusula 15: Da Lei Geral do Trabalho</p>
                                    <p>
                                        Tudo o mais omisso no presente contrato será regido pela Lei Geral do Trabalho ou outra, que regulamente o presente contrato.
                                        Em caso de litígio, será elegida a Comarca de Luanda com renúncia a qualquer outra.
                                    </p>
                                </div>

                                {/* Signatures */}
                                <div className="mt-12 grid grid-cols-2 gap-8">
                                    <div className="text-center">
                                        <div className="border-t border-slate-400 pt-2 mt-16">
                                            <p className="font-bold">O FUNCIONÁRIO:</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-t border-slate-400 pt-2 mt-16">
                                            <p className="font-bold">O EMPREGADOR:</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <p>Luanda, _____ de _________________ de ________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .contract-preview, .contract-preview * {
                        visibility: visible;
                    }
                    .contract-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        padding: 20mm;
                    }
                }
            `}</style>
        </div>
    );
};

export default ContractManagement;
