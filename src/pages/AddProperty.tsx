import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { Home, Upload, FileText, MapPin, DollarSign, List, Shield, Loader2, AlertCircle } from "lucide-react";

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("apartment");
  const [amenities, setAmenities] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Safeguard: verify that the user is actually a host or admin
  const isAuthorized = user && (user.role === "host" || user.role === "admin");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Let's cap uploads to 5 images
      setSelectedFiles(filesArray.slice(0, 5));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isAuthorized) {
      setErrorMsg("Unauthorized: Only registered hosts can post listings.");
      return;
    }

    if (!title || !location || !price || !propertyType) {
      setErrorMsg("Please fill in all of the required field fields.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("price", price);
      formData.append("propertyType", propertyType);
      formData.append("amenities", amenities.trim());

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await api.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Listing creation error:", err);
      const msg = err.response?.data?.message || "Failed to create listing. Please double check prices and images.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="container center-state-page">
        <div className="center-state-card error-card">
          <Shield size={48} className="error-icon" />
          <h2>Access Blocked</h2>
          <p>This section is reserved exclusively for Hosts. Please register or update your account role to Host to create listings.</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-form-container container" id="add-listings-container">
      <div className="form-card-wrapper">
        <div className="form-card-header">
          <div className="form-icon-circle">
            <Home size={24} />
          </div>
          <h1>List Your Property</h1>
          <p>Add details about your space to start receiving bookings from travelers worldwide.</p>
        </div>

        {errorMsg ? (
          <div className="form-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="property-creation-form" encType="multipart/form-data">
          
          <div className="form-grid-two-cols">
            
            {/* Title */}
            <div className="form-field-group">
              <label htmlFor="prop-title" className="form-label">
                <FileText size={14} className="label-icon" />
                <span>Property Title *</span>
              </label>
              <input
                type="text"
                id="prop-title"
                className="form-input"
                placeholder="e.g. Modern Minimalist Beach Loft"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                required
              />
            </div>

            {/* Type & Pricing */}
            <div className="form-sub-flex">
              <div className="form-field-group pr-1">
                <label htmlFor="prop-type" className="form-label">
                  <Home size={14} className="label-icon" />
                  <span>Property Type *</span>
                </label>
                <select
                  id="prop-type"
                  className="form-input form-select"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  required
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="room">Private Room</option>
                </select>
              </div>

              <div className="form-field-group pl-1">
                <label htmlFor="prop-price" className="form-label">
                  <DollarSign size={14} className="label-icon" />
                  <span>Price per Night (USD) *</span>
                </label>
                <input
                  type="number"
                  id="prop-price"
                  className="form-input"
                  placeholder="e.g. 120"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

          </div>

          {/* Location */}
          <div className="form-field-group">
            <label htmlFor="prop-location" className="form-label">
              <MapPin size={14} className="label-icon" />
              <span>Location / Area *</span>
            </label>
            <input
              type="text"
              id="prop-location"
              className="form-input"
              placeholder="e.g. Malibu, CA or Center City, Philadelphia"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-field-group">
            <label htmlFor="prop-desc" className="form-label">
              <FileText size={14} className="label-icon" />
              <span>Listing Description</span>
            </label>
            <textarea
              id="prop-desc"
              className="form-input form-textarea"
              placeholder="Provide an overview of your space, rooms, kitchen, and neighborhood perks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Amenities */}
          <div className="form-field-group">
            <label htmlFor="prop-amenities" className="form-label">
              <List size={14} className="label-icon" />
              <span>Amenities (comma-separated list)</span>
            </label>
            <input
              type="text"
              id="prop-amenities"
              className="form-input"
              placeholder="e.g. Wi-Fi, Pool, Air Conditioning, Kitchen, Beach Access"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
            />
            <p className="field-hint">Separate items with commas so they can be parsed neatly into filter tags.</p>
          </div>

          {/* File Uploads */}
          <div className="form-field-group">
            <label className="form-label">
              <Upload size={14} className="label-icon" />
              <span>Property Pictures (Max 5)</span>
            </label>
            <div className="custom-file-upload-zone">
              <input
                type="file"
                id="prop-images"
                className="hidden-file-input"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="prop-images" className="upload-trigger-label">
                <Upload size={28} className="upload-icon" />
                <span className="upload-prompt">Click to browse your device</span>
                <span className="upload-limits">Accepted extensions: jpg, jpeg, png, webp (Max 5MB each)</span>
              </label>
            </div>
            
            {/* Display names of queued files */}
            {selectedFiles.length > 0 ? (
              <div className="queued-files-box">
                <span className="queue-title">Selected files ({selectedFiles.length}):</span>
                <ul className="files-list">
                  {selectedFiles.map((f, idx) => (
                    <li key={idx} className="file-item">
                      {f.name} - {(f.size / (1024 * 1024)).toFixed(2)} MB
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="image-note-hint">
                Note: If no custom images are selected, StayFinder automatically generates beautiful high-res background matching cards.
              </p>
            )}
          </div>

          {/* Action triggers */}
          <div className="form-actions-row">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <span>Publish Listing</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
