import express from 'express'
import { getEventValidator, postEventValidator } from './validators.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './controller.js'
const router = express.Router()

router.post('/event', postEventValidator, validate, controller.postEvent)
router.get('/:id', getEventValidator, validate, controller.getEvent)



export const eventRouter = router;
