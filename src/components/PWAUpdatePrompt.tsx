import { RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { usePWA } from "@/hooks/usePWA";

export const PWAUpdatePrompt = () => {
  const { needRefresh, updateApp } = usePWA();

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-top-5">
      <Card className="max-w-md w-full p-4 shadow-lg border-brand-kdm/20 bg-background/95 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-kdm/10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-brand-kdm" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Update Tersedia</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Versi baru aplikasi tersedia. Reload untuk mendapatkan fitur terbaru.
            </p>
            
            <Button
              size="sm"
              onClick={updateApp}
              className="bg-brand-kdm hover:bg-brand-kdm/90 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Sekarang
            </Button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="flex-shrink-0 h-6 w-6"
            onClick={() => window.location.reload()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
