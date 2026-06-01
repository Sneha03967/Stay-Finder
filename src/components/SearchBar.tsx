import { useState, FormEvent } from "react";
import { Search, MapPin, DollarSign, Home } from "lucide-react";

interface SearchFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function SearchBar({ onSearch, initialFilters }: SearchBarProps) {
  const [location, setLocation] = useState(initialFilters?.location || "");
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || "");
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || "all");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({
      location: location.trim(),
      minPrice,
      maxPrice,
      propertyType,
    });
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} id="main-search-bar">
      {/* 1. Location Input */}
      <div className="search-input-group">
        <label htmlFor="search-location" className="search-label">
          <MapPin size={14} />
          <span>Where</span>
        </label>
        <input
          type="text"
          id="search-location"
          className="search-input"
          placeholder="Search destinations..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="search-divider"></div>

      {/* 2. Min Price */}
      <div className="search-input-group">
        <label htmlFor="search-min-price" className="search-label">
          <DollarSign size={14} />
          <span>Min Price</span>
        </label>
        <input
          type="number"
          id="search-min-price"
          className="search-input"
          placeholder="No min"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </div>

      <div className="search-divider"></div>

      {/* 3. Max Price */}
      <div className="search-input-group">
        <label htmlFor="search-max-price" className="search-label">
          <DollarSign size={14} />
          <span>Max Price</span>
        </label>
        <input
          type="number"
          id="search-max-price"
          className="search-input"
          placeholder="No max"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      <div className="search-divider"></div>

      {/* 4. Property Type select */}
      <div className="search-input-group">
        <label htmlFor="search-type" className="search-label">
          <Home size={14} />
          <span>Type</span>
        </label>
        <select
          id="search-type"
          className="search-input search-select"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value="all">Any property type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="room">Room</option>
        </select>
      </div>

      {/* Search Button */}
      <button type="submit" className="search-submit-btn" aria-label="Perform search">
        <Search size={18} />
        <span className="search-btn-text">Search</span>
      </button>
    </form>
  );
}
