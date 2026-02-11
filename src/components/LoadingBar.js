"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LoadingContext = createContext();

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    setLoading(requests > 0);
  }, [requests]);

  const startLoading = () => {
    setRequests((prev) => prev + 1);
  };

  const stopLoading = () => {
    setRequests((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    // Intercept fetch to auto-trigger loading
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      startLoading();
      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        stopLoading();
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-9999 h-1 bg-amber-900/20">
          <div className="h-full bg-linear-to-r from-orange-500 via-amber-500 to-orange-500 animate-loading-bar origin-left shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}
