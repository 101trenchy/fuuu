import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max: number;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChange,
  max,
  disabled = false
}) => {
  const numberSpring = useSpring({
    number: quantity,
    config: { tension: 300, friction: 20 }
  });

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= max) {
      onChange(value);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Quantity
      </label>
      <div className="flex items-stretch">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1 || disabled}
          className={`
            flex items-center justify-center w-10 rounded-l-lg border
            transition-all duration-200
            ${disabled
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
              : 'hover:bg-gray-50 active:bg-gray-100 border-gray-300'
            }
          `}
        >
          <Minus className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
        
        <div className="relative flex-1">
          <input
            type="number"
            min="1"
            max={max}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2 text-center border-y
              focus:outline-none focus:ring-0
              ${disabled
                ? 'bg-gray-50 border-gray-200 text-gray-400'
                : 'border-gray-300 text-gray-900'
              }
            `}
          />
          <animated.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center font-medium"
            style={{
              opacity: numberSpring.number.to(n => Math.abs(Math.round(n) - n)),
            }}
          >
            {Math.round(numberSpring.number.get())}
          </animated.div>
        </div>
        
        <button
          onClick={() => onChange(Math.min(max, quantity + 1))}
          disabled={quantity >= max || disabled}
          className={`
            flex items-center justify-center w-10 rounded-r-lg border
            transition-all duration-200
            ${disabled
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
              : 'hover:bg-gray-50 active:bg-gray-100 border-gray-300'
            }
          `}
        >
          <Plus className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
      </div>
      
      {!disabled && (
        <div className="mt-1 text-xs text-gray-500">
          {max} items available
        </div>
      )}
    </div>
  );
};