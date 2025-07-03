"use client"

import { useRef, useEffect } from 'react'

interface RenderInfo {
  count: number
  lastRender: number
  component: string
}

const renderCounts = new Map<string, RenderInfo>()

export function useRenderDetector(componentName: string, maxRenders = 100, timeWindow = 1000) {
  const renderCountRef = useRef(0)
  const lastCheckRef = useRef(Date.now())
  
  renderCountRef.current += 1
  const now = Date.now()
  
  // Resetear contador si ha pasado el tiempo de ventana
  if (now - lastCheckRef.current > timeWindow) {
    renderCountRef.current = 1
    lastCheckRef.current = now
  }
  
  // Detectar posible ciclo infinito
  if (renderCountRef.current > maxRenders) {
    console.error(`⚠️ INFINITE RENDER DETECTED: ${componentName} rendered ${renderCountRef.current} times in ${timeWindow}ms`)
    console.error('Component may be in an infinite re-render loop!')
    console.trace('Render trace:')
    
    // En desarrollo, lanzar error para depuración
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Infinite render loop detected in ${componentName}`)
    }
    
    // En producción, registrar error pero no romper la app
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `Infinite render: ${componentName}`,
        fatal: false
      })
    }
  }
  
  useEffect(() => {
    // Log de renders para debugging
    if (process.env.NODE_ENV === 'development' && renderCountRef.current > 10) {
      console.warn(`${componentName} rendered ${renderCountRef.current} times in last ${timeWindow}ms`)
    }
  })
}

export function DebugRenderInfo({ componentName }: { componentName: string }) {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        {componentName}: {renderCountRef.current} renders
      </div>
    )
  }
  
  return null
} 