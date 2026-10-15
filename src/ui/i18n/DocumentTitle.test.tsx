// @vitest-environment jsdom

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PreferencesProvider } from '@/application/preferences-context';

import { DocumentTitle } from './DocumentTitle';

/**
 * Lá `DocumentTitle` — tiêu đề tab theo ngôn ngữ (15/10/2026).
 *
 * Hai rủi ro thật: (1) tab vẫn tiếng Việt ở EN — lỗi đo được trên cả 17 màn trước bản vá; (2) Next đổ
 * metadata về SAU hydrate và dựng lại `<title>` tiếng Việt, đè lên lượt ghi đầu — đo được trên dev
 * server, nên lá phải canh chứ không ghi một lần. Ca thứ hai giả lập đúng lượt đè ấy.
 */

const TEN = { vi: 'Tỷ số P/E', en: 'Price to earnings ratio' };

beforeEach(() => {
  window.localStorage.clear();
  document.title = 'Tỷ số P/E · Faculator Finbox';
});

afterEach(cleanup);

describe('DocumentTitle', () => {
  it('người dùng VI: tab giữ đúng chữ của metadata', async () => {
    render(
      <PreferencesProvider>
        <DocumentTitle title={TEN} />
      </PreferencesProvider>,
    );
    await waitFor(() => {
      expect(document.title).toBe('Tỷ số P/E · Faculator Finbox');
    });
  });

  it('người dùng EN: tab sang tiếng Anh, và một lượt dựng lại <title> tiếng Việt bị ghi đè lại', async () => {
    window.localStorage.setItem('ffb.prefs.v1', JSON.stringify({ locale: 'en' }));
    render(
      <PreferencesProvider>
        <DocumentTitle title={TEN} />
      </PreferencesProvider>,
    );
    await waitFor(() => {
      expect(document.title).toBe('Price to earnings ratio · Faculator Finbox');
    });

    // Giả lập metadata của Next đổ về muộn: một thẻ <title> tiếng Việt mới thay thẻ cũ.
    for (const cu of document.querySelectorAll('title')) cu.remove();
    const moi = document.createElement('title');
    moi.textContent = 'Tỷ số P/E · Faculator Finbox';
    document.head.append(moi);

    await waitFor(() => {
      expect(document.title).toBe('Price to earnings ratio · Faculator Finbox');
    });
  });
});
