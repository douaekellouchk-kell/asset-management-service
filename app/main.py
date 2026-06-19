# app/main.py
"""
Asset Management API - Point d'entrée principal du microservice.

Conforme au Cahier des Charges PFA 2024-2025 :
- Section 4.5 : Journalisation et Supervision (logs JSON structurés)
- Section 5.1 : Architecture Microservice REST
- Section 6.7 : Format des Réponses standardisé
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.database import Base, engine
from datetime import datetime
from sqlalchemy import text
import logging
import json
import time

# ── Configuration des logs structurés JSON (Section 4.5) ───────────────────
class JSONFormatter(logging.Formatter):
    """Formateur de logs au format JSON structuré."""
    
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "module": record.module,
            "message": record.getMessage(),
        }
        # Ajouter le contexte de la requête si disponible
        if hasattr(record, "user_id"):
            log_record["user_id"] = record.user_id
        if hasattr(record, "endpoint"):
            log_record["endpoint"] = record.endpoint
        if hasattr(record, "method"):
            log_record["method"] = record.method
        if hasattr(record, "status_code"):
            log_record["status_code"] = record.status_code
        if hasattr(record, "duration_ms"):
            log_record["duration_ms"] = record.duration_ms
        if record.exc_info:
            log_record["stack_trace"] = self.formatException(record.exc_info)
        
        return json.dumps(log_record, ensure_ascii=False)


# Configuration du logger
logger = logging.getLogger("asset-management")
logger.setLevel(logging.INFO)

# Handler pour la console avec format JSON
console_handler = logging.StreamHandler()
console_handler.setFormatter(JSONFormatter())
logger.handlers = [console_handler]

# Éviter la duplication des logs
logger.propagate = False


# ── ÉTAPE 1 : Importer TOUS les modèles (ordre important pour les relations)
from app.models import user, category, asset, assignment, audit_log

# ── ÉTAPE 2 : Créer les tables AVANT toute chose
Base.metadata.create_all(bind=engine)

# ── ÉTAPE 3 : Exécuter le seeding (non bloquant)
from app.seed import seed_data
try:
    seed_data()
    logger.info("Seeding des données de démonstration terminé avec succès")
except Exception as e:
    logger.warning(f"Seeding error (non bloquant): {e}")


# ── Initialisation de l'application FastAPI ────────────────────────────────
app = FastAPI(
    title="Asset Management API",
    description="Microservice ERP de gestion des actifs et inventaire",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── Middleware CORS ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Middleware de Logging des Requêtes (Section 4.5) ──────────────────────
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """
    Middleware qui log chaque requête HTTP avec :
    - Timestamp
    - Méthode HTTP
    - Endpoint
    - Durée d'exécution
    - Code de statut
    
    Conforme à la Section 4.5 du CdC.
    """
    start_time = time.time()
    
    # Traiter la requête
    response = await call_next(request)
    
    # Calculer la durée
    duration_ms = round((time.time() - start_time) * 1000, 2)
    
    # Logger la requête
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code}",
        extra={
            "method": request.method,
            "endpoint": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        }
    )
    
    return response


# ── Gestionnaire Global d'Erreurs (Section 6.7) ──────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Gestionnaire global qui formate toutes les erreurs selon le format
    standard défini dans la Section 6.7 du CdC.
    """
    logger.error(
        f"Erreur non gérée: {str(exc)}",
        extra={
            "method": request.method,
            "endpoint": request.url.path,
        },
        exc_info=True
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Une erreur interne est survenue.",
                "details": {"error": str(exc)} if app.debug else {}
            }
        }
    )


# ── Enregistrement des Routes ────────────────────────────────────────────
from app.api import auth, users, categories, assets, audit_logs, assignments

app.include_router(auth.router, prefix="/auth")
app.include_router(users.router, prefix="/users")
app.include_router(categories.router, prefix="/categories")
app.include_router(assets.router, prefix="/assets")
app.include_router(audit_logs.router, prefix="/audit-logs")
app.include_router(assignments.router)  # A déjà /assignments dans prefix


# ── Variables globales pour le monitoring ─────────────────────────────────
START_TIME = datetime.utcnow()


# ── Endpoint de Santé du Service (Section 6.6 - EF-29) ───────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """
    Endpoint de santé du service.
    
    Retourne l'état du service et de la connexion à la base de données.
    - Code 200 si tout est OK
    - Code 503 si la base de données est inaccessible
    
    Conforme à la Section 6.6 et à l'exigence EF-29 du CdC.
    """
    from app.core.database import SessionLocal
    
    # Calculer l'uptime
    uptime_seconds = (datetime.utcnow() - START_TIME).total_seconds()
    uptime_formatted = f"{int(uptime_seconds // 3600)}h {int((uptime_seconds % 3600) // 60)}m {int(uptime_seconds % 60)}s"
    
    # Vérifier la connexion à la base de données
    db_status = "unknown"
    db_details = {}
    
    try:
        db = SessionLocal()
        try:
            # Test de connexion avec SQLAlchemy 2.0
            result = db.execute(text("SELECT 1")).scalar()
            if result == 1:
                db_status = "connected"
                
                # Compter les enregistrements
                try:
                    from app.models.user import User
                    from app.models.asset import Asset
                    from app.models.category import Category
                    from app.models.assignment import Assignment
                    
                    db_details = {
                        "users": db.query(User).count(),
                        "assets": db.query(Asset).filter(Asset.is_deleted == False).count(),
                        "categories": db.query(Category).count(),
                        "assignments": db.query(Assignment).count(),
                    }
                except Exception as count_err:
                    db_details = {"warning": f"Impossible de compter: {str(count_err)}"}
            else:
                db_status = "error"
                db_details = {"error": "Requête de test a échoué"}
        finally:
            db.close()
    except Exception as e:
        db_status = "error"
        db_details = {"error": str(e)}
    
    # Construire la réponse
    response_data = {
        "success": True,
        "data": {
            "status": "healthy" if db_status == "connected" else "unhealthy",
            "service": "asset-management",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "uptime": uptime_formatted,
            "uptime_seconds": int(uptime_seconds),
            "environment": "development",
            "database": {
                "status": db_status,
                "type": "postgresql",
                "details": db_details
            },
            "features": {
                "authentication": "JWT",
                "rbac": True,
                "audit_logs": True,
                "soft_delete": True,
                "pagination": True,
                "search_filters": True
            }
        },
        "message": "Service opérationnel" if db_status == "connected" else "Service dégradé"
    }
    
    # Retourner le code HTTP approprié
    if db_status == "connected":
        return response_data
    else:
        return JSONResponse(
            status_code=503,
            content=response_data
        )


# ── Endpoint Racine ──────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    """
    Endpoint racine redirigeant vers la documentation.
    """
    return {
        "success": True,
        "data": {
            "service": "Asset Management API",
            "version": "1.0.0",
            "documentation": "/docs",
            "health": "/health",
            "redoc": "/redoc"
        },
        "message": "Bienvenue sur l'API Asset Management"
    }


# ── Logs de démarrage ────────────────────────────────────────────────────
logger.info("Asset Management API démarré avec succès")
logger.info(f"Documentation Swagger: http://localhost:8000/docs")
logger.info(f"Health Check: http://localhost:8000/health")