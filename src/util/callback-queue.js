// Used to create a queue of method calls to be processed at a later time (such
// as when additional resources have been loaded). Calls are enqueued via the `add`
// method and the queue is processed when `resolve` is called, given a processing function.
// The `add` method is context safe to export as a property on another object. The
// processing function is called with the same arguments as those passed to `add`.
class CallbackQueue {
  constructor() {
    this._q = [];
    this._processor = null;

    this.add = this._enqueue.bind(this);
  }

  resolve(func) {
    this._processor = func;
    this._processQueue();
  }

  _processQueue() {
    const processor = this._processor;
    if (!processor) return;

    let args = this._q.shift();
    while (args) {
      processor.apply(null, args);
      args = this._q.shift();
    }
  }

  _enqueue(...args) {
    this._q.push(args);
    // defer to ensure action is always async
    setTimeout(this._processQueue.bind(this), 0);
  }
}

export default CallbackQueue;
