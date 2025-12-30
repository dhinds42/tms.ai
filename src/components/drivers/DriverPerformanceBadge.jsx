import React from "react";
import { Badge } from "@/components/ui/badge";
import { Award, Star, TrendingUp, GraduationCap } from "lucide-react";

export default function DriverPerformanceBadge({ tier, score, size = "default" }) {
  const configs = {
    Elite: {
      color: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
      icon: Award,
      label: "⭐ Elite"
    },
    Professional: {
      color: "bg-gradient-to-r from-emerald-600 to-green-600 text-white",
      icon: Star,
      label: "Professional"
    },
    Standard: {
      color: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
      icon: TrendingUp,
      label: "Standard"
    },
    Training: {
      color: "bg-gradient-to-r from-slate-500 to-gray-500 text-white",
      icon: GraduationCap,
      label: "Training"
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