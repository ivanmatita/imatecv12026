
import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, Users, Settings, LogOut, X,
  Building2, Briefcase, Calculator, CreditCard, ShoppingBag,
  Package, ChevronDown, ChevronRight, User, BriefcaseBusiness,
  FileJson, Percent, Table, BookOpen, ListTree, CheckCircle,
  Scale, Paperclip, Monitor, BarChart3, GraduationCap,
  ClipboardCheck, ScrollText, UserCheck, School, Hotel,
  CookingPot, BedDouble, Calendar, FolderArchive, ChevronLeft, Menu,
  UtensilsCrossed, FileSearch, TrendingUp, ArrowRightLeft, Landmark,
  Sprout, Church, Tractor, UserX, Plus
} from 'lucide-react';
import { ViewState, User as UserType } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser: UserType | null;
  onLogout?: () => void;
  isWhite?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, currentUser, onLogout, isWhite }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userAvatar, setUserAvatar] = useState(currentUser?.avatar || '');

  const menuItems = [
    { id: 'DASHBOARD', label: 'Painel de Bordo', icon: LayoutDashboard },
    { id: 'WORKSPACE', label: 'Local de Trabalho', icon: BriefcaseBusiness },
    { id: 'SECRETARIA_LIST', label: 'Secretaria Beta', icon: Paperclip },
    { id: 'ARCHIVES', label: 'Arquivos', icon: FolderArchive },

    {
      id: 'POS_GROUP', label: 'Ponto de Venda', icon: Monitor, hasSubmenu: true,
      children: [
        { id: 'POS', label: 'Frente de Caixa (POS)', icon: Monitor },
        { id: 'CASH_CLOSURE', label: 'Fecho de Caixa', icon: CreditCard },
        { id: 'CASH_CLOSURE_HISTORY', label: 'Fechos Efetuados', icon: FileText },
        { id: 'POS_SETTINGS', label: 'Configurações POS', icon: Settings }
      ]
    },

    {
      id: 'SPECIALIZED_GROUP', label: 'Gestão Especializada', icon: Briefcase, hasSubmenu: true,
      children: [
        {
          id: 'SCHOOL_GROUP', label: 'Gestão Escolar', icon: GraduationCap, isSubheader: true,
          children: [
            { id: 'SCHOOL_STUDENTS', label: 'Alunos & Matrículas', icon: Users },
            { id: 'SCHOOL_TEACHERS', label: 'Professores & Salas', icon: UserCheck },
            { id: 'SCHOOL_ACADEMIC', label: 'Gestão Académica', icon: ClipboardCheck },
            { id: 'SCHOOL_DOCUMENTS', label: 'Documentos Oficiais', icon: ScrollText },
            { id: 'SCHOOL_REPORTS', label: 'Relatórios & Mapas', icon: Table }
          ]
        },
        {
          id: 'RESTAURANT_GROUP', label: 'Restaurante', icon: UtensilsCrossed, isSubheader: true,
          children: [
            { id: 'RESTAURANT_MENU', label: 'Cardápio Digital', icon: ScrollText },
            { id: 'RESTAURANT_TABLES', label: 'Gestão de Mesas', icon: Table },
            { id: 'RESTAURANT_KDS', label: 'Cozinha (KDS)', icon: CookingPot },
            { id: 'RESTAURANT_PRODUCTION', label: 'Controle de Produção', icon: Package }
          ]
        },
        {
          id: 'HOTEL_GROUP', label: 'Hotelaria', icon: Building2, isSubheader: true,
          children: [
            { id: 'HOTEL_ROOMS', label: 'Quartos & Status', icon: BedDouble },
            { id: 'HOTEL_RESERVATIONS', label: 'Reservas', icon: Calendar },
            { id: 'HOTEL_CHECKIN', label: 'Check-in / Out', icon: CheckCircle },
            { id: 'HOTEL_GOVERNANCE', label: 'Governança', icon: Briefcase }
          ]
        }
      ]
    },

    {
      id: 'INVOICES_GROUP', label: 'Vendas', icon: FileText, hasSubmenu: true,
      children: [
        { id: 'CREATE_INVOICE', label: 'Nova Fatura', icon: Plus },
        { id: 'INVOICES', label: 'Documentos de Venda', icon: FileText },
        { id: 'ACCOUNTING_REGULARIZATION', label: 'Regularização Clientes', icon: Calculator },
        { id: 'CLIENTS', label: 'Clientes', icon: Users }
      ]
    },
    {
      id: 'PURCHASES_GROUP', label: 'Compras', icon: ShoppingBag, hasSubmenu: true,
      children: [
        { id: 'CREATE_PURCHASE', label: 'Registar Compra', icon: Plus },
        { id: 'PURCHASES', label: 'Documentos de Compra', icon: ShoppingBag },
        { id: 'SUPPLIERS', label: 'Fornecedores', icon: Building2 },
        { id: 'PURCHASE_ANALYSIS', label: 'Análise de Compras', icon: BarChart3 }
      ]
    },
    {
      id: 'STOCK_GROUP', label: 'Stocks & Inventário', icon: Package, hasSubmenu: true,
      children: [
        { id: 'STOCK', label: 'Gestão de Artigos', icon: Package }
      ]
    },
    {
      id: 'FINANCE_GROUP', label: 'Finanças', icon: CreditCard, hasSubmenu: true,
      children: [
        { id: 'FINANCE_CASH', label: 'Caixa (Gestão)', icon: CreditCard },
        { id: 'FINANCE_MAPS', label: 'Mapas Custos/Proveitos', icon: Table },
        { id: 'FINANCE_REPORTS', label: 'Relatórios de Gestão', icon: BarChart3 },
        { id: 'FINANCE_TAX_DOCS', label: 'Documentos de Impostos', icon: FileText }
      ]
    },
    {
      id: 'ACCOUNTING_GROUP', label: 'Contabilidade', icon: Calculator, hasSubmenu: true,
      children: [
        { id: 'ACCOUNTING_VAT', label: 'Apuramento de IVA', icon: Scale },
        { id: 'ACCOUNTING_PGC', label: 'Contas PGC', icon: BookOpen },
        { id: 'ACCOUNTING_WITHHOLDING', label: 'Mapas de Retenção na Fonte', icon: Landmark },
        {
          id: 'ACCOUNTING_CLASSIFY_GROUP',
          label: 'Classificar Movimentos',
          icon: CheckCircle,
          isSubheader: true,
          children: [
            { id: 'ACCOUNTING_CLASSIFY_SALES', label: 'Classificar Vendas' },
            { id: 'ACCOUNTING_CLASSIFY_PURCHASES', label: 'Classificar Compras' },
            { id: 'ACCOUNTING_CLASSIFY_SALARY_PROC', label: 'Processo Salário' },
            { id: 'ACCOUNTING_CLASSIFY_SALARY_PAY', label: 'Pagamento Salário' }
          ]
        },
        {
          id: 'ACCOUNTING_RUBRICAS_GROUP',
          label: 'Ajuste de Rubricas',
          icon: ListTree,
          isSubheader: true,
          children: [
            { id: 'ACCOUNTING_RUBRICAS_SALES', label: 'Ajustar Vendas' },
            { id: 'ACCOUNTING_RUBRICAS_PURCHASES', label: 'Ajustar Compras' }
          ]
        },
        { id: 'ACCOUNTING_MAPS', label: 'Mapas Contabilísticos', icon: Table },
        { id: 'ACCOUNTING_DECLARATIONS', label: 'Modelo 7' },
        { id: 'ACCOUNTING_TAXES', label: 'Impostos' },
        { id: 'ACCOUNTING_CALC', label: 'Cálculos de Impostos', icon: Percent },
        { id: 'ACCOUNTING_SAFT', label: 'Ficheiro SAFT', icon: FileJson }
      ]
    },
    {
      id: 'HR_GROUP', label: 'Recursos Humanos', icon: Users, hasSubmenu: true,
      children: [
        { id: 'HR_EMPLOYEES', label: 'Funcionários' },
        { id: 'HR', label: 'Gestão Geral' },
        { id: 'HR_ATTENDANCE_MAP', label: 'Assiduidade dos Colaboradores', icon: Calendar },
        { id: 'HR_SALARY_PROC', label: 'Processamento', icon: Calculator },
        { id: 'HR_CONTRACTS', label: 'Contrato de Trabalho', icon: FileText },
        { id: 'HR_PERSONAL_REGISTRATION', label: 'Cadastro Pessoal', icon: User },
        { id: 'HR_MAPS', label: 'Mapas', icon: Table },
        { id: 'HR_EMPLOYEE_LIST', label: 'Lista Trabalhadores', icon: Users },
        { id: 'HR_WORK_CARD', label: 'Cartão de Trabalho', icon: FileText },
        { id: 'HR_LABOR_REGISTRATION', label: 'Inscrição Laboral', icon: ScrollText },
        { id: 'HR_IRT_TABLE', label: 'Tabela de IRT', icon: Percent },
        { id: 'HR_TRANSFER_ORDERS', label: 'Ordens de Transferência', icon: ArrowRightLeft },
        { id: 'HR_PERFORMANCE', label: 'Análise de Desempenho', icon: BarChart3 },
        { id: 'HR_LABOR_EXTINCTION', label: 'Extinção Laboral', icon: UserX },
        { id: 'HR_PROFESSIONS', label: 'Definição de Profissões', icon: Briefcase }
      ]
    },
    {
      id: 'REPORTS_GROUP', label: 'Relatórios', icon: FileSearch, hasSubmenu: true,
      children: [
        { id: 'REPORTS_MONTHLY', label: 'Relatórios Mensais', icon: Calendar },
        { id: 'REPORTS_YEARLY', label: 'Relatórios Anuais', icon: TrendingUp },
        { id: 'REPORTS_DEBTS', label: 'Documento Dívidas', icon: Calculator },
        { id: 'REPORTS_MOVEMENTS', label: 'Movimentos Gerais', icon: ListTree }
      ]
    },
    { id: 'AGRIBUSINESS', label: 'Agronegócio', icon: Sprout },
    { id: 'CHURCH_MANAGEMENT', label: 'Gestão de Igreja', icon: Church },
    { id: 'SETTINGS', label: 'Definições', icon: Settings },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (item.hasSubmenu && item.children) {
      return item.children.some(child => currentUser.permissions.includes(child.id as ViewState));
    }
    return currentUser.permissions.includes(item.id as ViewState);
  });

  const handleMenuClick = (item: any) => {
    if (item.hasSubmenu) {
      if (isCollapsed) setIsCollapsed(false);
      setOpenMenuId(openMenuId === item.id ? null : item.id);
    } else {
      setOpenMenuId(null);
      onChangeView(item.id as ViewState);
      setIsOpen(false);
    }
  };

  const handleSubMenuClick = (viewId: ViewState) => {
    onChangeView(viewId);
    setIsOpen(false);
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        ${isCollapsed ? 'w-20' : 'w-80'} ${isWhite ? 'bg-white' : 'bg-slate-900'} ${isWhite ? 'text-slate-800' : 'text-white'} transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full shadow-2xl border-r ${isWhite ? 'border-slate-200' : 'border-slate-800'} font-sans
      `}>
        {/* Toggle Button Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex absolute -right-3 top-24 ${isWhite ? 'bg-blue-600' : 'bg-blue-600'} text-white rounded-full p-1 shadow-lg z-40 border-2 ${isWhite ? 'border-white' : 'border-slate-900'} hover:scale-110 transition-transform`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 flex flex-col items-center border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'} relative ${isWhite ? 'bg-slate-50' : 'bg-slate-950'} transition-all ${isCollapsed ? 'p-4' : 'p-6'}`}>
          <div
            className={`rounded-full bg-slate-800 border-4 border-slate-700 mb-3 flex items-center justify-center overflow-hidden cursor-pointer hover:border-white transition-all group shadow-lg ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}
            onClick={handleAvatarClick}
          >
            {userAvatar ? (
              <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={isCollapsed ? 18 : 32} className="text-slate-400 group-hover:text-white" />
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

          {!isCollapsed && (
            <>
              <div className={`font-bold text-lg text-center ${isWhite ? 'text-slate-900' : 'text-white'}`}>{currentUser?.name}</div>
              <div className={`text-xs uppercase font-bold tracking-wider ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>{currentUser?.role}</div>
            </>
          )}

          <button onClick={() => setIsOpen(false)} className={`absolute top-4 right-4 lg:hidden ${isWhite ? 'text-slate-400' : 'text-white/70'} hover:text-slate-900`}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 pb-6 pt-4 overflow-visible">
          {!isCollapsed && <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-3">Menu Principal</div>}

          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isMenuOpen = openMenuId === item.id;
            const isActive = currentView === item.id;
            const flatChildren = item.children?.flatMap(c => c.children ? c.children : c) || [];
            const isChildActive = item.hasSubmenu && flatChildren.some(c => c.id === currentView);

            return (
              <div key={item.id} className="mb-1 relative">
                <button
                  onClick={() => handleMenuClick(item)}
                  title={isCollapsed ? item.label : ''}
                  className={`
                       w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3.5 rounded-lg transition-all duration-200 group
                       ${isActive || isChildActive
                      ? 'bg-blue-600 text-white font-bold border-l-4 border-white shadow-md'
                      : isWhite
                        ? 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                        : 'bg-blue-700/40 text-slate-100 hover:bg-blue-600 hover:text-white'
                    }
                     `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={22} className={`${isActive || isChildActive ? 'text-white' : isWhite ? 'text-slate-400 group-hover:text-blue-600' : 'text-blue-200 group-hover:text-white'}`} />
                    {!isCollapsed && <span className="text-base font-bold tracking-wide">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.hasSubmenu && (
                    isMenuOpen ? <ChevronDown size={14} className={isActive || isChildActive ? 'text-white' : isWhite ? 'text-slate-400' : 'text-white'} /> : <ChevronRight size={14} className={isWhite ? 'text-slate-300' : 'text-blue-200'} />
                  )}
                </button>

                {item.hasSubmenu && isMenuOpen && !isCollapsed && (
                  <div className="absolute left-full top-0 ml-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 z-50 animate-in slide-in-from-left-2 duration-200 max-h-[80vh] overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {item.children?.map(child => {
                        if (child.isSubheader) {
                          const SubheaderIcon = child.icon;
                          return (
                            <div key={child.id} className="mt-2 mb-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2 flex items-center gap-2 bg-slate-800 rounded-lg">
                                {SubheaderIcon && <SubheaderIcon size={12} />} {child.label}
                              </div>
                              <div className="pl-2 space-y-1 mt-1">
                                {child.children?.map(subChild => {
                                  const isSubActive = currentView === subChild.id;
                                  const SubChildIcon = subChild.icon;
                                  return (
                                    <button
                                      key={subChild.id}
                                      onClick={() => handleSubMenuClick(subChild.id as ViewState)}
                                      className={`
                                                                w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2
                                                                ${isSubActive
                                          ? 'text-white font-bold bg-blue-600'
                                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                        }
                                                            `}
                                    >
                                      {SubChildIcon && <SubChildIcon size={14} />}
                                      <span className="flex-1">{subChild.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          );
                        }

                        const isSubActive = currentView === child.id;
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleSubMenuClick(child.id as ViewState)}
                            className={`
                                        w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors flex items-center gap-2
                                        ${isSubActive
                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                              }
                                    `}
                          >
                            {ChildIcon && <ChildIcon size={14} />}
                            <span className="flex-1">{child.label}</span>
                            {isSubActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={`p-4 border-t ${isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'} shrink-0`}>
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Terminar Sessão' : ''}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isWhite ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-white hover:bg-slate-800'} w-full px-4 py-3 transition-colors rounded-lg group`}
          >
            <LogOut size={22} className="group-hover:text-red-400" />
            {!isCollapsed && <span className="font-bold">Terminar Sessão</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
