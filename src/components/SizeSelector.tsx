import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Ruler } from 'lucide-react';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  inventory: Record<string, number>;
  onSizeGuideClick: () => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeChange,
  inventory,
  onSizeGuideClick
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Size
        </label>
        <button
          onClick={onSizeGuideClick}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <Ruler className="w-4 h-4" />
          Size Guide
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => {
          const inStock = inventory[size] > 0;
          const isSelected = size === selectedSize;
          
          const springProps = useSpring({
            scale: isSelected ? 1.05 : 1,
            config: { tension: 300, friction: 10 }
          });

          return (
            <animated.button
              key={size}
              style={{
                transform: springProps.scale.to(s => `scale(${s})`)
              }}
              onClick={() => onSizeChange(size)}
              className={`
                py-2 px-4 rounded-lg border-2 text-sm font-medium
                transition-all duration-200
                ${isSelected
                  ? 'border-[#ff7676] bg-[#fff5f5] text-[#ff7676]'
                  : inStock
                    ? 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'
                    : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                }
                ${isSelected ? 'shadow-sm' : ''}
              `}
              disabled={!inStock}
            >
              {size}
              {!inStock && (
                <span className="block text-xs text-gray-400 font-normal">
                  Out of Stock
                </span>
              )}
            </animated.button>
          );
        })}
      </div>
    </div>
  );
};