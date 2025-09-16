export default function formatDate(input) {
  if (!input) return "";
  const d = new Date(input);
  return d.toLocaleDateString();
}
