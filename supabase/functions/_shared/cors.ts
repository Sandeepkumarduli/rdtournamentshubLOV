// CORS configuration - restrict to specific domains for security
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081', // Added for your current dev server
  'https://dev1rdtournamentshub.netlify.app', // Added for your hosted domain
  'https://rdtournamentshub.netlify.app',
  'https://rdth.netlify.app',
  // Add your production domains here
]

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be dynamically set based on origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

export const getCorsHeaders = (origin?: string) => {
  // Allow all origins for now to debug the issue, then restrict later
  const isAllowedOrigin = true // Temporarily allow all origins
  
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin || '*',
  }
}
