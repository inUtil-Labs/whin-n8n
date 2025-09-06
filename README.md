# @inutil-labs/n8n-nodes-whin

Custom n8n community node to send WhatsApp messages through Whin backend.

- Endpoint (default): `https://api.inutil.info/wh2/n8n/wspout`
- Auth: token (header Authorization: Bearer <token> and body token field)

## Nodes

- Whin: Send Message
  - Inputs: main
  - Outputs: main
  - Credentials: Whin API (Base URL, Token)
  - Parameters:
    - Token Override (optional)
    - WhatsApp Payload (JSON matching official WhatsApp node schema; token is added automatically)

## Development

```bash
npm i
npm run build
```

Example usage in n8n:

1) Create credentials "Whin API" with Base URL and Token.
2) Add node "Whin: Send Message".
3) Set WhatsApp Payload (JSON) similar to official WhatsApp node, e.g.:

```json
{
  "to": "<phone-number>",
  "type": "text",
  "text": { "body": "Hello from Whin" }
}
```

In n8n, install as a local community node and use the Whin API credentials.
