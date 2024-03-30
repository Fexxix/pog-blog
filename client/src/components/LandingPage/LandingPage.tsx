import MainContent from "./MainContent.tsx";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <>
      <main className="bg w-full h-[100vh] text-red-500">
        <div className=" items-end flex justify-end p-8">
          <motion.button
            className="w-fit h-fit  text-white font-bold px-8 text-xl py-4 border-2 border-white rounded-full   mx-4"
            initial={{ x: "100vh" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.9 }}
          >
            <Link to="/login">Login</Link>
          </motion.button>
        </div>
        <MainContent />
      </main>
    </>
  );
}
