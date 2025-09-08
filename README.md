# @inutil-labs/n8n-nodes-whin

Whin for n8n – send WhatsApp messages to yourself (alerts, status, outcomes) with the simplicity of a token. No Meta Business Manager, no phone number onboarding, no app review.

- No base URL to configure
- Single credential: Token
- Supports WhatsApp content types: `text`, `template`, `image`, `audio`, `video`, `document`, `sticker`, `contacts`, `location`, `interactive`.
- v1.0 scope: Sender node only (no trigger/receiver)

## How Whin works

Whin wraps WhatsApp Cloud so you can message yourself from n8n without the usual Meta setup. A short‑lived token (free plan: 24h) authenticates you and implicitly selects your registered number. Because you’re sending to yourself, there is no `to` field.

## Get your token

1) From your WhatsApp, send a message to the Whin number: `+1 302 261 2667`
2) Text exactly: `token n8n`
3) You’ll receive a reply containing your token
4) Use that token in the node’s credentials (renew the same way when it expires)

Notes
- The token binds your requests to your WhatsApp number – do not include `to`.
- On expiration, the backend will respond asking you to renew.

## Installation

The easiest way is through the n8n UI.

- In n8n: Settings → Community Nodes → Install
- Package name: `@inutil-labs/n8n-nodes-whin`
- Approve and restart when prompted

For advanced/self‑hosted options, see n8n docs: [Install community nodes](https://docs.n8n.io/integrations/community-nodes/installation/)

## Configure and send

1) Create credentials: `Whin API`
- Token: paste the token you obtained via WhatsApp (`token n8n`)

2) Add node: `Whin` (subtitle includes “WhatsApp • send to yourself”)
- Content Payload: the WhatsApp content object only (no envelope). The node strips `messaging_product`, `to`, and `context` if present.
- Token Override (optional): per‑item token
- Request Timeout (ms): default 10000

3) Execute
- The node posts your content to Whin and returns delivery info. If the token expired, you’ll get a renewal hint.

### Content Payload rules (important)
- Do NOT include: `messaging_product`, `to`, `context`
- Include only the content object with a valid `type`:
  - `text|template|image|audio|video|document|sticker|contacts|location|interactive|reaction`

### Examples

Text
```json
{
  "type": "text",
  "text": { "body": "Hello from Whin" }
}
```

Template
```json
{
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": { "code": "en_US" },
    "components": [
      { "type": "body", "parameters": [ { "type": "text", "text": "Alice" } ] }
    ]
  }
}
```

Image / Audio / Video / Document / Sticker
```json
{ "type": "image",    "image":    { "link": "https://example.com/pic.jpg", "caption": "optional" } }
{ "type": "audio",    "audio":    { "link": "https://example.com/sound.mp3" } }
{ "type": "video",    "video":    { "link": "https://example.com/clip.mp4", "caption": "optional" } }
{ "type": "document", "document": { "link": "https://example.com/file.pdf", "filename": "file.pdf" } }
{ "type": "sticker",  "sticker":  { "link": "https://example.com/sticker.webp" } }
```

Contacts
```json
{
  "type": "contacts",
  "contacts": [
    {
      "name": { "first_name": "Ada", "last_name": "Lovelace" },
      "phones": [ { "phone": "+15551234567", "type": "CELL" } ],
      "emails": [ { "email": "ada@example.com", "type": "WORK" } ],
      "org": { "company": "Analytical Engine" }
    }
  ]
}
```

Location
```json
{
  "type": "location",
  "location": { "latitude": 40.4168, "longitude": -3.7038, "name": "Puerta del Sol", "address": "Madrid, Spain" }
}
```

Reaction
```json
{ "type": "reaction", "reaction": { "message_id": "<wamid>", "emoji": "👍" } }
```

Interactive (buttons)
```json
{
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Confirm booking?" },
    "action": { "buttons": [ { "type": "reply", "reply": { "id": "ok", "title": "Yes" } } ] }
  }
}
```

Interactive (list)
```json
{
  "type": "interactive",
  "interactive": {
    "type": "list",
    "body": { "text": "Choose an option" },
    "action": {
      "button": "Open menu",
      "sections": [ { "title": "Main", "rows": [ { "id": "opt1", "title": "Option 1", "description": "…" } ] } ]
    }
  }
}
```

### Using expressions
- Use previous item JSON:
```
{{$json}}
```
- Use a nested field (e.g., `whatsappContent`):
```
{{$json.whatsappContent}}
```
- Build content dynamically:
```
{{ { type: 'text', text: { body: $json.message } } }}
```
- Parse a JSON string:
```
{{ JSON.parse($json.payload) }}
```

## Token lifecycle
- Free plan tokens expire in 24h
- Renew by sending `token n8n` to `+1 302 261 2667`

## Example use cases
- Alerts: build complete, server metrics, failed job, new order
- Flow outcomes: invoice sent, PR merged, backup finished
- Daily digests and reminders

## Troubleshooting
- Node not listed: ensure Community Nodes are allowed by your n8n instance and you installed `@inutil-labs/n8n-nodes-whin`
- 401/expired: renew the token via WhatsApp (`token n8n`)
- Payload error: send the content object only; include a valid `type`

## Security
- The token is stored as a masked credential
- The node strips envelope fields (`messaging_product`, `to`, `context`) to avoid accidental leakage

---

MIT © inUtil Labs
