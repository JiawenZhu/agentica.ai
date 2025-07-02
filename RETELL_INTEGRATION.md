# Retell AI Integration for Agentica.ai

This document explains how to use the Retell AI integration in your Agentica.ai project.

## 🔧 Setup

### Environment Variables

The following environment variables are configured in `.env.local`:

```bash
# Retell AI Configuration
VITE_RETELL_API_KEY=key_6de81a8397e1159dc36d9300329d
RETELL_API_KEY=key_6de81a8397e1159dc36d9300329d

# OpenAI Configuration (for LLM backend)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# API Base URLs
VITE_RETELL_BASE_URL=https://api.retellai.com
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
```

## 🏗️ Architecture

### Components Created

1. **`services/retellService.ts`** - Main service for Retell API interactions
2. **`hooks/useRetellCall.ts`** - React hook for managing voice calls
3. **`components/RetellVoiceCall.tsx`** - Voice call UI component
4. **`components/RetellAgentManager.tsx`** - Agent management interface

### Integration Points

- **Dashboard Page**: New "Retell Agents" tab for managing agents
- **Agent Detail Page**: "Test Voice Call" section for testing agents

## 🎯 Features

### Agent Management
- ✅ Create new Retell agents
- ✅ Edit existing agents
- ✅ Delete agents
- ✅ Test agents with live voice calls
- ✅ Configure voice settings (temperature, speed, responsiveness)
- ✅ Set custom prompts and personalities

### Voice Calling
- ✅ Real-time voice conversations
- ✅ WebSocket connection to Retell
- ✅ Microphone access and audio handling
- ✅ Call duration tracking
- ✅ Live transcript display
- ✅ Call controls (mute, volume, end call)

### Voice Options
- ElevenLabs voices (Adrian, Bella, Charlie, Diana)
- OpenAI voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)

## 🚀 Usage

### 1. Managing Agents

Navigate to **Dashboard → Retell Agents** to:

- **Create Agent**: Click "Create Agent" button
- **Edit Agent**: Click "Edit" on any agent card
- **Test Agent**: Click "Test" to start a voice call
- **Delete Agent**: Click "Delete" (with confirmation)

### 2. Agent Configuration

When creating/editing an agent, you can configure:

- **Agent Name**: Display name for the agent
- **Voice**: Choose from ElevenLabs or OpenAI voices
- **Language**: en-US, en-GB, es-ES, fr-FR, de-DE
- **System Prompt**: Instructions for the agent's behavior
- **Voice Settings**:
  - Temperature (0-2): Voice expressiveness
  - Speed (0.5-2): Speaking rate
  - Responsiveness (0-2): Interruption sensitivity

### 3. Testing Voice Calls

From the Agent Detail page or Agent Manager:

1. Click "Test" or the phone button
2. Allow microphone access when prompted
3. Start speaking - the agent will respond
4. Use controls to mute/unmute or end the call
5. View live transcript during the conversation

## 🔗 API Integration

### Retell Service Methods

```typescript
// Agent Management
await retellService.createAgent(agentData);
await retellService.getAgent(agentId);
await retellService.updateAgent(agentId, updateData);
await retellService.deleteAgent(agentId);
await retellService.listAgents();

// Call Management
await retellService.createWebCall(request);
await retellService.getCall(callId);
await retellService.listCalls();

// Voice Management
await retellService.listVoices();
```

### Voice Call Hook

```typescript
const {
  callState,
  startCall,
  endCall,
  formatDuration,
  isCallActive,
} = useRetellCall({
  onCallStart: () => console.log('Call started'),
  onCallEnd: () => console.log('Call ended'),
  onCallError: (error) => console.error('Call error:', error),
  onTranscriptUpdate: (transcript) => console.log('Transcript:', transcript),
});
```

## 🛠️ Technical Details

### WebSocket Connection
- Connects to `wss://api.retellai.com/audio-websocket`
- Handles real-time audio streaming
- Manages call state and events

### Audio Handling
- Requests microphone permissions
- Creates AudioContext for audio processing
- Manages MediaStream for audio input
- Sample rate: 24kHz with noise suppression

### Error Handling
- API errors are caught and displayed as toasts
- WebSocket connection errors are handled gracefully
- Microphone permission errors are communicated to users

## 🔒 Security

- API keys are stored in environment variables
- Client-side keys use `VITE_` prefix for Vite access
- Server-side operations use non-prefixed keys
- All API calls include proper authentication headers

## 🎨 UI/UX Features

- Real-time call status indicators
- Animated connecting states
- Professional call controls
- Live transcript display
- Responsive design for all screen sizes
- Toast notifications for user feedback

## 🎨 UI/UX Improvements

### Enhanced Visual Design
- **Better Contrast**: Improved text contrast for better readability in both light and dark modes
- **Status Indicators**: Clear, colorful badges for connection status, agent configuration, and call states
- **Interactive Elements**: Enhanced buttons with hover effects, shadows, and better visual feedback
- **Card Design**: Professional gradient headers, better spacing, and improved visual hierarchy

### Voice Call Interface
- **Larger Controls**: Bigger phone buttons (20x20) for better accessibility
- **Status Badges**: Color-coded connection status with animations
- **Error Handling**: Clear error messages with suggested solutions
- **Visual Feedback**: Better contrast for muted/unmuted states and volume controls

### Agent Management
- **Grid Layout**: Responsive card grid with hover effects
- **Action Buttons**: Color-coded buttons for Test (green), Edit (blue), and Delete (red)
- **Status Display**: Visual indicators for agent configuration and activity status
- **Empty States**: Engaging empty state with clear call-to-action

## 🐛 Bug Fixes

### Fixed 404 Errors
- **Agent ID Issue**: Replaced hardcoded `demo-agent-001` with actual agent ID from your Retell account
- **Dynamic Agent Selection**: Agent Detail page now uses URL parameters or falls back to available agent
- **Error Handling**: Better error messages for missing agents and API failures

### Improved Error Messages
- **Descriptive Errors**: Specific error messages for different failure scenarios
- **User-Friendly**: Clear instructions on how to resolve common issues
- **Network Issues**: Better handling of connection problems and timeouts

## 🐛 Troubleshooting

### Common Issues

1. **"Retell service is not configured"**
   - Check that `VITE_RETELL_API_KEY` is set in `.env.local`
   - Restart the development server after adding environment variables

2. **Microphone access denied**
   - Check browser permissions for microphone access
   - Ensure HTTPS in production (required for microphone access)

3. **WebSocket connection failed**
   - Verify internet connection
   - Check Retell API status
   - Ensure API key is valid

4. **Agent creation failed**
   - Verify API key permissions
   - Check required fields are filled
   - Review console for detailed error messages

### Development Tips

- Use browser dev tools to monitor WebSocket connections
- Check Network tab for API request/response details
- Console logs provide detailed error information
- Test with different voices and settings to find optimal configuration

## 📱 Mobile Support

The voice calling functionality works on mobile devices with some considerations:

- iOS Safari requires user interaction to start audio
- Android Chrome works well with WebRTC
- Responsive UI adapts to mobile screens
- Touch-friendly call controls

## 🚀 Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Ensure HTTPS is enabled (required for microphone access)
3. Configure CORS if needed for your domain
4. Test voice calling functionality thoroughly
5. Monitor API usage and costs

## 📊 Analytics & Monitoring

The integration provides:

- Call duration tracking
- Connection status monitoring
- Error logging and reporting
- Usage metrics through Retell dashboard

---

**Need Help?** Check the Retell AI documentation or contact support for advanced configuration options. 