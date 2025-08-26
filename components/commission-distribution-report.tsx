"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { 
  DollarSign, 
  BarChart3,
  TrendingUp,
  PieChart,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface CommissionTransaction {
  transaccion_id: number
  tipo_transaccion: string
  precio_final: number
  comision_valor: number
  porcentaje_homestate: number
  porcentaje_bienes_raices: number
  porcentaje_admin_edificio: number
  valor_homestate: number
  valor_bienes_raices: number
  valor_admin_edificio: number
  fecha_transaccion: string
  cliente_nombre: string
  agente_nombre: string
  edificio_nombre: string
  departamento_numero: string
  total_distribuido: number
  total_porcentajes: number
}

interface CommissionSummary {
  total_transacciones: number
  total_ventas: number
  total_arriendos: number
  total_comisiones: number
  total_homestate: number
  total_bienes_raices: number
  total_admin_edificio: number
  promedio_porcentaje_homestate: number
  promedio_porcentaje_bienes_raices: number
  promedio_porcentaje_admin_edificio: number
  porcentaje_total_homestate: number
  porcentaje_total_bienes_raices: number
  porcentaje_total_admin_edificio: number
}

export function CommissionDistributionReport() {
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([])
  const [summary, setSummary] = useState<CommissionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estado para el paginador
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Función auxiliar para manejar valores numéricos de forma segura
  const safeNumberFormat = (value: any, decimals: number = 1): string => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(decimals)
    }
    return '0.0'
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
    valor_admin_edificio: safeNumber(transaction.valor_admin_edificio),
    total_distribuido: safeNumber(transaction.total_distribuido),
    total_porcentajes: safeNumber(transaction.total_porcentajes)
  }))

  // Procesar resumen para asegurar que los valores numéricos sean correctos
  const processedSummary = summary ? {
    ...summary,
    total_transacciones: safeNumber(summary.total_transacciones),
    total_ventas: safeNumber(summary.total_ventas),
    total_arriendos: safeNumber(summary.total_arriendos),
    total_comisiones: safeNumber(summary.total_comisiones),
    total_homestate: safeNumber(summary.total_homestate),
    total_bienes_raices: safeNumber(summary.total_bienes_raices),
    total_admin_edificio: safeNumber(summary.total_admin_edificio),
    promedio_porcentaje_homestate: safeNumber(summary.promedio_porcentaje_homestate),
    promedio_porcentaje_bienes_raices: safeNumber(summary.promedio_porcentaje_bienes_raices),
    promedio_porcentaje_admin_edificio: safeNumber(summary.promedio_porcentaje_admin_edificio),
    porcentaje_total_homestate: safeNumber(summary.porcentaje_total_homestate),
    porcentaje_total_bienes_raices: safeNumber(summary.porcentaje_total_bienes_raices),
    porcentaje_total_admin_edificio: safeNumber(summary.porcentaje_total_admin_edificio)
  } : null

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

  useEffect(() => {
    fetchCommissionData()
  }, [])

  const fetchCommissionData = async () => {
    try {
      setLoading(true)
      const url = `/api/sales-rentals/reports/commission-distribution`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data.transactions)
        setSummary(data.data.summary)
      } else {
        toast.error(data.error || 'Error al cargar datos de comisiones')
      }
    } catch (error) {
      console.error('Error al cargar datos de comisiones:', error)
      toast.error('Error al cargar datos de comisiones')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando datos de comisiones...</span>
      </div>
    )
  }

  // Lógica de paginación
  const totalItems = processedTransactions.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = processedTransactions.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">

      {/* Resumen general */}
      {processedSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Comisiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(processedSummary.total_comisiones)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedSummary.total_transacciones}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Promedio por Transacción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {processedSummary.total_transacciones > 0 
                  ? formatCurrency(processedSummary.total_comisiones / processedSummary.total_transacciones)
                  : formatCurrency(0)
                }
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Distribución Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span>HomeState:</span>
                  <span className="font-semibold">{safeNumberFormat(processedSummary.promedio_porcentaje_homestate)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bienes Raíces:</span>
                  <span className="font-semibold">{safeNumberFormat(processedSummary.promedio_porcentaje_bienes_raices)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Edificio:</span>
                  <span className="font-semibold">{safeNumberFormat(processedSummary.promedio_porcentaje_admin_edificio)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribución de comisiones */}
      {processedSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución Total de Comisiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-800">HomeState</h3>
                  <span className="text-2xl font-bold text-blue-800">
                    {formatCurrency(processedSummary.total_homestate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={processedSummary.total_comisiones > 0 ? processedSummary.porcentaje_total_homestate : 0} 
                    className="flex-1 h-3"
                  />
                                     <span className="text-sm font-semibold text-blue-600">
                     {safeNumberFormat(processedSummary.porcentaje_total_homestate)}%
                   </span>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">Bienes Raíces</h3>
                  <span className="text-2xl font-bold text-green-800">
                    {formatCurrency(processedSummary.total_bienes_raices)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={processedSummary.total_comisiones > 0 ? processedSummary.porcentaje_total_bienes_raices : 0} 
                    className="flex-1 h-3"
                  />
                                     <span className="text-sm font-semibold text-green-600">
                     {safeNumberFormat(processedSummary.porcentaje_total_bienes_raices)}%
                   </span>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-800">Admin Edificio</h3>
                  <span className="text-2xl font-bold text-purple-800">
                    {formatCurrency(processedSummary.total_admin_edificio)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={processedSummary.total_comisiones > 0 ? processedSummary.porcentaje_total_admin_edificio : 0} 
                    className="flex-1 h-3"
                  />
                                     <span className="text-sm font-semibold text-purple-600">
                     {safeNumberFormat(processedSummary.porcentaje_total_admin_edificio)}%
                   </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Detalle de Comisiones por Transacción
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processedTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron transacciones
            </div>
          ) : (
            <div className="space-y-6">
              {/* Paginador */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-700">Elementos por página:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20 h-8 bg-orange-100 border-orange-300 text-orange-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-700">
                      {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Agente</TableHead>
                      <TableHead>Propiedad</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Comisión Total</TableHead>
                      <TableHead>HomeState</TableHead>
                      <TableHead>Bienes Raíces</TableHead>
                      <TableHead>Admin Edificio</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.transaccion_id}>
                        <TableCell className="font-medium">
                          #{transaction.transaccion_id}
                        </TableCell>
                        <TableCell>{getTypeBadge(transaction.tipo_transaccion)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.cliente_nombre}</div>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.agente_nombre}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.edificio_nombre}</div>
                            <div className="text-sm text-gray-500">Depto {transaction.departamento_numero}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.precio_final)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(transaction.comision_valor)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-blue-600">
                              {formatCurrency(transaction.valor_homestate)}
                            </div>
                            <div className="text-gray-500">
                              {transaction.porcentaje_homestate}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-green-600">
                              {formatCurrency(transaction.valor_bienes_raices)}
                            </div>
                            <div className="text-gray-500">
                              {transaction.porcentaje_bienes_raices}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-purple-600">
                              {formatCurrency(transaction.valor_admin_edificio)}
                            </div>
                            <div className="text-gray-500">
                              {transaction.porcentaje_admin_edificio}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(transaction.fecha_transaccion)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 