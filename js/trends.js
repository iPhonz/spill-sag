const STOP_WORDS = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their']);

const NAMED_ENTITY_PATTERNS = [
  /[A-Z][a-z]+ [A-Z][a-z]+/g, // Full names
  /[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+/g, // Full names with middle name
  /[A-Z][A-Z]+/g, // Acronyms
  /(?:[A-Z][a-z]+ )?[A-Z][a-z]+'s/g, // Possessives
  /[A-Z][a-z]+ (?:Series|Show|Movie|Film|Award|Games?)/g, // Media titles
  /'[^']+'/g, // Quoted phrases
  /"[^"]+"/g, // Double quoted phrases
];

function findNamedEntities(text) {
  const entities = new Set();
  
  NAMED_ENTITY_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => entities.add(match));
  });

  return Array.from(entities);
}

export function extractTrends(articles) {
  const phraseCount = new Map();
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);

  articles.forEach(article => {
    if (new Date(article.date) >= cutoff) {
      const text = `${article.title} ${article.description || ''}`;
      const entities = findNamedEntities(text);
      
      entities.forEach(entity => {
        if (entity.length > 3 && !STOP_WORDS.has(entity.toLowerCase())) {
          phraseCount.set(entity, (phraseCount.get(entity) || 0) + 1);
        }
      });
    }
  });

  return Array.from(phraseCount.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}