import express from 'express'
import { postEventValidator } from './validators.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './controller.js'
const router = express.Router()

router.post('/event', postEventValidator, validate, controller.postEvent)



export const eventRouter = router;
