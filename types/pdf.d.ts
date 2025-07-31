declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any)
    setFont(fontName: string): void
    setFontSize(size: number): void
    text(text: string, x: number, y: number): void
    save(filename: string): void
    autoTable(options: any): void
  }
}

declare global {
  interface Window {
    jsPDF: any
  }
} 