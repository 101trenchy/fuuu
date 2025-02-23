import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ShoppingBag } from 'lucide-react';
import { useSpring, animated, config } from '@react-spring/web';
import { LoadingText } from './LoadingText';
import { XLogo } from './XLogo';

interface AnimatedNavButtonProps {
  children: React.ReactNode;
  delay: number;
  onClick: () => void;
}

const AnimatedNavButton: React.FC<AnimatedNavButtonProps> = ({ children, delay, onClick }) => {
  const springProps = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(20px)'
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0px)'
    },
    delay,
    config: { ...config.easeOut, duration: 500 }
  });

  return (
    <animated.div
      style={springProps}
      className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md pointer-events-auto cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      {children}
    </animated.div>
  );
};

export const AnimatedNavButtons: React.FC<{
  contractAddress: string;
  copied: boolean;
  onCopy: () => void;
}> = ({ contractAddress, copied, onCopy }) => {
  const navigate = useNavigate();

  const openTwitter = () => {
    window.open('https://twitter.com/FUUUtoken', '_blank');
  };

  const openMerch = () => {
    navigate('/merch');
  };

  return (
    <div className="flex gap-3">
      <AnimatedNavButton delay={200} onClick={onCopy}>
        <LoadingText />
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-500" />
        )}
      </AnimatedNavButton>

      <AnimatedNavButton delay={400} onClick={openTwitter}>
        <span className="font-mono text-gray-700">Follow</span>
        <XLogo className="w-4 h-4 text-gray-700" />
      </AnimatedNavButton>

      <AnimatedNavButton delay={600} onClick={openMerch}>
        <span className="font-mono text-gray-700">Merch</span>
        <ShoppingBag className="w-4 h-4 text-gray-700" />
      </AnimatedNavButton>
    </div>
  );
};