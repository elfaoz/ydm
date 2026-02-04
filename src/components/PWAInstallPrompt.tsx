import { X, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { usePWA } from "@/hooks/usePWA";

export const PWAInstallPrompt = () => {
  const { showInstallPrompt, installApp, dismissInstallPrompt } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-bottom-5">
      <Card className="max-w-md w-full p-4 shadow-lg border-brand-kdm/20 bg-background/95 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-kdm/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-brand-kdm" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Install KDM App</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Install aplikasi untuk akses cepat dan pengalaman lebih baik
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={installApp}
                className="bg-brand-kdm hover:bg-brand-kdm/90 text-white"
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissInstallPrompt}
              >
                Nanti
              </Button>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="flex-shrink-0 h-6 w-6"
            onClick={dismissInstallPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
