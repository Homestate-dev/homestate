"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  User,
  FileText,
  Download
} from "lucide-react"

// Declaraciones de tipos para jsPDF
declare global {
  interface Window {
    jsPDF: any
  }
}

interface BuildingTransaction {
  edificio_id: number
  edificio_nombre: string
  edificio_direccion: string
  departamento_id: number
  departamento_numero: string
  departamento_nombre: string
  tipo_transaccion: string
  precio_final: number
  fecha_transaccion: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  agente_nombre: string
  estado_actual: string
  comision_valor: number
  porcentaje_homestate: number
  porcentaje_bienes_raices: number
  porcentaje_admin_edificio: number
  valor_homestate: number
  valor_bienes_raices: number
  valor_admin_edificio: number
}

interface Building {
  id: number
  nombre: string
  direccion: string
}

export function BuildingTransactionsReport() {
  const [transactions, setTransactions] = useState<BuildingTransaction[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuildings()
    fetchTransactions()
  }, [selectedBuilding])

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings')
      const data = await response.json()
      if (data.success) {
        setBuildings(data.data)
      }
    } catch (error) {
      console.error('Error al cargar edificios:', error)
      toast.error('Error al cargar edificios')
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const url = selectedBuilding === "all" 
        ? '/api/sales-rentals/reports/building-transactions'
        : `/api/sales-rentals/reports/building-transactions?buildingId=${selectedBuilding}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data)
      } else {
        toast.error(data.error || 'Error al cargar transacciones')
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error)
      toast.error('Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    // Verificar si el valor es válido
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0'
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Función para procesar datos numéricos de forma segura
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') {
      return 0
    }
    const num = parseFloat(value)
    return isNaN(num) ? 0 : num
  }

  // Procesar transacciones para asegurar que los valores numéricos sean correctos
  const processedTransactions = transactions.map(transaction => ({
    ...transaction,
    precio_final: safeNumber(transaction.precio_final),
    comision_valor: safeNumber(transaction.comision_valor),
    porcentaje_homestate: safeNumber(transaction.porcentaje_homestate),
    porcentaje_bienes_raices: safeNumber(transaction.porcentaje_bienes_raices),
    porcentaje_admin_edificio: safeNumber(transaction.porcentaje_admin_edificio),
    valor_homestate: safeNumber(transaction.valor_homestate),
    valor_bienes_raices: safeNumber(transaction.valor_bienes_raices),
    valor_admin_edificio: safeNumber(transaction.valor_admin_edificio)
  }))

  // Calcular totales de forma segura
  const totalValue = processedTransactions.reduce((sum: number, t: BuildingTransaction) => sum + t.precio_final, 0)
  const totalSales = processedTransactions.filter((t: BuildingTransaction) => t.tipo_transaccion === 'venta').length
  const totalRentals = processedTransactions.filter((t: BuildingTransaction) => t.tipo_transaccion === 'arriendo').length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  const getTypeBadge = (type: string) => {
    return type === 'venta' ? (
      <Badge className="bg-green-100 text-green-800">Venta</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">Arriendo</Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, text: string }> = {
      'reservado': { color: 'bg-yellow-100 text-yellow-800', text: 'Reservado' },
      'en_proceso': { color: 'bg-blue-100 text-blue-800', text: 'En Proceso' },
      'completada': { color: 'bg-green-100 text-green-800', text: 'Completada' },
      'cancelada': { color: 'bg-red-100 text-red-800', text: 'Cancelada' }
    }
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status }
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const exportReport = async () => {
    try {
      // Mostrar indicador de carga
      toast.loading('Generando PDF...')
      
      // Función para cargar jsPDF dinámicamente
      const loadJsPDF = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          // Verificar si ya está cargado
          if (typeof window !== 'undefined' && (window as any).jsPDF) {
            resolve((window as any).jsPDF)
            return
          }
          
          // Cargar jsPDF
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
          script.onload = () => {
            // Cargar autoTable
            const autoTableScript = document.createElement('script')
            autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
            autoTableScript.onload = () => {
              resolve((window as any).jsPDF)
            }
            autoTableScript.onerror = reject
            document.head.appendChild(autoTableScript)
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      
      // Cargar jsPDF
      const jsPDF = await loadJsPDF()
      
      // Crear el documento PDF
      const doc = new jsPDF()
      
      // Configurar el documento
      doc.setFont('helvetica')
      doc.setFontSize(20)
      
      // Título del reporte
      const buildingName = buildings.find((b: Building) => b.id.toString() === selectedBuilding)?.nombre
      const title = selectedBuilding === "all" 
        ? "Reporte de Transacciones - Todos los Edificios"
        : `Reporte de Transacciones - ${buildingName || 'Edificio Seleccionado'}`
      
      doc.text(title, 20, 30)
      
      // Información del reporte
      doc.setFontSize(12)
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 20, 45)
      doc.text(`Total de transacciones: ${processedTransactions.length}`, 20, 55)
      doc.text(`Ventas: ${totalSales}`, 20, 65)
      doc.text(`Arriendos: ${totalRentals}`, 20, 75)
      doc.text(`Valor total: ${formatCurrency(totalValue)}`, 20, 85)
      
      // Crear tabla de transacciones
      if (processedTransactions.length > 0) {
        const tableData = processedTransactions.map((transaction: BuildingTransaction) => [
          transaction.edificio_nombre,
          transaction.departamento_numero,
          transaction.tipo_transaccion === 'venta' ? 'Venta' : 'Arriendo',
          transaction.cliente_nombre,
          transaction.agente_nombre,
          formatCurrency(transaction.precio_final),
          formatCurrency(transaction.comision_valor),
          new Date(transaction.fecha_transaccion).toLocaleDateString('es-CO'),
          transaction.estado_actual
        ])
        
        const headers = [
          'Edificio',
          'Depto',
          'Tipo',
          'Cliente',
          'Agente',
          'Valor',
          'Comisión',
          'Fecha',
          'Estado'
        ]
        
        // Agregar tabla usando autoTable
        doc.autoTable({
          head: [headers],
          body: tableData,
          startY: 100,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          margin: { top: 10, right: 10, bottom: 10, left: 10 }
        })
      } else {
        // Si no hay transacciones, mostrar mensaje
        doc.setFontSize(14)
        doc.text('No se encontraron transacciones para el período seleccionado', 20, 100)
      }
      
      // Generar nombre del archivo
      const date = new Date().toISOString().split('T')[0]
      const fileName = selectedBuilding === "all" 
        ? `transacciones_todos_edificios_${date}.pdf`
        : `transacciones_${buildingName?.replace(/\s+/g, '_') || 'edificio'}_${date}.pdf`
      
      // Guardar el PDF
      doc.save(fileName)
      
      // Mostrar mensaje de éxito
      toast.dismiss()
      toast.success('PDF exportado exitosamente')
      
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.dismiss()
      toast.error('Error al generar el PDF. Inténtalo de nuevo.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando transacciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo size={16} className="text-gray-500" />
          <span className="text-sm font-medium">Edificio:</span>
        </div>
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Seleccionar edificio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los edificios</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building.id} value={building.id.toString()}>
                {building.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm" onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalSales}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Arriendos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalRentals}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transacciones por Edificio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron transacciones para el edificio seleccionado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Edificio</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Agente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedTransactions.map((transaction) => (
                    <TableRow key={transaction.departamento_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.edificio_nombre}</div>
                          <div className="text-sm text-gray-500">{transaction.edificio_direccion}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.departamento_numero}</div>
                          <div className="text-sm text-gray-500">{transaction.departamento_nombre}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.tipo_transaccion)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.cliente_nombre}</div>
                          <div className="text-sm text-gray-500">{transaction.cliente_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.agente_nombre}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.precio_final)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.comision_valor)}
                      </TableCell>
                      <TableCell>{formatDate(transaction.fecha_transaccion)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.estado_actual)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 