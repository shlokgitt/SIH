import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Factory,
  Leaf,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { api } from "../utils/api";
import "./RegisterPage.css";

type Role = "plant" | "farmer";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  phone: string;
  address: string;
  lat: string;
  lng: string;

  plantName: string;
  licenseNumber: string;

  landAreaAcres: string;
  primaryCrop: string;
}

const initialForm: FormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "plant",
  phone: "",
  address: "",
  lat: "",
  lng: "",

  plantName: "",
  licenseNumber: "",

  landAreaAcres: "",
  primaryCrop: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));

        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);

        setError(
          "Unable to detect your location. Please enter the coordinates manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  function validateForm(): string | null {
    if (!form.name.trim()) {
      return "Please enter your full name.";
    }

    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    if (!form.email.includes("@")) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!form.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!form.address.trim()) {
      return "Please enter your address.";
    }

    if (form.role === "plant") {
      if (!form.plantName.trim()) {
        return "Please enter the plant name.";
      }

      if (!form.licenseNumber.trim()) {
        return "Please enter the plant license number.";
      }
    }

    if (form.role === "farmer") {
      if (!form.landAreaAcres.trim()) {
        return "Please enter your land area.";
      }

      const landArea = Number(form.landAreaAcres);

      if (!Number.isFinite(landArea) || landArea <= 0) {
        return "Please enter a valid land area.";
      }

      if (!form.primaryCrop.trim()) {
        return "Please enter your primary crop.";
      }
    }

    if (form.lat.trim() && !Number.isFinite(Number(form.lat))) {
      return "Latitude must be a valid number.";
    }

    if (form.lng.trim() && !Number.isFinite(Number(form.lng))) {
      return "Longitude must be a valid number.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim(),

        location: {
          address: form.address.trim(),

          ...(form.lat.trim()
            ? {
                lat: Number(form.lat),
              }
            : {}),

          ...(form.lng.trim()
            ? {
                lng: Number(form.lng),
              }
            : {}),
        },

        ...(form.role === "plant"
          ? {
              plantDetails: {
                plantName: form.plantName.trim(),
                licenseNumber: form.licenseNumber.trim(),
              },
            }
          : {}),

        ...(form.role === "farmer"
          ? {
              farmerDetails: {
                landAreaAcres: Number(form.landAreaAcres),
                primaryCrop: form.primaryCrop.trim(),
              },
            }
          : {}),
      };

      const response = await api.auth.register(payload);

      /*
       * Some backend implementations return a token
       * immediately after registration.
       *
       * If a token exists, save it.
       */
      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      if (response?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.user)
        );
      }

      setSuccess(true);

      setTimeout(() => {
        navigate(
          form.role === "plant"
            ? "/certification"
            : "/marketplace"
        );
      }, 1200);
    } catch (err) {
      console.error("Registration failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="register-page">
        <div className="register-shell register-success-shell">
          <div className="register-success-card">
            <div className="register-success-icon">
              <CheckCircle2 size={48} />
            </div>

            <span className="register-kicker">
              REGISTRATION COMPLETE
            </span>

            <h1>Welcome to AgriCore</h1>

            <p>
              Your account has been created successfully.
              Redirecting you now...
            </p>

            <div className="register-success-loader">
              <Loader2
                size={20}
                className="spin"
              />

              Preparing your account
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="register-page">
      <div className="register-shell">
        <header className="register-header">
          <Link
            to="/"
            className="register-back-button"
          >
            <ArrowRight size={20} className="rotate-180" />
          </Link>

          <div className="register-brand">
            <div className="register-brand-icon">
              <Leaf size={25} />
            </div>

            <div>
              <span className="register-kicker">
                AGRICORE ECOSYSTEM
              </span>

              <h1>Create Your Account</h1>

              <p>
                Join the secure biogas-to-agriculture supply
                network.
              </p>
            </div>
          </div>

          <div className="register-security">
            <ShieldCheck size={18} />

            <span>Secure Registration</span>
          </div>
        </header>

        <form
          className="register-card"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="register-error">
              <span className="register-error-icon">
                !
              </span>

              <div>
                <strong>Registration failed</strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          <section className="register-section">
            <div className="register-section-heading">
              <div className="register-section-icon">
                <UserRound size={20} />
              </div>

              <div>
                <h2>Choose Account Type</h2>

                <p>
                  Select how you will participate in
                  AgriCore.
                </p>
              </div>
            </div>

            <div className="role-grid">
              <button
                type="button"
                className={`role-card ${
                  form.role === "plant" ? "active" : ""
                }`}
                onClick={() =>
                  updateField("role", "plant")
                }
              >
                <div className="role-card-icon">
                  <Factory size={25} />
                </div>

                <div>
                  <strong>
                    Biogas Plant Operator
                  </strong>

                  <span>
                    Produce and certify agricultural
                    bio-fertilizer.
                  </span>
                </div>

                {form.role === "plant" && (
                  <CheckCircle2
                    className="role-selected"
                    size={22}
                  />
                )}
              </button>

              <button
                type="button"
                className={`role-card ${
                  form.role === "farmer" ? "active" : ""
                }`}
                onClick={() =>
                  updateField("role", "farmer")
                }
              >
                <div className="role-card-icon">
                  <Leaf size={25} />
                </div>

                <div>
                  <strong>Farmer</strong>

                  <span>
                    Source certified fertilizer for
                    your crops.
                  </span>
                </div>

                {form.role === "farmer" && (
                  <CheckCircle2
                    className="role-selected"
                    size={22}
                  />
                )}
              </button>
            </div>
          </section>

          <section className="register-section">
            <div className="register-section-heading">
              <div className="register-section-icon">
                <UserRound size={20} />
              </div>

              <div>
                <h2>Personal Information</h2>

                <p>
                  Enter the details associated with
                  your account.
                </p>
              </div>
            </div>

            <div className="register-grid two-columns">
              <div className="register-field">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="register-field full-width">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </div>
          </section>

          <section className="register-section">
            <div className="register-section-heading">
              <div className="register-section-icon">
                {form.role === "plant" ? (
                  <Factory size={20} />
                ) : (
                  <Leaf size={20} />
                )}
              </div>

              <div>
                <h2>
                  {form.role === "plant"
                    ? "Plant Information"
                    : "Farm Information"}
                </h2>

                <p>
                  {form.role === "plant"
                    ? "Provide the details of your biogas facility."
                    : "Provide the details of your agricultural operation."}
                </p>
              </div>
            </div>

            {form.role === "plant" ? (
              <div className="register-grid two-columns">
                <div className="register-field">
                  <label htmlFor="plantName">
                    Plant Name
                  </label>

                  <input
                    id="plantName"
                    type="text"
                    value={form.plantName}
                    onChange={(event) =>
                      updateField(
                        "plantName",
                        event.target.value
                      )
                    }
                    placeholder="e.g. GreenGas Central"
                    required
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="licenseNumber">
                    License Number
                  </label>

                  <input
                    id="licenseNumber"
                    type="text"
                    value={form.licenseNumber}
                    onChange={(event) =>
                      updateField(
                        "licenseNumber",
                        event.target.value
                      )
                    }
                    placeholder="Enter plant license number"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="register-grid two-columns">
                <div className="register-field">
                  <label htmlFor="landAreaAcres">
                    Land Area (acres)
                  </label>

                  <input
                    id="landAreaAcres"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={form.landAreaAcres}
                    onChange={(event) =>
                      updateField(
                        "landAreaAcres",
                        event.target.value
                      )
                    }
                    placeholder="e.g. 5"
                    required
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="primaryCrop">
                    Primary Crop
                  </label>

                  <input
                    id="primaryCrop"
                    type="text"
                    value={form.primaryCrop}
                    onChange={(event) =>
                      updateField(
                        "primaryCrop",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Wheat"
                    required
                  />
                </div>
              </div>
            )}
          </section>

          <section className="register-section">
            <div className="register-section-heading">
              <div className="register-section-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>Location</h2>

                <p>
                  Add the location associated with your
                  account.
                </p>
              </div>
            </div>

            <div className="register-grid">
              <div className="register-field full-width">
                <label htmlFor="address">
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Industrial Area, Ghaziabad, Uttar Pradesh"
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="location-actions">
                <button
                  type="button"
                  className="detect-location-button"
                  onClick={detectLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="spin"
                      />

                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin size={17} />

                      Use My Current Location
                    </>
                  )}
                </button>
              </div>

              <div className="register-grid two-columns">
                <div className="register-field">
                  <label htmlFor="lat">
                    Latitude
                  </label>

                  <input
                    id="lat"
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(event) =>
                      updateField(
                        "lat",
                        event.target.value
                      )
                    }
                    placeholder="28.6692"
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="lng">
                    Longitude
                  </label>

                  <input
                    id="lng"
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(event) =>
                      updateField(
                        "lng",
                        event.target.value
                      )
                    }
                    placeholder="77.4538"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="register-actions">
            <Link
              to="/"
              className="register-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="spin"
                  />

                  Creating Account...
                </>
              ) : (
                <>
                  Create Account

                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </div>

          <div className="register-login-link">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </div>
        </form>

        <footer className="register-footer">
          <ShieldCheck size={16} />

          <span>
            Your information is securely processed by
            the AgriCore platform.
          </span>
        </footer>
      </div>
    </main>
  );
}