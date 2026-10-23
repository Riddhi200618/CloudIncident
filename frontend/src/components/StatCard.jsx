import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'white',
  badgeText,
  onClick,
}) {
  const variantStyles = {
    white: {
      container: 'bg-white border-[#DCCBBC] text-[#24191A] hover:border-[#501B24]/40 shadow-sm',
      number: 'text-[#501B24]',
      label: 'text-[#651F2B]',
      subtitle: 'text-[#857172]',
      badge: 'bg-[#F4DDE2] text-[#501B24] border-[#EAC4CF]',
      iconBg: 'bg-[#FAF5EE] text-[#501B24]',
    },
    burgundy: {
      container: 'bg-[#501B24] border-[#651F2B] text-[#F7EFE6] hover:bg-[#5D202B] shadow-editorial-dark',
      number: 'text-[#EAC4CF]',
      label: 'text-[#F4DDE2]',
      subtitle: 'text-[#DCCBBC]',
      badge: 'bg-[#651F2B] text-[#EAC4CF] border-[#7A2B39]',
      iconBg: 'bg-[#651F2B] text-[#EAC4CF]',
    },
    blush: {
      container: 'bg-[#EAC4CF] border-[#DFB0BD] text-[#501B24] hover:bg-[#E5BCC8] shadow-sm',
      number: 'text-[#501B24]',
      label: 'text-[#501B24]',
      subtitle: 'text-[#651F2B]',
      badge: 'bg-white/80 text-[#501B24] border-[#DFB0BD]',
      iconBg: 'bg-white/60 text-[#501B24]',
    },
    cream: {
      container: 'bg-[#FAF5EE] border-[#DCCBBC] text-[#24191A] hover:border-[#651F2B]/40 shadow-sm',
      number: 'text-[#651F2B]',
      label: 'text-[#501B24]',
      subtitle: 'text-[#857172]',
      badge: 'bg-[#EAC4CF] text-[#501B24] border-[#DFB0BD]',
      iconBg: 'bg-white text-[#651F2B]',
    },
  };

  const style = variantStyles[variant] || variantStyles.white;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 md:p-6 rounded-xl border transition-all duration-200 h-full flex flex-col justify-between min-h-[160px] ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${style.container}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className={`text-xs font-semibold tracking-wider uppercase truncate ${style.label}`}>
            {title}
          </span>
        </div>
        {badgeText && (
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap ${style.badge}`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Metric Value */}
      <div className="my-2">
        <span className={`text-4xl sm:text-5xl font-display tracking-tight leading-none block ${style.number}`}>
          {value}
        </span>
      </div>

      {/* Subtitle / Context at bottom */}
      <div>
        <p className={`text-xs font-medium leading-relaxed ${style.subtitle}`}>
          {subtitle || '—'}
        </p>
      </div>

      {/* Subtle corner graphic accent */}
      <div className="absolute bottom-2 right-2 text-xs font-mono opacity-20 pointer-events-none select-none">
        //
      </div>
    </div>
  );
}
