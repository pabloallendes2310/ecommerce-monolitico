import { categories } from '../data/mockProducts'
import './CategoryFilter.css'

function CategoryFilter({ selectedCategory, onChange }) {
  return (
    <div className="category-filter" aria-label="Filtro por categoria">
      <button
        className={selectedCategory === 'Todas' ? 'is-active' : ''}
        type="button"
        onClick={() => onChange('Todas')}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          className={selectedCategory === category ? 'is-active' : ''}
          key={category}
          type="button"
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
