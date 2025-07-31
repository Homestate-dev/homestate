"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import {
  DollarSign, 
  TrendingUp, 
  FileText,
  Download,
  Calendar,
  User,
  BarChart3
} from "lucide-react"
import { BuildingTransactionsReport } from "./building-transactions-report"
import { BuildingIncomeReport } from "./building-income-report"
import { CommissionDistributionReport } from "./commission-distribution-report"

export function ReportsSection() {
  const [activeTab, setActiveTab] = useState("building-transactions")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">
            Análisis detallado de transacciones, ingresos y comisiones
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="building-transactions" className="flex items-center gap-2">
            <Logo size={16} />
            Por Edificio
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financieros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="building-transactions" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transacciones por Edificio
                </CardTitle>
                <CardDescription>
                  Qué departamentos fueron vendidos o alquilados y cuándo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BuildingTransactionsReport />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ingresos por Edificio
                </CardTitle>
                <CardDescription>
                  Suma de comisiones de arriendos y ventas por edificio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BuildingIncomeReport />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comisiones Distribuidas
              </CardTitle>
              <CardDescription>
                Muestra cuánto se asignó a cada parte (Homestate, inmobiliaria, admin del edificio)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionDistributionReport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
