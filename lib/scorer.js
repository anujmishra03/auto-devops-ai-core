export function computeHealthScore(repo) {
  let score = 0;

  // ⭐ Stars means popularity/quality
  if (repo.stars > 50) score += 20;
  if (repo.stars > 200) score += 30;

  // 🧹 If issues too many → bad
  if (repo.open_issues < 10) score += 20;
  else if (repo.open_issues < 30) score += 10;

  // 🌍 Visibility clean & active
  if (repo.visibility === "public") score += 10;  

  // ⏳ Recently pushed
  const last = new Date(repo.last_push);
  const diffDays = (Date.now() - last) / (1000*60*60*24);
  if (diffDays < 7) score += 20;
  else if (diffDays < 30) score += 10;

  return Math.min(score,100);
}
