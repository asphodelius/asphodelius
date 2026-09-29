export function runSliced(task: Generator<void, unknown, void>, budget: number, cancelled: () => boolean, done: () => void) {
  const channel = new MessageChannel();
  let frameAt = 0;
  const finish = () => { channel.port1.close(); };
  const step = () => {
    if (cancelled()) { finish(); return; }
    const end = performance.now() + budget;
    for (;;) {
      if (task.next().done) { finish(); done(); return; }
      if (performance.now() >= end) break;
    }
    if (performance.now() - frameAt + budget < 14) channel.port2.postMessage(0);
    else requestAnimationFrame(frame);
  };
  const frame = () => {
    if (cancelled()) { finish(); return; }
    frameAt = performance.now();
    channel.port2.postMessage(0);
  };
  channel.port1.onmessage = step;
  requestAnimationFrame(frame);
}
