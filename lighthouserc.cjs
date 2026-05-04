module.exports = {
  ci: {
    collect: {
      staticDistDir: './frontend/dist',
      numberOfRuns: 1,
      url: ['http://localhost/'],
      settings: {
        chromeFlags: '--no-sandbox --headless=new'
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './reports/lighthouse'
    }
  }
}
