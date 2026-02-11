# .github/workflows/

Este diretório contém os workflows do GitHub Actions para CI/CD automático.

## 📄 Workflows Disponíveis

### `deploy.yml` - Deploy Automático para Vercel

**Quando executa:**
- ✅ Push para branch `main` ou `master` → Deploy de produção
- ✅ Pull Request → Deploy de preview

**O que faz:**
1. Checkout do código
2. Instala Node.js 20
3. Instala dependências (`npm ci`)
4. Build do projeto (`npm run build`)
5. Deploy para Vercel

**Secrets necessários:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Configurar secrets:**
https://github.com/ivanmatita/imatecv12026/settings/secrets/actions

---

## 📚 Documentação

Para instruções completas de configuração, consulte:
- **`GUIA_RAPIDO_CI_CD.md`** - Configuração em 5 minutos
- **`CONFIGURACAO_CI_CD_VERCEL.md`** - Documentação completa

---

## 🔍 Monitorar Workflows

Acesse: https://github.com/ivanmatita/imatecv12026/actions

- ✅ Verde = Sucesso
- ❌ Vermelho = Erro (clique para ver logs)
- 🟡 Amarelo = Em execução
