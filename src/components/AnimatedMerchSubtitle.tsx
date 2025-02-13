import React from 'react';
import { useSpring, animated } from '@react-spring/web';

export const AnimatedMerchSubtitle = () => {
  // Initial entrance animation
  const entranceSpring = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(20px) scale(0.95)',
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0px) scale(1)',
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 18,
    },
    delay: 800,
  });

  // Continuous floating animation
  const floatingSpring = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      while (true) {
        await next({ transform: 'translateY(-5px)' });
        await next({ transform: 'translateY(0px)' });
      }
    },
    config: {
      mass: 1,
      tension: 150,
      friction: 25,
    },
    delay: 1600,
  });

  return (
    <animated.div
      style={{
        ...entranceSpring,
        fontFamily: 'Inter, sans-serif',
        textShadow: '0 0 10px rgba(255, 118, 118, 0.3)',
        letterSpacing: '0.02em',
      }}
      className="text-xl md:text-2xl text-black/85 font-medium mb-8 tracking-tight"
    >
      <animated.div style={floatingSpring}>
        wear your memes with pride
      </animated.div>
    </animated.div>
  );
};