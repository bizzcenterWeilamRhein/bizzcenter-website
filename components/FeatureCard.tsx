'use client';

import React from 'react';
import {
  MapPin, Shield, TrendingUp, Zap, Mail, Package, Phone,
  Monitor, Users, Building2, Globe, Calendar, CheckCircle,
  Briefcase, Home, FileText, Scale, Clock, Key, Landmark,
  Wifi, Sun, Leaf, Armchair, Columns, Laptop, Coffee, Heart,
  Repeat, Map, Tag,
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
  'wifi': Wifi,
  'sun': Sun,
  'leaf': Leaf,
  'armchair': Armchair,
  'columns': Columns,
  'laptop': Laptop,
  'coffee': Coffee,
  'heart': Heart,
  'repeat': Repeat,
  'map': Map,
  'tag': Tag,
};

function FlagDeCh({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="4" width="10" height="3" fill="#000000" rx="0.5" />
      <rect x="1" y="7" width="10" height="3" fill="#DD0000" />
      <rect x="1" y="10" width="10" height="3" fill="#FFCC00" rx="0.5" />
      <rect x="13" y="4" width="10" height="9" fill="#D52B1E" rx="1" />
      <rect x="16.5" y="6" width="3" height="5" fill="white" rx="0.3" />
      <rect x="15" y="7.5" width="6" height="2" fill="white" rx="0.3" />
      <path d="M8 16 L12 19 L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const customIcons: Record<string, React.FC<{ size?: number }>> = {
  'flag-de-ch': FlagDeCh,
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: string;
  iconColor?: string;
}

export function FeatureCard({ title, description, icon, iconColor }: FeatureCardProps) {
  const color = iconColor || 'var(--color-primary, #6b7f3e)';
  const IconComponent = icon ? iconMap[icon] : null;
  const CustomIcon = icon ? customIcons[icon] : null;

  return (
    <div className="flex flex-col items-start p-6 rounded-xl bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        {(IconComponent || CustomIcon) && (
          <div
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: CustomIcon ? 'transparent' : `${color}15` }}
          >
            {CustomIcon ? <CustomIcon size={20} /> : IconComponent && <IconComponent size={20} style={{ color }} strokeWidth={1.8} />}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
