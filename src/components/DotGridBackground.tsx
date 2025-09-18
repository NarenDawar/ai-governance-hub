'use client';

import { useCallback, useMemo } from 'react';
import Particles, { IParticlesProps } from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { ISourceOptions } from 'tsparticles-engine'; // Import the correct type

interface DotGridBackgroundProps {
  opacity?: number;
  color?: string;
  size?: number;
}

export default function DotGridBackground({
  opacity = 0.5,
  color = "#4299e1", // Tailwind blue-500
  size = 1
}: DotGridBackgroundProps) {
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // console.log(container); // Optional: for debugging
  }, []);

  // --- THIS IS THE FIX ---
  // We explicitly tell TypeScript that this object conforms to the ISourceOptions type.
  const options: ISourceOptions = useMemo(() => ({
    fullScreen: {
      enable: false,
    },
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: {
          enable: false,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "grab",
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        grab: {
          distance: 150,
          links: {
            opacity: opacity * 1.5,
          }
        }
      },
    },
    particles: {
      color: {
        value: color,
      },
      links: {
        color: color,
        distance: 150,
        enable: true,
        opacity: opacity,
        width: size,
        triangles: {
          enable: true,
          color: color,
          opacity: opacity * 0.2
        }
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 0.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: opacity,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 2 },
      },
    },
    detectRetina: true,
  }), [opacity, color, size]);

  return (
    <Particles
      id="tsparticles-grid-background"
      init={particlesInit}
      loaded={particlesLoaded}
      options={options}
      className="absolute inset-0 z-0"
    />
  );
}