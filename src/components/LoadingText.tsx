import React from 'react';

export const LoadingText = () => {
  const words = "No CA yet...".split(' ');
  
  return (
    <div className="inline-flex items-center">
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          {wordIndex > 0 && <span className="w-[0.3em]" />}
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              className="inline-block font-mono text-white animate-bounce"
              style={{
                animationDelay: `${(wordIndex * word.length + charIndex) * 0.1}s`,
                animationDuration: '1s',
                opacity: 0.9,
                transform: 'translateY(0)',
                animation: `
                  bounce 1s infinite ${(wordIndex * word.length + charIndex) * 0.1}s,
                  fade 2s infinite ${(wordIndex * word.length + charIndex) * 0.1}s
                `
              }}
            >
              {char}
            </span>
          ))}
        </React.Fragment>
      ))}
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.9;
            }
            50% {
              transform: translateY(-0.5em);
              opacity: 1;
            }
          }
          @keyframes fade {
            0%, 100% {
              opacity: 0.9;
            }
            50% {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};