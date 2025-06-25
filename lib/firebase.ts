import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDBcoekIwqAIsRXGEAfWriq4Lznhab_Vgg",
  authDomain: "homestate-web.firebaseapp.com",
  projectId: "homestate-web",
  storageBucket: "homestate-web.firebasestorage.app",
  messagingSenderId: "738439557061",
  appId: "1:738439557061:web:1ac96b5c9ad1cd2fe3a5ac",
  measurementId: "G-J7YCQB6HBV"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app 