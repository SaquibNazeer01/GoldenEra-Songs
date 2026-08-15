import React, { useEffect, useRef } from 'react';
import { EnvironmentMode } from '../types';

interface CabinWindowProps {
  environment: EnvironmentMode;
  isFullscreenView?: boolean;
  onToggleFullscreenView?: () => void;
}

export const CabinWindow: React.FC<CabinWindowProps> = ({
  environment,
  isFullscreenView = false,
  onToggleFullscreenView
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Weather particles animation (Rain, Snow, Mist, Floating embers, Night Stars, Flying Birds)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particles setup
    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      size: number;
      opacity: number;
      swing?: number;
      swingSpeed?: number;
    }

    interface Bird {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      wingAngle: number;
      wingSpeed: number;
      size: number;
    }

    interface Star {
      x: number;
      y: number;
      radius: number;
      twinkleSpeed: number;
      phase: number;
    }

    const rainParticles: Particle[] = [];
    for (let i = 0; i < 160; i++) {
      rainParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: 14 + Math.random() * 12,
        speedX: -2.5 - Math.random() * 2,
        size: 14 + Math.random() * 18,
        opacity: 0.3 + Math.random() * 0.4
      });
    }

    const snowParticles: Particle[] = [];
    for (let i = 0; i < 110; i++) {
      snowParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: 1.2 + Math.random() * 2.2,
        speedX: -0.8 + Math.random() * 1.6,
        size: 2 + Math.random() * 3.8,
        opacity: 0.4 + Math.random() * 0.5,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: 0.02 + Math.random() * 0.03
      });
    }

    const stars: Star[] = [];
    for (let i = 0; i < 75; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.55),
        radius: 0.8 + Math.random() * 1.5,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2
      });
    }

    const birds: Bird[] = [
      { x: -50, y: height * 0.22, speedX: 1.1, speedY: -0.05, wingAngle: 0, wingSpeed: 0.12, size: 6 },
      { x: -120, y: height * 0.28, speedX: 0.95, speedY: 0.02, wingAngle: 1.5, wingSpeed: 0.11, size: 5 },
      { x: -180, y: height * 0.25, speedX: 1.05, speedY: -0.02, wingAngle: 3.0, wingSpeed: 0.13, size: 4.5 }
    ];

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Stars for Night and Clear Sunset
      if (environment === 'night' || environment === 'sunset') {
        const starAlphaBase = environment === 'night' ? 0.85 : 0.3;
        stars.forEach(star => {
          const alpha = starAlphaBase * (0.4 + 0.6 * Math.sin(time * star.twinkleSpeed * 60 + star.phase));
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 250, 230, ${alpha})`;
          ctx.fill();
        });
      }

      // 2. Flying Birds in Morning / Sunset
      if (environment === 'morning' || environment === 'sunset') {
        birds.forEach(bird => {
          bird.x += bird.speedX;
          bird.y += bird.speedY;
          bird.wingAngle += bird.wingSpeed;

          if (bird.x > width + 100) {
            bird.x = -60 - Math.random() * 80;
            bird.y = height * (0.15 + Math.random() * 0.25);
          }

          // Draw silhouette bird
          ctx.save();
          ctx.translate(bird.x, bird.y);
          ctx.fillStyle = environment === 'sunset' ? '#2a1610' : '#22303c';
          ctx.beginPath();
          const wingSpan = bird.size * 2;
          const wingFlap = Math.sin(bird.wingAngle) * (bird.size * 0.8);
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-wingSpan * 0.5, -wingFlap, -wingSpan, -wingFlap * 0.5);
          ctx.quadraticCurveTo(-wingSpan * 0.4, -wingFlap * 0.2, 0, 1);
          ctx.quadraticCurveTo(wingSpan * 0.4, -wingFlap * 0.2, wingSpan, -wingFlap * 0.5);
          ctx.quadraticCurveTo(wingSpan * 0.5, -wingFlap, 0, 0);
          ctx.fill();
          ctx.restore();
        });
      }

      // 3. Rain Particles
      if (environment === 'rainy') {
        ctx.strokeStyle = 'rgba(210, 230, 255, 0.45)';
        ctx.lineWidth = 1.2;
        rainParticles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * (width + 100);
          }

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.size);
          ctx.stroke();
        });
      }

      // 4. Snow Particles
      if (environment === 'snowy') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        snowParticles.forEach(p => {
          if (p.swing !== undefined && p.swingSpeed !== undefined) {
            p.swing += p.swingSpeed;
            p.x += p.speedX + Math.sin(p.swing) * 0.8;
          } else {
            p.x += p.speedX;
          }
          p.y += p.speedY;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [environment]);

  // Environment Background Gradients & Mountain Colors
  const getSkyStyle = () => {
    switch (environment) {
      case 'morning':
        return 'from-[#7eb0d5] via-[#cfdbe6] to-[#f4e2cb]';
      case 'sunset':
        return 'from-[#2e1d3e] via-[#943e49] via-[#cf673e] to-[#f5b85a]';
      case 'night':
        return 'from-[#070b14] via-[#0d1627] to-[#1a233a]';
      case 'rainy':
        return 'from-[#2c3742] via-[#485664] to-[#697988]';
      case 'snowy':
        return 'from-[#8ba3b8] via-[#b6c7d6] to-[#e1ecf4]';
      default:
        return 'from-[#2e1d3e] via-[#cf673e] to-[#f5b85a]';
    }
  };

  const getSunMoon = () => {
    switch (environment) {
      case 'morning':
        return (
          <div className="absolute top-10 right-28 w-16 h-16 rounded-full bg-gradient-to-tr from-[#ffe8b3] to-[#fffde6] shadow-[0_0_50px_20px_rgba(255,235,170,0.6)] opacity-90 animate-pulse" />
        );
      case 'sunset':
        return (
          <div className="absolute bottom-28 left-1/3 w-24 h-24 rounded-full bg-gradient-to-t from-[#ff5a22] to-[#ffc848] shadow-[0_0_80px_35px_rgba(255,120,40,0.6)] opacity-95" />
        );
      case 'night':
        return (
          <div className="absolute top-8 right-24">
            <div className="w-14 h-14 rounded-full bg-[#fdf8dd] shadow-[0_0_40px_15px_rgba(253,248,221,0.45)] relative overflow-hidden">
              <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-[#0d1627] opacity-80" />
            </div>
            <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-blue-200/10 blur-xl pointer-events-none" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="cabin-window-container"
      className={`relative overflow-hidden rounded-t-3xl border-8 border-[#301c10] shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_15px_35px_rgba(0,0,0,0.9)] bg-black transition-all duration-1000 ${
        isFullscreenView ? 'fixed inset-4 z-50 rounded-2xl border-12' : 'w-full h-72 sm:h-84 md:h-96'
      }`}
    >
      {/* 1. Sky Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getSkyStyle()} transition-colors duration-1000`} />

      {/* 2. Celestial Body (Sun/Moon) */}
      {getSunMoon()}

      {/* 3. Distant Himalayan Snowy Peaks (Layer 1 - Deep Background) */}
      <svg
        className="absolute bottom-0 w-full h-44 sm:h-56 opacity-90 transition-all duration-1000"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
      >
        <path
          d="M0,400 L0,220 L120,130 L210,180 L350,90 L460,190 L590,110 L700,170 L830,80 L940,160 L1000,120 L1000,400 Z"
          fill={
            environment === 'night'
              ? '#141d2f'
              : environment === 'sunset'
              ? '#4a2533'
              : environment === 'rainy'
              ? '#3a4752'
              : '#d0dfea'
          }
        />
        {/* Snow Caps Highlight */}
        <path
          d="M350,90 L320,130 L380,130 Z M830,80 L800,120 L860,120 Z M120,130 L100,160 L140,160 Z M590,110 L565,145 L615,145 Z"
          fill={
            environment === 'night'
              ? '#2c3b58'
              : environment === 'sunset'
              ? '#ffaa85'
              : '#ffffff'
          }
          opacity={environment === 'night' ? 0.3 : 0.85}
        />
      </svg>

      {/* 4. Mid-Ground Himalayan Pine Mountain Ridges (Layer 2) */}
      <svg
        className="absolute bottom-0 w-full h-36 sm:h-48 opacity-95 transition-all duration-1000"
        viewBox="0 0 1000 350"
        preserveAspectRatio="none"
      >
        <path
          d="M0,350 L0,160 Q180,90 320,170 T680,140 Q840,100 1000,190 L1000,350 Z"
          fill={
            environment === 'night'
              ? '#0d1522'
              : environment === 'sunset'
              ? '#2a1618'
              : environment === 'rainy'
              ? '#28343e'
              : '#3b5847'
          }
        />
      </svg>

      {/* 5. Near Pine Tree Silhouettes (Layer 3) */}
      <div className="absolute bottom-0 inset-x-0 h-28 flex justify-between items-end px-2 pointer-events-none opacity-90">
        {/* Pine group left */}
        <div className="flex items-end space-x-[-12px]">
          <div className="w-12 h-28 bg-[#130b08] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          <div className="w-16 h-36 bg-[#0e0705] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          <div className="w-10 h-24 bg-[#180e0a] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
        </div>

        {/* Distant valley light or mountain temple torch */}
        {environment === 'night' && (
          <div className="mb-4 flex space-x-8">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_3px_rgba(251,191,36,0.8)] animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)] animate-ping" />
          </div>
        )}

        {/* Pine group right */}
        <div className="flex items-end space-x-[-10px]">
          <div className="w-10 h-22 bg-[#180e0a] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          <div className="w-14 h-32 bg-[#0e0705] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          <div className="w-16 h-40 bg-[#130b08] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
        </div>
      </div>

      {/* 6. Dynamic Moving Fog & Mist (CSS animated layers) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="fog-layer-1 absolute bottom-8 left-[-10%] w-[120%] h-24 bg-gradient-to-t from-white/20 via-white/10 to-transparent blur-md rounded-full opacity-60" />
        <div className="fog-layer-2 absolute bottom-20 left-[-5%] w-[110%] h-16 bg-gradient-to-t from-white/15 via-white/5 to-transparent blur-lg rounded-full opacity-40" />
      </div>

      {/* 7. Canvas Weather Particles (Rain, Snow, Stars, Birds) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* 8. Window Wooden Panes & Cross Mullions (Colonial Hill Station Style) */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-2 z-20">
        {/* Glass reflection gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.09]" />

        {/* Vertical Wooden Bars */}
        <div className="col-span-1 border-r-4 border-[#24150b] shadow-[inset_-1px_0_3px_rgba(255,255,255,0.1),1px_0_4px_rgba(0,0,0,0.8)]" />
        <div className="col-span-1 border-r-4 border-[#24150b] shadow-[inset_-1px_0_3px_rgba(255,255,255,0.1),1px_0_4px_rgba(0,0,0,0.8)]" />
        <div className="col-span-1" />

        {/* Horizontal Wooden Bar */}
        <div className="absolute top-1/2 inset-x-0 h-4 bg-[#24150b] -translate-y-1/2 border-y border-[#3d2414] shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
      </div>

      {/* 9. Condensation droplets & Mountain Location Badge */}
      <div className="absolute top-4 left-5 z-30 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-amber-900/40 text-[11px] font-mono-radio text-amber-200/90 tracking-wider">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>HIMALAYAN VIEW • 7,467 FT</span>
      </div>

      {/* Fullscreen Mountain View Toggle Button */}
      {onToggleFullscreenView && (
        <button
          id="toggle-window-view-btn"
          onClick={onToggleFullscreenView}
          className="absolute top-4 right-5 z-30 bg-black/60 hover:bg-black/85 transition-all text-amber-200/80 hover:text-amber-100 px-3 py-1.5 rounded-full border border-amber-700/50 text-xs font-mono-radio flex items-center space-x-1.5 shadow-lg"
          title={isFullscreenView ? 'Close Full Mountain View' : 'Open Fullscreen Mountain View'}
        >
          <span>{isFullscreenView ? '✕ Close View' : '🪟 Full View'}</span>
        </button>
      )}
    </div>
  );
};
