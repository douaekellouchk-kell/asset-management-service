# app/seed.py
"""
Script de seeding automatique pour les données de démonstration.

Ce script est exécuté au démarrage du service pour garantir la présence
de données de test conformes au scénario de démonstration (Section 9.2 du CdC).

Caractéristiques :
- Idempotent : peut être exécuté plusieurs fois sans créer de doublons
- Automatique : s'exécute lors du démarrage via app/main.py
- Traçable : affiche un récapitulatif des données créées
"""

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from app.core.database import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.asset import Asset
from app.models.assignment import Assignment

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_or_create_user(
    db: Session,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    role: str
) -> User:
    """Récupère un utilisateur existant ou en crée un nouveau."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=pwd_context.hash(password),
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(user)
        db.flush()
        print(f"   [CREATED] {role}: {first_name} {last_name} ({email})")
    else:
        user.password_hash = pwd_context.hash(password)
        print(f"   [EXISTS]  {role}: {email}")
    return user


def get_or_create_category(
    db: Session,
    name: str,
    description: str
) -> Category:
    """Récupère une catégorie existante ou en crée une nouvelle."""
    category = db.query(Category).filter(Category.name == name).first()
    if not category:
        category = Category(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
            created_at=datetime.utcnow()
        )
        db.add(category)
        db.flush()
        print(f"   [CREATED] Category: {name}")
    else:
        print(f"   [EXISTS]  Category: {name}")
    return category


def get_or_create_asset(
    db: Session,
    name: str,
    serial_number: str,
    category: Category,
    purchase_value: float,
    description: str,
    status: str = "AVAILABLE",
    purchase_date: datetime = None
) -> Asset:
    """Récupère un actif existant ou en crée un nouveau."""
    asset = db.query(Asset).filter(Asset.serial_number == serial_number).first()
    if not asset:
        asset = Asset(
            id=str(uuid.uuid4()),
            name=name,
            serial_number=serial_number,
            category_id=category.id,
            purchase_value=purchase_value,
            description=description,
            status=status,
            purchase_date=purchase_date or datetime.utcnow(),
            is_deleted=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(asset)
        db.flush()
        print(f"   [CREATED] Asset: {name} ({serial_number})")
    else:
        print(f"   [EXISTS]  Asset: {serial_number}")
    return asset


def create_assignment(
    db: Session,
    asset: Asset,
    employee: User,
    assigned_by: User,
    days_ago: int = 30,
    notes: str = None,
    returned: bool = False,
    return_condition: str = None
) -> Assignment:
    """Crée une affectation (et éventuellement un retour)."""
    existing = db.query(Assignment).filter(
        Assignment.asset_id == asset.id,
        Assignment.employee_id == employee.id
    ).first()

    if existing:
        print(f"   [EXISTS]  Assignment: {asset.name} -> {employee.first_name}")
        return existing

    assigned_at = datetime.utcnow() - timedelta(days=days_ago)

    assignment = Assignment(
        id=str(uuid.uuid4()),
        asset_id=asset.id,
        employee_id=employee.id,
        assigned_by=assigned_by.id,
        assigned_at=assigned_at,
        notes=notes
    )

    if returned:
        assignment.returned_at = assigned_at + timedelta(days=15)
        assignment.return_condition = return_condition or "GOOD"
        asset.status = "AVAILABLE"
        status_text = "returned"
    else:
        asset.status = "ASSIGNED"
        status_text = "active"

    db.add(assignment)
    db.flush()
    print(f"   [CREATED] Assignment ({status_text}): {asset.name} -> {employee.first_name} {employee.last_name}")
    return assignment


def seed_data():
    """
    Fonction principale de seeding.

    Crée toutes les données de démonstration nécessaires pour la soutenance,
    conformément au scénario décrit dans la Section 9.2 du Cahier des Charges.
    """
    db = SessionLocal()
    try:
        print("\n" + "=" * 70)
        print("STARTING DATA SEEDING FOR DEMONSTRATION")
        print("=" * 70)

        # ------------------------------------------------------------------
        # 1. USERS (Section 9.2 - Step 2)
        # ------------------------------------------------------------------
        print("\n[1/4] Creating users...")

        admin = get_or_create_user(
            db=db,
            email="admin@test.com",
            password="admin123",
            first_name="Admin",
            last_name="System",
            role="ADMIN"
        )

        manager = get_or_create_user(
            db=db,
            email="manager@test.com",
            password="manager123",
            first_name="Karim",
            last_name="Benali",
            role="MANAGER"
        )

        employee1 = get_or_create_user(
            db=db,
            email="jean.dupont@test.com",
            password="employee123",
            first_name="Jean",
            last_name="Dupont",
            role="EMPLOYEE"
        )

        employee2 = get_or_create_user(
            db=db,
            email="marie.martin@test.com",
            password="employee123",
            first_name="Marie",
            last_name="Martin",
            role="EMPLOYEE"
        )

        employee3 = get_or_create_user(
            db=db,
            email="ahmed.benali@test.com",
            password="employee123",
            first_name="Ahmed",
            last_name="Benali",
            role="EMPLOYEE"
        )

        # ------------------------------------------------------------------
        # 2. CATEGORIES (Section 9.2 - Step 2)
        # ------------------------------------------------------------------
        print("\n[2/4] Creating categories...")

        cat_informatique = get_or_create_category(
            db=db,
            name="Informatique",
            description="Ordinateurs, tablettes, périphériques informatiques"
        )

        cat_telephonie = get_or_create_category(
            db=db,
            name="Téléphonie",
            description="Smartphones, téléphones fixes, tablettes cellulaires"
        )

        cat_mobilier = get_or_create_category(
            db=db,
            name="Mobilier",
            description="Bureaux, chaises, armoires de rangement"
        )

        cat_vehicules = get_or_create_category(
            db=db,
            name="Véhicules",
            description="Véhicules de service et de fonction"
        )

        cat_reseau = get_or_create_category(
            db=db,
            name="Réseau",
            description="Routeurs, switches, équipements réseau"
        )

        # ------------------------------------------------------------------
        # 3. ASSETS (Section 9.2 - Step 3)
        # ------------------------------------------------------------------
        print("\n[3/4] Creating assets...")

        laptop1 = get_or_create_asset(
            db=db,
            name="MacBook Pro M3 14\"",
            serial_number="MBP-2024-001",
            category=cat_informatique,
            purchase_value=24999.99,
            description="Laptop Apple MacBook Pro M3, 16GB RAM, 512GB SSD",
            purchase_date=datetime.utcnow() - timedelta(days=180)
        )

        laptop2 = get_or_create_asset(
            db=db,
            name="Dell Latitude 5540",
            serial_number="DEL-2024-002",
            category=cat_informatique,
            purchase_value=15999.00,
            description="Laptop professionnel Dell, i7, 16GB RAM",
            purchase_date=datetime.utcnow() - timedelta(days=120)
        )

        ecran1 = get_or_create_asset(
            db=db,
            name="Ecran Dell UltraSharp 27\"",
            serial_number="DEL-ECR-001",
            category=cat_informatique,
            purchase_value=4500.00,
            description="Ecran 4K UHD, USB-C",
            purchase_date=datetime.utcnow() - timedelta(days=90)
        )

        phone1 = get_or_create_asset(
            db=db,
            name="iPhone 15 Pro",
            serial_number="IPH-2024-001",
            category=cat_telephonie,
            purchase_value=13999.00,
            description="iPhone 15 Pro 256GB, Titanium Blue",
            purchase_date=datetime.utcnow() - timedelta(days=60)
        )

        phone2 = get_or_create_asset(
            db=db,
            name="Samsung Galaxy S24",
            serial_number="SAM-2024-002",
            category=cat_telephonie,
            purchase_value=10999.00,
            description="Samsung Galaxy S24 Ultra 512GB",
            purchase_date=datetime.utcnow() - timedelta(days=45)
        )

        bureau1 = get_or_create_asset(
            db=db,
            name="Bureau ergonomique ajustable",
            serial_number="BUR-ERG-001",
            category=cat_mobilier,
            purchase_value=6500.00,
            description="Bureau a hauteur reglable electriquement",
            purchase_date=datetime.utcnow() - timedelta(days=200)
        )

        switch1 = get_or_create_asset(
            db=db,
            name="Switch Cisco Catalyst 2960",
            serial_number="CSC-SW-001",
            category=cat_reseau,
            purchase_value=8500.00,
            description="Switch 24 ports Gigabit managed",
            purchase_date=datetime.utcnow() - timedelta(days=300)
        )

        # ------------------------------------------------------------------
        # 4. ASSIGNMENTS (Section 9.2 - Step 4)
        # ------------------------------------------------------------------
        print("\n[4/4] Creating assignments...")

        # Assignment en cours : MacBook -> Jean Dupont
        create_assignment(
            db=db,
            asset=laptop1,
            employee=employee1,
            assigned_by=manager,
            days_ago=30,
            notes="Affectation pour projet de developpement",
            returned=False
        )

        # Assignment en cours : iPhone -> Marie Martin
        create_assignment(
            db=db,
            asset=phone1,
            employee=employee2,
            assigned_by=manager,
            days_ago=15,
            notes="Telephone professionnel pour deplacements",
            returned=False
        )

        # Assignment retournee : Dell Latitude -> Ahmed (bon etat)
        create_assignment(
            db=db,
            asset=laptop2,
            employee=employee3,
            assigned_by=manager,
            days_ago=60,
            notes="Affectation temporaire pour mission",
            returned=True,
            return_condition="GOOD"
        )

        # Commit final
        db.commit()

        # ------------------------------------------------------------------
        # RECAPITULATIF
        # ------------------------------------------------------------------
        print("\n" + "=" * 70)
        print("DATA SEEDING COMPLETED SUCCESSFULLY")
        print("=" * 70)

        user_count = db.query(User).count()
        category_count = db.query(Category).count()
        asset_count = db.query(Asset).filter(Asset.is_deleted == False).count()
        assignment_count = db.query(Assignment).count()

        print("\nSUMMARY:")
        print(f"   Users      : {user_count}")
        print(f"   Categories : {category_count}")
        print(f"   Assets     : {asset_count}")
        print(f"   Assignments: {assignment_count}")

        print("\nLOGIN CREDENTIALS:")
        print("   Admin    : admin@test.com       / admin123")
        print("   Manager  : manager@test.com     / manager123")
        print("   Employee1: jean.dupont@test.com / employee123")
        print("   Employee2: marie.martin@test.com / employee123")
        print("   Employee3: ahmed.benali@test.com / employee123")
        print("\n" + "=" * 70 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()