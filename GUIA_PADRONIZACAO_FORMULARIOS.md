# 🎨 GUIA DE PADRONIZAÇÃO DE FORMULÁRIOS - SISTEMA ERP IMATEC

## 📋 VISÃO GERAL

Este documento define o **estilo padrão** para todos os formulários do sistema, baseado no design do formulário **"Definições da Profissão"**.

### ✅ Formulários que seguem este padrão:
- Cadastro de Fornecedor
- Cadastro de Cliente  
- Definições da Profissão
- Configuração de Série
- Cadastro de Armazém
- Cadastro de Caixa
- Cadastro de Banco
- Cadastro de Taxa
- Cadastro de Local de Trabalho
- Cadastro de Utilizador

### ❌ Formulários que NÃO seguem este padrão (design próprio):
- **Novo Documento** (InvoiceForm) - Design específico de fatura
- **Registar Compra** (PurchaseForm) - Design específico de compra
- **Ficha de Funcionário - Edição** (Employees) - Design expandido com seções

---

## 🎯 ESTRUTURA PADRÃO

### Container Principal
```tsx
<div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
    {/* Conteúdo */}
</div>
```

### Card do Formulário
```tsx
<div className="bg-white rounded shadow-2xl border border-slate-300 overflow-hidden">
    {/* Header + Body */}
</div>
```

### Cabeçalho
```tsx
<div className="bg-slate-50 border-b p-4 flex justify-between items-center">
    <h2 className="w-full text-center text-sm font-black text-slate-700 uppercase tracking-widest">
        TÍTULO DO FORMULÁRIO
    </h2>
</div>
```

### Corpo
```tsx
<div className="p-8 space-y-6 bg-white">
    {/* Campos do formulário */}
</div>
```

---

## 🔤 ESTILOS DE CAMPOS

### Label
```tsx
<label className="text-xs font-bold text-slate-700 block mb-1">
    Nome do Campo *
</label>
```

### Input Texto
```tsx
<input
    className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
    placeholder="Digite aqui..."
    value={value}
    onChange={e => setValue(e.target.value)}
/>
```

### Input Número
```tsx
<input
    type="number"
    className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 text-right font-black text-slate-700 pr-4"
    placeholder="00000.00"
    value={value}
    onChange={e => setValue(Number(e.target.value))}
/>
```

### Input Uppercase
```tsx
<input
    className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 uppercase"
    value={value}
    onChange={e => setValue(e.target.value)}
/>
```

### Input Monospace (NIF, IBAN, etc.)
```tsx
<input
    className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-700"
    value={value}
    onChange={e => setValue(e.target.value)}
/>
```

### Select
```tsx
<select
    className="w-full p-3 border border-slate-300 rounded-xl bg-white shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
    value={value}
    onChange={e => setValue(e.target.value)}
>
    <option value="">Selecione...</option>
    <option value="opcao1">Opção 1</option>
</select>
```

### Textarea
```tsx
<textarea
    className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 resize-none"
    rows={4}
    value={value}
    onChange={e => setValue(e.target.value)}
/>
```

### Botão de Lookup/Pesquisa
```tsx
<div
    className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition"
    onClick={handleOpen}
>
    <span className="truncate">{selectedValue || 'Clique para selecionar'}</span>
    <ChevronRight size={16} className="text-slate-400 shrink-0" />
</div>
```

---

## 🔘 BOTÕES

### Botão Principal (Azul)
```tsx
<button
    type="submit"
    disabled={isLoading}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3"
>
    {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Registar'}
</button>
```

### Botão Cancelar
```tsx
<button
    type="button"
    onClick={handleCancel}
    className="w-full text-slate-400 font-bold text-[10px] uppercase mt-4 hover:text-slate-600 transition tracking-widest"
>
    Cancelar
</button>
```

### Botão Secundário
```tsx
<button
    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg py-3 rounded-xl shadow transition transform active:scale-95 flex items-center justify-center gap-3"
>
    Ação Secundária
</button>
```

### Botão Sucesso (Verde)
```tsx
<button
    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3"
>
    Confirmar
</button>
```

### Botão Perigo (Vermelho)
```tsx
<button
    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3"
>
    Apagar
</button>
```

---

## 📐 LAYOUTS DE CAMPOS

### Grid 2 Colunas
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label>Campo 1</label>
        <input />
    </div>
    <div>
        <label>Campo 2</label>
        <input />
    </div>
