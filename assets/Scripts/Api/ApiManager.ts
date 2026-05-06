import * as ApiCore from './ApiCore';
import * as GameApi from './GameApi';

const ApiManager = {
  initialize: ApiCore.initSdk,
  isReady: ApiCore.isReady,
  getSdk: ApiCore.getSdk,
  destroy: ApiCore.destroySdk,
  GameApi
};

export default ApiManager;