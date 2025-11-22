import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function FieldPermission({ field, requiredRoles = [], children }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const operatingMode = localStorage.getItem('tms_operating_mode') || 'broker';
  
  const hasPermission = () => {
    if (!user) return false;
    if (requiredRoles.length === 0) return true;
    
    if (requiredRoles.includes('admin') && user.role === 'admin') return true;
    if (requiredRoles.includes('broker') && operatingMode === 'broker') return true;
    if (requiredRoles.includes('carrier') && operatingMode === 'carrier') return true;
    if (requiredRoles.includes('dispatcher') && user.role === 'dispatcher') return true;
    
    return false;
  };

  if (!hasPermission()) return null;

  return <>{children}</>;
}

export function useFieldPermissions() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const operatingMode = localStorage.getItem('tms_operating_mode') || 'broker';

  const canView = (field, requiredRoles = []) => {
    if (!user || requiredRoles.length === 0) return true;
    if (requiredRoles.includes('admin') && user.role === 'admin') return true;
    if (requiredRoles.includes('broker') && operatingMode === 'broker') return true;
    if (requiredRoles.includes('carrier') && operatingMode === 'carrier') return true;
    return false;
  };

  const canEdit = (field, requiredRoles = []) => {
    return canView(field, requiredRoles);
  };

  return { canView, canEdit, userRole: user?.role, operatingMode };
}