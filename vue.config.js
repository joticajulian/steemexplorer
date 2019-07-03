module.exports = {
  devServer: { disableHostCheck: true },

  publicPath: process.env.NODE_ENV === 'production'
    ? '/steemexplorer/'
    : '/'
  /** Bundle Analyzer
   *
   *  to intall:
   *  vue add webpack-bundle-analyzer
   */
  /* pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: true,
      analyzerHost: '0.0.0.0',
      analyzerPort: '8084',
    }
  }*/
}
