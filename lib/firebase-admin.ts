import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

// Función para inicializar Firebase Admin solo cuando sea necesario
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  try {
    const serviceAccount = {
      type: "service_account",
      project_id: "homestate-web",
      private_key_id: "970e9889593a76558320e8fad6d6b7dd6b4ff4f6",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsPs9acKQl2pTK\nLm81vpIou2eRWpYfHPb3UjGH0N330C+4og2CTP2cV7eDViXpB8N+uM4wi4nex6x0\naK9PdH3urhpqRGHIz5KwRhcs47t9gPGWtfU0/MJCE+fbYEL1XIElYoLRN88lyQip\nQ2uxzYn4Z0zqCAdhyFQCBXm+CFaRrBbwtGIBeJra5HFpnJa68c401n5P7C3Q81k7\nkbHdAv0+Of4RwfdQMQ0YGHp78964fhwAZX4GNGLyOFem6EqcmneYvMdkuba8ZO71\nlONvArVHCRoMNy41t2Od446eNKYoQjAcLly9uFCXkPAutu8K11jnJ8WD1xwLKRbU\n3+Z5CybFAgMBAAECggEACHVByl+gook5aDTf2iREWhgFwxdPKtz0avr6xVVmKPPs\npqTdLp+oOSP84Mf7WZY7gn6sWqmSI2yWVSsKJ3KBd+sjD0J8s2yEoqpLxgpdcRFt\nYOizefQgIo2Grk5A9iUiObCSMELiJalZsbIcA4xOcPJlo6exm8VyC/KyjTiB7mo6\nYF5tHGgFwBwn82PHIhJbIfzZNiDLfj0c6AutMbpjkGYusV0XdlkR82TXLSTT2lDX\nyzXSWpI/PR2Y1BcfOInii6E3m2Bx0g+u9Ld1ACH9HirCGgAnpZkOXckd1OupUolb\n/DGH90kjYS0XQf4Jz8nCJF2aiFc4CzRraPSDdLBl4QKBgQDl31xK38w6PFVS3EMl\nAGu2U6P+XzeRD+zS4de15nc/je8FPIpAO93Lspa8TdPNh4vi/nHHZID6DrDWt6Kc\n9RyxuNEfzd4XRJ3HEOaGosYuwVNBYGwrSe8kkd80VepYviyvS81anC+hSVooLDmk\n6ihKmDXym0/E8It5IIOgpH++UQKBgQC/0qmTdzr0mGotc1hr65fAAR/KQOqThhJa\nS2oZOzCD93SwFQu9HdrtkZETrsSZmvSS62rYZStzOk2cMQyk1o/xbR/ix3HSNL6u\nvFtjthwMv3IhGxZbyHJS1y9aPVpWreXWtXNU4DrLM7alt75POCUf4PMNPCdf0hIK\nC9EVWxzANQKBgAg8VGYqVnrPpo7tbUpqFXHW1U1LxAXieC2mAcB2nVcdkq6xWJKs\nkmm14Eim0SvP62cajqECLMzIsfU/ZwgQkBKd+IAXNBnJT43OQTQZqNgL/RuehMGY\nSIUa5NBPM7IyPg+Zu6W/asVwh1ZhHz+VVBQ4F9a1UcpQg+63B4A95IXBAoGBALhe\n8+ywSfM018ENv6wjCn1a10Jf+NeIovU0zSqpMG13GCnyYJEKNBXptwazEXYOcQsR\nyWVqgEPFgzkgD+YT8NB9MYuYZXdEiQ6MLk79h6JdFIZrcacQV4n2GCZlGAJ+LI6d\nYtfumbQb5W8M15dvAIfOf+51pea8k+giCXm8VDsNAoGAXYLVMDE/iq+DKt8GIrda\nNzv2bES0A65lLmBiDIwwRAob9MRlt1mPX1V/yl4HOxvkzCemZn/rGFAyz591rTHg\nMPClitPEqn+1BBESM8wDLpj7Z0lp+c9UQaGTSa6fS5pFHFePM8OLdnUV9m+2e7Sz\nTU4B75hPaTQVWg6Yi1kRsFU=\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-fbsvc@homestate-web.iam.gserviceaccount.com",
      client_id: "115862426835415470423",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40homestate-web.iam.gserviceaccount.com",
      universe_domain: "googleapis.com"
    }

    return initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: 'homestate-web.firebasestorage.app'
    })
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    throw error
  }
}

