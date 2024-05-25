import { Category, CATEGORIES } from "@/lib/utils"
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multiple-selector"

export function CategoriesSelect({
  categories,
  setCategories,
}: {
  categories: Category[]
  setCategories: (categories: Category[]) => void
}) {
  return (
    <MultiSelector
      values={categories}
      onValuesChange={setCategories as any}
      loop
    >
      <MultiSelectorTrigger>
        <MultiSelectorInput placeholder="Select categories..." />
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList>
          {CATEGORIES.map((category) => (
            <MultiSelectorItem value={category} key={category}>
              {category}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  )
}
