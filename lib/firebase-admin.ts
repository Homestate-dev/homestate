import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

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

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    storageBucket: 'homestate-web.firebasestorage.app'
  })
}

export const storage = getStorage()
export const bucket = storage.bucket() 