import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestPersistentStorage } from './persistent-storage';

/** Gắn một `navigator.storage` giả lên `globalThis.navigator` (môi trường node không có). */
function ganKho(kho: Partial<StorageManager> | undefined): void {
  vi.stubGlobal('navigator', kho === undefined ? {} : { storage: kho });
}

/** Chờ chuỗi `then` của hàm chạy hết — hàm không trả promise, cố ý. */
async function choXong(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestPersistentStorage — xin trình duyệt giữ kho lâu dài', () => {
  it('chưa được giữ thì xin', async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    ganKho({ persisted: () => Promise.resolve(false), persist });

    requestPersistentStorage();
    await choXong();

    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('đã được giữ thì KHÔNG xin lại — Firefox sẽ hỏi người dùng thêm một lần vô cớ', async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    ganKho({ persisted: () => Promise.resolve(true), persist });

    requestPersistentStorage();
    await choXong();

    expect(persist).not.toHaveBeenCalled();
  });

  it('trình duyệt không có API thì im lặng bỏ qua', () => {
    ganKho(undefined);
    expect(() => requestPersistentStorage()).not.toThrow();
  });

  it('trình duyệt từ chối hay lỗi thì không ném, không để lọt promise bị từ chối', async () => {
    const loiLot = vi.fn();
    process.on('unhandledRejection', loiLot);
    try {
      ganKho({
        persisted: () => Promise.resolve(false),
        persist: () => Promise.reject(new Error('bị chặn')),
      });
      expect(() => requestPersistentStorage()).not.toThrow();
      await choXong();
      await choXong();
      expect(loiLot).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', loiLot);
    }
  });
});
