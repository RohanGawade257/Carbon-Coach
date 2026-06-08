import { Request, Response } from "express";
import { demoService } from "./demo.service";

export const demoController = {
  async login(_req: Request, res: Response) {
    const result = await demoService.login();
    res.json(result);
  }
};

