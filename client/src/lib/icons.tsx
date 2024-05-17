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
