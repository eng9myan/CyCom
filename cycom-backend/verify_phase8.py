import sys
import os
from datetime import datetime

# Add current folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.zatca_signing import ZATCASigner
from app.core.iot_bridge import IoTWeighbridgeBridge
from app.api.routers.rpc import apply_column_rbac
from app.models.user import User


def test_zatca():
    print("Testing ZATCA Compliance Signer...")
    signer = ZATCASigner()
    
    xml_data = "<Invoice><UUID>12345</UUID><Issuer>Cycom</Issuer></Invoice>"
    digest = signer.compute_xml_digest(xml_data)
    print(f"Computed XML Digest (Base64): {digest}")
    
    sig = signer.sign_digest(digest)
    print(f"Generated Cryptographic Signature: {sig}")
    
    qr = signer.generate_zatca_qr_code(
        taxpayer_name="CyberCom Vehicles Group Ltd.",
        vat_number="300012345600003",
        timestamp=datetime.now(),
        invoice_total=18500.00,
        vat_total=2405.00,
        signature=sig
    )
    print(f"Generated ZATCA Phase-2 Base64 QR Code: {qr[:60]}...")
    assert len(qr) > 0
    print("ZATCA verification passed!\n")


def test_iot_weighbridge():
    print("Testing IoT Weighbridge Serial Bridge Emulator...")
    bridge = IoTWeighbridgeBridge(port="COM3")
    reading = bridge.read_scale_weight()
    print(f"Weighbridge Reading: {reading}")
    assert "weight" in reading
    assert reading["unit"] == "kg"
    print("IoT Weighbridge verification passed!\n")


def test_rbac_column_security():
    print("Testing Column-Level RBAC Filters...")
    
    # Mock user without finance.read permission
    user_no_fin = User(id=1, email="staff@cycom.com", is_superuser=False, role_id=None)
    
    # Mock user with superuser bypass
    user_admin = User(id=2, email="admin@cycom.com", is_superuser=True, role_id=None)
    
    product_data = {"id": 101, "name": "Falcon SUV", "sku": "VEH-FLC-SUV", "cost_price": 18500.0, "sale_price": 24000.0}
    
    # Filter for non-authorized user (should strip cost_price and sale_price)
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        filtered = apply_column_rbac("product.product", product_data.copy(), user_no_fin, db)
        print(f"Filtered product record (no permissions): {filtered}")
        assert "cost_price" not in filtered
        assert "sale_price" not in filtered
        
        # Filter for admin (should keep cost_price and sale_price)
        unfiltered = apply_column_rbac("product.product", product_data.copy(), user_admin, db)
        print(f"Filtered product record (admin bypass): {unfiltered}")
        assert "cost_price" in unfiltered
        assert "sale_price" in unfiltered
    finally:
        db.close()
        
    print("Column-Level RBAC verification passed!\n")


if __name__ == "__main__":
    print("=== STARTING PHASE 8 VERIFICATION SUITE ===")
    test_zatca()
    test_iot_weighbridge()
    test_rbac_column_security()
    print("=== ALL PHASE 8 VERIFICATIONS PASSED SUCCESSFULLY ===")
