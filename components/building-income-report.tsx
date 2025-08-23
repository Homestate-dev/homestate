"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Logo } from "@/components/ui/logo"
import { Plus, MapPin, Car, Users, Eye, Edit, QrCode, Trash2, UserCog, Activity, ExternalLink, Search, Briefcase, Building2, Settings } from "lucide-react"

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

interface DepartmentData {
  departamento_id: number
  nombre: string
  piso: string
  numero: string
  tipo_principal: string
  total_comision: number
  total_admin_edificio: number
  cantidad_transacciones: number
  transacciones: Array<{
    tipo: string
    valor_transaccion: number
    comision_total: number
    valor_admin_edificio: number
    fecha: string
  }>
}

export function BuildingIncomeReport() {
  const [incomeData, setIncomeData] = useState<BuildingIncome[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [buildingSearchTerm, setBuildingSearchTerm] = useState("")
  
  // Estado para el paginador
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Estado para los filtros
  const [filterTransactionType, setFilterTransactionType] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

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

  // Filtrar edificios basándose en el término de búsqueda
  const filteredBuildings = buildings.filter(building =>
    building.nombre.toLowerCase().includes(buildingSearchTerm.toLowerCase())
  )

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      return ''
    }
  }

  const exportReport = () => {
    // Implementar exportación
    toast.info('Función de exportación en desarrollo')
  }

     // Función para crear el HTML del reporte de administrador
  const createAdminReportHTML = (title: string, headers: string[], tableData: any[][], isAllBuildings: boolean, dateFrom?: string, dateTo?: string) => {
     return `
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
               color: rgb(246, 149, 59); 
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
               background-color: rgb(246, 165, 59); 
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
               border-top: 2px solid rgb(246, 165, 59); 
             }
             .print-button {
               position: fixed;
               top: 20px;
               right: 20px;
               background: rgb(118, 246, 59);
               color: white;
               border: none;
               padding: 10px 20px;
               border-radius: 5px;
               cursor: pointer;
               font-size: 14px;
             }
             .currency {
               text-align: right;
             }
             .number {
               text-align: center;
             }
             @media print {
               body { margin: 0; }
               .no-print { display: none; }
             }
           </style>
         </head>
         <body>
           <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir</button>
           
           <div class="header">
             <div class="header-content">
               <img src="/logo-qr.png" alt="Homestate Logo" class="logo">
               <div class="brand-text">HomEstate</div>
             </div>
             <div class="title">${title}</div>
           </div>
           
           <div class="info">
             <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
             ${dateFrom && dateTo ? `<p><strong>Rango de fechas:</strong> ${new Date(dateFrom).toLocaleDateString('es-CO')} - ${new Date(dateTo).toLocaleDateString('es-CO')}</p>` : ''}
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
                     const isCurrency = isAllBuildings ? (index === 1 || index === 2 || index === 3) : (index === 4)
                     const isNumber = isAllBuildings ? false : (index === 1 || index === 2)
                     const className = isCurrency ? 'currency' : isNumber ? 'number' : ''
                     return `<td class="${className}">${cell}</td>`
                   }).join('')}
                 </tr>
               `).join('')}
             </tbody>
           </table>
         </body>
       </html>
     `
  }

  const getTotalIncome = () => {
    return processedIncomeData.reduce((sum, building) => sum + building.total_comisiones, 0)
  }

  const getTotalTransactions = () => {
    return processedIncomeData.reduce((sum, building) => sum + building.total_transacciones, 0)
  }

  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedBuilding, filterTransactionType, dateRange])

  // Lógica de paginación
  const totalItems = processedIncomeData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedIncomeData = processedIncomeData.slice(startIndex, endIndex)

  useEffect(() => {
    fetchBuildings()
    fetchIncomeData()
  }, [selectedBuilding, filterTransactionType, dateRange])

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
      
      // Construir URL con filtros
      const params = new URLSearchParams()
      
      if (selectedBuilding !== "all") {
        params.append('buildingId', selectedBuilding)
      }
      
      if (filterTransactionType !== "all") {
        params.append('transactionType', filterTransactionType)
      }
      
      if (dateRange.from) {
        params.append('dateFrom', dateRange.from)
      }
      
      if (dateRange.to) {
        params.append('dateTo', dateRange.to)
      }
      
      const url = `/api/sales-rentals/reports/building-income${params.toString() ? `?${params.toString()}` : ''}`
      
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
      <div className="space-y-4">
        {/* Primera fila de filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-gray-500" />
          <span className="text-sm font-medium">Edificio:</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Campo de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar edificio..."
              value={buildingSearchTerm}
              onChange={(e) => setBuildingSearchTerm(e.target.value)}
              className="pl-10 pr-10 w-[200px]"
            />
            {buildingSearchTerm && (
              <button
                onClick={() => setBuildingSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Selector de edificios filtrado */}
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Seleccionar edificio" />
          </SelectTrigger>
            <SelectContent className="max-h-64">
            <SelectItem value="all">Todos los edificios</SelectItem>
              {filteredBuildings.map((building) => (
              <SelectItem key={building.id} value={building.id.toString()}>
                {building.nombre}
              </SelectItem>
            ))}
              {filteredBuildings.length === 0 && buildingSearchTerm && (
                <div className="px-2 py-1.5 text-sm text-gray-500">
                  No se encontraron edificios
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tipo Transacción:</span>
            <Select value={filterTransactionType} onValueChange={setFilterTransactionType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las transacciones" />
          </SelectTrigger>
          <SelectContent>
                <SelectItem value="all">Todas las transacciones</SelectItem>
                <SelectItem value="venta">Solo ventas</SelectItem>
                <SelectItem value="arriendo">Solo arriendos</SelectItem>
          </SelectContent>
        </Select>
          </div>
        </div>
        
        {/* Segunda fila de filtros */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Fecha inicio:</span>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-[180px]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Fecha fin:</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-[180px]"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
            onClick={() => {
              setDateRange({
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
              })
            }}
          >
            Últimos 30 días
          </Button>
        </div>
        
        {/* Cartel de aviso para reporte de administrador */}
        {selectedBuilding === "all" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
              <span className="text-orange-600 text-sm font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-orange-800 text-sm font-medium">
                <strong>Información importante:</strong> Para generar el <strong>informe al administrador del edificio</strong>, elige primero un edificio específico y luego pulsa "Ver reporte para administrador".
              </p>
            </div>
          </div>
        )}
        
        {/* Botones de reporte */}
        <div className="flex items-center gap-3">
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
                        color: rgb(246, 134, 59); 
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
                        background-color: rgb(246, 134, 59); 
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
                        border-top: 2px solid rgb(246, 149, 59); 
                      }
                      .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgb(59, 246, 153);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
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
                    <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir</button>
                    
                    <div class="header">
                      <div class="header-content">
                        <img src="/logo-qr.png" alt="Homestate Logo" class="logo">
                        <div class="brand-text">HomEstate</div>
                      </div>
                      <div class="title">${title}</div>
                    </div>
                    
                    <div class="info">
                      <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
                      <p><strong>Total de edificios con transacciones:</strong> ${processedIncomeData.filter(b => b.total_transacciones > 0).length}</p>
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
                              const isCurrency = index >= 3 && index <= 6 && row[0] !== 'TOTAL'
                              const isNumber = index >= 1 && index <= 2
                              const isPercentage = index >= 7
                              const className = isCurrency ? 'currency' : isNumber ? 'number' : isPercentage ? 'percentage' : ''
                              return `<td class="${className}">${cell}</td>`
                            }).join('')}
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
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
            Ver Reporte para HomEstate
          </Button>
          
                                <Button 
             variant="outline" 
             size="sm" 
             onClick={async () => {
               // Abrir el reporte de administrador en una nueva ventana
               const buildingName = buildings.find((b: Building) => b.id.toString() === selectedBuilding)?.nombre
               const title = selectedBuilding === "all" 
                 ? "Reporte de Administrador - Todos los Edificios"
                 : `Reporte de Administrador - ${buildingName || 'Edificio Seleccionado'}`
               
               if (selectedBuilding === "all") {
                 // Reporte para todos los edificios - mantener estructura actual
                 const showBuildingColumn = true
                 // Filtrar edificios con transacciones y evitar duplicados
                 const buildingsWithTransactions = processedIncomeData
                   .filter(building => building.total_transacciones > 0)
                   .reduce((unique, building) => {
                     const exists = unique.find(b => b.edificio_id === building.edificio_id)
                     if (!exists) {
                       unique.push(building)
                     }
                     return unique
                   }, [] as BuildingIncome[])
                 
                 const tableData = buildingsWithTransactions.map((building: BuildingIncome) => {
                   const row = []
                   row.push(building.edificio_nombre)
                   row.push(
                     building.total_ventas.toString(),
                     building.total_arriendos.toString(),
                     formatCurrency(building.total_admin_edificio)
                   )
                   return row
                 })
                 
                 // Calcular totales usando la lista filtrada
                 const totalSales = buildingsWithTransactions.reduce((sum, b) => sum + b.total_ventas, 0)
                 const totalRentals = buildingsWithTransactions.reduce((sum, b) => sum + b.total_arriendos, 0)
                 const totalAdminEdificio = buildingsWithTransactions.reduce((sum, b) => sum + b.total_admin_edificio, 0)
                 
                 // Agregar fila de totales
                 const totalRow = ['TOTAL', totalSales.toString(), totalRentals.toString(), formatCurrency(totalAdminEdificio)]
                 tableData.push(totalRow)
                 
                 // Preparar headers para todos los edificios
                 const headers = ['Edificio', 'Ventas', 'Arriendos', 'Administración Edificio']
                 
                 // Crear HTML del reporte para todos los edificios
                 const htmlContent = createAdminReportHTML(title, headers, tableData, true, dateRange.from, dateRange.to)
                 
                 // Abrir en nueva ventana
                 const newWindow = window.open('', '_blank')
                 if (newWindow) {
                   newWindow.document.write(htmlContent)
                   newWindow.document.close()
                 }
                               } else {
                  // Reporte para un edificio específico - obtener datos reales de la API
                  try {
                    // Construir URL con filtros para la API de departamentos
                    const deptParams = new URLSearchParams()
                    console.log('🔍 Before append - selectedBuilding:', selectedBuilding)
                    deptParams.append('buildingId', selectedBuilding)
                    console.log('🔍 After append - deptParams.get("buildingId"):', deptParams.get('buildingId'))
                    
                    if (dateRange.from) {
                      deptParams.append('dateFrom', dateRange.from)
                    }
                    
                    if (dateRange.to) {
                      deptParams.append('dateTo', dateRange.to)
                    }
                    
                    const deptUrl = `/api/sales-rentals/reports/building-departments?${deptParams.toString()}`
                    
                    console.log('🔍 Debug info:')
                    console.log('  - selectedBuilding:', selectedBuilding)
                    console.log('  - selectedBuilding type:', typeof selectedBuilding)
                    console.log('  - deptParams.toString():', deptParams.toString())
                    console.log('  - deptUrl:', deptUrl)
                    console.log('  - Date range:', dateRange)
                    
                    // Hacer la llamada a la API para obtener departamentos reales
                    const deptResponse = await fetch(deptUrl)
                    const deptData = await deptResponse.json()
                    
                    console.log('API Response:', deptData)
                    
                    if (!deptData.success || !deptData.data || deptData.data.length === 0) {
                      toast.error('No se encontraron departamentos con transacciones para el edificio seleccionado en el rango de fechas especificado')
                      return
                    }
                    
                    const departmentData = deptData.data
                    
                    console.log('🔍 Raw department data:', departmentData)
                    
                    // Crear tabla con datos reales (sin columna de comisión)
                    const tableData = departmentData.map((dept: any) => {
                      console.log('🏠 Processing dept:', dept)
                      console.log('🏠 All dept keys:', Object.keys(dept))
                      
                      // Identificar el campo correcto para admin edificio
                      const adminValue = dept.valor_admin_edificio || dept.total_admin_edificio || 0
                      console.log('🏠 Admin value found:', adminValue)
                      
                      // Formatear la fecha del estado
                      const fechaEstado = formatDate(dept.fecha_estado)
                      console.log('🏠 Fecha estado found:', dept.fecha_estado, 'formatted:', fechaEstado)
                      
                      return [
                        dept.departamento_nombre || dept.nombre || `Depto ${dept.numero}`,
                        fechaEstado,
                        dept.piso || '',
                        dept.numero || '',
                        dept.tipo_transaccion || dept.tipo_principal || 'N/A',
                        formatCurrency(parseFloat(adminValue) || 0)
                      ]
                    })
                    
                    // Calcular total de administración de edificio
                    const totalAdminEdificio = departmentData.reduce((sum: number, dept: any) => {
                      const adminValue = parseFloat(dept.valor_admin_edificio || dept.total_admin_edificio || 0)
                      console.log('💰 Adding admin value:', adminValue, 'Current sum:', sum)
                      return sum + adminValue
                    }, 0)
                    
                    console.log('💰 Final total admin edificio:', totalAdminEdificio)
                    
                    // Agregar fila de totales (solo administración edificio)
                    const totalRow = ['TOTAL', '', '', '', '', formatCurrency(totalAdminEdificio)]
                    tableData.push(totalRow)
                    
                    // Headers para reporte por departamentos (sin comisiones)
                    const headers = ['Departamento', 'Fecha', 'Piso', 'Número', 'Tipo', 'Administración Edificio']
                    
                    // Crear HTML del reporte por departamentos
                    const htmlContent = createAdminReportHTML(title, headers, tableData, false, dateRange.from, dateRange.to)
                    
                    // Abrir en nueva ventana
                    const newWindow = window.open('', '_blank')
                    if (newWindow) {
                      newWindow.document.write(htmlContent)
                      newWindow.document.close()
                    }
                    
                  } catch (error) {
                    console.error('Error al obtener datos de departamentos:', error)
                    toast.error('Error al generar el reporte de departamentos')
                  }
                }
             }}
           >
             <BarChart3 className="h-4 w-4 mr-2" />
             Ver Reporte para Administrador
        </Button>
        </div>
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
            Listado de ingresos
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