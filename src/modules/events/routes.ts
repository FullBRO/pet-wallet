import express from 'express'
import { getEventByIdValidator, postEventValidator } from './validators.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './controller.js'
const router = express.Router()

router.post('/event', postEventValidator, validate, controller.postEvent)
router.get('/event/:id', getEventByIdValidator, validate, controller.getEventById)



export const eventRouter = router;
