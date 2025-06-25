"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

interface DeleteBuildingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  building: {
    id: number
    nombre: string
    url_imagen_principal?: string
    imagenes_secundarias?: string[]
  } | null
  onBuildingDeleted?: () => void
}

export function DeleteBuildingDialog({ 
  open, 
  onOpenChange, 
  building, 
  onBuildingDeleted 
}: DeleteBuildingDialogProps) {
  const [step, setStep] = useState<'first' | 'second'>('first')
  const [confirmName, setConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleClose = () => {
    setStep('first')
    setConfirmName('')
    setError('')
    setIsDeleting(false)
    onOpenChange(false)
  }

  const handleFirstConfirm = () => {
    setStep('second')
    setError('')
  }

  const handleSecondConfirm = async () => {
    if (!building || !user) return

    if (confirmName.trim().toLowerCase() !== building.nombre.toLowerCase()) {
      setError('El nombre del edificio no coincide. Por favor, escríbelo exactamente como aparece.')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/buildings/${building.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserUid: user.uid,
          buildingName: building.nombre
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el edificio')
      }

      // Cerrar diálogo y notificar éxito
      handleClose()
      onBuildingDeleted?.()
      
    } catch (error: any) {
      console.error('Error al eliminar edificio:', error)
      setError(error.message || 'Error al eliminar el edificio')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBack = () => {
    setStep('first')
    setConfirmName('')
    setError('')
  }

  if (!building) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {step === 'first' ? 'Confirmar Eliminación' : 'Confirmación Final'}
          </DialogTitle>
          <DialogDescription>
            {step === 'first' 
              ? 'Esta acción eliminará permanentemente el edificio y no se puede deshacer.'
              : 'Para confirmar la eliminación, escribe exactamente el nombre del edificio:'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'first' ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-2">
                  <p><strong>Se eliminará permanentemente:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>El edificio: <strong>{building.nombre}</strong></li>
                    <li>Todos los departamentos asociados</li>
                    <li>Todas las imágenes almacenadas</li>
                    <li>Todo el historial y datos relacionados</li>
                  </ul>
                  <p className="font-semibold">Esta acción NO se puede deshacer.</p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Edificio a eliminar: <strong>{building.nombre}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-name">
                  Escribe el nombre del edificio para confirmar:
                </Label>
                <Input
                  id="confirm-name"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={building.nombre}
                  className="font-mono"
                  disabled={isDeleting}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 'first' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleFirstConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isDeleting}>
                Atrás
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleSecondConfirm}
                disabled={isDeleting || confirmName.trim().toLowerCase() !== building.nombre.toLowerCase()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Definitivamente
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 