</div>
```

### Grid 3 Colunas
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>Campo 1</div>
    <div>Campo 2</div>
    <div>Campo 3</div>
</div>
```

### Espaçamento Vertical
```tsx
<div className="space-y-4">
    <div>Campo 1</div>
    <div>Campo 2</div>
</div>
```

### Container de Botões
```tsx
<div className="pt-6">
    <button> /* Botão Principal */ </button>
    <button> /* Botão Cancelar */ </button>
</div>
```

---

## 🎨 CORES PADRÃO

| Elemento | Cor | Classe Tailwind |
|----------|-----|-----------------|
| Fundo do card | Branco | `bg-white` |
| Fundo do header | Cinza claro | `bg-slate-50` |
| Bordas | Cinza médio | `border-slate-300` |
| Texto labels | Cinza escuro | `text-slate-700` |
| Texto inputs | Cinza escuro | `text-slate-700` |
| Botão principal | Azul | `bg-blue-600` |
| Botão hover | Azul escuro | `hover:bg-blue-700` |
| Focus ring | Azul | `focus:ring-blue-500` |
| Cancelar | Cinza | `text-slate-400` |

---

## 📦 TEMPLATE COMPLETO

```tsx
const renderForm = () => (
    <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
                <h2 className="w-full text-center text-sm font-black text-slate-700 uppercase tracking-widest">
                    Título do Formulário
                </h2>
            </div>
            <div className="p-8 space-y-6 bg-white">
                
                {/* Campo de Texto */}
                <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Campo *</label>
                    <input
                        className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                        placeholder="Digite aqui..."
                        value={formData.campo || ''}
                        onChange={e => setFormData({...formData, campo: e.target.value})}
                    />
                </div>

                {/* Campos em Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Campo 1</label>
                        <input className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Campo 2</label>
                        <input className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700" />
                    </div>
                </div>

                {/* Select */}
                <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Seleção</label>
                    <select className="w-full p-3 border border-slate-300 rounded-xl bg-white shadow-inner outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer">
                        <option value="">Selecione...</option>
                        <option value="1">Opção 1</option>
                        <option value="2">Opção 2</option>
                    </select>
                </div>

                {/* Botões */}
                <div className="pt-6">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3"
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Registar'}
                    </button>
                    <button
                        onClick={() => setView('LIST')}
                        className="w-full text-slate-400 font-bold text-[10px] uppercase mt-4 hover:text-slate-600 transition tracking-widest"
                    >
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    </div>
);
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

Ao criar ou atualizar um formulário, verifique:

- [ ] Container com `max-w-xl mx-auto animate-in zoom-in-95 duration-300`
- [ ] Card com `bg-white rounded shadow-2xl border border-slate-300 overflow-hidden`
- [ ] Header com `bg-slate-50 border-b p-4`
- [ ] Título com `text-sm font-black text-slate-700 uppercase tracking-widest`
- [ ] Corpo com `p-8 space-y-6 bg-white`
- [ ] Labels com `text-xs font-bold text-slate-700 block mb-1`
- [ ] Inputs com `border border-slate-300 rounded-xl ... focus:ring-1 focus:ring-blue-500`
- [ ] Botão principal com `bg-blue-600 ... text-lg py-3 rounded-xl`
- [ ] Botão cancelar com `text-slate-400 ... text-[10px] uppercase`

---

## 📝 FORMULÁRIOS ATUALIZADOS

| Componente | Status | Arquivo |
|------------|--------|---------|
| Definições da Profissão | ✅ Padrão | `Employees.tsx` |
| Cadastro de Fornecedor | ✅ Atualizado | `SupplierList.tsx` |
| Cadastro de Cliente | 🔄 Pendente | `ClientList.tsx` |
| Configuração de Série | 🔄 Pendente | `Settings.tsx` |
| Cadastro de Armazém | 🔄 Pendente | `StockManager.tsx` |
| Cadastro de Caixa | 🔄 Pendente | `CashManager.tsx` |
| Cadastro de Banco | 🔄 Pendente | `Settings.tsx` |
| Cadastro de Taxa | 🔄 Pendente | `TaxManager.tsx` |
| Cadastro de Local Trabalho | 🔄 Pendente | `Settings.tsx` |

---

**Data:** 29/01/2026
**Versão:** 1.0.0
**Arquivo de Estilos:** `components/FormStyles.ts`
