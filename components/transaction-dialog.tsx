import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'

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
    notas: ''
  })

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

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          departamento_id: departamentoId,
          precio_original: precioOriginal,
          currentUserUid: user?.uid
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
      <DialogContent className="sm:max-w-[500px]">
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
              onValueChange={(value) => setFormData({ ...formData, tipo_transaccion: value })}
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
            <Label htmlFor="agente">Agente Inmobiliario</Label>
            <Select
              value={formData.agente_id}
              onValueChange={(value) => setFormData({ ...formData, agente_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione agente" />
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
          <Button onClick={handleSubmit}>Registrar Transacción</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 