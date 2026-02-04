import { eventRouter } from "../modules/events/routes.js";
import express from 'express'

const router = express.Router()

router.use('/events', eventRouter)

export const routes = router
