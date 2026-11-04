const styles: Record<string, string> = {
  'Recently active': 'badge badge-green',
  Quiet: 'badge badge-amber',
  Dormant: 'badge badge-grey',
  Paused: 'badge badge-grey',
  Completed: 'badge badge-blue',
};

export default function ActivityBadge({ label }: { label: string }) {
  return <span className={styles[label] ?? 'badge'}>{label}</span>;
}
