import React from "react";
import { Badge } from "@/components/ui/badge";
import { Award, Star, AlertTriangle } from "lucide-react";

export default function PerformanceTierBadge({ tier, score, size = "default" }) {
  const configs = {
    Preferred: {
      color: "bg-gradient-to-r from-emerald-600 to-green-600 text-white",
      icon: Award,
      label: "⭐ Preferred"
    },
    Standard: {
      color: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
      icon: Star,
      label: "Standard"
    },
    Watch: {
      color: "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
      icon: AlertTriangle,
      label: "⚠️ Watch"
    }
  };

  const config = configs[tier] || configs.Standard;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  return (
    <Badge className={`${config.color} ${sizeClasses[size]} font-semibold shadow-lg`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
      {score && <span className="ml-1.5">({score})</span>}
    </Badge>
  );
}