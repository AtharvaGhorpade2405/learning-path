export const RANKS = {
  1: { name: 'Novice', minXp: 0 },
  2: { name: 'Apprentice', minXp: 100 },
  3: { name: 'Explorer', minXp: 300 },
  4: { name: 'Adept', minXp: 600 },
  5: { name: 'Artisan', minXp: 1000 },
  6: { name: 'Trailblazer', minXp: 1500 },
  7: { name: 'Master', minXp: 2500 },
  8: { name: 'Grandmaster', minXp: 4000 },
  9: { name: 'Luminary', minXp: 6500 },
  10: { name: 'Apex', minXp: 10000 },
};

export function getRankInfo(totalXP) {
  let highestLevel = 1;
  const levels = Object.keys(RANKS).map(Number).sort((a, b) => a - b);
  
  for (const level of levels) {
    if (totalXP >= RANKS[level].minXp) {
      highestLevel = level;
    }
  }

  const currentRank = RANKS[highestLevel];
  const nextLevel = highestLevel < 10 ? highestLevel + 1 : 10;
  const nextRank = highestLevel < 10 ? RANKS[nextLevel] : null;

  return {
    level: highestLevel,
    name: currentRank.name,
    minXp: currentRank.minXp,
    nextRankName: nextRank?.name || null,
    nextRankMinXp: nextRank?.minXp || null,
  };
}
