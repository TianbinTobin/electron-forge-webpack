import Store from 'electron-store';

import schema from './schema';

// const encryptionKey = 'BOARD_MIX_CONFIG';

const setting = new Store({ schema, clearInvalidConfig: true });

export default setting;
