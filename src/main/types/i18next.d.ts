import 'i18next';
import type resources from './resources';
import type { defaultNS } from '../locales';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources;
  }
}
