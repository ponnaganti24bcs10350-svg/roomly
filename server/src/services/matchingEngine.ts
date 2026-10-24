export interface RoommateProfileData {
  userId?: string;
  budgetMin: number;
  budgetMax: number;
  preferredCity?: string;
  preferredLocations?: string | null;
  sleepSchedule: string;
  foodPreference: string;
  cleanliness: number;
  smoking: string;
  pets: string;
  socialLevel: number;
  guests: string;
  noiseTolerance: number;
  bio?: string | null;
}

export interface CompatibilityReason {
  type: 'positive' | 'warning' | 'info';
  category: 'budget' | 'location' | 'lifestyle' | 'habits';
  text: string;
}

export interface CompatibilityResult {
  overallScore: number;
  breakdown: {
    budget: number;
    location: number;
    lifestyle: number;
    habits: number;
  };
  reasons: CompatibilityReason[];
}

export function calculateCompatibility(
  p1: RoommateProfileData,
  p2: RoommateProfileData
): CompatibilityResult {
  const reasons: CompatibilityReason[] = [];

  let budgetScore = 0;
  const overlapMin = Math.max(p1.budgetMin, p2.budgetMin);
  const overlapMax = Math.min(p1.budgetMax, p2.budgetMax);

  if (overlapMin <= overlapMax) {
    const overlapRange = overlapMax - overlapMin;
    const p1Range = p1.budgetMax - p1.budgetMin || 1;
    const ratio = Math.min(1, overlapRange / (p1Range * 0.8));
    budgetScore = Math.round(20 + ratio * 5);
    reasons.push({
      type: 'positive',
      category: 'budget',
      text: `Strong budget overlap (₹${overlapMin.toLocaleString()} – ₹${overlapMax.toLocaleString()})`
    });
  } else {
    const gap = overlapMin - overlapMax;
    if (gap < 3000) {
      budgetScore = 14;
      reasons.push({
        type: 'warning',
        category: 'budget',
        text: `Slight budget difference (~₹${gap.toLocaleString()} variance)`
      });
    } else {
      budgetScore = 6;
      reasons.push({
        type: 'warning',
        category: 'budget',
        text: `Noticeable budget gap: ₹${p1.budgetMin}-₹${p1.budgetMax} vs ₹${p2.budgetMin}-₹${p2.budgetMax}`
      });
    }
  }

  let locationScore = 0;
  const city1 = (p1.preferredCity || '').trim().toLowerCase();
  const city2 = (p2.preferredCity || '').trim().toLowerCase();

  if (city1 && city2 && city1 === city2) {
    locationScore = 18;
    const locs1 = (p1.preferredLocations || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const locs2 = (p2.preferredLocations || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    const sharedLocs = locs1.filter(loc => locs2.some(l2 => l2.includes(loc) || loc.includes(l2)));
    if (sharedLocs.length > 0) {
      locationScore = 25;
      reasons.push({
        type: 'positive',
        category: 'location',
        text: `Targeting identical neighborhoods: ${sharedLocs.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`
      });
    } else {
      locationScore = 20;
      reasons.push({
        type: 'positive',
        category: 'location',
        text: `Both looking for accommodations in ${p1.preferredCity}`
      });
    }
  } else {
    locationScore = 5;
    reasons.push({
      type: 'warning',
      category: 'location',
      text: `Different preferred cities (${p1.preferredCity || 'N/A'} vs ${p2.preferredCity || 'N/A'})`
    });
  }

  let lifestylePts = 0;

  if (p1.sleepSchedule === p2.sleepSchedule) {
    lifestylePts += 10;
    const scheduleLabel = p1.sleepSchedule === 'NIGHT_OWL' ? 'Night Owl' : p1.sleepSchedule === 'EARLY_BIRD' ? 'Early Bird' : 'Flexible';
    reasons.push({
      type: 'positive',
      category: 'lifestyle',
      text: `Synchronized sleep rhythm (${scheduleLabel})`
    });
  } else if (p1.sleepSchedule === 'FLEXIBLE' || p2.sleepSchedule === 'FLEXIBLE') {
    lifestylePts += 7;
    reasons.push({
      type: 'positive',
      category: 'lifestyle',
      text: `Adaptable sleep routines`
    });
  } else {
    lifestylePts += 3;
    reasons.push({
      type: 'warning',
      category: 'lifestyle',
      text: `Different sleep patterns (Early Bird vs Night Owl)`
    });
  }

  const cleanDiff = Math.abs(p1.cleanliness - p2.cleanliness);
  if (cleanDiff <= 1) {
    lifestylePts += 8;
    reasons.push({
      type: 'positive',
      category: 'lifestyle',
      text: `Matching cleanliness standards (${p1.cleanliness}/5 & ${p2.cleanliness}/5)`
    });
  } else if (cleanDiff === 2) {
    lifestylePts += 5;
  } else {
    lifestylePts += 2;
    reasons.push({
      type: 'warning',
      category: 'lifestyle',
      text: `Divergent tidiness habits (${p1.cleanliness}/5 vs ${p2.cleanliness}/5)`
    });
  }

  const socialDiff = Math.abs(p1.socialLevel - p2.socialLevel);
  if (socialDiff <= 1 && p1.guests === p2.guests) {
    lifestylePts += 6;
    reasons.push({
      type: 'positive',
      category: 'lifestyle',
      text: `Complementary social energy & guest hospitality`
    });
  } else if (socialDiff <= 2) {
    lifestylePts += 4;
  } else {
    lifestylePts += 2;
    reasons.push({
      type: 'warning',
      category: 'lifestyle',
      text: `Different preferences on hosting guests`
    });
  }

  const noiseDiff = Math.abs(p1.noiseTolerance - p2.noiseTolerance);
  if (noiseDiff <= 1) {
    lifestylePts += 6;
  } else {
    lifestylePts += 3;
  }

  const lifestyleScore = Math.min(30, Math.round(lifestylePts));

  let habitsPts = 0;

  if (p1.smoking === 'NON_SMOKER' && p2.smoking === 'NON_SMOKER') {
    habitsPts += 8;
    reasons.push({
      type: 'positive',
      category: 'habits',
      text: `Both non-smokers (smoke-free flat)`
    });
  } else if (p1.smoking === p2.smoking) {
    habitsPts += 7;
    reasons.push({
      type: 'positive',
      category: 'habits',
      text: `Aligned smoking comfort level`
    });
  } else if (p1.smoking === 'OUTSIDE_ONLY' || p2.smoking === 'OUTSIDE_ONLY') {
    habitsPts += 4;
  } else {
    habitsPts += 1;
    reasons.push({
      type: 'warning',
      category: 'habits',
      text: `Different smoking expectations`
    });
  }

  if (
    (p1.pets === 'HAS_PETS' && (p2.pets === 'HAS_PETS' || p2.pets === 'LOVES_PETS')) ||
    (p2.pets === 'HAS_PETS' && (p1.pets === 'HAS_PETS' || p1.pets === 'LOVES_PETS')) ||
    (p1.pets === 'LOVES_PETS' && p2.pets === 'LOVES_PETS')
  ) {
    habitsPts += 6;
    reasons.push({
      type: 'positive',
      category: 'habits',
      text: `Mutual love and comfort with pets`
    });
  } else if (p1.pets === 'NO_PETS' && p2.pets === 'NO_PETS') {
    habitsPts += 6;
    reasons.push({
      type: 'positive',
      category: 'habits',
      text: `Both prefer a pet-free living space`
    });
  } else if (p1.pets === 'NO_PETS' || p2.pets === 'NO_PETS') {
    habitsPts += 1;
    reasons.push({
      type: 'warning',
      category: 'habits',
      text: `Pet preference divergence`
    });
  } else {
    habitsPts += 4;
  }

  if (p1.foodPreference === p2.foodPreference) {
    habitsPts += 6;
    reasons.push({
      type: 'positive',
      category: 'habits',
      text: `Common dietary preferences (${p1.foodPreference.toLowerCase()})`
    });
  } else if (p1.foodPreference === 'FLEXIBLE' || p2.foodPreference === 'FLEXIBLE') {
    habitsPts += 5;
  } else {
    habitsPts += 3;
    reasons.push({
      type: 'info',
      category: 'habits',
      text: `Individual dietary habits (${p1.foodPreference.toLowerCase()} & ${p2.foodPreference.toLowerCase()})`
    });
  }

  const habitsScore = Math.min(20, Math.round(habitsPts));
  const overallScore = Math.min(100, Math.max(10, budgetScore + locationScore + lifestyleScore + habitsScore));

  return {
    overallScore,
    breakdown: {
      budget: budgetScore,
      location: locationScore,
      lifestyle: lifestyleScore,
      habits: habitsScore
    },
    reasons
  };
}
