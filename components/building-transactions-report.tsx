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
import { PDFGenerator } from "@/lib/pdf-utils"

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
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Abrir el reporte en una nueva ventana para facilitar la impresión
            const buildingName = buildings.find((b: Building) => b.id.toString() === selectedBuilding)?.nombre
            const title = selectedBuilding === "all" 
              ? "Reporte de Transacciones - Todos los Edificios"
              : `Reporte de Transacciones - ${buildingName || 'Edificio Seleccionado'}`
            
            // Crear HTML del reporte
            const showBuildingColumn = selectedBuilding === "all"
            const tableData = processedTransactions.map((transaction: BuildingTransaction) => {
              const row = []
              if (showBuildingColumn) {
                row.push(transaction.edificio_nombre)
              }
              row.push(
                transaction.departamento_numero,
                transaction.tipo_transaccion === 'venta' ? 'Venta' : 'Arriendo',
                transaction.cliente_nombre,
                transaction.agente_nombre,
                formatCurrency(transaction.precio_final),
                formatCurrency(transaction.comision_valor),
                new Date(transaction.fecha_transaccion).toLocaleDateString('es-CO'),
                transaction.estado_actual
              )
              return row
            })
            
            // Calcular totales
            const totalValue = processedTransactions.reduce((sum, t) => sum + t.precio_final, 0)
            const totalCommission = processedTransactions.reduce((sum, t) => sum + t.comision_valor, 0)
            
            // Agregar fila de totales
            const totalRow = []
            if (showBuildingColumn) {
              totalRow.push('')
            }
            totalRow.push(
              'TOTAL',
              '',
              '',
              '',
              formatCurrency(totalValue),
              formatCurrency(totalCommission),
              '',
              ''
            )
            tableData.push(totalRow)
            
            // Preparar headers
            const headers = []
            if (showBuildingColumn) {
              headers.push('Edificio')
            }
            headers.push(
              'Depto',
              'Tipo',
              'Cliente',
              'Agente',
              'Valor',
              'Comisión',
              'Fecha',
              'Estado'
            )
            
            // Crear HTML del reporte
            const htmlContent = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>${title}</title>
                  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap" rel="stylesheet">
                  <style>
                    @page {
                      size: A4;
                      margin: 20mm;
                    }
                    body { 
                      font-family: Arial, sans-serif; 
                      margin: 0; 
                      padding: 0;
                      font-size: 12px;
                    }
                    .header { 
                      text-align: center; 
                      margin-bottom: 30px; 
                      page-break-after: avoid;
                    }
                    .header-content { 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      gap: 15px; 
                    }
                    .logo { 
                      width: 64px; 
                      height: 64px; 
                    }
                    .brand-text { 
                      font-family: 'Poppins', sans-serif; 
                      font-weight: 300; 
                      font-size: 24px; 
                      color: #3b82f6; 
                    }
                    .title { 
                      margin-top: 10px; 
                      font-size: 20px; 
                      color: #333; 
                    }
                    .info { 
                      margin-bottom: 20px; 
                      page-break-after: avoid;
                    }
                    table { 
                      width: 100%; 
                      border-collapse: collapse; 
                      margin-top: 20px; 
                      font-size: 10px;
                    }
                    th, td { 
                      border: 1px solid #ddd; 
                      padding: 6px; 
                      text-align: left; 
                      word-wrap: break-word;
                    }
                    th { 
                      background-color: #3b82f6; 
                      color: white; 
                      font-weight: bold;
                    }
                    tr:nth-child(even) { 
                      background-color: #f8f9fa; 
                    }
                    .total-row { 
                      background-color: #e5f3ff !important; 
                      font-weight: bold; 
                    }
                    .total-row td { 
                      border-top: 2px solid #3b82f6; 
                    }
                    .footer { 
                      margin-top: 30px; 
                      text-align: center; 
                      font-size: 10px; 
                      color: #666; 
                      page-break-before: avoid;
                    }
                    .print-button {
                      position: fixed;
                      top: 20px;
                      right: 20px;
                      background: #3b82f6;
                      color: white;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 5px;
                      cursor: pointer;
                      font-size: 14px;
                    }
                    @media print {
                      .print-button {
                        display: none;
                      }
                    }
                  </style>
                </head>
                <body>
                  <button class="print-button" onclick="window.print()">🖨️ Imprimir PDF</button>
                  
                  <div class="header">
                    <div class="header-content">
                      <img src="/logo-qr.png" alt="Homestate Logo" class="logo">
                      <div>
                        <div class="brand-text">HomEstate</div>
                        <div class="title">${title}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="info">
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
                    <p><strong>Total de registros:</strong> ${tableData.length - 1}</p>
                  </div>
                  
                  ${tableData.length > 0 ? `
                    <table>
                      <thead>
                        <tr>
                          ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                      </thead>
                      <tbody>
                        ${tableData.map((row, index) => {
                          const isTotalRow = index === tableData.length - 1
                          const rowClass = isTotalRow ? 'total-row' : ''
                          return `
                            <tr class="${rowClass}">
                              ${row.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                          `
                        }).join('')}
                      </tbody>
                    </table>
                  ` : '<p>No hay datos para mostrar</p>'}
                  
                  <div class="footer">
                    <p>Generado por HomeState - ${new Date().toLocaleDateString('es-CO')}</p>
                  </div>
                </body>
              </html>
            `
            
            // Abrir en nueva ventana
            const newWindow = window.open('', '_blank')
            if (newWindow) {
              newWindow.document.write(htmlContent)
              newWindow.document.close()
            }
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver Reporte
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