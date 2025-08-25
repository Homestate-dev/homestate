import type React from "react"
import type { Building } from "@/types/building"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, QrCode, Settings } from "lucide-react"
import { ApartmentManagement } from "./apartment-management"
import { QRGenerator } from "./qr-generator"
import { BuildingSettings } from "./building-settings"
import { useIsMobile } from "@/hooks/use-mobile"

interface BuildingDetailProps {
  building: Building
  initialTab?: string
  onBuildingDeleted?: () => void
}

export const BuildingDetail: React.FC<BuildingDetailProps> = ({ building, initialTab = "apartments", onBuildingDeleted }) => {
  const isMobile = useIsMobile()
  
  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <TabsList className={`${isMobile ? 'grid w-full grid-cols-3 h-auto' : 'grid w-full grid-cols-3 lg:w-[400px]'}`}>
        <TabsTrigger value="apartments" className={`flex items-center gap-2 ${isMobile ? 'text-xs p-2' : ''}`}>
          <Home className="h-4 w-4" />
          {isMobile ? 'Deptos' : 'Departamentos'}
        </TabsTrigger>
        <TabsTrigger value="qr" className={`flex items-center gap-2 ${isMobile ? 'text-xs p-2' : ''}`}>
          <QrCode className="h-4 w-4" />
          {isMobile ? 'QR' : 'Código QR'}
        </TabsTrigger>
        <TabsTrigger value="settings" className={`flex items-center gap-2 ${isMobile ? 'text-xs p-2' : ''}`}>
          <Settings className="h-4 w-4" />
          {isMobile ? 'Config' : 'Editar Edificio'}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="apartments">
        <ApartmentManagement buildingId={building.id} buildingName={building.nombre} buildingPermalink={building.permalink} />
      </TabsContent>
      <TabsContent value="qr">
        <QRGenerator building={building} />
      </TabsContent>
      <TabsContent value="settings">
        <BuildingSettings building={building} onBuildingDeleted={onBuildingDeleted} />
      </TabsContent>
    </Tabs>
  )
}
