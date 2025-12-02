// backend/db.js
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Si estamos corriendo tests, usamos DATABASE_URL_TEST (si existe)
const isTest = process.env.NODE_ENV === 'test'

const connectionString = isTest
  ? process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
  : process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
})

export default pool
