import MainContent from "./MainContent.tsx";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
      <main className="bg w-full h-[100vh]">
        <div className=" items-end flex justify-end p-8">
        <button className="w-fit h-fit  text-white font-bold px-8 text-xl py-4 border-2 border-white rounded-full hover:bg-black transition-all duration-500  mx-4">
          <Link to="/login">Login</Link>
        </button>
        </div>
        <MainContent />
      </main>
    </>
  );
}
