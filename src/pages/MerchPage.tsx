import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, X } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import HalftoneOverlay from '../components/HalftoneOverlay';
import { MerchTitle } from '../components/MerchTitle';
import { AnimatedMerchSubtitle } from '../components/AnimatedMerchSubtitle';
import { SizeGuide } from '../components/SizeGuide';
import { ColorSwatch } from '../components/ColorSwatch';
import { SizeSelector } from '../components/SizeSelector';
import { QuantitySelector } from '../components/QuantitySelector';

interface ProductVariation {
  color: string;
  sizes: string[];
  inventory: Record<string, number>;
}

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  description: string;
  features: string[];
  variations: ProductVariation[];
}

const products: Product[] = [
  {
    id: 1,
    name: "FUUU Classic T-Shirt",
    price: 29.99,
    images: [
      "https://i.imgur.com/NkIVoHp.png",
      "https://i.imgur.com/eppZ5te.png"
    ],
    description: "Y U NO wearing this epic tee yet? The FUUU Classic T-Shirt combines the timeless rage comic aesthetic with premium comfort. Each masterpiece is hand-screened with the iconic FUUU face that started it all. Perfect for those 'I see what you did there' moments! 🎭",
    features: [
      "Much Cotton, Very Premium (100% Pure)",
      "True Story Bro Fit™",
      "Hand-screened Like a Boss",
      "Pre-shrunk (No 'Y U SHRINK' Moments)",
      "Challenge Accepted Quality",
      "Me Gusta Level Comfort"
    ],
    variations: [
      {
        color: "Black",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        inventory: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0 }
      },
      {
        color: "White",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        inventory: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0 }
      },
      {
        color: "Gray",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        inventory: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0 }
      }
    ]
  },
  {
    id: 2,
    name: "FUUU Rage Hoodie",
    price: 59.99,
    images: [
      "https://i.imgur.com/x5VUqG3.png",
      "https://i.imgur.com/f8SabPb.png"
    ],
    description: "Not sure if regular hoodie... or the comfiest meme wear ever! This ultra-cozy masterpiece features a gallery of classic rage faces that'll make NPCs do a double-take. Perfect for those 'Forever Alone' gaming sessions or 'Challenge Accepted' moments in public! 🎮",
    features: [
      "Cotton-Poly Blend (Like a Boss)",
      "Heavy AF 350gsm Fabric",
      "Double Hood (Because Two Hoods > One Hood)",
      "Pocket for Extra Memes",
      "Seams Strong Like Bull",
      "Maximum Trolling Comfort"
    ],
    variations: [
      {
        color: "Black",
        sizes: ["S", "M", "L", "XL", "XXL"],
        inventory: { "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0 }
      },
      {
        color: "Navy",
        sizes: ["S", "M", "L", "XL", "XXL"],
        inventory: { "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0 }
      }
    ]
  },
  {
    id: 3,
    name: "Meme Lord Boonie",
    price: 24.99,
    images: [
      "https://i.imgur.com/mf5zcjL.png"
    ],
    description: "POV: You're about to become the dankest meme lord in your area. This isn't your average boonie - it's a statement piece that screams 'I was there when rage comics ruled the internet!' Featuring premium embroidery that'll make other hats look like they're still using Impact font. 👑",
    features: [
      "360° of Pure Win",
      "Embroidery Level: Over 9000",
      "One Size Fits All Chads",
      "Moisture-wicking (No More Sweaty Forehead Guy)",
      "Wide Brim for Maximum Protection",
      "Ultimate Meme Lord Status"
    ],
    variations: [
      {
        color: "Black",
        sizes: ["One Size"],
        inventory: { "One Size": 0 }
      },
      {
        color: "Navy",
        sizes: ["One Size"],
        inventory: { "One Size": 0 }
      },
      {
        color: "Red",
        sizes: ["One Size"],
        inventory: { "One Size": 0 }
      }
    ]
  }
];

interface GalleryModalProps {
  product: Product;
  currentImage: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  product,
  currentImage,
  onClose,
  onPrevious,
  onNext
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onPrevious();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'Escape') handleClose();
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const overlaySpring = useSpring({
    opacity: isClosing ? 0 : 1,
    config: { duration: 300, easing: (t: number) => t * (2 - t) }
  });

  const modalSpring = useSpring({
    opacity: isClosing ? 0 : 1,
    transform: isClosing 
      ? 'scale(0.95) translateY(-20px)' 
      : 'scale(1) translateY(0px)',
    config: { duration: 300, easing: (t: number) => t * (2 - t) }
  });

  const imageSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { duration: 300 },
    key: currentImage
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <animated.div 
        style={overlaySpring}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
        onClick={handleClose}
      />
      <animated.div 
        style={modalSpring} 
        className="relative z-[60] max-h-[90vh] max-w-[90vw]"
      >
        <animated.img
          style={imageSpring}
          src={product.images[currentImage]}
          alt={`${product.name} view ${currentImage + 1}`}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
        
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white/90 hover:text-white transition-colors transform hover:scale-110 active:scale-95 duration-200"
        >
          <X className="w-8 h-8" />
        </button>
        
        {product.images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-all transform -translate-x-12 hover:-translate-x-14 hover:scale-110 active:scale-95 duration-200"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-all transform translate-x-12 hover:translate-x-14 hover:scale-110 active:scale-95 duration-200"
            >
              <ArrowLeft className="w-8 h-8 rotate-180" />
            </button>
          </>
        )}
        
        {product.images.length > 1 && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 transform ${
                  currentImage === index 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                }`}
              />
            ))}
          </div>
        )}
      </animated.div>
    </div>
  );
};

const ProductCard: React.FC<{
  product: Product;
  onImageClick: () => void;
  onNotifyClick: () => void;
}> = ({ product, onImageClick, onNotifyClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.variations[0].color);
  const [selectedSize, setSelectedSize] = useState(product.variations[0].sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const selectedVariation = product.variations.find(v => v.color === selectedColor);
  const currentInventory = selectedVariation?.inventory[selectedSize] || 0;
  const isOutOfStock = currentInventory === 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= Math.min(10, currentInventory)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div 
        className="relative cursor-pointer"
        onClick={onImageClick}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-64 object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
        {product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {product.images.map((_, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-white opacity-75"
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          {product.description}
        </p>
        
        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color
            </label>
            <div className="flex gap-4">
              {product.variations.map((variation) => (
                <ColorSwatch
                  key={variation.color}
                  color={variation.color}
                  isSelected={selectedColor === variation.color}
                  onClick={() => setSelectedColor(variation.color)}
                  label={variation.color}
                  inStock={Object.values(variation.inventory).some(stock => stock > 0)}
                />
              ))}
            </div>
          </div>

          <SizeSelector
            sizes={selectedVariation?.sizes || []}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            inventory={selectedVariation?.inventory || {}}
            onSizeGuideClick={() => setShowSizeGuide(true)}
          />

          <QuantitySelector
            quantity={quantity}
            onChange={handleQuantityChange}
            max={Math.min(10, currentInventory)}
            disabled={isOutOfStock}
          />
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {product.features.map((feature, index) => (
              <li key={index}>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price}
          </span>
          <button
            onClick={onNotifyClick}
            className="flex items-center gap-2 bg-[#ff7676] text-white px-4 py-2 rounded-lg hover:bg-[#ff6262] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 duration-200"
            disabled={isOutOfStock}
          >
            <Mail className="w-4 h-4" />
            <span>{isOutOfStock ? 'Sold Out' : 'Available Soon'}</span>
          </button>
        </div>
      </div>

      {showSizeGuide && (
        <SizeGuide onClose={() => setShowSizeGuide(false)} />
      )}
    </div>
  );
};

interface NotifyModalProps {
  product: Product;
  onClose: () => void;
}

const NotifyModal: React.FC<NotifyModalProps> = ({ product, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <animated.div 
        style={modalSpring}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transform hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
        {submitted ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Thank You!</h3>
            <p className="text-gray-600">
              We'll notify you when {product.name} becomes available.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4">Get Notified</h3>
            <p className="text-gray-600 mb-6">
              Enter your email to be notified when {product.name} becomes available.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7676] focus:border-transparent outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#ff7676] text-white px-6 py-3 rounded-lg hover:bg-[#ff6262] transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 duration-200"
              >
                <Mail className="w-4 h-4" />
                Notify Me
              </button>
            </form>
          </>
        )}
      </animated.div>
    </div>
  );
};

function MerchPage() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null);

  const handlePrevious = () => {
    if (!selectedProduct) return;
    setCurrentImage((prev) =>
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!selectedProduct) return;
    setCurrentImage((prev) =>
      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5] relative overflow-x-hidden">
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <HalftoneOverlay />
      </div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="flex flex-col items-center justify-center mb-12">
            <MerchTitle />
            <AnimatedMerchSubtitle />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onImageClick={() => {
                  setSelectedProduct(product);
                  setCurrentImage(0);
                }}
                onNotifyClick={() => setNotifyProduct(product)}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <GalleryModal
          product={selectedProduct}
          currentImage={currentImage}
          onClose={() => setSelectedProduct(null)}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}

      {notifyProduct && (
        <NotifyModal
          product={notifyProduct}
          onClose={() => setNotifyProduct(null)}
        />
      )}
    </div>
  );
}

export default MerchPage;
