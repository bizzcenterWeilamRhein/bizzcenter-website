'use client';

import React from 'react';
import {
  MapPin, Shield, TrendingUp, Zap, Mail, Package, Phone,
  Monitor, Users, Building2, Globe, Calendar, CheckCircle,
  Briefcase, Home, FileText, Scale, Clock, Key, Landmark,
  type LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'map-pin': MapPin,
  'shield': Shield,
  'trending-up': TrendingUp,
  'zap': Zap,
  'mail': Mail,
  'package': Package,
  'phone': Phone,
  'monitor': Monitor,
  'users': Users,
  'building': Building2,
  'globe': Globe,
  'calendar': Calendar,
  'check': CheckCircle,
  'briefcase': Briefcase,
  'home': Home,
  'file-text': FileText,
  'scale': Scale,
  'clock': Clock,
  'key': Key,
  'landmark': Landmark,
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: string;
  iconColor?: string;
}

export function FeatureCard({ title, description, icon, iconColor }: FeatureCardProps) {
  const color = iconColor || 'var(--color-primary, #0039D1)';
  const IconComponent = icon ? iconMap[icon] : null;

  return (
    <div className="flex flex-col items-start p-6 rounded-xl glass-1 hover:glass-2 transition-all">
      <div className="flex items-center gap-3 mb-3">
        {IconComponent && (
          <div
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <IconComponent size={20} style={{ color }} strokeWidth={1.8} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
