import Anthropic from '@anthropic-ai/sdk';

export function getAnthropicClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

interface PromptInput {
  caption: string;
  averageRating: number;
  ratingCount: number;
  ratings: number[];
  comments: string[];
  tags: string[];
}

export function buildOutfitPrompt(input: PromptInput): string {
  const commentBlock =
    input.comments.length > 0
      ? input.comments.map((c, i) => `  ${i + 1}. "${c}"`).join('\n')
      : '  (No comments yet)';

  const tagBlock =
    input.tags.length > 0 ? input.tags.join(', ') : 'none specified';

  return `You are a professional fashion stylist and personal shopper giving constructive, encouraging feedback on a clothing outfit based on community ratings and text reviews.

OUTFIT INFORMATION:
- Caption: "${input.caption || 'No caption provided'}"
- Style tags: ${tagBlock}
- Community rating: ${input.averageRating.toFixed(1)}/5.0 stars (${input.ratingCount} rating${input.ratingCount !== 1 ? 's' : ''})
- Individual ratings received: [${input.ratings.join(', ')}]

COMMUNITY FEEDBACK (most recent comments):
${commentBlock}

Based on this community feedback, please provide:

## What's Working
Highlight 2-3 specific strengths suggested by the rating and comment feedback.

## Suggestions for Improvement
Give 2-3 actionable, specific style suggestions based on the feedback patterns.

## Styling Tips
Recommend 1-2 complementary items, accessories, or occasions this style works best for.

## Encouragement
A brief motivating closing statement.

Keep your response concise (under 300 words), positive in tone, and specific. You cannot see the photo — base your advice entirely on the numerical ratings and text feedback provided above.`;
}
