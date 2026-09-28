export function runSliced(task: Generator<void, unknown, void>, budget: number, cancelled: () => boolean, done: () => void) {
  const channel = new MessageChannel();
  const step = () => {
    if (cancelled()) { channel.port1.close(); return; }
    const end = performance.now() + budget;
    for (;;) {
      if (task.next().done) { channel.port1.close(); done(); return; }
      if (performance.now() >= end) break;
    }
    channel.port2.postMessage(0);
  };
  channel.port1.onmessage = step;
  setTimeout(() => channel.port2.postMessage(0), 0);
}
