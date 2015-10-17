// TODO remove jQuery dependency
import $ from 'jquery';
import assign from 'lodash/object/assign';

class MessageController {
  constructor(messagingConnector) {
    // used to identify the source type of a message; messages will be ignored by a receiver with the same name
    const senderName = messagingConnector.getName();
    // add timestamp to prevent multiple id faults
    const requestIdSuffix = senderName + +new Date();
    let id = 0;
    const eventHub = $({});
    const requestHub = $({});
    const pendingSentRequests = {};
    const connector = messagingConnector;

    if (!senderName) {
      throw new Error('No messaging sender name specified. Should be set via `requirejs.config({ messaging: { senderName: \'name\' } });` or similar');
    }

    function createNewRequestId() {
      id++;
      return id + requestIdSuffix;
    }

    connector.onMessage(function(message) {
      if (!message) {
        throw new Error('Empty message');
      }

      let request;
      if (message.request) {
        request = message.request;
        const responseDeferred = new $.Deferred();

        responseDeferred.done(function(responseData) {
          connector.postMessage({
            sender: senderName,
            response: {
              forRequest: request.id,
              data: responseData,
            },
          });
        });

        requestHub.trigger(request.type, {
          type: request.type,
          data: request.data,
          respond: responseDeferred.resolve,
        });
      } else if (message.response) {
        const pendingRequest = pendingSentRequests[message.response.forRequest];
        if (!pendingRequest) return;

        pendingRequest.resolve(message.response.data);
      } else if (message.event) {
        eventHub.trigger(message.event.type, [message.event.data]);
      } else {
        throw new Error('Unknown message type');
      }
    });

    function wrapEventMethod(method, context) {
      return function() {
        method.apply(context, arguments);
        return this;
      };
    }

    // send a message, expecting an async response
    this.request = function(type, data, options = {}) {
      options.timeout = options.timeout || 5000;
      const req = {
        pending: true,
      };

      req.promise = new Promise((resolve, reject) => {
        req.resolve = result => {
          resolve(result);
          req.pending = false;
        };

        req.reject = result => {
          reject(result);
          req.pending = false;
        };
      });

      const requestId = createNewRequestId();

      pendingSentRequests[requestId] = req;

      connector.postMessage({
        sender: senderName,
        request: {
          id: requestId,
          type: type,
          data: data,
        },
      });

      setTimeout(function() {
        // need to ensure still pending so console log is applied appropriately
        if (req.pending) {
          const error = new Error('Internal message request timeout.');
          assign(error, {
            type: type,
            data: data,
            options: options,
            timeout: options.timeout,
          });

          req.reject(error);
        }
      }, options.timeout);

      return req.promise;
    };

    // send one-way message
    this.trigger = function(type, data) {
      connector.postMessage({
        sender: senderName,
        event: {
          type: type,
          data: data,
        },
      });
      return this;
    };

    // listen to triggered messages/events
    this.on = wrapEventMethod(eventHub.on, eventHub);
    this.off = wrapEventMethod(eventHub.off, eventHub);
    this.one = wrapEventMethod(eventHub.one, eventHub);

    // add a handler for a request type
    this.handleRequest = function(type, handler) {
      requestHub.on(type, function(e, request) {
        handler(request.data, request.respond);
      });
      return this;
    };
  }
}

export default MessageController;
