import React from 'react';
import { Check } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

interface ColorSwatchProps {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  label: string;
  inStock: boolean;
}

const getColorStyles = (colorName: string) => {
  const colors: Record<string, { bg: string, border: string }> = {
    'Black': { bg: 'bg-gray-900', border: 'border-gray-900' },
    'White': { bg: 'bg-white', border: 'border-gray-200' },
    'Gray': { bg: 'bg-gray-500', border: 'border-gray-500' },
    'Navy': { bg: 'bg-blue-900', border: 'border-blue-900' },
    'Red': { bg: 'bg-red-600', border: 'border-red-600' },
  };
  return colors[colorName] || { bg: 'bg-gray-200', border: 'border-gray-200' };
};

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  isSelected,
  onClick,
  label,
  inStock
}) => {
  const { bg, border } = getColorStyles(color);
  
  const springProps = useSpring({
    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
    config: { tension: 300, friction: 10 }
  });

  return (
    <div className="relative group">
      <animated.button
        style={springProps}
        onClick={onClick}
        className={`
          w-10 h-10 rounded-full ${bg} ${border} border-2
          flex items-center justify-center
          transition-shadow duration-200
          ${inStock ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-50'}
          ${isSelected ? 'shadow-md ring-2 ring-offset-2 ring-[#ff7676]' : ''}
        `}
        disabled={!inStock}
        aria-label={`Select ${label} color`}
      >
        {isSelected && (
          <Check 
            className={`w-5 h-5 ${color === 'White' ? 'text-gray-900' : 'text-white'}`} 
          />
        )}
      </animated.button>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          {label} {!inStock && '(Out of Stock)'}
        </div>
      </div>
    </div>
  );
};