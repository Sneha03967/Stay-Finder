import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Property } from "../types";
import { useAuth } from "../context/AuthContext";
import { MapPin, DollarSign, Calendar, Heart, ShieldAlert, Loader2, ArrowLeft, Home, Sparkles } from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState<string | null>(null);

  const typePlaceholders: Record<string, string> = {
    apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    house: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80",
    villa: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    room: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
  };

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setErrorVisible(null);
        const response = await api.get<Property>(`/properties/${id}`);
        setProperty(response.data);
      } catch (err: any) {
        console.error("Listing load crash: ", err);
        setErrorVisible("The requested property could not be loaded. Please ensure the URL is correct.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadDetails();
    }
  }, [id]);

  const handleBookRedirect = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/booking/${id}` } } });
    } else {
      navigate(`/booking/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="state-container loading-state content-height-center">
        <Loader2 className="spinner-icon animate-spin" size={36} />
        <p>Polishing listing details...</p>
      </div>
    );
  }

  if (errorVisible || !property) {
    return (
      <div className="container center-state-page">
        <div className="center-state-card error-card">
          <ShieldAlert size={48} className="error-icon" />
          <h2>Property Not Found</h2>
          <p>{errorVisible || "Listing profile is empty or corrupted."}</p>
          <button onClick={() => navigate("/")} className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Go Back Home</span>
          </button>
        </div>
      </div>
    );
  }

  const propertyTypeSafe = property.propertyType || "apartment";
  const typeLabel = propertyTypeSafe.charAt(0).toUpperCase() + propertyTypeSafe.slice(1);
  const displayImage = property.images && property.images.length > 0
    ? `/uploads/${property.images[0]}`
    : (typePlaceholders[propertyTypeSafe] || typePlaceholders.apartment);

  return (
    <div className="details-page-container container" id={`details-container-${property._id}`}>
      
      {/* Back navigation */}
      <button onClick={() => navigate(-1)} className="back-navigation-link" aria-label="Go back to previous page">
        <ArrowLeft size={16} />
        <span>Back to listings</span>
      </button>

      {/* Hero Header Area */}
      <div className="details-header">
        <h1 className="details-title">{property.title}</h1>
        <div className="details-meta-row">
          <div className="meta-item">
            <MapPin size={16} className="marker-icon" />
            <span className="location-txt">{property.location}</span>
          </div>
          <span className="dot-divider">•</span>
          <div className="meta-item">
            <Home size={16} className="generic-icon" />
            <span>Entire {typeLabel} hosted by {property.owner?.name || "Host Representative"}</span>
          </div>
        </div>
      </div>

      {/* Main Image Banner Grid */}
      <div className="details-image-grid">
        <div className="primary-image-frame">
          <img
            src={displayImage}
            alt={property.title}
            className="gallery-primary"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = typePlaceholders[propertyTypeSafe] || typePlaceholders.apartment;
            }}
          />
        </div>
        
        {/* If secondary images exist, show them; otherwise show beautiful accent details placeholders */}
        <div className="secondary-images-reel">
          {property.images && property.images.length > 1 ? (
            property.images.slice(1, 3).map((img, idx) => (
              <div key={idx} className="secondary-image-frame">
                <img
                  src={`/uploads/${img}`}
                  alt={`${property.title} gallery preview`}
                  className="gallery-secondary"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = typePlaceholders[propertyTypeSafe] || typePlaceholders.apartment;
                  }}
                />
              </div>
            ))
          ) : (
            <>
              <div className="secondary-image-frame placeholder-gallery-frame">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=70"
                  alt="Interior ambiance"
                  className="gallery-secondary"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="secondary-image-frame placeholder-gallery-frame">
                <img
                  src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=70"
                  alt="Kitchen decor details"
                  className="gallery-secondary"
                  referrerPolicy="no-referrer"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Layout split column */}
      <div className="details-content-split">
        
        {/* Left side: descriptions and amenities */}
        <div className="details-info-column">
          <div className="owner-bio-strip">
            <div className="owner-avatar">
              {(property.owner?.name || "H").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>Hosted by {property.owner?.name || "Independent Host"}</h3>
              <p className="host-seal">Verified StayFinder Partner Host</p>
            </div>
          </div>

          <div className="content-block">
            <h2 className="block-title">About this space</h2>
            <p className="block-text">
              {property.description || "This charming property is fully equipped with cozy amenities to make you feel right at home. Situated in a highly sought-after district with immediate access to points of interest, transportation nodes, and delicious restaurants."}
            </p>
          </div>

          {property.amenities && property.amenities.length > 0 ? (
            <div className="content-block">
              <h2 className="block-title">What this place offers</h2>
              <div className="amenities-tag-flex-grid">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="amenity-badge">
                    <Sparkles size={14} className="amenity-icon" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right side: persistent Sticky Booking action card */}
        <div className="details-booking-card-column">
          <div className="sticky-booking-trigger-card">
            <div className="card-header-price-row">
              <div className="booking-price">
                <span className="price-bold-huge">${property.price}</span>
                <span className="price-unit"> / night</span>
              </div>
            </div>

            <div className="booking-perk-item">
              <Sparkles size={16} className="perk-icon" />
              <div>
                <h4>Rare Find</h4>
                <p>This host's listings are typically booked up. Reserve early!</p>
              </div>
            </div>

            <button onClick={handleBookRedirect} className="direct-book-now-btn">
              Book Now
            </button>

            <span className="card-disclaimer">You won't be charged loaded amounts yet</span>
          </div>
        </div>

      </div>

    </div>
  );
}
