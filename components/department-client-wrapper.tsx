"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import TransactionDialog from './transaction-dialog'
import { useAuth } from "@/contexts/auth-context"

interface Agent {
  id: number
  nombre: string
  especialidad: string
  comision_ventas: number
  comision_arriendos: number
}

interface DepartmentClientWrapperProps {
  departamento: {
    id: number
    nombre: string
    agente_venta_id?: number
    agente_arriendo_id?: number
    fecha_venta?: string
    fecha_arriendo?: string
    precio_venta_final?: number
    precio_arriendo_final?: number
    valor_arriendo?: number
    valor_venta?: number
    agente_venta?: {
      nombre: string
      email: string
      telefono: string
    }
    agente_arriendo?: {
      nombre: string
      email: string
      telefono: string
    }
  }
  edificio: {
    nombre: string
  }
}

export default function DepartmentClientWrapper({ 
  departamento, 
  edificio 
}: DepartmentClientWrapperProps) {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetch('/api/agents')
        const data = await response.json()
        if (data.success) {
          setAgents(data.data)
        }
      } catch (error) {
        console.error('Error al cargar agentes:', error)
      }
    }
    loadAgents()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Estado de la Propiedad</h3>
        <div className="flex flex-col gap-4">
          {departamento.agente_venta_id && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-green-600">Vendido</Badge>
                <span className="text-sm text-gray-600">
                  {new Date(departamento.fecha_venta!).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Precio final de venta: {formatCurrency(departamento.precio_venta_final!)}
              </p>
              {departamento.agente_venta && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Agente de Venta:</p>
                  <p className="text-sm text-gray-600">{departamento.agente_venta.nombre}</p>
                  <p className="text-sm text-gray-600">{departamento.agente_venta.email}</p>
                  <p className="text-sm text-gray-600">{departamento.agente_venta.telefono}</p>
                </div>
              )}
            </div>
          )}
          
          {departamento.agente_arriendo_id && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-blue-600">Arrendado</Badge>
                <span className="text-sm text-gray-600">
                  {new Date(departamento.fecha_arriendo!).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Precio final de arriendo: {formatCurrency(departamento.precio_arriendo_final!)}
              </p>
              {departamento.agente_arriendo && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Agente de Arriendo:</p>
                  <p className="text-sm text-gray-600">{departamento.agente_arriendo.nombre}</p>
                  <p className="text-sm text-gray-600">{departamento.agente_arriendo.email}</p>
                  <p className="text-sm text-gray-600">{departamento.agente_arriendo.telefono}</p>
                </div>
              )}
            </div>
          )}

          {!departamento.agente_venta_id && !departamento.agente_arriendo_id && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Esta propiedad está disponible para venta o arriendo.
              </p>
              {currentUser && (
                <Button
                  variant="outline"
                  onClick={() => setIsTransactionDialogOpen(true)}
                >
                  Registrar Transacción
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de transacciones */}
      {currentUser && (
        <TransactionDialog
          open={isTransactionDialogOpen}
          onOpenChange={setIsTransactionDialogOpen}
          departamentoId={departamento.id}
          departamentoNombre={departamento.nombre}
          edificioNombre={edificio.nombre}
          precioOriginal={departamento.valor_arriendo || departamento.valor_venta || 0}
          onTransactionComplete={() => {
            router.refresh()
            setIsTransactionDialogOpen(false)
          }}
          agents={agents}
        />
      )}
    </>
  )
} 