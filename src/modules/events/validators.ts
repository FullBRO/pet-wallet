import {body} from 'express-validator'

export const postEventValidator = [
    body('provider')
        .isString()
        .isLength({min:1, max: 8}),
    
    body('id')
        .isString()
        .isLength({min: 1, max: 32}),

    body('type')
        .isString()
        .matches(/^[a-z]+\.[a-z]+$/),

    body('timestamp')
        .optional()
        .isISO8601(),

    body('data')
        .optional()
        .isObject()
]