// Función para obtener storage de manera segura
export function getFirebaseStorage() {
  try {
    initializeFirebaseAdmin()
    return getStorage()
  } catch (error) {
    console.error('Error getting Firebase storage:', error)
    throw error
  }
}

// Función para obtener bucket de manera segura
export function getFirebaseBucket() {
  try {
    const storage = getFirebaseStorage()
    return storage.bucket()
  } catch (error) {
    console.error('Error getting Firebase bucket:', error)
    throw error
  }
}

// Función para eliminar un archivo de Firebase Storage
export async function deleteFirebaseFile(filePath: string) {
  try {
    const bucket = getFirebaseBucket()
    const file = bucket.file(filePath)
    
    // Verificar si el archivo existe antes de intentar eliminarlo
    const [exists] = await file.exists()
    if (!exists) {
      console.warn(`File ${filePath} does not exist, skipping deletion`)
      return { success: true, message: `File ${filePath} does not exist` }
    }
    
    await file.delete()
    console.log(`Successfully deleted file: ${filePath}`)
    return { success: true, message: `File ${filePath} deleted successfully` }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error)
    throw error
  }
}

// Función para eliminar múltiples archivos de Firebase Storage
export async function deleteFirebaseFiles(filePaths: string[]) {
  const results = []
  
  for (const filePath of filePaths) {
    try {
      const result = await deleteFirebaseFile(filePath)
      results.push({ filePath, ...result })
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error)
      results.push({ 
        filePath, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }
  
  return results
}

// Función para extraer el path del archivo desde una URL de Firebase Storage
export function getFilePathFromUrl(url: string): string | null {
  try {
    // Extraer el path del archivo desde la URL de Firebase Storage
    // Formato: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.jpg?alt=media&token=...
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)/)
    
    if (pathMatch && pathMatch[1]) {
      // Decodificar el path (reemplazar %2F con /)
      return decodeURIComponent(pathMatch[1])
    }
    
    return null
  } catch (error) {
    console.error('Error extracting file path from URL:', error)
    return null
  }
}

// Función para subir una imagen a Firebase Storage
export async function uploadImageToFirebase(file: File, path: string): Promise<string> {
  try {
    const bucket = getFirebaseBucket()
    const firebaseFile = bucket.file(path)
    
    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Subir el archivo
    await firebaseFile.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name
        }
      }
    })
    
    // Hacer el archivo público
    await firebaseFile.makePublic()
    
    // Construir la URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`
    
    console.log(`Successfully uploaded image: ${path}`)
    return publicUrl
    
  } catch (error) {
    console.error(`Error uploading image ${path}:`, error)
    throw error
  }
}

// Función para eliminar todas las imágenes de un edificio
export async function deleteBuildingImages(building: {
  nombre: string
  url_imagen_principal?: string
  imagenes_secundarias?: string[]
}) {
  const filesToDelete: string[] = []
  
  // Agregar imagen principal si existe
  if (building.url_imagen_principal) {
    const mainImagePath = getFilePathFromUrl(building.url_imagen_principal)
    if (mainImagePath) {
      filesToDelete.push(mainImagePath)
    }
  }
  
  // Agregar imágenes secundarias si existen
  if (building.imagenes_secundarias && building.imagenes_secundarias.length > 0) {
    for (const imageUrl of building.imagenes_secundarias) {
      const imagePath = getFilePathFromUrl(imageUrl)
      if (imagePath) {
        filesToDelete.push(imagePath)
      }
    }
  }
  
  // También intentar eliminar la carpeta completa del edificio
  const folderPath = `edificios/${building.nombre}/`
  try {
    const bucket = getFirebaseBucket()
    const [files] = await bucket.getFiles({ prefix: folderPath })
    
    for (const file of files) {
      filesToDelete.push(file.name)
    }
  } catch (error) {
    console.warn('Could not list files in building folder:', error)
  }
  
  if (filesToDelete.length === 0) {
    return { success: true, message: 'No images to delete', deletedFiles: [] }
  }
  
  // Eliminar todos los archivos
  const results = await deleteFirebaseFiles(filesToDelete)
  
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  
  return {
    success: failCount === 0,
    message: `Deleted ${successCount} files${failCount > 0 ? `, failed to delete ${failCount} files` : ''}`,
    deletedFiles: results.filter(r => r.success).map(r => r.filePath),
    failedFiles: results.filter(r => !r.success).map(r => ({ path: r.filePath, error: r.error }))
  }
} 