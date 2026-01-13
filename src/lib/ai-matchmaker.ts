import { Campaign, KOL } from "./static-data";

export interface MatchResult {
    kol: KOL;
    score: number;
    reasons: string[];
}

/**
 * Calculates a match score (0-100) for a KOL based on the Campaign criteria.
 */
export function calculateMatchScore(kol: KOL, campaign: Campaign): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Category Match (40 pts)
    // We treat 'General' as a wildcard but with less weight
    if (kol.category === "General") {
        score += 20;
        reasons.push("General category overlap");
    } else {
        // Simple string inclusion check for now (can be improved with fuzzy matching)
        // Ideally, Campaign should have a 'category' field, but we might infer it from name/objective or just assume user wants general suggestions
        // For this MVP, we'll assume the user might have categorized the campaign or we just give points for high-quality tiers

        // Wait, Campaign interface doesn't have 'category'. 
        // Let's assume we want to match based on the Campaign Name keywords if possible, 
        // OR we just skip category matching if campaign has no category.
        // Actually, looking at the data, let's infer category from Campaign Name or assume all valid.

        // Let's rely on Objective + Platform mainly if Category is missing.
        // But if we want meaningful "Smart" matching, we should look at data.

        // Revised Strategy:
        // Score heavily on Performance Metrics relative to Objective.
        score += 20; // Base score for valid KOL
    }

    // 2. Platform Match (20 pts)
    const campaignPlatform = campaign.platform || 'TikTok';
    let platformMatch = false;

    if (campaignPlatform === 'TikTok' && kol.tiktokUsername) {
        score += 20;
        platformMatch = true;
        reasons.push("Active on TikTok");
    } else if (campaignPlatform === 'Instagram' && kol.instagramUsername) {
        score += 20;
        platformMatch = true;
        reasons.push("Active on Instagram");
    }

    // 3. Objective Match (40 pts)
    const objective = campaign.objective || 'AWARENESS';

    if (objective === 'AWARENESS') {
        // Prioritize Followers & Views
        if (kol.followers > 1000000) {
            score += 40;
            reasons.push("Mega Influencer (High Reach)");
        } else if (kol.followers > 500000) {
            score += 30;
            reasons.push("Macro Influencer (Good Reach)");
        } else if (kol.followers > 100000) {
            score += 20;
        } else {
            score += 10;
        }
    } else {
        // CONVERSION - Prioritize ER (Engagement Rate) - Need to calc ER
        // Estimate ER from avgViews (this is rough, but we need data)
        // Let's use avgViews as a proxy for "active audience"
        if (kol.avgViews > 500000) {
            score += 40;
            reasons.push("High Average Views (Conversion Potential)");
        } else if (kol.avgViews > 100000) {
            score += 25;
        } else {
            score += 10;
        }
    }

    // 4. Budget Fit (Bonus/Penalty)
    // We assume rate card exists.
    const rate = campaignPlatform === 'Instagram' ? kol.rateCardReels : kol.rateCardTiktok;
    if (rate) {
        if (rate <= (campaign.budget * 0.2)) {
            // Affordable (takes < 20% of budget)
            score += 10;
            reasons.push("Good Budget Fit");
        } else if (rate > campaign.budget) {
            // Too expensive
            score -= 50;
            reasons.push("Exceeds Campaign Budget");
        }
    }

    return {
        kol,
        score: Math.min(Math.max(score, 0), 100), // Clamp 0-100
        reasons
    };
}

export function getSmartRecommendations(kols: KOL[], campaign: Campaign): MatchResult[] {
    return kols
        .map(kol => calculateMatchScore(kol, campaign))
        .filter(res => res.score > 0)
        .sort((a, b) => b.score - a.score);
}
