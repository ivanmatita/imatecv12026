# Script de Inicialização do Git e Push para GitHub
# Execute este script para configurar o Git e enviar o código para o GitHub

Write-Host "🚀 IMATEC V.2.0 - Configuração Git e GitHub" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se Git está instalado
Write-Host "1️⃣  Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git instalado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado! Instale o Git primeiro." -ForegroundColor Red
    Write-Host "Download: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Inicializar repositório Git (se não existir)
Write-Host "2️⃣  Inicializando repositório Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Repositório Git já existe" -ForegroundColor Green
}

Write-Host ""

# 3. Configurar usuário Git (se necessário)
Write-Host "3️⃣  Configurando usuário Git..." -ForegroundColor Yellow
$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName) {
    Write-Host "Digite seu nome para o Git:" -ForegroundColor Cyan
    $userName = Read-Host
    git config user.name $userName
    Write-Host "✅ Nome configurado: $userName" -ForegroundColor Green
} else {
    Write-Host "✅ Nome já configurado: $gitUserName" -ForegroundColor Green
}

if (-not $gitUserEmail) {
    Write-Host "Digite seu email para o Git:" -ForegroundColor Cyan
    $userEmail = Read-Host
    git config user.email $userEmail
    Write-Host "✅ Email configurado: $userEmail" -ForegroundColor Green
} else {
    Write-Host "✅ Email já configurado: $gitUserEmail" -ForegroundColor Green
}

Write-Host ""

# 4. Adicionar todos os arquivos
Write-Host "4️⃣  Adicionando arquivos..." -ForegroundColor Yellow
git add .
Write-Host "✅ Arquivos adicionados" -ForegroundColor Green

Write-Host ""

# 5. Fazer commit
Write-Host "5️⃣  Fazendo commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit - IMATEC V.2.0 - Sistema ERP Multi-Empresa"
git commit -m $commitMessage
Write-Host "✅ Commit realizado: $commitMessage" -ForegroundColor Green

Write-Host ""

# 6. Instruções para GitHub
Write-Host "6️⃣  Próximos passos - GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   a) Acesse: https://github.com/new" -ForegroundColor Cyan
Write-Host "   b) Nome do repositório: soft-imatec-1" -ForegroundColor Cyan
Write-Host "   c) Descrição: Sistema ERP Multi-Empresa - IMATEC V.2.0" -ForegroundColor Cyan
Write-Host "   d) Visibilidade: Private (recomendado)" -ForegroundColor Cyan
Write-Host "   e) NÃO marque 'Initialize with README'" -ForegroundColor Cyan
Write-Host "   f) Clique em 'Create repository'" -ForegroundColor Cyan
Write-Host ""

Write-Host "7️⃣  Depois de criar o repositório, execute:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Digite a URL do seu repositório GitHub:" -ForegroundColor Cyan
Write-Host "   Exemplo: https://github.com/seu-usuario/soft-imatec-1.git" -ForegroundColor Gray
Write-Host ""
$repoUrl = Read-Host "   URL do repositório"

if ($repoUrl) {
    Write-Host ""
    Write-Host "   Conectando ao repositório remoto..." -ForegroundColor Yellow
    
    # Remover origin se já existir
    git remote remove origin 2>$null
    
    # Adicionar novo origin
    git remote add origin $repoUrl
    
    # Renomear branch para main
    git branch -M main
    
    # Push para GitHub
    Write-Host "   Enviando código para GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ Código enviado para GitHub com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Seu repositório: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  URL não fornecida. Execute manualmente:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   git remote add origin https://github.com/seu-usuario/soft-imatec-1.git" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 Configuração Git concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Acesse https://vercel.com" -ForegroundColor Cyan
Write-Host "   2. Importe o repositório do GitHub" -ForegroundColor Cyan
Write-Host "   3. Configure as variáveis de ambiente" -ForegroundColor Cyan
Write-Host "   4. Faça o deploy!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Guia completo: DEPLOY_GITHUB_VERCEL.md" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
