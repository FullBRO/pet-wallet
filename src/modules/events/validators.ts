import {body, param, query} from 'express-validator'

export const postEventValidator = [
    body('source', 'Invalid source field')
        .isString()
        .isLength({min:1, max: 8})
        .withMessage('source has to be between 1 and 8 characters long'),

    body('id')
        .isString()
        .withMessage("id must be a string")
        .isLength({min: 64, max: 64})
        .withMessage("id length must be 64 characters"),
    
    body('type', 'Invalid type field')
        .isString()
        .matches(/^[a-z]+\.[a-z]+$/)
        .withMessage('Invalid type structure. Refer to guide'),

    body('timestamp', 'Invalid timestamp field')
        .optional()
        .isISO8601()
        .withMessage('Invalid timestamp format. Should be ISO8601'),

    body('data', 'Invalid data field')
        .isObject()
        .withMessage('Invalid data field. Should to be a JSON object')
]

export const getEventByIdValidator = [
    param('id', 'Invalid id field')
        .isNumeric()
]
