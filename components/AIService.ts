// AI Service for generating roasts and managing API calls
// This would integrate with OpenAI GPT, ElevenLabs, and other AI services

export interface RoastRequest {
  content: string;
  tag: string;
  userId?: string;
}

export interface RoastResponse {
  roast: string;
  hasVoice?: boolean;
  voiceUrl?: string;
  mood?: 'savage' | 'playful' | 'brutal' | 'gentle';
}

export interface VoiceOptions {
  voiceId?: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
}

class AIService {
  private openAIKey: string = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  private elevenLabsKey: string = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
  private tavusKey: string = process.env.EXPO_PUBLIC_TAVUS_API_KEY || '';

  constructor() {
    // Initialize service
  }

  async generateRoast(request: RoastRequest): Promise<RoastResponse> {
    try {
      // In production, this would call OpenAI API
      const roastPrompts = {
        '#Ghosted': [
          "Bestie said 'plot twist' but it was just the end credits 💀",
          "They really chose violence and you chose delusion ✨",
          "That's not a red flag, that's the whole Soviet Union 🚩",
        ],
        '#DryReply': [
          "'K' is not a conversation, it's an assassination 💀",
          "They replied with the energy of stale bread 🍞",
          "Sir this is emotional damage, not a Wendy's 💀",
        ],
        '#CringeText': [
          "The secondhand embarrassment is sending me 😭",
          "You really thought you were in a rom-com but ended up in a horror movie 🎬",
          "Main character energy but side character treatment 😭",
        ],
        '#Rejected': [
          "They said no so fast, it broke the sound barrier 💨",
          "Rejection speedrun any% world record 🏃‍♀️",
          "You shot your shot and they called security 🔒",
        ],
        '#Awkward': [
          "The cringe is so strong, it has its own gravitational pull 🌍",
          "Awkward level: making eye contact with yourself in the mirror 👁️",
          "That was so awkward, even your FBI agent closed the laptop 💻",
        ],
      };

      const tagRoasts = roastPrompts[request.tag as keyof typeof roastPrompts] || roastPrompts['#CringeText'];
      const randomRoast = tagRoasts[Math.floor(Math.random() * tagRoasts.length)];

      return {
        roast: randomRoast,
        hasVoice: Math.random() > 0.5, // Random for demo
        mood: 'playful',
      };
    } catch (error) {
      console.error('Error generating roast:', error);
      return {
        roast: "Even my AI is speechless... and that's saying something 💀",
        hasVoice: false,
        mood: 'gentle',
      };
    }
  }

  async generateVoiceRoast(text: string, options: VoiceOptions = {}): Promise<string | null> {
    try {
      // In production, this would call ElevenLabs API
      // For demo, return a placeholder URL
      return `https://api.elevenlabs.io/v1/text-to-speech/voice-id-here?text=${encodeURIComponent(text)}`;
    } catch (error) {
      console.error('Error generating voice roast:', error);
      return null;
    }
  }

  async generateVideoRoast(text: string, avatarId?: string): Promise<string | null> {
    try {
      // In production, this would call Tavus CVI API
      // For demo, return a placeholder URL
      return `https://tavus.io/api/video/${avatarId}?text=${encodeURIComponent(text)}`;
    } catch (error) {
      console.error('Error generating video roast:', error);
      return null;
    }
  }

  async moderateContent(content: string): Promise<boolean> {
    try {
      // Basic content moderation
      const flaggedWords = ['suicide', 'kill', 'death', 'harm', 'violence'];
      const personalInfo = /\b\d{3}-\d{3}-\d{4}\b|\b\w+@\w+\.\w+\b/; // Phone or email patterns
      
      const hasFlaggedContent = flaggedWords.some(word => 
        content.toLowerCase().includes(word)
      );
      
      const hasPersonalInfo = personalInfo.test(content);
      
      return !(hasFlaggedContent || hasPersonalInfo);
    } catch (error) {
      console.error('Error moderating content:', error);
      return false;
    }
  }

  async getBotMessage(mood: string, roomType: string): Promise<string> {
    const botMessages = {
      sad: [
        "🤖 Daily reminder: Your worth isn't determined by their reply time ✨",
        "💡 Fun fact: 'k' is not a conversation, it's an assassination 💀",
        "🔥 Remember: You're not the problem, their communication skills are 😌",
      ],
      awkward: [
        "🎯 Poll time! Ever sent a text to the wrong person? React if yes 🙋‍♀️",
        "💀 Cringe tip: If it happened more than 5 years ago, it didn't happen ✨",
        "🤖 Bot wisdom: Everyone's too busy being awkward to judge your awkwardness 💯",
      ],
      happy: [
        "✨ Spread the good vibes! Share something that made you smile today 😊",
        "🎉 Celebration time! What small win are you proud of? 🏆",
        "💫 Positivity check: Tag someone who deserves love today! 💕",
      ],
      lonely: [
        "🫂 You're not alone in feeling alone - we're all here together 💙",
        "🌟 Reminder: Loneliness is temporary, but the connections you make here are real ✨",
        "💭 Sometimes the best conversations start with 'I feel exactly the same way' 🤝",
      ],
    };

    const messages = botMessages[mood as keyof typeof botMessages] || botMessages.lonely;
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export const aiService = new AIService();