# 🚀 GUIA RÁPIDO - CI/CD GitHub → Vercel

## ⚡ Configuração em 5 Minutos

### 📋 Pré-requisitos
- ✅ Conta na Vercel (https://vercel.com)
- ✅ Repositório no GitHub: `ivanmatita/imatecv12026`
- ✅ Acesso de administrador ao repositório

---

## 🎯 PASSO 1: Conectar na Vercel (2 min)

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione: **`ivanmatita/imatecv12026`**
4. Configurações:
   - Framework: **Vite**
   - Build Command: **`npm run build`**
   - Output Directory: **`dist`**
5. ✅ Marque: **"Automatically deploy on push"**
6. Clique em **"Deploy"**

---

## 🔑 PASSO 2: Obter Credenciais (2 min)

### Token da Vercel
1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome: `GitHub Actions`
4. **COPIE O TOKEN** ⚠️ (só aparece uma vez!)

### IDs do Projeto
1. No projeto na Vercel → **Settings** → **General**
2. Copie:
   - **Project ID**
   - **Organization ID** (Settings da organização)

---

## 🔐 PASSO 3: Configurar Secrets no GitHub (1 min)

1. Acesse: https://github.com/ivanmatita/imatecv12026/settings/secrets/actions
2. Clique em **"New repository secret"** 3 vezes:

| Nome | Valor |
|------|-------|
| `VERCEL_TOKEN` | Token copiado no passo 2 |
| `VERCEL_ORG_ID` | Organization ID |
| `VERCEL_PROJECT_ID` | Project ID |

---

## ✅ PASSO 4: Testar (30 seg)

```bash
# Fazer commit dos arquivos de CI/CD
git add .
git commit -m "ci: Configurar CI/CD GitHub → Vercel"
git push origin main
```

**Verificar**:
- GitHub Actions: https://github.com/ivanmatita/imatecv12026/actions
- Vercel: https://vercel.com/dashboard

---

## 🎉 Pronto!

Agora **QUALQUER PUSH** para o GitHub será **AUTOMATICAMENTE DEPLOYADO** na Vercel!

```bash
# Workflow automático:
git push → GitHub Actions → Build → Vercel → Site Atualizado! 🚀
```

---

## 📚 Documentação Completa

Para detalhes e troubleshooting, consulte:
- **`CONFIGURACAO_CI_CD_VERCEL.md`** (documentação completa)

---

## 🆘 Problemas?

### ❌ Workflow não executa
- Verifique se os secrets foram adicionados corretamente
- Verifique em: Settings → Actions → General (deve estar habilitado)

### ❌ Build falha
- Execute `npm run build` localmente
- Verifique os logs no GitHub Actions

### ❌ Deploy falha
- Verifique se os IDs estão corretos
- Verifique os logs na Vercel Dashboard

---

**✅ Tudo configurado! Agora é só trabalhar normalmente e o deploy é automático!** 🎯
