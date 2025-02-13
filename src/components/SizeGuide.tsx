import React from 'react';
import { X } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

interface SizeGuideProps {
  onClose: () => void;
}

export const SizeGuide: React.FC<SizeGuideProps> = ({ onClose }) => {
  const modalSpring = useSpring({
    from: { 
      opacity: 0,
      transform: 'scale(0.9) translateY(20px)'
    },
    to: { 
      opacity: 1,
      transform: 'scale(1) translateY(0px)'
    },
    config: { 
      tension: 280,
      friction: 20
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <animated.div 
        style={modalSpring}
        className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transform hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h3 className="text-2xl font-bold mb-6">Size Guide</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">Size</th>
                <th className="py-3 px-4 text-left">Chest (inches)</th>
                <th className="py-3 px-4 text-left">Length (inches)</th>
                <th className="py-3 px-4 text-left">Sleeve (inches)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: 'XS', chest: '34-36', length: '26', sleeve: '23' },
                { size: 'S', chest: '36-38', length: '27', sleeve: '24' },
                { size: 'M', chest: '38-40', length: '28', sleeve: '25' },
                { size: 'L', chest: '40-42', length: '29', sleeve: '26' },
                { size: 'XL', chest: '42-44', length: '30', sleeve: '27' },
                { size: 'XXL', chest: '44-46', length: '31', sleeve: '28' },
              ].map((row) => (
                <tr key={row.size} className="border-b last:border-b-0">
                  <td className="py-3 px-4 font-medium">{row.size}</td>
                  <td className="py-3 px-4">{row.chest}</td>
                  <td className="py-3 px-4">{row.length}</td>
                  <td className="py-3 px-4">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <h4 className="font-medium mb-2">How to Measure</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Chest: Measure around the fullest part of your chest</li>
            <li>Length: Measure from shoulder seam to bottom hem</li>
            <li>Sleeve: Measure from shoulder seam to end of sleeve</li>
          </ul>
        </div>
      </animated.div>
    </div>
  );
};