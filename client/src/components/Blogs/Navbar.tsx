export default function Navbar() {
  return (
    <div className="h-18 w-full flex justify-between items-center py-2 px-3 md:px-10">
      <div className="flex justify-center items-center w-fit h-fit">
        <div className="w-12 h-18 hidden md:block">
          {/* <svg className="my-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0.06898999999999988 -0.050000000000000044 74.94245 84.5"
          >
            <path
              d="M28.5 26.7c8-4.6 12.4-13 12.2-21.6-.1-4.2-6.5-4.2-6.5 0-.1 8.6 4.2 17 12.2 21.6 8 4.6 17.6 4.2 25-.3 3.5-2.2.4-7.6-3.3-5.7-7.6 4.2-12.7 12.3-12.7 21.5 0 9.3 5.2 17.3 12.8 21.5 3.6 2 6.8-3.5 3.3-5.7-7.4-4.5-17-5-25-.3-8 4.6-12.4 13-12.2 21.6.1 4.2 6.5 4.2 6.5 0 .1-8.6-4.2-17-12.2-21.6-8-4.6-17.6-4.2-25 .3-3.5 2.2-.4 7.6 3.3 5.7 7.6-4.1 12.8-12.2 12.8-21.5S14.5 24.9 6.9 20.7c-3.6-2-6.8 3.5-3.3 5.7 7.3 4.5 16.9 5 24.9.3z"
              fill="none"
              stroke="black"
              stroke-width="4"
              stroke-miterlimit="10"
            ></path>
          </svg> */}
        </div>

        <div className="w-fit flex justify-center items-center h-fit border-2 border-black rounded-full px-2 py-2 mx-0 md:mx-6">
          <img className="h-fit w-5 md:w-8" src="search.svg" alt="" />
          <input className=" h-full w-[250px] md:w-[350px] outline-none border-none px-2 py-1" placeholder="search" type="text" />
        </div>

      </div>

      <div className="flex h-full w-fit justify-center items-center" >

        <div className="w-8 h-fullmd:w-12 py-4 mx-2 md:mx-4">
          <img className="h-full w-full" src="edit.svg" alt="" />
        </div>

        <div className="w-8 h-fullmd:w-12 py-4 mx-2 md:mx-4">
          <img className="h-full w-full" src="bell-solid.svg" alt="" />
        </div>

        <div className="w-10 h-10 border-2 rounded-full p-1 mx-2 md:mx-4">
          <img className="w-full h-full" src="user-solid.svg" alt="" />
        </div>
        
      </div>
    </div>
  );
}
