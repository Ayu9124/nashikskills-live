import React from 'react';
import { TICKER_ITEMS } from '../data';

export const Ticker = () => (
  <div className="h-7 bg-s1 border-b border-b1 overflow-hidden flex items-center mt-[52px]">
    <div className="flex gap-14 whitespace-nowrap animate-ticker">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} className="font-mono text-[10px] text-muted flex items-center gap-2">
          <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          {item.text}
        </span>
      ))}
    </div>
  </div>
);
