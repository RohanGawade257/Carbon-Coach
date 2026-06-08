import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { hashPassword } from "../../shared/utils/password";
import { signToken } from "../../shared/utils/jwt";
import { fallbackActionPlan } from "../ai/aiFallbacks";
import { badgesService } from "../badges/badges.service";
import { badgeRules } from "../badges/badgeRules";

const demoEmail = "demo@carboncoach.local";

async function ensureCategory(name: string, slug: string, description: string) {
  return prisma.emissionCategory.upsert({
    where: { slug },
    update: { name, description },
    create: { name, slug, description }
  });
}

async function ensureFactor(categoryId: string, activityType: string, unit: string, kgCo2ePerUnit: number, source: string) {
  const existing = await prisma.emissionFactor.findFirst({
    where: { categoryId, activityType, unit }
  });

  if (existing) {
    return prisma.emissionFactor.update({
      where: { id: existing.id },
      data: { kgCo2ePerUnit, source }
    });
  }

  return prisma.emissionFactor.create({
    data: { categoryId, activityType, unit, kgCo2ePerUnit, source }
  });
}

async function ensureChallenge(title: string, description: string, categoryId: string, difficulty: string, points: number, durationDays: number) {
  const existing = await prisma.challenge.findFirst({ where: { title } });
  if (existing) {
    return prisma.challenge.update({
      where: { id: existing.id },
      data: { description, categoryId, difficulty, points, durationDays }
    });
  }

  return prisma.challenge.create({
    data: { title, description, categoryId, difficulty, points, durationDays }
  });
}

async function ensureCoreData() {
  const categories = {
    transport: await ensureCategory("Transport", "transport", "Travel by car, public transport, rideshare, or flights."),
    food: await ensureCategory("Food", "food", "Meals, groceries, and dietary choices."),
    energy: await ensureCategory("Energy", "energy", "Home electricity, heating, and cooling."),
    shopping: await ensureCategory("Shopping", "shopping", "Clothing, electronics, and household purchases."),
    waste: await ensureCategory("Waste", "waste", "Trash, recycling, and single-use items.")
  };

  const factors = {
    carKm: await ensureFactor(categories.transport.id, "car_km", "km", 0.192, "EPA passenger vehicle estimate"),
    publicTransportKm: await ensureFactor(categories.transport.id, "public_transport_km", "km", 0.089, "Transit average estimate"),
    flightKm: await ensureFactor(categories.transport.id, "flight_km", "km", 0.255, "Aviation average estimate"),
    beefMeal: await ensureFactor(categories.food.id, "beef_meal", "meal", 7.0, "Food lifecycle estimate"),
    vegetarianMeal: await ensureFactor(categories.food.id, "vegetarian_meal", "meal", 1.7, "Food lifecycle estimate"),
    dairyServing: await ensureFactor(categories.food.id, "dairy_serving", "serving", 1.2, "Food lifecycle estimate"),
    electricityKwh: await ensureFactor(categories.energy.id, "electricity_kwh", "kWh", 0.42, "Grid average estimate"),
    naturalGasTherm: await ensureFactor(categories.energy.id, "natural_gas_therm", "therm", 5.3, "Fuel combustion estimate"),
    clothingItem: await ensureFactor(categories.shopping.id, "clothing_item", "item", 18.0, "Consumption estimate"),
    electronicsItem: await ensureFactor(categories.shopping.id, "electronics_item", "item", 70.0, "Consumption estimate"),
    trashBag: await ensureFactor(categories.waste.id, "trash_bag", "bag", 3.0, "Waste estimate"),
    recycledBag: await ensureFactor(categories.waste.id, "recycled_bag", "bag", 0.6, "Waste estimate")
  };

  await ensureChallenge("No Car Day", "Avoid private car travel for one day and log the avoided trip.", categories.transport.id, "Easy", 80, 1);
  await ensureChallenge("Meat Free Monday", "Choose plant-forward meals for one Monday.", categories.food.id, "Easy", 70, 1);
  await ensureChallenge("Energy Saver Week", "Reduce standby power and improve cooling/heating habits for a week.", categories.energy.id, "Medium", 140, 7);
  await ensureChallenge("Reusable Bottle Challenge", "Avoid single-use bottles for seven days.", categories.waste.id, "Easy", 100, 7);

  await prisma.badge.upsert({
    where: { ruleKey: badgeRules.ECO_STARTER },
    update: { name: "Eco Starter", description: "Completed onboarding or added the first footprint entry.", iconKey: "leaf" },
    create: { name: "Eco Starter", description: "Completed onboarding or added the first footprint entry.", iconKey: "leaf", ruleKey: badgeRules.ECO_STARTER }
  });
  await prisma.badge.upsert({
    where: { ruleKey: badgeRules.GREEN_EXPLORER },
    update: { name: "Green Explorer", description: "Joined the first eco challenge.", iconKey: "compass" },
    create: { name: "Green Explorer", description: "Joined the first eco challenge.", iconKey: "compass", ruleKey: badgeRules.GREEN_EXPLORER }
  });
  await prisma.badge.upsert({
    where: { ruleKey: badgeRules.CARBON_REDUCER },
    update: { name: "Carbon Reducer", description: "Completed a recommendation or action-plan item.", iconKey: "trending-down" },
    create: { name: "Carbon Reducer", description: "Completed a recommendation or action-plan item.", iconKey: "trending-down", ruleKey: badgeRules.CARBON_REDUCER }
  });
  await prisma.badge.upsert({
    where: { ruleKey: badgeRules.CLIMATE_CHAMPION },
    update: { name: "Climate Champion", description: "Completed multiple carbon-reducing actions.", iconKey: "award" },
    create: { name: "Climate Champion", description: "Completed multiple carbon-reducing actions.", iconKey: "award", ruleKey: badgeRules.CLIMATE_CHAMPION }
  });

  return { categories, factors };
}

