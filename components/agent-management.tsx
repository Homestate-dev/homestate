import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'

interface Agent {
  id: number
  nombre: string
  email: string
  telefono?: string
  cedula?: string
  especialidad: string
  comision_ventas: number
  comision_arriendos: number
  activo: boolean
  foto_perfil?: string
  biografia?: string
  fecha_ingreso: string
  fecha_creacion: string
  fecha_actualizacion: string
}

interface Transaction {
  id: number
  departamento_nombre: string
  departamento_numero: string
  edificio_nombre: string
  tipo_transaccion: string
  precio_final: number
  comision_agente: number
  fecha_transaccion: string
  cliente_nombre?: string
}

interface AgentStats {
  total_transacciones: number
  total_ventas: number
  total_arriendos: number
  volumen_total: number
  comisiones_totales: number
  precio_promedio: number
}

export default function AgentManagement() {
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Formulario para crear/editar agente
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    cedula: '',
    especialidad: 'ambas',
    comision_ventas: 3.00,
    comision_arriendos: 10.00,
    foto_perfil: '',
    biografia: ''
  })

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      if (data.success) {
        setAgents(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los agentes inmobiliarios',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }



  const handleCreateAgent = async () => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentUserUid: currentUser?.uid
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Agente inmobiliario creado exitosamente'
        })
        setIsCreateDialogOpen(false)
        loadAgents()
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          cedula: '',
          especialidad: 'ambas',
          comision_ventas: 3.00,
          comision_arriendos: 10.00,
          foto_perfil: '',
          biografia: ''
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear agente inmobiliario',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentUserUid: currentUser?.uid
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Agente actualizado exitosamente'
        })
        setIsEditDialogOpen(false)
        loadAgents()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar agente',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteAgent = async (agentId: number, agentName: string) => {
    if (!confirm(`¿Está seguro que desea eliminar al agente ${agentName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserUid: currentUser?.uid,
          agentName
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Agente eliminado exitosamente'
        })
        loadAgents()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar agente',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Agentes Inmobiliarios</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Agregar Agente</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Agente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Select
                  value={formData.especialidad}
                  onValueChange={(value) => setFormData({ ...formData, especialidad: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ventas">Ventas</SelectItem>
                    <SelectItem value="arriendos">Arriendos</SelectItem>
                    <SelectItem value="ambas">Ambas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comision_ventas">Comisión Ventas (%)</Label>
                <Input
                  id="comision_ventas"
                  type="number"
                  step="0.01"
                  value={formData.comision_ventas}
                  onChange={(e) => setFormData({ ...formData, comision_ventas: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comision_arriendos">Comisión Arriendos (%)</Label>
                <Input
                  id="comision_arriendos"
                  type="number"
                  step="0.01"
                  value={formData.comision_arriendos}
                  onChange={(e) => setFormData({ ...formData, comision_arriendos: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="foto_perfil">URL Foto de Perfil</Label>
                <Input
                  id="foto_perfil"
                  value={formData.foto_perfil}
                  onChange={(e) => setFormData({ ...formData, foto_perfil: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="biografia">Biografía</Label>
                <Textarea
                  id="biografia"
                  value={formData.biografia}
                  onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAgent}>Crear Agente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={agent.foto_perfil} />
                    <AvatarFallback>{agent.nombre.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {agent.nombre}
                      <Badge variant={agent.activo ? 'default' : 'secondary'}>
                        {agent.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAgent(agent)
                      setFormData({
                        nombre: agent.nombre,
                        email: agent.email,
                        telefono: agent.telefono || '',
                        cedula: agent.cedula || '',
                        especialidad: agent.especialidad,
                        comision_ventas: agent.comision_ventas,
                        comision_arriendos: agent.comision_arriendos,
                        foto_perfil: agent.foto_perfil || '',
                        biografia: agent.biografia || ''
                      })
                      setIsEditDialogOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteAgent(agent.id, agent.nombre)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info" className="w-full">
                <TabsList>
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                  <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                </TabsList>
                <TabsContent value="info">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Especialidad</h4>
                      <p className="capitalize">{agent.especialidad}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Teléfono</h4>
                      <p>{agent.telefono || 'No especificado'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Cédula</h4>
                      <p>{agent.cedula || 'No especificada'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Fecha de Ingreso</h4>
                      <p>{formatDate(agent.fecha_ingreso)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Comisión Ventas</h4>
                      <p>{agent.comision_ventas}%</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Comisión Arriendos</h4>
                      <p>{agent.comision_arriendos}%</p>
                    </div>
                  </div>
                  {agent.biografia && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Biografía</h4>
                      <p className="text-sm text-gray-600">{agent.biografia}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="stats">
                  <StatsTab agentId={agent.id} />
                </TabsContent>
                <TabsContent value="transactions">
                  <TransactionsTab agentId={agent.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para editar agente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Agente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nombre">Nombre Completo</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cedula">Cédula</Label>
              <Input
                id="edit-cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-especialidad">Especialidad</Label>
              <Select
                value={formData.especialidad}
                onValueChange={(value) => setFormData({ ...formData, especialidad: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventas">Ventas</SelectItem>
                  <SelectItem value="arriendos">Arriendos</SelectItem>
                  <SelectItem value="ambas">Ambas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-comision_ventas">Comisión Ventas (%)</Label>
              <Input
                id="edit-comision_ventas"
                type="number"
                step="0.01"
                value={formData.comision_ventas}
                onChange={(e) => setFormData({ ...formData, comision_ventas: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-comision_arriendos">Comisión Arriendos (%)</Label>
              <Input
                id="edit-comision_arriendos"
                type="number"
                step="0.01"
                value={formData.comision_arriendos}
                onChange={(e) => setFormData({ ...formData, comision_arriendos: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-foto_perfil">URL Foto de Perfil</Label>
              <Input
                id="edit-foto_perfil"
                value={formData.foto_perfil}
                onChange={(e) => setFormData({ ...formData, foto_perfil: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-biografia">Biografía</Label>
              <Textarea
                id="edit-biografia"
                value={formData.biografia}
                onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateAgent}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente para el tab de estadísticas
function StatsTab({ agentId }: { agentId: number }) {
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}/stats`)
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [agentId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return <div className="text-center py-4">Cargando estadísticas...</div>
  }

  if (!stats) {
    return <div className="text-center py-4">No hay estadísticas disponibles</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total_transacciones}</p>
          <div className="mt-2 text-sm">
            <p>Ventas: {stats.total_ventas}</p>
            <p>Arriendos: {stats.total_arriendos}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Volumen Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(Number(stats.volumen_total))}</p>
          <p className="mt-2 text-sm">Promedio: {formatCurrency(Number(stats.precio_promedio))}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comisiones Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(Number(stats.comisiones_totales))}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para el tab de transacciones
function TransactionsTab({ agentId }: { agentId: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await fetch(`/api/transactions?agentId=${agentId}`)
        const data = await response.json()
        if (data.success) {
          setTransactions(data.data)
        }
      } catch (error) {
        console.error('Error al cargar transacciones:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTransactions()
  }, [agentId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-center py-4">Cargando transacciones...</div>
  }

  if (transactions.length === 0) {
    return <div className="text-center py-4">No hay transacciones registradas</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Edificio</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          <TableHead className="text-right">Comisión</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{formatDate(transaction.fecha_transaccion)}</TableCell>
            <TableCell className="capitalize">{transaction.tipo_transaccion}</TableCell>
            <TableCell>{transaction.departamento_nombre} #{transaction.departamento_numero}</TableCell>
            <TableCell>{transaction.edificio_nombre}</TableCell>
            <TableCell>{transaction.cliente_nombre || 'No especificado'}</TableCell>
            <TableCell className="text-right">{formatCurrency(transaction.precio_final)}</TableCell>
            <TableCell className="text-right">{formatCurrency(transaction.comision_agente)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 