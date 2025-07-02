# Agentica.ai - AI Voice Agents Marketplace

A modern React application for discovering, deploying, and creating AI voice agents powered by Retell AI and OpenAI.

![Agentica.ai](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop&crop=center)

## 🚀 Features

### 🎯 Core Functionality
- **AI Voice Agent Marketplace** - Browse hundreds of pre-built voice agents
- **Real-time Voice Conversations** - Talk directly with AI agents using Retell AI
- **Agent Creation & Management** - Build and customize your own voice agents
- **Live Voice Testing** - Test agents with real voice calls before deployment
- **Multiple Voice Options** - ElevenLabs and OpenAI voice models
- **Responsive Design** - Works seamlessly on desktop and mobile

### 🔊 Voice Integration (Retell AI)
- **Live Voice Calls** - Real-time conversations with AI agents
- **WebSocket Audio Streaming** - Low-latency voice communication
- **Multiple Voice Providers** - ElevenLabs and OpenAI voices
- **Call Management** - Duration tracking, transcripts, and analytics
- **Agent Customization** - Voice settings, prompts, and personalities

### 🎨 User Experience
- **Modern UI/UX** - Clean, professional interface with dark/light mode
- **Enhanced Search** - Intelligent search with suggestions and filters
- **Agent Cards** - Beautiful agent display with ratings and details
- **Dashboard** - Comprehensive management and analytics
- **Embed Options** - Multiple ways to integrate agents into websites

## 🚀 New Feature: Usage & Cost Analytics

### Overview
Each AI agent now includes a dedicated **Usage & Cost** button that provides real-time analytics and cost tracking:

### Features:
- **Live Usage Metrics**: Real-time tracking of calls and minutes
- **Cost Analytics**: Detailed cost breakdown with per-minute pricing
- **Today's Stats**: Current day usage and costs
- **All-time Statistics**: Historical data for total calls, minutes, and costs
- **Monthly Limits**: Progress tracking against monthly usage limits
- **Performance Metrics**: Average call duration and cost efficiency

### How to Use:
1. **Browse Agents**: Navigate to the marketplace to view available agents
2. **Find Usage Button**: Look for the Activity icon (📊) on agent cards
3. **View Analytics**: Click the button to open the usage modal
4. **Live Updates**: Watch real-time updates as usage changes
5. **Track Costs**: Monitor spending with detailed cost breakdowns

### Button Locations:
- **Grid View**: Top-right corner of agent cards (appears on hover)
- **List View**: Right side of agent cards alongside other action buttons

### Analytics Dashboard:
The usage modal includes:
- **Today's Metrics**: Current day calls and costs
- **Historical Data**: All-time usage statistics
- **Usage Limits**: Monthly progress tracking
- **Cost Efficiency**: Per-call cost analysis
- **Export Options**: Download usage reports

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components (shadcn/ui style)
- **React Router v6** for navigation
- **Framer Motion** for animations

