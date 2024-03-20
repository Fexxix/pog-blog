import { Link } from "react-router-dom";

export default function MainContent() {
  return (
    <div className="text-black w-full mt-6">
      <div className="  text-white flex flex-col justify-center items-center py-5 px-3 md:px-0">
        <div className="h-60 w-60">
          <img className="h-full w-full" src="logo.svg" alt="" />
        </div>
        <h2 className="text-center text-4xl w-[100%] md:w-[80%] lg:w-[50%] font-bold py-4 mt-6">
          Poggers for Bloggers
        </h2>
      </div>
      <div className="w-full h-fit flex justify-center items-center mt-8">
        <button className="w-fit h-fit  text-white font-bold px-8 text-xl py-4 border-2 border-white rounded-full hover:bg-black transition-all duration-500 mx-4">
          <Link to={"/signup"}>Get Started</Link>
        </button>
        <button className="w-fit h-fit  text-white font-bold px-8 text-xl py-4 border-2 border-white rounded-full hover:bg-black transition-all duration-500  mx-4">
          <Link to="/blogs">Lets Explore</Link>
        </button>
      </div>
    </div>
  );
}
