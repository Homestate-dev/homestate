import type React from "react"
import type { Building } from "@/types/building"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, BarChart3, QrCode, Settings } from "lucide-react"
import { ApartmentManagement } from "./apartment-management"
import { BuildingReports } from "./building-reports"
import { QRGenerator } from "./qr-generator"
import { BuildingSettings } from "./building-settings"

interface BuildingDetailProps {
  building: Building
}

export const BuildingDetail: React.FC<BuildingDetailProps> = ({ building }) => {
  return (
    <Tabs defaultValue="apartments" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
        <TabsTrigger value="apartments" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Departamentos
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Reportes
        </TabsTrigger>
        <TabsTrigger value="qr" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Código QR
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configuración
        </TabsTrigger>
      </TabsList>
      <TabsContent value="apartments">
        <ApartmentManagement buildingId={building.id} buildingName={building.nombre} />
      </TabsContent>
      <TabsContent value="reports">
        <BuildingReports buildingId={building.id} buildingName={building.nombre} />
      </TabsContent>
      <TabsContent value="qr">
        <QRGenerator building={building} />
      </TabsContent>
      <TabsContent value="settings">
        <BuildingSettings building={building} />
      </TabsContent>
    </Tabs>
  )
}
