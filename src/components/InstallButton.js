"use client";
import { useState, useEffect } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsIOS(ios);

    if (isStandalone) {
      setShowButton(false);
      return;
    }

    if (ios) {
      // iOS: no beforeinstallprompt — show manual install guide
      const dismissed = sessionStorage.getItem("b1mart_ios_install_dismissed");
      if (!dismissed) setShowButton(true);
    } else {
      // Android/Desktop: use native prompt
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowButton(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowButton(false);
    setDeferredPrompt(null);
  };

  const dismissIOS = () => {
    setShowIOSGuide(false);
    setShowButton(false);
    sessionStorage.setItem("b1mart_ios_install_dismissed", "1");
  };

  if (!showButton && !showIOSGuide) return null;

  return (
    <>
      {/* Install button */}
      {showButton && !showIOSGuide && (
        <button
          onClick={handleInstall}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down rounded-xl border-3 border-amber-900 bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0px_#78350f] hover:shadow-[2px_2px_0px_#78350f] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
          </svg>
          INSTALL APP
        </button>
      )}

      {/* iOS Install Guide Overlay */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border-3 border-amber-900 bg-amber-50 p-5 shadow-2xl animate-slide-down">
            <h3 className="text-base font-black uppercase text-amber-900 mb-3 text-center">
              📲 Install B1 MART
            </h3>
            <div className="space-y-3 text-sm font-bold text-amber-800">
              <div className="flex items-start gap-3">
                <span className="text-lg">1️⃣</span>
                <p>
                  Tap the <strong>Share</strong> button{" "}
                  <svg className="inline w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                  </svg>{" "}
                  at the bottom of Safari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">2️⃣</span>
                <p>
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">3️⃣</span>
                <p>
                  Tap <strong>&quot;Add&quot;</strong> to install the app
                </p>
              </div>
            </div>
            <button
              onClick={dismissIOS}
              className="mt-4 w-full rounded-xl border-3 border-amber-900 bg-orange-500 py-2.5 text-sm font-black uppercase text-white hover:bg-orange-600 transition-colors"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
}
