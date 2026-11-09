import { catalog, categoryLabels, modelsIn } from '../simulations/catalog.ts';
import type { Category, LabRoute } from '../simulations/catalog.ts';
import { modelPath } from '../navigation.ts';

const categories = Object.keys(categoryLabels) as Category[];

export default function CatalogSelect({
  model,
  className = '',
}: {
  model: LabRoute;
  className?: string;
}) {
  return (
    <select
      className={`lab-quick-select ${className}`}
      aria-label="Chọn nội dung"
      value={model}
      onChange={(event) => {
        const next = event.target.value as LabRoute;
        if (Object.hasOwn(modelPath, next)) window.location.hash = modelPath[next];
      }}
    >
      {categories.map((category) => (
        <optgroup key={category} label={categoryLabels[category]}>
          {modelsIn(category).map((item) => (
            <option key={item} value={item}>
              {catalog[item].title}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
