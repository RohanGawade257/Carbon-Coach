import { Router } from "express";
import { validate } from "../../middleware/validateMiddleware";
import { emissionsController } from "./emissions.controller";
import { calculateEmissionSchema } from "./emissions.schemas";

export const emissionsRoutes = Router();

emissionsRoutes.get("/categories", emissionsController.listCategories);
emissionsRoutes.post("/calculate", validate(calculateEmissionSchema), emissionsController.calculate);

