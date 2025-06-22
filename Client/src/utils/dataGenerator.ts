export interface Point {
  x: number;
  y: number;
  cluster?: number; 
}

class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  randomGaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.random();
    const u2 = this.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}

export function generateUniformPoints(n: number = 750): Point[] {
  const rng = new SeededRandom(1001);
  const points: Point[] = [];
  for (let i = 0; i < n; i++) {
    points.push({
      x: rng.random() * 100,
      y: rng.random() * 100
    });
  }
  return points;
}


export function generateGaussianMixture(n: number = 750): Point[] {
  const rng = new SeededRandom(1002);
  const points: Point[] = [];
  const centers = [
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 25, y: 75 },
    { x: 75, y: 75 }
  ];
  
  for (let i = 0; i < n; i++) {
    const centerIndex = Math.floor(rng.random() * centers.length);
    const center = centers[centerIndex];
    
    points.push({
      x: rng.randomGaussian(center.x, 10),
      y: rng.randomGaussian(center.y, 10)
    });
  }
  
  return points;
}

export function generateSmileyFace(n: number = 750): Point[] {
  const rng = new SeededRandom(1003);
  const points: Point[] = [];
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  

  const outlinePoints = Math.floor(n * 0.5);
  for (let i = 0; i < outlinePoints; i++) {
    const angle = rng.random() * 2 * Math.PI;
    const r = radius * (0.9 + rng.random() * 0.1); 
    
    points.push({
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    });
  }
  

  const eyePoints = Math.floor(n * 0.2);
  const eyeRadius = radius * 0.15;
  const leftEyeX = centerX - radius * 0.4;
  const rightEyeX = centerX + radius * 0.4;
  const eyeY = centerY - radius * 0.2;
  
  for (let i = 0; i < eyePoints; i++) {
    const angle = rng.random() * 2 * Math.PI;
    const r = eyeRadius * rng.random();
    
    if (i < eyePoints / 2) {
      points.push({
        x: leftEyeX + r * Math.cos(angle),
        y: eyeY + r * Math.sin(angle)
      });
    }

    else {
      points.push({
        x: rightEyeX + r * Math.cos(angle),
        y: eyeY + r * Math.sin(angle)
      });
    }
  }
  

  const smilePoints = Math.floor(n * 0.3);
  const smileRadius = radius * 0.6;
  
  for (let i = 0; i < smilePoints; i++) {
    const angle = Math.PI * (0.2 + 0.6 * rng.random()); 
    
    points.push({
      x: centerX + smileRadius * Math.cos(angle),
      y: centerY + smileRadius * Math.sin(angle) + radius * 0.1
    });
  }
  
  return points;
}


export function generateDensityBars(n: number = 750): Point[] {
  const rng = new SeededRandom(1004);
  const points: Point[] = [];
  const numBars = 3;
  const barWidth = 20;
  const spacing = (100 - numBars * barWidth) / (numBars + 1);
  

  for (let i = 0; i < n; i++) {
    const barIndex = Math.floor(rng.random() * numBars);
    const x = spacing + barIndex * (barWidth + spacing) + rng.random() * barWidth;
    const y = 10 + rng.random() * 80; 
    
    points.push({ x, y });
  }
  
  return points;
}


export function generatePackedCircles(n: number = 750): Point[] {
  const rng = new SeededRandom(1005);
  const points: Point[] = [];
  const centers = [
    { x: 25, y: 25, radius: 15 },
    { x: 75, y: 25, radius: 15 },
    { x: 25, y: 75, radius: 15 },
    { x: 75, y: 75, radius: 15 },
    { x: 50, y: 50, radius: 20 }
  ];
  

  const pointsPerCircle = Math.floor(n / centers.length);
  
  centers.forEach((center, idx) => {
    const circlePoints = idx === centers.length - 1 ?
      n - pointsPerCircle * (centers.length - 1) :
      pointsPerCircle;
    
    for (let i = 0; i < circlePoints; i++) {
      const angle = rng.random() * 2 * Math.PI;
      const r = center.radius * Math.sqrt(rng.random()); 
      
      points.push({
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      });
    }
  });
  
  return points;
}


export function generateDBSCANRings(n: number = 750, eps: number = 5, minPts: number = 4) {
  const rng = new SeededRandom(1006);
  const points: Point[] = [];
  const centers: { x: number; y: number; radius: number }[] = [];
  const gridRows = Math.max(3, Math.floor(Math.sqrt(minPts)) + 2);
  const gridCols = Math.max(3, Math.floor(Math.sqrt(minPts)) + 2);
  const gridSpacingX = 100 / (gridCols + 1);
  const gridSpacingY = 100 / (gridRows + 1);
  const jitterRadius = Math.max(2, eps * 0.7);
  const pointsPerCenter = Math.floor(n / (gridRows * gridCols));

  for (let row = 1; row <= gridRows; row++) {
    for (let col = 1; col <= gridCols; col++) {
      const cx = col * gridSpacingX;
      const cy = row * gridSpacingY;
      centers.push({ x: cx, y: cy, radius: eps });
      for (let i = 0; i < pointsPerCenter; i++) {
        const angle = rng.random() * 2 * Math.PI;
        const r = jitterRadius * Math.sqrt(rng.random());
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle)
        });
      }
    }
  }
  return { points, centers };
}

export type DatasetType = 
  | "uniform" 
  | "gaussian" 
  | "smiley" 
  | "density" 
  | "circles" 
  | "rings";


export function generateDataset(type: DatasetType, n: number = 750, eps?: number, minPts?: number) {
  switch (type) {
    case "uniform":
      return { points: generateUniformPoints(n), centers: [] };
    case "gaussian":
      return { points: generateGaussianMixture(n), centers: [] };
    case "smiley":
      return { points: generateSmileyFace(n), centers: [] };
    case "density":
      return { points: generateDensityBars(n), centers: [] };
    case "circles":
      return { points: generatePackedCircles(n), centers: [] };
    case "rings":
      return generateDBSCANRings(n, eps, minPts);
    default:
      return { points: generateUniformPoints(n), centers: [] };
  }
}


export const datasetInfo = [
  { 
    id: "uniform", 
    name: "Uniform Points", 
    description: "Randomly distributed points" 
  },
  { 
    id: "gaussian", 
    name: "Gaussian Mixture", 
    description: "Points in normal distributions" 
  },
  { 
    id: "smiley", 
    name: "Smiley Face", 
    description: "Points forming a face pattern" 
  },
  { 
    id: "density", 
    name: "Density Bars", 
    description: "Bars with varying point density" 
  },
  { 
    id: "circles", 
    name: "Packed Circles", 
    description: "Dense circular clusters" 
  },
  { 
    id: "rings", 
    name: "DBSCAN Rings", 
    description: "Concentric rings of points" 
  }
];
