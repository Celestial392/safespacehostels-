import React, { useState } from "react";

// Type definitions
interface Property {
  id: number;
  name: string;
  price: number;
  amenities: string;
  capacity: number;
  photoUrl: string;
  ownerId: number;
  bookings: number[];
}

interface Booking {
  id: number;
  propertyId: number;
  approved: boolean;
  checkedIn: boolean;
}

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [newProperty, setNewProperty] = useState<Partial<Property>>({});
  const [loading, setLoading] = useState(false);
  const [agentFee, setAgentFee] = useState<number>(0);
  const [rating, setRating] = useState<{ [key: number]: number }>({});
  const [role, setRole] = useState<"student" | "owner" | null>(null);
  const [user, setUser] = useState<{
    username: string;
    role: "student" | "owner";
  } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [checkedInBookings, setCheckedInBookings] = useState<
    { id: number; propertyId: number }[]
  >([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [propertyNotification, setPropertyNotification] = useState<
    string | null
  >(null);

  const handleLogin = (
    username: string,
    password: string,
    role: "student" | "owner"
  ) => {
    setUser({ username, role });
    setShowWelcome(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddProperty = () => {
    if (!newProperty.name || !newProperty.price || !photo) {
      alert("Property name, price, and photo are required.");
      return;
    }

    const newProp: Property = {
      id: properties.length + 1,
      name: newProperty.name as string,
      price: newProperty.price as number,
      amenities: newProperty.amenities || "N/A",
      capacity: newProperty.capacity || 1,
      photoUrl: URL.createObjectURL(photo),
      ownerId: 1,
      bookings: [],
    };

    setProperties([...properties, newProp]);
    setNewProperty({});
    setPhoto(null);
    setPropertyNotification("Property added successfully!"); // Notify owner
  };

  const handleReserveRoom = (index: number) => {
    setLoading(true);
    const newBooking: Booking = {
      id: bookings.length + 1,
      propertyId: properties[index].id,
      approved: false,
      checkedIn: false,
    };
    setBookings([...bookings, newBooking]);

    setTimeout(() => {
      setAgentFee(agentFee === 0 ? 10 : 5);
      setLoading(false);
      alert("Room reserved! Please wait for owner approval.");
    }, 1000);
  };

  const handleApproveBooking = (bookingId: number) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, approved: true } : booking
      )
    );
    alert("Booking approved!");
  };

  const handleDenyBooking = (bookingId: number) => {
    setBookings(bookings.filter((booking) => booking.id !== bookingId));
    alert("Booking denied!");
  };

  const handleCheckIn = (bookingId: number) => {
    const bookingToCheckIn = bookings.find(
      (booking) => booking.id === bookingId
    );
    if (bookingToCheckIn && bookingToCheckIn.approved) {
      setCheckedInBookings([
        ...checkedInBookings,
        { id: bookingId, propertyId: bookingToCheckIn.propertyId },
      ]);
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, checkedIn: true } : booking
        )
      );
      setNotification(
        "Checked in successfully! Your agent fee is $" +
          (checkedInBookings.length === 0 ? 10 : 5)
      );
    } else {
      alert("Booking not approved or does not exist.");
    }
  };

  const Welcome: React.FC<{
    onRoleSelect: (role: "student" | "owner") => void;
    onProceed: () => void;
  }> = ({ onRoleSelect, onProceed }) => (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to the Accommodation App
      </h1>
      <h2 className="text-xl mb-4">Please select your role:</h2>
      <button
        onClick={() => {
          onRoleSelect("student");
          onProceed();
        }}
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition mb-2"
      >
        Student
      </button>
      <button
        onClick={() => {
          onRoleSelect("owner");
          onProceed();
        }}
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
      >
        House Owner
      </button>
    </div>
  );

  if (showWelcome) {
    return (
      <Welcome onRoleSelect={setRole} onProceed={() => setShowWelcome(false)} />
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Accommodation App</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition mb-4"
      >
        Logout
      </button>
      <h2>
        Welcome, {user.username} ({user.role})
      </h2>

      {notification && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">
          {notification}
        </div>
      )}
      {user.role === "owner" && propertyNotification && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">
          {propertyNotification}
        </div>
      )}

      {user.role === "owner" ? (
        <div>
          <h2 className="text-xl">Add Property</h2>
          <input
            type="text"
            placeholder="Property Name"
            onChange={(e) =>
              setNewProperty({ ...newProperty, name: e.target.value })
            }
            className="border rounded p-2 mb-2 w-full"
          />
          <input
            type="number"
            placeholder="Price"
            onChange={(e) =>
              setNewProperty({ ...newProperty, price: +e.target.value })
            }
            className="border rounded p-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Amenities"
            onChange={(e) =>
              setNewProperty({ ...newProperty, amenities: e.target.value })
            }
            className="border rounded p-2 mb-2 w-full"
          />
          <input
            type="number"
            placeholder="Capacity"
            onChange={(e) =>
              setNewProperty({ ...newProperty, capacity: +e.target.value })
            }
            className="border rounded p-2 mb-2 w-full"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="border rounded p-2 mb-2 w-full"
          />
          <button
            onClick={handleAddProperty}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
          >
            Add Property
          </button>

          <h2 className="text-xl">Pending Bookings</h2>
          {bookings
            .filter((booking) => !booking.approved)
            .map((booking) => (
              <div key={booking.id} className="border p-4 mb-4">
                <p>Booking for Property ID: {booking.propertyId}</p>
                <button
                  onClick={() => handleApproveBooking(booking.id)}
                  className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDenyBooking(booking.id)}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
                >
                  Deny
                </button>
              </div>
            ))}

          <h2 className="text-xl">Checked-In Bookings</h2>
          {checkedInBookings.map((booking) => (
            <div key={booking.id} className="border p-4 mb-4">
              <p>Checked in for Property ID: {booking.propertyId}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-xl">Available Properties</h2>
          {loading && <div className="text-center">Loading...</div>}
          {properties.map((property, index) => (
            <div key={property.id} className="border p-4 mb-4">
              <img
                src={property.photoUrl}
                alt={property.name}
                className="w-full h-40 object-cover mb-2"
              />
              <h3 className="font-bold">{property.name}</h3>
              <p>Price: ${property.price}</p>
              <p>Amenities: {property.amenities}</p>
              <p>Capacity: {property.capacity}</p>
              <button
                onClick={() => handleReserveRoom(index)}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
              >
                Reserve
              </button>
            </div>
          ))}

          <div className="mt-4">
            <h2>Check-In</h2>
            {bookings
              .filter((booking) => booking.approved && !booking.checkedIn)
              .map((booking) => (
                <div key={booking.id} className="border p-4 mb-4">
                  <p>
                    Booking ID: {booking.id} - Property ID: {booking.propertyId}
                  </p>
                  <button
                    onClick={() => handleCheckIn(booking.id)}
                    className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
                  >
                    Check In
                  </button>
                </div>
              ))}
          </div>

          <div className="mt-4">
            <h2>Rate Properties</h2>
            {properties.map((property) => (
              <div key={property.id} className="mb-2 flex items-center">
                <img
                  src={property.photoUrl}
                  alt={property.name}
                  className="w-20 h-20 object-cover mr-2"
                />
                <select
                  onChange={(e) =>
                    setRating({ ...rating, [property.id]: +e.target.value })
                  }
                  className="mb-2"
                >
                  <option value="">Rate this property</option>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} Star{star > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Login: React.FC<{
  onLogin: (
    username: string,
    password: string,
    role: "student" | "owner"
  ) => void;
}> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "owner" | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password && role) {
      onLogin(username, password, role);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center h-screen"
    >
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="border rounded p-2 mb-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border rounded p-2 mb-2"
      />
      <select
        onChange={(e) => setRole(e.target.value as "student" | "owner")}
        className="border rounded p-2 mb-2"
      >
        <option value="">Select Role</option>
        <option value="student">Student</option>
        <option value="owner">House Owner</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        Login
      </button>
    </form>
  );
};

export default App;
