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
  isPrimary?: boolean;
}

const AnimatedNavButton: React.FC<AnimatedNavButtonProps> = ({ children, delay, onClick, isPrimary = false }) => {
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

  const glowSpring = useSpring({
    from: { textShadow: '0 0 0px rgba(255,118,118,0)' },
    to: async (next) => {
      while (true) {
        await next({ textShadow: '0 0 20px rgba(255,118,118,0.6)' });
        await next({ textShadow: '0 0 5px rgba(255,118,118,0.2)' });
      }
    },
    config: { duration: 2000 },
    pause: !isPrimary
  });

  return (
    <animated.div
      style={springProps}
      className="flex items-center gap-2 pointer-events-auto cursor-pointer transition-colors"
    >
      <animated.div
        style={isPrimary ? glowSpring : undefined}
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors duration-200
          ${isPrimary 
            ? 'bg-[#ff7676] hover:bg-[#ff6262] text-white'
            : 'bg-white hover:bg-gray-50'
          }
        `}
      >
        {children}
      </animated.div>
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
    window.open('https://x.com/FUUUCoin', '_blank');
  };

  const openMerch = () => {
    navigate('/merch');
  };

  return (
    <div className="flex gap-3">
      <AnimatedNavButton delay={200} onClick={onCopy} isPrimary={true}>
        <LoadingText />
        {copied ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <Copy className="w-4 h-4 text-white" />
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