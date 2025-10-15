// Security Note: Default credentials have been removed for security reasons.
// If you need demo accounts, create them through the proper signup process
// or use environment variables for development purposes only.

// Example of how to use environment variables for development:
// export const DEFAULT_CREDENTIALS = {
//   user: {
//     username: process.env.VITE_DEMO_USER_USERNAME || '',
//     password: process.env.VITE_DEMO_USER_PASSWORD || '',
//     role: 'user',
//     email: process.env.VITE_DEMO_USER_EMAIL || ''
//   },
//   admin: {
//     username: process.env.VITE_DEMO_ADMIN_USERNAME || '',
//     password: process.env.VITE_DEMO_ADMIN_PASSWORD || '',
//     role: 'admin',
//     email: process.env.VITE_DEMO_ADMIN_EMAIL || ''
//   },
//   systemAdmin: {
//     username: process.env.VITE_DEMO_SYSTEM_ADMIN_USERNAME || '',
//     password: process.env.VITE_DEMO_SYSTEM_ADMIN_PASSWORD || '',
//     role: 'systemAdmin',
//     email: process.env.VITE_DEMO_SYSTEM_ADMIN_EMAIL || ''
//   }
// };

// For production, remove this file entirely or ensure no hardcoded credentials exist
export const DEFAULT_CREDENTIALS = {};