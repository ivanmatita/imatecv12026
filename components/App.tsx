import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import InvoiceList from './InvoiceList';

import PurchaseList from './PurchaseList';
import PurchaseForm from './PurchaseForm';
import ClientList from './ClientList';
import SupplierList from './SupplierList';
import Settings from './Settings';
import StockManager from './StockManager';
import TaxManager from './TaxManager';
import CostRevenueMap from './CostRevenueMap';
import RegularizationMap from './RegularizationMap';
import Model7 from './Model7';
import CashManager from './CashManager';
import HumanResources from './HumanResources';
import Employees from './Employees';
import Workspace from './Workspace';
import ProjectReport from './ProjectReport';
import SaftExport from './SaftExport';
import ManagementReports from './ManagementReports';
import PGCManager from './PGCManager';
import RubricasManager from './RubricasManager';
import ClassifyMovement from './ClassifyMovement';
import VatSettlementMap from './VatSettlementMap';
import OpeningBalanceMap from './OpeningBalanceMap';
import AccountExtract from './AccountExtract';
import SecretariaList from './SecretariaList';
import SecretariaForm from './SecretariaForm';
import PurchaseAnalysis from './PurchaseAnalysis';
import AIAssistant from './AIAssistant';
import LoginPage from './LoginPage';
import POS from './POS';
import CashClosure from './CashClosure';
import CashClosureHistory from './CashClosureHistory';
import POSSettings from './POSSettings';
import PerformanceAnalysis from './PerformanceAnalysis';
import TaxCalculationMap from './TaxCalculationMap';
import AccountingMaps from './AccountingMaps';
import ContractGenerator from './ContractGenerator';
import SchoolManagement from './SchoolManagement';
import RestaurantManagement from './RestaurantManagement';
import HotelManagement from './HotelManagement';
import ArchivesManager from './ArchivesManager';
import TaxDocsManager from './TaxDocsManager';
import GeneralMovements from './GeneralMovements';
import WithholdingTaxManager from './WithholdingTaxManager';
import TransferOrderView from './TransferOrderView';
import Agribusiness from './Agribusiness';
import ChurchManagement from './ChurchManagement';
import IRTTableManager from './IRTTableManager';
import PersonalRegistration from './PersonalRegistration';
import HRMaps from './HRMaps';
import WorkCard from './WorkCard';
import LaborRegistration from './LaborRegistration';
import WorkLocationManager from './WorkLocationManager';
import NewDocumentForm from './NewDocumentForm';
import NewPurchaseForm from './NewPurchaseForm';


import { supabase } from '../services/supabaseClient';

import {
  Invoice, InvoiceStatus, ViewState, Client, Product, InvoiceType,
  Warehouse, PriceTable, StockMovement, Purchase, Company, User,
  Employee, SalarySlip, HrTransaction, WorkLocation, CashRegister, DocumentSeries,
  Supplier, PaymentMethod, CashMovement, HrVacation, PGCAccount, SecretariaDocument,
  VatSettlement, OpeningBalance, UserActivityLog, POSConfig, Contract, AttendanceRecord, Profession, PurchaseType, CashClosure as CashClosureType,
  IntegrationStatus, WorkProject, TaxRate, Bank, Metric, TransferOrder
} from '../types';
import { Menu, Calendar as CalendarIcon, RefreshCw, AlertCircle, Clock as ClockIcon, ShieldCheck, Loader2, ArrowRightLeft, Eye, Printer, Search, Paperclip, Trash2 } from 'lucide-react';
import { generateId, generateInvoiceHash, getDocumentPrefix, formatDate, formatCurrency } from '../utils';

