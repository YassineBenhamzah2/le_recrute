#!/bin/bash
# ==============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATISÉ — RECRUTEMENT CCP / PORTAIL NATIONAL RH
# ==============================================================================
set -e

echo "🚀 [1/5] Début du déploiement..."
echo "📂 Répertoire actuel : $(pwd)"

# 1. Vérification des prérequis
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé sur le serveur."
    exit 1
fi

# 2. Mise à jour des dépendances backend
echo "📦 [2/5] Installation des dépendances Backend..."
npm install --production=false

# 3. Installation et Build du Frontend React
echo "⚛️ [3/5] Compilation du Frontend React..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# 4. Redémarrage de l'application via PM2 ou Docker
echo "🔄 [4/5] Redémarrage des services..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "recrutement"; then
        pm2 restart recrutement --update-env
    else
        pm2 start backend/server.js --name "recrutement" --update-env
    fi
    pm2 save
    echo "✅ Application redémarrée avec succès sous PM2."
elif command -v docker &> /dev/null && [ -f "docker-compose.yml" ]; then
    docker compose up -d --build
    echo "✅ Conteneurs Docker reconstruits et relancés."
else
    echo "⚠️ Ni PM2 ni Docker détecté. Veuillez démarrer l'application avec : node backend/server.js"
fi

# 5. Terminé
echo "🎉 [5/5] Déploiement terminé avec succès sur le VPS !"
