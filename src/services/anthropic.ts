export async function generateMindsetReflection(
  gratitude1: string,
  gratitude2: string,
  gratitude3: string,
  greatDay: string,
  affirmation: string,
): Promise<string> {
  // Mock response — will be replaced with live Anthropic API call in a later step
  await new Promise(resolve => setTimeout(resolve, 2200))

  return `The way you're holding "${gratitude1}" close this morning reveals something important about you. You notice what others might overlook. Your gratitude for "${gratitude2}" speaks to the relationships that sustain you, and recognising "${gratitude3}" shows a quiet wisdom that sees value in the unconsidered.

What would make today great, "${greatDay}", is a clear north star. Hold it lightly but don't lose sight of it.

And remember: ${affirmation}. Carry that into the day.`
}
