interface Props {
  icon: string;
  value: number | string;
}

export function CurrencyDisplay({ icon, value }: Props) {
  return (
    <span className="currency">
      <span>{icon}</span>
      <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </span>
  );
}
