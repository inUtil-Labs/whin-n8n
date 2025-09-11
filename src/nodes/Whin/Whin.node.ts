import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

const WHIN_ENDPOINT = 'https://api.whin.app/n8n';
const ALLOWED_TYPES = new Set([
  'text',
  'template',
  'image',
  'audio',
  'video',
  'document',
  'sticker',
  'contacts',
  'location',
  'interactive',
  'reaction',
]);

export class Whin implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Whin',
    name: 'whin',
    icon: 'file:whin.png',
    group: ['output'],
    version: 1,
    description: 'WhatsApp (self-send): send messages to your own WhatsApp via Whin. Search: whatsapp, whatsapp yourself, self whatsapp.',
    defaults: {
      name: 'Whin',
    },
    // Hint for palette: surface WhatsApp explicitly in subtitle
    subtitle: 'WhatsApp • send to yourself',
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'whinApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Send',
            value: 'send',
            description: 'Send a WhatsApp message',
          },
        ],
        default: 'send',
      },
      {
        displayName: 'Token Override',
        name: 'token',
        type: 'string',
        default: '',
        description: 'Override credential token for this item',
      },
      {
        displayName: 'Content Payload',
        name: 'payload',
        type: 'json',
        default: '={{$json}}',
        description:
          'WhatsApp content object only (e.g. {"type":"text","text":{"body":"hi"}}). Do not include envelope fields like messaging_product, to, or context.',
      },
      {
        displayName: 'Request Timeout (ms)',
        name: 'timeoutMs',
        type: 'number',
        typeOptions: { minValue: 1000 },
        default: 10000,
        description: 'Abort the request if it takes longer than this',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('whinApi');

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const defaultToken = (credentials.token as string) || '';
        const tokenOverride = this.getNodeParameter('token', itemIndex, '') as string;
        const tokenToUse = tokenOverride || defaultToken;
        if (!tokenToUse) {
          throw new Error('Missing token. Provide credentials or a Token Override.');
        }

        let payloadParam = this.getNodeParameter('payload', itemIndex) as unknown;
        const timeoutMs = this.getNodeParameter('timeoutMs', itemIndex, 10000) as number;

        // Accept string JSON or object
        if (typeof payloadParam === 'string') {
          const trimmed = payloadParam.trim();
          if (trimmed.startsWith('=')) {
            // Expression strings are resolved by n8n; at runtime we receive the evaluated value.
          }
          if (trimmed && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
            try {
              payloadParam = JSON.parse(trimmed);
            } catch {
              throw new Error('Content Payload must be valid JSON when provided as a string.');
            }
          }
        }

        if (payloadParam === null || typeof payloadParam !== 'object' || Array.isArray(payloadParam)) {
          throw new Error('Content Payload must be a JSON object.');
        }

        const payload = { ...(payloadParam as IDataObject) };

        // Strip envelope fields if present (safety)
        delete (payload as IDataObject)['messaging_product'];
        delete (payload as IDataObject)['to'];
        delete (payload as IDataObject)['context'];

        // Basic validation: require a type and allow only supported types
        const typeValue = (payload as IDataObject)['type'];
        if (typeof typeValue !== 'string' || !ALLOWED_TYPES.has(typeValue)) {
          throw new Error(
            'Content Payload must include a valid "type" (text|template|image|audio|video|document|sticker|contacts|location|interactive|reaction).',
          );
        }

        const requestOptions = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenToUse}`,
            'User-Agent': 'whin-n8n/1.0.1',
          },
          body: {
            ...payload,
            token: tokenToUse,
          },
          method: 'POST',
          uri: WHIN_ENDPOINT,
          json: true,
          timeout: timeoutMs,
        } as unknown as IDataObject;

        const responseData = await this.helpers.request(requestOptions);
        returnData.push({ json: (responseData as IDataObject) ?? {} });
      } catch (error) {
        const err = error as IDataObject & { statusCode?: number; code?: string };
        const safeError = {
          message: (err.message as string) || 'Request failed',
          statusCode: err.statusCode ?? (err as unknown as { response?: { statusCode?: number } }).response?.statusCode,
          code: err.code,
        } as IDataObject;

        if (this.continueOnFail()) {
          returnData.push({ json: safeError, pairedItem: { item: itemIndex } });
          continue;
        }
        throw new Error(`${safeError.statusCode ?? ''} ${safeError.message}`.trim());
      }
    }

    return [returnData];
  }
}


