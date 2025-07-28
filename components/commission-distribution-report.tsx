"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { 
  DollarSign, 
  Calendar,
  User,
  Download,
  BarChart3,
  TrendingUp,
  PieChart
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

interface Agent {
  id: number
  nombre: string
  email: string
}

export function CommissionDistributionReport() {
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([])
  const [summary, setSummary] = useState<CommissionSummary | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    agentId: 'all'
  })

  useEffect(() => {
    fetchAgents()
    fetchCommissionData()
  }, [filters])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      if (data.success) {
        setAgents(data.data)
      }
    } catch (error) {
      console.error('Error al cargar agentes:', error)
      toast.error('Error al cargar agentes')
    }
  }

  const fetchCommissionData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.agentId !== 'all') params.append('agentId', filters.agentId)
      
      const url = `/api/sales-rentals/reports/commission-distribution?${params.toString()}`
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

  const formatCurrency = (amount: number) => {
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

  const exportReport = () => {
    // Implementar exportación
    toast.info('Función de exportación en desarrollo')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando datos de comisiones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtros del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent">Agente</Label>
              <Select value={filters.agentId} onValueChange={(value) => setFilters(prev => ({ ...prev, agentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los agentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los agentes</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen general */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Comisiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_comisiones)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.total_transacciones}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Promedio por Transacción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {summary.total_transacciones > 0 
                  ? formatCurrency(summary.total_comisiones / summary.total_transacciones)
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
                  <span className="font-semibold">{summary.promedio_porcentaje_homestate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bienes Raíces:</span>
                  <span className="font-semibold">{summary.promedio_porcentaje_bienes_raices.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Edificio:</span>
                  <span className="font-semibold">{summary.promedio_porcentaje_admin_edificio.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribución de comisiones */}
      {summary && (
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
                    {formatCurrency(summary.total_homestate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={summary.total_comisiones > 0 ? summary.porcentaje_total_homestate : 0} 
                    className="flex-1 h-3"
                  />
                  <span className="text-sm font-semibold text-blue-600">
                    {summary.porcentaje_total_homestate.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">Bienes Raíces</h3>
                  <span className="text-2xl font-bold text-green-800">
                    {formatCurrency(summary.total_bienes_raices)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={summary.total_comisiones > 0 ? summary.porcentaje_total_bienes_raices : 0} 
                    className="flex-1 h-3"
                  />
                  <span className="text-sm font-semibold text-green-600">
                    {summary.porcentaje_total_bienes_raices.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-800">Admin Edificio</h3>
                  <span className="text-2xl font-bold text-purple-800">
                    {formatCurrency(summary.total_admin_edificio)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={summary.total_comisiones > 0 ? summary.porcentaje_total_admin_edificio : 0} 
                    className="flex-1 h-3"
                  />
                  <span className="text-sm font-semibold text-purple-600">
                    {summary.porcentaje_total_admin_edificio.toFixed(1)}%
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
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron transacciones con los filtros seleccionados
            </div>
          ) : (
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
                  {transactions.map((transaction) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
} 