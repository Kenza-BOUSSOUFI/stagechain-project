// src/hooks/useMM.js
import { useCallback } from 'react';
import { useToast } from '../common/ToastProvider';

export const useMM = () => {
  const toast = useToast();

  const sign = useCallback((action, cb) => {
    toast('MetaMask : signature en attente...', 'loading');
    
    setTimeout(() => {
      toast('Transaction envoyée...', 'loading');
      
      setTimeout(() => {
        toast(`✓ ${action} confirmé`, 'success');
        if (cb) cb();
      }, 1400);
    }, 1100);
  }, [toast]);

  return { sign };
};