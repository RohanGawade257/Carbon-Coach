import { describe, it, expect } from "vitest";
import { computeCarbonScore, gradeForScore, levelForScore } from "./carbonScore";

describe("Carbon Score Calculations", () => {
  it("should return base score of 300 with zero inputs", () => {
    const score = computeCarbonScore({
      completedActionItems: 0,
      completedChallenges: 0,
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(score).toBe(300);
  });

  it("should clamp maximum score to 1000", () => {
    const score = computeCarbonScore({
      completedActionItems: 50, // 50 * 35 = 1750 (cap 250)
      completedChallenges: 10,   // 10 * 90 = 900 (cap 180)
      earnedBadges: 10,          // 10 * 45 = 450 (cap 180)
      completedRecommendations: 10, // 10 * 70 = 700 (cap 140)
      baseline: 1000,
      currentTotal: 100,         // reduction 900/1000 * 250 = 225
      missionCompleted: true,    // 25
    });
    // 300 + 250 + 180 + 180 + 140 + 225 + 25 = 1300 -> clamp 1000
    expect(score).toBe(1000);
  });

  it("should increase score correctly as progression happens", () => {
    const scoreBase = computeCarbonScore({
      completedActionItems: 0,
      completedChallenges: 0,
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreBase).toBe(300);

    const scoreActions = computeCarbonScore({
      completedActionItems: 1,
      completedChallenges: 0,
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreActions).toBe(335); // +35

    const scoreChallenges = computeCarbonScore({
      completedActionItems: 1,
      completedChallenges: 1,
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreChallenges).toBe(425); // +90

    const scoreBadges = computeCarbonScore({
      completedActionItems: 1,
      completedChallenges: 1,
      earnedBadges: 1,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreBadges).toBe(470); // +45

    const scoreRecs = computeCarbonScore({
      completedActionItems: 1,
      completedChallenges: 1,
      earnedBadges: 1,
      completedRecommendations: 1,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreRecs).toBe(540); // +70
  });

  it("should reward carbon reduction relative to baseline", () => {
    const score = computeCarbonScore({
      completedActionItems: 0,
      completedChallenges: 0,
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 1000,
      currentTotal: 500, // 50% reduction = 125 points
      missionCompleted: false,
    });
    expect(score).toBe(425); // 300 + 125
  });

  it("should enforce individual sub-component caps", () => {
    // Action items cap: 250 (reached at 8 items)
    const scoreActionsCap = computeCarbonScore({
      completedActionItems: 10, // 10 * 35 = 350 -> capped at 250
      completedChallenges: 0,
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreActionsCap).toBe(550); // 300 + 250

    // Challenges cap: 180 (reached at 2 challenges)
    const scoreChallengesCap = computeCarbonScore({
      completedActionItems: 0,
      completedChallenges: 3, // 3 * 90 = 270 -> capped at 180
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreChallengesCap).toBe(480); // 300 + 180

    // Badges cap: 180 (reached at 4 badges)
    const scoreBadgesCap = computeCarbonScore({
      completedActionItems: 0,
      completedChallenges: 0,
      earnedBadges: 5, // 5 * 45 = 225 -> capped at 180
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreBadgesCap).toBe(480); // 300 + 180

    // Recommendations cap: 140 (reached at 2 recommendations)
    const scoreRecsCap = computeCarbonScore({
      completedActionItems: 0,
      completedChallenges: 0,
      earnedBadges: 0,
      completedRecommendations: 3, // 3 * 70 = 210 -> capped at 140
      baseline: 0,
      currentTotal: 0,
      missionCompleted: false,
    });
    expect(scoreRecsCap).toBe(440); // 300 + 140
  });

  it("should handle stability boundary scenarios like missing, zero, or negative inputs safely", () => {
    // Zero or missing-like values (all zero)
    const zeroScore = computeCarbonScore({
      completedActionItems: 0,
      completedChallenges: 0,
      earnedBadges: 0,
      completedRecommendations: 0,
      baseline: 0,
      currentTotal: 100, // Should not crash when baseline is 0
      missionCompleted: false,
    });
    expect(zeroScore).toBe(300);

    // Negative counts (clamped appropriately by Math.max/min or base clamp)
    const negativeScore = computeCarbonScore({
      completedActionItems: -5,
      completedChallenges: -2,
      earnedBadges: -10,
      completedRecommendations: -1,
      baseline: -100,
      currentTotal: 200,
      missionCompleted: false,
    });
    // Negative inputs would multiply to negative values, but the total score is clamped to [0, 1000]
    expect(negativeScore).toBeGreaterThanOrEqual(0);
    expect(negativeScore).toBeLessThanOrEqual(1000);
  });

  it("should assign correct grades based on score boundaries", () => {
    expect(gradeForScore(950)).toBe("A+");
    expect(gradeForScore(820)).toBe("A");
    expect(gradeForScore(720)).toBe("B+");
    expect(gradeForScore(650)).toBe("B");
    expect(gradeForScore(520)).toBe("C");
    expect(gradeForScore(450)).toBe("D");
  });

  it("should assign correct level metrics", () => {
    expect(levelForScore(900).level).toBe("Level 5 - Climate Champion");
    expect(levelForScore(750).level).toBe("Level 4 - Sustainability Advocate");
    expect(levelForScore(620).level).toBe("Level 3 - Eco Explorer");
    expect(levelForScore(550).level).toBe("Level 2 - Conscious Consumer");
    expect(levelForScore(400).level).toBe("Level 1 - Beginner");
  });
});
