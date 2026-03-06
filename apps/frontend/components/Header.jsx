import Image from 'next/image'
import Tree from "@/public/assets/wallpaper/tree.png"

const Header = () => {
  return (
    <header className="sticky top-0 z-30 h-20">
      <div
        className="
          mx-auto flex
          justify-center items-center
          bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500
          text-white
          rounded-1xl
          shadow-[0_10px_30px_rgba(120,53,15,0.35)]
          border border-orange-800/40
          backdrop-blur-md
          hover:shadow-[0_15px_40px_rgba(120,53,15,0.45)]
        "
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 py-1">
            <span className="text-2xl">🍂</span>
            <h1 className="font-bold text-lg tracking-wide">
              Getting Healthy Everyday! be ReLive
            </h1>
          </div>

          <div className="hidden md:block font-semibold text-sm tracking-wide">
            Get Started For Free
          </div>
        </div>
      </div>

      <div className='w-full px-10 x-20'>
        <div className='py-5'>
            <div className='flex flex-wrap mx-auto items-center justify-between px-5'>
              <Image src={Tree} alt="Autumn" height={40} width={40}/>
              {/* <MenuIcon className="h-5 w-5 md:hidden"/> mobile */}
              <nav className='hidden md:flex gap-6 items-center'>
                <a className="text-white" href="#">About</a>
                <a className="text-white" href="#">Features</a>
                <a className="text-white" href="#">Costumer</a>
                <a className="text-white" href="#">Update</a>
                <a className="text-white" href="#">Help</a>
                <button className="text-white">Login</button>
              </nav>
            </div>
          </div>
        </div>
    </header>
  )
}

export default Header