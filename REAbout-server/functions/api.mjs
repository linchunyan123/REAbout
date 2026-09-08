import serverless from 'serverless-http'
import { createApp } from '../src/app.js'
import { pool } from '../src/db.js'

// Netlify serves the frontend; reuse the existing Express API and connection pool.
const handle = serverless(createApp(pool, { serveFrontend: false, netlifySiteName: process.env.SITE_NAME }))

export const handler = (event, context) => {
  // Also support direct function URLs, in addition to the /api/* rewrite.
  const path = event.path.replace(/^\/\.netlify\/functions\/api(?=\/|$)/, '/api')
  return handle({ ...event, path }, context)
}
