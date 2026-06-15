import { Router } from "express";
import multer from "multer";
import { authMiddleware, AuthenticatedRequest } from "../../middleware/authMiddleware";
import { prisma } from "../../config/prisma";
import { footprintService } from "../footprint/footprint.service";
import { ocrService } from "./ocr.service";
import { ocrRateLimit } from "../../middleware/rateLimitMiddleware";

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

export const ocrRoutes = Router();

ocrRoutes.post("/upload", authMiddleware, ocrRateLimit, upload.single("file"), async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const text = req.file.buffer.toString("utf-8");
  const filename = req.file.originalname;
  const textToScan = text + " " + filename;

  const quantity = ocrService.extractQuantity(textToScan);
  const activityType = ocrService.detectActivityType(textToScan);

  const factor = await prisma.emissionFactor.findFirst({
    where: { activityType },
    include: { category: true }
  });

  if (!factor) {
    return res.status(500).json({ error: "Emission factor not configured" });
  }

  const entry = await footprintService.createEntry(req.user.id, {
    categoryId: factor.categoryId,
    activityType: factor.activityType,
    quantity,
    occurredAt: new Date(),
    notes: `OCR Extracted from bill (${filename}): ${quantity} ${factor.unit} of ${factor.category.name}`
  });

  await prisma.user.update({
    where: { id: req.user.id },
    data: { points: { increment: 25 } }
  });

  res.status(201).json({
    success: true,
    entry,
    quantity,
    category: factor.category.name,
    activityType: factor.activityType
  });
});

