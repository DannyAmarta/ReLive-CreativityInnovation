import Image from "next/image";
import DownBar from "@/public/assets/wallpaper/downbar3.png";
import ForestWallpaper from "@/public/assets/wallpaper/forestwallpaper2.png";
import Quote from "@/public/assets/wallpaper/quote4.png";
import Gym from "@/public/assets/wallpaper/gym2.png";
import GymBg from "@/public/assets/wallpaper/gymbg.jpeg";

const LoremC = () => {
    return (
        <section className="relative z-20">
            
            <div className="container mx-auto flex items-center relative z-10">
                <div className="md:w-1/2 flex flex-wrap justify-center items-center px-10 md:px-0">
                    <h1 className="text-5xl font-bold tracking-tight text-5xl font-bold tracking-tight bg-gradient-to-b from-orange-800 via-orange-500 to-orange-300 text-transparent bg-clip-text my-5 mt-30">
                        About Us
                    </h1>
                    <p className="text-justify">
                        <span className="font-bold tracking-tight bg-gradient-to-r from-orange-900 via-amber-700 to-red-600 text-transparent bg-clip-text">
                            Relive
                        </span> 
                        merupakan aplikasi kesehatan yang dirancang untuk mendukung pengguna dalam menerapkan gaya hidup yang lebih sehat dan terarah melalui fitur pemantauan aktivitas fisik serta pengelolaan asupan kalori, ReLive menghadirkan solusi praktis dan efektif untuk membantu pengguna menjaga keseimbangan tubuh dan meningkatkan kualitas hidup mereka.
                    </p>
                </div>
                <div className="w-1/2 flex justify-end hidden md:block">
                    {/* <Image src={ForestWallpaper} alt='forestwallpaper' className='bottom-0 right-0'/> */}
                    <Image
                        src={Gym}
                        alt="Gym"
                        className="mt-30"
                    />
                </div>
            </div>

            <div className="w-full flex flex-col items-center z-15">
                <Image src={DownBar} alt="downbar" className="w-full" />
            </div>
            <div className="relative w-full flex flex-col justify-center z-15">
                <Image src={Quote} alt="quote" className="w-full" />
                <div className="flex flex-col absolute inset-0 items-center justify-center px-10 text-center">
                    <h1 className="text-2xl md:text-5xl lg:text-8xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-orange-600 text-transparent bg-clip-text py-3 lg:py-7">Lorem</h1>
                    <p className="text-sm md:text-xl lg:text-2xl text-orange-200 max-w-3xl">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Officiis ea, natus minus ut animi mollitia
                        blanditiis exercitationem recusandae amet. In magnam,
                        delectus odit esse laborum fugiat dolor sint. Eius
                        aliquam iste dolore consectetur officiis facilis,
                        quibusdam culpa asperiores. Iste laudantium facilis
                        nesciunt et sint voluptatem cum delectus. Deserunt,
                        dignissimos error.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default LoremC;
