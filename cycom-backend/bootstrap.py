# -*- coding: utf-8 -*-
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, SessionLocal, Base
from app.models.user import User, Role
from app.models.company import Company
from app.core.security import get_password_hash

# Import all models to ensure they are registered in SQLAlchemy metadata
from app.models import (
    attendance, audit_log, company, crm, finance, fleet,
    helpdesk, hr, inventory, partner, payroll, pos,
    product, projects, purchase, recruitment, sales,
    sign, user, config_param, mrp
)


def bootstrap():
    print("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)

    # Ensure audit_logs has hash and previous_hash columns
    from sqlalchemy import text
    db_mig = SessionLocal()
    for sql in [
        "ALTER TABLE audit_logs ADD COLUMN hash VARCHAR",
        "ALTER TABLE audit_logs ADD COLUMN previous_hash VARCHAR",
        "ALTER TABLE companies ADD COLUMN parent_id INTEGER",
        "ALTER TABLE companies ADD COLUMN short_name VARCHAR",
        "ALTER TABLE companies ADD COLUMN country_code VARCHAR",
        "ALTER TABLE companies ADD COLUMN type VARCHAR"
    ]:
        try:
            db_mig.execute(text(sql))
            db_mig.commit()
        except Exception:
            db_mig.rollback()
    db_mig.close()

    db = SessionLocal()
    try:
        # Check if default company exists
        company_count = db.query(Company).count()
        if company_count == 0:
            print("Seeding default company...")
            default_company = Company(
                name="Cycom General Trading",
                short_name="Cycom",
                code="CYCOM_HQ",
                currency="JOD",
                country_code="JO",
                type="commercial",
                is_active=True
            )
            db.add(default_company)
            db.commit()
            db.refresh(default_company)
            company_id = default_company.id
            print(f"Default company created with ID: {company_id}")
        else:
            company_id = db.query(Company).first().id
            print(f"Company already exists with ID: {company_id}")

        # Check if admin user exists
        admin = db.query(User).filter(User.is_superuser == True).first()
        if not admin:
            print("Seeding admin user...")
            hashed_pwd = get_password_hash("adminpassword")
            admin_user = User(
                email="admin@cycom.com",
                hashed_password=hashed_pwd,
                full_name="System Administrator",
                is_active=True,
                is_superuser=True,
                company_id=company_id
            )
            db.add(admin_user)
            db.commit()
            print("Admin user 'admin@cycom.com' created (password: 'adminpassword').")
        else:
            print("Admin user already exists.")

    finally:
        db.close()

    print("Database bootstrap completed successfully.")


if __name__ == "__main__":
    bootstrap()
