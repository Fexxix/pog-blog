import { Link } from "react-router-dom";
import SplitText from "../../SplitText.tsx";
import { motion, Variants } from "framer-motion";

const charVariant = {
  hidden: { opacity: 0, y: -90 },
  visible: { opacity: 1, y: 0 },
};
export default function MainContent() {
  const PogBlog = SplitText("Pog Blog");
  const Poggers = SplitText("Poggers for Bloggers");
  return (
    <div className="text-black w-full mt-6">
      <div className="  text-white flex flex-col justify-center items-center py-5 px-3 md:px-0">
        <motion.div
          className="h-60 w-60"
          animate={{ scale: [1, 1.5, 1], rotate: 360, x: [0, 100, -100, 0] }}
          transition={{ duration: 1.5 }}
        >
          <img className="h-full w-full" src="logo.svg" alt="" />
        </motion.div>
        <motion.h1
          className="text-center text-6xl w-[100%] md:w-[80%] lg:w-[50%] font-bold py-4 mt-6 text-gray-400"
          initial="hidden"
          whileInView="visible"
          transition={{ staggerChildren: 0.04 }}
        >
          {PogBlog.map((char, index) => (
            <motion.span
              key={index}
              transition={{ duration: 0.5 }}
              variants={charVariant}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <motion.h2
          className="text-center text-4xl w-[100%] md:w-[80%] lg:w-[50%] font-bold py-4 mt-6 "
          initial="hidden"
          whileInView="visible"
          transition={{ staggerChildren: 0.04 }}
        >
          {Poggers.map((char, index) => (
            <motion.span
              key={index}
              transition={{ duration: 0.5 }}
              variants={charVariant}
            >
              {char}
            </motion.span>
          ))}
        </motion.h2>
      </div>
      <div className="w-full h-fit flex justify-center items-center mt-8">
        <motion.button
          className="w-fit h-fit text-white font-bold px-8 text-xl py-4 border-2 border-white rounded-full mx-6"
          transition={{ duration: 0.9 }}
          initial={{ x: "-100vh" }}
          animate={{ x: 0 }}
        >
          <Link to="/signup">Get Started</Link>
        </motion.button>

        <motion.button
          className="w-fit h-fit text-white font-bold px-8 text-xl py-4 border-2 border-white rounded-full mx-6"
          initial={{ x: "100vh" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9 }}
        >
          <Link to="/blogs">Let's Explore</Link>
        </motion.button>
      </div>
    </div>
  );
}
