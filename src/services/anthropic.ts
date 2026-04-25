export async function generateMindsetReflection(
  gratitude1: string,
  gratitude2: string,
  gratitude3: string,
  intention: string,
): Promise<string> {
  // Mock response — will be replaced with live Anthropic API call in a later step
  await new Promise(resolve => setTimeout(resolve, 2200))

  return `The way you're holding "${gratitude1}" close this morning reveals something important about you — you notice what others might overlook. Your gratitude for "${gratitude2}" speaks to the relationships that sustain you, and recognising "${gratitude3}" shows a quiet wisdom that sees value in the unconsidered.

Now carry these three threads into your day. Your intention — to ${intention} — is already strengthened by this foundation. You are not starting from zero. You are building from abundance.

Go be the version of yourself you just described.`
}
