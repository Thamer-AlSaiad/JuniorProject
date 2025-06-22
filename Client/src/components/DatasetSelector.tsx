"use client"

import { Button } from "./ui/button"
import { datasetInfo, DatasetType } from "../utils/dataGenerator"

interface DatasetSelectorProps {
  onSelect: (dataset: DatasetType) => void
  selectedDataset: DatasetType | null
}

export default function DatasetSelector({ onSelect, selectedDataset }: DatasetSelectorProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        Choose a Dataset
      </h2>
      
      <p className="text-white mb-6">
        Select a dataset to visualize with the clustering algorithm
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {datasetInfo.map((dataset) => (
          <Button
            key={dataset.id}
            onClick={() => onSelect(dataset.id as DatasetType)}
            className={`h-28 flex flex-col items-center justify-center p-4 ${
              selectedDataset === dataset.id
                ? "bg-[#593797] border-2 border-white"
                : "bg-[#3d3450] hover:bg-[#4a4358]"
            }`}
          >
            <span className="text-lg font-bold mb-1 text-white">{dataset.name}</span>
            <span className="text-xs text-white px-2 text-center w-full truncate">
              {dataset.description}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
