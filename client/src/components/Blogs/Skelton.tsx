export default function Skeleton() {
  return (
    <div className="flex flex-col w-[90%] md:w-[80%] lg:w-[70%] p-6 my-6 m-auto rounded-3xl shadow shadow-slate-600 overflow-x-auto">
      <div className="flex justify-start items-center my-2">
        <div className="w-16 h-16 rounded-full overflow-hidden m-1 md:m-2 bg-gray-300 animate-pulse"></div>
        <div className="w-32 h-6 mx-2 text-xl font-bold bg-gray-300 rounded-full text-gray-300 animate-pulse"></div>
      </div>

      <div className="flex flex-col ">
        <div className="h-18  w-32 bg-gray-700 rounded-full animate-pulse"></div>
        
        <div className="h-32  bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