function kg(quantity: number, factor: { kgCo2ePerUnit: Prisma.Decimal | number }) {
  return Math.round(quantity * Number(factor.kgCo2ePerUnit) * 100) / 100;
}

export async function ensureDemoData() {
  const { categories, factors } = await ensureCoreData();
  const passwordHash = await hashPassword("demo12345");

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { displayName: "Demo Judge" },
    create: {
      email: demoEmail,
      displayName: "Demo Judge",
      passwordHash
    }
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      country: "United States",
      householdSize: 2,
      homeType: "Apartment",
      dietType: "Mixed diet",
      transportMode: "Car and public transport",
      energySource: "Grid electricity",
      goalReason: "Cut monthly emissions with affordable everyday habits"
    },
    create: {
      userId: user.id,
      country: "United States",
      householdSize: 2,
      homeType: "Apartment",
      dietType: "Mixed diet",
      transportMode: "Car and public transport",
      energySource: "Grid electricity",
      goalReason: "Cut monthly emissions with affordable everyday habits"
    }
  });

  if ((await prisma.footprintEntry.count({ where: { userId: user.id } })) === 0) {
    const now = new Date();
    await prisma.footprintEntry.createMany({
      data: [
        {
          userId: user.id,
          categoryId: categories.transport.id,
          emissionFactorId: factors.carKm.id,
          activityType: "car_km",
          quantity: 820,
          unit: "km",
          kgCo2e: kg(820, factors.carKm),
          occurredAt: now,
          notes: "Demo monthly commute and errands"
        },
        {
          userId: user.id,
          categoryId: categories.transport.id,
          emissionFactorId: factors.publicTransportKm.id,
          activityType: "public_transport_km",
          quantity: 160,
          unit: "km",
          kgCo2e: kg(160, factors.publicTransportKm),
          occurredAt: now,
          notes: "Demo public transport"
        },
        {
          userId: user.id,
          categoryId: categories.food.id,
          emissionFactorId: factors.beefMeal.id,
          activityType: "beef_meal",
          quantity: 10,
          unit: "meal",
          kgCo2e: kg(10, factors.beefMeal),
          occurredAt: now,
          notes: "Demo meals"
        },
        {
          userId: user.id,
          categoryId: categories.energy.id,
          emissionFactorId: factors.electricityKwh.id,
          activityType: "electricity_kwh",
          quantity: 320,
          unit: "kWh",
          kgCo2e: kg(320, factors.electricityKwh),
          occurredAt: now,
          notes: "Demo apartment electricity"
        },
        {
          userId: user.id,
          categoryId: categories.shopping.id,
          emissionFactorId: factors.clothingItem.id,
          activityType: "clothing_item",
          quantity: 3,
          unit: "item",
          kgCo2e: kg(3, factors.clothingItem),
          occurredAt: now,
          notes: "Demo shopping"
        },
        {
          userId: user.id,
          categoryId: categories.waste.id,
          emissionFactorId: factors.trashBag.id,
          activityType: "trash_bag",
          quantity: 8,
          unit: "bag",
          kgCo2e: kg(8, factors.trashBag),
          occurredAt: now,
          notes: "Demo household waste"
        }
      ]
    });
  }

  const entries = await prisma.footprintEntry.findMany({ where: { userId: user.id }, include: { category: true } });
  const baseline = entries.reduce((sum, entry) => sum + Number(entry.kgCo2e), 0);
  const transportTotal = entries.filter((entry) => entry.category.slug === "transport").reduce((sum, entry) => sum + Number(entry.kgCo2e), 0);

  await prisma.carbonTwinProfile.upsert({
    where: { userId: user.id },
    update: {
      baselineKgCo2eMonthly: baseline,
      topEmissionSource: "Transport",
      biggestOpportunity: "Replace two short car trips each week with public transport or walking.",
      userGoal: "Cut monthly emissions with affordable everyday habits",
      userConstraints: "Apartment living, mixed diet, car access, limited time on weekdays",
      summary: `Transport contributes about ${Math.round((transportTotal / baseline) * 100)}% of this demo footprint, making trip planning the best first opportunity.`
    },
    create: {
      userId: user.id,
      baselineKgCo2eMonthly: baseline,
      topEmissionSource: "Transport",
      biggestOpportunity: "Replace two short car trips each week with public transport or walking.",
      userGoal: "Cut monthly emissions with affordable everyday habits",
      userConstraints: "Apartment living, mixed diet, car access, limited time on weekdays",
      summary: `Transport contributes about ${Math.round((transportTotal / baseline) * 100)}% of this demo footprint, making trip planning the best first opportunity.`
    }
  });

  if ((await prisma.carbonTwinSimulation.count({ where: { userId: user.id } })) === 0) {
    await prisma.carbonTwinSimulation.create({
      data: {
        userId: user.id,
        scenarioName: "Demo 30-Day Reduction Scenario",
        days: 30,
        projectedKgCo2e: Math.round(baseline * 0.82 * 100) / 100,
        estimatedSavingsKgCo2e: Math.round(baseline * 0.18 * 100) / 100,
        assumptions: { savingsPercent: 18, scenarioName: "Demo 30-Day Reduction Scenario" }
      }
    });
  }

  if ((await prisma.actionPlan.count({ where: { userId: user.id } })) === 0) {
    const plan = fallbackActionPlan("Transport");
    await prisma.actionPlan.create({
      data: {
        userId: user.id,
        title: plan.title,
        summary: plan.summary,
        startDate: new Date(),
        endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        status: "Active",
        items: {
          create: plan.days.map((day) => ({
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            category: day.category,
            estimatedSavingsKgCo2e: day.estimatedSavingsKgCo2e,
            difficulty: day.difficulty,
            status: day.dayNumber <= 5 ? "Completed" : "Pending"
          }))
        }
      }
    });
  }

  if ((await prisma.recommendation.count({ where: { userId: user.id } })) === 0) {
    await prisma.recommendation.createMany({
      data: [
        {
          userId: user.id,
          categoryId: categories.transport.id,
          title: "Use Public Transport Twice Weekly",
          description: "Swap two short car trips each week for transit or walking. Actions: choose two repeatable trips; log avoided car distance.",
          estimatedSavingsKgCo2e: 42,
          difficulty: "Easy",
          status: "Accepted",
          source: "AI"
        },
        {
          userId: user.id,
          categoryId: categories.food.id,
          title: "Try Two Plant-Forward Dinners",
          description: "Replace two high-impact meals with vegetarian options. Actions: plan meals before shopping; track meal swaps.",
          estimatedSavingsKgCo2e: 28,
          difficulty: "Easy",
          status: "New",
          source: "AI"
        },
        {
          userId: user.id,
          categoryId: categories.energy.id,
          title: "Reduce Standby Energy",
          description: "Turn off standby devices overnight and tune cooling settings. Actions: unplug chargers; use efficient thermostat habits.",
          estimatedSavingsKgCo2e: 24,
          difficulty: "Medium",
          status: "Completed",
          source: "AI"
        }
      ]
    });
  }

  const noCarDay = await prisma.challenge.findFirst({ where: { title: "No Car Day" } });
  const energySaver = await prisma.challenge.findFirst({ where: { title: "Energy Saver Week" } });
  if (noCarDay) {
    await prisma.userChallenge.upsert({
      where: { userId_challengeId: { userId: user.id, challengeId: noCarDay.id } },
      update: { status: "Completed", progressValue: 100, completedAt: new Date() },
      create: { userId: user.id, challengeId: noCarDay.id, status: "Completed", progressValue: 100, completedAt: new Date() }
    });
  }
  if (energySaver) {
    await prisma.userChallenge.upsert({
      where: { userId_challengeId: { userId: user.id, challengeId: energySaver.id } },
      update: { status: "Joined", progressValue: 45 },
      create: { userId: user.id, challengeId: energySaver.id, status: "Joined", progressValue: 45 }
    });
  }

  if ((await prisma.aiConversation.count({ where: { userId: user.id } })) === 0) {
    await prisma.aiConversation.create({
      data: {
        userId: user.id,
        title: "Demo Sustainability Coaching",
        messages: {
          create: [
            { role: "user", content: "What should I reduce first?", model: "seed" },
            { role: "assistant", content: "Start with transport. It is your largest category, and replacing two short car trips weekly can make a visible monthly difference.", model: "seed" },
            { role: "user", content: "Can I do that without spending money?", model: "seed" },
            { role: "assistant", content: "Yes. Combine errands, walk short trips, and use existing public transport for repeatable routes before buying anything new.", model: "seed" },
            { role: "assistant", content: "Your next best action is completing the No Car Day challenge and logging the avoided distance.", model: "seed" }
          ]
        }
      }
    });
  }

  await badgesService.evaluateForUser(user.id);
  return user;
}

export const demoService = {
  async login() {
    const user = await ensureDemoData();
    const token = signToken({ userId: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        hasProfile: true,
        isDemo: true
      },
      token,
      isDemo: true
    };
  }
};

