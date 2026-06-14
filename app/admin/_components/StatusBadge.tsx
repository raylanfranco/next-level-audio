import { statusColors } from '../_lib/constants';
import { useAdminTheme } from '../_context/AdminThemeProvider';

// Semantic status badge using the shared statusColors map (theme-aware).
export function StatusBadge({ status }: { status: string }) {
  const { theme } = useAdminTheme();
  const colors = statusColors[status];
  const cls = colors ? (theme === 'dark' ? colors.dark : colors.light) : '';
  return (
    <span className={`px-2.5 py-1 text-xs border font-heading uppercase tracking-wide ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
