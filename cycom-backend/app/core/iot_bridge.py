import random
import time


class IoTWeighbridgeBridge:
    """
    Serial communications (RS232/USB) emulator for reading digital weighbridge hardware scales.
    """

    def __init__(self, port: str = "COM3", baudrate: int = 9600):
        self.port = port
        self.baudrate = baudrate
        self.connected = False

    def connect(self) -> bool:
        """
        Simulate opening serial connection to COM port.
        """
        print(f"[IoTBridge] Initializing serial port {self.port} at {self.baudrate} baud...")
        time.sleep(0.5)
        self.connected = True
        print(f"[IoTBridge] Weighbridge scale connected successfully.")
        return True

    def read_scale_weight(self) -> dict:
        """
        Simulate parsing incoming serial buffer bytes containing weight readings.
        Typical weighbridge protocol string: "ST,GS,+012450.00,kg\\r\\n"
        """
        if not self.connected:
            self.connect()

        # Generate mock weight reading (e.g. car/parts/cargo shipping weigh range: 450.0 to 12500.0 kg)
        weight_val = round(random.uniform(450.0, 12500.0), 2)
        status_flag = "ST"  # ST = Stable, US = Unstable
        
        # Emulate raw serial data packets
        raw_serial_bytes = f"{status_flag},GS,+{weight_val:09.2f},kg\r\n".encode("ascii")
        
        # Parse serial data packet
        decoded = raw_serial_bytes.decode("ascii").strip()
        parts = decoded.split(",")
        
        return {
            "raw_packet": decoded,
            "status": "stable" if parts[0] == "ST" else "unstable",
            "weight": float(parts[2]),
            "unit": parts[3]
        }
