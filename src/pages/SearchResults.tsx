import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import { Property } from "../types";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import { Loader2, Compass, HelpCircle } from "lucide-react";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState<string | null>(null);

  // Parse current query values from URL
  const location = searchParams.get("location") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const propertyType = searchParams.get("propertyType") || "all";

  useEffect(() => {
    async function loadFilteredProperties() {
      try {
        setLoading(true);
        setErrorVisible(null);

        // Build request parameters matching query
        const params: Record<string, string> = {};
        if (location) params.location = location;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (propertyType) params.propertyType = propertyType;

        const response = await api.get<Property[]>("/properties", { params });
        setProperties(response.data);
      } catch (err: any) {
        console.error("Filter search crash:", err);
        setErrorVisible("Search query failed. Please adjust filters.");
      } finally {
        setLoading(false);
      }
    }

    loadFilteredProperties();
  }, [location, minPrice, maxPrice, propertyType]);

  const handleSearchSubmit = (filters: {
    location: string;
    minPrice: string;
    maxPrice: string;
    propertyType: string;
  }) => {
    const query: Record<string, string> = {};
    if (filters.location) query.location = filters.location;
    if (filters.minPrice) query.minPrice = filters.minPrice;
    if (filters.maxPrice) query.maxPrice = filters.maxPrice;
    if (filters.propertyType) query.propertyType = filters.propertyType;

    setSearchParams(query);
  };

  return (
    <div className="search-results-page-container container" id="search-results-container">
      {/* Top Embedded Search Context */}
      <div className="search-page-filter-header">
        <h2 className="search-criteria-heading">Search Results</h2>
        <p className="search-criteria-subheading">Update matching choices using filters below:</p>
        <div className="search-bar-inline-wrapper">
          <SearchBar
            onSearch={handleSearchSubmit}
            initialFilters={{ location, minPrice, maxPrice, propertyType }}
          />
        </div>
      </div>

      {/* Results grid rendering */}
      <div className="search-page-body">
        {loading ? (
          <div className="state-container loading-state">
            <Loader2 className="spinner-icon animate-spin" size={36} />
            <p>Filtering destinations matching your criteria...</p>
          </div>
        ) : errorVisible ? (
          <div className="state-container error-state">
            <HelpCircle size={32} className="error-icon" />
            <p>{errorVisible}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="state-container empty-state-detailed">
            <Compass size={48} className="empty-compass-icon" />
            <h3>No results matched your search</h3>
            <p>Try clearing some search inputs or increasing price caps to find active rooms.</p>
          </div>
        ) : (
          <div className="results-grid-box">
            <div className="results-stats-row">
              <span>Showing {properties.length} active spaces matching filters</span>
            </div>
            <div className="properties-grid" id="search-results-grid">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
