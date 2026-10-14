/** Khung điều hướng — gói WBS 2.1. */

export { AppHeader } from './AppHeader';
export { BackLink } from './BackLink';
export type { BackLinkProps } from './BackLink';
export { BottomTabBar } from './BottomTabBar';
export { DisclaimerBar } from './DisclaimerBar';
/* Ô trống ở góc phải thanh trên — màn Danh mục đặt icon Tìm kiếm (và ô tìm khi mở) vào đây. */
export { HEADER_ACTIONS_ID } from './HeaderControls';
export type { DisclaimerBarProps } from './DisclaimerBar';
export { HeaderNav } from './HeaderNav';
export { LangSwitch } from './LangSwitch';
export { ModeToggle } from './ModeToggle';
export { OfflineBanner } from './OfflineBanner';
/* Hai hình cho cùng một tuỳ chọn: icon gọn cho thanh trên, hai ô có chữ cho màn Cài đặt. */
export { ThemePicker } from './ThemePicker';
export { ThemeSwitch } from './ThemeSwitch';
/* Phần "quay về đâu" của `BackLink`, tách ra để nút "Huỷ" cuối màn chi tiết dùng chung. */
export { useBackTarget } from './useBackTarget';
export type { BackTarget } from './useBackTarget';
