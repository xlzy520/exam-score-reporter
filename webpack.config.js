const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve('components'),
        '@/components': path.resolve('components'),
        '@/utils': path.resolve('utils'),
      },
    },
  },
}
