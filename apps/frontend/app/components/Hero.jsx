import Image from "next/image"

const Hero = () => {
  return (
    // kenapa harus calc karena h-20 di heading jadi harus h-80
    <section className="relative h-[calc(100vh-5rem)]"> 
        <div className="container mx-auto">
            <div className="flex flex-wrap mx-auto px-20 w-full">
                <div className="flex flex-col justify-center items-center w-full">
                    <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-r from-orange-900 via-amber-700 to-red-600 text-transparent bg-clip-text">ReLive</h1>
                    <p className="text-xl tracking-tight mt-6">Know your progress, track every calories, and stay motivated. Make your fitness journey clear and consistent.</p>
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