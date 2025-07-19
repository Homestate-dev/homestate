"use client"

import { useState } from "react"
import { X, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  const [selectedValue, setSelectedValue] = useState("")
  const [customValue, setCustomValue] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleAddItem = (value: string) => {
    if (value && !selectedItems.includes(value)) {
      onItemsChange([...selectedItems, value])
      setSelectedValue("")
      setCustomValue("")
      setShowCustomInput(false)
    }
  }

  const handleRemoveItem = (itemToRemove: string) => {
    onItemsChange(selectedItems.filter(item => item !== itemToRemove))
  }

  const handleCustomAdd = () => {
    if (customValue.trim() && !selectedItems.includes(customValue.trim())) {
      handleAddItem(customValue.trim())
    }
  }

  const filteredAvailableItems = availableItems.filter(
    item => !selectedItems.includes(item)
  )

  return (
    <div className="space-y-3">
      <label className="text-base font-semibold">{label}</label>
      <div className="space-y-3 mt-2">
        {/* Tags seleccionados */}
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
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
                <SelectItem value="custom">
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
                onChange={(e) => setCustomValue(e.target.value)}
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
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 