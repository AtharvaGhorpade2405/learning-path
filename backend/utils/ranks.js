const RANKS = {
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

function getLevelForXP(xp) {
  let highestLevel = 1;
  const levels = Object.keys(RANKS).map(Number).sort((a, b) => a - b);
  for (const level of levels) {
    if (xp >= RANKS[level].minXp) {
      highestLevel = level;
    }
  }
  return highestLevel;
}

function processXP(user, amount) {
  user.totalXP = (user.totalXP || 0) + amount;
  const newLevel = getLevelForXP(user.totalXP);
  
  let levelUp = false;
  let newRankName = null;
  
  if (newLevel > (user.currentLevel || 1)) {
    user.currentLevel = newLevel;
    levelUp = true;
    newRankName = RANKS[newLevel].name;
  }
  
  return { levelUp, newRankName };
}

module.exports = { RANKS, getLevelForXP, processXP };
