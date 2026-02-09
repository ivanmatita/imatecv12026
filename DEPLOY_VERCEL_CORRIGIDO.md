# 🚀 GUIA DE DEPLOY NA VERCEL - CORRIGIDO

## ✅ PROBLEMA RESOLVIDO:

**Erro anterior:**
```
A variável de ambiente "VITE_SUPABASE_URL" faz referência ao segredo "vite_supabase_url", que não existe
```

**Solução:**
- ✅ `vercel.json` corrigido
- ✅ Variáveis de ambiente devem ser configuradas no painel da Vercel

---

## 📋 PASSO A PASSO COMPLETO:

### 1️⃣ **Fazer Push para GitHub**

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Sistema completo - Pronto para deploy na Vercel"

# Fazer push
git branch -M main
git push -u origin main
```

---

### 2️⃣ **Importar na Vercel**

1. **Acesse:** https://vercel.com
2. **Login** com sua conta GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório: **`imatecv12026`**
5. Clique em **"Import"**

---

### 3️⃣ **Configurar Projeto**

#### **Framework Preset:**
- Selecione: **Vite**

#### **Build Settings:**
- Build Command: `npm run build` (já preenchido)
- Output Directory: `dist` (já preenchido)
- Install Command: `npm install` (já preenchido)

✅ **Não altere nada aqui!**

---

### 4️⃣ **CONFIGURAR VARIÁVEIS DE AMBIENTE** ⚠️ IMPORTANTE!

Clique em **"Environment Variables"** e adicione:

#### **Variável 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://alqttoqjftqckojusayf.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### **Variável 2:**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscXR0b3FqZnRxY2tvanVzYXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzE1MjYsImV4cCI6MjA4NTIwNzUyNn0.wY9f9-fVJBdLWfvaDmdRMu7E0cRJWcwXzEakNjlpWGo`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### **Variável 3 (Opcional):**
- **Name:** `VITE_GEMINI_API_KEY`
- **Value:** `sua-chave-do-gemini` (ou deixe em branco)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### **Variável 4:**
- **Name:** `VITE_DEFAULT_EMPRESA_ID`
- **Value:** `00000000-0000-0000-0000-000000000001`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 5️⃣ **Deploy**

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. ✅ **Deploy concluído!**

---

## 🎯 APÓS O DEPLOY:

### **Verificar o Site:**

1. Clique no link gerado (ex: `https://imatecv12026.vercel.app`)
2. Abra o console (F12)
3. Verifique se aparece:
   ```
   ✅ Supabase Client inicializado
   📊 Banco de dados: imatecv12026
   ```

### **Testar Funcionalidades:**

- ✅ Listar clientes
- ✅ Listar fornecedores
- ✅ Criar fatura
- ✅ Ver produtos

---

## 🔧 CONFIGURAÇÕES ADICIONAIS (OPCIONAL):

### **Configurar Domínio Personalizado:**

1. Na Vercel, vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

### **Configurar CORS no Supabase:**

1. Acesse: https://supabase.com/dashboard/project/alqttoqjftqckojusayf
2. Vá em **Settings → API**
3. Em **Site URL**, adicione:
   ```
   https://imatecv12026.vercel.app
   ```
4. Em **Additional Redirect URLs**, adicione:
   ```
   https://imatecv12026.vercel.app/*
   ```

---

## 📊 RESUMO DAS VARIÁVEIS:

| Variável | Valor | Obrigatória |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://alqttoqjftqckojusayf.supabase.co` | ✅ SIM |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | ✅ SIM |
| `VITE_GEMINI_API_KEY` | Sua chave | ❌ NÃO |
| `VITE_DEFAULT_EMPRESA_ID` | `00000000-0000-0000-0000-000000000001` | ✅ SIM |

---

## 🆘 TROUBLESHOOTING:

### **Problema: Build falha**
**Solução:**
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs de build na Vercel

### **Problema: Página em branco**
**Solução:**
- Abra o console (F12)
- Verifique erros
- Verifique se as variáveis de ambiente estão corretas

### **Problema: Erro de CORS**
**Solução:**
- Configure a URL da Vercel no Supabase (Settings → API)

### **Problema: Dados não aparecem**
**Solução:**
- Verifique se o Supabase está acessível
- Verifique as políticas RLS
- Verifique os logs no console

---

## ✅ CHECKLIST DE DEPLOY:

- [ ] Código enviado para GitHub
- [ ] Projeto importado na Vercel
- [ ] Framework Preset: Vite
- [ ] Variável `VITE_SUPABASE_URL` configurada
- [ ] Variável `VITE_SUPABASE_ANON_KEY` configurada
- [ ] Variável `VITE_DEFAULT_EMPRESA_ID` configurada
- [ ] Deploy realizado
- [ ] Site acessível
- [ ] Console sem erros
- [ ] Funcionalidades testadas

---

## 🎊 DEPLOY COMPLETO!

**URL do seu site:** `https://imatecv12026.vercel.app`

**Próximos passos:**
1. ✅ Testar todas as funcionalidades
2. ✅ Configurar domínio personalizado (opcional)
3. ✅ Configurar CORS no Supabase
4. ✅ Compartilhar com a equipe!

---

**Desenvolvido por:** IMATEC Soft V.2.0  
**Versão:** 2.0.0  
**Data:** 2026-01-28
