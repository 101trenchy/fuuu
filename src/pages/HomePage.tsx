import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { useNavigate } from 'react-router-dom';
import { RAGE_FACES, FACE_TYPES, PHYSICS_CONFIG, VIEWPORT_BREAKPOINTS, FACE_COUNT_RANGES } from '../constants';
import type { RageFace } from '../types';
import HalftoneOverlay from '../components/HalftoneOverlay';
import { soundManager } from '../sounds';
import { AnimatedTitle } from '../components/AnimatedTitle';
import { AnimatedSubtitle } from '../components/AnimatedSubtitle';
import { AnimatedNavButtons } from '../components/AnimatedNavButtons';

function HomePage() {
  const navigate = useNavigate();
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>();
  const renderRef = useRef<Matter.Render>();
  const facesRef = useRef<RageFace[]>([]);
  const spawnCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const imageDimensionsRef = useRef<Record<string, { width: number; height: number }>>({});
  const [maxFaces, setMaxFaces] = useState<number>(getMaxFacesForViewport());
  const [copied, setCopied] = useState(false);
  const contractAddress = "No CA yet...";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  function getViewportCategory(width: number) {
    if (width < VIEWPORT_BREAKPOINTS.mobile) return 'mobile';
    if (width < VIEWPORT_BREAKPOINTS.tablet) return 'tablet';
    if (width < VIEWPORT_BREAKPOINTS.desktop) return 'desktop';
    return 'large';
  }

  function getMaxFacesForViewport() {
    const width = window.innerWidth;
    const category = getViewportCategory(width);
    const range = FACE_COUNT_RANGES[category];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  function getScaledDimensions(width: number) {
    const viewportWidth = window.innerWidth;
    const baseScale = viewportWidth < VIEWPORT_BREAKPOINTS.mobile ? 0.8 :
                     viewportWidth < VIEWPORT_BREAKPOINTS.tablet ? 1 :
                     viewportWidth < VIEWPORT_BREAKPOINTS.desktop ? 1.2 : 1.4;
    
    return {
      minWidth: PHYSICS_CONFIG.minWidth * baseScale,
      maxWidth: PHYSICS_CONFIG.maxWidth * baseScale
    };
  }

  useEffect(() => {
    if (!sceneRef.current) return;

    const preloadImages = async () => {
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };

      for (const [type, url] of Object.entries(RAGE_FACES)) {
        try {
          const img = await loadImage(url);
          imageDimensionsRef.current[type] = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
        } catch (error) {
          console.error(`Failed to load image for ${type}:`, error);
        }
      }
    };

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.5, scale: 0.001 }
    });
    
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
      },
    });

    engineRef.current = engine;
    renderRef.current = render;

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.4,
        render: {
          visible: false
        }
      }
    });

    render.mouse = mouse;
    render.mouse.pixelRatio = window.devicePixelRatio;

    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const isDragged = mouseConstraint.body === pair.bodyA || mouseConstraint.body === pair.bodyB;
        
        if (pair.bodyA.isStatic || pair.bodyB.isStatic) return;
        
        if (isDragged) {
          soundManager.play('collision', 0.4);
        } else {
          soundManager.play('collision', 0.2);
        }
      });
    });

    Matter.Events.on(mouseConstraint, 'startdrag', () => {
      soundManager.play('drag');
    });

    Matter.Events.on(mouseConstraint, 'enddrag', () => {
      soundManager.play('drop');
    });
    
    Matter.World.add(engine.world, mouseConstraint);

    const boundaries = [
      Matter.Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight + 30,
        window.innerWidth,
        60,
        { 
          isStatic: true,
          friction: 0.2,
          restitution: 0.8,
          render: { visible: false }
        }
      ),
      Matter.Bodies.rectangle(
        -30,
        window.innerHeight / 2,
        60,
        window.innerHeight,
        { 
          isStatic: true,
          friction: 0.2,
          restitution: 0.8,
          render: { visible: false }
        }
      ),
      Matter.Bodies.rectangle(
        window.innerWidth + 30,
        window.innerHeight / 2,
        60,
        window.innerHeight,
        { 
          isStatic: true,
          friction: 0.2,
          restitution: 0.8,
          render: { visible: false }
        }
      )
    ];

    Matter.World.add(engine.world, boundaries);
    Matter.Runner.run(engine);
    Matter.Render.run(render);

    const spawnFace = () => {
      if (spawnCountRef.current >= maxFaces) {
        return;
      }

      const type = FACE_TYPES[Math.floor(Math.random() * FACE_TYPES.length)];
      const { minWidth, maxWidth } = getScaledDimensions(window.innerWidth);
      const desiredWidth = Math.random() * (maxWidth - minWidth) + minWidth;
      const x = Math.random() * (window.innerWidth - desiredWidth);
      const rotation = (Math.random() - 0.5) * Math.PI;

      const originalDimensions = imageDimensionsRef.current[type] || { width: 100, height: 100 };
      const aspectRatio = originalDimensions.height / originalDimensions.width;
      
      const scaledWidth = desiredWidth;
      const scaledHeight = desiredWidth * aspectRatio;
      const scale = desiredWidth / originalDimensions.width;

      const face: RageFace = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x,
        rotation,
        width: scaledWidth,
        height: scaledHeight,
      };

      const body = Matter.Bodies.rectangle(
        x + scaledWidth / 2,
        -100,
        scaledWidth,
        scaledHeight,
        {
          density: 0.001,
          restitution: 0.6,
          friction: 0.1,
          frictionAir: 0.001,
          angle: rotation,
          render: {
            sprite: {
              texture: RAGE_FACES[type],
              xScale: scale,
              yScale: scale,
            },
          },
        }
      );

      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

      Matter.World.add(engine.world, body);
      facesRef.current.push(face);
      spawnCountRef.current++;
    };

    const initializeSystem = async () => {
      await preloadImages();
      startTimeRef.current = Date.now();

      const initialBurst = Math.min(PHYSICS_CONFIG.initialBurst, maxFaces);
      for (let i = 0; i < initialBurst; i++) {
        setTimeout(spawnFace, i * 50);
      }

      const spawnWithDecay = () => {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= PHYSICS_CONFIG.spawnDuration || spawnCountRef.current >= maxFaces) {
          return;
        }

        spawnFace();

        const progress = elapsed / PHYSICS_CONFIG.spawnDuration;
        const baseInterval = 50;
        const nextInterval = baseInterval * Math.exp(progress * PHYSICS_CONFIG.decayRate);

        setTimeout(spawnWithDecay, nextInterval);
      };

      setTimeout(spawnWithDecay, initialBurst * 50);
    };

    initializeSystem();

    const handleResize = () => {
      const newMaxFaces = getMaxFacesForViewport();
      setMaxFaces(newMaxFaces);

      if (renderRef.current) {
        renderRef.current.canvas.width = window.innerWidth;
        renderRef.current.canvas.height = window.innerHeight;
      }

      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.World.add(engineRef.current.world, boundaries);
      }

      spawnCountRef.current = 0;
      facesRef.current = [];
      startTimeRef.current = Date.now();

      const initialBurst = Math.min(PHYSICS_CONFIG.initialBurst, newMaxFaces);
      for (let i = 0; i < initialBurst; i++) {
        setTimeout(spawnFace, i * 50);
      }
    };

    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      Matter.Render.stop(render);
      Matter.Runner.stop(engine);
      Matter.World.clear(engine.world, false);
      render.canvas.remove();
    };
  }, [maxFaces]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5] overflow-hidden relative">
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <HalftoneOverlay />
      </div>
      <div ref={sceneRef} className="w-full h-screen relative" style={{ zIndex: 10 }} />
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center" style={{ 
        zIndex: 20,
        paddingTop: '8vh'
      }}>
        <AnimatedTitle />
        <AnimatedSubtitle />
        <AnimatedNavButtons
          contractAddress={contractAddress}
          copied={copied}
          onCopy={copyToClipboard}
        />
      </div>
    </div>
  );
}

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default HomePage;