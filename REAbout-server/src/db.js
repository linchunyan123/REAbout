import pg from 'pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const connectionUrl = new URL(process.env.DATABASE_URL)
// Explicitly verify the Neon server certificate and hostname across pg versions.
connectionUrl.searchParams.set('sslmode', 'verify-full')
export const pool = new pg.Pool({
  connectionString: connectionUrl.toString(),
  enableChannelBinding: true,
  max: 5,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  statement_timeout: 15000,
})
pool.on('error', () => console.error('Database connection interrupted'))
