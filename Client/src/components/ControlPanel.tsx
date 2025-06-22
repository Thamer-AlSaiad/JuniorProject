"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"

interface ControlPanelProps {
  algorithmType: "kmeans" | "dbscan"
  onParametersChange: (params: Record<string, number>) => void
  onRun: () => void
  onStep: () => void
  onReset: () => void
  isRunning: boolean
  onShowEpsilonCircles?: (show: boolean) => void
  showEpsilonCircles?: boolean
}

export default function ControlPanel({
  algorithmType,
  onParametersChange,
  onRun,
  onStep,
  onReset,
  isRunning,
  onShowEpsilonCircles,
  showEpsilonCircles = false
}: ControlPanelProps) {
  const [kValue, setKValue] = useState(3)
  const [iterations, setIterations] = useState(10)
  

  const [epsilon, setEpsilon] = useState(5)
  const [minPoints, setMinPoints] = useState(4)
  

  const handleKValueChange = (value: number[]) => {
    const newK = value[0]
    setKValue(newK)
    onParametersChange({ k: newK })
  }
  
  const handleIterationsChange = (value: number[]) => {
    const newIterations = value[0]
    setIterations(newIterations)
    onParametersChange({ iterations: newIterations })
  }
  
  const handleEpsilonChange = (value: number[]) => {
    const newEpsilon = value[0]
    setEpsilon(newEpsilon)
    onParametersChange({ eps: newEpsilon, minPts: minPoints })
  }
  
  const handleMinPointsChange = (value: number[]) => {
    const newMinPoints = value[0]
    setMinPoints(newMinPoints)
    onParametersChange({ eps: epsilon, minPts: newMinPoints })
  }
  
  return (
    <div className="bg-[#2e283c] border border-[#3d3450] rounded-lg p-4 mb-6">
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Hyper-Parameters Adjustment Panel</h4>
        
        {algorithmType === "kmeans" ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-white">Number of Clusters (k): {kValue}</label>
              </div>
              <Slider
                defaultValue={[kValue]}
                min={2}
                max={10}
                step={1}
                onValueChange={handleKValueChange}
                disabled={isRunning}
                className="py-2"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-white">Number of Iterations: {iterations}</label>
              </div>
              <Slider
                defaultValue={[iterations]}
                min={1}
                max={20}
                step={1}
                onValueChange={handleIterationsChange}
                disabled={isRunning}
                className="py-2"
              />
              <div className="text-xs text-gray-400 mt-1">
                Number of iterations to run the algorithm
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-white">Epsilon (distance): {epsilon}</label>
              </div>
              <Slider
                defaultValue={[epsilon]}
                min={1}
                max={20}
                step={0.5}
                onValueChange={handleEpsilonChange}
                disabled={isRunning}
                className="py-2"
              />
              <div className="text-xs text-gray-400 mt-1">
                Controls the maximum distance between points in the same cluster
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-white">Minimum Points: {minPoints}</label>
              </div>
              <Slider
                defaultValue={[minPoints]}
                min={2}
                max={15}
                step={1}
                onValueChange={handleMinPointsChange}
                disabled={isRunning}
                className="py-2"
              />
              <div className="text-xs text-gray-400 mt-1">
                Minimum number of points required to form a dense region
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEpsilonCircles}
                  onChange={(e) => onShowEpsilonCircles?.(e.target.checked)}
                  className="w-4 h-4 text-[#593797] bg-gray-100 border-gray-300 rounded focus:ring-[#593797] focus:ring-2"
                />
                <span>Show Epsilon Circles</span>
              </label>
              <div className="text-xs text-gray-400 mt-1">
                Visualize the epsilon distance around each point
              </div>
            </div>
          </>
        )}
      </div>
      

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onRun}
          disabled={isRunning}
          className="bg-[#593797] hover:bg-[#432970] text-white"
        >
          {isRunning ? "Running..." : "Run Algorithm"}
        </Button>
        
        <Button
          onClick={onStep}
          disabled={isRunning}
          className="bg-[#3d3450] hover:bg-[#4a4358] text-white"
        >
          Step Forward
        </Button>
        
        <Button
          onClick={onReset}
          className="bg-[#3d3450] hover:bg-[#4a4358] text-white"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
