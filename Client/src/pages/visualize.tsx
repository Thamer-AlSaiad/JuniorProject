"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import Navbar from "../components/Navbar"
import AnimatedBackground from "../components/AnimatedBackground"
import DatasetSelector from "../components/DatasetSelector"
import VisualizationCanvas from "../components/VisualizationCanvas"
import ControlPanel from "../components/ControlPanel"
import { DatasetType, Point, generateDataset } from "../utils/dataGenerator"
import {
  kMeansGenerator,
  dbscanGenerator,
  AlgorithmState
} from "../utils/clusteringAlgorithms"

type AlgorithmType = "dbscan" | "kmeans"| null;
type VisualizationStep = "algorithm" | "dataset" | "visualization";

export default function VisualizePage() {
  const [currentStep, setCurrentStep] = useState<VisualizationStep>("algorithm");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetType | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [ringCenters, setRingCenters] = useState<{ x: number; y: number; radius?: number }[]>([]);
  const [algorithmState, setAlgorithmState] = useState<AlgorithmState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const [kMeansParams, setKMeansParams] = useState({ k: 3, iterations: 10 });
  const [dbscanParams, setDbscanParams] = useState({ eps: 5, minPts: 4 });
  
  const [showEpsilonCircles, setShowEpsilonCircles] = useState(true);
  
  const algorithmGenerator = useRef<Generator<AlgorithmState> | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  const handleAlgorithmSelect = (algorithm: AlgorithmType) => {
    setSelectedAlgorithm(algorithm);
    setCurrentStep("dataset");
  };
  
  const handleDatasetSelect = (dataset: DatasetType) => {
    setSelectedDataset(dataset);
    const datasetResult = generateDataset(dataset, 750, dbscanParams.eps, dbscanParams.minPts);
    const pts = Array.isArray(datasetResult.points) ? datasetResult.points : [];
    const ctrs = Array.isArray(datasetResult.centers) ? datasetResult.centers : [];
    setPoints(pts);
    setRingCenters(ctrs);
    setAlgorithmState({
      points: pts.map((p: Point) => ({
        ...p,
        cluster: -2, 
        status: 'normal' as const
      })),
      step: 0,
      message: "Dataset loaded. Use controls to start clustering.",
      complete: false
    });
    setCurrentStep("visualization");
  };
  
  const handleParametersChange = (params: Record<string, number>) => {
    if (selectedAlgorithm === "kmeans") {
      if ('k' in params) {
        setKMeansParams(prev => ({ ...prev, k: params.k }));
      }
      if ('iterations' in params) {
        setKMeansParams(prev => ({ ...prev, iterations: params.iterations }));
      }
    } else if (selectedAlgorithm === "dbscan" && 'eps' in params && 'minPts' in params) {
      setDbscanParams({ eps: params.eps, minPts: params.minPts });
      if (selectedDataset === "rings") {
        const datasetResult = generateDataset("rings", 750, params.eps, params.minPts);
        const pts = Array.isArray(datasetResult.points) ? datasetResult.points : [];
        const ctrs = Array.isArray(datasetResult.centers) ? datasetResult.centers : [];
        setPoints(pts);
        setRingCenters(ctrs);
        setAlgorithmState({
          points: pts.map((p: Point) => ({
            ...p,
            cluster: -2, 
            status: 'normal' as const
          })),
          step: 0,
          message: "Dataset updated for new parameters.",
          complete: false
        });
      }
    }
  };
  
  const initializeAlgorithm = () => {
    if (!selectedAlgorithm || !points.length) return;
    
    if (selectedAlgorithm === "kmeans") {
      algorithmGenerator.current = kMeansGenerator(points, kMeansParams.k, kMeansParams.iterations);
    } else if (selectedAlgorithm === "dbscan") {
      algorithmGenerator.current = dbscanGenerator(points, dbscanParams.eps, dbscanParams.minPts);
    }
    
    if (algorithmGenerator.current) {
      const initialState = algorithmGenerator.current.next().value;
      if (initialState) {
        setAlgorithmState(initialState);
      }
    }
  };
  
  const runAlgorithm = () => {
    if (isRunning) return;
    if (!algorithmGenerator.current) {
      initializeAlgorithm();
      if (!algorithmGenerator.current) return;
    }

    setIsRunning(true);

    const runStep = () => {
      if (!algorithmGenerator.current) {
        setIsRunning(false);
        return;
      }

      const result = algorithmGenerator.current.next();

      if (result.done || result.value.complete) {
        setIsRunning(false);
        if (result.value) {
          setAlgorithmState(result.value);
        }
        return;
      }

      setAlgorithmState(result.value);

      const delay = selectedAlgorithm === "dbscan" ? 800 : 1200; 
      animationFrameId.current = requestAnimationFrame(() => {
        setTimeout(runStep, delay);
      });
    };

    runStep();
  };
  
  const stepAlgorithm = () => {
    if (!algorithmGenerator.current) {
      initializeAlgorithm();
      return;
    }
    
    const result = algorithmGenerator.current.next();
    
    if (result.value) {
      setAlgorithmState(result.value);
    }
  };
  
  const resetVisualization = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    setIsRunning(false);
    algorithmGenerator.current = null;
    
    if (selectedDataset) {
      const { points: freshPoints } = generateDataset(selectedDataset);
      setPoints(freshPoints);
      setAlgorithmState({
        points: freshPoints.map((p: Point) => ({
          ...p,
          cluster: -2, 
          status: 'normal' as const
        })),
        step: 0,
        message: "Reset complete. Ready to restart clustering.",
        complete: false
      });
    }
  };
  
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 -z-10">
        <AnimatedBackground />
      </div>
      <Navbar />
      {currentStep === "dataset" && selectedAlgorithm && (
        <div className="absolute top-32 left-8 z-20 mt-2">
          <Button
            onClick={() => setCurrentStep("algorithm")}
            className="bg-[#3d3450] hover:bg-[#4a4358] text-white text-sm"
            size="sm"
          >
            ← Back to Algorithm Selection
          </Button>
        </div>
      )}
      
      {currentStep === "visualization" && selectedAlgorithm && selectedDataset && (
        <div className="absolute top-32 left-4 flex flex-col gap-2">
          <Button 
            onClick={() => setCurrentStep("dataset")}
            className="bg-[#3d3450] hover:bg-[#4a4358] text-white text-sm"
            size="sm"
          >
            ← Change Dataset
          </Button>
          
          <Button 
            onClick={() => {
              setCurrentStep("algorithm");
              resetVisualization();
            }}
            className="bg-[#3d3450] hover:bg-[#4a4358] text-white text-sm"
            size="sm"
          >
            ← Change Algorithm
          </Button>
        </div>
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#f8f5ff] mb-6">
            Visualize Clustering Algorithms
          </h1>
          
          <p className="text-white mb-8 text-lg">
            Explore how different clustering algorithms work by visualizing them in action.
            {currentStep === "algorithm" && " Choose an algorithm below to get started."}
            {currentStep === "dataset" && " Now select a dataset to visualize."}
          </p>
          
          {currentStep === "algorithm" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Button
                onClick={() => handleAlgorithmSelect("kmeans")}
                className={`h-40 text-xl flex flex-col items-center justify-center p-6 ${
                  selectedAlgorithm === "kmeans"
                    ? "bg-[#593797] border-2 border-white"
                    : "bg-[#3d3450] hover:bg-[#4a4358]"
                }`}
              >
                <span className="text-2xl font-bold mb-2 text-white">K-Means</span>
                <span className="text-sm opacity-80 text-white px-2 text-center w-full truncate">
                  Centroid-based clustering
                </span>
                <span className="text-xs opacity-80 text-white px-2 text-center w-full truncate">
                  Groups data points around central points
                </span>
              </Button>

              <Button
                onClick={() => handleAlgorithmSelect("dbscan")}
                className={`h-40 text-xl flex flex-col items-center justify-center p-6 ${
                  selectedAlgorithm === "dbscan"
                    ? "bg-[#593797] border-2 border-white"
                    : "bg-[#3d3450] hover:bg-[#4a4358]"
                }`}
              >
                <span className="text-2xl font-bold mb-2 text-white">DBSCAN</span>
                <span className="text-sm opacity-80 text-white px-2 text-center w-full truncate">
                  Density-based clustering
                </span>
                <span className="text-xs opacity-80 text-white px-2 text-center w-full truncate">
                  Groups dense regions of data points
                </span>
              </Button>
            </div>
          )}
          
          {currentStep === "dataset" && selectedAlgorithm && (
            <div>
              <DatasetSelector 
                onSelect={handleDatasetSelect}
                selectedDataset={selectedDataset}
              />
            </div>
          )}
          
          {currentStep === "visualization" && selectedAlgorithm && selectedDataset && algorithmState && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedAlgorithm === "kmeans" ? "K-Means" : "DBSCAN"} on {selectedDataset.charAt(0).toUpperCase() + selectedDataset.slice(1)} Dataset
              </h2>
              
              <div className="bg-[#3d3450] text-white p-3 rounded-lg mb-4">
                <p>
                  <span className="font-bold">Step {algorithmState.step}: </span>
                  {algorithmState.message}
                </p>
              </div>
              
              <VisualizationCanvas
                points={algorithmState.points}
                eps={dbscanParams.eps}
                minPts={dbscanParams.minPts}
                ringCenters={ringCenters}
                showEpsilonCircles={showEpsilonCircles && selectedAlgorithm === "dbscan"}
                algorithmType={selectedAlgorithm}
                algorithmComplete={algorithmState.complete}
              />
              
              <div className="mt-6">
                <ControlPanel
                  algorithmType={selectedAlgorithm}
                  onParametersChange={handleParametersChange}
                  onRun={runAlgorithm}
                  onStep={stepAlgorithm}
                  onReset={resetVisualization}
                  isRunning={isRunning}
                  onShowEpsilonCircles={setShowEpsilonCircles}
                  showEpsilonCircles={showEpsilonCircles}
                />
              </div>
              
              <div className="mt-6 text-white text-left bg-[#2e283c] border border-[#3d3450] rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">How this works:</h3>
                {selectedAlgorithm === "kmeans" ? (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>K-means assigns data points to the nearest cluster centroid</li>
                    <li>After assignment, centroids are recalculated as the mean of all points in the cluster</li>
                    <li>This process repeats until convergence (minimal point movement)</li>
                    <li>K-means works best for spherical clusters of similar size</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>DBSCAN groups points based on density</li>
                    <li>Points with at least <strong>MinPts ({dbscanParams.minPts})</strong> neighbors within <strong>Epsilon ({dbscanParams.eps})</strong> distance are "core points"</li>
                    <li>Points reachable from core points form clusters</li>
                    <li>Outliers not reachable from any core point are noise (gray points)</li>
                    <li>DBSCAN can find clusters of arbitrary shape and identify noise</li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

