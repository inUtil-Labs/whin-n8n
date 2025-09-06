# @inutil-labs/n8n-nodes-whin

Custom n8n community node to send WhatsApp messages through Whin backend.

- Endpoint (fixed): `https://api.inutil.info/wh2/n8n/wspout`
- Auth: token (header Authorization: Bearer <token> and body token field)

## Nodes

- Whin: Send Message
  - Inputs: main
  - Outputs: main
  - Credentials: Whin API (Token only)
  - Parameters:
    - Token Override (optional)
    - Content Payload (JSON for the WhatsApp content only; do not include envelope fields like `messaging_product`, `to`, or `context`)

## Development

```bash
npm i
npm run build
```

Example usage in n8n:

1) Create credentials "Whin API" with Token.
2) Add node "Whin: Send Message".
3) Set Content Payload (JSON), e.g.:

```json
{
  "type": "text",
  "text": { "body": "Hello from Whin" }
}
```

The node strips envelope fields if present and sends only the content to the Whin endpoint with your token.
