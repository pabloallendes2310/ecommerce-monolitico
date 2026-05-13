import { useNavigate } from 'react-router-dom'

import './SearchBar.css'

function SearchBar({ value = '', onChange, compact = false }) {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (compact) {
      const query = event.currentTarget.elements.search.value.trim()
      navigate(query ? `/catalogo?buscar=${encodeURIComponent(query)}` : '/catalogo')
    }
  }

  return (
    <form className={`search-bar ${compact ? 'search-bar--compact' : ''}`} onSubmit={handleSubmit}>
      <input
        name="search"
        type="search"
        placeholder="Buscar productos, marcas o categorias"
        value={compact ? undefined : value}
        onChange={compact ? undefined : (event) => onChange(event.target.value)}
      />
      <button type="submit">Buscar</button>
    </form>
  )
}

export default SearchBar
