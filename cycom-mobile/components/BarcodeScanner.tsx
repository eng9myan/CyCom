import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';

interface BarcodeScannerProps {
  onScan: (sku: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);

  const simulateScan = (sku: string) => {
    setScanning(true);
    // Emulate barcode capture after 1.5 seconds
    setTimeout(() => {
      setScanning(false);
      onScan(sku);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Barcode Scanner Portal</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Viewport Overlay */}
      <View style={styles.scannerWrapper}>
        <View style={styles.targetReticle}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {scanning ? (
            <ActivityIndicator size="large" color="#f59e0b" />
          ) : (
            <View style={styles.scanningLine} />
          )}
        </View>
        <Text style={styles.helpText}>Align barcode/SKU within targeting brackets</Text>
      </View>

      {/* Simulation triggers for testing in development */}
      <View style={styles.controls}>
        <Text style={styles.controlTitle}>Simulate Scan Trigger</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => simulateScan('VEH-FLC-SUV')} style={styles.btn}>
            <Text style={styles.btnText}>Falcon SUV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => simulateScan('DRV-V6-ELE')} style={styles.btn}>
            <Text style={styles.btnText}>Electric Powertrain</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => simulateScan('BAT-FAL-90')} style={styles.btn}>
            <Text style={styles.btnText}>Falcon Battery Pack</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#ef444420',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef444430',
  },
  closeText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  scannerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#02061760',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#33415530',
    overflow: 'hidden',
    position: 'relative',
  },
  targetReticle: {
    width: width * 0.65,
    height: width * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#f59e0b',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanningLine: {
    width: '90%',
    height: 3,
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  helpText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 20,
    fontWeight: '500',
  },
  controls: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1e293b30',
    borderRadius: 12,
  },
  controlTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: '#f59e0b12',
    borderWidth: 1,
    borderColor: '#f59e0b30',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
