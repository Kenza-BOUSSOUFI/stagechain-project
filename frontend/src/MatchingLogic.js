// src/MatchingLogic.js
export const calculateMatch = (studentSkills, offerSkills) => {
    const matched = studentSkills.filter(skill => offerSkills.includes(skill));
    const score = (matched.length / offerSkills.length) * 100;
    return Math.round(score);
};

export const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
    if (score >= 50) return "text-orange-400 border-orange-500/20 bg-orange-500/10";
    return "text-red-400 border-red-500/20 bg-red-500/10";
};