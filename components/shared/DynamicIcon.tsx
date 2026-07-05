"use client";

import {
  MapPin,
  Plane,
  Sparkles,
  Wine,
  UtensilsCrossed,
  Bed,
  HeartHandshake,
  Compass,
  Wifi,
  Hotel,
  Users,
  Sparkle,
  Clock,
  Briefcase,
  CircleDollarSign,
  Landmark,
  Church,
  Castle,
  Flower2,
  ShoppingBag,
  ConciergeBell,
  Flame,
  History,
  Footprints,
  Palette,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  Plane,
  Sparkles,
  Wine,
  UtensilsCrossed,
  Bed,
  HeartHandshake,
  Compass,
  Wifi,
  Hotel,
  Users,
  Sparkle,
  Clock,
  Briefcase,
  CircleDollarSign,
  Landmark,
  Church,
  Castle,
  Flower2,
  ShoppingBag,
  ConciergeBell,
  Flame,
  History,
  Footprints,
  Palette,
};

interface DynamicIconProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const Icon = iconMap[name] || Sparkles;
  return <Icon className={className} strokeWidth={1.2} />;
}
