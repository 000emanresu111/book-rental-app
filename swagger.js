const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./routes/authRoutes.js', './routes/bookRoutes.js', './routes/bookstoreRoutes.js']

swaggerAutogen(outputFile, endpointsFiles)
