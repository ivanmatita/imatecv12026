
import React, { useState, useEffect } from 'react';
import {
    Users, ShieldCheck, Zap, BarChart3, Globe, Rocket,
    ArrowRight, Check, Building2, Mail, Phone, MapPin,
    Lock, User, Eye, EyeOff, MessageCircle, ChevronRight,
    Search, Menu, X, Landmark, Briefcase, HeartHandshake,
    CheckCircle2, Star, Calculator, CreditCard, ChevronLeft,
    Clock, Smartphone, Laptop, LayoutGrid
} from 'lucide-react';

interface LandingPageProps {
    onLogin: (userData: any) => void;
}

const IMATEC_COLORS = {
    primary: '#0F172A', // Slate 900
    brand: '#00263E',   // Deep Blue do Logotipo
    accent: '#00D179',  // Verde Vibrante da imagem
    blue: '#1E40AF',    // Azure Blue
    light: '#F8FAFC'
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'NONE'>('NONE');
    const [registerStep, setRegisterStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Form States
    const [loginData, setLoginData] = useState({ user: '', pass: '' });
    const [regData, setRegData] = useState({
        companyName: '',
        nif: '',
        adminName: '',
        location: '',
        address: '',
        contact: '',
        email: '',
        type: 'Comércio e serviços',
        plan: 'Premium',
        period: 'Mensal'
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const plans = [
        { name: 'Básico', price: 15000, features: ['Faturação Ilimitada', '1 Utilizador', 'Gestão de Clientes'] },
        { name: 'Premium', price: 35000, features: ['Tudo do Básico', '5 Utilizadores', 'Gestão de Stocks', 'SAFT-AO'] },
        { name: 'Pro', price: 75000, features: ['Tudo do Premium', 'Utilizadores Ilimitados', 'Contabilidade', 'RH & Salários'] }
    ];

    const calculateTotal = () => {
        const plan = plans.find(p => p.name === regData.plan);
        const base = plan ? plan.price : 0;
        if (regData.period === 'Trimestral') return base * 3 * 0.95; // 5% desc
        if (regData.period === 'Anual') return base * 12 * 0.85; // 15% desc
        return base;
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Login
        onLogin({
            id: 'u-cloud',
            name: 'Administrador ' + loginData.user,
            email: loginData.user + '@imatec.ao',
            role: 'ADMIN',
            companyId: '00000000-0000-0000-0000-000000000001'
        });
    };

    const renderRegisterStep = () => {
        switch (registerStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-in slide-in-from-right duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Nome da Empresa" value={regData.companyName} onChange={v => setRegData({ ...regData, companyName: v })} placeholder="Ex: IMATEC SOFT" icon={<Building2 size={18} />} />
                            <InputField label="NIF da Empresa" value={regData.nif} onChange={v => setRegData({ ...regData, nif: v })} placeholder="Ex: 500012345" icon={<Hash size={18} />} />
                            <InputField label="Administrador" value={regData.adminName} onChange={v => setRegData({ ...regData, adminName: v })} placeholder="Nome completo" icon={<User size={18} />} />
                            <InputField label="Contacto" value={regData.contact} onChange={v => setRegData({ ...regData, contact: v })} placeholder="+244 9..." icon={<Phone size={18} />} />
                            <div className="md:col-span-2">
                                <InputField label="Email Corporativo" value={regData.email} onChange={v => setRegData({ ...regData, email: v })} placeholder="email@empresa.com" icon={<Mail size={18} />} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Tipo de Negócio</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    value={regData.type}
                                    onChange={e => setRegData({ ...regData, type: e.target.value })}
                                >
                                    {['Comércio e serviços', 'Serviços', 'Comércio', 'Restaurante', 'Hotelaria', 'Centro de formação', 'Loja', 'Bar'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <InputField label="Localização" value={regData.location} onChange={v => setRegData({ ...regData, location: v })} placeholder="Luanda, Angola" icon={<MapPin size={18} />} />
                        </div>
                        <button onClick={() => setRegisterStep(2)} className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2">
                            PRÓXIMO PASSO <ChevronRight size={18} />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="flex justify-center bg-slate-100 p-1 rounded-xl w-fit mx-auto">
                            {['Mensal', 'Trimestral', 'Anual'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setRegData({ ...regData, period: p })}
                                    className={`px-6 py-2 rounded-lg text-xs font-black transition ${regData.period === p ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map(p => (
                                <div
                                    key={p.name}
                                    onClick={() => setRegData({ ...regData, plan: p.name })}
                                    className={`cursor-pointer p-4 rounded-2xl border-2 transition relative ${regData.plan === p.name ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                >
                                    {regData.plan === p.name && <CheckCircle2 className="absolute top-3 right-3 text-emerald-500" size={20} />}
                                    <h4 className="font-black text-slate-800 text-sm uppercase">{p.name}</h4>
                                    <div className="my-2">
                                        <span className="text-2xl font-black text-slate-900">{formatCurrency(p.price).replace('Kz', '')}</span>
                                        <span className="text-[10px] text-slate-400 font-bold ml-1">Kz/mês</span>
                                    </div>
                                    <ul className="space-y-1 mt-4">
                                        {p.features.slice(0, 3).map(f => (
                                            <li key={f} className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium"><Check size={10} className="text-emerald-500" /> {f}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Total Previsto ({regData.period})</p>
                                <h3 className="text-xl font-black text-emerald-400">{formatCurrency(calculateTotal())}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-400 italic">IVA Incluído (14%)</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setRegisterStep(1)} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                <ChevronLeft size={18} /> Voltar
                            </button>
                            <button onClick={() => setRegisterStep(3)} className="flex-[2] bg-emerald-500 text-white font-black py-4 rounded-xl hover:bg-emerald-600 shadow-xl transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                Confirmar Licença <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in zoom-in duration-500">
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                                <Rocket size={32} />
                            </div>
                            <h3 className="text-xl font-black text-emerald-900 uppercase">Tudo Pronto para Descolar!</h3>
                            <p className="text-sm text-emerald-700 font-medium">Reveja os seus dados e finalize o registo.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-[3px]">Empresa</h5>
                                <div className="text-sm font-black text-slate-800 uppercase">{regData.companyName}</div>
                                <div className="text-xs text-slate-500 font-medium">{regData.email}</div>
                                <div className="text-xs text-slate-500 font-medium">{regData.contact}</div>
                            </div>
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-[3px]">Plano Selecionado</h5>
                                <div className="text-sm font-black text-emerald-700 uppercase">Pacote {regData.plan}</div>
                                <div className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full w-fit uppercase">{regData.period}</div>
                                <div className="text-lg font-black text-slate-900">{formatCurrency(calculateTotal())}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                            <ShieldCheck size={20} className="shrink-0" />
                            <p className="text-[10px] font-bold">Ao clicar em Finalizar, receberá os seus acessos imediatos por e-mail e WhatsApp.</p>
                        </div>

                        <button
                            onClick={() => { alert('Registo Concluído! Verifique o seu email.'); setAuthMode('LOGIN'); }}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black shadow-2xl transition flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                        >
                            Finalizar Registo & Iniciar <CheckCircle2 size={24} className="text-emerald-400" />
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="relative min-h-screen bg-white selection:bg-emerald-200">
            {/* WhatsApp Floating */}
            <a href="https://wa.me/244922123456" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-50 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition group">
                <MessageCircle size={32} />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-emerald-600 px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap border-2 border-emerald-50">Fale Connosco</span>
            </a>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white shadow-xl py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">IM</div>
                        <div className={`font-black uppercase tracking-tighter ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
                            IMATE <span className="text-emerald-500">SOFTWARE</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {['Início', 'Produtos', 'Novidades', 'Sobre Nós', 'Contacto'].map(item => (
                            <button key={item}
                                onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                                className={`text-xs font-black uppercase tracking-widest hover:text-emerald-500 transition ${isScrolled ? 'text-slate-600' : 'text-white opacity-80 hover:opacity-100'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setAuthMode('LOGIN'); setRegisterStep(1); }}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg ${isScrolled ? 'bg-slate-900 text-white hover:bg-black' : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/20'}`}
                        >
                            Aceder
                        </button>
                        <button
                            onClick={() => { setAuthMode('REGISTER'); setRegisterStep(1); }}
                            className="bg-emerald-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20"
                        >
                            Registar
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background com Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-brand/80 backdrop-blur-[2px] z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
                        className="w-full h-full object-cover transform scale-110 animate-[pulse_10s_infinite]"
                        alt="Office"
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                        <div className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[4px] border border-emerald-500/30 w-fit mx-auto lg:mx-0">
                            Software Certificado AGT
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                            A Solução Definitiva para o <span className="text-emerald-400">Teu Negócio</span> em Angola.
                        </h1>
                        <p className="text-lg text-white/70 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Faturação, Contabilidade, Stocks e Recursos Humanos integrados numa plataforma moderna, segura e desenhada para o mercado angolano.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => setAuthMode('REGISTER')}
                                className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[3px] text-xs hover:bg-emerald-600 transition shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-3"
                            >
                                Experimentar Grátis <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => setAuthMode('LOGIN')}
                                className="bg-white/10 text-white backdrop-blur-xl border border-white/20 px-10 py-5 rounded-2xl font-black uppercase tracking-[3px] text-xs hover:bg-white/20 transition flex items-center justify-center gap-3"
                            >
                                <Lock size={18} /> Aceder ao Sistema
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/10">
                            <div><h4 className="text-3xl font-black text-white leading-none">5k+</h4><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2">Empresas</p></div>
                            <div><h4 className="text-3xl font-black text-white leading-none">99%</h4><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2">Satisfação</p></div>
                            <div><h4 className="text-3xl font-black text-white leading-none">24/7</h4><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2">Suporte</p></div>
                        </div>
                    </div>

                    {/* Auth Card - Fiel à Imagem */}
                    <div className="hidden lg:flex justify-center animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                        <div className="bg-white w-full max-w-[420px] rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="h-1 bg-emerald-500"></div>
                            <div className="p-10">
                                {authMode === 'REGISTER' ? (
                                    <div className="space-y-6">
                                        <div className="text-center space-y-2">
                                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Registar Empresa</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase">Passo {registerStep} de 3</p>
                                        </div>
                                        {renderRegisterStep()}
                                        <p className="text-center text-[10px] font-bold text-slate-400 pt-4 border-t uppercase tracking-widest">
                                            Já tem conta? <button onClick={() => setAuthMode('LOGIN')} className="text-emerald-600 hover:underline">Entrar agora</button>
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Aceder à Conta</h2>
                                            <p className="text-slate-400 text-sm font-medium">Insira as suas credenciais para continuar.</p>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <InputField label="Utilizador / E-mail" value={loginData.user} onChange={v => setLoginData({ ...loginData, user: v })} placeholder="exemplo@empresa.ao" icon={<Mail size={18} />} />
                                            <div className="relative">
                                                <InputField
                                                    label="Palavra-passe"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={loginData.pass}
                                                    onChange={v => setLoginData({ ...loginData, pass: v })}
                                                    placeholder="••••••••"
                                                    icon={<Lock size={18} />}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 bottom-3.5 text-slate-400 hover:text-slate-600 p-1"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                                                <input type="checkbox" className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                                                Lembrar-me
                                            </label>
                                            <button type="button" className="text-indigo-600 hover:text-indigo-800">Esqueceu a senha?</button>
                                        </div>

                                        <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black shadow-2xl transition flex items-center justify-center gap-3 uppercase tracking-widest text-sm transform active:scale-[0.98]">
                                            Entrar no Sistema <ArrowRight size={20} className="text-emerald-400" />
                                        </button>

                                        <p className="text-center text-[10px] font-bold text-slate-400 pt-6 border-t uppercase tracking-widest">
                                            Ainda não tem conta? <button onClick={() => setAuthMode('REGISTER')} type="button" className="text-emerald-600 hover:underline">Criar agora</button>
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services / Features */}
            <section id="serviços" className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center space-y-4 mb-20">
                        <h4 className="text-emerald-500 font-black uppercase tracking-[6px] text-xs">O Software Preferido em Angola</h4>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Gestão 360° para o seu Negócio</h2>
                        <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Smartphone className="text-indigo-600" />}
                            bg="bg-indigo-50"
                            title="Mobilidade Total"
                            desc="Aceda aos seus dados em qualquer lugar, via Telemóvel ou Tablet."
                        />
                        <FeatureCard
                            icon={<Zap className="text-emerald-600" />}
                            bg="bg-emerald-50"
                            title="Alta Performance"
                            desc="Sistema cloud ultra-rápido, otimizado para ligações instáveis."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-amber-600" />}
                            bg="bg-amber-50"
                            title="Segurança Máxima"
                            desc="Backups diários e encriptação bancária para total tranquilidade."
                        />
                        <FeatureCard
                            icon={<Globe className="text-blue-600" />}
                            bg="bg-blue-50"
                            title="Foco em Angola"
                            desc="Certificado AGT e adaptado a todas as normas fiscais vigentes."
                        />
                    </div>
                </div>
            </section>

            {/* Informative Section - Evolution */}
            <section id="sobre-nós" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-emerald-100 rounded-[50px] blur-3xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <img
                            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80"
                            className="relative rounded-[50px] shadow-2xl z-10 grayscale hover:grayscale-0 transition duration-700"
                            alt="Equipa"
                        />
                        <div className="absolute -bottom-10 -right-10 bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl z-20 hidden md:block border-8 border-white">
                            <p className="text-4xl font-black text-emerald-400 leading-none">12+</p>
                            <p className="text-xs font-bold uppercase tracking-widest mt-2">Anos de Inovação</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <h4 className="text-emerald-500 font-black uppercase tracking-[6px] text-xs">Evolução & Tecnologia</h4>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-800 leading-tight tracking-tighter">Desenvolvemos o Futuro da Gestão Empresarial.</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            O IMATEC Software nasceu da necessidade de oferecer às empresas angolanas uma ferramenta que não fosse apenas um gerador de faturas, mas um centro de controlo inteligente.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><BarChart3 size={24} /></div>
                                <div><h5 className="font-black text-slate-800 uppercase text-xs mb-1">Vendas & Marketing</h5><p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">CRM integrado e análise de conversão.</p></div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Landmark size={24} /></div>
                                <div><h5 className="font-black text-slate-800 uppercase text-xs mb-1">Finanças & Contas</h5><p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">Controlo de fluxos de caixa e bancos.</p></div>
                            </div>
                        </div>
                        <button className="flex items-center gap-3 text-slate-900 font-black uppercase tracking-widest text-xs hover:gap-5 transition-all">
                            Saiba mais sobre a nossa história <ArrowRight size={18} className="text-emerald-500" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-40 bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
                    <h2 className="text-4xl font-black tracking-tighter">Quem usa, <span className="text-emerald-400">Recomenda.</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <TestimonialCard
                            name="António Silva"
                            role="CEO - Grupo Luanda"
                            text="O IMATEC transformou a forma como gerimos o nosso stock. A precisão é impressionante e o suporte é exemplar."
                        />
                        <TestimonialCard
                            name="Maria Fernandes"
                            role="Dir. Financeira - Imob"
                            text="Finalmente um software que cumpre o que promete. Relatórios mensais em segundos e total conformidade com a AGT."
                        />
                        <TestimonialCard
                            name="Carlos Manuel"
                            role="Gerente - Restaurante Sol"
                            text="Mudar para o IMATEC foi a melhor decisão para o meu restaurante. Simples, intuitivo e muito robusto."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contacto" className="bg-white pt-24 pb-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">IM</div>
                                <span className="font-black uppercase tracking-tighter text-slate-800">IMATE Software</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium italic">"Liderando a transformação digital das empresas em Angola com inteligência e proximidade."</p>
                            <div className="flex gap-4">
                                {['facebook', 'instagram', 'linkedin', 'twitter'].map(social => (
                                    <div key={social} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition cursor-pointer shadow-sm">
                                        <Globe size={18} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest">Links Rápidos</h5>
                            <ul className="space-y-3">
                                {['Início', 'Produtos', 'Preços', 'Sobre Nós', 'FAQ'].map(link => (
                                    <li key={link}><button onClick={() => scrollTo(link.toLowerCase())} className="text-sm text-slate-500 hover:text-emerald-600 transition font-medium">{link}</button></li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest">Contacto Directo</h5>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-sm text-slate-600 font-bold"><Phone size={16} className="text-emerald-500" /> +244 922 123 456</li>
                                <li className="flex items-center gap-3 text-sm text-slate-600 font-bold"><Mail size={16} className="text-emerald-500" /> suporte@imatec.ao</li>
                                <li className="flex items-center gap-3 text-sm text-slate-600 font-bold"><MapPin size={16} className="text-emerald-500" /> Luanda, Angola</li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest">Newsletter</h5>
                            <p className="text-xs text-slate-500 font-medium">Receba novidades e dicas de gestão no seu email.</p>
                            <div className="relative">
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition" placeholder="O seu email..." />
                                <button className="absolute right-2 top-1.5 bg-slate-900 text-white p-1.5 rounded-lg hover:bg-black transition"><ArrowRight size={16} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">© 2026 IMATEC SOFT. Todos os direitos reservados.</p>
                        <div className="flex gap-8">
                            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 transition">Política de Privacidade</button>
                            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 transition">Termos de Uso</button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Overlays for Mobile/Quick Access */}
            {(authMode !== 'NONE') && (
                <div className="fixed inset-0 z-[200] lg:hidden flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-[400px] rounded-[32px] overflow-hidden relative shadow-2xl">
                        <button onClick={() => setAuthMode('NONE')} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition z-[210]">
                            <X size={24} />
                        </button>
                        <div className="h-1 bg-emerald-500"></div>
                        <div className="p-8 max-h-[85vh] overflow-y-auto">
                            {authMode === 'REGISTER' ? (
                                <div className="space-y-6 pt-4">
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Registar Empresa</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase">Passo {registerStep} de 3</p>
                                    {renderRegisterStep()}
                                </div>
                            ) : (
                                <form onSubmit={handleLoginSubmit} className="space-y-6 pt-4">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Aceder à Conta</h2>
                                    <p className="text-slate-400 text-sm font-medium">Benvindo de volta.</p>
                                    <div className="space-y-4 pt-4">
                                        <InputField label="Utilizador" value={loginData.user} onChange={v => setLoginData({ ...loginData, user: v })} placeholder="email@empresa.ao" />
                                        <InputField label="Palavra-passe" type="password" value={loginData.pass} onChange={v => setLoginData({ ...loginData, pass: v })} placeholder="••••••••" />
                                    </div>
                                    <button className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-black shadow-xl transition flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                                        Entrar no Sistema <ArrowRight size={18} className="text-emerald-400" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Components ---

const InputField = ({ label, value, onChange, placeholder, icon, type = 'text' }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
        <div className="relative group">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">{icon}</div>}
            <input
                type={type}
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 ${icon ? 'pl-12' : ''} py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc, bg }: any) => (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 hover:translate-y-[-10px] transition duration-500 group">
        <div className={`p-4 rounded-2xl w-fit mb-6 shadow-inner ${bg} group-hover:scale-110 transition duration-500`}>
            {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </div>
        <h4 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight leading-tight">{title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
);

const TestimonialCard = ({ name, role, text }: any) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px] text-left hover:bg-white/10 transition group">
        <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="fill-emerald-400 text-emerald-400" />)}
        </div>
        <p className="text-lg text-white/80 font-medium italic leading-relaxed mb-8">"{text}"</p>
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-emerald-500/20">
                {name.charAt(0)}
            </div>
            <div>
                <h5 className="font-black text-white uppercase text-xs tracking-widest">{name}</h5>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{role}</p>
            </div>
        </div>
    </div>
);

const Hash = ({ size }: any) => <span style={{ fontSize: size }}>#</span>;

// Copy existing utils if needed or import
const formatCurrency = (val: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val);

export default LandingPage;
