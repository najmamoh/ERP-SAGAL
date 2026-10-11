export const jwtAuthConfig = {
  secret: process.env.SECRET || 'kdb',
  jwtExpiration: 60 * 15,
  jwtRefreshExpiration: 60 * 60 * 24 * 7
}