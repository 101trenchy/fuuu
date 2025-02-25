import React from 'react';
import { useSpring, animated } from '@react-spring/web';

export const MerchTitle = () => {
  const letters = '$FUUU Merch'.split('');
  
  const baseAnimation = {
    from: { 
      y: -50,
      opacity: 0,
      scale: 0.3,
      rotate: -20,
      filter: 'blur(10px)'
    },
    to: { 
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: 'blur(0px)'
    },
    config: {
      tension: 200,
      friction: 12
    }
  };

  const glowAnimation = useSpring({
    from: { textShadow: '0 0 0px rgba(255,118,118,0)' },
    to: async (next) => {
      while (true) {
        await next({ textShadow: '0 0 20px rgba(255,118,118,0.6)' });
        await next({ textShadow: '0 0 5px rgba(255,118,118,0.2)' });
      }
    },
    config: { duration: 2000 }
  });

  const letterAnimations = letters.map((_, index) => 
    useSpring({
      ...baseAnimation,
      delay: 100 * index,
      from: {
        ...baseAnimation.from,
        rotate: index === 0 ? 20 : -20
      }
    })
  );

  return (
    <h1 className="text-8xl font-black select-none mb-4 flex items-center justify-center" 
        style={{ 
          fontFamily: 'Rubik, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
      {letters.map((letter, index) => (
        <animated.span
          key={index}
          style={{
            ...letterAnimations[index],
            ...glowAnimation,
            display: 'inline-block',
            color: 'rgb(255, 118, 118)',
            transformOrigin: 'center center',
          }}
          className={letter === ' ' ? 'w-4' : ''}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </animated.span>
      ))}
    </h1>
  );
};