import type { Schema } from 'electron-store';

interface SettingSchema {
  userId: number;
  language: string;
  serverUrl: string;
  enableVulkan: boolean;
  disableHardwareAcceleration: boolean;
}

const schema: Schema<SettingSchema> = {
  userId: {
    type: 'number',
  },
  language: {
    type: 'string',
  },
  serverUrl: {
    type: 'string',
    format: 'uri',
  },
  enableVulkan: {
    type: 'boolean',
    default: false,
  },
  disableHardwareAcceleration: {
    type: 'boolean',
    default: false,
  },
};

export default schema;
