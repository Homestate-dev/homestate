"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BuildingImagesCarouselProps {
  images: string[]
  buildingName: string
}

export function BuildingImagesCarousel({ images, buildingName }: BuildingImagesCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  if (!images || images.length === 0) {
    return (
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
          <div className="relative h-[400px] w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No hay imágenes disponibles</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
        <div className="relative h-[400px] w-full">
          <Image
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`${buildingName} - Imagen ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />
          
          {images.length > 1 && (
            <>
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/80 hover:bg-white rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Imagen anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/80 hover:bg-white rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Siguiente imagen</span>
                </Button>
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-orange-600" : "bg-white/70"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <span className="sr-only">Imagen {index + 1}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 