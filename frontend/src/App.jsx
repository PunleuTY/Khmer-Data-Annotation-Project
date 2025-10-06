import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./navigations/Layout";
import Home from "./pages/Home";
import Annotate from "./pages/Annotate";
import Feature from "./pages/Feature";
import About from "./pages/About";
import Project from "./pages/Myproject";
import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        {/* All routes use the Layout component which includes the sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Annotate" element={<Annotate />} />
          <Route path="Annotate/:id" element={<Annotate />} />
          <Route path="feature" element={<Feature />} />
          <Route path="about" element={<About />} />
          <Route path="project" element={<Project />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
