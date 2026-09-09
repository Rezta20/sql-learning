export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function shuffleChoices<T extends { choices: string[]; answerIndex: number }>(
  question: T,
): T {
  const indices = shuffle(question.choices.map((_, i) => i))
  return {
    ...question,
    choices: indices.map((i) => question.choices[i]),
    answerIndex: indices.indexOf(question.answerIndex),
  }
}
