import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Property } from "../types";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const response = await api.get<Property[]>("/properties");
        setProperties(response.data);
      } catch (err: any) {
        console.error("Error loading listings:", err);
        setError("Failed to load property listings. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const handleSearchSubmit = (filters: {
    location: string;
    minPrice: string;
    maxPrice: string;
    propertyType: string;
  }) => {
    const query = new URLSearchParams();
    if (filters.location) query.append("location", filters.location);
    if (filters.minPrice) query.append("minPrice", filters.minPrice);
    if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
    if (filters.propertyType) query.append("propertyType", filters.propertyType);

    navigate(`/search?${query.toString()}`);
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section" id="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-heading">Find your perfect stay</h1>
          <p className="hero-subheading">
            Book unique apartments, luxury villas, or cozy rooms from host experts around the world.
          </p>
          <div className="hero-search-wrapper">
            <SearchBar onSearch={handleSearchSubmit} />
          </div>
        </div>
      </section>

      {/* Main Listings Section */}
      <section className="listings-section container" id="home-listings">
        <div className="section-header">
          <h2 className="section-title">Explore Stays</h2>
          <p className="section-subtitle">Discover popular and verified listings available right now</p>
        </div>

        {loading ? (
          <div className="state-container loading-state">
            <Loader2 className="spinner-icon animate-spin" size={32} />
            <p>Gathering standard listings...</p>
          </div>
        ) : error ? (
          <div className="state-container error-state">
            <AlertCircle size={32} className="error-icon" />
            <p>{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="state-container empty-state">
            <p className="empty-title">No listings available</p>
            <p className="empty-desc">Check back later or register to list your own place!</p>
          </div>
        ) : (
          <div className="properties-grid" id="all-listings-grid">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
