import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models import Organization, User, UserRole
from app.core.security import get_password_hash
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def generate_custom_password(full_name, company_name):
    # Bersihkan gelar dari nama (Dr., Prof., Ir., dll)
    name_clean = re.sub(r'^(Dr\.|Prof\.|Ir\.|M\.Sc)\s*', '', full_name, flags=re.IGNORECASE).strip()
    first_name = name_clean.split()[0].capitalize()
    
    # Bersihkan awalan/akhiran dari nama perusahaan
    comp_clean = re.sub(r'^(PT\s|CV\s)', '', company_name, flags=re.IGNORECASE).strip()
    comp_clean = re.sub(r'\s*(Tbk|\(Persero\)|SA|plc|Group).*$', '', comp_clean, flags=re.IGNORECASE).strip()
    # Ambil satu kata pertama dari perusahaan
    first_comp = comp_clean.split()[0].capitalize()
    
    # Format: Nama.Perusahaan2026! (memenuhi syarat Uppercase, Lowercase, Number, Symbol)
    return f"{first_name}.{first_comp}2026!"

async def seed_data():
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "nexus_vault_secrets", "tenant_provisioning_data.json")
    
    with open(json_path, 'r') as f:
        tenants = json.load(f)

    async with AsyncSessionLocal() as session:
        print("Creating 30 Tenant Organizations and their Admins...")
        for i, tenant in enumerate(tenants):
            # 1. Create Organization
            slug = slugify(tenant["legalName"])
            
            # Check if exists
            result = await session.execute(select(Organization).where(Organization.slug == slug))
            org = result.scalars().first()
            
            if not org:
                org = Organization(
                    name=tenant["legalName"],
                    slug=slug,
                    location=tenant["region"],
                    institution_type=tenant["matrix"],
                    compliance_standard=tenant["standard"],
                    infra_config={
                        "node_allocation": tenant["infrastructure"]["node"],
                        "s3_quota": tenant["infrastructure"]["s3Quota"],
                        "retention": tenant["infrastructure"]["retention"],
                        "bsl_level": tenant["specializedControls"]["bslLevel"],
                        "bio_safety_standard": tenant["specializedControls"]["bioSafetyStandard"],
                        "audit_cycle": tenant["audit"]["cycle"],
                        "compliance_frequency": tenant["audit"]["complianceFrequency"],
                        "network_whitelist": tenant["networkWhitelist"],
                        "clearance": tenant["clearance"],
                        "encryption": tenant["encryption"]
                    }
                )
                session.add(org)
                await session.flush() # to get org.id

            # 2. Create 4 Roles for this Organization: Admin, Manager, Auditor, Analyst
            base_email_domain = tenant["admin"]["email"].split('@')[1]
            admin_full_name = tenant["admin"]["fullName"]
            company_name = tenant["legalName"]
            
            roles_to_create = [
                {"role": UserRole.ADMIN, "prefix": "admin", "name": admin_full_name},
                {"role": UserRole.MANAGER, "prefix": "manager", "name": "Manager " + company_name},
                {"role": UserRole.AUDITOR, "prefix": "auditor", "name": "Auditor " + company_name},
                {"role": UserRole.ANALYST, "prefix": "analyst", "name": "Analyst " + company_name},
            ]

            for role_data in roles_to_create:
                email = f"{role_data['prefix']}@{base_email_domain}"
                custom_password = generate_custom_password(role_data["name"], company_name)
                
                result = await session.execute(select(User).where(User.email == email))
                user = result.scalars().first()
                
                if not user:
                    user = User(
                        email=email,
                        password_hash=get_password_hash(custom_password),
                        full_name=role_data["name"],
                        role=role_data["role"],
                        organization_id=org.id,
                        is_active=True,
                        recovery_password=custom_password
                    )
                    session.add(user)
                else:
                    user.password_hash = get_password_hash(custom_password)
                    user.recovery_password = custom_password
                    user.full_name = role_data["name"]
        
        print("Creating 5 Super Admins...")
        super_admins_data = [
            {"email": "wisnu@colonyai.com", "name": "Wisnu Master", "pass": "Wisnu.Nexus2026!"},
            {"email": "ashar@colonyai.com", "name": "Ashar Master", "pass": "Ashar.Nexus2026!"},
            {"email": "suci@colonyai.com", "name": "Suci Master", "pass": "Suci.Nexus2026!"},
            {"email": "steven@colonyai.com", "name": "Steven Master", "pass": "Steven.Nexus2026!"},
            {"email": "faras@colonyai.com", "name": "Faras Master", "pass": "Faras.Nexus2026!"},
        ]
        
        for sa in super_admins_data:
            result = await session.execute(select(User).where(User.email == sa["email"]))
            super_user = result.scalars().first()
            
            if not super_user:
                super_user = User(
                    email=sa["email"],
                    password_hash=get_password_hash(sa["pass"]),
                    full_name=sa["name"],
                    role=UserRole.SUPER_ADMIN,
                    organization_id=None,
                    is_active=True,
                    recovery_password=sa["pass"]
                )
                session.add(super_user)
            else:
                super_user.password_hash = get_password_hash(sa["pass"])
                super_user.recovery_password = sa["pass"]
                super_user.full_name = sa["name"]
                
        await session.commit()
        print("Data injection complete! All passwords have been updated to the new dynamic format (e.g. Wisnu.Nexus2026!)")

if __name__ == "__main__":
    asyncio.run(seed_data())
