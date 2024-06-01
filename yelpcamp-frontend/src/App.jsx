import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import Index from "./camgrounds/Index"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import ViewCamp from "./camgrounds/View";
import AddCamp from "./camgrounds/AddCamp";
import Login from "./users/Login";
import Register from "./users/Register";
import EditCamp from "./camgrounds/EditCamp";
import { UserProvider } from "./components/UserContext";
import Logout from "./users/Logout";


function App() {

  return (
    <UserProvider>
      <div className="d-flex flex-column vh-100">
        <Router>
          <Navbar />
          <div className="container mt-5">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/campground" element={<ViewCamp />} />
              <Route path="/new" element={<AddCamp />} />
              <Route path="/edit" element={<EditCamp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/logout" element={<Logout />} />
            </Routes>
          </div>
          <Footer />

        </Router>
      </div>
    </UserProvider>
  )
}

export default App
