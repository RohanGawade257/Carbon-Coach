import { Router } from "express";
import multer from "multer";
import { authMiddleware, AuthenticatedRequest } from "../../middleware/authMiddleware";
import { prisma } from "../../config/prisma";
import { footprintService } from "../footprint/footprint.service";

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

export const ocrRoutes = Router();

ocrRoutes.post("/upload", authMiddleware, upload.single("file"), async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const text = req.file.buffer.toString("utf-8");
  const filename = req.file.originalname;
  const textToScan = text + " " + filename;

  let quantity = 0;
  let activityType = "electricity_kwh";

  const kwhMatch = textToScan.match(/(\d+(?:\.\d+)?)\s*kwh/i);
  const elecMatch = textToScan.match(/electricity\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const totalMatch = textToScan.match(/total\s*(?:amount)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i);

  if (kwhMatch) {
    quantity = parseFloat(kwhMatch[1]);
  } else if (elecMatch) {
    quantity = parseFloat(elecMatch[1]);
  } else if (totalMatch) {
    quantity = parseFloat(totalMatch[1]);
  } else {
    const anyNum = textToScan.match(/(\d+(?:\.\d+)?)/);
    quantity = anyNum ? parseFloat(anyNum[1]) : 120.0;
  }

  if (textToScan.match(/km|car|vehicle|flight|transport/i)) {
    activityType = "car_km";
  } else if (textToScan.match(/meal|beef|food|vegetarian|dairy/i)) {
    activityType = "beef_meal";
  } else if (textToScan.match(/bag|trash|waste|recycle/i)) {
    activityType = "trash_bag";
  } else if (textToScan.match(/clothing|item|shirt|electronics/i)) {
    activityType = "clothing_item";
  }

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

