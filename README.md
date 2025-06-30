# 🔥 Roastify - Anonymous Confession & AI Roast Platform

A beautiful, mobile-first app where users anonymously post real-life cringe, heartbreak, ghosting, or awkward moments and get instantly roasted by AI. Built for Gen Z, Millennials, and Gen Alpha users with conversational AI, clean design, and monetizable features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your Project URL and anon public key

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your Supabase credentials:
# EXPO_PUBLIC_SUPABASE_URL=your_project_url
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Set up database schema**
   - In your Supabase dashboard, go to SQL Editor
   - Run the migration files in order:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_sample_data.sql`

5. **Start development server**
```bash
npm run dev
```

## 🎯 Features

### 🧨 Feed Tab (Main Home)
- Anonymous confession posting (max 500 chars)
- Tag system (#Ghosted, #RedFlag, #CringeText, etc.)
- AI-generated roasts
- Community reactions (😂, 💀, 😳, 😭)
- Interactive polls: "Who's wrong?" - You/Them/Both
- Real-time updates with Supabase

### 😢 Chatroom Tab (Mood Matching)
- Daily mood check-ins (😢 Sad, 😳 Awkward, 😂 Happy, 🧍 Lonely)
- Anonymous ephemeral chat rooms (24-hour auto-delete)
- AI bot drops hourly content and support messages
- Real-time messaging with Supabase

### 🎮 Roast Games Tab
- **Lie Detector**: 4 statements, 1 truth, get roasted for wrong guesses
- **Spin the Roast**: Random roast categories with wheel spinner
- **Am I a Fool?**: Judge others' choices
- **Red Flag Radar**: Spot the red flags
- Free: 4 rounds/day, Premium: 10 rounds/day

### 👤 Profile Tab
- Roast Points scoring system
- Achievement badges ("Cringe Queen", "Left On Read OG")
- Post archive (private unless shared)
- Premium subscription management
- Dark/light mode toggle

## 🛠 Tech Stack

- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: Supabase (auth, database, real-time)
- **AI**: Simple roast generation (expandable to OpenAI GPT)
- **Styling**: React Native StyleSheet
- **Navigation**: Expo Router with tabs
- **Icons**: Lucide React Native

## 📱 Database Schema

### Tables
- **users**: Anonymous user profiles and stats
- **confessions**: User submissions with AI roasts (24h expiry)
- **chat_messages**: Mood room messages (24h expiry)

### Key Features
- Row Level Security (RLS) enabled
- Anonymous access for MVP
- Auto-cleanup of expired content
- Real-time subscriptions for chat

## 🎨 Design Philosophy

- **Mobile-first**: Optimized for smartphone usage
- **Anonymous-safe**: No following, DMs, or profile stalking
- **Gen Z aesthetic**: Modern gradients, emojis, and slang
- **Minimalist**: Clean cards, soft shadows, fluid transitions
- **Dopamine-rich**: Satisfying interactions and animations

## 🔐 Privacy & Security

- **Anonymous by Design**: No personal data collection
- **Ephemeral Content**: Auto-deletion after 24 hours
- **Content Moderation**: Basic filtering for harmful content
- **Secure APIs**: Environment variables for sensitive data
- **RLS Policies**: Database-level security

## 📈 Future Enhancements

### Phase 2
- OpenAI GPT integration for better roasts
- ElevenLabs voice roasts (Premium)
- RevenueCat subscription management
- Advanced mood tracking analytics

### Phase 3
- Tavus video avatars
- Social media sharing
- Advanced AI personalities
- Cross-platform web version

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Follow coding standards

## 📄 License

MIT License - feel free to use for educational purposes.

## 🙏 Acknowledgments

- **Built with Bolt.new** - Rapid prototyping platform
- **Supabase** - Backend as a Service
- **Expo** - React Native development platform
- **Lucide** - Beautiful icon library

---

**Built with 💀 by Roastify Team**  
*Powered by Bolt.new*

*"Where cringe meets comedy, and everyone gets roasted equally."*