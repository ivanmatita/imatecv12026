/**
 * GUIA DE ESTILO PADRÃO - FORMULÁRIOS DO SISTEMA
 * 
 * Este arquivo contém as classes CSS padrão para todos os formulários do sistema,
 * baseado no estilo do formulário "Definições da Profissão".
 * 
 * USO: Importe os estilos e aplique nos componentes de formulário.
 */

// ============================================
// ESTILOS PADRÃO PARA FORMULÁRIOS
// ============================================

export const FormStyles = {
    // Container principal do formulário
    container: "max-w-xl mx-auto animate-in zoom-in-95 duration-300",

    // Card do formulário
    card: "bg-white rounded shadow-2xl border border-slate-300 overflow-hidden",

    // Cabeçalho do formulário
    header: "bg-slate-50 border-b p-4 flex justify-between items-center",
    headerTitle: "w-full text-center text-sm font-black text-slate-700 uppercase tracking-widest",

    // Corpo do formulário
    body: "p-8 space-y-6 bg-white",

    // Labels
    label: "text-xs font-bold text-slate-700 block mb-1",
    labelRequired: "text-xs font-bold text-slate-700 block mb-1 after:content-['*'] after:text-red-500 after:ml-1",

    // Inputs - ESTILO PADRÃO DO FORMULÁRIO DE PROFISSÃO
    input: "w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700",
    inputNumber: "w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 text-right font-black text-slate-700 pr-4",
    inputUppercase: "w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 uppercase",

    // Selects
    select: "w-full p-3 border border-slate-300 rounded-xl bg-white shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer",

    // Textarea
    textarea: "w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 resize-none",

    // Botão de lookup/pesquisa
    lookupButton: "w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition",

    // Botões de ação - PADRÃO AZUL
    buttonPrimary: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3",
    buttonSecondary: "w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg py-3 rounded-xl shadow transition transform active:scale-95 flex items-center justify-center gap-3",
    buttonCancel: "w-full text-slate-400 font-bold text-[10px] uppercase mt-4 hover:text-slate-600 transition tracking-widest",
    buttonDanger: "w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3",
    buttonSuccess: "w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3",

    // Container de botões
    buttonContainer: "pt-6 space-y-2",

    // Grupos de campos
    fieldGroup: "space-y-4",
    fieldGrid2: "grid grid-cols-1 md:grid-cols-2 gap-4",
    fieldGrid3: "grid grid-cols-1 md:grid-cols-3 gap-4",

    // Separadores
    divider: "border-t border-slate-200 my-6",

    // Indicador de campo obrigatório
    requiredDot: "w-2 h-2 rounded-full bg-red-500 inline-block mr-1",

    // Estados
    disabled: "opacity-50 cursor-not-allowed",
    loading: "animate-pulse",

    // Erros
    errorInput: "border-red-500 focus:ring-red-500",
    errorText: "text-xs text-red-500 mt-1"
};

// ============================================
// ESTILOS DE MODAL PADRONIZADO
// ============================================

export const ModalStyles = {
    // Overlay de fundo
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300",

    // Container do modal - TAMANHO PADRÃO (equivalente ao Definições da Profissão)
    container: "bg-white rounded shadow-2xl border border-slate-300 overflow-hidden w-full max-w-xl animate-in zoom-in-95 duration-300",
    containerLarge: "bg-white rounded shadow-2xl border border-slate-300 overflow-hidden w-full max-w-2xl animate-in zoom-in-95 duration-300",

    // Cabeçalho do modal - FUNDO SLATE-50 como o original
    header: "bg-slate-50 border-b p-4 flex justify-between items-center",
    headerTitle: "w-full text-center text-sm font-black text-slate-700 uppercase tracking-widest",
    headerCloseButton: "p-1 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600",

    // Corpo do modal
    body: "p-8 space-y-6 bg-white",

    // Footer do modal (botões)
    footer: "pt-6"
};

// ============================================
// ESTILOS PARA FICHA DE FUNCIONÁRIO
// ============================================

export const EmployeeFormStyles = {
    // Seções com setas/accordion - FUNDO UNIFORME
    sectionHeader: "bg-slate-100 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-200 transition group",
    sectionHeaderActive: "bg-blue-50 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-blue-100 transition group border border-blue-200",
    sectionTitle: "font-black text-sm text-slate-700 uppercase tracking-wider flex items-center gap-3",
    sectionArrow: "text-slate-400 group-hover:text-slate-600 transition",
    sectionContent: "bg-white p-6 border border-slate-200 rounded-b-xl -mt-2 space-y-4"
};

// ============================================
// COMPONENTES DE FORMULÁRIO REUTILIZÁVEIS
// ============================================

export const FormComponents = {
    /**
     * Estrutura básica de um formulário padrão
     */
    template: `
        <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded shadow-2xl border border-slate-300 overflow-hidden">
                <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
                    <h2 className="w-full text-center text-sm font-black text-slate-700 uppercase tracking-widest">
                        TÍTULO DO FORMULÁRIO
                    </h2>
                </div>
                <div className="p-8 space-y-6 bg-white">
                    
                    {/* CAMPOS DO FORMULÁRIO */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Campo *</label>
                        <input
                            className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                            placeholder="Digite aqui..."
                            value={value}
                            onChange={e => setValue(e.target.value)}
                        />
                    </div>
                    
                    {/* BOTÕES */}
                    <div className="pt-6">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3">
                            Registar
                        </button>
                        <button className="w-full text-slate-400 font-bold text-[10px] uppercase mt-4 hover:text-slate-600 transition tracking-widest">
                            Cancelar
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    `
};

// ============================================
// HELPER: Aplicar classe de erro se houver
// ============================================
export const getInputClass = (hasError: boolean = false) => {
    return hasError
        ? `${FormStyles.input} ${FormStyles.errorInput}`
        : FormStyles.input;
};

// ============================================
// HELPER: Combinar classes
// ============================================
export const cx = (...classes: (string | undefined | false)[]) => {
    return classes.filter(Boolean).join(' ');
};

export default FormStyles;

