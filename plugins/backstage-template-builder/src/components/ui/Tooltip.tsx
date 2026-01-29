import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children || (
            <button
              type="button"
              className="inline-flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="z-50 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 shadow-xl max-w-xs"
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-zinc-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
