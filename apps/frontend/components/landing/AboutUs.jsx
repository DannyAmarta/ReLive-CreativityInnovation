import Image from "next/image";
import DownBar from "@/public/assets/wallpaper/downbar3.png";
import ForestWallpaper from "@/public/assets/wallpaper/forestwallpaper2.png";
import Quote from "@/public/assets/wallpaper/quote4.png";
import Gym from "@/public/assets/wallpaper/gym2.png";
import GymBg from "@/public/assets/wallpaper/gymbg.jpeg";
import Sawit from "@/public/assets/wallpaper/sawit.png";
import Rumput from "@/public/assets/wallpaper/main3.png";
import Forest from "@/public/assets/wallpaper/forest4.png";

const AboutUs = () => {
    return (
        <section className="relative z-20 bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500">
            
            <div className="container mx-auto flex items-center relative z-10">
                <div className="md:w-1/2 flex flex-wrap justify-center items-center px-10 md:px-0">
                    <h1 className="text-5xl font-bold tracking-tight text-[#FFE3C4] mt-30 my-5">
                        About Us
                    </h1>
                    <p className="text-justify px-20 text-white mt-10 text-md">
                         Relive merupakan aplikasi kesehatan yang dirancang untuk mendukung pengguna dalam menerapkan gaya hidup yang lebih sehat dan terarah melalui fitur pemantauan aktivitas fisik serta pengelolaan asupan kalori, ReLive menghadirkan solusi praktis dan efektif untuk membantu pengguna menjaga keseimbangan tubuh dan meningkatkan kualitas hidup mereka.
                    </p>
                </div>
                <div className="w-1/2 flex justify-end hidden md:block">
                    <Image
                        src={Gym}
                        alt="Gym"
                        className="mt-30"
                    />
                </div>
            </div>

            {/* <div className="w-full flex flex-col items-center z-15">
                <Image src={Rumput} alt="Rumput" className="w-full" />
            </div> */}
            <div className="w-full flex flex-col items-center z-15">
                <Image src={DownBar} alt="DownBar" className="w-full" />
            </div>
            <div className="relative w-full flex flex-col justify-center z-15">
                <Image src={Forest} alt="Forest" className="w-full" />
                <div className="flex flex-col absolute inset-0 items-center justify-center px-10 text-center">
                    <h1 className="text-2xl md:text-5xl lg:text-8xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-orange-600 text-transparent bg-clip-text py-3 lg:py-7">Lorem</h1>
                    <p className="text-sm md:text-xl lg:text-2xl text-white max-w-3xl">
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

export default AboutUs;
