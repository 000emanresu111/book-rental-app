module.exports = {
  development: {
    connectToDB: true
  },
  testing: {
    connectToDB: false
  },
  docker: {
    connectToDB: true
  },
  production: {
    connectToDB: true
  }
}
