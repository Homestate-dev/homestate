"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Calendar,
  MessageSquare,
  ArrowRight,
  X,
  Check,
  Ban
} from "lucide-react"

interface TransactionState {
  id: number
  tipo_transaccion: 'venta' | 'arriendo'
  estado_actual: string
  datos_estado: any
  fecha_ultimo_estado: string
  cliente_nombre: string
  precio_final: number
  departamento_numero: string
  edificio_nombre: string
  agente_nombre: string
  historial: Array<{
    estado_anterior: string
    estado_nuevo: string
    fecha_cambio: string
    motivo_cambio?: string
    datos_estado: any
    usuario_responsable: string
    comentarios?: string
  }>
}

interface TransactionStateManagerProps {
  transactionId: number
  onStateChange?: () => void
}

export function TransactionStateManager({ transactionId, onStateChange }: TransactionStateManagerProps) {
  const { user } = useAuth()
  const [transactionState, setTransactionState] = useState<TransactionState | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [formData, setFormData] = useState({
    valor_reserva: '',
    fecha_reserva: '',
    comentarios: '',
    porcentaje_aplicado: '',
    valor_promesa: '',
    pago_total: '',
    fecha_firma: '',
    valor_total: '',
    fecha: '',
    razon_desistimiento: '',
    valor_amonestacion: ''
  })

  useEffect(() => {
    if (transactionId) {
      fetchTransactionState()
    }
  }, [transactionId])

  const fetchTransactionState = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sales-rentals/transaction-states?transactionId=${transactionId}`)
      const data = await response.json()
      
      if (data.success) {
        setTransactionState(data.data)
      } else {
        toast.error(data.error || 'Error al cargar el estado de la transacción')
      }
    } catch (error) {
      console.error('Error al cargar estado de transacción:', error)
      toast.error('Error al cargar el estado de la transacción')
    } finally {
      setLoading(false)
    }
  }

  const getNextState = () => {
    if (!transactionState) return null

    const { tipo_transaccion, estado_actual } = transactionState
    
    if (tipo_transaccion === 'venta') {
      switch (estado_actual) {
        case 'reservado':
          return 'promesa_compra_venta'
        case 'promesa_compra_venta':
          return 'firma_escrituras'
        default:
          return null
      }
    } else {
      switch (estado_actual) {
        case 'reservado':
          return 'firma_y_pago'
        default:
          return null
      }
    }
  }

  const getStateConfig = (state: string) => {
    const configs = {
      reservado: {
        title: 'Reservado',
        icon: Clock,
        color: 'bg-blue-100 text-blue-800',
        description: 'Departamento reservado por el cliente'
      },
      promesa_compra_venta: {
        title: 'Promesa de Compra Venta',
        icon: FileText,
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Promesa de compra venta firmada'
      },
      firma_escrituras: {
        title: 'Firma de Escrituras',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
        description: 'Escrituras firmadas'
      },
      firma_y_pago: {
        title: 'Firma y Pago',
        icon: DollarSign,
        color: 'bg-green-100 text-green-800',
        description: 'Contrato firmado y pago realizado'
      },
      desistimiento: {
        title: 'Desistimiento',
        icon: Ban,
        color: 'bg-red-100 text-red-800',
        description: 'Transacción cancelada'
      },
      completada: {
        title: 'Completada',
        icon: Check,
        color: 'bg-green-100 text-green-800',
        description: 'Transacción finalizada exitosamente'
      }
    }
    
    return configs[state as keyof typeof configs] || {
      title: state,
      icon: Clock,
      color: 'bg-gray-100 text-gray-800',
      description: 'Estado desconocido'
    }
  }

  const handleAdvanceState = async () => {
    try {
      const nextState = getNextState()
      if (!nextState) {
        toast.error('No se puede avanzar desde el estado actual')
        return
      }

      const stateData: any = {}
      
      // Agregar datos específicos según el estado
      if (nextState === 'promesa_compra_venta') {
        stateData.porcentaje_aplicado = parseFloat(formData.porcentaje_aplicado)
        stateData.comentarios = formData.comentarios
        // Calcular valor de promesa
        const valorReserva = transactionState?.datos_estado?.valor_reserva || 0
        const porcentaje = parseFloat(formData.porcentaje_aplicado)
        stateData.valor_promesa = valorReserva * (porcentaje / 100)
      } else if (nextState === 'firma_escrituras') {
        // Calcular pago total basado en el valor de la transacción y el porcentaje aplicado
        const valorTransaccion = transactionState?.precio_final || 0
        const porcentajeAplicado = transactionState?.datos_estado?.porcentaje_aplicado || 0
        
        if (valorTransaccion > 0 && porcentajeAplicado > 0) {
          const pagoTotalCalculado = valorTransaccion * (porcentajeAplicado / 100)
          stateData.pago_total = pagoTotalCalculado
          // Actualizar el formulario para mostrar el valor calculado
          setFormData(prev => ({ ...prev, pago_total: pagoTotalCalculado.toString() }))
        } else {
          // Si no hay datos suficientes, usar el valor del formulario
          stateData.pago_total = parseFloat(formData.pago_total)
        }
        
        stateData.fecha_firma = formData.fecha_firma
        stateData.comentarios = formData.comentarios
      } else if (nextState === 'firma_y_pago') {
        stateData.valor_total = parseFloat(formData.valor_total)
        stateData.fecha = formData.fecha
        stateData.comentarios = formData.comentarios
      }

      const response = await fetch('/api/sales-rentals/transaction-states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          newState: nextState,
          stateData,
          comments: formData.comentarios,
          currentUserUid: user?.uid
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`Estado avanzado a: ${getStateConfig(nextState).title}`)
        setShowAdvanceDialog(false)
        resetForm()
        fetchTransactionState()
        onStateChange?.()
      } else {
        toast.error(data.error || 'Error al avanzar estado')
      }
    } catch (error) {
      console.error('Error al avanzar estado:', error)
      toast.error('Error al avanzar estado')
    }
  }

  const handleFinalizeTransaction = async () => {
    try {
      const response = await fetch('/api/sales-rentals/transaction-states', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          action: 'finalizar',
          currentUserUid: user?.uid
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Transacción finalizada exitosamente')
        setShowFinalizeDialog(false)
        fetchTransactionState()
        onStateChange?.()
      } else {
        toast.error(data.error || 'Error al finalizar transacción')
      }
    } catch (error) {
      console.error('Error al finalizar transacción:', error)
      toast.error('Error al finalizar transacción')
    }
  }

  const handleCancelTransaction = async () => {
    try {
      const response = await fetch('/api/sales-rentals/transaction-states', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          action: 'cancelar',
          razon_desistimiento: formData.razon_desistimiento,
          valor_amonestacion: parseFloat(formData.valor_amonestacion),
          currentUserUid: user?.uid
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Transacción cancelada exitosamente')
        setShowCancelDialog(false)
        resetForm()
        fetchTransactionState()
        onStateChange?.()
      } else {
        toast.error(data.error || 'Error al cancelar transacción')
      }
    } catch (error) {
      console.error('Error al cancelar transacción:', error)
      toast.error('Error al cancelar transacción')
    }
  }

  const resetForm = () => {
    setFormData({
      valor_reserva: '',
      fecha_reserva: '',
      comentarios: '',
      porcentaje_aplicado: '',
      valor_promesa: '',
      pago_total: '',
      fecha_firma: '',
      valor_total: '',
      fecha: '',
      razon_desistimiento: '',
      valor_amonestacion: ''
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando estado de transacción...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!transactionState) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No se pudo cargar el estado de la transacción
          </div>
        </CardContent>
      </Card>
    )
  }

  const { tipo_transaccion, estado_actual, datos_estado, historial } = transactionState
  const nextState = getNextState()
  const currentStateConfig = getStateConfig(estado_actual)
  const nextStateConfig = nextState ? getStateConfig(nextState) : null

  return (
    <div className="space-y-6">
      {/* Estado Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <currentStateConfig.icon className="h-5 w-5" />
            Estado de Transacción
          </CardTitle>
          <CardDescription>
            {transactionState.edificio_nombre} - {transactionState.departamento_numero}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={currentStateConfig.color}>
                {currentStateConfig.title}
              </Badge>
              <span className="text-sm text-gray-500">
                {currentStateConfig.description}
              </span>
            </div>
            
            <div className="flex gap-2">
              {nextState && estado_actual !== 'completada' && estado_actual !== 'desistimiento' && (
                <Dialog open={showAdvanceDialog} onOpenChange={setShowAdvanceDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      Avanzar Estado
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Avanzar a {nextStateConfig?.title}</DialogTitle>
                      <DialogDescription>
                        Complete los datos requeridos para avanzar al siguiente estado
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {nextState === 'promesa_compra_venta' && (
                        <>
                          <div>
                            <Label htmlFor="porcentaje_aplicado">Porcentaje Aplicado (%)</Label>
                            <Input
                              id="porcentaje_aplicado"
                              type="number"
                              value={formData.porcentaje_aplicado}
                              onChange={(e) => setFormData(prev => ({ ...prev, porcentaje_aplicado: e.target.value }))}
                              placeholder="10"
                            />
                          </div>
                          {formData.porcentaje_aplicado && datos_estado?.valor_reserva && (
                            <div className="p-3 bg-blue-50 rounded-md">
                              <span className="text-sm font-medium">Valor de la Promesa:</span>
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency((datos_estado.valor_reserva * parseFloat(formData.porcentaje_aplicado)) / 100)}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {nextState === 'firma_escrituras' && (
                        <>
                          <div>
                            <Label htmlFor="pago_total">Pago Total (Calculado automáticamente)</Label>
                            <Input
                              id="pago_total"
                              type="number"
                              value={(() => {
                                const valorTransaccion = transactionState?.precio_final || 0
                                const porcentajeAplicado = transactionState?.datos_estado?.porcentaje_aplicado || 0
                                if (valorTransaccion > 0 && porcentajeAplicado > 0) {
                                  return (valorTransaccion * (porcentajeAplicado / 100)).toString()
                                }
                                return formData.pago_total
                              })()}
                              onChange={(e) => setFormData(prev => ({ ...prev, pago_total: e.target.value }))}
                              placeholder="Calculado automáticamente"
                              readOnly
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Basado en el valor de la transacción ({transactionState?.precio_final ? formatCurrency(transactionState.precio_final) : 'No definido'}) 
                              y el porcentaje aplicado ({transactionState?.datos_estado?.porcentaje_aplicado ? `${transactionState.datos_estado.porcentaje_aplicado}%` : 'No definido'})
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="fecha_firma">Fecha de Firma</Label>
                            <Input
                              id="fecha_firma"
                              type="date"
                              value={formData.fecha_firma}
                              onChange={(e) => setFormData(prev => ({ ...prev, fecha_firma: e.target.value }))}
                            />
                          </div>
                        </>
                      )}
                      
                      {nextState === 'firma_y_pago' && (
                        <>
                          <div>
                            <Label htmlFor="valor_total">Valor Total</Label>
                            <Input
                              id="valor_total"
                              type="number"
                              value={formData.valor_total}
                              onChange={(e) => setFormData(prev => ({ ...prev, valor_total: e.target.value }))}
                              placeholder="2500000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="fecha">Fecha</Label>
                            <Input
                              id="fecha"
                              type="date"
                              value={formData.fecha}
                              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                            />
                          </div>
                        </>
                      )}
                      
                      <div>
                        <Label htmlFor="comentarios">Comentarios</Label>
                        <Textarea
                          id="comentarios"
                          value={formData.comentarios}
                          onChange={(e) => setFormData(prev => ({ ...prev, comentarios: e.target.value }))}
                          placeholder="Comentarios adicionales..."
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAdvanceDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAdvanceState}>
                        Avanzar Estado
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {estado_actual !== 'completada' && estado_actual !== 'desistimiento' && (
                <>
                  {/* Solo mostrar el botón Finalizar en estados específicos donde se puede finalizar */}
                  {(estado_actual === 'firma_escrituras' || estado_actual === 'firma_y_pago') && (
                    <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                          <Check className="mr-2 h-4 w-4" />
                          Finalizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Finalizar Transacción</DialogTitle>
                          <DialogDescription>
                            ¿Está seguro de que desea finalizar esta transacción? Esta acción no se puede deshacer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleFinalizeTransaction} className="bg-green-600 hover:bg-green-700">
                            Finalizar Transacción
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <X className="mr-2 h-4 w-4" />
                        Desestimar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Desestimar Transacción</DialogTitle>
                        <DialogDescription>
                          Complete los datos para desestimar la transacción
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="razon_desistimiento">Razón del Desistimiento</Label>
                          <Textarea
                            id="razon_desistimiento"
                            value={formData.razon_desistimiento}
                            onChange={(e) => setFormData(prev => ({ ...prev, razon_desistimiento: e.target.value }))}
                            placeholder="Motivo del desistimiento..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="valor_amonestacion">Valor de la Amonestación</Label>
                          <Input
                            id="valor_amonestacion"
                            type="number"
                            value={formData.valor_amonestacion}
                            onChange={(e) => setFormData(prev => ({ ...prev, valor_amonestacion: e.target.value }))}
                            placeholder="2500000"
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCancelTransaction} className="bg-red-600 hover:bg-red-700">
                          Desestimar Transacción
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos del Estado Actual */}
      {datos_estado && Object.keys(datos_estado).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del Estado Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {datos_estado.valor_reserva && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor de la Reserva</Label>
                  <p className="text-lg font-semibold">{formatCurrency(datos_estado.valor_reserva)}</p>
                </div>
              )}
              {datos_estado.fecha_reserva && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de la Reserva</Label>
                  <p className="text-lg font-semibold">{formatDate(datos_estado.fecha_reserva)}</p>
                </div>
              )}
              {datos_estado.porcentaje_aplicado && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Porcentaje Aplicado</Label>
                  <p className="text-lg font-semibold">{datos_estado.porcentaje_aplicado}%</p>
                </div>
              )}
              {datos_estado.valor_promesa && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor de la Promesa</Label>
                  <p className="text-lg font-semibold">{formatCurrency(datos_estado.valor_promesa)}</p>
                </div>
              )}
              {datos_estado.pago_total && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Pago Total</Label>
                  <p className="text-lg font-semibold">{formatCurrency(datos_estado.pago_total)}</p>
                </div>
              )}
              {datos_estado.fecha_firma && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Firma</Label>
                  <p className="text-lg font-semibold">{formatDate(datos_estado.fecha_firma)}</p>
                </div>
              )}
              {datos_estado.valor_total && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor Total</Label>
                  <p className="text-lg font-semibold">{formatCurrency(datos_estado.valor_total)}</p>
                </div>
              )}
              {datos_estado.fecha && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha</Label>
                  <p className="text-lg font-semibold">{formatDate(datos_estado.fecha)}</p>
                </div>
              )}
              {datos_estado.razon_desistimiento && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Razón del Desistimiento</Label>
                  <p className="text-lg font-semibold">{datos_estado.razon_desistimiento}</p>
                </div>
              )}
              {datos_estado.valor_amonestacion && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor de la Amonestación</Label>
                  <p className="text-lg font-semibold">{formatCurrency(datos_estado.valor_amonestacion)}</p>
                </div>
              )}
              {datos_estado.comentarios && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Comentarios</Label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{datos_estado.comentarios}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Estados */}
      {historial && historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historial.map((entry, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getStateConfig(entry.estado_nuevo).title}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(entry.fecha_cambio)}
                      </span>
                    </div>
                    {entry.motivo_cambio && (
                      <p className="text-sm text-gray-600 mt-1">{entry.motivo_cambio}</p>
                    )}
                    {entry.comentarios && (
                      <p className="text-xs text-gray-400 mt-1">Comentarios: {entry.comentarios}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 