import type { ConversationTopic } from '../lib/types';

export const SAMPLE_TOPICS: ConversationTopic[] = [
  {
    id: '1',
    title: 'At the Restaurant',
    description: 'Practice ordering food and drinks at a traditional French bistro',
    category: 'dining',
    difficulty: 'beginner'
  },
  {
    id: '2',
    title: 'Asking for Directions',
    description: 'Learn how to ask and understand directions to various locations',
    category: 'navigation',
    difficulty: 'beginner'
  },
  {
    id: '3',
    title: 'Shopping at the Market',
    description: 'Practice buying groceries and negotiating at a local market',
    category: 'shopping',
    difficulty: 'intermediate'
  },
  {
    id: '4',
    title: 'At the Train Station',
    description: 'Learn to purchase tickets and navigate public transportation',
    category: 'travel',
    difficulty: 'intermediate'
  }
];