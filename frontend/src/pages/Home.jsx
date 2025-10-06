import Footer from "../components/Footer";
import { FcApproval } from "react-icons/fc";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdOutlineArrowDropDown } from "react-icons/md";
import homepage from "../assets/homepage.jpg";
import {
  FaUpload,
  FaDrawPolygon,
  FaSearch,
  FaFileExport,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";

const dataItems = [
  {
    number: "01",
    title: <span className="text-gray-600">Upload Images</span>,
    description: (
      <>
        <span className=" text-blue-900">Click</span> on select image button to
        adding one or many files (JPG/PNG).
        <p>
          <span className="font-bold text-gray-600">Tip : </span>
          <span>
            {" "}
            Use high-quality, clear images to get better OCR results later.
          </span>
        </p>
      </>
    ),
    color: "bg-red-300",
    icon: <FaUpload style={{ color: "#202381" }} />, // soft red
  },

  {
    number: "02",
    title: <span className="text-gray-600 ">Annotation</span>,
    description: (
      <>
        Select the type of annotation you need:
        <ul className="list-disc ml-5 mt-2">
          <li>Bounding Box: A rectangular shape to mark the text area.</li>
          <li>Polygon: Custom shape that follows the outline of the text.</li>
        </ul>
        <p>
          <span className="font-bold text-gray-600">Tip : </span>
          <span>
            {" "}
            Keep bounding boxes tight around the text without cutting letters.
          </span>
        </p>
      </>
    ),
    color: "bg-red-400",
    icon: <FaDrawPolygon style={{ color: "#202381" }} />,
  },

  {
    number: "03",
    title: <span className="text-gray-600">Extract Text (OCR)</span>,
    description: (
      <>
        Run or Scan OCR engine to extract text.
        <p>
          <span className="font-bold text-gray-600">Tip : </span>
          <span>
            {" "}
            Transforms image-based text into machine-readable format.
          </span>
        </p>
      </>
    ),
    color: "bg-red-300",
    icon: <FaChartLine style={{ color: "#202381" }} />,
  },
  {
    number: "04",
    title: <span className="text-gray-600">Validate</span>,
    description: (
      <>
        Compare OCR output with the actual text (ground truth) you enter.
        <p>
          <span className="font-bold text-gray-600">Tip : </span>
          <span>
            {" "}
            Checks the quality and correct OCR mistakes immediately to improve
            dataset reliability.
          </span>
        </p>
      </>
    ),
    color: "bg-red-400",
    icon: <FaSearch style={{ color: "#202381" }} />,
  },
  {
    number: "05",
    title: <span className="text-gray-500">Edit Result</span>,
    description: (
      <>
        <span className=" text-blue-900">Click</span> on JSON edit button to
        modify the OCR results or annotations.
        <span className=" text-blue-900">Then,</span> Apply changes.
        <p>
          <span className="font-bold text-gray-600">Tip : </span>
          <span>
            {" "}
            If something is incorrect you can fix it before exporting.
          </span>
        </p>
      </>
    ),
    color: "bg-red-300",
    icon: <FaClipboardList style={{ color: "#202381" }} />,
  },

  {
    number: "06",
    title: <span className="text-gray-600">Export</span>,
    description: (
      <>
        Export your annotated data in standard formats JSON/YOLO.
        <p>
          <span className="font-bold text-gray-600">Tip:</span>
          <span> Store your JSON files in safe storage.</span>
        </p>
      </>
    ),
    color: "bg-red-400",
    icon: <FaFileExport style={{ color: "#202381" }} />,
  },
];

export const Home = () => {
  return (
    <div className="home-container">
      <div className="bg-white m-2  pl-10 sm:pt-12 pt-10 h-auto lg:h-175 rounded-lg ">
        <h2 className="text-base sm:text-xl md:text-2xl font-bold ml-4 sm:ml-8 text-[#12284c] mb-4 text-start">
          Welcome To
        </h2>
        <h2 className="text-lg sm:text-3xl md:text-5xl font-cadt ml-4 sm:ml-8 text-[#F88F2D] mb-3 text-start ">
          Khmer Data
        </h2>
        <h2 className="text-lg sm:text-3xl md:text-5xl font-cadt ml-4 sm:ml-8 text-[#F88F2D] mb-3 lg:mb-0 text-start ">
          Annotation Tool
        </h2>

        {/* Tool Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center px-4 sm:px-8">
          {/* Left Content */}
          <div>
            <p className="text-[#12284c] font-semibold max-w-2xl text-xs lg:text-lg pt-0  md:text-base">
              Upload images, annotate text regions, extract Khmer text
              with OCR, and validate against ground truth to build high-quality
              datasets.
            </p>

            <ul className="text-[#12284c] font-bold mt-8 space-y-2 text-xs md:text-base">
              <li className="flex items-center">
                <FcApproval className="mr-2 sm:mr-3 text-sm  " />
                Bounding box and polygon annotations
              </li>
              <li className="flex items-center">
                <FcApproval className="mr-2 sm:mr-3 text-sm " />
                Khmer and English OCR extraction
              </li>
              <li className="flex items-center">
                <FcApproval className="mr-2 sm:mr-3 text-sm  " />
                Validation with accuracy metrics
              </li>
            </ul>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-8 sm:mt-10">
              <a
                href="/project"
                className="bg-[#12284c] text-white px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-3 rounded-xl flex items-center gap-1 sm:gap-2 font-cadt text-[10px] sm:text-xs md:text-sm lg:text-base whitespace-nowrap"
              >
                Get Started{" "}
                <FaArrowRightLong className="text-[12px] sm:text-sm md:text-base" />
              </a>

              {/* Scroll Button */}
              <button
                onClick={() => {
                  const element = document.getElementById("instructions");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="bg-[#76bc21] text-white px-10 py-3 rounded-2xl flex items-center gap-2 font-cadt hover:opacity-90 active:scale-95 transition"
              >
                Instruction <MdOutlineArrowDropDown />
              </button>
            </div>
          </div>

          {/* Right Image Panel */}
          <div className="flex justify-center lg:justify-end items-center mt-6 lg:mt-0">
            <div className="bg-white">
              <img
                src={homepage}
                alt="Annotated Document"
                className="rounded-md max-h-48 sm:max-h-64 md:max-h-96 lg:max-h-100 object-contain"
              />
            </div>
          </div>
        </section>

        <hr className="border-t border-gray-300 w-full" />
      </div>

      {/* Instructions Section */}
      <section
        id="instructions"
        className="mt-10 text-white bg-[#12284C] p-6 m-4 rounded-lg mb-4 items-center text-center"
      >
        <h2 className="text-lg font-bold sm:text-2xl md:text-4xl whitespace-nowrap">
          Annotation Workflow Instruction
        </h2>
        <div className="text-white text-xs sm:text-sm md:text-base text-center mt-5 max-w-5xl mx-auto">
          Follow this detailed step-by-step annotation workflow how to annotate
          images, run OCR, validate, and export your results to more
          efficiently.
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 rounded-lg p-6 mt-1 mb-2">
        {dataItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition duration-300 h-full"
          >
            {/* Number (top on mobile, left on desktop) */}
            <div className="flex items-center justify-center mb-3 sm:mb-0 sm:mr-4">
              <div className="flex items-center justify-center text-center w-12 h-12 text-white text-2xl font-bold rounded-full bg-[#F88F2D]">
                {item.number}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-start justify-start">
              <h3
                className={`font-bold ${item.color.replace(
                  "bg",
                  "text"
                )} text-center sm:text-left w-full`}
              >
                {item.title}
              </h3>
              <div className="text-gray-600 text-sm max-w-md mt-1">
                {item.description}
              </div>
            </div>

            {/* Icon (hidden on mobile, visible on md+) */}
            <div className="hidden md:flex items-center justify-end ml-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-gray-100 shadow-sm">
                <span
                  className={`text-2xl ${item.color.replace("bg", "text")}`}
                >
                  {item.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
