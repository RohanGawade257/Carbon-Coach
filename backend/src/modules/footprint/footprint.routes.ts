import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { footprintController } from "./footprint.controller";
import {
  calculateFootprintSchema,
  createFootprintEntrySchema,
  footprintEntryParamsSchema,
  listFootprintEntriesSchema
} from "./footprint.schemas";

export const footprintRoutes = Router();

footprintRoutes.post("/calculate", authMiddleware, validate(calculateFootprintSchema), footprintController.calculate);
footprintRoutes.post("/entries", authMiddleware, validate(createFootprintEntrySchema), footprintController.createEntry);
footprintRoutes.get("/entries", authMiddleware, validate(listFootprintEntriesSchema), footprintController.listEntries);
footprintRoutes.delete("/entries/:id", authMiddleware, validate(footprintEntryParamsSchema), footprintController.deleteEntry);

