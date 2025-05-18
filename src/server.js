import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { router } from './routes/router.js'
import { errorHandler } from './utils/errorHandler.js'
import { logger } from './utils/logger.js'
import client from 'prom-client'
import helmet from "helmet";
import {rateLimit} from "express-rate-limit";


const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics()
dotenv.config()

const app = express()


app.use(helmet())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(cors())
app.use(express.json())

// Optional: log all requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`)
    next()
})


app.get('/health', (req, res) => res.status(200).send('OK'))
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType)
    res.end(await client.register.metrics())
})
app.use("/api", router)

app.use(errorHandler)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
})