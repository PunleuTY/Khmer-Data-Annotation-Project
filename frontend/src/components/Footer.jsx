// src/components/Footer.jsx
import { FaGithub, FaTelegramPlane, FaFacebook } from "react-icons/fa";
import JomNam_Logo from "../assets/JomNam_New_Logo1.png";

import { MdMailOutline } from "react-icons/md";
import { HiOutlineLocationMarker } from "react-icons/hi";


const Footer = () => {
  return (
    <footer className="bg-white text-[#12284C] pt-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_0.8fr_1fr_1fr] gap-5 text-center md:text-left text-sm">
        {/* First Grid: Logo */}
        <div className="flex flex-col items-center md:items-start mt-4">
          <div>
            <img
              src={JomNam_Logo}
              alt="JomNam Logo"
              className="w-[180px] h-auto object-contain"
            />
          </div>
          <div className="mt-3">
            <p className="text-left font-semibold text-xs">
              Supporting Khmer language AI <br /> research and dataset creation{" "}
              <br /> through advanced text and <br /> image annotation tools.
            </p>
          </div>
        </div>

        {/* Team Collaborate */}
        <div className="mt-4">
          <h4 className="text-lg font-bold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li>
              <a href="/project" className="hover:underline">My Project</a>
            </li>
            <li>
              <a href="/" className="hover:underline" >Home page</a>
            </li>
            <li>
              <a href="/feature" className="hover:underline">Feature page</a>
            </li>
            <li>
              <a href="/annotate" className="hover:underline">Annotate Page</a>
            </li>
            <li>
              <a href="/about" className="hover:underline">About page</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="mt-4">
          <h4 className="font-bold mb-2 text-center md:text-left text-lg">Contact US</h4>
          <div className="flex justify-center md:justify-start space-x-2 mt-2">
            <MdMailOutline className="text-xl" />
            <a
              href="mailto:contact@khmer-annotation.org"
              className="hover:underline"
            >
              contact@khmer-annotation.org
            </a>
          </div>
          <div className="flex justify-center md:justify-start space-x-2 mt-2">
            <HiOutlineLocationMarker className="text-xl" />
            <p>CADT, Phnom Penh, Cambodia</p> {/* location */}
          </div>
        </div>

        {/* Follow US */}
        <div className="mt-4">
          <h4 className="font-bold mb-2 text-lg">FOLLOW US</h4>
          <div className="space-y-1 flex gap-4 justify-center md:justify-start">
            <div>
              <a
                href="https://github.com/PunleuTY/Khmer-Data-Annotation-Project.git" 
                target="_blank"
                className="flex items-center space-x-2 hover:underline hover:text-[#F88F2D]"
              >
                <FaGithub className="text-2xl" />
              </a>
            </div>
            <div>
              <a
                href="#" 
                target="_blank"
                className="flex items-center space-x-2 hover:underline hover:text-[#F88F2D]"
              >
                <FaFacebook className="text-2xl" />
              </a>
            </div>
            <div>
              <a
                href="#"
                target="_blank"
                className="flex items-center space-x-2 hover:underline hover:text-[#F88F2D]"
              >
                <FaTelegramPlane className="text-2xl" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="flex justify-around text-sm font-bold mt-8 p-2 text-white bg-[#F88F2D]">
        <div>
          ©2025 Khmer Data Annotation Tool
        </div>
        <div className="flex justify-between w-[300px] h-auto">
          <div>
            <a href="#" className="hover:underline">Privacy & Policy</a>
          </div>
          <div>
            <a href="#" className="hover:underline">Terms & Conditions</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
