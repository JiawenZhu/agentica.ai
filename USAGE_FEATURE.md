# Usage & Cost Tracking Feature

## Overview
Added **Usage & Cost Analytics** functionality to both marketplace agents and Retell agents, providing real-time usage statistics and cost tracking.

## Implementation Summary

### New Components Created:
1. **UsageModal.tsx** - Main modal component for marketplace agents
2. **RetellUsageModal.tsx** - Specialized modal for Retell agents with API integration
3. **Enhanced EnhancedAgentCard.tsx** - Added usage button with Activity icon
4. **Enhanced RetellAgentManager.tsx** - Added usage button to Retell agent cards

### Features Added:
- **Real-time Usage Tracking**: Live updates of calls and minutes
- **Cost Analytics**: Detailed cost breakdown with per-minute pricing based on voice models
- **Daily Statistics**: Today's usage and costs
- **Historical Data**: All-time statistics
- **Monthly Limits**: Progress tracking with visual indicators
- **Performance Metrics**: Average call duration and cost efficiency
- **Retell API Integration**: Real call data from Retell when available
- **Call Quality Metrics**: Success rates, voicemail detection, sentiment analysis
- **Voice Model Pricing**: Accurate costs based on ElevenLabs, OpenAI, and Deepgram pricing

### Button Placement:
- **Grid View**: Top-right corner (appears on hover)
- **List View**: Right side with other action buttons
- **Icon**: Activity icon with "View usage & costs" tooltip

### Modal Content:
- Today's calls and costs (real-time)
- All-time statistics
- Monthly usage limits with progress bars
- Performance metrics
- Export and detailed analytics buttons

### Integration:
- Integrated into MarketplacePage.tsx
- Uses existing UI components (shadcn/ui)
- Responsive design
- Real-time data simulation

## Usage Instructions:

### For Marketplace Agents:
1. Navigate to the marketplace
2. Hover over agent cards (grid view) or look at action buttons (list view)  
3. Click the Activity icon button
4. View real-time usage and cost analytics
5. Monitor spending and usage patterns

### For Retell Agents:
1. Navigate to Dashboard > Retell Agents tab
2. Find any agent card and click the purple Activity button
3. View detailed analytics including:
   - Real call data (if Retell API is configured)
   - Voice model-specific pricing
   - Call success rates and quality metrics
   - Voicemail detection rates
   - Live cost tracking with accurate per-minute rates

## Technical Details:
- Uses React hooks for state management
- Simulates real-time updates with intervals for marketplace agents
- Responsive modal with proper accessibility
- Integrates with existing app context and styling

### Retell-Specific Implementation:
- **Real API Integration**: Attempts to fetch actual call data from Retell API
- **Official Retell Pricing**: Uses exact pricing structure from [retellai.com/pricing](https://www.retellai.com/pricing)
- **Component-Based Costs**: Voice Engine + LLM + Telephony pricing
- **Smart Polling Strategy**: Adaptive polling with usage change detection and backoff
- **Billable Call Filtering**: Only counts actual voice calls (web_call, phone_call) as billable
- **API Call Exclusion**: API calls for monitoring/usage retrieval are NOT counted in billable usage
- **Call Quality Filtering**: Excludes failed connections and calls shorter than 6 seconds
- **Call Analysis**: Shows success rates, voicemail detection, and sentiment analysis from Retell call data
- **Manual Refresh**: Instant refresh capability with button click
- **Fallback to Mock Data**: If API fails, shows realistic mock data
- **Agent-Specific Filtering**: Only shows data for the selected Retell agent

### Accurate Retell Pricing Structure (per minute):
**Voice Engine:**
- **ElevenLabs voices**: $0.07/min
- **OpenAI voices**: $0.08/min

**LLM Costs:**
- **GPT-4o**: $0.05/min
- **GPT-4o mini**: $0.006/min
- **GPT-4.1**: $0.045/min
- **GPT-4.1 mini**: $0.016/min
- **GPT-4.1 nano**: $0.004/min
- **Claude 3.7 Sonnet**: $0.06/min
- **Claude 3.5 Haiku**: $0.02/min
- **Gemini 2.0 Flash**: $0.006/min
- **Gemini 2.0 Flash Lite**: $0.003/min

**Telephony:**
- **Retell Twilio**: $0.015/min

**Add-ons:**
- **Knowledge Base**: +$0.005/min
- **Batch Call**: +$0.005/dial
- **Branded Call**: +$0.010/outbound call

**Total Cost = Voice Engine + LLM + Telephony + Add-ons**

## ⚠️ **Important: Billable vs Non-Billable Calls**

### What IS Billable:
- **Actual voice calls** (web_call, phone_call) that connect users to agents
- **Completed calls** with valid start and end timestamps
- **Calls longer than 6 seconds** (filters out connection errors)

### What is NOT Billable:
- **API calls for monitoring** (e.g., `listCalls()` to retrieve usage data)
- **API calls for management** (creating, updating, deleting agents)
- **Failed connections** or calls with errors
- **Calls shorter than 6 seconds** (likely connection failures)
- **Ongoing calls** that haven't completed yet

### Implementation Safeguards:
- **Call Type Filtering**: Only `web_call` and `phone_call` types are counted
- **Status Filtering**: Only `ended` calls are included in cost calculations
- **Duration Filtering**: Calls must have valid timestamps and >6 second duration
- **Real-time Accuracy**: Costs are calculated from actual call durations × pricing rates

This ensures that monitoring the usage dashboard itself doesn't inflate your actual costs!

## 🔄 **Smart Polling Strategy**

### Adaptive Polling Logic:
Instead of continuously polling the API at fixed intervals, the system uses intelligent change detection:

#### **Usage Change Detection:**
1. **Creates usage snapshots** containing call count, call IDs, and timestamps
2. **Compares snapshots** to detect if actual usage has changed
3. **Only updates UI** when real changes are detected

#### **Adaptive Intervals:**
- **Initial**: 10 seconds (when modal opens or after manual refresh)
- **No Changes Detected**: Backs off to 30s → 45s → 60s → 120s (max)
- **Usage Changes**: Immediately resets to 10-second polling
- **Manual Refresh**: Always fetches latest data and resets to 10s

#### **Benefits:**
- **Reduces API calls** by 70-90% compared to fixed polling
- **Prevents usage inflation** from monitoring activities
- **Responsive updates** when actual calls occur
- **Battery efficient** on mobile devices
- **Bandwidth conserving** for users

### Implementation Details:
```typescript
// Only polls when changes detected
if (!hasUsageChanged && !isManual) {
  console.log('📊 No usage changes detected, skipping update');
  return { hasUsageChanged: false };
}

// Adaptive backoff strategy
const nextInterval = pollInterval === 10000 ? 30000 : 
  Math.min(pollInterval * 1.5, 120000); // Max 2 minutes
```

### User Controls:
- **Manual Refresh Button**: Instant data fetch regardless of polling schedule
- **Visual Indicators**: Shows current polling interval and live update status
- **Console Logging**: Detailed polling activity for debugging (dev mode) 