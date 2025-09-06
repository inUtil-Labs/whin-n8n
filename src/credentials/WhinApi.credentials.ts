import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class WhinApi implements ICredentialType {
  name = 'whinApi';

  displayName = 'Whin API';

  documentationUrl = 'https://api.inutil.info/wh2/n8n/wspout';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.inutil.info/wh2/n8n/wspout',
      required: true,
      description: 'Whin backend endpoint to send messages',
    },
    {
      displayName: 'Token',
      name: 'token',
      type: 'string',
      default: '',
      required: true,
      typeOptions: { password: true },
      description: 'Whin token. Can be overridden per item via node parameter',
    },
  ];
}


