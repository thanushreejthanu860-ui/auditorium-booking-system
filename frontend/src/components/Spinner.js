export default function Spinner({ full }) {
  if (full) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return <div className="spinner" />;
}
