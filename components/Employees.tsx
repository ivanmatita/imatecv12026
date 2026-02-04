
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, WorkLocation, Profession } from '../types';
import { generateUUID, formatCurrency, calculateINSS, calculateIRT, formatDate } from '../utils';
import { supabase } from '../services/supabaseClient';
import {
    Users, UserPlus, Search, Filter, Printer, FileText, Trash2, Edit2, Eye, Ban, CheckCircle,
    MapPin, Phone, Mail, Calendar, CreditCard, Building2, ChevronDown, ChevronUp, X, Save, Upload, User,
    RefreshCw, Database, AlertCircle, Info, Settings, Ruler, Gavel, Wallet, Gift, FileSignature,
    UserCheck, UserMinus, MoreVertical, Calculator, ChevronRight, List, Briefcase, Plus, PlusCircle,
    ArrowLeft, Loader2, Home, Hash, ClipboardList, Clock, Sparkles, Coffee, ShieldCheck, Scale, FilePlus, UserX,
    UserCog
} from 'lucide-react';

interface EmployeesProps {
    employees: Employee[];
    onSaveEmployee: (emp: Employee) => void;
    workLocations: WorkLocation[];
    professions: Profession[];
    onIssueContract?: (emp: Employee) => void;
    onPrintSlip?: (emp: Employee) => void;
    onChangeView?: (view: any) => void;
    onExecuteProcess?: (empId: string) => void;
}

const INSS_INDEXED_PROFESSIONS = [
    { code: '1', name: 'Químico' },
    { code: '2', name: 'Químico - Especialista em Química Orgânica' },
    { code: '3', name: 'Químico - Especialista em Química Inorgânica' },
    { code: '4', name: 'Químico - Especialista em Química-Física' },
    { code: '5', name: 'Químico - Especialista em Química Analítica' },
    { code: '6', name: 'Outros Químicos' },
    { code: '7', name: 'Físico' },
    { code: '8', name: 'Físico - Especialista em Mecânica' },
    { code: '9', name: 'Físico - Especialista em Termodinâmica' },
    { code: '10', name: 'Físico - Especialista em Óptica' },
    { code: '11', name: 'Físico - Especialista em Acústica' },
    { code: '12', name: 'Físico - Especialista em Electricidade e Magnetismo' },
    { code: '13', name: 'Físico - Especialista em Electrónica' },
    { code: '14', name: 'Físico - Especialista em Energia Nuclear' },
    { code: '15', name: 'Físico - Especialista do Estado Sólido' },
    { code: '16', name: 'Físico - Especialista em Física Atómica e Molecular' },
    { code: '17', name: 'Outros Físicos' },
    { code: '18', name: 'Geofísico' },
    { code: '19', name: 'Geólogo' },
    { code: '20', name: 'Hidro-Geólogo' },
    { code: '21', name: 'Oceanógrafo' },
    { code: '22', name: 'Meteorologista' },
    { code: '23', name: 'Astrónomo' },
    { code: '31', name: 'Arquitecto' },
    { code: '34', name: 'Engenheiro Civil' },
    { code: '45', name: 'Engenheiro Electrotécnico' },
    { code: '51', name: 'Engenheiro Mecânico' },
    { code: '74', name: 'Desenhador em Geral' },
    { code: '102', name: 'Piloto de Avião' },
    { code: '160', name: 'Médico - Clínica Geral' },
    { code: '176', name: 'Médico Legista' }
];

const LOCAL_STORAGE_PROFS_KEY = 'imatec_profissoes_locais';

