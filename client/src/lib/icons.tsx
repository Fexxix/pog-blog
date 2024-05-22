import { BiSolidHeart } from "react-icons/bi"
import { cn } from "./utils"

export { FaRegUserCircle as UserProfileCircle } from "react-icons/fa"
export { PiSignOut as SignOutIcon } from "react-icons/pi"
export { HiOutlinePencilSquare as Pencil } from "react-icons/hi2"
export { BsSun as Sun } from "react-icons/bs"
export { TbMoonStars as Moon } from "react-icons/tb"
export { BiSolidHeart } from "react-icons/bi"
export { CiImageOn as ImageIcon } from "react-icons/ci"
export { FaBold as Bold } from "react-icons/fa"
export { FaItalic as Italic } from "react-icons/fa"
export { FaUnderline as UnderlineIcon } from "react-icons/fa"
export { BiUndo as Undo } from "react-icons/bi"
export { BiRedo as Redo } from "react-icons/bi"
export { FaList as BulletedList } from "react-icons/fa"
export { FaListOl as OrderedList } from "react-icons/fa6"
export { MdLink as LinkIcon } from "react-icons/md"
export { RiImageAddFill as ImageAdd } from "react-icons/ri"
export { MdLinkOff as LinkOff } from "react-icons/md"
export { FaStrikethrough as Strikethrough } from "react-icons/fa"
export { SlOptions as OptionsIcon } from "react-icons/sl"
export { LiaUserEditSolid as EditIcon } from "react-icons/lia"
export { CiCirclePlus as Plus } from "react-icons/ci"
export { CiCircleMinus as Minus } from "react-icons/ci"
export { TiTick as Tick } from "react-icons/ti"
export { MdEdit as Edit } from "react-icons/md"

export function Heart({
  filled,
  className,
}: {
  filled: boolean
  className?: string
}) {
  return (
    <BiSolidHeart
      className={cn(
        "size-6",
        {
          "stroke-[1.1] fill-transparent stroke-current": !filled,
          "fill-current stroke-0": filled,
        },
        className
      )}
    />
  )
}

export function CommentBubble() {
  return (
    <svg
      data-slot="icon"
      aria-hidden="true"
      fill="none"
      strokeWidth="1.1"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="size-6 -scale-x-[1]"
    >
      <path
        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  )
}

// export function KeyS() {
//   return (
//     <svg viewBox="0 0 27.47 26.875" fill="currentColor" className="size-4">
//       <path
//         d="M1599.25,69.947h-15.1a6.165,6.165,0,0,0-6.18,6.14V90.66a6.165,6.165,0,0,0,6.18,6.14h15.1a6.165,6.165,0,0,0,6.18-6.14V76.086A6.165,6.165,0,0,0,1599.25,69.947Zm-19.45,6.14a4.339,4.339,0,0,1,4.35-4.32h15.1a4.339,4.339,0,0,1,4.35,4.32v10.74a4.339,4.339,0,0,1-4.35,4.32h-15.1a4.339,4.339,0,0,1-4.35-4.32V76.086Zm19.45,18.894h-15.1a4.343,4.343,0,0,1-4.31-3.76,6.184,6.184,0,0,0,4.31,1.745h15.1a6.183,6.183,0,0,0,4.31-1.746A4.344,4.344,0,0,1,1599.25,94.98Zm-5.88-10.235a2.583,2.583,0,0,1-1.47.316,6.074,6.074,0,0,1-1.36-.154,4.726,4.726,0,0,1-1.27-.477,0.9,0.9,0,0,0-.61-0.1,0.8,0.8,0,0,0-.46.281,1.1,1.1,0,0,0-.21.5,1.077,1.077,0,0,0,.09.555,1.04,1.04,0,0,0,.44.443,4.778,4.778,0,0,0,1,.421,8.131,8.131,0,0,0,1.17.26,8.276,8.276,0,0,0,1.21.091,6.022,6.022,0,0,0,1.68-.218,3.934,3.934,0,0,0,1.29-.625,2.715,2.715,0,0,0,.81-0.976,2.8,2.8,0,0,0,.29-1.27,2.291,2.291,0,0,0-.68-1.721,4.177,4.177,0,0,0-2.06-.948l-1.6-.337a2.4,2.4,0,0,1-1.03-.407,0.821,0.821,0,0,1-.3-0.66,1.06,1.06,0,0,1,.22-0.646,1.427,1.427,0,0,1,.64-0.436,2.88,2.88,0,0,1,1.01-.154,5.169,5.169,0,0,1,1.07.112,4.012,4.012,0,0,1,.99.351,1.033,1.033,0,0,0,.65.127,0.761,0.761,0,0,0,.44-0.253,0.881,0.881,0,0,0,.22-0.457,1.042,1.042,0,0,0-.07-0.519,0.884,0.884,0,0,0-.39-0.428,4.7,4.7,0,0,0-1.34-.555,6.476,6.476,0,0,0-1.56-.19,5.609,5.609,0,0,0-1.63.225,3.932,3.932,0,0,0-1.28.646,3.01,3.01,0,0,0-.83,1,2.729,2.729,0,0,0-.3,1.278,2.465,2.465,0,0,0,.66,1.791,3.812,3.812,0,0,0,2.01.962l1.6,0.337a2.767,2.767,0,0,1,1.08.408,0.772,0.772,0,0,1,.32.646A0.954,0.954,0,0,1,1593.37,84.745Z"
//         transform="translate(-1577.97 -69.938)"
//       ></path>
//     </svg>
//   )
// }
