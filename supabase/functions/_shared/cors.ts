// CORS configuration - restrict to specific domains for security
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:8080',
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
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin)
  
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
  }
}
