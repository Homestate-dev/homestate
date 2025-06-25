"use client"

import { useState } from "react"
import { BarChart3, PieChart, TrendingUp, DollarSign, Home, Users, Calendar, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Datos de ejemplo para reportes
const reportData = {
  ventasVsAlquiler: {
    venta: 65,
    alquiler: 35,
    total: 100,
  },
  tiposDepartamento: [
    { tipo: "Piso", cantidad: 45, porcentaje: 60 },
    { tipo: "Dúplex", cantidad: 15, porcentaje: 20 },
    { tipo: "Estudio", cantidad: 10, porcentaje: 13 },
    { tipo: "Penthouse", cantidad: 5, porcentaje: 7 },
  ],
  estadosOcupacion: [
    { estado: "Disponible", cantidad: 42, porcentaje: 56 },
    { estado: "Ocupado", cantidad: 28, porcentaje: 37 },
    { estado: "Mantenimiento", cantidad: 5, porcentaje: 7 },
  ],
  preciosPromedio: {
    ventaPromedio: 165000,
    alquilerPromedio: 950,
    precioM2Promedio: 1650,
  },
  tendenciasMensuales: [
    { mes: "Enero", ventas: 3, alquileres: 5 },
    { mes: "Febrero", ventas: 2, alquileres: 7 },
    { mes: "Marzo", ventas: 4, alquileres: 6 },
    { mes: "Abril", ventas: 6, alquileres: 4 },
    { mes: "Mayo", ventas: 5, alquileres: 8 },
    { mes: "Junio", ventas: 7, alquileres: 6 },
  ],
  caracteristicasPopulares: [
    { caracteristica: "Amueblado", porcentaje: 78 },
    { caracteristica: "Aire acondicionado", porcentaje: 65 },
    { caracteristica: "Placares", porcentaje: 89 },
    { caracteristica: "Living comedor", porcentaje: 72 },
    { caracteristica: "Cocina separada", porcentaje: 56 },
  ],
  ingresosPotenciales: {
    ventaTotal: 12375000,
    alquilerMensual: 26600,
    alquilerAnual: 319200,
  },
}

export function ReportsSection() {
  const [selectedPeriod, setSelectedPeriod] = useState("6m")

  const exportReport = (type: string) => {
    console.log(`Exportando reporte: ${type}`)
    // Aquí iría la lógica de exportación
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
          <p className="text-gray-600">Análisis detallado del rendimiento de la propiedad</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mes</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ingresos potenciales (venta)</p>
                <p className="text-2xl font-bold">${reportData.ingresosPotenciales.ventaTotal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Ingresos mensuales (alquiler)</p>
                <p className="text-2xl font-bold">${reportData.ingresosPotenciales.alquilerMensual.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Precio promedio/m²</p>
                <p className="text-2xl font-bold">${reportData.preciosPromedio.precioM2Promedio}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Tasa de ocupación</p>
                <p className="text-2xl font-bold">{reportData.estadosOcupacion[1].porcentaje}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución Venta vs Alquiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-600" />
              Distribución: Venta vs Alquiler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Venta</span>
                <Badge variant="default">{reportData.ventasVsAlquiler.venta}%</Badge>
              </div>
              <Progress value={reportData.ventasVsAlquiler.venta} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alquiler</span>
                <Badge variant="secondary">{reportData.ventasVsAlquiler.alquiler}%</Badge>
              </div>
              <Progress value={reportData.ventasVsAlquiler.alquiler} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Estados de ocupación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Estados de Ocupación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.estadosOcupacion.map((estado, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{estado.estado}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{estado.cantidad}</span>
                      <Badge variant="outline">{estado.porcentaje}%</Badge>
                    </div>
                  </div>
                  <Progress value={estado.porcentaje} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de departamento */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.tiposDepartamento.map((tipo, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{tipo.tipo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{tipo.cantidad} unidades</span>
                      <Badge variant="outline">{tipo.porcentaje}%</Badge>
                    </div>
                  </div>
                  <Progress value={tipo.porcentaje} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Características populares */}
        <Card>
          <CardHeader>
            <CardTitle>Características Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.caracteristicasPopulares.map((caracteristica, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{caracteristica.caracteristica}</span>
                    <Badge variant="outline">{caracteristica.porcentaje}%</Badge>
                  </div>
                  <Progress value={caracteristica.porcentaje} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias mensuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Tendencias Mensuales
          </CardTitle>
          <CardDescription>Comparación de ventas y alquileres por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.tendenciasMensuales.map((mes, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-center">
                <span className="font-medium">{mes.mes}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ventas:</span>
                  <Badge variant="default">{mes.ventas}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Alquileres:</span>
                  <Badge variant="secondary">{mes.alquileres}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <Badge variant="outline">{mes.ventas + mes.alquileres}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de precios */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Precio promedio de venta</p>
              <p className="text-3xl font-bold text-green-600">
                ${reportData.preciosPromedio.ventaPromedio.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Precio promedio de alquiler</p>
              <p className="text-3xl font-bold text-blue-600">
                ${reportData.preciosPromedio.alquilerPromedio.toLocaleString()}/mes
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Precio promedio por m²</p>
              <p className="text-3xl font-bold text-orange-600">${reportData.preciosPromedio.precioM2Promedio}/m²</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de exportación */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Reportes</CardTitle>
          <CardDescription>Descarga reportes detallados en diferentes formatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exportReport("general")}>
              <Download className="h-4 w-4 mr-2" />
              Reporte General (PDF)
            </Button>
            <Button variant="outline" onClick={() => exportReport("financiero")}>
              <Download className="h-4 w-4 mr-2" />
              Análisis Financiero (Excel)
            </Button>
            <Button variant="outline" onClick={() => exportReport("ocupacion")}>
              <Download className="h-4 w-4 mr-2" />
              Reporte de Ocupación (PDF)
            </Button>
            <Button variant="outline" onClick={() => exportReport("tendencias")}>
              <Download className="h-4 w-4 mr-2" />
              Tendencias (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
