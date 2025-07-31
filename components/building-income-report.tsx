"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Logo } from "@/components/ui/logo"
import {
 
  DollarSign, 
  TrendingUp,
  Download,
  BarChart3,
  ChevronLeft,
  ChevronRight
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

  // Procesar datos de ingresos para asegurar que los valores numéricos sean correctos
  const processedIncomeData = incomeData.map(building => ({
    ...building,
    total_transacciones: safeNumber(building.total_transacciones),
    total_ventas: safeNumber(building.total_ventas),
    total_arriendos: safeNumber(building.total_arriendos),
    valor_total_transacciones: safeNumber(building.valor_total_transacciones),
    valor_total_ventas: safeNumber(building.valor_total_ventas),
    valor_total_arriendos: safeNumber(building.valor_total_arriendos),
    total_comisiones: safeNumber(building.total_comisiones),
    total_homestate: safeNumber(building.total_homestate),
    total_bienes_raices: safeNumber(building.total_bienes_raices),
    total_admin_edificio: safeNumber(building.total_admin_edificio),
    promedio_porcentaje_homestate: safeNumber(building.promedio_porcentaje_homestate),
    promedio_porcentaje_bienes_raices: safeNumber(building.promedio_porcentaje_bienes_raices),
    promedio_porcentaje_admin_edificio: safeNumber(building.promedio_porcentaje_admin_edificio)
  }))

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

  const exportReport = () => {
    // Implementar exportación
    toast.info('Función de exportación en desarrollo')
  }

  const getTotalIncome = () => {
    return processedIncomeData.reduce((sum, building) => sum + building.total_comisiones, 0)
  }

  const getTotalTransactions = () => {
    return processedIncomeData.reduce((sum, building) => sum + building.total_transacciones, 0)
  }

  // Resetear a la primera página cuando cambie el edificio seleccionado
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedBuilding])

  // Lógica de paginación
  const totalItems = processedIncomeData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedIncomeData = processedIncomeData.slice(startIndex, endIndex)

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
              {processedIncomeData.filter(b => b.total_transacciones > 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Promedio por Edificio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedIncomeData.length > 0 
                ? formatCurrency(getTotalIncome() / processedIncomeData.filter(b => b.total_transacciones > 0).length)
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

                <div className="grid gap-4">
                  {paginatedIncomeData.map((building) => (
                    <Card key={building.edificio_id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{building.edificio_nombre}</h3>
                          <p className="text-sm text-gray-600">{building.edificio_direccion}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${building.ingresos_totales?.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {building.total_transacciones} transacciones
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 