"use client"

import { useRef, useEffect, useState } from "react"
import { Point } from "../utils/dataGenerator"
import { VisPoint } from "../utils/clusteringAlgorithms"

interface VisualizationCanvasProps {
  points: Point[] | VisPoint[]
  width?: number
  height?: number
  padding?: number
  eps?: number  
  minPts?: number
  ringCenters?: { x: number; y: number; radius?: number }[]
  showEpsilonCircles?: boolean  
  algorithmType?: "kmeans" | "dbscan"
  algorithmComplete?: boolean 
}

export default function VisualizationCanvas({
  points,
  width = 600,
  height = 400,
  padding = 20,
  eps = 5,  
  minPts = 4,
  ringCenters = [],
  showEpsilonCircles = false,
  algorithmType = "dbscan",
  algorithmComplete = false
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width, height })
  const scaleX = (canvasSize.width - padding * 2) / 100
  const scaleY = (canvasSize.height - padding * 2) / 100
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
  
    const toScreenX = (x: number) => padding + x * scaleX
    const toScreenY = (y: number) => padding + y * scaleY
    const fromScreenX = (x: number) => (x - padding) / scaleX
    const fromScreenY = (y: number) => (y - padding) / scaleY
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const centroids: VisPoint[] = []
    const regularPoints: VisPoint[] = []
    
    const getClusterColor = (clusterIndex: number, isBackground = false) => {
      const hue = (clusterIndex * 137) % 360 
      if (isBackground) {
        return `hsla(${hue}, 90%, 60%, 0.3)` 
      } else {
        return `hsl(${hue}, 90%, ${clusterIndex === -1 ? '30%' : '50%'})` 
      }
    }
    
    points.forEach(point => {
      const visPoint = point as VisPoint
      if (visPoint.status === 'centroid') {
        centroids.push(visPoint)
      } else if (visPoint.status) { 
        regularPoints.push(visPoint)
      }
    })
    
    if (centroids.length > 0) {
      const cellSize = 1.5 
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      for (let x = 0; x < canvas.width; x += cellSize) {
        for (let y = 0; y < canvas.height; y += cellSize) {
          const dataX = fromScreenX(x)
          const dataY = fromScreenY(y)
          
          let minDist = Infinity
          let closestCentroidIndex = -1
          
          for (let i = 0; i < centroids.length; i++) {
            const centroid = centroids[i]
            const dx = centroid.x - dataX
            const dy = centroid.y - dataY
            const dist = dx*dx + dy*dy 
            
            if (dist < minDist) {
              minDist = dist
              closestCentroidIndex = centroid.cluster
            }
          }
          
          if (closestCentroidIndex >= 0) {
            ctx.fillStyle = getClusterColor(closestCentroidIndex, true)
            
            ctx.globalAlpha = 0.5 
            ctx.fillRect(x - 0.5, y - 0.5, cellSize + 1, cellSize + 1)
            ctx.globalAlpha = 1.0 
          }
        }
      }
    }
    
    regularPoints.forEach((point) => {
      if (!point.status) return
      
      const x = toScreenX(point.x)
      const y = toScreenY(point.y)
      
      if (point.highlightRadius !== undefined) {
        ctx.beginPath()
        ctx.arc(x, y, point.highlightRadius * scaleX, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.stroke()
      }
      
      if (point.connections && point.connections.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        point.connections.forEach(connection => {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(toScreenX(connection.x), toScreenY(connection.y))
          ctx.stroke()
        })
      }
    })
    
    regularPoints.forEach((point) => {
      const x = toScreenX(point.x)
      const y = toScreenY(point.y)
      let size = 4
      
      let fillColor = '#ffffff' 
      
      if (point.status === 'highlighted') {
        size = 6
        fillColor = '#ffff00' 
      } else if (point.cluster === -1) { 
        fillColor = '#444444'
      } else if (typeof point.cluster === 'number' && point.cluster >= 0) {
        fillColor = getClusterColor(point.cluster)
      }
      
      if (point.status === 'core') {
        size += 1 
      }
      
      if (point.status === 'highlighted') {
        ctx.beginPath()
        ctx.arc(x, y, size + 2, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      }
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = fillColor
      ctx.fill()
    })
    
    centroids.forEach((centroid) => {
      const x = toScreenX(centroid.x)
      const y = toScreenY(centroid.y)
      const size = 8 
      
      ctx.beginPath()
      ctx.arc(x, y, size + 2, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = getClusterColor(centroid.cluster)
      ctx.fill()
    })
    
    if (algorithmType === "dbscan" && showEpsilonCircles && eps && !algorithmComplete) {
      regularPoints.forEach((point) => {
        const x = toScreenX(point.x)
        const y = toScreenY(point.y)
        const radius = eps * scaleX
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 1
        ctx.stroke()
        
      })
    }
    
    if (ringCenters.length > 0 && eps && algorithmType === "dbscan") {
      ringCenters.forEach(center => {
        const screenX = toScreenX(center.x);
        const screenY = toScreenY(center.y);
        const screenR = eps * scaleX;
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 100, 100, 0.15)';
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }
    
  }, [points, canvasSize.width, canvasSize.height, scaleX, scaleY, padding, eps, minPts, ringCenters, showEpsilonCircles, algorithmType, algorithmComplete])
  
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement
      if (!container) return
      
      const containerWidth = container.clientWidth
      const newWidth = Math.min(containerWidth, width)
      const newHeight = (height / width) * newWidth
      
      setCanvasSize({ 
        width: newWidth, 
        height: newHeight 
      })
    }
    
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width, height])
  
  return (
    <div className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="bg-[#1e1e1e] border border-[#3d3450] rounded-lg shadow-lg"
      />
    </div>
  )
}
