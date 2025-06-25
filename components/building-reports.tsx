"use client"

import { BarChart3, TrendingUp, DollarSign, Home, Users, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface BuildingReportsProps {
  buildingId: number
  buildingName: string
}

export function BuildingReports({ buildingId, buildingName }: BuildingReportsProps) {
  // Datos de ejemplo específicos para este edificio
  const reportData = {
    resumenGeneral: {
      totalDepartamentos: 12,
      disponibles: 8,
      ocupados: 4,
      ingresosPotencialesVenta: 1950000,
      ingresosMensualesArriendo: 9600,
    },
    distribucionTipos: [
      { tipo: "Venta", cantidad: 7, porcentaje: 58 },
      { tipo: "Arriendo", cantidad: 3, porcentaje: 25 },
      { tipo: "Ambos", cantidad: 2, porcentaje: 17 },
    ],
    distribucionHabitaciones: [
      { habitaciones: "Loft", cantidad: 2, porcentaje: 17 },
      { habitaciones: "Suite", cantidad: 3, porcentaje: 25 },
      { habitaciones: "2 habitaciones", cantidad: 5, porcentaje: 42 },
      { habitaciones: "3 habitaciones", cantidad: 2, porcentaje: 16 },
    ],
    estadosInmueble: [
      { estado: "Nuevo", cantidad: 8, porcentaje: 67 },
      { estado: "Poco uso", cantidad: 3, porcentaje: 25 },
      { estado: "Un año", cantidad: 1, porcentaje: 8 },
    ],
    caracteristicasPopulares: [
      { caracteristica: "Amoblado", porcentaje: 75 },
      { caracteristica: "Aire acondicionado", porcentaje: 83 },
      { caracteristica: "Closets", porcentaje: 92 },
      { caracteristica: "Sala comedor", porcentaje: 67 },
      { caracteristica: "Cocina separada", porcentaje: 58 },
    ],
    preciosPromedio: {
      ventaPromedio: 162500,
      arriendoPromedio: 1200,
      precioM2Promedio: 1650,
    },
  }

  const exportReport = (type: string) => {
    console.log(`Exportando reporte ${type} para edificio ${buildingId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes - {buildingName}</h2>
          <p className="text-gray-600">Análisis detallado del rendimiento de este edificio</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Departamentos</p>
                <p className="text-2xl font-bold">{reportData.resumenGeneral.totalDepartamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold">{reportData.resumenGeneral.disponibles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Ocupados</p>
                <p className="text-2xl font-bold">{reportData.resumenGeneral.ocupados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Ingresos Venta</p>
                <p className="text-xl font-bold">
                  ${(reportData.resumenGeneral.ingresosPotencialesVenta / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Ingresos Arriendo</p>
                <p className="text-xl font-bold">${reportData.resumenGeneral.ingresosMensualesArriendo}/mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por tipo de operación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Distribución por Tipo de Operación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.distribucionTipos.map((tipo, index) => (
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

        {/* Distribución por habitaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Habitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.distribucionHabitaciones.map((hab, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{hab.habitaciones}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{hab.cantidad} unidades</span>
                      <Badge variant="outline">{hab.porcentaje}%</Badge>
                    </div>
                  </div>
                  <Progress value={hab.porcentaje} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estados del inmueble */}
        <Card>
          <CardHeader>
            <CardTitle>Estados del Inmueble</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.estadosInmueble.map((estado, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{estado.estado}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{estado.cantidad} unidades</span>
                      <Badge variant="outline">{estado.porcentaje}%</Badge>
                    </div>
                  </div>
                  <Progress value={estado.porcentaje} className="h-2" />
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

      {/* Análisis de precios */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Precios</CardTitle>
          <CardDescription>Precios promedio para este edificio</CardDescription>
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
              <p className="text-sm text-gray-600 mb-1">Precio promedio de arriendo</p>
              <p className="text-3xl font-bold text-blue-600">
                ${reportData.preciosPromedio.arriendoPromedio.toLocaleString()}/mes
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
          <CardDescription>Descarga reportes específicos de {buildingName}</CardDescription>
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
              Estado de Ocupación (PDF)
            </Button>
            <Button variant="outline" onClick={() => exportReport("departamentos")}>
              <Download className="h-4 w-4 mr-2" />
              Lista Departamentos (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
