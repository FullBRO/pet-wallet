import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import type { ValidationError } from "express-validator";


export function validate(req: Request, res: Response, next: NextFunction) {
    console.log(req.body)
    const result = validationResult(req)
    if (result.isEmpty()) return next()
    try{
        const errors = result.array({ onlyFirstError: true })
        
        const invalidValues = errors
            .flatMap(errorPaths) 

        return res.status(400).json({ errors: { invalidValues, all: errors } })
    }catch(error){
        console.error(error)
        return res.status(500).json({message: "Internal validation error"})
    }
}


function errorPaths(err: ValidationError): string[] {
  switch (err.type) {
    case "field":
      return [err.path];

    case "alternative":
      return err.nestedErrors.flatMap(e => e.path ? [e.path] : []);

    case "alternative_grouped":
      return err.nestedErrors.flat().flatMap(e => e.path ? [e.path] : []);

    case "unknown_fields":
      return err.fields.map(f => f.path);

    default:
      return [];
  }
}