### Voice & AI Integration
- **Retell AI** for voice conversations
- **OpenAI** for language models
- **WebRTC** for real-time audio
- **WebSocket** connections for live communication

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **PostCSS** for CSS processing
- **Axios** for API requests

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Retell AI API key
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentica.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` file in the root directory:
   ```bash
   # Retell AI Configuration
   VITE_RETELL_API_KEY=your_retell_api_key_here
   RETELL_API_KEY=your_retell_api_key_here
   
   # OpenAI Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   
   # API Base URLs
   VITE_RETELL_BASE_URL=https://api.retellai.com
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5174`

## 📁 Project Structure

```
agentica.ai/
├── components/                 # React components
│   ├── pages/                 # Page components
│   │   ├── LandingPage.tsx    # Home page
│   │   ├── MarketplacePage.tsx # Agent marketplace
│   │   ├── DashboardPage.tsx  # User dashboard
│   │   ├── AgentDetailPage.tsx # Agent details
│   │   └── CreateAgentPage.tsx # Agent creation
│   ├── ui/                    # Reusable UI components
│   ├── RetellVoiceCall.tsx    # Voice call component
│   ├── RetellAgentManager.tsx # Agent management
│   └── ...                    # Other components
├── services/                  # API services
│   └── retellService.ts       # Retell AI integration
├── hooks/                     # Custom React hooks
│   ├── useRetellCall.ts       # Voice call management
│   └── useDebounce.ts         # Debounced values
├── contexts/                  # React contexts
│   └── AppContext.tsx         # Global app state
├── styles/                    # CSS and styling
│   └── globals.css            # Global styles
└── ...                        # Config files
```

## 🎙️ Voice Integration Guide

### Setting Up Retell AI

1. **Get API Keys**
   - Sign up at [Retell AI](https://retellai.com)
   - Get your API key from the dashboard
   - Add to `.env.local` file

2. **Create Your First Agent**
   - Go to Dashboard → Retell Agents
   - Click "Create Agent"
   - Configure voice, language, and prompt
   - Test with live voice call

3. **Voice Options Available**
   - **ElevenLabs**: Adrian, Bella, Charlie, Diana
   - **OpenAI**: Alloy, Echo, Fable, Onyx, Nova, Shimmer

### Testing Voice Calls

1. Navigate to any agent detail page
2. Click the "Test Voice Call" button
3. Allow microphone access
4. Start speaking with the agent
5. View live transcript and call controls

For detailed voice integration documentation, see [RETELL_INTEGRATION.md](./RETELL_INTEGRATION.md).

## 🎨 UI Components

### Key Components
- **EnhancedSearch** - Intelligent search with suggestions
- **EnhancedAgentCard** - Agent display cards
- **RetellVoiceCall** - Voice call interface
- **RetellAgentManager** - Agent CRUD operations
- **VoicePreview** - Audio playback component

### Design System
- **Colors**: Dark theme with blue-purple gradients
- **Typography**: Clean, modern font hierarchy
- **Animations**: Subtle micro-interactions
- **Responsive**: Mobile-first design approach

## 📱 Pages & Features

### 🏠 Landing Page
- Hero section with search
- Feature highlights
- Agent categories
- How it works section

### 🛒 Marketplace
- Agent browsing and filtering
- Search functionality
- Category filtering
- Agent cards with ratings

### 📊 Dashboard
- User agent management
- Retell agent creation/editing
- Analytics and usage stats
- Embed code generation

### 🔍 Agent Detail
- Detailed agent information
- Live voice call testing
- Customization options
- Deployment instructions

### ⚙️ Create Agent
- Step-by-step agent creation
- Voice and personality settings
- Knowledge base upload
- Testing and deployment

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Guidelines

1. **TypeScript**: All components use TypeScript
2. **Components**: Use functional components with hooks
3. **Styling**: Tailwind CSS with custom CSS variables
4. **State**: Context API for global state, local state for components
5. **API**: Centralized service layer for external APIs

### Adding New Features

1. Create components in appropriate directories
2. Add TypeScript interfaces for data structures
3. Integrate with existing services and contexts
4. Follow the established design patterns
5. Test voice functionality thoroughly

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

Ensure these environment variables are set in your hosting platform:

```bash
VITE_RETELL_API_KEY=your_production_retell_key
VITE_OPENAI_API_KEY=your_production_openai_key
VITE_RETELL_BASE_URL=https://api.retellai.com
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
```

### Deployment Considerations

- **HTTPS Required**: Voice functionality requires HTTPS in production
- **CORS**: Configure CORS for your domain if needed
- **API Limits**: Monitor Retell and OpenAI usage
- **Performance**: Optimize for mobile voice calling

## 🐛 Troubleshooting

### Common Issues

1. **CSS not loading**: Check Tailwind directives in `globals.css`
2. **Voice calls failing**: Verify API keys and microphone permissions
3. **Import errors**: Check dependency versions and imports
4. **WebSocket errors**: Ensure stable internet connection

### Development Tips

- Use browser dev tools for debugging
- Check console for detailed error messages
- Test voice functionality in different browsers
- Monitor network requests for API issues

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially voice features)
5. Submit a pull request

## 📞 Support

- **Documentation**: See [RETELL_INTEGRATION.md](./RETELL_INTEGRATION.md)
- **Issues**: Create GitHub issues for bugs
- **Retell AI**: Check [Retell documentation](https://docs.retellai.com)
- **OpenAI**: Check [OpenAI documentation](https://platform.openai.com/docs)

---

**Built with ❤️ for the future of voice AI** 