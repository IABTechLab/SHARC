class SHARCProtocol {
  constructor() {
    this.sessionId = '';
    this.nextMessageId = 1;
    this.listeners = {};
    this.messageTarget = window.parent;
    this.resolutionListeners = {};
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }

  sendMessage(messageType, messageArgs) {
    const messageId = this.nextMessageId++;
    const getMessageType = messageType === ProtocolMessages.CREATE_SESSION ? messageType : `SHARC:${messageType}`;
    const message = {
      sessionId: this.sessionId,
      messageId: messageId,
      type: getMessageType,
      timestamp: Date.now(),
      args: messageArgs,
    };

    console.log('MESSAGE: ', message);
    if (MessagesThatRequireResponse.includes(messageType)) {
      return new Promise((resolve, reject) => {
        this.addResolveAndRejectListeners(
          messageId,
          resolve,
          reject
        );
        this.messageTarget.postMessage(JSON.stringify(message), '*');
      });
    }
    return new Promise((resolve, reject) => {
      this.messageTarget.postMessage(JSON.stringify(message), '*');
      resolve();
    });
  }

  addListener(messageType, callback) {
    if (!this.listeners[messageType]) {
      this.listeners[messageType] = [callback];
    } else {
      this.listeners[messageType].push(callback);
    }
  }

  callListenersByType(type, data) {
    const listeners = this.listeners[type];

    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  receiveMessage(event) {
    if (!event || !event.data) return;

    const data = JSON.parse(event.data);

    if (!data) return;

    const sessionId = data['sessionId'];
    const type = data['type'];
    const isSessionCreation = this.sessionId === '' && type === ProtocolMessages.CREATE_SESSION;
    const hasSessionMatch = this.sessionId === sessionId;
    const isValidSessionId = isSessionCreation || hasSessionMatch;

    if (!isValidSessionId || type === null) return;

    if (Object.values(ProtocolMessages).includes(type)) {
      this.handleProtocolMessages(data);
    } else if (type.startsWith('SHARC:')) {
      this.callListenersByType(type.substr(6), data);
    }
  }

  handleProtocolMessages(data) {
    const type = data['type'];

    switch (type) {
      case ProtocolMessages.CREATE_SESSION:
        this.sessionId = data['sessionId'];
        this.handleIncomingMessage(data, {}, ProtocolMessages.RESOLVE);
        this.callListenersByType(type, data);
        break;
      case ProtocolMessages.RESOLVE:
      // TDB
      case ProtocolMessages.REJECT:
        const args = data['args'];
        const argMessageId = args['messageId'];
        const resolutionListener = this.resolutionListeners[argMessageId];
        if (resolutionListener) {
          resolutionListener(data);
          delete this.resolutionListeners[argMessageId];
        }
        break
    }
  }

  resolve(incomingMessage, outgoingArgs) {
    const messageId = this.nextMessageId++;
    const resolveMessageArgs = {
      messageId: incomingMessage['messageId'],
      value: outgoingArgs,
    };
    const message = {
      sessionId: this.sessionId,
      messageId: messageId,
      type: ProtocolMessages.RESOLVE,
      timestamp: Date.now(),
      args: resolveMessageArgs,
    };

    this.messageTarget.postMessage(JSON.stringify(message), '*');
  }

  createSession() {
    this._generateSessionId();
    const createdSessionResolved = () => { console.log('Session created') };
    const createdSessionRejected = () => { console.log('Session creation has failed ') };

    this.sendMessage(ProtocolMessages.CREATE_SESSION).then(
      createdSessionResolved,
      createdSessionRejected,
    );
  }

  addResolveAndRejectListeners(messageId, resolve, reject) {
    const listener = (data) => {
      const type = data['type'];
      const args = data['args']['value'];
      if (type === 'resolve') {
        resolve(args);
      } else if (type === 'reject') {
        reject(args);
      }
    };

    this.resolutionListeners[messageId] = listener.bind(this);
  }

  handleIncomingMessage(incomingMessage, args, protocolMessage) {
    const messageId = this.nextMessageId++;
    const message = {
      sessionId: this.sessionId,
      messageId: messageId,
      type: protocolMessage,
      timestamp: Date.now(),
      args: {
        messageId: incomingMessage['messageId'],
        value: args,
      }
    };

    this.messageTarget.postMessage(JSON.stringify(message), '*');
  }

  reset() {
    this.listeners = {};
    this.sessionId = '';
    this.nextMessageId = 1;
    this.resolutionListeners = {};
  }

  _generateSessionId() {
    const url = URL.createObjectURL(new Blob());
    const [id] = url.toString().split('/').reverse();
    URL.revokeObjectURL(url);
    this.sessionId = id;
  }

  setMessageTarget(target) {
    this.messageTarget = target;
  }
}

ProtocolMessages = {
  CREATE_SESSION: 'createSession',
  RESOLVE: 'resolve',
  REJECT: 'reject',
};

ContainerMessages = {
  INIT: 'Container:init',
  START_CREATIVE: 'Container:startCreative',
  STATE_CHANGE: 'Container:stateChange',
  PLACEMENT_CHANGE: 'Container:placementChange',
  LOG: 'Container:log',
  FATAL_ERROR: 'Container:fatalError',
  CLOSE: 'Container:close',
};

CreativeMessages = {
  FATAL_ERROR: 'Creative:fatalError',
  GET_CONTAINER_STATE: 'Creative:getContainerState',
  GET_PLACEMENT_OPTIONS: 'Creative:getPlacementOptions',
  LOG: 'Creative:log',
  REPORT_INTERACTION: 'Creative:reportInteraction',
  REQUEST_NAVIGATION: 'Creative:requestNavigation',
  REQUEST_PLACEMENT_CHANGE: 'Creative:requestPlacementChange',
  REQUEST_CLOSE: 'Creative:requestClose',
};

MessagesThatRequireResponse = [
  ContainerMessages.INIT,
  ContainerMessages.START_CREATIVE,
  ContainerMessages.FATAL_ERROR,
  ContainerMessages.CLOSE,
  CreativeMessages.GET_CONTAINER_STATE,
  CreativeMessages.GET_PLACEMENT_OPTIONS,
  CreativeMessages.REPORT_INTERACTION,
  CreativeMessages.REQUEST_PLACEMENT_CHANGE,
  CreativeMessages.REQUEST_CLOSE,
];

ContainerStates = {
  READY: 'ready',
  ACTIVE: 'active',
  PASSIVE: 'passive',
  HIDDEN: 'hidden',
  FROZEN: 'frozen',
  CLOSING: 'closing',
  UNLOADED: 'unloaded',
};

CreativeErrorCodes = {
  UNSPECIFIED: 2100,
  CANNOT_LOAD_RESOURCES: 2101,
  NOT_SUITED_CREATIVE_DIMENSIONS: 2102,
  WRONG_SHARC_VERSION: 2103,
  CANNOT_EXECUTE_CREATIVE: 2104,
  RESIZE_REQUEST_NOT_HONORED: 2105,
  PAUSE: 2106,
  PLAYER_CONTROLS: 2107,
  AD_INTERNAL_ERROR: 2108,
  DEVICE_NOT_SUPPORTED: 2109,
  CONTAINER_NOT_SENDING: 2110,
  CONTAINER_NOT_RESPONDING: 2111,
  UNSPECIFIED_CONTAINER_ERROR: 2222,
  UNDEFINED: 2210,
};
