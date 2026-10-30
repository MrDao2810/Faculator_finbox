import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

/**
 * `public/sw.js` — đường ĐIỀU HƯỚNG khi mất mạng và việc cắt kho (29/10/2026).
 *
 * File sw.js là mã worker thuần, không export gì, nên ca kiểm nạp nguyên văn nó vào một hàm với
 * `self`, `caches`, `fetch` giả rồi bắn sự kiện `fetch` vào bộ nghe nó đăng ký. `check:chrome` có bốn
 * ca ngoại tuyến nhưng chỉ phủ `/` và một trang chưa ghé; hai đường dưới đây (trang ĐÃ có trong kho
 * nhưng khoá khác) trước giờ chưa ai kiểm:
 *   · mất mạng, bấm sang một công thức đã có trong kho: Next xuất tĩnh không lấy được payload RSC nên
 *     tải CỨNG `…/index.txt`, kho không có khoá đó, worker chuyển hướng người dùng về danh sách;
 *   · mở `/cong-thuc/pe/?luu=pe-a` (phép tính đã lưu) lúc mất mạng: khoá có truy vấn không khớp.
 */

const ORIGIN = 'https://faculator.example';
const SW = readFileSync(join(process.cwd(), 'public', 'sw.js'), 'utf8');

interface Mục {
  url: string;
  body: string;
}

function dungWorker() {
  const kho = new Map<string, Map<string, Mục>>();
  const bo = (name: string): Map<string, Mục> => {
    let c = kho.get(name);
    if (c === undefined) {
      c = new Map();
      kho.set(name, c);
    }
    return c;
  };
  const khoa = (input: string | { url: string }, boTruyVan: boolean): string => {
    const url = new URL(typeof input === 'string' ? input : input.url, ORIGIN);
    if (boTruyVan) url.search = '';
    return url.href;
  };
  const caches = {
    async open(name: string) {
      const c = bo(name);
      return {
        async put(request: { url: string }, response: Response) {
          c.set(request.url, { url: request.url, body: await response.text() });
        },
        async add(url: string) {
          c.set(khoa(url, false), { url: khoa(url, false), body: 'khung' });
        },
        async keys() {
          return [...c.values()].map((m) => ({ url: m.url }));
        },
        async delete(request: { url: string }) {
          return c.delete(request.url);
        },
      };
    },
    async match(request: string | { url: string }, options?: { ignoreSearch?: boolean }) {
      const ignore = options?.ignoreSearch === true;
      const muon = khoa(request, ignore);
      for (const c of kho.values()) {
        for (const m of c.values()) {
          if (khoa(m.url, ignore) === muon) return new Response(m.body, { status: 200 });
        }
      }
      return undefined;
    },
    async keys() {
      return [...kho.keys()];
    },
    async delete(name: string) {
      return kho.delete(name);
    },
  };

  const bonghe = new Map<string, (event: unknown) => void>();
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, fn: (event: unknown) => void) => bonghe.set(type, fn),
    registration: {},
    clients: { claim: async () => undefined },
    skipWaiting: async () => undefined,
  };
  let mang = false;
  const fetchGia = async (request: { url: string }): Promise<Response> => {
    if (!mang) throw new TypeError('offline');
    return new Response(`html:${new URL(request.url).pathname}`, { status: 200 });
  };
  new Function('self', 'caches', 'fetch', SW)(self, caches, fetchGia);

  async function dieuHuong(url: string): Promise<Response> {
    const doiGhi: Array<Promise<unknown>> = [];
    let tra: Promise<Response> | undefined;
    const event = {
      request: { url: new URL(url, ORIGIN).href, method: 'GET', mode: 'navigate' },
      preloadResponse: Promise.resolve(undefined),
      respondWith: (p: Promise<Response>) => {
        tra = p;
      },
      waitUntil: (p: Promise<unknown>) => {
        doiGhi.push(p);
      },
    };
    bonghe.get('fetch')?.(event);
    if (tra === undefined) throw new Error('worker không respondWith');
    const response = await tra;
    await Promise.all(doiGhi);
    return response;
  }

  return {
    bo,
    dieuHuong,
    batMang: (on: boolean) => {
      mang = on;
    },
  };
}

describe('sw.js — mất mạng, trang đã có trong kho (29/10/2026)', () => {
  let w: ReturnType<typeof dungWorker>;
  beforeEach(() => {
    w = dungWorker();
    const cache = w.bo('ffb-v6');
    cache.set(`${ORIGIN}/cong-thuc/`, { url: `${ORIGIN}/cong-thuc/`, body: 'khung' });
    cache.set(`${ORIGIN}/cong-thuc/pe/`, { url: `${ORIGIN}/cong-thuc/pe/`, body: 'trang-pe' });
  });

  it('URL có truy vấn (?luu=…): trả thẳng HTML của trang, không về danh sách', async () => {
    const response = await w.dieuHuong('/cong-thuc/pe/?luu=pe-a');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('trang-pe');
  });

  it('tải cứng …/index.txt (Next không lấy được payload RSC): chuyển sang chính trang ấy', async () => {
    const response = await w.dieuHuong('/cong-thuc/pe/index.txt');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/cong-thuc/pe/`);
  });

  it('thiếu gạch chéo cuối: chuyển sang URL có gạch, giữ truy vấn', async () => {
    const response = await w.dieuHuong('/cong-thuc/pe?ma=FPT');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/cong-thuc/pe/?ma=FPT`);
  });

  it('trang CHƯA có trong kho thì vẫn về khung danh sách như trước', async () => {
    const response = await w.dieuHuong('/cong-thuc/roe/');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/cong-thuc/`);
  });
});

describe('sw.js — cắt kho giữ khung thật, không giữ mọi bản có đường dẫn /cong-thuc/', () => {
  it('kho đầy toàn bản /cong-thuc/?q=…: mục cũ nhất không được bảo vệ bị xoá, khung thật còn', async () => {
    const w = dungWorker();
    const cache = w.bo('ffb-v6');
    cache.set(`${ORIGIN}/cong-thuc/`, { url: `${ORIGIN}/cong-thuc/`, body: 'khung' });
    for (let i = 0; i < 159; i += 1) {
      const url = `${ORIGIN}/cong-thuc/?q=${String(i)}`;
      cache.set(url, { url, body: 'q' });
    }
    w.batMang(true);
    const response = await w.dieuHuong('/cong-thuc/pe/');
    expect(await response.text()).toBe('html:/cong-thuc/pe/');

    expect(cache.size).toBe(160);
    expect(cache.has(`${ORIGIN}/cong-thuc/`)).toBe(true);
    expect(cache.has(`${ORIGIN}/cong-thuc/pe/`)).toBe(true);
    expect(cache.has(`${ORIGIN}/cong-thuc/?q=0`)).toBe(false);
  });
});
