# Script de Publication GitHub pour Gear360 Magic Camera
# Encodage: UTF-8

Write-Host "🚀 Publication du Projet Gear360 sur GitHub" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier Git
Write-Host "📋 Étape 1/6: Vérification de Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git installé: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé!" -ForegroundColor Red
    Write-Host "Téléchargez Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Étape 2: Configuration Git (si nécessaire)
Write-Host "📋 Étape 2/6: Configuration Git..." -ForegroundColor Yellow
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "⚠️  Configuration Git manquante" -ForegroundColor Yellow
    $name = Read-Host "Entrez votre nom"
    $email = Read-Host "Entrez votre email"
    
    git config --global user.name "$name"
    git config --global user.email "$email"
    Write-Host "✅ Configuration Git enregistrée" -ForegroundColor Green
} else {
    Write-Host "✅ Git configuré: $userName <$userEmail>" -ForegroundColor Green
}

Write-Host ""

# Étape 3: Initialiser Git
Write-Host "📋 Étape 3/6: Initialisation du dépôt Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "ℹ️  Dépôt Git déjà initialisé" -ForegroundColor Cyan
} else {
    git init
    Write-Host "✅ Dépôt Git initialisé" -ForegroundColor Green
}

Write-Host ""

# Étape 4: Ajouter tous les fichiers
Write-Host "📋 Étape 4/6: Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✅ Tous les fichiers ajoutés" -ForegroundColor Green

Write-Host ""

# Étape 5: Commit initial
Write-Host "📋 Étape 5/6: Création du commit initial..." -ForegroundColor Yellow
$commitMessage = @"
🎉 Initial commit: Gear360 Camera - Application Photo Professionnelle

- Application caméra 360° professionnelle
- Interface 100% en français
- Fonctionnalités IA avancées (détection d'objets, visages, gestes)
- Support Gear 360 et Kinect
- Studio 3D IA intégré
- Modes de capture avancés
- Contrôle vocal et gestuel
"@

git commit -m "$commitMessage"
Write-Host "✅ Commit créé avec succès" -ForegroundColor Green

Write-Host ""

# Étape 6: Instructions pour GitHub
Write-Host "📋 Étape 6/6: Connexion à GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Créez maintenant le dépôt sur GitHub.com :               ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  1. Allez sur: https://github.com/new                     ║" -ForegroundColor White
Write-Host "║  2. Nom du dépôt: gear360-magic-camera                    ║" -ForegroundColor White
Write-Host "║  3. Description: Application photo mobile professionnelle ║" -ForegroundColor White
Write-Host "║  4. NE COCHEZ PAS 'Add README' (déjà existant)            ║" -ForegroundColor White
Write-Host "║  5. Cliquez 'Create repository'                           ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Avez-vous créé le dépôt sur GitHub? (O/N)"

if ($continue -eq "O" -or $continue -eq "o") {
    Write-Host ""
    $username = Read-Host "Entrez votre nom d'utilisateur GitHub"
    
    Write-Host ""
    Write-Host "📤 Connexion au dépôt distant..." -ForegroundColor Yellow
    
    $remoteUrl = "https://github.com/$username/gear360-magic-camera.git"
    
    # Vérifier si remote existe déjà
    $existingRemote = git remote -v | Select-String "origin"
    if ($existingRemote) {
        git remote remove origin
    }
    
    git remote add origin $remoteUrl
    git branch -M main
    
    Write-Host "✅ Dépôt distant configuré" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Push vers GitHub..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  GitHub va demander votre authentification:" -ForegroundColor Yellow
    Write-Host "   - Nom d'utilisateur: $username" -ForegroundColor Cyan
    Write-Host "   - Mot de passe: Utilisez un Personal Access Token (PAT)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Pour créer un PAT:" -ForegroundColor Yellow
    Write-Host "   1. GitHub → Settings → Developer settings" -ForegroundColor White
    Write-Host "   2. Personal access tokens → Tokens (classic)" -ForegroundColor White
    Write-Host "   3. Generate new token → Cochez 'repo'" -ForegroundColor White
    Write-Host ""
    
    $pushNow = Read-Host "Prêt à pousser vers GitHub? (O/N)"
    
    if ($pushNow -eq "O" -or $pushNow -eq "o") {
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║  🎉 SUCCÈS! Projet publié sur GitHub!                    ║" -ForegroundColor Green
            Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
            Write-Host "║  Votre dépôt: https://github.com/$username/gear360-magic-camera" -ForegroundColor White
            Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Erreur lors du push" -ForegroundColor Red
            Write-Host "Vérifiez votre authentification GitHub" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host ""
    Write-Host "ℹ️  Vous pouvez exécuter ces commandes manuellement:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "git remote add origin https://github.com/VOTRE_USERNAME/gear360-magic-camera.git" -ForegroundColor White
    Write-Host "git branch -M main" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Script terminé!" -ForegroundColor Cyan
