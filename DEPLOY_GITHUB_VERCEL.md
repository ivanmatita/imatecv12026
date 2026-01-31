# 🚀 GUIA DE DEPLOY - GitHub e Vercel

## 📋 PRÉ-REQUISITOS

- ✅ Conta no GitHub
- ✅ Conta na Vercel
- ✅ Projeto Supabase configurado
- ✅ Git instalado

---

## 🔧 PASSO 1: Preparar o Projeto

### 1.1 Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` está configurado:

```env
VITE_SUPABASE_URL=https://alqttoqjftqckojusayf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_GEMINI_API_KEY=sua-chave (opcional)
VITE_DEFAULT_EMPRESA_ID=00000000-0000-0000-0000-000000000001
```

### 1.2 Verificar .gitignore

O arquivo `.gitignore` deve conter:
```
*.local
node_modules
dist
```

✅ **Importante:** O `.env.local` NÃO será enviado ao GitHub (está no .gitignore)

---

## 📤 PASSO 2: Enviar para GitHub

### 2.1 Inicializar Git (se ainda não foi feito)

```bash
cd "c:\Users\Ivan\Downloads\CRM SITE\soft-imatec-1"
git init
```

### 2.2 Adicionar todos os arquivos

```bash
git add .
```

### 2.3 Fazer o primeiro commit

```bash
git commit -m "Initial commit - IMATEC V.2.0"
```

### 2.4 Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `soft-imatec-1` ou `imatec-erp`
3. Descrição: "Sistema ERP Multi-Empresa - IMATEC V.2.0"
4. Visibilidade: **Private** (recomendado) ou Public
5. **NÃO** marque "Initialize with README"
6. Clique em "Create repository"

### 2.5 Conectar ao repositório remoto

Copie os comandos que o GitHub mostra e execute:

```bash
git remote add origin https://github.com/SEU-USUARIO/soft-imatec-1.git
git branch -M main
git push -u origin main
```

✅ **Pronto!** Código enviado para o GitHub!

---

## 🌐 PASSO 3: Deploy na Vercel

### 3.1 Acessar Vercel

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em "Add New Project"

### 3.2 Importar Repositório

1. Selecione o repositório `soft-imatec-1`
2. Clique em "Import"

### 3.3 Configurar Projeto

**Framework Preset:** Vite  
**Root Directory:** ./  
**Build Command:** `npm run build`  
**Output Directory:** `dist`

### 3.4 Configurar Variáveis de Ambiente

Clique em "Environment Variables" e adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://alqttoqjftqckojusayf.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_GEMINI_API_KEY` | `sua-chave` (opcional) |
| `VITE_DEFAULT_EMPRESA_ID` | `00000000-0000-0000-0000-000000000001` |

**Importante:** Marque todas as variáveis para **Production**, **Preview** e **Development**

### 3.5 Deploy

1. Clique em "Deploy"
2. Aguarde o build (1-3 minutos)
3. ✅ **Deploy concluído!**

Sua URL será algo como: `https://soft-imatec-1.vercel.app`

---

## 🔄 PASSO 4: Atualizações Futuras

### 4.1 Fazer alterações no código

```bash
# Edite os arquivos necessários
```

### 4.2 Commit e Push

```bash
git add .
git commit -m "Descrição das alterações"
git push
```

### 4.3 Deploy Automático

✅ A Vercel detecta automaticamente o push e faz o deploy!

---

## 🛠️ COMANDOS ÚTEIS

### Verificar status do Git
```bash
git status
```

### Ver histórico de commits
```bash
git log --oneline
```

### Criar nova branch
```bash
git checkout -b nome-da-branch
```

### Voltar para branch main
```bash
git checkout main
```

### Atualizar do GitHub
```bash
git pull
```

---

## 🔒 SEGURANÇA

### ✅ O que ESTÁ no GitHub:
- Código fonte
- `.env.example` (exemplo sem credenciais)
- Documentação
- Configurações

### ❌ O que NÃO está no GitHub:
- `.env.local` (credenciais reais)
- `node_modules`
- `dist`
- Arquivos temporários

---

## 📊 VERIFICAR DEPLOY

### 1. Acessar URL da Vercel
```
https://seu-projeto.vercel.app
```

### 2. Verificar Console (F12)
```
✅ Supabase Client inicializado
✅ Backend: Conexão com Supabase estabelecida
✅ Sistema: IMATEC V.2.0 inicializado com sucesso!
```

### 3. Testar Funcionalidades
- ✅ Login/Autenticação
- ✅ Listar clientes
- ✅ Criar cliente
- ✅ Listar fornecedores
- ✅ Criar fatura

---

## 🆘 TROUBLESHOOTING

### Problema: Build falha na Vercel
**Solução:** Verifique se todas as variáveis de ambiente estão configuradas

### Problema: Página em branco após deploy
**Solução:** 
1. Verifique o console (F12) para erros
2. Verifique se as variáveis de ambiente estão corretas
3. Verifique se o Supabase está acessível

### Problema: Erro de CORS
**Solução:** Configure as URLs permitidas no Supabase:
1. Acesse Supabase Dashboard
2. Settings → API
3. Adicione a URL da Vercel em "Site URL"

### Problema: Dados não aparecem
**Solução:**
1. Verifique se as tabelas existem no Supabase
2. Verifique as políticas RLS
3. Verifique os logs no console

---

## 📝 CHECKLIST DE DEPLOY

- [ ] `.env.local` configurado localmente
- [ ] `.env.example` criado (sem credenciais)
- [ ] `.gitignore` configurado
- [ ] Código testado localmente
- [ ] Git inicializado
- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy realizado
- [ ] Site testado em produção
- [ ] Funcionalidades verificadas

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Configurar domínio personalizado na Vercel
2. ✅ Configurar CI/CD para testes automáticos
3. ✅ Adicionar monitoramento de erros (Sentry)
4. ✅ Configurar backups automáticos do Supabase
5. ✅ Adicionar analytics (Google Analytics)

---

## 📞 SUPORTE

**GitHub:** https://github.com/SEU-USUARIO/soft-imatec-1  
**Vercel:** https://vercel.com/dashboard  
**Supabase:** https://supabase.com/dashboard

---

**🎊 DEPLOY COMPLETO E FUNCIONAL! 🎊**

**Sistema:** IMATEC V.2.0  
**GitHub:** ✅ Configurado  
**Vercel:** ✅ Pronto para deploy  
**Data:** 2026-01-28
