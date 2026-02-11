# 🚀 Configuração CI/CD GitHub → Vercel

## ✅ Status da Implementação

- ✅ `vercel.json` configurado
- ✅ Workflow GitHub Actions criado (`.github/workflows/deploy.yml`)
- ⏳ **Pendente**: Configurar secrets no GitHub
- ⏳ **Pendente**: Conectar repositório na Vercel

---

## 📋 PASSO 1: Conectar Repositório à Vercel

### 1.1 Acessar Vercel Dashboard
1. Acesse: https://vercel.com/dashboard
2. Clique em **"Add New Project"** ou **"Import Project"**

### 1.2 Importar do GitHub
1. Selecione **"Import Git Repository"**
2. Escolha o repositório: **`ivanmatita/imatecv12026`**
3. Clique em **"Import"**

### 1.3 Configurar Build Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 1.4 Ativar Deploy Automático
- ✅ Marque: **"Automatically deploy on push"**
- ✅ Branch principal: **`main`** (ou `master`)
- ✅ Marque: **"Enable Preview Deployments for Pull Requests"**

### 1.5 Deploy Inicial
- Clique em **"Deploy"**
- Aguarde o primeiro deploy completar

---

## 📋 PASSO 2: Obter Credenciais da Vercel

### 2.1 Obter VERCEL_TOKEN
1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome sugerido: `GitHub Actions CI/CD`
4. Scope: **Full Account**
5. Expiration: **No Expiration** (ou conforme preferência)
6. Clique em **"Create"**
7. **COPIE O TOKEN** (só aparece uma vez!)

### 2.2 Obter VERCEL_ORG_ID e VERCEL_PROJECT_ID

#### Método 1: Via Dashboard (Mais Fácil)
1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **General**
3. Role até **"Project ID"** → Copie o ID
4. Para Organization ID:
   - Clique no nome da sua organização (canto superior esquerdo)
   - Vá em **Settings**
   - Copie o **"Organization ID"**

#### Método 2: Via CLI (Alternativo)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# No diretório do projeto
vercel link

# Os IDs estarão em .vercel/project.json
```

---

## 📋 PASSO 3: Configurar Secrets no GitHub

### 3.1 Acessar Configurações do Repositório
1. Acesse: https://github.com/ivanmatita/imatecv12026
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**

### 3.2 Adicionar os 3 Secrets

#### Secret 1: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Secret: [Cole o token obtido no passo 2.1]
```

#### Secret 2: VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Secret: [Cole o Organization ID obtido no passo 2.2]
```

#### Secret 3: VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Secret: [Cole o Project ID obtido no passo 2.2]
```

### 3.3 Verificar Secrets
Após adicionar, você deve ver 3 secrets listados:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID`

---

## 📋 PASSO 4: Testar Deploy Automático

### 4.1 Fazer uma Alteração de Teste
```bash
# Fazer uma pequena alteração (ex: adicionar comentário em README.md)
echo "# Teste de CI/CD" >> README.md

# Commit e push
git add .
git commit -m "test: Verificar CI/CD automático"
git push origin main
```

### 4.2 Verificar Execução
1. **GitHub Actions**:
   - Acesse: https://github.com/ivanmatita/imatecv12026/actions
   - Você deve ver o workflow **"Deploy to Vercel"** em execução
   - Status deve ficar verde ✅

2. **Vercel Dashboard**:
   - Acesse: https://vercel.com/dashboard
   - Você deve ver um novo deployment em andamento
   - Status deve mudar para **"Ready"** em alguns minutos

### 4.3 Verificar Deploy
- Acesse a URL do projeto na Vercel
- Verifique se as alterações foram aplicadas

---

## 🔄 Como Funciona o CI/CD

### Deploy Automático (Push para main/master)
```
1. Você faz push para GitHub (branch main/master)
   ↓
2. GitHub Actions detecta o push
   ↓
3. Workflow executa:
   - Checkout do código
   - Instala Node.js 20
   - Instala dependências (npm ci)
   - Build do projeto (npm run build)
   - Deploy para Vercel (produção)
   ↓
4. Vercel publica a nova versão
   ↓
