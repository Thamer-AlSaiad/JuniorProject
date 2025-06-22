import { Point } from "./dataGenerator";

function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateCentroid(points: Point[]): Point {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length
  };
}

function clonePoints<T extends Point>(points: T[]): T[] {
  return points.map(p => ({ ...p })) as T[];
}

export type PointStatus = 
  | 'normal'      
  | 'highlighted' 
  | 'centroid'    
  | 'core'        
  | 'border'      
  | 'noise';      

export interface VisPoint extends Point {
  cluster: number;  
  status: PointStatus;
  connections?: VisPoint[]; 
  highlightRadius?: number; 
}

export interface AlgorithmState {
  points: VisPoint[];
  step: number;
  message: string;
  complete: boolean;
}

export function* kMeansGenerator(
  initialPoints: Point[],
  k: number,
  iterations: number = 10
): Generator<AlgorithmState> {
  if (initialPoints.length === 0 || k <= 0) {
    yield { points: [], step: 0, message: "No points or invalid k value", complete: true };
    return;
  }
  
  const points: VisPoint[] = initialPoints.map(p => ({
    ...p,
    cluster: -2, 
    status: 'normal'
  }));
  
  const centroids: VisPoint[] = [];
  const usedIndices = new Set<number>();
  
  while (centroids.length < k && centroids.length < points.length) {
    const randomIndex = Math.floor(Math.random() * points.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      centroids.push({
        x: points[randomIndex].x,
        y: points[randomIndex].y,
        cluster: centroids.length,
        status: 'centroid'
      });
    }
  }
  
  points.forEach(point => {
    point.cluster = -2; 
  });
  
  yield {
    points: [...points, ...centroids],
    step: 0,
    message: "Initial random centroids placed with random assignments",
    complete: false
  };

  let iteration = 0;
  let changed = true;
  
  while (changed && iteration < iterations) { 
    changed = false;
    iteration++;
    yield { 
      points: [...points, ...centroids], 
      step: iteration * 2 - 1, 
      message: `Step ${iteration}: Assigning each point to nearest centroid...`, 
      complete: false 
    };
    
    for (const point of points) {
      let minDist = Infinity;
      let closestCentroidIndex = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = distance(point, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          closestCentroidIndex = i;
        }
      }
      
      if (point.cluster !== closestCentroidIndex) {
        point.cluster = closestCentroidIndex;
        changed = true;
      }
    }
    
    yield { 
      points: [...points, ...centroids], 
      step: iteration * 2, 
      message: `Step ${iteration}: Points assigned to clusters`, 
      complete: false 
    };
    
    if (!changed) {
      yield { 
        points: [...points, ...centroids], 
        step: iteration * 2 + 1, 
        message: "K-means has converged!", 
        complete: true 
      };
      break;
    }
    
    for (let i = 0; i < centroids.length; i++) {
      const clusterPoints = points.filter(p => p.cluster === i);
      
      if (clusterPoints.length > 0) {
        const newCentroid = calculateCentroid(clusterPoints);
        const oldPosition = clonePoints([{
          x: centroids[i].x,
          y: centroids[i].y,
          cluster: i,
          status: 'normal' as PointStatus
        }])[0];
        
        centroids[i].connections = [oldPosition];
        centroids[i].x = newCentroid.x;
        centroids[i].y = newCentroid.y;
      }
    }
    
    yield { 
      points: [...points, ...centroids], 
      step: iteration * 2 + 1, 
      message: `Step ${iteration}: Centroids updated to cluster means`, 
      complete: false 
    };
    
    centroids.forEach(c => {
      c.connections = undefined;
    });
  }
  
  yield { 
    points: [...points, ...centroids], 
    step: iteration * 2 + 1, 
    message: "K-means clustering complete", 
    complete: true 
  };
}

export function* dbscanGenerator(
  initialPoints: Point[],
  eps: number,
  minPts: number
): Generator<AlgorithmState> {
  if (initialPoints.length === 0) {
    yield { points: [], step: 0, message: "No points to cluster", complete: true };
    return;
  }
  
  const points: VisPoint[] = initialPoints.map(p => ({
    ...p,
    cluster: -2, 
    status: 'normal'
  }));
  
  let step = 0;
  let clusterCount = 0;
  const visited = new Set<number>();
  
  yield {
    points: [...points],
    step: step++,
    message: `DBSCAN initialized with eps=${eps}, minPts=${minPts}`,
    complete: false
  };
  
  const neighbors: number[][] = [];
  for (let i = 0; i < points.length; i++) {
    neighbors[i] = [];
    for (let j = 0; j < points.length; j++) {
      if (i !== j && distance(points[i], points[j]) <= eps) {
        neighbors[i].push(j);
      }
    }
  }
  
  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    
    visited.add(i);
    
    if (neighbors[i].length < minPts) {
      points[i].status = 'noise';
      points[i].cluster = -1;
      continue;
    }
    
    clusterCount++;
    points[i].status = 'core';
    points[i].cluster = clusterCount;
    
    yield {
      points: [...points],
      step: step++,
      message: `Found cluster ${clusterCount} starting from core point`,
      complete: false
    };
    
    const processingQueue = [...neighbors[i]];
    const clusterPoints = [i]; 
    
    while (processingQueue.length > 0) {
      const currentIdx = processingQueue.shift()!;
      
      if (visited.has(currentIdx)) continue;
      
      visited.add(currentIdx);
      points[currentIdx].cluster = clusterCount;
      clusterPoints.push(currentIdx);
      
      if (neighbors[currentIdx].length >= minPts) {
        points[currentIdx].status = 'core';
        
        const unvisitedNeighbors = neighbors[currentIdx].filter(n => !visited.has(n));
        processingQueue.push(...unvisitedNeighbors);
      } else {
        points[currentIdx].status = 'border';
      }
    }
    
    yield {
      points: [...points],
      step: step++,
      message: `Cluster ${clusterCount} complete with ${clusterPoints.length} points`,
      complete: false
    };
  }
  
  let noiseCount = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i].cluster === -2) {
      points[i].cluster = -1;
      points[i].status = 'noise';
      noiseCount++;
    }
  }
  
  yield {
    points: [...points],
    step: step,
    message: `DBSCAN complete: ${clusterCount} clusters, ${noiseCount} noise points`,
    complete: true
  };
}
