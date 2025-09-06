import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

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
        displayName: 'WhatsApp Payload',
        name: 'payload',
        type: 'json',
        default: '{"to":"","type":"text","text":{"body":""}}',
        description: 'Payload following official WhatsApp node schema, plus token support',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('whinApi');

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const baseUrl = (credentials.baseUrl as string) || 'https://api.inutil.info/wh2/n8n/wspout';
        const defaultToken = (credentials.token as string) || '';
        const tokenOverride = this.getNodeParameter('token', itemIndex, '') as string;
        const tokenToUse = tokenOverride || defaultToken;

        const payload = this.getNodeParameter('payload', itemIndex, {}) as IDataObject;

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
          uri: baseUrl,
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


