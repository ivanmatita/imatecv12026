# Script para enviar atualizações para o GitHub
# Substitua SEU_USUARIO pelo seu nome de usuário do GitHub

Write-Host "🚀 Configurando Git e enviando para GitHub..." -ForegroundColor Cyan

# Configurar Git (se ainda não estiver configurado)
$gitUserName = git config user.name
if (-not $gitUserName) {
    Write-Host "⚙️ Configurando nome de usuário Git..." -ForegroundColor Yellow
    git config --global user.name "Ivan"
}

$gitUserEmail = git config user.email
if (-not $gitUserEmail) {
    Write-Host "⚙️ Configurando email Git..." -ForegroundColor Yellow
    git config --global user.email "ivan@imatec.ao"
}

# Adicionar remote (substitua SEU_USUARIO pelo seu username do GitHub)
Write-Host "🔗 Configurando repositório remoto..." -ForegroundColor Yellow
$remoteUrl = Read-Host "Digite a URL do seu repositório GitHub (ex: https://github.com/SEU_USUARIO/imatecv12026)"

git remote add origin $remoteUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Remote já existe, atualizando URL..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
}

# Verificar branch atual
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "📝 Criando branch main..." -ForegroundColor Yellow
    git checkout -b main
}

# Adicionar todos os arquivos
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Criar commit
Write-Host "💾 Criando commit..." -ForegroundColor Yellow
$commitMessage = Read-Host "Digite a mensagem do commit (ou pressione Enter para usar 'Atualização do sistema')"
if (-not $commitMessage) {
    $commitMessage = "Atualização do sistema - Correção PostCSS e casos duplicados"
}
git commit -m $commitMessage

# Fazer push
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Código enviado com sucesso para o GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao enviar para o GitHub. Verifique suas credenciais." -ForegroundColor Red
    Write-Host "💡 Dica: Se for a primeira vez, você pode precisar autenticar com GitHub CLI ou token." -ForegroundColor Yellow
}
