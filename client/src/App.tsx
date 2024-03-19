import { useAuthContext } from "./contexts/AuthContextProvider"

export default function App() {
  const { login } = useAuthContext()

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <button
        className="bg-white text-black rounded-md px-4 py-2"
        onClick={login}
      >
        Login
      </button>
    </>
  )
}
