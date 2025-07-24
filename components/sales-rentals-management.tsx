"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Building2,
  User,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface Transaction {
  id: number
  departamento_id: number
  agente_id: number
  agente_nombre?: string
  edificio_nombre?: string
  departamento_numero?: string
  tipo_transaccion: 'venta' | 'arriendo'
  valor_transaccion: number
  comision_porcentaje: number
  comision_valor: number
  fecha_transaccion: string
  fecha_firma_contrato?: string
  cliente_nombre: string
  cliente_email?: string
  cliente_telefono?: string
  cliente_cedula?: string
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
  duracion_contrato_meses?: number
  deposito_garantia?: number
  forma_pago?: string
  entidad_financiera?: string
  notas?: string
  fecha_registro: string
}

interface AdminAgent {
  id: number
  nombre: string
  email: string
  telefono: string
  especialidad: string
}

interface Building {
  id: number
  nombre: string
  direccion: string
}

interface Department {
  id: number
  numero: string
  nombre: string
  piso: number
  area: number
  edificio_id: number
  edificio_nombre: string
  edificio_direccion: string
  valor_venta?: number
  valor_arriendo?: number
  estado: string
  disponible: boolean
  tipo: string
  cantidad_habitaciones: string
}

interface SalesRentalsStats {
  total_transacciones: number
  ventas_completadas: number
  arriendos_completados: number
  valor_total_ventas: number
  valor_total_arriendos: number
  comisiones_generadas: number
  transacciones_mes_actual: number
}

