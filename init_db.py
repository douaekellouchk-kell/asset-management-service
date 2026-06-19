# init_db.py - Script d'initialisation ROBUSTE
from app.core.database import engine, SessionLocal
from app.core.security import get_password_hash
import uuid

# ── ÉTAPE CRITIQUE : Importer les modèles ───────────────────────────────────
from app.models.user import User
from app.models.asset import Asset  
from app.models.category import Category
from app.models.audit_log import AuditLog

# ── Initialisation ──────────────────────────────────────────────────────────
def init_db():
    print("Initialisation de la base de données...")
    
    # 1. Créer toutes les tables en utilisant la VRAIE metadata de tes modèles
    print("Création des tables...")
    
    # Hna we force SQLAlchemy to use the exact metadata bound to your models
    User.metadata.create_all(bind=engine)
    
    print("Tables créées avec succès !")
    
    # 2. Créer l'utilisateur admin
    print("Vérification admin...")
    db = SessionLocal()
    
    try:
        admin = db.query(User).filter(User.email == 'admin@test.com').first()
        if not admin:
            # Vérification du type de l'ID (UUID ou str) selon ton schéma d'Asset
            # Si ton User utilise aussi UUID, tu peux enlever str()
            admin = User(
                id=str(uuid.uuid4()),
                email='admin@test.com',
                password_hash=get_password_hash('admin123'),
                first_name='Admin',
                last_name='User',
                role='ADMIN',
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Admin créé : admin@test.com / admin123")
        else:
            print("Admin existe déjà")
        
        # 3. Créer des catégories de test
        print("Création des catégories...")
        categories_data = [
            ('Informatique', 'Matériel informatique'),
            ('Mobilier', 'Mobilier de bureau'),
            ('Téléphonie', 'Équipements téléphoniques')
        ]
        
        for name, desc in categories_data:
            existing = db.query(Category).filter(Category.name == name).first()
            if not existing:
                cat = Category(
                    id=str(uuid.uuid4()),
                    name=name,
                    description=desc
                )
                db.add(cat)
                print(f"  + {name}")
        
        db.commit()
        print("Base de données prête !")
        
    except Exception as e:
        print(f"Erreur lors de l'exécution: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()