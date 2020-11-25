const path = require('path')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const express = require('express')

function createWebpackMiddleware (compiler, publicPath) {
  return webpackDevMiddleware(compiler, {
    publicPath
  })
}

module.exports = function addDevMiddlewares (app, webpackConfig) {
  const compiler = webpack(webpackConfig)
  const middleware = createWebpackMiddleware(
    compiler,
    webpackConfig.output.publicPath
  )

  const publicPath = '/public'
  const outputPath = compiler.outputPath

  app.use(publicPath, express.static(outputPath))
  app.use(middleware)
  app.use(webpackHotMiddleware(compiler))

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.context.outputFileSystem

  app.get('*', (_, res) => {
    fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404)
      } else {
        res.send(file.toString())
      }
    })
  })
}
