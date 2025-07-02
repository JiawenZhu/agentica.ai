# Vogent Webhooks Setup Guide

## Overview

Vogent webhooks allow you to receive real-time notifications about call events (started, ended, failed, etc.). This guide explains how to properly configure and verify webhook signatures using your webhook signing secret.

## Configuration

### Environment Variables

Your webhook signing secret has been added to `.env.local`:

```bash
# Webhook Configuration
VITE_VOGENT_WEBHOOK_SECRET=Yl5IeAEhVuSgCjX
VITE_VOGENT_WEBHOOK_URL=  # Add your webhook endpoint URL here
```

### Setting Up Your Webhook Endpoint

1. **Add your webhook URL**: Update `VITE_VOGENT_WEBHOOK_URL` with your actual webhook endpoint:
   ```bash
   VITE_VOGENT_WEBHOOK_URL=https://your-domain.com/api/webhooks/vogent
   ```

2. **Backend Implementation**: Webhooks must be handled on your backend server (not in the frontend). See the example implementation in `utils/webhookUtils.ts`.

## Webhook Verification

The signing secret `Yl5IeAEhVuSgCjX` is used to verify that webhook requests are authentic and coming from Vogent.

### Backend Implementation Example

```javascript
const crypto = require('crypto');
const express = require('express');

// Webhook endpoint
app.post('/api/webhooks/vogent', express.raw({type: 'application/json'}), (req, res) => {
  const payload = req.body.toString();
  const signature = req.headers['vogent-signature']; // Check Vogent docs for actual header name
  const secret = process.env.VOGENT_WEBHOOK_SECRET; // Your webhook secret: Yl5IeAEhVuSgCjX
  
  // Verify the webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).send('Unauthorized');
  }
  
  // Process the webhook event
  try {
    const event = JSON.parse(payload);
    handleWebhookEvent(event);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).send('Bad Request');
  }
});

function handleWebhookEvent(event) {
  console.log('Received webhook event:', event.type);
  
  switch (event.type) {
    case 'dial.started':
      console.log('Call started:', event.data.dialId);
      break;
    case 'dial.ended':
      console.log('Call ended:', event.data.dialId);
      break;
    case 'dial.failed':
      console.log('Call failed:', event.data.dialId);
      break;
    default:
      console.log('Unknown webhook event type:', event.type);
  }
}
```

## Typical Webhook Events

Based on Vogent API documentation, you can expect events like:

- `dial.started` - When a call begins
- `dial.ended` - When a call ends normally
- `dial.failed` - When a call fails
- `dial.updated` - When call status changes

## Security Best Practices

1. **Always verify signatures**: Never process webhook payloads without verifying the signature
2. **Use HTTPS**: Always use secure HTTPS endpoints for webhooks
3. **Handle duplicates**: Implement idempotency to handle duplicate webhook deliveries
4. **Respond quickly**: Return HTTP 200 status as quickly as possible to avoid retries

## Debugging Webhooks

Use tools like:
- **ngrok**: For local development webhook testing
- **Webhook.site**: For testing webhook payloads
- **Postman**: For manual webhook testing

## Integration with Your App

The webhook functionality is already integrated into your VogentService:

```typescript
// Create a call with webhook URL
const response = await vogentService.createBrowserCall(agentId, webhookUrl);

// Verify webhook signature (backend only)
const isValid = vogentService.verifyWebhookSignature(payload, signature);
```

## Next Steps

1. Set up your backend webhook endpoint
2. Update `VITE_VOGENT_WEBHOOK_URL` with your endpoint URL
3. Test webhook delivery using a test call
4. Monitor webhook logs for debugging

## Troubleshooting

- **Signature verification fails**: Check that your secret matches exactly
- **Webhooks not received**: Verify your URL is publicly accessible
- **Duplicate events**: Implement idempotency keys in your handler

For more details, refer to the Vogent API documentation or contact Vogent support. 