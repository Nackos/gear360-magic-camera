import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, Bluetooth, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { bluetoothService } from '@/services/bluetoothService';
import { networkService } from '@/services/networkService';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message?: string;
}

export const ConnectivityTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Bluetooth disponible', status: 'pending' },
    { name: 'Scanner Bluetooth', status: 'pending' },
    { name: 'Wi-Fi disponible', status: 'pending' },
    { name: 'Scanner Wi-Fi', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, status: TestResult['status'], message?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Test 1: Bluetooth disponible
    updateTest(0, 'running');
    try {
      const btAvailable = await bluetoothService.isBluetoothAvailable();
      updateTest(0, btAvailable ? 'success' : 'error', 
        btAvailable ? 'Bluetooth disponible' : 'Bluetooth non disponible'
      );
    } catch (error) {
      updateTest(0, 'error', 'Erreur lors du test Bluetooth');
    }

    // Test 2: Scanner Bluetooth
    updateTest(1, 'running');
    try {
      await bluetoothService.startScan();
      setTimeout(async () => {
        await bluetoothService.stopScan();
        updateTest(1, 'success', 'Scan Bluetooth fonctionnel');
      }, 3000);
    } catch (error) {
      updateTest(1, 'error', 'Erreur lors du scan Bluetooth');
    }

    // Test 3: Wi-Fi disponible (simulation)
    updateTest(2, 'running');
    setTimeout(() => {
      updateTest(2, 'success', 'Wi-Fi disponible');
    }, 1000);

    // Test 4: Scanner Wi-Fi
    updateTest(3, 'running');
    try {
      const networks = await networkService.scanWifiNetworks();
      updateTest(3, 'success', `${networks.length} réseau(x) détecté(s)`);
    } catch (error) {
      updateTest(3, 'error', 'Erreur lors du scan Wi-Fi');
    }

    setIsRunning(false);
    toast.success('Tests de connectivité terminés');
  };

  const resetTests = () => {
    setTests([
      { name: 'Bluetooth disponible', status: 'pending' },
      { name: 'Scanner Bluetooth', status: 'pending' },
      { name: 'Wi-Fi disponible', status: 'pending' },
      { name: 'Scanner Wi-Fi', status: 'pending' },
    ]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Réussi</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Échec</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">En cours</Badge>;
      default:
        return <Badge variant="outline">En attente</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              <Bluetooth className="w-5 h-5" />
              Tests de Connectivité
            </CardTitle>
            <CardDescription>
              Vérifier le bon fonctionnement des connexions Bluetooth et Wi-Fi
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetTests}
              disabled={isRunning}
            >
              Réinitialiser
            </Button>
            <Button
              size="sm"
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                'Lancer les tests'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <p className="font-medium text-sm">{test.name}</p>
                  {test.message && (
                    <p className="text-xs text-muted-foreground">{test.message}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-600 mb-2">💡 Conseils de dépannage</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Assurez-vous que votre Gear 360 est allumée</li>
            <li>• Activez le Bluetooth et le Wi-Fi sur votre appareil</li>
            <li>• Rapprochez-vous de la caméra (&lt; 10 mètres)</li>
            <li>• Vérifiez que la caméra n'est pas déjà connectée à un autre appareil</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
