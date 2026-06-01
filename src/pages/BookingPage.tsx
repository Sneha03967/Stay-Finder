import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Property } from "../types";
import { Calendar, DollarSign, CheckCircle, AlertOctagon, Loader2, Landmark, Compass } from "lucide-react";

export default function BookingPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Form selections
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [daysCount, setDaysCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  useEffect(() => {
    async function loadPropertyDetails() {
      try {
        setLoading(true);
        const response = await api.get<Property>(`/properties/${propertyId}`);
        setProperty(response.data);
      } catch (err: any) {
        console.error("Booking load property crash: ", err);
        setBookingError("Could not retrieve property pricing configurations.");
      } finally {
        setLoading(false);
      }
    }
    if (propertyId) {
      loadPropertyDetails();
    }
  }, [propertyId]);

  // Recalculate price when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      if (outDate > inDate) {
        const diffTime = outDate.getTime() - inDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysCount(diffDays);
      } else {
        setDaysCount(0);
      }
    } else {
      setDaysCount(0);
    }
  }, [checkIn, checkOut]);

  const handleSubmitBooking = async (e: any) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setBookingError("Please pick both entry is check-in and check-out dates.");
      return;
    }

    if (daysCount <= 0) {
      setBookingError("Check-out date must succeed check-in date.");
      return;
    }

    try {
      setSubmitting(true);
      setBookingError(null);

      const response = await api.post("/bookings", {
        propertyId,
        checkIn,
        checkOut,
      });

      setSuccessBooking(response.data);
    } catch (err: any) {
      console.error("Booking post error:", err);
      const message = err.response?.data?.message || "Booking reservation failed. Select another date slot.";
      setBookingError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="state-container loading-state content-height-center">
        <Loader2 className="spinner-icon animate-spin" size={36} />
        <p>Configuring secure booking slots...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container center-state-page">
        <div className="center-state-card error-card">
          <AlertOctagon size={48} className="error-icon" />
          <h2>Booking Failed</h2>
          <p>The specified property for booking does not exist.</p>
          <button onClick={() => navigate("/")} className="btn-secondary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Get current date string for input validator minima
  const todayStr = new Date().toISOString().split("T")[0];

  // Render check success layout
  if (successBooking) {
    return (
      <div className="booking-success-layout container" id="booking-success-view">
        <div className="success-receipt-card">
          <div className="receipt-header">
            <div className="checkmark-circle">
              <CheckCircle size={40} />
            </div>
            <h1>Booking Confirmed!</h1>
            <p className="order-number">Confirmation ID: {successBooking._id}</p>
          </div>

          <div className="receipt-body">
            <div className="receipt-section-title">Reservation Details</div>
            
            <div className="receipt-property-row">
              <h3>{property.title}</h3>
              <p className="property-loc">{property.location}</p>
            </div>

            <div className="receipt-grid">
              <div className="receipt-grid-cell">
                <span className="cell-label">Check-in</span>
                <span className="cell-value">{new Date(checkIn).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="receipt-grid-cell">
                <span className="cell-label">Check-out</span>
                <span className="cell-value">{new Date(checkOut).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            <div className="receipt-price-summary">
              <div className="price-calc-row">
                <span>${property.price} × {daysCount} nights</span>
                <span>${daysCount * property.price}</span>
              </div>
              <div className="price-calc-row vat-row">
                <span>Service fees & taxes</span>
                <span>Included (Free)</span>
              </div>
              <div className="price-total-row">
                <span>Total Amount paid</span>
                <span>${successBooking.totalPrice || (daysCount * property.price)}</span>
              </div>
            </div>
          </div>

          <div className="receipt-actions">
            <button onClick={() => navigate("/dashboard")} className="receipt-btn-dashboard">
              Go to My Dashboard
            </button>
            <button onClick={() => navigate("/")} className="receipt-btn-home">
              Keep Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  const basePriceMultiplier = daysCount * property.price;

  return (
    <div className="booking-page-layout container" id="booking-editor-container">
      <div className="booking-columns-holder">
        
        {/* Left Form column */}
        <div className="booking-form-panel">
          <h2 className="booking-flow-heading">Request to Book</h2>
          
          {bookingError ? (
            <div className="booking-error-panel">
              <AlertOctagon size={18} />
              <span>{bookingError}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmitBooking} className="booking-dates-form">
            <div className="form-sub-flex column-flex-mobile">
              
              <div className="form-field-group flex-1 pt-1 pr-1">
                <label htmlFor="booking-check-in" className="form-label font-bold">
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="booking-check-in"
                  className="form-input"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group flex-1 pt-1 pl-1">
                <label htmlFor="booking-check-out" className="form-label font-bold">
                  Check-out Date
                </label>
                <input
                  type="date"
                  id="booking-check-out"
                  className="form-input"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

            </div>

            <div className="booking-guarantees-strip">
              <div className="guarantee-item">
                <Landmark size={18} />
                <div>
                  <h5>Flexible Cover Policy</h5>
                  <p>Free cancellation up to 24h prior check-in slot.</p>
                </div>
              </div>
            </div>

            <button type="submit" className="confirm-booking-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Reservation...</span>
                </>
              ) : (
                <span>Confirm & Reserve</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Sidebar specs card */}
        <div className="booking-specs-panel">
          <div className="booking-preview-card">
            <h4 className="preview-card-title">Stay details</h4>
            <div className="preview-listing-strip">
              <div>
                <h5>{property.title}</h5>
                <p className="listing-type">{property.propertyType.toUpperCase()} • {property.location}</p>
              </div>
            </div>

            <hr className="preview-divider" />

            <h4 className="preview-card-title pt-1">Price Details</h4>
            
            {daysCount > 0 ? (
              <div className="pricing-ledgers">
                <div className="ledger-row">
                  <span>${property.price} × {daysCount} nights</span>
                  <span>${basePriceMultiplier}</span>
                </div>
                <div className="ledger-row total-row-final">
                  <span>Total (USD)</span>
                  <span className="total-span-bold">${basePriceMultiplier}</span>
                </div>
              </div>
            ) : (
              <div className="pricing-lead-notice">
                <p>Select check-in and check-out dates to generate the price calculation breakdown.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
