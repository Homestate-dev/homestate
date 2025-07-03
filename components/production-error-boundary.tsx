"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
  retryCount: number
}

export class ProductionErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generar ID único para el error
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error para debugging
    console.error('ProductionErrorBoundary caught an error:', error, errorInfo)
    
    // Detectar si es el error React #310
    const isReactError310 = error.message && (
      error.message.includes('Minified React error #310') ||
      error.message.includes('useMemo') ||
      error.message.includes('infinite')
    )

    // Log específico para error #310
    if (isReactError310) {
      console.error('🔥 REACT ERROR #310 DETECTED - This is likely a useMemo infinite loop!')
      console.error('Stack trace:', error.stack)
      console.error('Component stack:', errorInfo.componentStack)
    }

    // Enviar error a servicio de monitoreo si está disponible
    this.reportError(error, errorInfo, isReactError310)

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo, isReactError310: boolean) {
    // Reportar a Google Analytics si está disponible
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `${isReactError310 ? 'React310_' : ''}${error.message}`,
        fatal: false,
        error_id: this.state.errorId
      })
    }

    // Reportar a servicio de logging personalizado
    try {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo,
          isReactError310,
          errorId: this.state.errorId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(e => console.error('Failed to report error:', e))
    } catch (e) {
      console.error('Error reporting failed:', e)
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Detectar si es error #310 para mostrar mensaje específico
      const isReactError310 = this.state.error?.message && (
        this.state.error.message.includes('Minified React error #310') ||
        this.state.error.message.includes('useMemo') ||
        this.state.error.message.includes('infinite')
      )

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {isReactError310 ? 'Error de Renderizado' : 'Error de Aplicación'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                {isReactError310 ? (
                  <div>
                    <p className="mb-2">Hemos detectado un problema con el renderizado de la página.</p>
                    <p className="text-sm">Esto puede ser temporal. Por favor, intenta recargar la página.</p>
                  </div>
                ) : (
                  <p>Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.</p>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <h4 className="font-medium text-red-800 mb-2">Error Details (Dev Mode):</h4>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32">
                    {this.state.error?.message}
                  </pre>
                  {this.state.errorId && (
                    <p className="text-xs text-red-600 mt-2">Error ID: {this.state.errorId}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {this.state.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Intentar de nuevo ({this.maxRetries - this.state.retryCount} restantes)
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload} 
                  variant="outline" 
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar página
                </Button>

                <Link href="/" passHref>
                  <Button variant="ghost" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Volver al inicio
                  </Button>
                </Link>
              </div>

              {this.state.errorId && (
                <p className="text-xs text-gray-500 text-center">
                  ID de error: {this.state.errorId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
} 