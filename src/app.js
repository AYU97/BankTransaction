const express = require('express')
const userRouter = require('./routes/user')
const basicSavingsRouter = require('./routes/basicsavings')
const savingsRouter = require('./routes/savings')
const currentRouter = require('./routes/current')


const app = express()
require('./db/db')

const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(basicSavingsRouter)
app.use(savingsRouter)
app.use(currentRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})