5. Site atualizado automaticamente! 🎉
```

### Preview Deploys (Pull Requests)
```
1. Você cria um Pull Request
   ↓
2. GitHub Actions detecta o PR
   ↓
3. Workflow executa build e deploy de preview
   ↓
4. Vercel cria URL temporária para testar
   ↓
5. Você pode revisar antes de fazer merge
```

---

## 📊 Monitoramento

### GitHub Actions
- **URL**: https://github.com/ivanmatita/imatecv12026/actions
- **Logs**: Clique em qualquer workflow para ver logs detalhados
- **Status**: Badge verde ✅ = sucesso | vermelho ❌ = erro

### Vercel Dashboard
- **URL**: https://vercel.com/dashboard
- **Deployments**: Lista todos os deploys
- **Logs**: Clique em um deploy para ver logs
- **Analytics**: Monitore performance e erros

---

## 🛠️ Troubleshooting

### ❌ Erro: "VERCEL_TOKEN is not set"
**Solução**: Verifique se o secret `VERCEL_TOKEN` foi adicionado corretamente no GitHub

### ❌ Erro: "Build failed"
**Solução**: 
1. Verifique os logs no GitHub Actions
2. Execute `npm run build` localmente para reproduzir o erro
3. Corrija o erro e faça novo push

### ❌ Erro: "Deployment failed"
**Solução**:
1. Verifique se `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estão corretos
2. Verifique se o projeto está conectado na Vercel
3. Verifique logs na Vercel Dashboard

### ❌ Deploy não inicia automaticamente
**Solução**:
1. Verifique se o workflow está habilitado em: Settings → Actions → General
2. Verifique se o branch correto está configurado no workflow
3. Verifique se há erros de sintaxe no arquivo `.github/workflows/deploy.yml`

---

## 📝 Arquivos Criados/Modificados

### ✅ Arquivos Implementados
```
imatecv12026/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ✅ Workflow GitHub Actions
├── vercel.json                  # ✅ Atualizado
└── CONFIGURACAO_CI_CD_VERCEL.md # ✅ Esta documentação
```

### 📄 vercel.json
- ✅ Configurado para Vite
- ✅ Build automático habilitado
- ✅ Roteamento SPA configurado
- ✅ Integração GitHub habilitada

### 📄 .github/workflows/deploy.yml
- ✅ Deploy automático em push (main/master)
- ✅ Preview deploy em Pull Requests
- ✅ Build otimizado com cache
- ✅ Node.js 20 configurado

---

## ✅ Checklist Final

Antes de considerar concluído, verifique:

- [ ] Repositório conectado na Vercel
- [ ] Branch correto selecionado (main/master)
- [ ] Deploy automático ativado na Vercel
- [ ] `VERCEL_TOKEN` adicionado aos secrets do GitHub
- [ ] `VERCEL_ORG_ID` adicionado aos secrets do GitHub
- [ ] `VERCEL_PROJECT_ID` adicionado aos secrets do GitHub
- [ ] Teste de push realizado
- [ ] Workflow executado com sucesso (✅ verde)
- [ ] Deploy apareceu na Vercel
- [ ] Site atualizado com as mudanças

---

## 🎯 Próximos Passos

Após configurar tudo:

1. **Trabalhe normalmente**:
   ```bash
   # Faça suas alterações
   git add .
   git commit -m "feat: Nova funcionalidade"
   git push origin main
   ```

2. **Aguarde o deploy automático**:
   - GitHub Actions fará o build
   - Vercel publicará automaticamente
   - Sem intervenção manual necessária! 🎉

3. **Monitore** (opcional):
   - GitHub Actions: https://github.com/ivanmatita/imatecv12026/actions
   - Vercel: https://vercel.com/dashboard

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no GitHub Actions
2. Verifique os logs na Vercel Dashboard
3. Consulte a seção **Troubleshooting** acima
4. Verifique a documentação oficial:
   - GitHub Actions: https://docs.github.com/actions
   - Vercel: https://vercel.com/docs

---

**✅ Configuração CI/CD Completa!**

Agora qualquer push para o GitHub será automaticamente deployado na Vercel! 🚀
