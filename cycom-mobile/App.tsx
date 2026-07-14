import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { OfflineSyncManager, SyncRecord } from './services/OfflineSyncManager';
import BarcodeScanner from './components/BarcodeScanner';

export default function App() {
  const syncManager = OfflineSyncManager.getInstance();
  const [isOnline, setIsOnline] = useState(syncManager.getOnlineStatus());
  const [syncQueue, setSyncQueue] = useState<SyncRecord[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);

  // Sync state polling in mock environment
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncQueue([...syncManager.getQueue()]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleNetwork = () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    syncManager.setOnlineStatus(nextStatus);
  };

  const handleBarcodeScanned = (sku: string) => {
    setShowScanner(false);
    
    // Perform simulated SKU database lookup
    const productsDb: Record<string, any> = {
      'VEH-FLC-SUV': { name: 'CyberCom Falcon SUV (Model S)', price: 'JOD 18,500', stock: 12 },
      'DRV-V6-ELE': { name: 'CyberDrive V6 Electric Powertrain', price: 'JOD 6,500', stock: 24 },
      'BAT-FAL-90': { name: 'Falcon 90kWh Battery Pack', price: 'JOD 5,800', stock: 30 },
    };

    const found = productsDb[sku] || { name: 'Unknown Component SKU', price: 'JOD 0.00', stock: 0 };
    setScannedProduct({ sku, ...found });

    // Queue offline transaction automatically
    syncManager.queueTransaction('product.stock', 'update', { sku, delta: -1, reason: 'mobile_count' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {showScanner ? (
        <BarcodeScanner 
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>Cycom Mobile Client</Text>
            <TouchableOpacity 
              onPress={toggleNetwork} 
              style={[styles.networkBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}
            >
              <Text style={styles.badgeText}>{isOnline ? '● Online Mode' : '○ Offline Mode'}</Text>
            </TouchableOpacity>
          </View>

          {/* Action Cards */}
          <View style={styles.actionGrid}>
            <TouchableOpacity onPress={() => setShowScanner(true)} style={styles.scanCard}>
              <Text style={styles.cardEmoji}>📷</Text>
              <Text style={styles.cardTitle}>Scan Barcode</Text>
              <Text style={styles.cardDesc}>Instant SKU Stock Count & Log</Text>
            </TouchableOpacity>
          </View>

          {/* Scanned Product Result */}
          {scannedProduct && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Last Scanned Product</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Product Name:</Text>
                <Text style={styles.resultVal}>{scannedProduct.name}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>SKU / Code:</Text>
                <Text style={styles.resultValFont}>{scannedProduct.sku}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Unit Cost Value:</Text>
                <Text style={styles.resultValHighlight}>{scannedProduct.price}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>On-Hand Stock:</Text>
                <Text style={styles.resultVal}>{scannedProduct.stock} units</Text>
              </View>
            </View>
          )}

          {/* Sync Queue Monitor */}
          <View style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Offline Sync Queue Buffer</Text>
              <Text style={styles.queueCount}>{syncQueue.length} Pending</Text>
            </View>
            
            {syncQueue.length === 0 ? (
              <Text style={styles.emptyText}>All mobile transactions fully synchronized.</Text>
            ) : (
              <View style={styles.table}>
                {syncQueue.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <View>
                      <Text style={styles.rowModel}>{item.model}</Text>
                      <Text style={styles.rowAction}>{item.action.toUpperCase()} • {item.id}</Text>
                    </View>
                    <Text style={styles.rowStatus}>Pending Sync</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  networkBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  onlineBadge: {
    backgroundColor: '#05966920',
    borderWidth: 1,
    borderColor: '#05966940',
  },
  offlineBadge: {
    backgroundColor: '#ea580c20',
    borderWidth: 1,
    borderColor: '#ea580c40',
  },
  badgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionGrid: {
    marginBottom: 20,
  },
  scanCard: {
    backgroundColor: '#f59e0b10',
    borderWidth: 1,
    borderColor: '#f59e0b25',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: '#1e293b20',
    borderWidth: 1,
    borderColor: '#33415540',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  resultTitle: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b15',
    paddingBottom: 6,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resultLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  resultVal: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '600',
  },
  resultValFont: {
    color: '#c084fc',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  resultValHighlight: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  queueCard: {
    backgroundColor: '#0f172a40',
    borderWidth: 1,
    borderColor: '#1e293b60',
    borderRadius: 16,
    padding: 16,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  queueTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  queueCount: {
    color: '#8b5cf6',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#8b5cf615',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
  table: {
    marginTop: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b40',
  },
  rowModel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  rowAction: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  rowStatus: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
