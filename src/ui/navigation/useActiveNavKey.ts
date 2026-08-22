'use client';

import { usePathname } from 'next/navigation';

import { activeRouteKey } from '@/application';
import type { NavKey } from '@/application';

/**
 * Mục nav đang chọn ứng với đường dẫn hiện tại — dùng chung cho `BottomTabBar` và `HeaderNav`
 * để hai thanh luôn sáng cùng một mục, không lệch nhau vì mỗi nơi tự gọi `activeRouteKey()`.
 */
export function useActiveNavKey(): NavKey | null {
  return activeRouteKey(usePathname());
}
