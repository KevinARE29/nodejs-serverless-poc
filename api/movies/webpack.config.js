/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'fastify-swagger',
    'class-transformer/storage',
  ]

  return {
    ...options,
    externals: ['_http_common'], // TODO: fix when this PR gets merged: https://github.com/prisma/prisma/issues/6899
    output: {
      libraryTarget: 'commonjs2',
    },
    module: {
      rules: [
        {
          test: /\.ts|\.tsx$/,
          loader: 'ts-loader',
          include: __dirname,
          options: {
            configFile: 'tsconfig.json',
            transpileOnly: true,
            experimentalWatchApi: true,
            getCustomTransformers: (program) => ({
              before: [require('@nestjs/swagger/plugin').before({}, program)],
            }),
          },
        },
      ],
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource)
            } catch (err) {
              return true
            }
          }
          return false
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          '../../node_modules/swagger-ui-dist/swagger-ui.css',
          '../../node_modules/swagger-ui-dist/swagger-ui-bundle.js',
          '../../node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
          '../../node_modules/swagger-ui-dist/favicon-16x16.png',
          '../../node_modules/swagger-ui-dist/favicon-32x32.png',
          '../../node_modules/.prisma/client/query-engine-rhel-openssl-1.0.x',
          './prisma/schema.prisma',
        ],
      }),
    ],
  }
}
