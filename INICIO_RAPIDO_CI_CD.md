# 🚀 CI/CD GitHub → Vercel - INÍCIO RÁPIDO

## ⚡ 3 Passos para Ativar o Deploy Automático

```
┌─────────────────────────────────────────────────────────────┐
│  📦 IMPLEMENTAÇÃO CONCLUÍDA                                 │
│  ✅ Arquivos criados e enviados para GitHub                │
│  ⏳ Aguardando configuração manual (3 passos)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 PASSO 1: Conectar na Vercel (2 min)

### 🔗 Link Direto
👉 **https://vercel.com/new**

### ✅ Checklist
1. [ ] Clicar em **"Import Git Repository"**
2. [ ] Selecionar: **`ivanmatita/imatecv12026`**
3. [ ] Framework: **Vite**
4. [ ] Build Command: **`npm run build`**
5. [ ] Output Directory: **`dist`**
6. [ ] ✅ Marcar: **"Automatically deploy on push"**
7. [ ] Branch: **`master`**
8. [ ] Clicar em **"Deploy"**

---

## 🔑 PASSO 2: Copiar 3 Credenciais (2 min)

### 📋 Credencial 1: VERCEL_TOKEN
👉 **https://vercel.com/account/tokens**
1. [ ] Clicar em **"Create Token"**
2. [ ] Nome: `GitHub Actions`
3. [ ] **COPIAR O TOKEN** ⚠️ (só aparece uma vez!)

### 📋 Credencial 2: VERCEL_ORG_ID
👉 **Vercel → Nome da Organização → Settings**
1. [ ] Copiar **"Organization ID"**

### 📋 Credencial 3: VERCEL_PROJECT_ID
👉 **Vercel → Projeto → Settings → General**
1. [ ] Copiar **"Project ID"**

---

## 🔐 PASSO 3: Adicionar Secrets no GitHub (1 min)

### 🔗 Link Direto
👉 **https://github.com/ivanmatita/imatecv12026/settings/secrets/actions**

### ✅ Adicionar 3 Secrets
Clicar em **"New repository secret"** 3 vezes:

| Nome | Valor |
|------|-------|
| `VERCEL_TOKEN` | Token do Passo 2 (Credencial 1) |
| `VERCEL_ORG_ID` | Organization ID do Passo 2 (Credencial 2) |
| `VERCEL_PROJECT_ID` | Project ID do Passo 2 (Credencial 3) |

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  IMPORTANTE: Sem esses 3 secrets, o CI/CD NÃO funciona! │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ PRONTO! Testar Agora

Após completar os 3 passos, faça um teste:

```bash
# Fazer uma pequena alteração
echo "# Teste CI/CD" >> README.md

# Enviar para GitHub
git add README.md
git commit -m "test: Testar CI/CD"
git push origin master
```

### 🔍 Verificar
1. **GitHub Actions**: https://github.com/ivanmatita/imatecv12026/actions
   - ✅ Deve aparecer workflow em execução
   
2. **Vercel**: https://vercel.com/dashboard
   - ✅ Deve aparecer novo deployment

3. **Site**: Acessar URL do projeto
   - ✅ Deve estar atualizado em ~3 minutos

---

## 🎉 Depois de Configurado

### ✅ Workflow Automático
```
git push → GitHub Actions → Build → Vercel → Site Atualizado! 🚀
```

### ✅ Sem Intervenção Manual
- Qualquer push → Deploy automático
- Pull Request → Preview deploy
- Tudo automático! 🎯

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

| Arquivo | Descrição |
|---------|-----------|
| **GUIA_RAPIDO_CI_CD.md** | Guia rápido (5 min) |
| **CONFIGURACAO_CI_CD_VERCEL.md** | Documentação completa |
| **RESUMO_CI_CD_IMPLEMENTACAO.md** | Status e troubleshooting |

---

## 🆘 Problemas?

### ❌ Workflow não executa
- Verifique se os 3 secrets foram adicionados
- Verifique em: Settings → Actions → General (deve estar habilitado)

### ❌ Build falha
- Execute `npm run build` localmente
- Corrija erros e faça novo push

### ❌ Deploy falha
- Verifique se o projeto está conectado na Vercel
- Verifique se os IDs estão corretos

---

## 📊 Arquivos Implementados

```
✅ .github/workflows/deploy.yml          # Workflow GitHub Actions
✅ .github/workflows/README.md           # Documentação workflow
✅ vercel.json                            # Configuração Vercel (atualizado)
✅ .gitignore                             # Atualizado (.vercel)
✅ CONFIGURACAO_CI_CD_VERCEL.md          # Documentação completa
✅ GUIA_RAPIDO_CI_CD.md                  # Guia rápido
✅ RESUMO_CI_CD_IMPLEMENTACAO.md         # Resumo executivo
✅ INICIO_RAPIDO_CI_CD.md                # Este arquivo
```

---

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 PRÓXIMA AÇÃO: Completar os 3 passos acima              │
│  ⏱️  Tempo estimado: 5 minutos                             │
│  🚀 Resultado: Deploy 100% automático!                     │
└─────────────────────────────────────────────────────────────┘
```

**✅ Implementação concluída!**
**⏳ Aguardando configuração manual dos 3 passos.**
**🎯 Após configuração: Deploy automático em cada push!**
