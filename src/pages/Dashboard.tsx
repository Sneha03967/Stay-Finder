import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { Booking, Property } from "../types";
import { Calendar, Home, ClipboardList, PenTool, Trash2, PlusCircle, Loader2, CheckCircle2, Ban, AlertCircle, ShoppingBag, Edit, Shield } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Tab: "bookings" or "listings"
  const [activeTab, setActiveTab] = useState<"bookings" | "listings">("bookings");
  
  // Bookings list states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Listings state
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  // Inline Property Edit Modal State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch bookings helper
  async function fetchMyBookings() {
    try {
      setBookingsLoading(true);
      setBookingsError(null);
      const res = await api.get<Booking[]>("/bookings/my");
      setBookings(res.data);
    } catch (err: any) {
      console.error("Fetch bookings error:", err);
      setBookingsError("Could not retrieve booking details. Please try again.");
    } finally {
      setBookingsLoading(false);
    }
  }

  // Fetch listings helper
  async function fetchMyListings() {
    try {
      setPropertiesLoading(true);
      setPropertiesError(null);
      const res = await api.get<Property[]>("/properties");
      
      // Filter listings belonging to current user
      if (user) {
        const ownersListings = res.data.filter((p) => {
          const ownerId = typeof p.owner === "object" && p.owner !== null ? p.owner._id : p.owner;
          return ownerId === user.id;
        });
        setProperties(ownersListings);
      }
    } catch (err: any) {
      console.error("Fetch properties listings crash:", err);
      setPropertiesError("Could not retrieve property listings.");
    } finally {
      setPropertiesLoading(false);
    }
  }

  // Load bookings on mount
  useEffect(() => {
    fetchMyBookings();
    if (user && (user.role === "host" || user.role === "admin")) {
      fetchMyListings();
    }
  }, [user]);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking reservation?")) {
      return;
    }

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      // Reload bookings list
      fetchMyBookings();
    } catch (err: any) {
      console.error("Cancel booking action crash:", err);
      alert(err.response?.data?.message || "Cancellation failed. Please try again.");
    }
  };

  // Handle listing deletion
  const handleDeletePropertyKey = async (propertyId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this property listing? This action is irreversible.")) {
      return;
    }

    try {
      await api.delete(`/properties/${propertyId}`);
      // Reload listings list
      fetchMyListings();
    } catch (err: any) {
      console.error("Delete property action crash:", err);
      alert(err.response?.data?.message || "Deletion failed. Please try again.");
    }
  };

  // Open inline editor
  const handleOpenEditProperty = (property: Property) => {
    setEditingProperty(property);
    setEditPrice(String(property.price));
    setEditAvailable(property.isAvailable);
    setEditError(null);
  };

  // Save inline edit
  const handleUpdatePropertyAction = async (e: any) => {
    e.preventDefault();
    if (!editingProperty) return;

    if (!editPrice || Number(editPrice) <= 0) {
      setEditError("Please set a valid pricing amount.");
      return;
    }

    try {
      setUpdating(true);
      setEditError(null);

      await api.put(`/properties/${editingProperty._id}`, {
        price: Number(editPrice),
        isAvailable: editAvailable,
      });

      setEditingProperty(null);
      // Reload listings
      fetchMyListings();
    } catch (err: any) {
      console.error("Action updater crash: ", err);
      setEditError(err.response?.data?.message || "Update details failed.");
    } finally {
      setUpdating(false);
    }
  };

  const imagesMap: Record<string, string> = {
    apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80",
    house: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=300&q=80",
    villa: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=300&q=80",
    room: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=300&q=80",
  };

  const isRoleAuthorized = user && (user.role === "host" || user.role === "admin");

  return (
    <div className="dashboard-page-container container" id="user-dashboard">
      
      {/* Dashboard Top Intro Bar */}
      <header className="dashboard-header">
        <div className="header-text-block">
          <h1>Member Dashboard</h1>
          <p>Manage reservations, check status badges, or edit host listings in real-time.</p>
        </div>
        <div className="user-profile-summary-badge">
          <div className="meta-avatar">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="meta-user">
            <h4>{user?.name || "User"}</h4>
            <p>{(user?.role || "GUEST").toUpperCase()} ACCOUNT</p>
          </div>
        </div>
      </header>

      {/* Navigation Subtabs row */}
      <div className="dashboard-tabs-row">
        <button
          className={`tab-btn ${activeTab === "bookings" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          <ClipboardList size={16} />
          <span>My Reservations</span>
        </button>
        {isRoleAuthorized ? (
          <button
            className={`tab-btn ${activeTab === "listings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("listings")}
          >
            <Home size={16} />
            <span>My Listed Properties</span>
          </button>
        ) : null}
      </div>

      <hr className="tab-divider" />

      {/* Tab Panels */}
      
      {/* Panel 1: Bookings */}
      {activeTab === "bookings" ? (
        <section className="dashboard-panel" id="panel-my-bookings">
          <div className="panel-header-strip">
            <h3>Active Reservations ({bookings.length})</h3>
            <p>Receipt summaries of your upcoming trips</p>
          </div>

          {bookingsLoading ? (
            <div className="panel-spinner-container">
              <Loader2 className="spinner-icon animate-spin" size={28} />
              <span>Updating booking list entries...</span>
            </div>
          ) : bookingsError ? (
            <div className="panel-error-container">
              <AlertCircle size={20} />
              <span>{bookingsError}</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="panel-empty-container">
              <ShoppingBag size={48} className="empty-icon-banner" />
              <h4>No reservation records found</h4>
              <p>You do not have any registered trips yet. Explore popular locations and make your first booking!</p>
              <Link to="/" className="explore-trigger-btn">Explore Stays</Link>
            </div>
          ) : (
            <div className="bookings-dashboard-list">
              {bookings.map((booking) => {
                const prop = booking.property;
                if (!prop) return null;

                const hasImages = prop.images && prop.images.length > 0;
                const imgSrc = hasImages ? `/uploads/${prop.images[0]}` : (imagesMap[prop._id] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80");

                const statusClass = `badge-status-${booking.status}`;
                return (
                  <div key={booking._id} className="dashboard-booking-strip">
                    <img
                      src={imgSrc}
                      alt={prop.title}
                      className="strip-img"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80";
                      }}
                    />
                    
                    <div className="strip-text-info">
                      <h4 className="strip-title">{prop.title}</h4>
                      <p className="strip-location">{prop.location}</p>
                      
                      <div className="trip-dates-row">
                        <Calendar size={14} className="trip-icon" />
                        <span>Days: {new Date(booking.checkIn).toLocaleDateString()} to {new Date(booking.checkOut).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="strip-pricing-meta">
                      <span className="strip-price-total">${booking.totalPrice}</span>
                      <span className="strip-price-descriptor">total paid</span>
                    </div>

                    <div className="strip-actions-badge">
                      <span className={`status-badge ${statusClass}`}>{booking.status.toUpperCase()}</span>
                      {booking.status === "confirmed" || booking.status === "pending" ? (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="cancel-trip-trigger-btn"
                          title="Cancel Trip"
                        >
                          Cancel Stay
                        </button>
                      ) : (
                        <span className="info-locked-desc">Stay cancelled</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* Panel 2: Listings */}
      {activeTab === "listings" && isRoleAuthorized ? (
        <section className="dashboard-panel" id="panel-my-listings">
          <div className="panel-header-strip flex-row-layout">
            <div>
              <h3>Your Property Listings ({properties.length})</h3>
              <p>Publish, remove, or change properties listed with your host profile</p>
            </div>
            <Link to="/add-property" className="publish-listing-btn">
              <PlusCircle size={16} />
              <span>Add New Property</span>
            </Link>
          </div>

          {propertiesLoading ? (
            <div className="panel-spinner-container">
              <Loader2 className="spinner-icon animate-spin" size={28} />
              <span>Retrieving listed properties...</span>
            </div>
          ) : propertiesError ? (
            <div className="panel-error-container">
              <AlertCircle size={20} />
              <span>{propertiesError}</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="panel-empty-container">
              <Home size={48} className="empty-icon-banner" />
              <h4>No active properties listed</h4>
              <p>You have not published any stays yet. Create your first listing to start hosting guests!</p>
              <Link to="/add-property" className="explore-trigger-btn">Publish a Listing</Link>
            </div>
          ) : (
            <div className="listings-dashboard-table">
              {properties.map((property) => {
                const hasImages = property.images && property.images.length > 0;
                
                // Fetch basic placeholder matching propertyType if images are not uploaded
                const fallbackImg = imagesMap[property.propertyType] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80";
                
                const imgSrc = hasImages ? `/uploads/${property.images[0]}` : fallbackImg;

                return (
                  <div key={property._id} className="dashboard-listing-strip">
                    <img
                      src={imgSrc}
                      alt={property.title}
                      className="strip-img"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImg;
                      }}
                    />

                    <div className="strip-text-info-wide">
                      <h4 className="strip-title">{property.title}</h4>
                      <p className="strip-location">{property.location}</p>
                      <p className="strip-type-badge">{property.propertyType.toUpperCase()}</p>
                    </div>

                    <div className="listing-attributes-col">
                      <span className="attr-bold">${property.price} / night</span>
                      <span className={`availability-indicator ${property.isAvailable ? "available" : "unavailable"}`}>
                        {property.isAvailable ? "● Available" : "○ Paused / Unavailable"}
                      </span>
                    </div>

                    <div className="strip-controls-col">
                      <button
                        onClick={() => handleOpenEditProperty(property)}
                        className="btn-control-edit"
                        title="Edit Availability or Price"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePropertyKey(property._id)}
                        className="btn-control-delete"
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* Property Inline Edit Dialog Modal */}
      {editingProperty ? (
        <div className="edit-modal-backdrop">
          <div className="edit-modal-card">
            <div className="modal-header">
              <h3>Quick Update Listing</h3>
              <p className="subtitle">{editingProperty.title}</p>
            </div>

            {editError ? (
              <div className="modal-error">
                <AlertCircle size={14} />
                <span>{editError}</span>
              </div>
            ) : null}

            <form onSubmit={handleUpdatePropertyAction}>
              <div className="modal-form-group">
                <label className="form-label" htmlFor="modal-edit-price">Price per night (USD)</label>
                <input
                  type="number"
                  id="modal-edit-price"
                  className="form-input"
                  min="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group-checkbox">
                <input
                  type="checkbox"
                  id="modal-edit-avail"
                  checked={editAvailable}
                  onChange={(e) => setEditAvailable(e.target.checked)}
                />
                <label htmlFor="modal-edit-avail" className="checkbox-label">
                  This listing is active and available for guest reservation bookings.
                </label>
              </div>

              <div className="modal-footer-row">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="btn-secondary"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={updating}>
                  {updating ? "Saving Changes..." : "Save Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

    </div>
  );
}
