import {body, param, query} from 'express-validator'

export const postEventValidator = [
    body('provider', 'Invalid provider field')
        .isString()
        .isLength({min:1, max: 8})
        .withMessage('provider has to be between 1 and 8 characters long'),
    
    body('id', 'Invalid id field')
        .isString()
        .isLength({min: 1, max: 32})
        .withMessage('id has to be between 1 and 32 characters long'),

    body('type', 'Invalid type field')
        .isString()
        .matches(/^[a-z]+\.[a-z]+$/)
        .withMessage('Invalid type structure. Refer to guide'),

    body('timestamp', 'Invalid timestamp field')
        .optional()
        .isISO8601()
        .withMessage('Invalid timestamp format. Should be ISO8601'),

    body('data', 'Invalid data field')
        .optional()
        .isObject()
        .withMessage('Invalid data field. Should to be a JSON object')
]

export const getEventByIdValidator = [
    param('id', 'Invalid id field')
        .isNumeric()
]