const Employees: React.FC<EmployeesProps> = ({ employees, onSaveEmployee, workLocations, professions, onIssueContract, onPrintSlip, onChangeView, onExecuteProcess }) => {
    const [view, setView] = useState<'LIST' | 'FORM' | 'CLASSIFIER_LIST' | 'CLASSIFIER_FORM' | 'CLASSIFIER_SIMULATOR'>('LIST');
    const [classifierTab, setClassifierTab] = useState<'EMPLOYEES' | 'PROFESSIONS'>('EMPLOYEES');
    const [simulationData, setSimulationData] = useState<Partial<Employee>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [isLoadingCloud, setIsLoadingCloud] = useState(false);
    const [syncWarning, setSyncWarning] = useState<string | null>(null);

    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const [internalProfessions, setInternalProfessions] = useState<Profession[]>([]);
    const [editingInternalProf, setEditingInternalProf] = useState<Profession | null>(null);
    const [profFormData, setProfFormData] = useState<Partial<Profession>>({
        baseSalary: 0,
        complement: 0,
        indexedProfessionName: 'NA - Aguarda Profissão'
    });

    const [formData, setFormData] = useState<Partial<Employee>>({
        status: 'Active',
        contractType: 'Determinado',
        gender: 'M',
        maritalStatus: 'Solteiro'
    });

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        address: false,
        personal: false,
        fiscal: false,
        professional: false,
        subsidies: false,
        others: false
    });

    const [showInssModal, setShowInssModal] = useState(false);
    const [inssSearch, setInssSearch] = useState('');

    const departments = useMemo(() => {
        const depts = new Set(employees.map(e => e.department).filter(Boolean));
        return Array.from(depts);
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const name = emp.name.toLowerCase();
            const sTerm = searchTerm.toLowerCase();
            const matchesSearch = name.includes(sTerm) ||
                (emp.employeeNumber && emp.employeeNumber.toLowerCase().includes(sTerm)) ||
                (emp.biNumber && emp.biNumber.toLowerCase().includes(sTerm));

            const matchesStatus = statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && emp.status === 'Active') ||
                (statusFilter === 'INACTIVE' && emp.status !== 'Active');

            const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

            return matchesSearch && matchesStatus && matchesDept;
        });
    }, [employees, searchTerm, statusFilter, deptFilter]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const ensureUUID = (id: string): string => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(id)) return id;
        const hex = id.split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(32, '0').substring(0, 32);
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-a${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
    };

    useEffect(() => {
        fetchEmployeesCloud();
        fetchInternalProfessions();
    }, []);

    async function fetchInternalProfessions() {
        setIsLoadingCloud(true);
        setSyncWarning(null);
        try {
            const { data, error } = await supabase.from('profissoes_internas').select('*').order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped: Profession[] = data.map(p => ({
                    id: p.id,
                    code: p.codigo_inss || '',
                    name: p.nome_profissao,
                    indexedProfessionName: p.profissao_inss,
                    indexedProfessionCode: p.codigo_inss,
                    baseSalary: Number(p.salario_base || 0),
                    complement: Number(p.ajudas_custo || 0),
                    createdAt: p.created_at,
                    userName: p.created_by || 'Admin',
                    category: 'Interna'
                }));
                setInternalProfessions(mapped);
                localStorage.setItem(LOCAL_STORAGE_PROFS_KEY, JSON.stringify(mapped));
            }
        } catch (e: any) {
            console.warn("Cloud connection issue, using local cache:", e.message);
            setSyncWarning("Ligação Cloud instável. A utilizar cache local.");
            const local = localStorage.getItem(LOCAL_STORAGE_PROFS_KEY);
            if (local) setInternalProfessions(JSON.parse(local));
        } finally {
            setIsLoadingCloud(false);
        }
    }

    async function fetchEmployeesCloud() {
        setIsLoadingCloud(true);
        try {
            const { data, error } = await supabase.from('funcionarios').select('*').order('nome', { ascending: true });
            if (error) throw error;
            if (data) {
                data.forEach(f => {
                    const mapped: Employee = {
                        id: f.id,
                        employeeNumber: f.employee_number,
                        name: f.nome,
                        nif: f.nif,
                        biNumber: f.bi_number,
                        ssn: f.ssn,
                        role: f.cargo,
                        category: f.categoria,
                        department: f.departamento,
                        baseSalary: Number(f.salario_base || 0),
                        status: (f.status === 'Active' || f.status === 'Terminated' || f.status === 'OnLeave') ? f.status : 'Active',
                        admissionDate: f.data_admissao,
                        terminationDate: f.data_demissao,
                        email: f.email,
                        phone: f.telefone,
                        bankAccount: f.conta_bancaria,
                        bankName: f.nome_banco,
                        iban: f.iban,
                        photoUrl: f.foto_url,
                        contractType: f.tipo_contrato as any,
                        subsidyTransport: Number(f.subs_transporte || 0),
                        subsidyTransportStart: f.subs_transporte_inicio,
                        subsidyTransportEnd: f.subs_transporte_fim,
                        subsidyFood: Number(f.subs_alimentacao || 0),
                        subsidyFoodStart: f.subs_alimentacao_inicio,
                        subsidyFoodEnd: f.subs_alimentacao_fim,
                        subsidyFamily: Number(f.subs_familia || 0),
                        subsidyFamilyStart: f.subs_familia_inicio,
                        subsidyFamilyEnd: f.subs_familia_fim,
                        subsidyHousing: Number(f.subs_habitacao || 0),
                        subsidyHousingStart: f.subs_habitacao_inicio,
                        subsidyHousingEnd: f.subs_habitacao_fim,
                        subsidyChristmas: Number(f.subs_natal || 0),
                        subsidyChristmasStart: f.subs_natal_inicio,
                        subsidyChristmasEnd: f.subs_natal_fim,
                        subsidyVacation: Number(f.subs_ferias || 0),
                        subsidyVacationStart: f.subs_ferias_inicio,
                        subsidyVacationEnd: f.subs_ferias_fim,
                        subsidyExtra: 0,
                        allowances: Number(f.abonos || 0),
                        allowancesStart: f.abonos_inicio,
                        allowancesEnd: f.abonos_fim,
                        advances: Number(f.adiantamentos || 0),
                        advancesStart: f.adiantamentos_inicio,
                        advancesEnd: f.adiantamentos_fim,
                        salaryAdjustments: Number(f.salary_adjustments || 0),
                        penalties: Number(f.penalties || 0),
                        gender: f.genero as any,
                        birthDate: f.data_nascimento,
                        maritalStatus: f.estado_civil as any,
                        nationality: f.nacionalidade,
                        address: f.endereco,
                        municipality: f.municipio,
                        neighborhood: f.bairro,
                        workLocationId: f.work_location_id,
                        companyId: f.empresa_id,
                        performanceScore: f.performance_score,
                        turnoverRisk: f.turnover_risk,
                        isMagic: f.is_magic || false,

                        // New Mappings
                        houseNumber: f.casa_n,
                        street: f.rua,
                        zone: f.zona,
                        postalCode: f.codigo_postal,
                        taxOffice: f.reparticao_fiscal,
                        ssnOld: f.inss_antigo,
                        workLocationProvince: f.local_trabalho_provincia,
                        workLocationMunicipality: f.local_trabalho_municipio,
                        irtGroup: f.grupo_irt,
                        documentType: f.tipo_documento,
                        documentNumber: f.numero_documento,
                        issuer: f.entidade_emissora,
                        issueDate: f.data_emissao,
                        expiryDate: f.data_validade,
                        naturality: f.naturalidade,
                        fatherName: f.nome_pai,
                        motherName: f.nome_mae,
                        requestedBy: f.solicitado_por,
                        admissionReason: f.motivo_admissao,
                        weeklySchedule: f.horario_semanal || { seg: 8, ter: 8, qua: 8, qui: 8, sex: 8, sab: 4, dom: 0, total: 44 }
                    };
                    onSaveEmployee(mapped);
                });
            }
        } catch (err) {
            console.error("Erro ao carregar Funcionários Cloud:", err);
        } finally {
            setIsLoadingCloud(false);
        }
    }

    const handleCreate = () => {
        setFormData({
            status: 'Active',
            contractType: 'Determinado',
            gender: 'M',
            maritalStatus: 'Solteiro',
            admissionDate: new Date().toISOString().split('T')[0],
            subsidyTransport: 0,
            subsidyFood: 0,
            subsidyFamily: 0,
            subsidyHousing: 0,
            subsidyChristmas: 0,
            subsidyVacation: 0,
            allowances: 0,
            advances: 0,
            weeklySchedule: { seg: 8, ter: 8, qua: 8, qui: 8, sex: 8, sab: 4, dom: 0, total: 44 }
        });
        setView('FORM');
    };

    const handleEdit = (emp: Employee) => {
        setFormData(emp);
        setView('FORM');
        setIsActionModalOpen(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.nif || !formData.baseSalary) {
            alert("Preencha campos obrigatórios: Nome, NIF, Salário Base");
            return;
        }

        setIsLoadingCloud(true);
        try {
            const empId = formData.id || generateUUID();
            const empObj: Employee = {
                ...formData as Employee,
                id: empId,
                baseSalary: Number(formData.baseSalary),
                status: formData.status || 'Active',
                admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
            };

            const payload = {
                id: ensureUUID(empId),
                nome: empObj.name,
                nif: empObj.nif,
                bi_number: empObj.biNumber,
                ssn: empObj.ssn,
                cargo: empObj.role,
                departamento: empObj.department,
                salario_base: empObj.baseSalary,
                status: empObj.status,
                data_admissao: empObj.admissionDate,
                email: empObj.email,
                telefone: empObj.phone,
                genero: empObj.gender,
                data_nascimento: empObj.birthDate,
                estado_civil: empObj.maritalStatus,
                nacionalidade: empObj.nationality,
                endereco: empObj.address,
                municipio: empObj.municipality,
                bairro: empObj.neighborhood,
                work_location_id: empObj.workLocationId ? ensureUUID(empObj.workLocationId) : null,
                empresa_id: '00000000-0000-0000-0000-000000000001',
                tipo_contrato: empObj.contractType,
                employee_number: empObj.employeeNumber,
                subs_transporte: Number(empObj.subsidyTransport || 0),
                subs_transporte_inicio: empObj.subsidyTransportStart,
                subs_transporte_fim: empObj.subsidyTransportEnd,
                subs_alimentacao: Number(empObj.subsidyFood || 0),
                subs_alimentacao_inicio: empObj.subsidyFoodStart,
                subs_alimentacao_fim: empObj.subsidyFoodEnd,
                subs_familia: Number(empObj.subsidyFamily || 0),
                subs_familia_inicio: empObj.subsidyFamilyStart,
                subs_familia_fim: empObj.subsidyFamilyEnd,
                subs_habitacao: Number(empObj.subsidyHousing || 0),
                subs_habitacao_inicio: empObj.subsidyHousingStart,
                subs_habitacao_fim: empObj.subsidyHousingEnd,
                subs_natal: Number(empObj.subsidyChristmas || 0),
                subs_natal_inicio: empObj.subsidyChristmasStart,
                subs_natal_fim: empObj.subsidyChristmasEnd,
                subs_ferias: Number(empObj.subsidyVacation || 0),
                subs_ferias_inicio: empObj.subsidyVacationStart,
                subs_ferias_fim: empObj.subsidyVacationEnd,
                abonos: Number(empObj.allowances || 0),
                abonos_inicio: empObj.allowancesStart,
                abonos_fim: empObj.allowancesEnd,
                adiantamentos: Number(empObj.advances || 0),
                adiantamentos_inicio: empObj.advancesStart,
                adiantamentos_fim: empObj.advancesEnd,
                is_magic: empObj.isMagic,

                // New Fields Persistence
                casa_n: empObj.houseNumber,
                rua: empObj.street,
                zona: empObj.zone,
                codigo_postal: empObj.postalCode,
                reparticao_fiscal: empObj.taxOffice,
                inss_antigo: empObj.ssnOld,
                local_trabalho_provincia: empObj.workLocationProvince,
                local_trabalho_municipio: empObj.workLocationMunicipality,
                grupo_irt: empObj.irtGroup,
                tipo_documento: empObj.documentType,
                numero_documento: empObj.documentNumber,
                entidade_emissora: empObj.issuer,
                data_emissao: (empObj.issueDate && empObj.issueDate.length === 10) ? empObj.issueDate : null,
                data_validade: (empObj.expiryDate && empObj.expiryDate.length === 10) ? empObj.expiryDate : null,
                naturalidade: empObj.naturality,
                nome_pai: empObj.fatherName,
                nome_mae: empObj.motherName,
                solicitado_por: empObj.requestedBy,
                motivo_admissao: empObj.admissionReason,
                horario_semanal: empObj.weeklySchedule
            };

            const { error } = await supabase.from('funcionarios').upsert(payload);

            if (error) throw error;

            onSaveEmployee(empObj);
            setView('LIST');
            alert("Ficha de funcionário sincronizada com sucesso!");
        } catch (err: any) {
            onSaveEmployee(formData as Employee);
            setView('LIST');
            alert("Guardado localmente. Erro na sincronização: " + err.message);
        } finally {
            setIsLoadingCloud(false);
        }
    };

    const handleSaveInternalProfession = async () => {
        if (!profFormData.name || !profFormData.baseSalary || !profFormData.indexedProfessionCode) {
            return alert("Preencha os campos obrigatórios (Código INSS, Nome Interno e Salário Base).");
        }

        setIsLoadingCloud(true);
        setSyncWarning(null);
        const profId = editingInternalProf?.id || generateId();
        const indexedName = profFormData.indexedProfessionName || 'NA - Aguarda Profissão';
        const codeInss = profFormData.indexedProfessionCode;

        const profObj: Profession = {
            id: profId,
            code: codeInss,
            name: profFormData.name!,
            indexedProfessionName: indexedName,
            indexedProfessionCode: codeInss,
            baseSalary: Number(profFormData.baseSalary),
            complement: Number(profFormData.complement || 0),
            userName: 'Admin',
            createdAt: new Date().toISOString(),
            category: 'Interna'
        };

        try {
            const payload = {
                id: ensureUUID(profId),
                nome: profFormData.name,
                descricao: profFormData.name,
                nome_profissao: profFormData.name,
                profissao_inss: indexedName,
                codigo_inss: codeInss,
                salario_base: Number(profFormData.baseSalary),
                ajudas_custo: Number(profFormData.complement || 0),
                created_by: 'Admin',
                empresa_id: '00000000-0000-0000-0000-000000000001'
            };

            const { error } = await supabase.from('profissoes_internas').upsert(payload);

            if (error) throw error;

            await fetchInternalProfessions();
            setView('CLASSIFIER_LIST');
            alert("Profissão sincronizada com sucesso!");

        } catch (err: any) {
            setSyncWarning("Módulo Cloud indisponível. Dados salvos localmente.");
            const local = localStorage.getItem(LOCAL_STORAGE_PROFS_KEY);
            let profs: Profession[] = local ? JSON.parse(local) : [];
            if (editingInternalProf) {
                profs = profs.map(p => p.id === profId ? profObj : p);
            } else {
                profs = [profObj, ...profs];
            }
            localStorage.setItem(LOCAL_STORAGE_PROFS_KEY, JSON.stringify(profs));
            setInternalProfessions(profs);
            setView('CLASSIFIER_LIST');
        } finally {
            setIsLoadingCloud(false);
            setEditingInternalProf(null);
        }
    };

    const handleOpenActions = (emp: Employee) => {
        setSelectedEmployee(emp);
        setIsActionModalOpen(true);
    };

    const renderActionModal = () => {
        if (!selectedEmployee) return null;

        const ActionItem = ({ icon: Icon, label, color = "text-slate-700", onClick, badge, desc }: any) => (
            <button
                onClick={onClick}
                className="w-full text-left p-3.5 hover:bg-blue-50 rounded-2xl flex items-center justify-between border-2 border-transparent hover:border-blue-100 transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl bg-slate-100 group-hover:bg-blue-600 transition-colors ${color.replace('text-', 'text-white group-hover:')}`}>
                        <Icon size={18} className={`${color} group-hover:text-white transition-colors`} />
                    </div>
                    <div>
                        <span className={`font-black uppercase text-[10px] tracking-widest ${color} block`}>{label}</span>
                        {desc && <span className="text-[8px] text-slate-400 font-bold uppercase block">{desc}</span>}
                    </div>
                </div>
                {badge && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">{badge}</span>}
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
            </button>
        );

        return (
            <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border-4 border-slate-900">
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b-4 border-blue-600">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg border-2 border-blue-500">{(selectedEmployee.name || '?').charAt(0)}</div>
                            <div>
                                <h3 className="font-black uppercase tracking-tighter text-lg">{selectedEmployee.name}</h3>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{selectedEmployee.role}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsActionModalOpen(false)} className="hover:bg-red-600 p-2 rounded-full transition border border-white/10"><X size={24} /></button>
                    </div>

                    <div className="p-6 bg-slate-50 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <ActionItem
                            icon={Eye}
                            label="Ver Cadastro"
                            desc="Visualizar ficha completa do colaborador"
                            onClick={() => { setIsActionModalOpen(false); alert("Visualizar cadastro..."); }}
                        />
                        <ActionItem
                            icon={Edit2}
                            label="Editar Dados Pessoais"
                            desc="Alterar informações básicas e morada"
                            color="text-blue-600"
                            onClick={() => handleEdit(selectedEmployee)}
                        />
                        <ActionItem
                            icon={Printer}
                            label="Imprimir Recibo / Mapa"
                            desc="Gerar documento oficial de vencimento"
                            color="text-emerald-600"
                            onClick={() => { setIsActionModalOpen(false); onPrintSlip?.(selectedEmployee); }}
                        />
                        <ActionItem
                            icon={Ruler}
                            label="Medidas de Fardas"
                            desc="Gerir tamanhos e equipamentos"
                            color="text-indigo-600"
                            onClick={() => { setIsActionModalOpen(false); }}
                        />
                        <ActionItem
                            icon={Ban}
                            label="Multas e Penalizações"
                            desc="Registar infrações disciplinares"
                            color="text-red-600"
                            onClick={() => { setIsActionModalOpen(false); }}
                        />
                        <ActionItem
                            icon={Calculator}
                            label="Acertos Salariais"
                            desc="Corrigir valores em folha"
                            color="text-orange-600"
                            onClick={() => { setIsActionModalOpen(false); }}
                        />
                        <ActionItem
                            icon={Gift}
                            label="Gratificações Periodicas"
                            desc="Bónus e prémios mensais"
                            color="text-purple-600"
                            onClick={() => { setIsActionModalOpen(false); }}
                        />
                        <ActionItem
                            icon={Wallet}
                            label="Abonos ou Adiantamentos"
                            desc="Gerir vales e apoios sociais"
                            color="text-emerald-700"
                            onClick={() => { setIsActionModalOpen(false); }}
                        />
                        <ActionItem
                            icon={FileSignature}
                            label="Emitir Contrato"
                            desc="Gerar documento legal LGT"
                            color="text-blue-800"
                            onClick={() => { setIsActionModalOpen(false); onIssueContract?.(selectedEmployee); }}
                        />
                        <ActionItem
                            icon={RefreshCw}
                            label="Readmitir"
                            desc="Reativar ficha de colaborador"
                            color="text-green-600"
                            onClick={() => { setIsActionModalOpen(false); }}
                        />
                        <ActionItem
                            icon={UserX}
                            label="Demitir"
                            desc="Processar rescisão contratual"
                            color="text-red-800"
                            onClick={() => { setIsActionModalOpen(false); }}
                        />
                    </div>

                    <div className="p-6 bg-white border-t-2 border-slate-100 flex justify-end">
                        <button onClick={() => setIsActionModalOpen(false)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition transform active:scale-95">Fechar Menu</button>
                    </div>
                </div>
            </div>
        );
    };

    const filteredInssProfessions = useMemo(() => {
        return INSS_INDEXED_PROFESSIONS.filter(p =>
            p.code.includes(inssSearch) || p.name.toLowerCase().includes(inssSearch.toLowerCase())
        );
    }, [inssSearch]);

    const selectInssProfession = (p: any) => {
        setProfFormData(prev => ({
            ...prev,
            indexedProfessionCode: p.code,
            indexedProfessionName: p.name
        }));
        setShowInssModal(false);
    };

    const handleOpenSimulation = (emp: Employee) => {
        setSimulationData({ ...emp });
        setSelectedEmployee(emp);
        setView('CLASSIFIER_SIMULATOR');
    };

    const renderClassifierList = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-gray-50 to-gray-200 border-x border-t border-slate-300 p-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"><ArrowLeft size={20} /></button>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Classificador Salarial</h2>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex bg-slate-200 rounded-lg p-1">
                        <button
                            onClick={() => setClassifierTab('EMPLOYEES')}
                            className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all ${classifierTab === 'EMPLOYEES' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Funcionários
                        </button>
                        <button
                            onClick={() => setClassifierTab('PROFESSIONS')}
                            className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all ${classifierTab === 'PROFESSIONS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Definição de Profissões
                        </button>
                    </div>

                    {isLoadingCloud && <span className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase animate-pulse"><Loader2 size={12} className="animate-spin" /> A carregar Cloud...</span>}
                    {syncWarning && <span className="flex items-center gap-2 text-[10px] text-orange-600 font-bold uppercase"><AlertCircle size={12} /> {syncWarning}</span>}

                    {classifierTab === 'PROFESSIONS' && (
                        <button
                            onClick={() => {
                                setEditingInternalProf(null);
                                setProfFormData({ baseSalary: 0, complement: 0, indexedProfessionName: 'NA - Aguarda Profissão' });
                                setView('CLASSIFIER_FORM');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded font-bold text-[10px] uppercase shadow-sm flex items-center gap-2"
                        >
                            <Plus size={14} /> Criar Profissão
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white border-x border-b border-slate-300 shadow-sm overflow-hidden min-h-[500px]">
                {classifierTab === 'EMPLOYEES' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px] border-collapse">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-300">
                                <tr>
                                    <th className="p-3 border-r border-slate-200 w-16 text-center">Foto</th>
                                    <th className="p-3 border-r border-slate-200">Nome do Funcionário</th>
                                    <th className="p-3 border-r border-slate-200">Cargo / Função</th>
                                    <th className="p-3 border-r border-slate-200 text-right">Salário Base</th>
                                    <th className="p-3 border-r border-slate-200 text-right">Subsídios</th>
                                    <th className="p-3 border-r border-slate-200 text-right">Líquido Estimado</th>
                                    <th className="p-3 text-center w-32">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employees.map(emp => {
                                    const inss = calculateINSS(emp.baseSalary, emp.subsidyFood, emp.subsidyTransport);
                                    const irt = calculateIRT(emp.baseSalary, inss, emp.subsidyFood, emp.subsidyTransport);
                                    const totalSubs = (emp.subsidyFood || 0) + (emp.subsidyTransport || 0) + (emp.subsidyFamily || 0) + (emp.subsidyHousing || 0);
                                    const net = (emp.baseSalary + totalSubs + (emp.allowances || 0)) - inss - irt - (emp.advances || 0) - (emp.penalties || 0);

                                    return (
                                        <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="p-2 border-r border-slate-100 text-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 mx-auto overflow-hidden border border-slate-300">
                                                    {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full object-cover" /> : <User className="w-full h-full p-1.5 text-slate-400" />}
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-slate-100 font-bold text-slate-700">{emp.name}</td>
                                            <td className="p-3 border-r border-slate-100 text-slate-500">{emp.role}</td>
                                            <td className="p-3 border-r border-slate-100 text-right font-mono">{formatCurrency(emp.baseSalary).replace('Kz', '')}</td>
                                            <td className="p-3 border-r border-slate-100 text-right text-slate-500">{formatCurrency(totalSubs).replace('Kz', '')}</td>
                                            <td className="p-3 border-r border-slate-100 text-right font-black text-emerald-600">{formatCurrency(net).replace('Kz', '')}</td>
                                            <td className="p-2 text-center">
                                                <button
                                                    onClick={() => (onExecuteProcess ? onExecuteProcess(emp.id) : handleOpenSimulation(emp))}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-bold text-[9px] uppercase shadow-sm flex items-center gap-1.5 mx-auto transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <Calculator size={12} /> Executar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <table className="w-full text-left text-[10px] border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-300">
                            <tr>
                                <th className="p-2 border-r border-slate-200" rowSpan={2}>Data</th>
                                <th className="p-2 border-r border-slate-200" rowSpan={2}>User</th>
                                <th className="p-2 border-r border-slate-200" rowSpan={2}>Profissão Interna</th>
                                <th className="p-2 border-b border-slate-200 text-center" colSpan={2}>Consultar INSS</th>
                                <th className="p-2 border-r border-slate-200 text-center" rowSpan={2}>Salario Base</th>
                                <th className="p-2 border-r border-slate-200 text-center" rowSpan={2}>Ajudas Custo Referencia</th>
                                <th className="p-2 border-r border-slate-200 text-center" rowSpan={2}>Vencimento lliquido</th>
                                <th className="p-2 text-center w-24" rowSpan={2}>Opções</th>
                            </tr>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                                <th className="p-1 border-r border-slate-200 text-center w-12">COD</th>
                                <th className="p-1 border-r border-slate-200 text-center">Profissão Indexada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {internalProfessions.map(p => (
                                <tr key={p.id} className="hover:bg-green-100/40 transition-colors group">
                                    <td className="p-2 border-r border-slate-100">{formatDate(p.createdAt || '').replace(/ /g, '-')}</td>
                                    <td className="p-2 border-r border-slate-100 font-bold text-slate-500 uppercase">{p.userName}</td>
                                    <td className="p-2 border-r border-slate-100 font-black text-slate-800 uppercase">{p.name || '.'}</td>
                                    <td className="p-2 border-r border-slate-100 text-center font-bold text-blue-800 bg-slate-50/50">{p.indexedProfessionCode}</td>
                                    <td className="p-2 border-r border-slate-100 truncate max-w-[250px] font-medium text-slate-700">{p.indexedProfessionName}</td>
                                    <td className="p-2 border-r border-slate-100 text-right font-bold">{formatCurrency(p.baseSalary || 0).replace('Kz', '')}</td>
                                    <td className="p-2 border-r border-slate-100 text-right font-bold">{formatCurrency(p.complement || 0).replace('Kz', '')}</td>
                                    <td className="p-2 border-r border-slate-100 text-right font-black text-slate-900 bg-slate-50/30">
                                        {formatCurrency((p.baseSalary || 0) + (p.complement || 0)).replace('Kz', '')}
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center gap-1">
                                            <button onClick={() => { setEditingInternalProf(p); setProfFormData(p); setView('CLASSIFIER_FORM'); }} className="p-1 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600 transition"><Edit2 size={10} /></button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm("Deseja eliminar este registo permanentemente da Cloud?")) {
                                                        try {
                                                            setIsLoadingCloud(true);
                                                            const { error } = await supabase.from('profissoes_internas').delete().eq('id', ensureUUID(p.id));
                                                            if (error) throw error;
                                                            await fetchInternalProfessions();
                                                            alert("Registo eliminado.");
                                                        } catch (e: any) {
                                                            setSyncWarning("Erro ao apagar na Cloud. Tente novamente.");
                                                        } finally {
                                                            setIsLoadingCloud(false);
                                                        }
                                                    }
                                                }}
                                                className="p-1 bg-red-100 text-red-600 rounded border border-red-200 hover:bg-red-600 hover:text-white transition"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    const renderClassifierForm = () => (
        <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded shadow-2xl border border-slate-300 overflow-hidden">
                <div className="bg-white border-b p-4 flex justify-between items-center bg-slate-50">
                    <h2 className="w-full text-center text-sm font-black text-slate-700 uppercase tracking-widest">Definições da Profissão</h2>
                </div>
                <div className="p-8 space-y-6 bg-white">

                    <div className="relative">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Profissão Indexada INSS (Obrigatório)</label>
                        <div className="relative flex items-center">
                            <div
                                className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 font-medium text-slate-800 cursor-pointer flex justify-between items-center"
                                onClick={() => setShowInssModal(true)}
                            >
                                <span className="truncate">{profFormData.indexedProfessionCode ? `${profFormData.indexedProfessionCode} - ${profFormData.indexedProfessionName}` : 'Consultar Profissões da Segurança Social'}</span>
                                <ChevronRight size={16} className="text-slate-400 shrink-0" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Profissão Interna *</label>
                        <input
                            className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 font-bold text-slate-700 uppercase"
                            placeholder="Ex: Supervisor de Campo"
                            value={profFormData.name || ''}
                            onChange={e => setProfFormData({ ...profFormData, name: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Salário Base *</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 text-right font-black text-slate-700 pr-4"
                                placeholder="00000.00"
                                value={profFormData.baseSalary || ''}
                                onChange={e => setProfFormData({ ...profFormData, baseSalary: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Ajudas de Custo Referência</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 text-right font-black text-slate-500 pr-4"
                                placeholder="00000.00"
                                value={profFormData.complement || ''}
                                onChange={e => setProfFormData({ ...profFormData, complement: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleSaveInternalProfession}
                            disabled={isLoadingCloud}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isLoadingCloud ? <Loader2 size={24} className="animate-spin" /> : 'Registar'}
                        </button>
                        <button onClick={() => setView('CLASSIFIER_LIST')} className="w-full text-slate-400 font-bold text-[10px] uppercase mt-4 hover:text-slate-600 transition tracking-widest">Cancelar</button>
                    </div>
                </div>
            </div>

            {showInssModal && (
                <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-lg uppercase tracking-tight">Profissões da Segurança Social (INSS)</h3>
                            <button onClick={() => setShowInssModal(false)}><X /></button>
                        </div>
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Pesquisar..." value={inssSearch} onChange={e => setInssSearch(e.target.value)} autoFocus />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 divide-y divide-slate-100">
                                {filteredInssProfessions.map(p => (
                                    <button key={p.code} onClick={() => selectInssProfession(p)} className="p-2 hover:bg-slate-50 text-left flex justify-between items-center group transition-all border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-[10px] text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">{p.code}</span>
                                            <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors uppercase font-medium">{p.name}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderClassifierSimulator = () => {
        if (!selectedEmployee) return null;

        const base = Number(simulationData.baseSalary || 0);
        const sFood = Number(simulationData.subsidyFood || 0);
        const sTrans = Number(simulationData.subsidyTransport || 0);
        const sFam = Number(simulationData.subsidyFamily || 0);
        const sHouse = Number(simulationData.subsidyHousing || 0);
        const sChrist = Number(simulationData.subsidyChristmas || 0);
        const sVac = Number(simulationData.subsidyVacation || 0);
        const allowances = Number(simulationData.allowances || 0);

        const inss = calculateINSS(base, sFood, sTrans);
        const irt = calculateIRT(base, inss, sFood, sTrans); // Using strict rule

        const totalEarnings = base + sFood + sTrans + sFam + sHouse + sChrist + sVac + allowances;
        const totalDeductions = inss + irt + Number(simulationData.penalties || 0) + Number(simulationData.advances || 0);
        const net = totalEarnings - totalDeductions;

        return (
            <div className="fixed inset-0 z-[150] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('CLASSIFIER_LIST')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition"><ArrowLeft /></button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Calculator className="text-blue-600" /> Simulador de Vencimento
                            </h1>
                            <p className="text-xs text-slate-500 font-md">Simulação em tempo real com regras da AGT 2024</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Funcionário</span>
                            <span className="font-bold text-slate-800">{selectedEmployee.name}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-md">
                            {selectedEmployee.photoUrl ? <img src={selectedEmployee.photoUrl} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-400" />}
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">

                    {/* TOP STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={100} /></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Liquido a Receber</span>
                            <div className="text-3xl font-black tracking-tight">{formatCurrency(net).replace('Kz', '')} <span className="text-sm font-medium text-slate-400">Kz</span></div>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Total Proventos</span>
                            <div className="text-2xl font-black tracking-tight text-slate-800">{formatCurrency(totalEarnings).replace('Kz', '')} <span className="text-xs text-slate-400">Kz</span></div>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2">Total Descontos</span>
                            <div className="text-2xl font-black tracking-tight text-slate-800">{formatCurrency(totalDeductions).replace('Kz', '')} <span className="text-xs text-slate-400">Kz</span></div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800 mb-2">Custo Empresa (Estimado)</span>
                            <div className="text-2xl font-black tracking-tight text-blue-900">{formatCurrency(totalEarnings + (base * 0.08)).replace('Kz', '')} <span className="text-xs text-blue-400">Kz</span></div>
                            <span className="text-[9px] text-blue-400 font-bold mt-1">+8% INSS Patronal</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT: INPUTS */}
                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest flex items-center gap-2"><PlusCircle size={14} className="text-emerald-500" /> Rendimentos Mensais</h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Salário Base</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 font-bold">Kz</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                value={simulationData.baseSalary || ''}
                                                onChange={e => setSimulationData({ ...simulationData, baseSalary: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subs. Alimentação</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 font-bold">Kz</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:border-blue-500"
                                                value={simulationData.subsidyFood || ''}
                                                onChange={e => setSimulationData({ ...simulationData, subsidyFood: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subs. Transporte</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 font-bold">Kz</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:border-blue-500"
                                                value={simulationData.subsidyTransport || ''}
                                                onChange={e => setSimulationData({ ...simulationData, subsidyTransport: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subs. Família</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 font-bold">Kz</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:border-blue-500"
                                                value={simulationData.subsidyFamily || ''}
                                                onChange={e => setSimulationData({ ...simulationData, subsidyFamily: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Outros Abonos</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 font-bold">Kz</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:border-blue-500"
                                                value={simulationData.allowances || ''}
                                                onChange={e => setSimulationData({ ...simulationData, allowances: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest flex items-center gap-2"><UserMinus size={14} className="text-red-500" /> Outros Descontos (Manuais)</h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Adiantamentos</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 font-bold">Kz</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl font-bold text-red-600 outline-none focus:border-red-500"
                                                value={simulationData.advances || ''}
                                                onChange={e => setSimulationData({ ...simulationData, advances: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Penalizações / Multas</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 font-bold">Kz</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl font-bold text-red-600 outline-none focus:border-red-500"
                                                value={simulationData.penalties || ''}
                                                onChange={e => setSimulationData({ ...simulationData, penalties: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT: RESULTS */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="bg-slate-900 border-b border-slate-800 p-4">
                                    <h3 className="font-bold text-white uppercase text-xs tracking-widest">Cálculos do Estado</h3>
                                </div>
                                <div className="p-0 divide-y divide-slate-100">
                                    <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                                        <div>
                                            <span className="text-xs font-bold text-slate-600 block uppercase">Desconto INSS (3%)</span>
                                            <span className="text-[9px] text-slate-400">Calculado sobre Base + Excedentes</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-800">{formatCurrency(inss).replace('Kz', '')}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center group hover:bg-slate-50">
                                        <div>
                                            <span className="text-xs font-bold text-slate-600 block uppercase">Desconto IRT</span>
                                            <span className="text-[9px] text-slate-400">Imposto Rendimento Trabalho</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-800">{formatCurrency(irt).replace('Kz', '')}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center bg-slate-50">
                                        <div>
                                            <span className="text-xs font-black text-slate-800 block uppercase">Total Impostos</span>
                                        </div>
                                        <span className="font-mono font-black text-red-600">{formatCurrency(inss + irt).replace('Kz', '')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
                                <div className="p-6 relative z-10">
                                    <h3 className="font-bold text-indigo-300 uppercase text-xs tracking-widest mb-4">Ação</h3>
                                    <p className="text-xs text-indigo-100 mb-6">Ao aplicar, os valores de Salário Base e Subsídios serão atualizados na ficha do funcionário. O Histórico será mantido.</p>

                                    <button
                                        onClick={async () => {
                                            if (!selectedEmployee) return;
                                            try {
                                                setFormData({
                                                    ...selectedEmployee,
                                                    ...simulationData
                                                });
                                                // We trigger the save flow
                                                const updatedEmp = { ...selectedEmployee, ...simulationData };
                                                await onSaveEmployee(updatedEmp as Employee);
                                                alert("Valores aplicados com sucesso à ficha do funcionário!");
                                                setView('CLASSIFIER_LIST');
                                            } catch (e) {
                                                alert("Erro ao aplicar valores.");
                                            }
                                        }}
                                        className="w-full bg-white text-indigo-900 font-black py-4 rounded-xl shadow-lg hover:bg-indigo-50 transition active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} /> APLICAR ALTERAÇÕES
                                    </button>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-3xl opacity-50"></div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
            {renderActionModal()}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> Funcionários
                        {isLoadingCloud && <RefreshCw size={16} className="animate-spin text-blue-500 ml-2" />}
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Database size={12} /> Sincronizado com Supabase Cloud</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onChangeView?.('ASSIDUIDADE')}
                        className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border transition-all shadow-sm"
                    >
                        <List size={18} className="text-emerald-600" /> Lista de Afetividade
                    </button>
                    <button onClick={() => setView('CLASSIFIER_LIST')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border transition-all">
                        <UserCog size={18} className="text-blue-600" /> Classificador Salarial
                    </button>
                    <button onClick={fetchEmployeesCloud} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border transition-all">
                        <RefreshCw size={18} /> Sincronizar
                    </button>
                    <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition">
                        <UserPlus size={18} /> Admitir Funcionário
                    </button>
                </div>
            </div>

            {view === 'LIST' ? (
                <>
                    <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input className="w-full pl-10 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div>
                            <select className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-700" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                                <option value="ALL">Todos os Departamentos</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <select className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-700" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                                <option value="ALL">Todos os Estados</option>
                                <option value="ACTIVE">Ativos</option>
                                <option value="INACTIVE">Inativos</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 w-16 text-center">Foto</th>
                                        <th className="p-4 w-24">Nº Mec..</th>
                                        <th className="p-4 min-w-[200px]">Nome Completo</th>
                                        <th className="p-4">Departamento</th>
                                        <th className="p-4">Função</th>
                                        <th className="p-4">Admissão</th>
                                        <th className="p-4 text-right">Salário Base</th>
                                        <th className="p-4 text-right">Líquido (Est. )</th>
                                        <th className="p-4 text-center">Estado</th>
                                        <th className="p-4 text-center w-16">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEmployees.map((emp) => {
                                        const inss = calculateINSS(emp.baseSalary, emp.subsidyFood, emp.subsidyTransport);
                                        const irt = calculateIRT(emp.baseSalary, inss, emp.subsidyFood, emp.subsidyTransport);
                                        const totalSubs = (emp.subsidyFood || 0) + (emp.subsidyTransport || 0) + (emp.subsidyFamily || 0) + (emp.subsidyHousing || 0);
                                        const net = (emp.baseSalary + totalSubs + (emp.allowances || 0)) - inss - irt - (emp.advances || 0) - (emp.penalties || 0);

                                        return (
                                            <tr key={emp.id} className="hover:bg-blue-50 transition-colors group">
                                                <td className="p-3 text-center">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 mx-auto overflow-hidden border border-slate-300">
                                                        {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full object-cover" alt="Avatar" /> : <User className="w-full h-full p-2 text-slate-400" />}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-mono font-bold text-slate-600">{emp.employeeNumber || '---'}</td>
                                                <td className="p-3 font-bold text-slate-800">{emp.name}</td>
                                                <td className="p-3">{emp.department}</td>
                                                <td className="p-3 text-slate-600">{emp.role}</td>
                                                <td className="p-3">{formatDate(emp.admissionDate)}</td>
                                                <td className="p-3 text-right font-mono">{formatCurrency(emp.baseSalary).replace('Kz', '')}</td>
                                                <td className="p-3 text-right font-black text-blue-700">
                                                    {emp.isMagic ? (
                                                        <div className="flex flex-col items-end">
                                                            <span>{formatCurrency(net).replace('Kz', '')}</span>
                                                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded uppercase">Processado</span>
                                                        </div>
                                                    ) : (
                                                        formatCurrency(net).replace('Kz', '')
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {emp.status === 'Active' ? 'ATIVO' : 'INATIVO'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {emp.isMagic && (
                                                            <button
                                                                onClick={() => onPrintSlip?.(emp)}
                                                                className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition shadow-sm"
                                                                title="Imprimir Recibo"
                                                            >
                                                                <Printer size={16} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleOpenActions(emp)} className="p-1.5 bg-slate-100 text-slate-400 rounded border hover:text-blue-600 hover:border-blue-200 transition"><MoreVertical size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : view === 'FORM' ? (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right">
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('LIST')} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition"><ArrowLeft /></button>
                            <h2 className="font-black uppercase tracking-widest text-sm">Ficha de Funcionário - Edição</h2>
                        </div>
                    </div>

                    <div className="p-6 space-y-4 max-w-6xl mx-auto">
                        {/* --- DADOS DA MORADA --- */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <button onClick={() => toggleSection('address')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                                <span className="font-bold text-sm uppercase flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> Dados da Morada do Funcionario</span>
                                {expandedSections.address ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedSections.address && (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white animate-in slide-in-from-top-2">
                                    <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Casa Nº</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.houseNumber || ''} onChange={e => setFormData({ ...formData, houseNumber: e.target.value })} /></div>
                                    <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Rua</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.street || ''} onChange={e => setFormData({ ...formData, street: e.target.value })} /></div>
                                    <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Zona</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.zone || ''} onChange={e => setFormData({ ...formData, zone: e.target.value })} /></div>
                                    <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Bairro</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.neighborhood || ''} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} /></div>
                                    <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Provincia</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.province || ''} onChange={e => setFormData({ ...formData, province: e.target.value })} /></div>
                                    <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Municipio</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.municipality || ''} onChange={e => setFormData({ ...formData, municipality: e.target.value })} /></div>
                                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                        <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Código Postal</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl text-xl font-mono text-slate-500 outline-none focus:border-blue-500" placeholder="0000-00" value={formData.postalCode || ''} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} /></div>
                                        <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Pais</label><select className="w-full border border-slate-300 p-2.5 rounded-2xl bg-white text-xl outline-none" value={formData.country || 'AO'} onChange={e => setFormData({ ...formData, country: e.target.value })}><option value="AO">AO</option></select></div>
                                        <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Contacto</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl text-xl text-slate-500 outline-none focus:border-blue-500" placeholder="(+244) 000 000 000" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                    </div>
                                    <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-600 block mb-1">Email</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none focus:border-blue-500 bg-slate-50" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                </div>
                            )}
                        </div>

                        {/* --- DADOS PROFISSIONAIS --- */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <button onClick={() => toggleSection('professional')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                                <span className="font-bold text-sm uppercase flex items-center gap-2"><Briefcase size={16} className="text-emerald-600" /> Dados Profissionais</span>
                                {expandedSections.professional ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedSections.professional && (
                                <div className="p-6 space-y-6 bg-white animate-in slide-in-from-top-2">
                                    {/* Weekly Schedule */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-600 block mb-2">Indicar Carga Semanal em Horas</label>
                                        <div className="flex gap-2">
                                            {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((d) => (
                                                <div key={d} className="flex-1 text-center">
                                                    <span className="text-[9px] text-slate-500 font-bold block mb-1">{d}</span>
                                                    <input
                                                        className="w-full border border-slate-300 rounded-2xl h-10 text-center text-lg text-slate-600 outline-none focus:border-blue-500"
                                                        value={(formData.weeklySchedule as any)?.[d.toLowerCase()] || 0}
                                                        onChange={e => setFormData({ ...formData, weeklySchedule: { ...formData.weeklySchedule as any, [d.toLowerCase()]: Number(e.target.value) } })}
                                                    />
                                                </div>
                                            ))}
                                            <div className="flex-1 text-center">
                                                <span className="text-[9px] text-slate-900 font-black block mb-1">TOTAL</span>
                                                <div className="w-full border border-slate-300 bg-slate-100 rounded-2xl h-10 flex items-center justify-center font-bold text-slate-700">
                                                    {Object.values(formData.weeklySchedule || {}).reduce((a: number, b: number) => a + b, 0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Seleccionar Profissão</label></div>
                                        <select
                                            className="w-full border border-slate-300 p-3 rounded-2xl text-xl text-slate-600 outline-none bg-white"
                                            value={formData.professionId || ''}
                                            onChange={e => { const prof = internalProfessions.find(p => p.id === e.target.value); setFormData({ ...formData, professionId: e.target.value, professionName: prof?.name, baseSalary: prof?.baseSalary, role: prof?.name }); }}
                                        >
                                            <option value="">Seleccione Profissão</option>
                                            {internalProfessions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Salário Base</label><input value={formData.baseSalary || ''} onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })} className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" /></div>
                                        <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Complemento Salarial</label><input value={formData.complementSalary || ''} onChange={e => setFormData({ ...formData, complementSalary: Number(e.target.value) })} className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" /></div>
                                        <div><label className="text-[10px] font-bold text-slate-600 block mb-1">Total Salario Mensal</label><input readOnly value={(formData.baseSalary || 0) + (formData.complementSalary || 0)} className="w-full border border-slate-300 bg-slate-50 p-2.5 rounded-2xl outline-none font-bold" /></div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span><label className="text-[10px] font-bold text-slate-800">Indicar o local de serviço base (Opcional)</label></div>
                                        <select
                                            className="w-full border border-slate-300 p-3 rounded-2xl text-xl text-slate-600 outline-none bg-white"
                                            value={formData.workLocationId || ''}
                                            onChange={e => setFormData({ ...formData, workLocationId: e.target.value })}
                                        >
                                            <option value="">Seleccione Local de Serviço</option>
                                            {workLocations.map(wl => <option key={wl.id} value={wl.id}>{wl.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Indicar quem solicitou a admissão</label></div>
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.requestedBy || ''} onChange={e => setFormData({ ...formData, requestedBy: e.target.value })} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Indicar o motivo da admissão</label></div>
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.admissionReason || ''} onChange={e => setFormData({ ...formData, admissionReason: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- DADOS FISCAIS --- */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <button onClick={() => toggleSection('fiscal')} className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border-b border-blue-200">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="font-black text-sm uppercase text-blue-600">Dados Fiscais</span></div>
                                {expandedSections.fiscal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedSections.fiscal && (
                                <div className="p-6 bg-white space-y-6 animate-in slide-in-from-top-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">NIF</label></div>
                                        <div className="flex items-center gap-2">
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.nif || ''} onChange={e => setFormData({ ...formData, nif: e.target.value })} />
                                            <button className="text-blue-500 hover:scale-110 transition"><Info size={24} className="fill-blue-500 text-white" /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Repartição Fiscal</label></div>
                                        <div className="flex items-center gap-2">
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.taxOffice || ''} onChange={e => setFormData({ ...formData, taxOffice: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Nº de INSS</label></div>
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.ssn || ''} onChange={e => setFormData({ ...formData, ssn: e.target.value })} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Nº de INSS Antigo</label></div>
                                            <div className="flex items-center gap-2">
                                                <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.ssnOld || ''} onChange={e => setFormData({ ...formData, ssnOld: e.target.value })} />
                                                <button className="text-blue-500 hover:scale-110 transition"><Info size={24} className="fill-blue-500 text-white" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border rounded-lg p-2">
                                        <span className="text-[10px] block mb-2 font-bold text-slate-600">Local Predominante da Actividade Laboral</span>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                                            <div className="flex items-center gap-2 md:col-span-1 justify-end"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Provincia</label></div>
                                            <div className="md:col-span-4"><select className="w-full border border-slate-300 p-2 rounded-xl text-sm outline-none bg-white" value={formData.workLocationProvince || ''} onChange={e => setFormData({ ...formData, workLocationProvince: e.target.value })}><option value="">Seleccione</option><option value="Luanda">Luanda</option></select></div>

                                            <div className="flex items-center gap-2 md:col-span-1 justify-end"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Municipio</label></div>
                                            <div className="md:col-span-4"><span className="text-sm text-slate-600 pl-2">{formData.workLocationMunicipality || 'Aguarda Selecção de Provincia'}</span></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Grupo de IRT</label></div>
                                        <select
                                            className="w-full border border-slate-300 p-3 rounded-2xl text-xl text-slate-600 outline-none bg-white"
                                            value={formData.irtGroup || ''}
                                            onChange={e => setFormData({ ...formData, irtGroup: e.target.value })}
                                        >
                                            <option value="">Seleccione Grupo de IRT</option>
                                            <option value="A">Grupo A</option>
                                            <option value="B">Grupo B</option>
                                            <option value="C">Grupo C</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- DADOS PESSOAIS --- */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <button onClick={() => toggleSection('personal')} className="w-full flex items-center justify-between p-4 bg-white text-slate-800 hover:bg-slate-50 transition-colors border-b">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="font-bold text-lg text-blue-600">Dados Pessoais</span></div>
                                {expandedSections.personal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {expandedSections.personal && (
                                <div className="p-6 bg-white space-y-6 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Data de Admissão</label></div>
                                            <div className="w-full border border-slate-300 rounded-2xl flex items-center p-1">
                                                <input type="date" className="bg-transparent w-full text-xl text-slate-700 font-medium outline-none px-2" value={formData.admissionDate || ''} onChange={e => setFormData({ ...formData, admissionDate: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-800 block mb-1">Agente Nº</label>
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.employeeNumber || ''} onChange={e => setFormData({ ...formData, employeeNumber: e.target.value })} />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Nome do Funcionario</label></div>
                                        <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Tipo de documento</label></div>
                                            <select className="w-full border border-slate-300 p-3 rounded-2xl text-xl text-slate-600 outline-none bg-white" value={formData.documentType || ''} onChange={e => setFormData({ ...formData, documentType: e.target.value })}>
                                                <option value="">Seleccione Tipo</option>
                                                <option value="BI">Bilhete Identidade</option>
                                                <option value="Passaporte">Passaporte</option>
                                            </select>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Nº de Documento</label></div>
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.documentNumber || ''} onChange={e => setFormData({ ...formData, documentNumber: e.target.value })} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Entidade Emissora</label></div>
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.issuer || ''} onChange={e => setFormData({ ...formData, issuer: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Data de Emissão</label></div>
                                            <div className="w-full border border-slate-400 rounded-2xl flex items-center p-1">
                                                <input type="date" className="bg-transparent w-full text-xl text-slate-500 font-medium outline-none px-2" value={formData.issueDate || ''} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                                                <Calendar className="mr-2" />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Data de Validade</label></div>
                                            <div className="w-full border border-slate-400 rounded-2xl flex items-center p-1">
                                                <input type="date" className="bg-transparent w-full text-xl text-slate-500 font-medium outline-none px-2" value={formData.expiryDate || ''} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                                                <Calendar className="mr-2" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="text-[10px] font-bold text-slate-800 block mb-1">Naturalidade</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.naturality || ''} onChange={e => setFormData({ ...formData, naturality: e.target.value })} /></div>
                                        <div><label className="text-[10px] font-bold text-slate-800 block mb-1">Provincia</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.province || ''} onChange={e => setFormData({ ...formData, province: e.target.value })} /></div>
                                        <div><label className="text-[10px] font-bold text-slate-800 block mb-1">Nacionalidade</label><input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.nationality || ''} onChange={e => setFormData({ ...formData, nationality: e.target.value })} /></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Data de nascimento</label></div>
                                            <div className="w-full border border-slate-400 rounded-2xl flex items-center p-1">
                                                <input type="date" className="bg-transparent w-full text-xl text-slate-500 font-medium outline-none px-2" value={formData.birthDate || ''} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                                                <Calendar className="mr-2" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-800 block mb-1">Estado Civil</label>
                                            <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.maritalStatus || ''} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value as any })} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><label className="text-[10px] font-bold text-slate-800">Sexo</label></div>
                                            <select className="w-full border border-slate-300 p-3 rounded-2xl text-xl text-slate-600 outline-none bg-white" value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value as any })}><option value="">Seleccione</option><option value="M">Masculino</option><option value="F">Feminino</option></select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-800 block mb-1">Nome do Pai</label>
                                        <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.fatherName || ''} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-800 block mb-1">Nome da Mãe</label>
                                        <input className="w-full border border-slate-300 p-2.5 rounded-2xl outline-none" value={formData.motherName || ''} onChange={e => setFormData({ ...formData, motherName: e.target.value })} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- SUBSIDIOS E ABONOS (Mantido como estava ou adaptado se necessário, mas o user não pediu mudança específica aqui, pediu para não apagar funcionalidades) --- */}
                        <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                            <button onClick={() => toggleSection('subsidies')} className="w-full flex items-center justify-between p-4 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-all border-b border-indigo-100">
                                <div className="flex items-center gap-3"><span className="font-black text-sm uppercase">Benefícios e Adiantamentos</span></div>
                                {expandedSections.subsidies ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </button>
                            {expandedSections.subsidies && (
                                <div className="p-6 bg-white animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { label: 'Subsídio Alimentação', val: 'subsidyFood' },
                                            { label: 'Subsídio Transporte', val: 'subsidyTransport' },
                                            { label: 'Subsídio Natal', val: 'subsidyChristmas' },
                                            { label: 'Subsídio Férias', val: 'subsidyVacation' },
                                            { label: 'Abonos', val: 'allowances' },
                                            { label: 'Adiantamentos', val: 'advances' },
                                            { label: 'Multas/Penalidades', val: 'penalties' }
                                        ].map((s, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50">
                                                <div className="w-48 text-[10px] font-black uppercase text-slate-500">{s.label}</div>
                                                <input type="number" className="flex-1 border-2 border-white p-2 rounded-xl font-bold focus:border-indigo-500 outline-none" value={(formData as any)[s.val] || 0} onChange={e => setFormData({ ...formData, [s.val]: Number(e.target.value) })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
                        <button onClick={() => setView('LIST')} className="px-8 py-3 border-2 border-slate-200 rounded-xl font-black text-slate-400 uppercase text-[10px] hover:bg-white transition">Cancelar</button>
                        <button onClick={handleSave} disabled={isLoadingCloud} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-black uppercase text-[10px] shadow-xl hover:bg-blue-700 transition flex items-center gap-2">
                            {isLoadingCloud ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Gravar Ficha Cloud
                        </button>
                    </div>
                </div>
            ) : view === 'CLASSIFIER_LIST' ? renderClassifierList() : view === 'CLASSIFIER_SIMULATOR' ? renderClassifierSimulator() : renderClassifierForm()}
        </div>
    );
};

export default Employees;
