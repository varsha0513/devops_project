export default function CategoryBadge({ category }) {
  const norm = (category || 'Other').toLowerCase().replace(/[^a-z0-9]/g, '-');
  return (
    <span className={`category-tag cat-${norm}`}>
      {category || 'Other'}
    </span>
  );
}