const DEFAULT_FALLBACK_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const INITIAL_COMPANY: Company = {
  id: DEFAULT_FALLBACK_COMPANY_ID, name: 'C & V - COMERCIO GERAL E PRESTAÇAO DE SERVIÇOS, LDA', nif: '5000780316',
  address: 'Luanda, Angola', email: 'geral@empresa.ao', phone: '+244 923 000 000', regime: 'Regime Geral',
  licensePlan: 'ENTERPRISE', status: 'ACTIVE', validUntil: '2025-12-31', registrationDate: '2024-01-01'
};

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin', email: 'admin@sistema.ao', password: '123', role: 'ADMIN', companyId: DEFAULT_FALLBACK_COMPANY_ID, permissions: [], createdAt: '2024-01-01' }
];

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [globalYear, setGlobalYear] = useState<number>(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCompany, setCurrentCompany] = useState<Company>(INITIAL_COMPANY);

  // Data State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [priceTables, setPriceTables] = useState<PriceTable[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [series, setSeries] = useState<DocumentSeries[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [autoOpenTransferOrderId, setAutoOpenTransferOrderId] = useState<string | null>(null);
  const [pgcAccounts, setPgcAccounts] = useState<PGCAccount[]>([]);
  const [hrEmployees, setHrEmployees] = useState<Employee[]>([]);
  const [hrTransactions, setHrTransactions] = useState<HrTransaction[]>([]);
  const [hrVacations, setHrVacations] = useState<HrVacation[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<SalarySlip[]>([]);
  const [transferOrders, setTransferOrders] = useState<TransferOrder[]>([]);
  const [secDocuments, setSecDocuments] = useState<SecretariaDocument[]>([]);
  const [vatSettlements, setVatSettlements] = useState<VatSettlement[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [posConfig, setPosConfig] = useState<POSConfig>({
    defaultSeriesId: 's1', printerType: '80mm', autoPrint: true, allowDiscounts: true,
    defaultClientId: '', defaultPaymentMethod: 'CASH', showImages: true, quickMode: false
  });
  const [cashClosures, setCashClosures] = useState<CashClosureType[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityLog[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [realEmpresaId, setRealEmpresaId] = useState<string | null>(null);

  const [invoiceInitialType, setInvoiceInitialType] = useState<InvoiceType>(InvoiceType.FT);
  const [invoiceInitialData, setInvoiceInitialData] = useState<Partial<Invoice> | undefined>(undefined);
  const [purchaseInitialData, setPurchaseInitialData] = useState<Partial<Purchase> | undefined>(undefined);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedExtractAccount, setSelectedExtractAccount] = useState<string | null>(null);
  const [selectedHrEmployee, setSelectedHrEmployee] = useState<Employee | null>(null);
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);

  const certifiedInvoices = useMemo(() => invoices.filter(i => i.isCertified), [invoices]);
  const validPurchases = useMemo(() => purchases.filter(p => p.status !== 'CANCELLED'), [purchases]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ensureUUID = (id: string | undefined | null): string | null => {
    if (!id || id === 'CONSUMIDOR_FINAL' || id === '') return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    const hex = id.split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(32, '0').substring(0, 32);
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-a${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
  };

  const getSecureEmpresaId = async (): Promise<string> => {
    if (realEmpresaId) return realEmpresaId;
    try {
      const { data } = await supabase.from('empresas').select('id').limit(1).single();
      if (data && data.id) {
        setRealEmpresaId(data.id);
        return data.id;
      }
    } catch (e) {
      console.error("Erro ao recuperar ID da empresa ativa:", e);
    }
    return DEFAULT_FALLBACK_COMPANY_ID;
  };

  useEffect(() => {
    if (currentUser) {
      initAppCloud();
    }
  }, [currentUser]);

  const initAppCloud = async () => {
    setIsLoading(true);
    setCloudError(null);
    try {
      const { data: companies, error: compError } = await supabase.from('empresas').select('*').limit(1);
      if (compError) throw compError;

      if (companies && companies.length > 0) {
        const comp = companies[0];
        setRealEmpresaId(comp.id);
        setCurrentCompany({
          id: comp.id,
          name: comp.nome,
          nif: comp.nif,
          address: comp.endereco || comp.morada,
          email: comp.email,
          phone: comp.telefone,
          regime: comp.regime || 'Regime Geral',
          licensePlan: comp.plano || 'PROFESSIONAL',
          status: comp.status || 'ACTIVE',
          validade: comp.validade,
          registrationDate: comp.created_at,
          postalCode: comp.codigo_postal,
          registrationNumber: comp.matricula,
          licenseNumber: comp.alvara,
          inssNumber: comp.num_inss,
          companyType: comp.tipo_empresa,
          cashVAT: comp.iva_caixa
        } as any);
      }

      await Promise.allSettled([
        fetchInvoicesCloud(),
        fetchPurchasesCloud(),
        fetchCashRegistersCloud(),
        fetchCashClosuresCloud(),
        fetchContractsCloud(),
        fetchWorkLocationsCloud(),
        fetchProductsCloud(),
        fetchWarehousesCloud(),
        fetchClientsCloud(),
        fetchSuppliersCloud(),
        fetchSeriesCloud(),
        fetchTaxRatesCloud(),
        fetchBanksCloud(),
        fetchMetricsCloud(),
        fetchUsersCloud(),
        fetchInternalProfessionsCloud(),
        fetchEmployeesCloud()
      ]);
    } catch (err: any) {
      console.error("Erro crítico ao inicializar Cloud:", JSON.stringify(err, null, 2));
      setCloudError(`Erro de conexão: ${err.message || 'Verifique sua ligação.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeesCloud = async () => {
    try {
      const { data, error } = await supabase.from('funcionarios').select('*');
      if (error) throw error;
      if (data) {
        setHrEmployees(data.map((d: any) => ({
          id: d.id,
          name: d.nome,
          nif: d.nif,
          idCardNumber: d.bi_number,
          birthDate: d.data_nascimento,
          gender: d.genero,
          maritalStatus: d.estado_civil,
          nationality: d.nacionalidade,
          email: d.email,
          phone: d.telefone,
          address: d.endereco,
          employeeNumber: d.employee_number,
          role: d.cargo,
          department: d.departamento,
          admissionDate: d.data_admissao,
          contractType: d.tipo_contrato,
          workLocationId: d.work_location_id,
          professionId: d.profession_id,
          status: d.status,
          baseSalary: Number(d.salario_base || 0),
          bankName: d.nome_banco,
          iban: d.iban,
          paymentMethod: d.payment_method,
          socialSecurityNumber: d.ssn,
          subsidyFood: Number(d.subs_alimentacao || 0),
          subsidyTransport: Number(d.subs_transporte || 0),
          subsidyFamily: Number(d.subs_familia || 0),
          subsidyHousing: Number(d.subs_habitacao || 0),
          allowances: Number(d.abonos || 0),
          photoUrl: d.foto_url
        })));
      }
    } catch (err) { console.error("Erro ao carregar colaboradores:", err); }
  };

  const fetchInternalProfessionsCloud = async () => {
    try {
      const { data } = await supabase.from('profissoes_internas').select('*');
      if (data) {
        setProfessions(data.map(p => ({
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
        })));
      }
    } catch (err) { console.error("Erro ao carregar profissões:", err); }
  };

  const fetchUsersCloud = async () => {
    try {
      const { data } = await supabase.from('utilizadores').select('id, nome, utilizador, email, telefone, validade_acesso, permissoes, empresa_id, created_at');
      if (data) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.nome,
          username: u.utilizador,
          email: u.email,
          phone: u.telefone,
          accessValidity: u.validade_acesso,
          role: 'ADMIN',
          companyId: u.empresa_id,
          permissions: u.permissoes || [],
          createdAt: u.created_at
        })));
      }
    } catch (e) { console.error(e); }
  }

  const fetchBanksCloud = async () => {
    try {
      const { data, error } = await supabase.from('bancos').select('id, sigla_banco, numero_conta, nib, iban, swift');
      if (error) throw error;
      if (data) {
        setBanks(data.map(b => ({
          id: b.id,
          nome: b.sigla_banco || 'Banco',
          sigla: b.sigla_banco || '---',
          iban: b.iban || '',
          swift: b.swift || '',
          nib: b.nib,
          accountNumber: b.numero_conta
        })));
      }
    } catch (e: any) {
      console.warn("Tabela bancos indisponível ou erro de schema:", e.message);
    }
  };

  const fetchMetricsCloud = async () => {
    try {
      const { data, error } = await supabase.from('metricas').select('*');
      if (error) throw error;
      if (data) setMetrics(data.map(m => ({ id: m.id, nome: m.descricao, sigla: m.sigla })));
    } catch (e: any) {
      console.warn("Tabela metricas indisponível:", e.message);
    }
  };

  const fetchTaxRatesCloud = async () => {
    try {
      const { data, error } = await supabase.from('tax_rates').select('id, nome, tipo, percentagem, codigo_fiscal, descricao, created_at');
      if (error) throw error;
      if (data) {
        setTaxRates(data.map(t => ({
          id: t.id,
          name: t.nome || 'IVA',
          percentage: Number(t.percentagem),
          type: (t.tipo || 'IVA') as any,
          region: 'N/A',
          code: t.codigo_fiscal || 'OUT',
          description: t.descricao || '',
          exemptionCode: '',
          exemptionReason: t.descricao || '',
          startDate: t.created_at,
          isActive: true
        })));
      }
    } catch (err) { console.error("Erro ao buscar taxas:", err); }
  };

  const fetchSeriesCloud = async () => {
    try {
      const { data, error } = await supabase.from('series').select('*');
      if (error) throw error;
      if (data) {
        setSeries(data.map(s => ({
          id: s.id,
          name: s.nome || 'Série Geral',
          code: s.codigo || 'A',
          type: (s.tipo || 'NORMAL') as any,
          year: s.ano || new Date().getFullYear(),
          currentSequence: s.sequencia_atual || 1,
          sequences: s.sequencias_por_tipo || {},
          isActive: s.ativo !== undefined ? s.ativo : true,
          allowedUserIds: s.utilizadores_autorizados || [],
          bankDetails: s.detalhes_bancarios,
          footerText: s.texto_rodape
        })));
      }
    } catch (err: any) {
      console.warn("Erro ao buscar séries da Cloud:", err.message);
      if (series.length === 0) {
        setSeries([{ id: 's1', name: 'Série Geral', code: 'A', type: 'NORMAL', year: 2024, currentSequence: 1, sequences: {}, isActive: true, allowedUserIds: [], bankDetails: '', footerText: 'Processado por imatec soft' }]);
      }
    }
  };

  const fetchClientsCloud = async () => {
    try {
      const { data } = await supabase.from('clientes').select('*');
      if (data) {
        setClients(data.map(c => ({
          id: c.id, name: c.nome, vatNumber: c.nif, email: c.email || '',
          phone: c.telefone || '', address: c.endereco || '', city: c.localidade || '',
          country: c.pais || 'Angola', accountBalance: 0, initialBalance: Number(c.saldo_inicial || 0),
          clientType: c.tipo_cliente, province: c.provincia, transactions: []
        })));
      }
    } catch (err) { console.error(err); }
  };

  const fetchSuppliersCloud = async () => {
    try {
      const { data } = await supabase.from('fornecedores').select('*');
      if (data) {
        setSuppliers(data.map(s => ({
          id: s.id, name: s.nome, vatNumber: s.contribuinte, email: s.email || '',
          phone: s.telefone || '', address: s.morada || '', city: s.localidade || '',
          province: s.provincia || '', accountBalance: 0, supplierType: s.tipo_cliente, transactions: []
        })));
      }
    } catch (err) { console.error(err); }
  };

  const fetchWarehousesCloud = async () => {
    try {
      const { data } = await supabase.from('armazens').select('*');
      if (data) {
        setWarehouses(data.map(a => ({
          id: a.id,
          name: a.nome,
          location: a.localizacao,
          description: a.descricao,
          managerName: a.responsavel,
          contact: a.contacto,
          observations: a.observations
        })));
      }
    } catch (err) { console.error(err); }
  };

  const fetchWorkLocationsCloud = async () => {
    try {
      const { data } = await supabase.from('local_trabalho').select('*');
      if (data) {
        setWorkLocations(data.map(d => ({
          id: d.id,
          name: d.titulo,
          address: d.localizacao,
          managerName: d.contacto
        })));
      }
    } catch (err) { console.error(err); }
  };

  const fetchProductsCloud = async () => {
    try {
      const { data } = await supabase.from('produtos').select('*');
      if (data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.nome,
          costPrice: p.preco || 0,
          price: (p.preco || 0) * 1.3,
          unit: 'un',
          category: 'Geral',
          stock: Number(p.stock || 0),
          warehouseId: '',
          priceTableId: 'pt1',
          minStock: 0,
          barcode: p.barcode,
          imageUrl: p.image_url
        })));
      }
    } catch (err) { console.error(err); }
  };

  const fetchContractsCloud = async () => {
    try {
      const { data, error } = await supabase.from('contratos').select('*').order('created_at', { ascending: false });
      if (data) {
        setContracts(data.map(c => ({
          id: c.id,
          employeeId: c.funcionario_id,
          type: c.tipo as any,
          startDate: c.data_inicio,
          endDate: c.data_fim,
          status: c.status as any,
          clauses: c.clausulas || []
        })));
      }
    } catch (err) { console.error("Erro ao carregar contratos:", err); }
  };

  const fetchCashClosuresCloud = async () => {
    try {
      const { data, error } = await supabase
        .from('fechos_caixa')
        .select('*')
        .order('data_fecho', { ascending: false });

      if (data) {
        setCashClosures(data.map(c => ({
          id: c.id,
          date: c.data_fecho,
          openedAt: c.aberto_em,
          closedAt: c.fechado_em,
          operatorId: c.operador_id,
          operatorName: c.operador_nome,
          cashRegisterId: c.caixa_id,
          expectedCash: Number(c.esperado_dinheiro || 0),
          expectedMulticaixa: Number(c.esperado_multicaixa || 0),
          expectedTransfer: Number(c.esperado_transferencia || 0),
          expectedCredit: Number(c.esperado_credito || 0),
          totalSales: Number(c.total_vendas || 0),
          actualCash: Number(c.dinheiro_real || 0),
          difference: Number(c.diferenca || 0),
          initialBalance: Number(c.saldo_inicial || 0),
          finalBalance: Number(c.saldo_final || 0),
          status: c.status as 'CLOSED',
          notes: c.notes
        })));
      }
    } catch (err) { console.error("Erro ao carregar fechos:", err); }
  };

  const fetchCashRegistersCloud = async () => {
    try {
      const { data } = await supabase.from('caixas').select('*');
      if (data) {
        setCashRegisters(data.map(c => ({
          id: c.id,
          name: c.titulo,
          status: c.status,
          balance: c.saldo_atual,
          initialBalance: c.saldo_inicial
        })));
      }
    } catch (err) { console.error(err); }
  };

  const fetchInvoicesCloud = async () => {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped: Invoice[] = data.map(f => {
          let type = InvoiceType.FT;
          if (f.tipo === 'VD') type = InvoiceType.VD;
          if (f.tipo === 'FR') type = InvoiceType.FR;
          if (f.tipo === 'RC' || f.tipo === 'RG') type = InvoiceType.RG;
          if (f.tipo === 'NC') type = InvoiceType.NC;
          if (f.tipo === 'ND') type = InvoiceType.ND;
          if (f.tipo === 'PP') type = InvoiceType.PP;
          if (f.tipo === 'OR') type = InvoiceType.OR;
          if (f.tipo === 'GE') type = InvoiceType.GE;

          const isCertified = !!f.hash || f.status === 'Pago';

          return {
            id: f.id,
            type: type,
            seriesId: f.serie_id || 's1',
            number: f.numero || '---',
            date: f.data_emissao || '',
            dueDate: f.data_vencimento || f.data_emissao || '',
            accountingDate: f.data_contabilistica || f.data_emissao || '',
            clientId: f.cliente_id || '',
            clientName: f.cliente_nome || 'Cliente Cloud',
            clientNif: f.cliente_nif || '',
            items: f.itens || f.items || [],
            subtotal: Number(f.subtotal) || 0,
            globalDiscount: Number(f.desconto_global) || 0,
            taxRate: Number(f.taxa_iva) || 14,
            taxAmount: Number(f.valor_iva) || 0,
            withholdingAmount: Number(f.valor_retencao) || 0,
            total: Number(f.total) || 0,
            currency: f.moeda || 'AOA',
            exchangeRate: Number(f.taxa_cambio) || 1,
            status: f.status === 'Pago' ? InvoiceStatus.PAID : (f.status && f.status.toUpperCase() === 'ANULADO') ? InvoiceStatus.CANCELLED : InvoiceStatus.PENDING,
            isCertified: isCertified,
            hash: f.hash || '',
            companyId: f.empresa_id || DEFAULT_FALLBACK_COMPANY_ID,
            source: (f.origem || 'MANUAL') as any,
            cashRegisterId: f.caixa_id,
            paymentMethod: f.metodo_pagamento as any,
            sourceInvoiceId: f.documento_origem_id,
            workLocationId: f.local_trabalho_id,
            operatorName: f.operador_nome,
            time: f.hora_emissao,
            integrationStatus: isCertified ? IntegrationStatus.VALIDATED : IntegrationStatus.EMITTED
          };
        });

        setInvoices(mapped);
      }
    } catch (err: any) {
      console.error("Erro ao carregar faturas:", err);
    }
  };

  const fetchPurchasesCloud = async () => {
    try {
      const { data, error } = await supabase.from('compras').select('*').order('data_emissao', { ascending: false });
      if (error) throw error;
      if (data) {
        setPurchases(data.map(p => ({
          id: p.id,
          type: p.tipo_documento as any,
          supplierId: p.fornecedor_id,
          supplier: p.fornecedor_nome,
          nif: p.nif_fornecedor || '',
          date: p.data_emissao,
          dueDate: p.data_vencimento || p.data_emissao,
          documentNumber: p.numero_documento,
          items: p.items || [],
          subtotal: p.valor_subtotal || 0,
          taxAmount: p.valor_iva || 0,
          total: p.valor_total || 0,
          status: p.status as any,
          notes: p.observacoes,
          hash: p.hash,
          workLocationId: p.work_location_id,
          warehouseId: p.armazem_id,
          paymentMethod: p.metodo_pagamento as any,
          cashRegisterId: p.caixa_id,
          integrationStatus: p.hash ? IntegrationStatus.VALIDATED : IntegrationStatus.EMITTED
        })));
      }
    } catch (err: any) {
      console.error("Erro ao carregar compras:", err);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    // Check if user is a terminated employee
    try {
      const { data: emp } = await supabase.from('employees').select('status, name').eq('email', email).single();
      if (emp && emp.status === 'Terminated') {
        alert(`Acesso negado. O colaborador ${emp.name} encontra-se com o contrato terminado.`);
        return;
      }
    } catch (e) {
      console.warn("Erro ao verificar status do colaborador no login:", e);
    }

    const user = users.find(u => u.email === email && u.password === pass);
    if (user) setCurrentUser(user);
    else {
      // Fallback for real users if 'users' state is not yet populated (e.g. first load)
      try {
        const { data: userCloud } = await supabase.from('utilizadores').select('*').eq('email', email).eq('password', pass).single(); // IMPORTANT: In prod, use hash
        if (userCloud) {
          const mappedUser: User = {
            id: userCloud.id,
            name: userCloud.nome,
            username: userCloud.utilizador,
            email: userCloud.email,
            password: pass, // keep it specifically for session
            role: 'ADMIN',
            companyId: userCloud.empresa_id,
            permissions: userCloud.permissoes || [],
            createdAt: userCloud.created_at
          };
          setCurrentUser(mappedUser);
          return;
        }
      } catch (e) { }
      alert("Credenciais inválidas.");
    }
  };

  const handleSaveInvoice = async (inv: Invoice, sId: string, action?: string) => {
    const docSeries = series.find(s => s.id === sId);

    if (action === 'CERTIFY' && docSeries?.type !== 'MANUAL') {
      const lastCertified = invoices
        .filter(i => i.seriesId === sId && i.type === inv.type && i.isCertified)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (lastCertified && new Date(inv.date).getTime() < new Date(lastCertified.date).getTime()) {
        alert(`ERRO DE CRONOLOGIA AGT: A data do documento (${formatDate(inv.date)}) não pode ser anterior à data do último documento certificado deste tipo (${formatDate(lastCertified.date)}).`);
        return;
      }
    }

    setIsLoading(true);
    let finalInv = { ...inv };

    if (action === 'CERTIFY' && !inv.isCertified) {
      finalInv.isCertified = true;

      if (docSeries?.type === 'MANUAL') {
        finalInv.integrationStatus = IntegrationStatus.VALIDATED;
        finalInv.processedAt = new Date().toISOString();
      } else {
        finalInv.hash = generateInvoiceHash(finalInv);
        finalInv.integrationStatus = IntegrationStatus.VALIDATED;
        finalInv.processedAt = new Date().toISOString();

        const typeKey = getDocumentPrefix(inv.type);
        const seriesYear = docSeries?.year || new Date().getFullYear();

        try {
          // AGT CRITICAL: Get next official sequence from the new table
          const nextSeq = await BackendAssistant.vendas.gerarNumeroSequencial(
            typeKey,
            docSeries?.code || 'S',
            seriesYear
          );

          const prefix = getDocumentPrefix(inv.type);
          // Format: FT S2026/1
          const number = `${prefix} ${docSeries?.code || 'S'}${seriesYear}/${nextSeq}`;

          // ANTI-DUPLICATION CHECK
          const { data: existing } = await supabase
            .from('faturas')
            .select('id')
            .eq('numero', number)
            .single();

          if (existing) {
            alert(`ERRO CRÍTICO AGT: Já existe um documento com o número ${number}. Operação abortada para evitar duplicidade.`);
            setIsLoading(false);
            return;
          }

          finalInv.number = number;
          finalInv.seriesCode = docSeries?.code;
          finalInv.date = new Date().toISOString().split('T')[0]; // Ensure current date on certification

          // Update local series state (optional)
          if (docSeries) {
            const updatedSequences = { ...docSeries.sequences, [typeKey]: nextSeq };
            setSeries(prev => prev.map(s => s.id === sId ? { ...s, sequences: updatedSequences } : s));
          }

        } catch (e: any) {
          alert("Erro ao gerar sequência documental AGT: " + e.message);
          setIsLoading(false);
          return;
        }
      }

      if (finalInv.cashRegisterId && finalInv.paymentMethod && finalInv.total > 0 && finalInv.status !== InvoiceStatus.CANCELLED) {
        try {
          const regId = ensureUUID(finalInv.cashRegisterId);
          const reg = cashRegisters.find(c => c.id === finalInv.cashRegisterId);
          const newBalance = (reg?.balance || 0) + finalInv.total;

          if (regId) {
            await supabase.from('caixas').update({ saldo_atual: newBalance }).eq('id', regId);
            const companyIdForCash = await getSecureEmpresaId();
            await supabase.from('movimentos_caixa').insert({
              tipo: 'ENTRY',
              valor: finalInv.total,
              descricao: `Venda ${finalInv.type} ${finalInv.number}`,
              caixa_id: regId,
              documento_ref: finalInv.number,
              metodo_pagamento: finalInv.paymentMethod,
              operador_nome: currentUser?.name || 'Sistema',
              origem: 'SALES',
              empresa_id: companyIdForCash
            });
          }
          setCashRegisters(prev => prev.map(c => c.id === finalInv.cashRegisterId ? { ...c, balance: newBalance } : c));
        } catch (e) { console.error("Erro integração caixa:", e); }
      }

      if ([InvoiceType.FT, InvoiceType.FR, InvoiceType.VD, InvoiceType.GE].includes(finalInv.type) && finalInv.status !== InvoiceStatus.CANCELLED) {
        const companyIdForStock = await getSecureEmpresaId();
        for (const item of finalInv.items) {
          if (item.productId && item.type === 'PRODUCT') {
            try {
              const prodUUID = ensureUUID(item.productId);
              const whUUID = ensureUUID(finalInv.targetWarehouseId || '');
              if (prodUUID) {
                await supabase.from('movimentos_stock').insert({
                  tipo: finalInv.type === InvoiceType.NC ? 'ENTRY' : 'EXIT',
                  produto_id: prodUUID,
                  produto_nome: item.description,
                  quantidade: item.quantity,
                  armazem_id: whUUID,
                  documento_ref: finalInv.number,
                  notes: `Baixa Automática POS/Fatura: ${finalInv.number}`,
                  empresa_id: companyIdForStock
                });
              }
            } catch (e) { console.error("Erro stock:", e); }
          }
        }
      }
    }

    setInvoices([finalInv, ...invoices.filter(i => i.id !== finalInv.id)]);

    try {
      const companyIdToUse = await getSecureEmpresaId();
      if (!companyIdToUse) throw new Error("Empresa não identificada.");

      const syncPayload = {
        id: ensureUUID(finalInv.id) || undefined,
        empresa_id: companyIdToUse,
        cliente_id: ensureUUID(finalInv.clientId),
        cliente_nome: finalInv.clientName,
        cliente_nif: finalInv.clientNif,
        numero: finalInv.number,
        tipo: getDocumentPrefix(finalInv.type),
        data_emissao: finalInv.date,
        data_vencimento: finalInv.dueDate,
        data_contabilistica: finalInv.accountingDate,
        hora_emissao: finalInv.time,
        subtotal: Number(finalInv.subtotal),
        desconto_global: Number(finalInv.globalDiscount),
        taxa_iva: Number(finalInv.taxRate),
        valor_iva: Number(finalInv.taxAmount),
        valor_retencao: Number(finalInv.withholdingAmount),
        total: Number(finalInv.total),
        moeda: finalInv.currency || 'AOA',
        taxa_cambio: Number(finalInv.exchangeRate) || 1,
        itens: finalInv.items,
        status: finalInv.status === InvoiceStatus.PAID ? 'Pago' : finalInv.status === InvoiceStatus.CANCELLED ? 'Anulado' : 'Pendente',
        certificado: finalInv.isCertified || false,
        origem: finalInv.source || 'MANUAL',
        caixa_id: ensureUUID(finalInv.cashRegisterId),
        metodo_pagamento: finalInv.paymentMethod,
        documento_origem_id: ensureUUID(finalInv.sourceInvoiceId),
        local_trabalho_id: ensureUUID(finalInv.workLocationId),
        serie_id: sId,
        hash: finalInv.hash || '',
        operador_nome: finalInv.operatorName || currentUser?.name
      };

      const { error: syncError } = await supabase.from('faturas').upsert(syncPayload);
      if (syncError) alert("Erro ao enviar para Cloud: " + (syncError.message || "Erro desconhecido"));
    } catch (err: any) {
      console.error("Erro fatal na sincronização:", err.message);
    } finally {
      setIsLoading(false);
    }

    if (finalInv.source !== 'POS') setCurrentView('INVOICES');
  };

  const handleSavePurchase = async (purchase: Purchase) => {
    setIsLoading(true);
    const finalPurchase = {
      ...purchase,
      integrationStatus: IntegrationStatus.VALIDATED,
      processedAt: new Date().toISOString()
    };

    if (finalPurchase.type === PurchaseType.FR && finalPurchase.cashRegisterId && finalPurchase.paymentMethod && finalPurchase.status !== 'CANCELLED') {
      const amount = finalPurchase.total;
      const regId = ensureUUID(finalPurchase.cashRegisterId);
      const reg = cashRegisters.find(c => c.id === finalPurchase.cashRegisterId);
      const newBalance = (reg?.balance || 0) - amount;
      setCashRegisters(prev => prev.map(cr => cr.id === finalPurchase.cashRegisterId ? { ...cr, balance: newBalance } : cr));
      try {
        if (regId) {
          await supabase.from('caixas').update({ saldo_atual: newBalance }).eq('id', regId);
          const companyIdForCashPur = await getSecureEmpresaId();
          await supabase.from('movimentos_caixa').insert({
            tipo: 'EXIT',
            valor: amount,
            descricao: `Pagamento Compra FR ${finalPurchase.documentNumber}`,
            caixa_id: regId,
            documento_ref: finalPurchase.documentNumber,
            metodo_pagamento: finalPurchase.paymentMethod,
            operador_nome: currentUser?.name || 'Sistema',
            origem: 'PURCHASES',
            empresa_id: companyIdForCashPur
          });
        }
      } catch (e) { console.error("Erro integração caixa compra:", e); }
    }

    setPurchases([finalPurchase, ...purchases.filter(p => p.id !== finalPurchase.id)]);

    if (finalPurchase.status !== 'CANCELLED') {
      const companyIdForStockPur = await getSecureEmpresaId();
      for (const item of finalPurchase.items) {
        if (item.productId) {
          try {
            const prodUUID = ensureUUID(item.productId);
            const targetWarehouse = item.warehouseId || finalPurchase.warehouseId;
            const whUUID = ensureUUID(targetWarehouse || '');
            if (prodUUID) {
              await supabase.from('movimentos_stock').insert({
                tipo: 'ENTRY',
                produto_id: prodUUID,
                produto_nome: item.description,
                quantidade: item.quantity,
                armazem_id: whUUID,
                documento_ref: finalPurchase.documentNumber,
                notas: `Entrada Automática Compra: ${finalPurchase.documentNumber}`,
                expiry_date: item.expiryDate || null,
                empresa_id: companyIdForStockPur
              });
            }
          } catch (e) { console.error("Erro stock compra:", e); }
        }
      }
    }

    try {
      const companyIdToUse = await getSecureEmpresaId();
      const purchasePayload = {
        id: ensureUUID(finalPurchase.id) || undefined,
        tipo: finalPurchase.type,
        numero_documento: finalPurchase.documentNumber,
        fornecedor_id: ensureUUID(finalPurchase.supplierId),
        fornecedor_nome: finalPurchase.supplier,
        fornecedor_nif: finalPurchase.nif, // Corrected column name? Check schema 279: column 'fornecedor_nif' exists.
        data_emissao: finalPurchase.date,
        subtotal: finalPurchase.subtotal,
        valor_iva: finalPurchase.taxAmount,
        total: finalPurchase.total,
        status: finalPurchase.status,
        empresa_id: companyIdToUse,
        itens: finalPurchase.items,
        hash: finalPurchase.hash,
        armazem_id: ensureUUID(finalPurchase.warehouseId),
        local_trabalho_id: ensureUUID(finalPurchase.workLocationId),
        metodo_pagamento: finalPurchase.paymentMethod,
        caixa_id: ensureUUID(finalPurchase.cashRegisterId)
      };
      const { error } = await supabase.from('compras').upsert(purchasePayload);
      if (error) throw error;
    } catch (err: any) {
      console.error("Erro ao sincronizar compra:", err);
    } finally {
      setIsLoading(false);
    }
    setCurrentView('STOCK');
  };

  /* Fix: Added missing handleSaveClient function */
  const handleSaveClient = async (client: Client) => {
    setClients(prev => [...prev.filter(c => c.id !== client.id), client]);
  };

  /* Fix: Added missing handleDeleteInvoice function */
  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm("Deseja apagar este rascunho?")) {
      try {
        const uuid = ensureUUID(id);
        if (uuid) {
          await supabase.from('faturas').delete().eq('id', uuid);
        }
        setInvoices(prev => prev.filter(i => i.id !== id));
      } catch (e) { console.error(e); }
    }
  };

  /* Fix: Added missing handleCancelInvoice function */
  const handleCancelInvoice = async (id: string, reason: string) => {
    const original = invoices.find(i => i.id === id);
    if (!original) return;

    if (!window.confirm(`Deseja realmente ANULAR o documento ${original.number}? Esta ação gerará um documento de retificação automaticamente.`)) return;

    setIsLoading(true);

    try {
      const isNC = original.type === InvoiceType.NC;
      const correctiveType = isNC ? InvoiceType.ND : InvoiceType.NC;
      const typePrefix = getDocumentPrefix(correctiveType);

      const seriesRec = series.find(s => s.id === original.seriesId) || series[0];

      // Get Sequence via RPC
      const { data: nextSeq, error: seqError } = await supabase.rpc('get_next_sequence', {
        p_series_id: ensureUUID(seriesRec.id),
        p_doc_type: typePrefix
      });

      if (seqError) throw seqError;

      const correctiveNumber = `${typePrefix} ${seriesRec.code}${seriesRec.year}/${nextSeq}`;

      const correctiveId = generateId();
      const now = new Date();

      // Create hash for corrective document
      const docHash = generateInvoiceHash({
        ...original,
        id: correctiveId,
        date: now.toISOString(),
        number: correctiveNumber,
        type: correctiveType
      });

      const correctiveDoc: Invoice = {
        ...original,
        id: correctiveId,
        type: correctiveType,
        number: correctiveNumber,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString(),
        status: InvoiceStatus.PAID,
        isCertified: true,
        sourceInvoiceId: original.id,
        cancellationReason: reason,
        hash: docHash,
        total: original.total,
        items: original.items.map(item => ({ ...item, id: generateId() })),
        operatorName: currentUser?.name,
        seriesId: seriesRec.id,
        seriesCode: seriesRec.code,
        integrationStatus: IntegrationStatus.VALIDATED
      };

      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: InvoiceStatus.CANCELLED, cancellationReason: `Motivo: ${reason} (${typePrefix}: ${correctiveNumber})` } : i).concat(correctiveDoc));

      // Update Original in DB
      const updatePayload = {
        status: 'Anulado',
        cancellation_reason: `Motivo: ${reason} | Retificação Gerada: ${correctiveNumber}`,
        updated_at: new Date().toISOString()
      };

      await supabase.from('faturas').update(updatePayload).eq('id', ensureUUID(id));

      // Insert Corrective Doc in DB
      const companyIdToUse = await getSecureEmpresaId();

      const syncPayload = {
        id: ensureUUID(correctiveId),
        empresa_id: companyIdToUse,
        cliente_id: ensureUUID(correctiveDoc.clientId),
        cliente_nome: correctiveDoc.clientName,
        cliente_nif: correctiveDoc.clientNif,
        numero: correctiveNumber,
        tipo: typePrefix,
        data_emissao: correctiveDoc.date,
        data_vencimento: correctiveDoc.dueDate,
        data_contabilistica: correctiveDoc.accountingDate,
        hora_emissao: correctiveDoc.time,
        subtotal: Number(correctiveDoc.subtotal),
        desconto_global: Number(correctiveDoc.globalDiscount),
        taxa_iva: Number(correctiveDoc.taxRate),
        valor_iva: Number(correctiveDoc.taxAmount),
        valor_retencao: Number(correctiveDoc.withholdingAmount),
        total: Number(correctiveDoc.total),
        moeda: correctiveDoc.currency || 'AOA',
        taxa_cambio: Number(correctiveDoc.exchangeRate) || 1,
        itens: correctiveDoc.items,
        status: 'Pago',
        certificado: true,
        origem: correctiveDoc.source || 'MANUAL',
        caixa_id: ensureUUID(correctiveDoc.cashRegisterId),
        metodo_pagamento: correctiveDoc.paymentMethod,
        documento_origem_id: ensureUUID(original.id),
        local_trabalho_id: ensureUUID(correctiveDoc.workLocationId),
        serie_id: ensureUUID(seriesRec.id),
        hash: docHash,
        operador_nome: currentUser?.name
      };

      const { error: syncError } = await supabase.from('faturas').insert(syncPayload);
      if (syncError) throw syncError;

      // Handle Stock Reversal
      if (correctiveDoc.items.some(i => i.productId)) {
        const companyIdForStock = await getSecureEmpresaId();
        for (const item of correctiveDoc.items) {
          if (item.productId && item.type === 'PRODUCT') {
            await supabase.from('movimentos_stock').insert({
              tipo: correctiveType === InvoiceType.NC ? 'ENTRY' : 'EXIT',
              produto_id: ensureUUID(item.productId),
              produto_nome: item.description,
              quantidade: item.quantity,
              armazem_id: ensureUUID(correctiveDoc.targetWarehouseId || ''),
              documento_ref: correctiveDoc.number,
              notes: `Retificação Ref: ${correctiveDoc.number} (Origem: ${original.number})`,
              empresa_id: companyIdForStock
            });
          }
        }
      }

      alert(`Documento anulado com sucesso! ${isNC ? 'Nota de Débito' : 'Nota de Crédito'} gerada: ${correctiveNumber}`);

    } catch (e: any) {
      console.error(e);
      alert("Erro ao anular documento: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* Fix: Added missing handleLiquidate function with correct signature */
  const handleLiquidate = async (invoice: Invoice, amount: number, method: PaymentMethod, registerId: string, dateValue: string, docDate: string) => {
    try {
      // Get Sequence via RPC
      const seriesRec = series.find(s => s.code === 'REC') || series[0];
      const typePrefix = "RG";

      const { data: nextSeq, error: seqError } = await supabase.rpc('get_next_sequence', {
        p_series_id: ensureUUID(seriesRec.id),
        p_doc_type: typePrefix
      });

      if (seqError) throw seqError;

      const number = `${typePrefix} ${seriesRec.code}${seriesRec.year}/${nextSeq}`;

      const receipt: Invoice = {
        id: generateId(),
        type: InvoiceType.RG,
        seriesId: seriesRec.id,
        number,
        date: docDate,
        dueDate: dateValue,
        accountingDate: docDate,
        clientId: invoice.clientId,
        clientName: invoice.clientName,
        clientNif: invoice.clientNif,
        items: [{ id: generateId(), type: 'SERVICE', description: `Pagamento Ref: ${invoice.number}`, quantity: 1, unitPrice: amount, discount: 0, taxRate: 0, total: amount }],
        subtotal: amount, globalDiscount: 0, taxRate: 0, taxAmount: 0, withholdingAmount: 0, retentionAmount: 0, total: amount,
        currency: invoice.currency, exchangeRate: invoice.exchangeRate,
        status: InvoiceStatus.PAID,
        isCertified: true,
        hash: generateInvoiceHash(invoice), // Should probably hash the receipt, not the invoice. Fixed below.
        companyId: invoice.companyId,
        workLocationId: invoice.workLocationId,
        sourceInvoiceId: invoice.id,
        paymentMethod: method,
        cashRegisterId: registerId,
        operatorName: currentUser?.name
      };

      // Hash fix
      receipt.hash = generateInvoiceHash(receipt);

      const updatedInvoice = {
        ...invoice,
        paidAmount: (invoice.paidAmount || 0) + amount,
        status: ((invoice.paidAmount || 0) + amount) >= invoice.total ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL
      };

      setInvoices(prev => prev.map(i => i.id === invoice.id ? updatedInvoice : i).concat(receipt));

      // Update local sequence for UI
      const updatedSequences = { ...seriesRec.sequences, RG: nextSeq };
      setSeries(prev => prev.map(s => s.id === seriesRec.id ? { ...s, sequences: updatedSequences } : s));

      // Sync to Cloud
      const companyId = await getSecureEmpresaId();
      await supabase.from('faturas').insert({
        id: ensureUUID(receipt.id),
        empresa_id: companyId,
        cliente_id: ensureUUID(receipt.clientId),
        cliente_nome: receipt.clientName,
        cliente_nif: receipt.clientNif,
        numero: receipt.number,
        tipo: 'RG',
        data_emissao: receipt.date,
        subtotal: receipt.total,
        total: receipt.total,
        valor_iva: 0,
        itens: receipt.items,
        status: 'Pago',
        certificado: true,
        documento_origem_id: ensureUUID(receipt.sourceInvoiceId),
        caixa_id: ensureUUID(receipt.cashRegisterId),
        metodo_pagamento: receipt.paymentMethod,
        operador_nome: currentUser?.name,
        hash: receipt.hash,
        serie_id: ensureUUID(seriesRec.id)
      });

      await supabase.from('faturas').update({
        paid_amount: updatedInvoice.paidAmount,
        status: updatedInvoice.status === InvoiceStatus.PAID ? 'Pago' : 'Pendente'
      }).eq('id', ensureUUID(invoice.id));

      // Update Cash Register
      const reg = cashRegisters.find(c => c.id === registerId);
      if (reg) {
        const newBalance = reg.balance + amount;
        await supabase.from('caixas').update({ saldo_atual: newBalance }).eq('id', ensureUUID(registerId));

        // Register Cash Movement
        await supabase.from('movimentos_caixa').insert({
          tipo: 'ENTRY',
          valor: amount,
          descricao: `Recebimento RG ${receipt.number}`,
          caixa_id: ensureUUID(registerId),
          documento_ref: receipt.number,
          metodo_pagamento: method,
          operador_nome: currentUser?.name || 'Sistema',
          origem: 'SALES',
          empresa_id: companyId
        });

        handleUpdateCashRegister({ ...reg, balance: newBalance });
      }
    } catch (e: any) {
      console.error(e);
      alert("Erro ao liquidar fatura: " + e.message);
    }
  };

  /* Fix: Added missing handleDeletePurchase function */
  const handleDeletePurchase = async (id: string) => {
    if (window.confirm("Deseja apagar este registo de compra?")) {
      try {
        const uuid = ensureUUID(id);
        if (uuid) {
          await supabase.from('compras').delete().eq('id', uuid);
        }
        setPurchases(prev => prev.filter(p => p.id !== id));
      } catch (e) { console.error(e); }
    }
  };

  /* Fix: Added missing handleSaveCompany function */
  const handleSaveCompany = async (company: Company) => {
    setCurrentCompany(company);
    try {
      await supabase.from('empresas').update({
        nome: company.name,
        email: company.email,
        telefone: company.phone,
        morada: company.address,
        codigo_postal: company.postalCode,
        matricula: company.registrationNumber,
        alvara: company.licenseNumber,
        num_inss: company.inssNumber,
        tipo_empresa: company.companyType,
        iva_caixa: company.cashVAT,
        regime: company.regime
      }).eq('id', company.id);
      alert("Configurações da empresa salvas na Cloud!");
    } catch (e) { console.error(e); }
  };

  const renderView = () => {
    if (!currentUser) return <LoginPage onLogin={handleLogin} />;

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard invoices={certifiedInvoices} />;
      case 'WORKSPACE': return <Workspace invoices={certifiedInvoices} purchases={validPurchases} clients={clients} onViewInvoice={(inv) => { setInvoiceInitialData(inv); setCurrentView('CREATE_INVOICE'); }} onViewProject={(p) => { setSelectedProject(p); setCurrentView('PROJECT_REPORT'); }} onRefreshPurchases={fetchPurchasesCloud} />;
      case 'PROJECT_REPORT': return selectedProject ? <ProjectReport project={selectedProject} invoices={certifiedInvoices} purchases={validPurchases} onBack={() => setCurrentView('WORKSPACE')} /> : <Workspace invoices={certifiedInvoices} purchases={validPurchases} clients={clients} onViewInvoice={(inv) => { setInvoiceInitialData(inv); setCurrentView('CREATE_INVOICE'); }} onViewProject={(p) => { setSelectedProject(p); setCurrentView('PROJECT_REPORT'); }} />;
      case 'ARCHIVES': return <ArchivesManager />;
      case 'FINANCE_TAX_DOCS': return <TaxDocsManager />;
      case 'INVOICES':
      case 'CREATE_INVOICE':
        return (
          <div className="h-full relative">
            <InvoiceList
              invoices={invoices}
              onDelete={handleDeleteInvoice}
              onUpdate={i => { setInvoiceInitialData(i); setCurrentView('CREATE_INVOICE'); }}
              onLiquidate={handleLiquidate}
              onCancelInvoice={handleCancelInvoice}
              onCertify={i => handleSaveInvoice(i, i.seriesId, 'CERTIFY')}
              onCreateNew={() => { setInvoiceInitialData(undefined); setCurrentView('CREATE_INVOICE'); }}
              onCreateDerived={(s, t) => { setInvoiceInitialType(t); setInvoiceInitialData({ clientId: s.clientId, items: s.items.map(i => ({ ...i, id: generateId() })), sourceInvoiceId: s.id, currency: s.currency, exchangeRate: s.exchangeRate }); setCurrentView('CREATE_INVOICE'); }}
              onUpload={() => { }}
              onViewReports={() => { }}
              onQuickUpdate={() => { }}
              onViewClientAccount={(cid) => { setSelectedClientId(cid); setCurrentView('CLIENTS'); }}
              currentCompany={currentCompany}
              workLocations={workLocations}
              cashRegisters={cashRegisters}
              series={series}
              currentUser={currentUser}
              purchases={validPurchases}
            />
            {currentView === 'CREATE_INVOICE' && (
              <NewDocumentForm
                onSave={handleSaveInvoice}
                onCancel={() => setCurrentView('INVOICES')}
                clients={clients}
                products={products}
                workLocations={workLocations}
                cashRegisters={cashRegisters}
                series={series}
                warehouses={warehouses}
                initialType={invoiceInitialType}
                initialData={invoiceInitialData}
                currentUser={currentUser?.name || ''}
                currentUserId={currentUser?.id || ''}
                currentCompany={currentCompany}
                taxRates={taxRates.filter(t => t.isActive)}
                metrics={metrics}
              />
            )}
          </div>
        );
      case 'PURCHASES':
      case 'CREATE_PURCHASE':
        return (
          <div className="h-full relative">
            <PurchaseList
              purchases={purchases}
              onDelete={handleDeletePurchase}
              onUpdate={p => { setPurchaseInitialData(p); setCurrentView('CREATE_PURCHASE'); }}
              onCreateNew={() => { setPurchaseInitialData(undefined); setCurrentView('CREATE_PURCHASE'); }}
              onUpload={() => { }}
              onSaveSupplier={s => setSuppliers([...suppliers, s])}
            />
            {currentView === 'CREATE_PURCHASE' && (
              <NewPurchaseForm
                onSave={handleSavePurchase}
                onCancel={() => setCurrentView('PURCHASES')}
                suppliers={suppliers}
                products={products}
                warehouses={warehouses}
                workLocations={workLocations}
                initialData={purchaseInitialData}
                currentUser={currentUser?.name || ''}
                currentUserId={currentUser?.id || ''}
                currentCompany={currentCompany}
              />
            )}
          </div>
        );
      case 'CLIENTS': return <ClientList clients={clients} onSaveClient={handleSaveClient} initialSelectedClientId={selectedClientId} onClearSelection={() => setSelectedClientId(null)} currentCompany={currentCompany} invoices={invoices} workLocations={workLocations} />;
      case 'SUPPLIERS': return <SupplierList suppliers={suppliers} onSaveSupplier={s => setSuppliers([...suppliers, s])} purchases={validPurchases} workLocations={workLocations} />;
      case 'PURCHASE_ANALYSIS': return <PurchaseAnalysis purchases={validPurchases} />;
      case 'STOCK': return <StockManager products={products} setProducts={setProducts} warehouses={warehouses} setWarehouses={setWarehouses} priceTables={priceTables} setPriceTables={setPriceTables} movements={stockMovements} invoices={invoices} purchases={purchases} suppliers={suppliers} onSavePurchase={handleSavePurchase} onStockMovement={m => setStockMovements([...stockMovements, m])} onCreateDocument={(t, i, n) => { setInvoiceInitialType(t); setInvoiceInitialData({ items: i, notes: n }); setCurrentView('CREATE_INVOICE'); }} onOpenReportOverlay={() => setCurrentView('FINANCE_REPORTS')} cashRegisters={cashRegisters} clients={clients} workLocations={workLocations} series={series} />;
      case 'SETTINGS':
        return <Settings
          series={series}
          onSaveSeries={async (s) => {
            const companyIdToUse = await getSecureEmpresaId();
            const { error } = await supabase.from('series').upsert({
              id: s.id || generateId(),
              nome: s.name,
              codigo: s.code,
              tipo: s.type,
              ano: s.year,
              sequencia_atual: s.currentSequence,
              sequencias_por_tipo: s.sequences,
              ativo: s.isActive,
              utilizadores_autorizados: s.allowedUserIds,
              detalhes_bancarios: s.bankDetails,
              texto_rodape: s.footerText,
              empresa_id: companyIdToUse
            });
            if (!error) await fetchSeriesCloud();
          }}
          onEditSeries={async (s) => {
            await supabase.from('series').update({
              nome: s.name,
              codigo: s.code,
              tipo: s.type,
              ano: s.year,
              ativo: s.isActive,
              utilizadores_autorizados: s.allowedUserIds,
              detalhes_bancarios: s.bankDetails,
              texto_rodape: s.footerText
            }).eq('id', s.id);
            await fetchSeriesCloud();
          }}
          users={users}
          onSaveUser={(u) => setUsers([...users.filter(x => x.id !== u.id), u])}
          onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
          workLocations={workLocations}
          onSaveWorkLocation={(wl) => setWorkLocations([...workLocations, wl])}
          onDeleteWorkLocation={(id) => setWorkLocations(workLocations.filter(w => w.id !== id))}
          cashRegisters={cashRegisters}
          onSaveCashRegister={(cr) => setCashRegisters([...cashRegisters.filter(x => x.id !== cr.id), cr])}
          onDeleteCashRegister={id => setCashRegisters(prev => prev.filter(x => x.id !== id))}
          onTaxRatesUpdate={setTaxRates}
          banks={banks}
          onSaveBank={b => setBanks([...banks.filter(x => x.id !== b.id), b])}
          onDeleteBank={id => setBanks(banks.filter(x => x.id !== id))}
          metrics={metrics}
          onSaveMetric={m => setMetrics([...metrics.filter(x => x.id !== m.id), m])}
          onDeleteMetric={id => setMetrics(metrics.filter(x => x.id !== id))}
          currentCompany={currentCompany}
          onSaveCompany={handleSaveCompany}
        />;
      case 'FINANCE_CASH': return <CashManager cashRegisters={cashRegisters} onUpdateCashRegister={handleUpdateCashRegister} movements={[]} onAddMovement={() => { }} invoices={certifiedInvoices} purchases={validPurchases} />;
      case 'FINANCE_MAPS': return <CostRevenueMap invoices={certifiedInvoices} purchases={validPurchases} />;
      case 'FINANCE_REPORTS': return <ManagementReports invoices={certifiedInvoices} products={products} />;
      case 'ACCOUNTING_VAT': return <VatSettlementMap invoices={certifiedInvoices} purchases={validPurchases} history={vatSettlements} onSaveSettlement={s => setVatSettlements([s, ...vatSettlements])} />;
      case 'ACCOUNTING_PGC': return <PGCManager accounts={pgcAccounts} onSaveAccount={a => setPgcAccounts([...pgcAccounts, a])} onUpdateAccount={a => setPgcAccounts(pgcAccounts.map(x => x.id === a.id ? a : x))} />;
      case 'ACCOUNTING_WITHHOLDING': return <WithholdingTaxManager invoices={certifiedInvoices} purchases={validPurchases} company={currentCompany} />;
      case 'ACCOUNTING_CLASSIFY_SALES': return <ClassifyMovement mode="SALES" invoices={certifiedInvoices} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => setCurrentView('ACCOUNTING_RUBRICAS_SALES')} />;
      case 'ACCOUNTING_CLASSIFY_PURCHASES': return <ClassifyMovement mode="PURCHASES" invoices={certifiedInvoices} purchases={validPurchases} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => setCurrentView('ACCOUNTING_RUBRICAS_PURCHASES')} />;
      case 'ACCOUNTING_CLASSIFY_SALARY_PROC': return <ClassifyMovement mode="SALARY_PROC" invoices={certifiedInvoices} payroll={payrollHistory} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => { }} />;
      case 'ACCOUNTING_CLASSIFY_SALARY_PAY': return <ClassifyMovement mode="SALARY_PAY" invoices={certifiedInvoices} payroll={payrollHistory} clients={clients} pgcAccounts={pgcAccounts} onOpenRubricas={() => { }} />;
      case 'ACCOUNTING_RUBRICAS_SALES': return <RubricasManager mode="SALES" invoices={certifiedInvoices} pgcAccounts={pgcAccounts} onUpdateInvoice={i => setInvoices(invoices.map(x => x.id === i.id ? i : x))} />;
      case 'ACCOUNTING_RUBRICAS_PURCHASES': return <RubricasManager mode="PURCHASES" purchases={validPurchases} pgcAccounts={pgcAccounts} onUpdateInvoice={() => { }} onUpdatePurchase={p => setPurchases(purchases.map(x => x.id === p.id ? p : x))} />;
      case 'ACCOUNTING_MAPS': return <AccountingMaps invoices={certifiedInvoices} purchases={validPurchases} company={currentCompany} onOpenOpeningBalance={() => setCurrentView('ACCOUNTING_OPENING_BALANCE')} />;
      case 'ACCOUNTING_DECLARATIONS': return <Model7 invoices={certifiedInvoices} purchases={validPurchases} company={currentCompany} />;
      case 'ACCOUNTING_TAXES': return <TaxManager invoices={certifiedInvoices} company={currentCompany} purchases={validPurchases} payroll={payrollHistory} />;
      case 'ACCOUNTING_CALC': return <TaxCalculationMap invoices={certifiedInvoices} purchases={validPurchases} />;
      case 'ACCOUNTING_SAFT': return <SaftExport invoices={certifiedInvoices} purchases={validPurchases} clients={clients} suppliers={suppliers} />;
      case 'ACCOUNTING_OPENING_BALANCE': return <OpeningBalanceMap accounts={pgcAccounts} savedBalances={openingBalances} onSaveBalances={setOpeningBalances} onBack={() => setCurrentView('ACCOUNTING_MAPS')} onViewAccount={(code) => { setSelectedExtractAccount(code); setCurrentView('ACCOUNTING_ACCOUNT_EXTRACT'); }} />;
      case 'ACCOUNTING_ACCOUNT_EXTRACT': return <AccountExtract company={currentCompany} accountCode={selectedExtractAccount || '31'} year={globalYear} pgcAccounts={pgcAccounts} openingBalances={openingBalances} invoices={certifiedInvoices} onBack={() => setCurrentView('ACCOUNTING_MAPS')} onUpdateAccountCode={(o, n) => setSelectedExtractAccount(n)} onUpdateBalance={b => setOpeningBalances(openingBalances.map(x => x.id === b.id ? b : x))} />;
      case 'ACCOUNTING_REGULARIZATION': return <RegularizationMap invoices={invoices} onViewInvoice={(inv) => { setInvoiceInitialData(inv); setCurrentView('CREATE_INVOICE'); }} />;
      case 'HR_EMPLOYEES': return <Employees employees={hrEmployees} onSaveEmployee={e => setHrEmployees(prev => [...prev.filter(x => x.id !== e.id), e])} workLocations={workLocations} professions={professions} onIssueContract={i => { setSelectedHrEmployee(i); setCurrentView('HR_CONTRACT_ISSUE'); }} onPrintSlip={(emp) => alert(`Imprimir recibo de ${emp.name}`)} />;
      case 'HR':
        return <HumanResources
          employees={hrEmployees}
          onSaveEmployee={(e) => setHrEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
          transactions={hrTransactions}
          onSaveTransaction={t => setHrTransactions([...hrTransactions, t])}
          vacations={hrVacations}
          onSaveVacation={v => setHrVacations([...hrVacations, v])}
          payroll={payrollHistory}
          onProcessPayroll={async (p, cashRegisterId) => {
            // Upsert Logic: Remove existing slips for same employee/month/year before adding new ones
            const newSlips = p;
            setPayrollHistory(prev => {
              const existingMap = new Map(prev.map(s => [`${s.employeeId}-${s.month}-${s.year}`, s]));
              newSlips.forEach(s => existingMap.set(`${s.employeeId}-${s.month}-${s.year}`, s));
              return Array.from(existingMap.values());
            });

            // Only create Transfer Order if Cash Register is provided (meaning "Transferir" was clicked)
            if (p.length > 0 && cashRegisterId) {
              const total = p.reduce((acc, slip) => acc + slip.netTotal, 0);
              const firstSlip = p[0];
              const orderId = generateId();
              const order: TransferOrder = {
                id: orderId,
                reference: `SAL/${firstSlip.month}/${firstSlip.year}/${new Date().getTime().toString().slice(-4)}`,
                date: new Date().toISOString(),
                cashRegisterId: cashRegisterId,
                cashRegisterName: cashRegisters.find(c => c.id === cashRegisterId)?.name || 'Caixa',
                totalValue: total,
                employeeCount: p.length,
                month: firstSlip.month || 1,
                year: firstSlip.year || 2026,
                details: p.map(slip => {
                  const emp = hrEmployees.find(e => e.id === slip.employeeId);
                  return {
                    employeeId: slip.employeeId,
                    employeeName: slip.employeeName,
                    bankName: emp?.bankName || 'Pagamento em Mão',
                    accountNumber: emp?.bankAccount || '',
                    iban: emp?.iban || '',
                    idnf: emp?.idnf || '0',
                    amount: slip.netTotal
                  };
                })
              };
              setTransferOrders([order, ...transferOrders]);

              // Cash Out Logic
              const reg = cashRegisters.find(c => c.id === cashRegisterId);
              if (reg) {
                const newBalance = reg.balance - total;
                setCashRegisters(prev => prev.map(c => c.id === cashRegisterId ? { ...c, balance: newBalance } : c));
                try {
                  const uuid = ensureUUID(cashRegisterId);
                  if (uuid) {
                    await supabase.from('caixas').update({ saldo_atual: newBalance }).eq('id', uuid);
                    const companyId = await getSecureEmpresaId();
                    await supabase.from('movimentos_caixa').insert({
                      tipo: 'EXIT',
                      valor: total,
                      descricao: `Pagamento Salários Ref: ${order.reference}`,
                      caixa_id: uuid,
                      documento_ref: order.reference,
                      metodo_pagamento: 'CASH',
                      operador_nome: currentUser?.name || 'Sistema',
                      origem: 'SALARY',
                      empresa_id: companyId
                    });
                  }
                } catch (e) { console.error("Erro saida caixa salario:", e); }
              }

              setAutoOpenTransferOrderId(orderId);
              setCurrentView('HR_TRANSFER_ORDERS');
            } else if (p.length > 0) {
              // Just processed, stay on page or show success?
              // The ProcessSalary component handles its own "Processed" state UI green checkmark.
            }
          }}
          professions={professions}
          onSaveProfession={async (p) => {
            try {
              const { error } = await supabase.from('profissoes_internas').upsert({
                id: p.id,
                codigo_inss: p.code,
                nome_profissao: p.name,
                profissao_inss: p.indexedProfessionName || p.name,
                salario_base: p.baseSalary,
                ajudas_custo: p.complement,
                created_at: p.createdAt || new Date().toISOString(),
                created_by: p.userName || currentUser?.name || 'Admin'
              });
              if (error) throw error;
              await fetchInternalProfessionsCloud();
            } catch (e) { console.error("Erro ao salvar profissão:", e); alert("Erro ao salvar profissão."); }
          }}
          onDeleteProfession={async (id) => {
            if (window.confirm("Tem certeza que deseja eliminar esta profissão?")) {
              try {
                const { error } = await supabase.from('profissoes_internas').delete().eq('id', id);
                if (error) throw error;
                await fetchInternalProfessionsCloud();
              } catch (e) { console.error("Erro ao eliminar profissão:", e); }
            }
          }}
          contracts={contracts}
          onSaveContract={c => setContracts([...contracts, c])}
          attendance={attendance}
          onSaveAttendance={a => setAttendance([...attendance, a])}
          company={currentCompany}
          workLocations={workLocations}
          onPrintSlip={(emp) => alert(`Imprimir recibo de ${emp.name}`)}
          cashRegisters={cashRegisters}
          onUpdateCashRegister={handleUpdateCashRegister}
          transferOrders={transferOrders}
          onViewTransferOrders={() => setCurrentView('HR_TRANSFER_ORDERS')}
          initialTab="ASSIDUIDADE"
        />;

      // Additional HR Views
      case 'HR_ATTENDANCE_MAP': return <AttendanceMapPage employees={hrEmployees} attendance={attendance} workLocations={workLocations} company={currentCompany} onProcess={() => { }} />;
      case 'HR_SALARY_PROC': return <HumanResources
        employees={hrEmployees}
        onSaveEmployee={(e) => setHrEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]))}
        transactions={hrTransactions}
        onSaveTransaction={t => setHrTransactions([...hrTransactions, t])}
        vacations={hrVacations}
        onSaveVacation={v => setHrVacations([...hrVacations, v])}
        payroll={payrollHistory}
        onProcessPayroll={async (p, cashRegisterId) => {
          // Processing logic duplicated for specific view or wrapped
          // Upsert Logic: Remove existing slips for same employee/month/year before adding new ones
          const newSlips = p;
          setPayrollHistory(prev => {
            const existingMap = new Map(prev.map(s => [`${s.employeeId}-${s.month}-${s.year}`, s]));
            newSlips.forEach(s => existingMap.set(`${s.employeeId}-${s.month}-${s.year}`, s));
            return Array.from(existingMap.values());
          });
        }}
        professions={professions}
        onSaveProfession={() => { }}
        onDeleteProfession={() => { }}
        contracts={contracts}
        onSaveContract={c => setContracts([...contracts, c])}
        attendance={attendance}
        onSaveAttendance={a => setAttendance([...attendance, a])}
        company={currentCompany}
        workLocations={workLocations}
        cashRegisters={cashRegisters}
        initialTab="PROCESSAMENTO"
      />;
      case 'HR_CONTRACTS': return <ContractManagement employees={hrEmployees} company={currentCompany} onClose={() => setCurrentView('HR')} contracts={contracts} onSave={c => { setContracts([...contracts, c]); fetchContractsCloud(); }} />;
      case 'HR_EMPLOYEE_LIST': return <EmployeeListPage employees={hrEmployees} onSaveEmployee={async (e) => {
        // Save Logic 
        setHrEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp).concat(prev.find(emp => emp.id === e.id) ? [] : [e]));
        // Actually create function for save
      }} workLocations={workLocations} professions={professions} />;

      case 'HR_TRANSFER_ORDERS': return <TransferOrderList orders={transferOrders} company={currentCompany} autoOpenId={autoOpenTransferOrderId} onDeleteOrder={id => setTransferOrders(prev => prev.filter(o => o.id !== id))} />;
      case 'HR_PERFORMANCE': return <PerformanceAnalysis logs={userActivity} employees={hrEmployees} users={users} />;
      case 'HR_CONTRACT_ISSUE':
        if (!selectedHrEmployee) return <div className="p-8 text-center text-slate-400">Seleccione um funcionário primeiro.</div>;
        return <ContractGenerator employee={selectedHrEmployee} company={currentCompany} onBack={() => setCurrentView('HR_EMPLOYEES')} onSave={(c) => { setContracts([...contracts, c]); fetchContractsCloud(); setCurrentView('HR'); }} />;

      case 'HR_PERSONAL_REGISTRATION':
        return <PersonalRegistration
          employee={selectedHrEmployee}
          onClose={() => setCurrentView('HR_EMPLOYEES')}
          onEdit={(e) => {
            setHrEmployees(prev => prev.map(EMP => EMP.id === e.id ? e : EMP));
            setSelectedHrEmployee(e);
          }}
        />;

      case 'HR_MAPS': return <HRMaps employees={hrEmployees} onClose={() => setCurrentView('HR')} />;

      case 'HR_WORK_CARD':
        return <WorkCard
          employees={hrEmployees}
          onClose={() => setCurrentView('HR_EMPLOYEES')}
        />;

      case 'HR_LABOR_REGISTRATION': return <LaborRegistration employees={hrEmployees} onClose={() => setCurrentView('HR')} />;

      case 'HR_IRT_TABLE': return <IRTTableManager onClose={() => setCurrentView('HR')} />;

      case 'WORK_LOCATIONS': return <WorkLocationManager workLocations={workLocations} />;

      case 'SECRETARIA_LIST': return <SecretariaList documents={secDocuments} onCreateNew={() => setCurrentView('SECRETARIA_FORM')} onEdit={doc => { setInvoiceInitialData({ ...doc } as any); setCurrentView('SECRETARIA_FORM'); }} />;
      case 'SECRETARIA_FORM': return <SecretariaForm onSave={doc => { setSecDocuments([doc, ...secDocuments.filter(d => d.id !== doc.id)]); setCurrentView('SECRETARIA_LIST'); }} onCancel={() => setCurrentView('SECRETARIA_LIST')} series={series} document={invoiceInitialData as any} />;

      case 'POS_GROUP':
      case 'POS': return <POS products={products} clients={clients} invoices={invoices} series={series} cashRegisters={cashRegisters} config={posConfig} onSaveInvoice={handleSaveInvoice} onGoBack={() => setCurrentView('DASHBOARD')} currentUser={currentUser} company={currentCompany} warehouses={warehouses} workLocations={workLocations} />;
      case 'CASH_CLOSURE': return <CashClosure registers={cashRegisters} invoices={invoices} movements={[]} onSaveClosure={c => { setCashClosures([c, ...cashClosures]); fetchCashClosuresCloud(); }} onGoBack={() => setCurrentView('DASHBOARD')} currentUser={currentUser?.name || "Admin"} currentUserId={currentUser?.id || "u1"} companyId={currentCompany?.id} />;
      case 'CASH_CLOSURE_HISTORY': return <CashClosureHistory closures={cashClosures} />;
      case 'POS_SETTINGS': return <POSSettings config={posConfig} onSaveConfig={setPosConfig} series={series} clients={clients} />;

      case 'SCHOOL_GROUP':
      case 'SCHOOL_STUDENTS':
      case 'SCHOOL_ACADEMIC':
      case 'SCHOOL_DOCUMENTS':
      case 'SCHOOL_REPORTS':
        return <SchoolManagement currentSubView={currentView} />;
      case 'RESTAURANT_GROUP':
      case 'RESTAURANT_MENU':
      case 'RESTAURANT_TABLES':
      case 'RESTAURANT_KDS':
      case 'RESTAURANT_PRODUCTION':
        return <RestaurantManagement currentSubView={currentSubView} />;
      case 'HOTEL_GROUP':
      case 'HOTEL_ROOMS':
      case 'HOTEL_RESERVATIONS':
      case 'HOTEL_CHECKIN':
      case 'HOTEL_GOVERNANCE':
        return <HotelManagement currentSubView={currentSubView} />;

      case 'REPORTS_MOVEMENTS':
        return <GeneralMovements invoices={certifiedInvoices} purchases={validPurchases} clients={clients} products={products} cashRegisters={cashRegisters} workLocations={workLocations} />;

      case 'AGRIBUSINESS':
        return <Agribusiness />;
      case 'CHURCH_MANAGEMENT':
        return <ChurchManagement />;

      default: return <div className="p-8 text-center text-slate-400">Selecione um módulo para continuar.</div>;
    }
  };


  const handleUpdateCashRegister = async (cr: CashRegister) => {
    setCashRegisters(prev => prev.map(c => c.id === cr.id ? cr : c));
    try {
      const uuid = ensureUUID(cr.id);
      if (uuid) {
        await supabase.from('caixas').update({ saldo_atual: cr.balance, status: cr.status }).eq('id', uuid);
      }
    } catch (e) { console.error("Erro update caixa:", e); }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {currentView !== 'CREATE_INVOICE' && (
        <Sidebar
          currentView={currentView}
          onChangeView={setCurrentView}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          currentUser={currentUser}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {currentView !== 'CREATE_INVOICE' && (
          <header className="bg-white border-b border-slate-200 h-24 flex items-center justify-between px-6 shadow-md shrink-0 z-10">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"><Menu /></button>
              <div className="flex items-center gap-4 border-r pr-6 border-slate-200 h-16">
                <div className="w-16 h-16 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-3xl shadow-xl transform hover:scale-105 transition-all">
                  IM
                </div>
                <div className="hidden lg:block">
                  <h2 className="font-black text-xl text-slate-900 leading-none tracking-tighter">IMATEC SOFTWARE</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[3px] mt-1">Sistemas de Gestão</p>
                </div>
              </div>
              <div className="hidden xl:flex flex-col">
                <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-1">Empresa Licenciada</h2>
                <h2 className="font-bold text-slate-700 tracking-tight text-sm truncate max-w-[300px]">{currentCompany.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg border border-slate-800">
                <ClockIcon size={16} className="text-blue-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-0.5">Hora Local</span>
                  <span className="font-mono font-bold text-sm tracking-widest">
                    {currentTime.toLocaleTimeString('pt-AO', { hour12: false })}
                  </span>
                </div>
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full animate-pulse border border-blue-100">
                  <Loader2 size={12} className="animate-spin" /> Sincronizando...
                </div>
              )}
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 px-2 border hover:border-slate-300 transition-all shadow-inner">
                <CalendarIcon size={14} className="text-slate-500" />
                <select className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer" value={globalYear} onChange={(e) => setGlobalYear(Number(e.target.value))}>
                  <option value={2024}>2024</option><option value={2025}>2025</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name || "Administrador"}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{currentUser?.role || "ADMIN"}</p>
                </div>
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-lg border-2 border-slate-100 shadow-lg transition-transform hover:scale-110 cursor-pointer">
                  {(currentUser?.name || 'A').charAt(0)}
                </div>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6 relative">
          {renderView()}
        </main>
      </div>
      <AIAssistant invoices={invoices} purchases={purchases} clients={clients} />
    </div>
  );
};

const TransferOrderList: React.FC<{ orders: TransferOrder[], company: Company, autoOpenId?: string | null, onDeleteOrder: (id: string) => void }> = ({ orders, company, autoOpenId, onDeleteOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState<TransferOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (autoOpenId) {
      const auto = orders.find(o => o.id === autoOpenId);
      if (auto) setSelectedOrder(auto);
    }
  }, [autoOpenId, orders]);

  const filteredOrders = orders.filter(o => o.reference.toLowerCase().includes(searchTerm.toLowerCase()));

  const handlePrintList = () => window.print();

  return (
    <div className="space-y-6 animate-in fade-in h-full">
      {selectedOrder && <TransferOrderView order={selectedOrder} company={company} onClose={() => setSelectedOrder(null)} />}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><ArrowRightLeft className="text-blue-600" /> Ordens de Transferência</h1>
          <div className="text-xs text-slate-500 font-bold uppercase">Histórico de Pagamentos via Banco</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Pesquisar Ref..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handlePrintList} className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase transition">
            <Printer size={14} /> Imprimir Lista
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">
            <tr>
              <th className="p-4">Referência</th>
              <th className="p-4 text-center">Data</th>
              <th className="p-4 text-center">Referente a</th>
              <th className="p-4 text-right">Montante Total</th>
              <th className="p-4 text-center">Opções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map(o => (
              <tr key={o.id} className="hover:bg-blue-50 transition-colors">
                <td className="p-4 font-black text-blue-600 font-mono">{o.reference}</td>
                <td className="p-4 text-center">{formatDate(o.date)}</td>
                <td className="p-4 text-center font-bold text-slate-500 uppercase">{o.month}/{o.year}</td>
                <td className="p-4 text-right font-black text-slate-900">{formatCurrency(o.totalValue)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setSelectedOrder(o)} title="Visualizar" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => alert("Funcionalidade de Associar Documento em desenvolvimento.")} title="Associar" className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition shadow-sm">
                      <Paperclip size={16} />
                    </button>
                    <button onClick={() => {
                      if (confirm("Tem certeza que deseja apagar esta ordem de transferência? Isso permitirá processar novamente a transferência para este mês.")) {
                        onDeleteOrder(o.id);
                      }
                    }} title="Apagar" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-black uppercase tracking-[5px] italic">Sem ordens de transferência encontradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App;