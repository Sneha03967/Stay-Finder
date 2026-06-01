import { Link } from "react-router-dom";
import { Property } from "../types";
import { MapPin, DollarSign, Home } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Map beautiful placeholder images depending on the property type
  const typePlaceholders: Record<string, string> = {
    apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    house: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=600&q=80",
    villa: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    room: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
  };

  const hasUploadedImages = property.images && property.images.length > 0;
  
  const propertyTypeSafe = property.propertyType || "apartment";
  
  // Construct the URL. Note that uploads is mapped to /uploads path on the server.
  const imageUrl = hasUploadedImages
    ? `/uploads/${property.images[0]}`
    : (typePlaceholders[propertyTypeSafe] || typePlaceholders.apartment);

  return (
    <div className="property-card" id={`property-card-${property._id}`}>
      <div className="card-image-wrapper">
        <img
          src={imageUrl}
          alt={property.title}
          className="card-image"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback if uploading local file loading fails
            (e.target as HTMLImageElement).src = typePlaceholders[propertyTypeSafe] || typePlaceholders.apartment;
          }}
        />
        <div className="card-type-badge">
          {propertyTypeSafe.charAt(0).toUpperCase() + propertyTypeSafe.slice(1)}
        </div>
      </div>

      <div className="card-info">
        <h3 className="card-title" title={property.title}>
          {property.title}
        </h3>
        
        <div className="card-location">
          <MapPin size={14} className="info-icon" />
          <span>{property.location}</span>
        </div>

        <div className="card-bottom">
          <div className="card-price">
            <span className="price-bold">${property.price}</span>
            <span className="price-label"> / night</span>
          </div>
          <Link to={`/properties/${property._id}`} className="card-view-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
