import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type RequestSchema = z.ZodType<{
  body?: unknown;
  params?: unknown;
  query?: unknown;
}>;

export function validate(schema: RequestSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.params !== undefined) req.params = parsed.params as Record<string, string>;
    if (parsed.query !== undefined) req.query = parsed.query as Record<string, string>;
    next();
  };
}

