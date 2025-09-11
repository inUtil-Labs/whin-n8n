import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class WhinApi implements ICredentialType {
  name = 'whinApi';

  displayName = 'Whin API';

  properties: INodeProperties[] = [
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


