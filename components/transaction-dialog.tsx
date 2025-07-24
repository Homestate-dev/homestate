import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departamentoId: number
  departamentoNombre: string
  edificioNombre: string
  precioOriginal: number
  onTransactionComplete?: () => void
  agents: Array<{
    id: number
    nombre: string
    especialidad: string
    comision_ventas: number
    comision_arriendos: number
  }>
}

export default function TransactionDialog({
  open,
  onOpenChange,
  departamentoId,
  departamentoNombre,
  edificioNombre,
  precioOriginal,
  onTransactionComplete,
  agents
}: TransactionDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    tipo_transaccion: '',
    agente_id: '',
    precio_final: precioOriginal,
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    notas: '',
    // Nuevos campos para comisiones
    comision_porcentaje: '',
    comision_valor: '',
    porcentaje_homestate: '60',
    porcentaje_bienes_raices: '30',
    porcentaje_admin_edificio: '10'
  })

  // Valores calculados
  const [calculatedValues, setCalculatedValues] = useState({
    valor_comision: 0,
    valor_homestate: 0,
    valor_bienes_raices: 0,
    valor_admin_edificio: 0
  })

  // Estado para validación de porcentajes
  const [percentageError, setPercentageError] = useState('')

  // Calcular valores cuando cambian los inputs
  useEffect(() => {
    calculateValues()
  }, [formData])

  const calculateValues = () => {
    const precioFinal = parseFloat(formData.precio_final.toString()) || 0
    const porcentajeHomestate = parseFloat(formData.porcentaje_homestate) || 0
    const porcentajeBienesRaices = parseFloat(formData.porcentaje_bienes_raices) || 0
    const porcentajeAdminEdificio = parseFloat(formData.porcentaje_admin_edificio) || 0

    // Validar que la suma de porcentajes no exceda 100%
    const totalPorcentajes = porcentajeHomestate + porcentajeBienesRaices + porcentajeAdminEdificio
    if (totalPorcentajes > 100) {
      setPercentageError('La suma de los porcentajes no puede exceder el 100%')
    } else {
      setPercentageError('')
    }

    let valorComision = 0

    if (formData.tipo_transaccion === 'venta') {
      // Para ventas: usar comisión porcentual
      const comisionPorcentaje = parseFloat(formData.comision_porcentaje) || 0
      valorComision = (precioFinal * comisionPorcentaje) / 100
    } else if (formData.tipo_transaccion === 'arriendo') {
      // Para arriendos: usar comisión en valor
      valorComision = parseFloat(formData.comision_valor) || precioFinal
    }

    const valorHomestate = (valorComision * porcentajeHomestate) / 100
    const valorBienesRaices = (valorComision * porcentajeBienesRaices) / 100
    const valorAdminEdificio = (valorComision * porcentajeAdminEdificio) / 100

    setCalculatedValues({
      valor_comision: valorComision,
      valor_homestate: valorHomestate,
      valor_bienes_raices: valorBienesRaices,
      valor_admin_edificio: valorAdminEdificio
    })
  }

  // Manejar cambio de tipo de transacción
  const handleTransactionTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tipo_transaccion: value,
      comision_porcentaje: '',
      comision_valor: ''
    }))

    // Si es arriendo, copiar el precio final al campo comisión valor
    if (value === 'arriendo') {
      setFormData(prev => ({ 
        ...prev, 
        tipo_transaccion: value,
        comision_valor: prev.precio_final.toString()
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.tipo_transaccion || !formData.agente_id || !formData.precio_final) {
        toast({
          title: 'Error',
          description: 'Por favor complete todos los campos requeridos',
          variant: 'destructive'
        })
        return
      }

      // Validar porcentajes
      const totalPorcentajes = parseFloat(formData.porcentaje_homestate) + 
                              parseFloat(formData.porcentaje_bienes_raices) + 
                              parseFloat(formData.porcentaje_admin_edificio)
      
      if (totalPorcentajes > 100) {
        toast({
          title: 'Error',
          description: 'La suma de los porcentajes no puede exceder el 100%',
          variant: 'destructive'
        })
        return
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          departamento_id: departamentoId,
          precio_original: precioOriginal,
          currentUserUid: user?.uid,
          // Incluir valores calculados
          valor_homestate: calculatedValues.valor_homestate,
          valor_bienes_raices: calculatedValues.valor_bienes_raices,
          valor_admin_edificio: calculatedValues.valor_admin_edificio
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Éxito',
          description: data.message
        })
        onOpenChange(false)
        if (onTransactionComplete) {
          onTransactionComplete()
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al registrar la transacción',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Transacción</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Departamento</Label>
            <p className="text-sm text-gray-500">
              {departamentoNombre} - {edificioNombre}
            </p>
            <p className="text-sm text-gray-500">
              Precio Original: {formatCurrency(precioOriginal)}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tipo_transaccion">Tipo de Transacción</Label>
            <Select
              value={formData.tipo_transaccion}
              onValueChange={handleTransactionTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="arriendo">Arriendo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="agente">Administrador</Label>
            <Select
              value={formData.agente_id}
              onValueChange={(value) => setFormData({ ...formData, agente_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione administrador" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.nombre} - {agent.especialidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="precio_final">Precio Final</Label>
            <Input
              id="precio_final"
              type="number"
              step="0.01"
              value={formData.precio_final}
              onChange={(e) => setFormData({ ...formData, precio_final: parseFloat(e.target.value) })}
            />
          </div>

          {/* Campos de comisión según tipo de transacción */}
          {formData.tipo_transaccion === 'venta' && (
            <div className="grid gap-2">
              <Label htmlFor="comision_porcentaje">Comisión (%)</Label>
              <Input
                id="comision_porcentaje"
                type="number"
                step="0.1"
                placeholder="3.0"
                value={formData.comision_porcentaje}
                onChange={(e) => setFormData({ ...formData, comision_porcentaje: e.target.value })}
              />
            </div>
          )}

          {formData.tipo_transaccion === 'arriendo' && (
            <div className="grid gap-2">
              <Label htmlFor="comision_valor">Comisión (Valor)</Label>
              <Input
                id="comision_valor"
                type="number"
                step="0.01"
                value={formData.comision_valor}
                onChange={(e) => setFormData({ ...formData, comision_valor: e.target.value })}
              />
            </div>
          )}

          {/* Porcentajes de distribución */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Distribución de Comisiones</Label>
            
            {percentageError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{percentageError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="porcentaje_homestate">Homestate (%)</Label>
                <Input
                  id="porcentaje_homestate"
                  type="number"
                  step="0.1"
                  value={formData.porcentaje_homestate}
                  onChange={(e) => setFormData({ ...formData, porcentaje_homestate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="porcentaje_bienes_raices">Bienes Raíces (%)</Label>
                <Input
                  id="porcentaje_bienes_raices"
                  type="number"
                  step="0.1"
                  value={formData.porcentaje_bienes_raices}
                  onChange={(e) => setFormData({ ...formData, porcentaje_bienes_raices: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="porcentaje_admin_edificio">Administración (%)</Label>
                <Input
                  id="porcentaje_admin_edificio"
                  type="number"
                  step="0.1"
                  value={formData.porcentaje_admin_edificio}
                  onChange={(e) => setFormData({ ...formData, porcentaje_admin_edificio: e.target.value })}
                />
              </div>
            </div>

            {/* Valores calculados */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Valores Calculados</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Comisión Total:</span>
                  <p className="font-medium">{formatCurrency(calculatedValues.valor_comision)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Homestate:</span>
                  <p className="font-medium">{formatCurrency(calculatedValues.valor_homestate)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bienes Raíces:</span>
                  <p className="font-medium">{formatCurrency(calculatedValues.valor_bienes_raices)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Administración:</span>
                  <p className="font-medium">{formatCurrency(calculatedValues.valor_admin_edificio)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cliente_nombre">Nombre del Cliente</Label>
            <Input
              id="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cliente_email">Email del Cliente</Label>
            <Input
              id="cliente_email"
              type="email"
              value={formData.cliente_email}
              onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cliente_telefono">Teléfono del Cliente</Label>
            <Input
              id="cliente_telefono"
              value={formData.cliente_telefono}
              onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Detalles adicionales de la transacción..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!!percentageError}>
            Registrarse Transacción
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 