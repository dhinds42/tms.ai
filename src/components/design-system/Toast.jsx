import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

/**
 * Toast - Standard toast notifications
 * 
 * Usage:
 * import { showToast } from '@/components/design-system';
 * showToast.success('Saved successfully');
 * showToast.error('Failed to save');
 */

export const showToast = {
  success: (message) => {
    const event = new CustomEvent('show-toast', {
      detail: { type: 'success', message }
    });
    window.dispatchEvent(event);
  },
  error: (message) => {
    const event = new CustomEvent('show-toast', {
      detail: { type: 'error', message }
    });
    window.dispatchEvent(event);
  },
  warning: (message) => {
    const event = new CustomEvent('show-toast', {
      detail: { type: 'warning', message }
    });
    window.dispatchEvent(event);
  },
  info: (message) => {
    const event = new CustomEvent('show-toast', {
      detail: { type: 'info', message }
    });
    window.dispatchEvent(event);
  }
};

export function ToastProvider({ children }) {
  React.useEffect(() => {
    const handleToast = (e) => {
      const { type, message } = e.detail;
      const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info
      };
      const Icon = icons[type];
      
      // Create toast element
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right ${
        type === 'success' ? 'bg-emerald-600 text-white' :
        type === 'error' ? 'bg-red-600 text-white' :
        type === 'warning' ? 'bg-amber-600 text-white' :
        'bg-blue-600 text-white'
      }`;
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
            type === 'error' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' :
            type === 'warning' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>' :
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
        </svg>
        <span class="font-medium">${message}</span>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.transition = 'opacity 300ms';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    };
    
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);
  
  return children;
}