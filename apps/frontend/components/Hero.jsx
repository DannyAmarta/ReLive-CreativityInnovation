import Image from "next/image"

const Hero = () => {
  return (
    // kenapa harus calc karena h-20 di heading jadi harus h-80
    // semua harus pake h-full karena static 80
    <section className="relative h-[calc(100vh-5rem)] z-20"> 
        <div className="container mx-auto h-full">
            <div className="flex flex-wrap mx-auto px-20 w-full h-full">
                <div className="flex flex-col justify-center items-center w-full h-full">
                    <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-r from-orange-900 via-amber-700 to-red-600 text-transparent bg-clip-text">ReLive</h1>
                    <p className="text-xl tracking-tight mt-6 text-center">Recharge Your Life, Relive Your Health.</p>
                    <div className="flex gap-1 items-center mt-[30px]">
                        <button className="btn btn-text gap-1">Start Now!</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Hero