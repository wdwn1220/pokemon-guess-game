import { getTypeColor, getTypeKo } from '../utils/typeInfo';

interface TypeBadgeProps {
  type: string;
  small?: boolean;
}

export default function TypeBadge({ type, small = false }: TypeBadgeProps) {
  return (
    <span
      className={`type-badge${small ? ' type-badge-sm' : ''}`}
      style={{ backgroundColor: getTypeColor(type) }}
    >
      {getTypeKo(type)}
    </span>
  );
}
