/**
 * Tầng APPLICATION — cửa duy nhất để tầng giao diện chạm vào Domain (CON-03).
 *
 * src/app và src/ui bị ESLint chặn không cho import thẳng @/core hay @/data.
 * Muốn dùng gì ở Domain thì mở cửa ra đây.
 */

export type {
  CalcOutput,
  CalcWarning,
  Level,
  MarketConstant,
  VariableSpec,
  WarningCode,
} from '@/core/types';

export { clampToSpec, fail, inherited, isCalculated, ok } from '@/core/calc-output';
