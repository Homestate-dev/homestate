"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const openModal = (index: number) => {
    setCurrentIndex(index)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Imagen principal */}
        <div
          className="relative h-96 w-full rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openModal(currentIndex)}
        >
          <Image
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`${alt} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 hover:bg-white rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Imagen anterior</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 hover:bg-white rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Siguiente imagen</span>
            </Button>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Miniaturas */}
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative h-20 w-full rounded-lg overflow-hidden cursor-pointer border-2 ${
                index === currentIndex ? "border-orange-600" : "border-transparent"
              }`}
              onClick={() => openModal(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${alt} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal de imagen completa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative h-[80vh] w-full">
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`${alt} - Imagen ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
