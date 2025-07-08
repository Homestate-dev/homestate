"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Briefcase, Phone, CreditCard, Percent, Image, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type CreateAdminDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  admin?: any
}

export function CreateAdminDialog({ open, onOpenChange, onSubmit, admin }: CreateAdminDialogProps) {
  const [formData, setFormData] = useState({
    id: 0,
    nombre: "",
    email: "",
    password: "",
    activo: true,
    telefono: "",
    cedula: "",
    especialidad: "ambas",
    comision_ventas: 3.00,
    comision_arriendos: 10.00,
    foto_perfil: "",
    biografia: "",
    es_agente: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (admin) {
      setFormData({
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        password: "", // No mostramos la contraseña actual por seguridad
        activo: admin.activo,
        telefono: admin.telefono || "",
        cedula: admin.cedula || "",
        especialidad: admin.especialidad || "ambas",
        comision_ventas: admin.comision_ventas || 3.00,
        comision_arriendos: admin.comision_arriendos || 10.00,
        foto_perfil: admin.foto_perfil || "",
        biografia: admin.biografia || "",
        es_agente: admin.es_agente !== false // Por defecto true si no está definido
      })
    } else {
      setFormData({
        id: 0,
        nombre: "",
        email: "",
        password: "",
        activo: true,
        telefono: "",
        cedula: "",
        especialidad: "ambas",
        comision_ventas: 3.00,
        comision_arriendos: 10.00,
        foto_perfil: "",
        biografia: "",
        es_agente: true
      })
    }
    setErrors({})
  }, [admin, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const processedValue = (name === 'comision_ventas' || name === 'comision_arriendos') 
      ? parseFloat(value) || 0 
      : value
    setFormData((prev) => ({ ...prev, [name]: processedValue }))
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, activo: checked }))
  }

  const handleAgentSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, es_agente: checked }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!admin && !formData.password) {
      newErrors.password = "La contraseña es obligatoria"
    } else if (!admin && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {admin ? (
              <>
                <User className="h-5 w-5 text-orange-600" />
                Editar Administrador
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-orange-600" />
                Nuevo Administrador
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {admin
              ? "Actualice los datos del administrador seleccionado"
              : "Complete el formulario para crear un nuevo administrador (también actuará como agente inmobiliario)"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
          <div className="space-y-6 py-4">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <User className="h-5 w-5" />
                Información de Administrador
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre completo"
                    className="pl-9"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </div>
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña {!admin && <span className="text-red-500">*</span>}</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={admin ? "Dejar en blanco para mantener la actual" : "Mínimo 6 caracteres"}
                    className="pl-9 pr-10"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            </div>

            {/* Información de agente inmobiliario */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Información de Agente Inmobiliario
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!formData.es_agente ? "text-red-500 font-medium" : "text-gray-500"}`}>
                    No agente
                  </span>
                  <Switch 
                    checked={formData.es_agente} 
                    onCheckedChange={handleAgentSwitchChange}
                  />
                  <span className={`text-sm ${formData.es_agente ? "text-green-600 font-medium" : "text-gray-500"}`}>
                    Es agente
                  </span>
                </div>
              </div>

              {formData.es_agente && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="telefono"
                          name="telefono"
                          placeholder="+593 999 999 999"
                          className="pl-9"
                          value={formData.telefono}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cedula">Cédula</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="cedula"
                          name="cedula"
                          placeholder="1234567890"
                          className="pl-9"
                          value={formData.cedula}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="especialidad">Especialidad *</Label>
                      <Select 
                        value={formData.especialidad} 
                        onValueChange={(value) => handleSelectChange('especialidad', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ventas">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Solo Ventas
                            </div>
                          </SelectItem>
                          <SelectItem value="arriendos">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Solo Arriendos
                            </div>
                          </SelectItem>
                          <SelectItem value="ambas">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              Ambas
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comision_ventas">Comisión Ventas (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="comision_ventas"
                          name="comision_ventas"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="3.00"
                          className="pl-9"
                          value={formData.comision_ventas}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comision_arriendos">Comisión Arriendos (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="comision_arriendos"
                          name="comision_arriendos"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="10.00"
                          className="pl-9"
                          value={formData.comision_arriendos}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foto_perfil">URL Foto de Perfil</Label>
                    <div className="relative">
                      <Image className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="foto_perfil"
                        name="foto_perfil"
                        placeholder="https://ejemplo.com/foto.jpg"
                        className="pl-9"
                        value={formData.foto_perfil}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biografia">Biografía Profesional</Label>
                    <div className="relative">
                      <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Textarea
                        id="biografia"
                        name="biografia"
                        placeholder="Descripción profesional, experiencia, especialidades..."
                        className="pl-9 min-h-[80px] resize-none"
                        rows={3}
                        value={formData.biografia}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {admin && (
              <div className="flex items-center justify-between border-t pt-4">
                <Label htmlFor="activo" className="cursor-pointer">
                  Estado del administrador
                </Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${formData.activo ? "text-gray-500" : "text-red-500 font-medium"}`}>
                    Inactivo
                  </span>
                  <Switch id="activo" checked={formData.activo} onCheckedChange={handleSwitchChange} />
                  <span className={`text-sm ${formData.activo ? "text-green-600 font-medium" : "text-gray-500"}`}>
                    Activo
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              {admin ? "Actualizar" : "Crear"} Administrador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
