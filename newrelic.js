'use strict'

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'ecotransporte-prod'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '0000000000000000000000000000000000000000',
  agent_enabled: Boolean(process.env.NEW_RELIC_LICENSE_KEY),
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
}
