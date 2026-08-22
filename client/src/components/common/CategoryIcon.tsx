import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  CreditCard,
  MoreHorizontal,
  Banknote,
  Laptop,
  Briefcase,
  TrendingUp,
  PlusCircle,
  Tag,
  LucideProps,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface CategoryIconProps extends Omit<LucideProps, 'color' | 'name'> {
  name?: string | null;
  color?: string | null;
  className?: string;
  withContainer?: boolean;
}

const iconMap: Record<string, React.FC<LucideProps>> = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  receipt: Receipt,
  film: Film,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  plane: Plane,
  'credit-card': CreditCard,
  'more-horizontal': MoreHorizontal,
  banknote: Banknote,
  laptop: Laptop,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  'plus-circle': PlusCircle,
  tag: Tag,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  color = '#64748B',
  className,
  withContainer = false,
  ...props
}) => {
  const IconComponent = (name && iconMap[name.toLowerCase()]) || Tag;
  const resolvedColor = color || '#94a3b8';

  if (withContainer) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-700/60',
          className
        )}
        style={{
          backgroundColor: `${resolvedColor}18`,
          borderColor: `${resolvedColor}35`,
        }}
      >
        <IconComponent
          className="w-4.5 h-4.5"
          style={{ color: resolvedColor }}
          {...props}
        />
      </div>
    );
  }

  return (
    <IconComponent
      className={cn('w-4 h-4 shrink-0', className)}
      style={{ color: resolvedColor }}
      {...props}
    />
  );
};
