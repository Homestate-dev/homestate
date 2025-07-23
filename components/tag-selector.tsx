"use client"

import { useState } from "react"
import { X, Plus, ChevronDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TagSelectorProps {
  label: string
  placeholder: string
  selectedItems: string[]
  availableItems: string[]
  onItemsChange: (items: string[]) => void
  allowCustom?: boolean
}

export function TagSelector({
  label,
  placeholder,
  selectedItems,
  availableItems,
  onItemsChange,
  allowCustom = true
}: TagSelectorProps) {
  // Validaciones para evitar errores
  const safeSelectedItems = selectedItems || []
  const safeAvailableItems = availableItems || []
  
  console.log('TagSelector props:', { label, selectedItems, availableItems })
  const [selectedValue, setSelectedValue] = useState("")
  const [customValue, setCustomValue] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [error, setError] = useState("")

  // Función para validar URLs de YouTube
  const validateYouTubeUrl = (url: string): { isValid: boolean; isShort: boolean; message: string } => {
    // Detectar YouTube Shorts
    if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/') && url.includes('/shorts/')) {
      return {
        isValid: false,
        isShort: true,
        message: "No se permiten YouTube Shorts. Solo se aceptan videos normales de YouTube."
      }
    }
    
    // Validar formato de URL de YouTube normal
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/
    if (!youtubeRegex.test(url)) {
      return {
        isValid: false,
        isShort: false,
        message: "URL de YouTube inválida. Use el formato: https://www.youtube.com/watch?v=VIDEO_ID"
      }
    }
    
    return {
      isValid: true,
      isShort: false,
      message: ""
    }
  }

  const handleAddItem = (value: string) => {
    if (value && !safeSelectedItems.includes(value)) {
      // Validar URL de YouTube si el placeholder indica que es para videos
      if (placeholder.toLowerCase().includes('youtube') || placeholder.toLowerCase().includes('video')) {
        const validation = validateYouTubeUrl(value)
        if (!validation.isValid) {
          setError(validation.message)
          return
        }
      }
      
      onItemsChange([...safeSelectedItems, value])
      setSelectedValue("")
      setCustomValue("")
      setShowCustomInput(false)
      setError("") // Limpiar error si la validación pasa
    }
  }

  const handleRemoveItem = (itemToRemove: string) => {
    onItemsChange(safeSelectedItems.filter(item => item !== itemToRemove))
  }

  const handleCustomAdd = () => {
    if (customValue.trim() && !safeSelectedItems.includes(customValue.trim())) {
      handleAddItem(customValue.trim())
    }
  }

  const filteredAvailableItems = safeAvailableItems.filter(
    item => !safeSelectedItems.includes(item)
  )

  return (
    <div className="space-y-3">
      <label className="text-base font-semibold">{label}</label>
      
      {/* Mostrar error si existe */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-3 mt-2">
        {/* Tags seleccionados */}
        {safeSelectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {safeSelectedItems.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {item}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                  onClick={() => handleRemoveItem(item)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Controles de selección */}
        <div className="flex gap-2">
          {/* Dropdown para items predefinidos */}
          <Select
            value={selectedValue}
            onValueChange={(value) => {
              if (value === "custom") {
                setShowCustomInput(true)
                setSelectedValue("")
              } else {
                handleAddItem(value)
              }
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filteredAvailableItems.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
              {allowCustom && (
                <SelectItem value="custom" className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium">
                  + Agregar personalizado
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Botón para agregar item personalizado */}
          {showCustomInput ? (
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Escribir personalizado..."
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value)
                  setError("") // Limpiar error cuando el usuario escribe
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCustomAdd()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleCustomAdd}
                disabled={!customValue.trim()}
                size="sm"
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomValue("")
                }}
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => setShowCustomInput(true)}
              disabled={selectedValue === ""}
              size="sm"
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 