export function SalesRentalsManagement() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [agents, setAgents] = useState<AdminAgent[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [stats, setStats] = useState<SalesRentalsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterAgent, setFilterAgent] = useState<string>("all")
  const [filterBuilding, setFilterBuilding] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const isMobile = useIsMobile()

  // Nuevo estado para el formulario
  const [formData, setFormData] = useState({
    edificio_id: "",
    departamento_id: "",
    agente_id: "",
    tipo_transaccion: "venta" as "venta" | "arriendo",
    valor_transaccion: "",
    comision_porcentaje: "3.0",
    fecha_transaccion: new Date().toISOString().split('T')[0],
    fecha_firma_contrato: "",
    cliente_nombre: "",
    cliente_email: "",
    cliente_telefono: "",
    cliente_cedula: "",
    cliente_tipo_documento: "CC",
    duracion_contrato_meses: "",
    deposito_garantia: "",
    valor_administracion: "",
    forma_pago: "",
    entidad_financiera: "",
    valor_credito: "",
    valor_inicial: "",
    estado: "pendiente" as "pendiente" | "en_proceso" | "completada" | "cancelada",
    notas: "",
    referido_por: "",
    canal_captacion: "",
    fecha_primer_contacto: "",
    observaciones: ""
  })

  // Departamentos filtrados por edificio seleccionado
  // Ahora departments ya contiene los departamentos correctos según la selección
  const filteredDepartmentsByBuilding = departments

  // Información del departamento seleccionado
  const selectedDepartment = departments.find(dept => 
    dept.id.toString() === formData.departamento_id
  )

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [filterType, filterStatus, filterAgent, filterBuilding, dateRange])

  const fetchInitialData = async () => {
    try {
      const [transactionsRes, agentsRes, buildingsRes, departmentsRes, statsRes] = await Promise.all([
        fetch('/api/sales-rentals/transactions'),
        fetch('/api/admins'),
        fetch('/api/buildings'),
        fetch('/api/sales-rentals/departments'),
        fetch('/api/sales-rentals/stats')
      ])

      const [transactionsData, agentsData, buildingsData, departmentsData, statsData] = await Promise.all([
        transactionsRes.json(),
        agentsRes.json(),
        buildingsRes.json(),
        departmentsRes.json(),
        statsRes.json()
      ])

      if (transactionsData.success) setTransactions(transactionsData.data || [])
      if (agentsData.success) {
        // Incluir todos los administradores (independientemente de la bandera es_agente)
        setAgents(agentsData.data || [])
      }
      if (buildingsData.success) setBuildings(buildingsData.data || [])
      if (departmentsData.success) setDepartments(departmentsData.data || [])
      if (statsData.success) setStats(statsData.data)
      
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        type: filterType,
        status: filterStatus,
        agent: filterAgent,
        building: filterBuilding,
        from: dateRange.from,
        to: dateRange.to
      })

      const response = await fetch(`/api/sales-rentals/transactions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error)
    }
  }

  const handleCreateTransaction = async () => {
    try {
      // Verificar que el usuario esté autenticado
      if (!user?.uid) {
        toast.error('Debes estar autenticado para crear transacciones')
        return
      }

      const response = await fetch('/api/sales-rentals/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentUserUid: user.uid
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Transacción creada exitosamente')
        setShowCreateDialog(false)
        resetForm()
        fetchTransactions()
        fetchInitialData() // Recargar stats
      } else {
        toast.error(data.error || 'Error al crear la transacción')
      }
    } catch (error) {
      console.error('Error al crear transacción:', error)
      toast.error('Error al crear la transacción')
    }
  }

  const handleUpdateTransactionStatus = async (transactionId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/sales-rentals/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Estado actualizado exitosamente')
        fetchTransactions()
        fetchInitialData() // Recargar stats
      } else {
        toast.error(data.error || 'Error al actualizar el estado')
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  const resetForm = async () => {
    setFormData({
      edificio_id: "",
      departamento_id: "",
      agente_id: "",
      tipo_transaccion: "venta",
      valor_transaccion: "",
      comision_porcentaje: "3.0",
      fecha_transaccion: new Date().toISOString().split('T')[0],
      fecha_firma_contrato: "",
      cliente_nombre: "",
      cliente_email: "",
      cliente_telefono: "",
      cliente_cedula: "",
      cliente_tipo_documento: "CC",
      duracion_contrato_meses: "",
      deposito_garantia: "",
      valor_administracion: "",
      forma_pago: "",
      entidad_financiera: "",
      valor_credito: "",
      valor_inicial: "",
      estado: "pendiente",
      notas: "",
      referido_por: "",
      canal_captacion: "",
      fecha_primer_contacto: "",
      observaciones: ""
    })

    // Recargar departamentos disponibles al resetear
    try {
      const response = await fetch('/api/sales-rentals/departments')
      const data = await response.json()
      
      if (data.success) {
        setDepartments(data.data || [])
      }
    } catch (error) {
      console.error('Error al recargar departamentos:', error)
    }
  }

  // Función para manejar cambio de edificio
  const handleBuildingChange = async (buildingId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      edificio_id: buildingId,
      departamento_id: "", // Reset department selection
      valor_transaccion: "" // Reset transaction value
    }))

    // Si se selecciona un edificio, cargar todos los departamentos de ese edificio
    if (buildingId) {
      try {
        const response = await fetch(`/api/sales-rentals/departments?edificio_id=${buildingId}`)
        const data = await response.json()
        
        if (data.success) {
          setDepartments(data.data || [])
        } else {
          console.error('Error al cargar departamentos del edificio:', data.error)
        }
      } catch (error) {
        console.error('Error al cargar departamentos del edificio:', error)
      }
    } else {
      // Si no hay edificio seleccionado, cargar solo los departamentos disponibles
      try {
        const response = await fetch('/api/sales-rentals/departments')
        const data = await response.json()
        
        if (data.success) {
          setDepartments(data.data || [])
        }
      } catch (error) {
        console.error('Error al cargar departamentos:', error)
      }
    }
  }

  // Función para manejar cambio de departamento y pre-llenar valor
  const handleDepartmentChange = (departmentId: string) => {
    const department = departments.find(d => d.id.toString() === departmentId)
    let suggestedValue = ""
    
    if (department) {
      if (formData.tipo_transaccion === "venta" && department.valor_venta) {
        suggestedValue = department.valor_venta.toString()
      } else if (formData.tipo_transaccion === "arriendo" && department.valor_arriendo) {
        suggestedValue = department.valor_arriendo.toString()
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      departamento_id: departmentId,
      valor_transaccion: suggestedValue
    }))
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.edificio_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.departamento_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.agente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.tipo_transaccion === filterType
    const matchesStatus = filterStatus === 'all' || transaction.estado === filterStatus
    const matchesAgent = filterAgent === 'all' || transaction.agente_id.toString() === filterAgent
    
    return matchesSearch && matchesType && matchesStatus && matchesAgent
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { variant: "secondary" as const, text: "Pendiente" },
      en_proceso: { variant: "default" as const, text: "En Proceso" },
      completada: { variant: "default" as const, text: "Completada", className: "bg-green-100 text-green-800" },
      cancelada: { variant: "destructive" as const, text: "Cancelada" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    return type === 'venta' ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800">Venta</Badge>
    ) : (
      <Badge variant="default" className="bg-purple-100 text-purple-800">Arriendo</Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando ventas y arriendos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <div className="flex flex-col space-y-4">
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div>
            <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
              Ventas y Arriendos
            </h3>
            <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
              Gestiona todas las transacciones inmobiliarias
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'w-full' : ''}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
            <Card>
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex items-center gap-2">
                  <DollarSign className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600`} />
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Transacciones</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{stats.total_transacciones}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Ventas</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{stats.ventas_completadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex items-center gap-2">
                  <Users className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600`} />
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Arriendos</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{stats.arriendos_completados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex items-center gap-2">
                  <BarChart3 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-orange-600`} />
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Comisiones</p>
                    <p className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold`}>
                      {formatCurrency(stats.comisiones_generadas)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 md:grid-cols-6 gap-4'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="venta">Ventas</SelectItem>
                <SelectItem value="arriendo">Arriendos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los administradores</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />

            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Registradas ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Propiedad</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.cliente_nombre}</p>
                        <p className="text-sm text-gray-500">{transaction.cliente_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.edificio_nombre}</p>
                        <p className="text-sm text-gray-500">Depto. {transaction.departamento_numero}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.tipo_transaccion)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.valor_transaccion)}
                    </TableCell>
                    <TableCell>{transaction.agente_nombre}</TableCell>
                    <TableCell>{getStatusBadge(transaction.estado)}</TableCell>
                    <TableCell>
                      {new Date(transaction.fecha_transaccion).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {transaction.estado !== 'completada' && transaction.estado !== 'cancelada' && (
                          <Select
                            value={transaction.estado}
                            onValueChange={(value) => handleUpdateTransactionStatus(transaction.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en_proceso">En Proceso</SelectItem>
                              <SelectItem value="completada">Completada</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear nueva transacción */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-4xl max-h-[80vh] overflow-y-auto'}`}>
          <DialogHeader>
            <DialogTitle>Nueva Transacción</DialogTitle>
            <DialogDescription>
              Registra una nueva venta o arriendo
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="additional">Adicional</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_transaccion">Tipo de Transacción</Label>
                    <Select 
                      value={formData.tipo_transaccion} 
                      onValueChange={(value: "venta" | "arriendo") => setFormData(prev => ({ ...prev, tipo_transaccion: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venta">Venta</SelectItem>
                        <SelectItem value="arriendo">Arriendo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edificio_id">Edificio</Label>
                    <Select 
                      value={formData.edificio_id} 
                      onValueChange={(value) => handleBuildingChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar edificio" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((building) => (
                          <SelectItem key={building.id} value={building.id.toString()}>
                            {building.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departamento_id">Departamento</Label>
                    <Select 
                      value={formData.departamento_id} 
                      onValueChange={(value) => handleDepartmentChange(value)}
                      disabled={!formData.edificio_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.edificio_id ? "Primero selecciona un edificio" : "Seleccionar departamento"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDepartmentsByBuilding.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">Depto. {dept.numero} - {dept.nombre}</span>
                              <span className="text-sm text-gray-500">
                                Piso {dept.piso} • {dept.area}m² • {dept.cantidad_habitaciones}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="agente_id">Administrador</Label>
                    <Select 
                      value={formData.agente_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, agente_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar agente" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Información detallada del departamento seleccionado */}
                {selectedDepartment && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 text-sm">Información del Departamento</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Edificio:</span> {selectedDepartment.edificio_nombre}
                      </div>
                      <div>
                        <span className="font-medium">Número:</span> {selectedDepartment.numero}
                      </div>
                      <div>
                        <span className="font-medium">Nombre:</span> {selectedDepartment.nombre}
                      </div>
                      <div>
                        <span className="font-medium">Piso:</span> {selectedDepartment.piso}
                      </div>
                      <div>
                        <span className="font-medium">Área:</span> {selectedDepartment.area} m²
                      </div>
                      <div>
                        <span className="font-medium">Habitaciones:</span> {selectedDepartment.cantidad_habitaciones}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {selectedDepartment.tipo}
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span> {selectedDepartment.estado}
                      </div>
                      {selectedDepartment.valor_venta && (
                        <div>
                          <span className="font-medium">Precio Venta:</span> ${selectedDepartment.valor_venta.toLocaleString('es-CO')}
                        </div>
                      )}
                      {selectedDepartment.valor_arriendo && (
                        <div>
                          <span className="font-medium">Precio Arriendo:</span> ${selectedDepartment.valor_arriendo.toLocaleString('es-CO')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor_transaccion">Valor de la Transacción</Label>
                    <Input
                      id="valor_transaccion"
                      type="number"
                      placeholder="Ej: 250000000"
                      value={formData.valor_transaccion}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor_transaccion: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="comision_porcentaje">Comisión (%)</Label>
                    <Input
                      id="comision_porcentaje"
                      type="number"
                      step="0.1"
                      placeholder="3.0"
                      value={formData.comision_porcentaje}
                      onChange={(e) => setFormData(prev => ({ ...prev, comision_porcentaje: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha_transaccion">Fecha de Transacción</Label>
                    <Input
                      id="fecha_transaccion"
                      type="date"
                      value={formData.fecha_transaccion}
                      onChange={(e) => setFormData(prev => ({ ...prev, fecha_transaccion: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Select 
                      value={formData.estado} 
                      onValueChange={(value: "pendiente" | "en_proceso" | "completada" | "cancelada") => setFormData(prev => ({ ...prev, estado: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en_proceso">En Proceso</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Datos del Cliente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cliente_nombre">Nombre Completo</Label>
                      <Input
                        id="cliente_nombre"
                        placeholder="Nombre del cliente"
                        value={formData.cliente_nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, cliente_nombre: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cliente_email">Email</Label>
                      <Input
                        id="cliente_email"
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={formData.cliente_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, cliente_email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cliente_telefono">Teléfono</Label>
                      <Input
                        id="cliente_telefono"
                        placeholder="300 123 4567"
                        value={formData.cliente_telefono}
                        onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefono: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cliente_tipo_documento">Tipo Doc.</Label>
                      <Select 
                        value={formData.cliente_tipo_documento} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_tipo_documento: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">Cédula</SelectItem>
                          <SelectItem value="CE">Cédula Extranjería</SelectItem>
                          <SelectItem value="NIT">NIT</SelectItem>
                          <SelectItem value="PP">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="cliente_cedula">Número Documento</Label>
                      <Input
                        id="cliente_cedula"
                        placeholder="12345678"
                        value={formData.cliente_cedula}
                        onChange={(e) => setFormData(prev => ({ ...prev, cliente_cedula: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {formData.tipo_transaccion === 'arriendo' ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">Detalles del Arriendo</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="duracion_contrato_meses">Duración (meses)</Label>
                        <Input
                          id="duracion_contrato_meses"
                          type="number"
                          placeholder="12"
                          value={formData.duracion_contrato_meses}
                          onChange={(e) => setFormData(prev => ({ ...prev, duracion_contrato_meses: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="deposito_garantia">Depósito de Garantía</Label>
                        <Input
                          id="deposito_garantia"
                          type="number"
                          placeholder="2500000"
                          value={formData.deposito_garantia}
                          onChange={(e) => setFormData(prev => ({ ...prev, deposito_garantia: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="valor_administracion">Valor Administración</Label>
                        <Input
                          id="valor_administracion"
                          type="number"
                          placeholder="350000"
                          value={formData.valor_administracion}
                          onChange={(e) => setFormData(prev => ({ ...prev, valor_administracion: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium">Detalles de la Venta</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="forma_pago">Forma de Pago</Label>
                        <Select 
                          value={formData.forma_pago} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, forma_pago: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contado">Contado</SelectItem>
                            <SelectItem value="financiacion">Financiación</SelectItem>
                            <SelectItem value="mixto">Mixto</SelectItem>
                            <SelectItem value="leasing">Leasing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="entidad_financiera">Entidad Financiera</Label>
                        <Input
                          id="entidad_financiera"
                          placeholder="Banco o entidad"
                          value={formData.entidad_financiera}
                          onChange={(e) => setFormData(prev => ({ ...prev, entidad_financiera: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valor_credito">Valor del Crédito</Label>
                        <Input
                          id="valor_credito"
                          type="number"
                          placeholder="200000000"
                          value={formData.valor_credito}
                          onChange={(e) => setFormData(prev => ({ ...prev, valor_credito: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="valor_inicial">Valor Inicial</Label>
                        <Input
                          id="valor_inicial"
                          type="number"
                          placeholder="50000000"
                          value={formData.valor_inicial}
                          onChange={(e) => setFormData(prev => ({ ...prev, valor_inicial: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="fecha_firma_contrato">Fecha Firma Contrato</Label>
                  <Input
                    id="fecha_firma_contrato"
                    type="date"
                    value={formData.fecha_firma_contrato}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_firma_contrato: e.target.value }))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referido_por">Referido por</Label>
                    <Input
                      id="referido_por"
                      placeholder="Nombre del referidor"
                      value={formData.referido_por}
                      onChange={(e) => setFormData(prev => ({ ...prev, referido_por: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="canal_captacion">Canal de Captación</Label>
                    <Select 
                      value={formData.canal_captacion} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, canal_captacion: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="recomendacion">Recomendación</SelectItem>
                        <SelectItem value="llamada">Llamada telefónica</SelectItem>
                        <SelectItem value="redes_sociales">Redes sociales</SelectItem>
                        <SelectItem value="publicidad">Publicidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fecha_primer_contacto">Fecha Primer Contacto</Label>
                  <Input
                    id="fecha_primer_contacto"
                    type="date"
                    value={formData.fecha_primer_contacto}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_primer_contacto: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="notas">Notas de la Transacción</Label>
                  <Textarea
                    id="notas"
                    placeholder="Detalles adicionales de la transacción..."
                    value={formData.notas}
                    onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones Generales</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTransaction} className="bg-green-600 hover:bg-green-700">
              Crear Transacción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles de transacción */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-3xl max-h-[80vh] overflow-y-auto'}`}>
            <DialogHeader>
              <DialogTitle>Detalles de la Transacción</DialogTitle>
              <DialogDescription>
                Información completa de la transacción #{selectedTransaction.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tipo</Label>
                  <div className="mt-1">{getTypeBadge(selectedTransaction.tipo_transaccion)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.estado)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor</Label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedTransaction.valor_transaccion)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Comisión</Label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedTransaction.comision_valor)} ({selectedTransaction.comision_porcentaje}%)</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Cliente</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedTransaction.cliente_nombre}</p>
                  <p className="text-sm text-gray-600">{selectedTransaction.cliente_email}</p>
                  <p className="text-sm text-gray-600">{selectedTransaction.cliente_telefono}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Propiedad</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedTransaction.edificio_nombre}</p>
                  <p className="text-sm text-gray-600">Departamento {selectedTransaction.departamento_numero}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Agente</Label>
                <p className="font-medium">{selectedTransaction.agente_nombre}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha Transacción</Label>
                  <p>{new Date(selectedTransaction.fecha_transaccion).toLocaleDateString('es-CO')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha Registro</Label>
                  <p>{new Date(selectedTransaction.fecha_registro).toLocaleDateString('es-CO')}</p>
                </div>
              </div>

              {selectedTransaction.notas && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notas</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{selectedTransaction.notas}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 