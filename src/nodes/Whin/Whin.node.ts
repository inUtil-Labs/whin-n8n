import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

const WHIN_ENDPOINT = 'https://api.inutil.info/wh2/n8n/wspout';

export class Whin implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Whin: Send Message',
    name: 'whin',
    icon: 'file:whin.png',
    group: ['output'],
    version: 1,
    description: 'Send WhatsApp messages via Whin backend',
    defaults: {
      name: 'Whin',
    },
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
        default: '{"type":"text","text":{"body":""}}',
        description:
          'WhatsApp content object only (e.g. text/template/image/etc.). Do not include envelope fields like messaging_product or to.',
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

        let payloadParam = this.getNodeParameter('payload', itemIndex) as unknown;

        // Accept string JSON or object
        if (typeof payloadParam === 'string') {
          try {
            payloadParam = JSON.parse(payloadParam);
          } catch (err) {
            throw new Error('Payload must be valid JSON when provided as string');
          }
        }

        const payload = { ...(payloadParam as IDataObject) };

        // Strip envelope fields if present
        delete (payload as IDataObject)['messaging_product'];
        delete (payload as IDataObject)['to'];
        delete (payload as IDataObject)['context'];

        const requestOptions = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenToUse}`,
          },
          body: {
            ...payload,
            token: tokenToUse,
          },
          method: 'POST',
          uri: WHIN_ENDPOINT,
          json: true,
        } as unknown as IDataObject;

        const responseData = await this.helpers.request(requestOptions);
        returnData.push({ json: responseData as IDataObject });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: itemIndex } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}


