import base64
import hashlib
import json
from datetime import datetime


class ZATCASigner:
    """
    Cryptographic e-invoicing helper for Saudi Arabia ZATCA Phase-2 compliance.
    """

    def __init__(self, private_key_pem: str = "MOCK_PRIVATE_KEY_PEM"):
        self.private_key_pem = private_key_pem

    def compute_xml_digest(self, xml_payload: str) -> str:
        """
        Computes the SHA-256 hash digest of the normalized XML invoice.
        """
        # Strip extraneous whitespace for canonicalization representation
        canonicalized = xml_payload.strip()
        digest = hashlib.sha256(canonicalized.encode("utf-8")).digest()
        return base64.b64encode(digest).decode("utf-8")

    def sign_digest(self, xml_digest: str) -> str:
        """
        Signs the SHA-256 XML digest using the taxpayer private key (simulating ECDSA).
        """
        # Cryptographically bind the digest with taxpayer signature key
        combined = f"{xml_digest}:{self.private_key_pem}"
        signature = hashlib.sha256(combined.encode("utf-8")).digest()
        return base64.b64encode(signature).decode("utf-8")

    def generate_zatca_qr_code(
        self,
        taxpayer_name: str,
        vat_number: str,
        timestamp: datetime,
        invoice_total: float,
        vat_total: float,
        signature: str
    ) -> str:
        """
        Generates a compliant TLV (Tag-Length-Value) Base64 QR code payload for ZATCA Phase-2.
        """
        def to_tlv(tag: int, val: str) -> bytes:
            val_bytes = val.encode("utf-8")
            return bytes([tag, len(val_bytes)]) + val_bytes

        # ZATCA TLV Tags:
        # 1: Taxpayer Name
        # 2: Taxpayer VAT Registration Number
        # 3: Invoice Timestamp
        # 4: Invoice Total (with VAT)
        # 5: VAT Total
        # 6: ECDSA Digital Signature
        tlv_bytes = b""
        tlv_bytes += to_tlv(1, taxpayer_name)
        tlv_bytes += to_tlv(2, vat_number)
        tlv_bytes += to_tlv(3, timestamp.isoformat())
        tlv_bytes += to_tlv(4, f"{invoice_total:.2f}")
        tlv_bytes += to_tlv(5, f"{vat_total:.2f}")
        tlv_bytes += to_tlv(6, signature)

        return base64.b64encode(tlv_bytes).decode("utf-8")
