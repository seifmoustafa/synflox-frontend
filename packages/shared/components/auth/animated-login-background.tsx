"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@shared/providers/settings-provider";

interface AnimatedLoginBackgroundProps {
  mousePos: { x: number; y: number };
  cursorTrail: Array<{ x: number; y: number; id: number }>;
  ripples: Array<{ x: number; y: number; id: number }>;
}

export function AnimatedLoginBackground({ mousePos, cursorTrail, ripples }: AnimatedLoginBackgroundProps) {
  const settings = useSettings();
  const hasAnim = settings.animationLevel !== "none";
  const isHigh = settings.animationLevel === "high";

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Dynamic Gradient Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 transition-all duration-1000"
        style={{
          background: isHigh 
            ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, hsl(var(--primary) / 0.08) 0%, transparent 50%), linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--primary) / 0.03) 100%)`
            : undefined
        }}
      />

      {/* Animated Mesh Grid */}
      {hasAnim && (
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'mesh-scroll 20s linear infinite'
          }}
        />
      )}

      {/* Floating Gradient Orbs */}
      {hasAnim && (
        <>
          <div className="absolute w-[600px] h-[600px] top-0 right-0 -translate-y-1/2 translate-x-1/3 bg-primary/10 rounded-full blur-3xl animate-orb-1" />
          <div className="absolute w-[500px] h-[500px] bottom-0 left-0 translate-y-1/2 -translate-x-1/3 bg-primary/15 rounded-full blur-3xl animate-orb-2" />
          <div className="absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/8 rounded-full blur-3xl animate-orb-3" />
        </>
      )}

      {/* Hexagon Pattern */}
      {hasAnim && (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='43' viewBox='0 0 50 43' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L50 14.4V28.9L25 43.3L0 28.9V14.4L25 0z' fill='none' stroke='hsl(var(--primary))' stroke-width='0.5' /%3E%3C/svg%3E")`,
            backgroundSize: '50px 43px'
          }}
        />
      )}

      {/* Circuit Board Pattern */}
      {isHigh && (
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="hsl(var(--primary))" opacity="0.3" />
                <circle cx="150" cy="50" r="2" fill="hsl(var(--primary))" opacity="0.3" />
                <circle cx="50" cy="150" r="2" fill="hsl(var(--primary))" opacity="0.3" />
                <circle cx="150" cy="150" r="2" fill="hsl(var(--primary))" opacity="0.3" />
                <line x1="50" y1="50" x2="150" y2="50" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
                <line x1="50" y1="50" x2="50" y2="150" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
                <line x1="150" y1="50" x2="150" y2="150" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
                <line x1="50" y1="150" x2="150" y2="150" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>
      )}

      {/* DNA Helix Strands */}
      {isHigh && (
        <div className="absolute inset-0 overflow-hidden opacity-[0.05]">
          {[...Array(3)].map((_, i) => (
            <div
              key={`dna-${i}`}
              className="absolute w-1 h-full"
              style={{
                left: `${20 + i * 30}%`,
                background: `repeating-linear-gradient(
                  0deg,
                  hsl(var(--primary)) 0px,
                  transparent 10px,
                  transparent 20px,
                  hsl(var(--primary)) 30px
                )`,
                animation: `dna-float ${8 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Star Field */}
      {isHigh && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(var(--primary) / ${0.2 + Math.random() * 0.4})`,
                animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Particles with Glow */}
      {isHigh && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full bg-primary/40 blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `100%`,
                animation: `particle-float ${15 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Diagonal Light Rays */}
      {hasAnim && (
        <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
          {[...Array(5)].map((_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute w-px h-[200%] bg-gradient-to-b from-transparent via-primary to-transparent"
              style={{
                left: `${i * 25}%`,
                transform: 'rotate(15deg)',
                animation: `ray-move ${10 + i * 2}s linear infinite`,
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Cursor Trail Effect */}
      {isHigh && cursorTrail.map((pos, index) => (
        <div
          key={pos.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none mix-blend-screen"
          style={{
            left: pos.x,
            top: pos.y,
            background: `hsl(var(--primary) / ${0.4 - index * 0.02})`,
            transform: `scale(${1 - index * 0.05})`,
            transition: 'all 0.1s ease-out'
          }}
        />
      ))}

      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2 border-primary/40 pointer-events-none animate-ripple"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40
          }}
        />
      ))}

      {/* Scanline Effect */}
      {isHigh && (
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, hsl(var(--primary)) 0px, transparent 1px, transparent 2px)',
            animation: 'scanline 8s linear infinite'
          }}
        />
      )}

      {/* Vignette Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.4) 100%)'
        }}
      />

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
        }}
      />
    </div>
  );
}
