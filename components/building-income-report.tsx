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
  Building2, 
  DollarSign, 
  TrendingUp,
  Download,
  BarChart3
} from "lucide-react"

interface BuildingIncome {
  edificio_id: number
  edificio_nombre: string
  edificio_direccion: string
  total_transacciones: number
  total_ventas: number
  total_arriendos: number
  valor_total_transacciones: number
  valor_total_ventas: number
  valor_total_arriendos: number
  total_comisiones: number
  total_homestate: number
  total_bienes_raices: number
  total_admin_edificio: number
  promedio_porcentaje_homestate: number
  promedio_porcentaje_bienes_raices: number
  promedio_porcentaje_admin_edificio: number
}

interface Building {
  id: number
  nombre: string
  direccion: string
}

export function BuildingIncomeReport() {
  const [incomeData, setIncomeData] = useState<BuildingIncome[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuildings()
    fetchIncomeData()
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

  const fetchIncomeData = async () => {
    try {
      setLoading(true)
      const url = selectedBuilding === "all" 
        ? '/api/sales-rentals/reports/building-income'
        : `/api/sales-rentals/reports/building-income?buildingId=${selectedBuilding}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setIncomeData(data.data)
      } else {
        toast.error(data.error || 'Error al cargar datos de ingresos')
      }
    } catch (error) {
      console.error('Error al cargar datos de ingresos:', error)
      toast.error('Error al cargar datos de ingresos')
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

  const exportReport = () => {
    // Implementar exportación
    toast.info('Función de exportación en desarrollo')
  }

  const getTotalIncome = () => {
    return incomeData.reduce((sum, building) => sum + building.total_comisiones, 0)
  }

  const getTotalTransactions = () => {
    return incomeData.reduce((sum, building) => sum + building.total_transacciones, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando datos de ingresos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
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

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Comisiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalIncome())}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalTransactions()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Edificios con Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {incomeData.filter(b => b.total_transacciones > 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Promedio por Edificio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incomeData.length > 0 
                ? formatCurrency(getTotalIncome() / incomeData.filter(b => b.total_transacciones > 0).length)
                : formatCurrency(0)
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ingresos por edificio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ingresos por Edificio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomeData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron datos de ingresos para el edificio seleccionado
            </div>
          ) : (
            <div className="space-y-6">
              {incomeData.filter(building => building.total_transacciones > 0).map((building) => (
                <Card key={building.edificio_id} className="p-4">
                  <div className="space-y-4">
                    {/* Información del edificio */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{building.edificio_nombre}</h3>
                        <p className="text-sm text-gray-500">{building.edificio_direccion}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(building.total_comisiones)}
                        </div>
                        <div className="text-sm text-gray-500">Total Comisiones</div>
                      </div>
                    </div>

                    {/* Estadísticas de transacciones */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{building.total_transacciones}</div>
                        <div className="text-sm text-gray-500">Transacciones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{building.total_ventas}</div>
                        <div className="text-sm text-gray-500">Ventas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{building.total_arriendos}</div>
                        <div className="text-sm text-gray-500">Arriendos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatCurrency(building.valor_total_transacciones)}
                        </div>
                        <div className="text-sm text-gray-500">Valor Total</div>
                      </div>
                    </div>

                    {/* Distribución de comisiones */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Distribución de Comisiones</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-700">HomeState</span>
                            <span className="text-sm font-semibold text-blue-800">
                              {formatCurrency(building.total_homestate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              value={building.total_comisiones > 0 ? (building.total_homestate / building.total_comisiones) * 100 : 0} 
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-blue-600">
                              {building.promedio_porcentaje_homestate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-700">Bienes Raíces</span>
                            <span className="text-sm font-semibold text-green-800">
                              {formatCurrency(building.total_bienes_raices)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              value={building.total_comisiones > 0 ? (building.total_bienes_raices / building.total_comisiones) * 100 : 0} 
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-green-600">
                              {building.promedio_porcentaje_bienes_raices.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-700">Admin Edificio</span>
                            <span className="text-sm font-semibold text-purple-800">
                              {formatCurrency(building.total_admin_edificio)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              value={building.total_comisiones > 0 ? (building.total_admin_edificio / building.total_comisiones) * 100 : 0} 
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-purple-600">
                              {building.promedio_porcentaje_admin_edificio.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 