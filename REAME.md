# Asset Management System 🚀

## 🎓 Projet de fin d'études - Gestion des actifs IT

### 🔧 Stack Technique
- **Backend** : FastAPI (Python 3.11) + PostgreSQL 15
- **Frontend** : Next.js 14 + React + TailwindCSS
- **Infrastructure** : Docker Compose
- **Auth** : JWT + bcrypt

### 🚀 Démarrage rapide
```bash
# Lancer l'application
docker compose up -d

# Accéder à l'API
- Swagger UI : http://localhost:8000/docs
- Health check : http://localhost:8000/health

# Accéder au frontend
- Dashboard : http://localhost:3000

### 🔐 Compte admin de démo
- Email : `admin@test.com`
- Password : `admin123`

### 📋 Fonctionnalités
- ✅ Gestion CRUD des actifs (création, modification, suppression)
- ✅ Affectation/Retour d'actifs aux employés
- ✅ Authentification JWT sécurisée
- ✅ Système d'audit logs (traçabilité des actions)
- ✅ Pagination et filtrage des listes
- ✅ Interface responsive avec mode sombre/clair

### 🎯 Exigences couvertes
| Code | Exigence | Statut |
|------|----------|--------|
| EF-18 | Traçabilité des actions | ✅ |
| EF-19 | Pagination des listes | ✅ |
| EF-20 | Filtrage des données | ✅ |