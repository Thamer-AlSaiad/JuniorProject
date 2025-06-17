import { motion } from "framer-motion"
import { useMemo } from "react"

import asset2Svg from "../assets/Asset 2.svg"
import brainSvg from "../assets/Brain.svg"
import lampSvg from "../assets/lamp.svg"

interface BackgroundElement {
  id: string
  size: number
  xPos: number
  yPos: number
  opacity: number
  image: string
  blur: number
  animation: {
    y: number[]
    x: number[]
    scale: number[]
    rotate: number[]
    opacity?: number[]
  }
  transition: {
    duration: number
  }
}

export default function AnimatedBackground() {
  const svgAssets = [asset2Svg, brainSvg, lampSvg];
  
  const mediumElements = useMemo(() => {
    return [...Array(8)].map((_, i) => {
      const size = Math.random() * 50 + 70;
      const xPos = Math.random() * 100;
      const yPos = Math.random() * 100;
      const opacity = Math.random() * 0.4 + 0.15;
      const blur = Math.random() * 1.5;
      const randomSvg = svgAssets[Math.floor(Math.random() * svgAssets.length)];
      
      return {
        id: `med-${i}`,
        size,
        xPos,
        yPos,
        opacity,
        image: randomSvg,
        blur,
        animation: {
          y: [0, Math.random() * 60 - 30],
          x: [0, Math.random() * 60 - 30],
          scale: [1, Math.random() * 0.2 + 0.9],
          rotate: [0, Math.random() * 20 - 10],
        },
        transition: {
          duration: Math.random() * 6 + 8,
        }
      } as BackgroundElement;
    });
  }, []);
  
  const smallElements = useMemo(() => {
    return [...Array(10)].map((_, i) => {
      const size = Math.random() * 30 + 20;
      const xPos = Math.random() * 100;
      const yPos = Math.random() * 100;
      const opacity = Math.random() * 0.3 + 0.1;
      const blur = Math.random() * 0.5;
      const randomSvg = svgAssets[Math.floor(Math.random() * svgAssets.length)];
      
      return {
        id: `small-${i}`,
        size,
        xPos,
        yPos,
        opacity,
        image: randomSvg,
        blur,
        animation: {
          y: [0, Math.random() * 90 - 45],
          x: [0, Math.random() * 90 - 45],
          scale: [1, Math.random() * 0.3 + 0.8],
          rotate: [0, Math.random() * 30 - 15],
          opacity: [opacity, Math.random() * 0.2 + 0.1],
        },
        transition: {
          duration: Math.random() * 5 + 6,
        }
      } as BackgroundElement;
    });
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2e283c] via-[#301a45] to-[#1a1625]" />
      
      {mediumElements.map((element) => (
        <motion.img
          key={element.id}
          src={element.image}
          className="absolute"
          style={{
            width: element.size,
            height: element.size,
            left: `${element.xPos}%`,
            top: `${element.yPos}%`,
            opacity: element.opacity,
            filter: `blur(${element.blur}px) drop-shadow(0 0 8px rgba(186, 104, 200, 0.3))`,
          }}
          animate={element.animation}
          transition={{
            ...element.transition,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
      
      {smallElements.map((element) => (
        <motion.img
          key={element.id}
          src={element.image}
          className="absolute"
          style={{
            width: element.size,
            height: element.size,
            left: `${element.xPos}%`,
            top: `${element.yPos}%`,
            opacity: element.opacity,
            filter: `blur(${element.blur}px) drop-shadow(0 0 6px rgba(186, 104, 200, 0.4))`,
          }}
          animate={element.animation}
          transition={{
            ...element.transition,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

