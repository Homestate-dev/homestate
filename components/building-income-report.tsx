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
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Abrir el reporte en una nueva ventana para facilitar la impresión
            const buildingName = buildings.find((b: Building) => b.id.toString() === selectedBuilding)?.nombre
            const title = selectedBuilding === "all" 
              ? "Reporte de Ingresos - Todos los Edificios"
              : `Reporte de Ingresos - ${buildingName || 'Edificio Seleccionado'}`
            
            // Crear HTML del reporte
            const showBuildingColumn = selectedBuilding === "all"
            const tableData = processedIncomeData
              .filter(building => building.total_transacciones > 0)
              .map((building: BuildingIncome) => {
                const row = []
                if (showBuildingColumn) {
                  row.push(building.edificio_nombre)
                }
                row.push(
                  building.total_transacciones.toString(),
                  building.total_ventas.toString(),
                  building.total_arriendos.toString(),
                  formatCurrency(building.valor_total_transacciones),
                  formatCurrency(building.total_comisiones),
                  formatCurrency(building.total_homestate),
                  formatCurrency(building.total_bienes_raices),
                  formatCurrency(building.total_admin_edificio),
                  `${safeNumberFormat(building.promedio_porcentaje_homestate)}%`,
                  `${safeNumberFormat(building.promedio_porcentaje_bienes_raices)}%`,
                  `${safeNumberFormat(building.promedio_porcentaje_admin_edificio)}%`
                )
                return row
              })
            
            // Calcular totales
            const totalTransactions = processedIncomeData.reduce((sum, b) => sum + b.total_transacciones, 0)
            const totalSales = processedIncomeData.reduce((sum, b) => sum + b.total_ventas, 0)
            const totalRentals = processedIncomeData.reduce((sum, b) => sum + b.total_arriendos, 0)
            const totalValue = processedIncomeData.reduce((sum, b) => sum + b.valor_total_transacciones, 0)
            const totalCommissions = processedIncomeData.reduce((sum, b) => sum + b.total_comisiones, 0)
            const totalHomeState = processedIncomeData.reduce((sum, b) => sum + b.total_homestate, 0)
            const totalBienesRaices = processedIncomeData.reduce((sum, b) => sum + b.total_bienes_raices, 0)
            const totalAdminEdificio = processedIncomeData.reduce((sum, b) => sum + b.total_admin_edificio, 0)
            
            // Agregar fila de totales
            const totalRow = []
            if (showBuildingColumn) {
              totalRow.push('TOTAL')
            }
            totalRow.push(
              totalTransactions.toString(),
              totalSales.toString(),
              totalRentals.toString(),
              formatCurrency(totalValue),
              formatCurrency(totalCommissions),
              formatCurrency(totalHomeState),
              formatCurrency(totalBienesRaices),
              formatCurrency(totalAdminEdificio),
              '',
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
              'Transacciones',
              'Ventas',
              'Arriendos',
              'Valor Total',
              'Total Comisiones',
              'HomeState',
              'Bienes Raíces',
              'Admin Edificio',
              '% HomeState',
              '% Bienes Raíces',
              '% Admin Edificio'
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
                      padding: 20px;
                      background: white;
                    }
                    .header {
                      text-align: center;
                      margin-bottom: 30px;
                      border-bottom: 2px solid #333;
                      padding-bottom: 20px;
                    }
                    .header h1 {
                      margin: 0;
                      color: #333;
                      font-size: 24px;
                    }
                    .header p {
                      margin: 5px 0 0 0;
                      color: #666;
                      font-size: 14px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-top: 20px;
                      font-size: 12px;
                    }
                    th, td {
                      border: 1px solid #ddd;
                      padding: 8px;
                      text-align: left;
                    }
                    th {
                      background-color: #f8f9fa;
                      font-weight: bold;
                      color: #333;
                    }
                    .total-row {
                      background-color: #f0f0f0;
                      font-weight: bold;
                    }
                    .currency {
                      text-align: right;
                    }
                    .number {
                      text-align: center;
                    }
                    .percentage {
                      text-align: center;
                    }
                    @media print {
                      body { margin: 0; }
                      .no-print { display: none; }
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>${title}</h1>
                    <p>Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
                  </div>
                  
                  <table>
                    <thead>
                      <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${tableData.map(row => `
                        <tr class="${row[0] === 'TOTAL' ? 'total-row' : ''}">
                          ${row.map((cell, index) => {
                            const isCurrency = index >= 4 && index <= 7 && row[0] !== 'TOTAL'
                            const isNumber = index >= 1 && index <= 3
                            const isPercentage = index >= 8
                            const className = isCurrency ? 'currency' : isNumber ? 'number' : isPercentage ? 'percentage' : ''
                            return `<td class="${className}">${cell}</td>`
                          }).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  
                  <div style="margin-top: 30px; font-size: 12px; color: #666;">
                    <p><strong>Resumen:</strong></p>
                    <ul>
                      <li>Total de edificios con transacciones: ${processedIncomeData.filter(b => b.total_transacciones > 0).length}</li>
                      <li>Total de transacciones: ${totalTransactions}</li>
                      <li>Total de ventas: ${totalSales}</li>
                      <li>Total de arriendos: ${totalRentals}</li>
                      <li>Valor total de transacciones: ${formatCurrency(totalValue)}</li>
                      <li>Total de comisiones: ${formatCurrency(totalCommissions)}</li>
                    </ul>
                  </div>
                  
                  <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                      Imprimir Reporte
                    </button>
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
          <Download className="h-4 w-4 mr-2" />
          Ver Reporte
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
                  {paginatedIncomeData.filter(building => building.total_transacciones > 0).map((building) => (
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
                                  {safeNumberFormat(building.promedio_porcentaje_homestate)}%
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
                                  {safeNumberFormat(building.promedio_porcentaje_bienes_raices)}%
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
                                  {safeNumberFormat(building.promedio_porcentaje_admin_edificio)}%
                                </span>
                              </div>
                            </div>
                          </div>
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