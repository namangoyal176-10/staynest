export default function escapeRegex(string) {
  return typeof string === 'string'
    ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    : '';
}
