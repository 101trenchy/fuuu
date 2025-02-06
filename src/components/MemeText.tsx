import React from 'react';

export const MemeText = () => {
  const text = "the story that started all memecoins";
  const words = text.split(' ');
  
  return (
    <div className="inline-flex items-center flex-wrap justify-center mb-8">
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          {wordIndex > 0 && <span className="w-[0.3em]" />}
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              className="inline-block font-normal text-xl md:text-2xl text-black/90"
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                animation: `
                  glow ${2 + (charIndex % 3) * 0.5}s infinite ${(wordIndex * 0.2 + charIndex * 0.1)}s
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
          @keyframes glow {
            0%, 100% {
              opacity: 0.9;
              filter: brightness(1);
            }
            50% {
              opacity: 1;
              filter: brightness(1.1);
            }
          }
        `}
      </style>
    </div>
  );
};