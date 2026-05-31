import Image from 'next/image'
import Logo from "@/public/assets/wallpaper/logo.png"
import { getSession } from '@/lib/session.server';
import Link from 'next/link';

export default async function LandingHeader(){
  const session = await getSession();
  const dashboardHref = session?.user?.role === 'TRAINER' ? '/trainer' : '/client';
  const displayName = session?.user?.name || "User";

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <style>{`
        @keyframes gradient-move {
          0% { background-position-x: 0%; }
          100% { background-position-x: 200%; }
        }
        @keyframes gradient-move-y {
          0% { background-position-y: 0%; }
          100% { background-position-y: 200%; }
        }
        .animate-gradient-rainbow {
          background: linear-gradient(to right, #DD7DDF, #E1CD86, #BBCB92, #71C2EF, #3BFFFF, #DD7DDF, #E1CD86, #BBCB92, #71C2EF, #3BFFFF);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-move 4s linear infinite;
          transition: filter 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }
        .animate-gradient-rainbow:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
        .animate-gradient-green-y {
          background: linear-gradient(to bottom, #86efac, #14532d, #86efac);
          background-size: 100% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-move-y 4s linear infinite;
          transition: filter 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }
        .animate-gradient-green-y:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
      `}</style>
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

      <div className="w-full px-10">
        <div className="py-5">
          <div className="flex items-center justify-between px-5">
            <Image src={Logo} alt="Logo" height={40} width={40} />
            {/* <MenuIcon className="h-5 w-5 md:hidden"/> mobile */}
            <nav className="hidden md:flex gap-6 items-center">
              {session && (
                <Link
                  className="animate-gradient-green-y font-semibold text-sm tracking-wide"
                  href="/auth/logout"
                >
                  Logout ({displayName})
                </Link>
              )}
              <Link
                className="animate-gradient-green-y font-semibold text-sm tracking-wide"
                href="/#about"
              >
                About
              </Link>
              <Link
                className="animate-gradient-green-y font-semibold text-sm tracking-wide"
                href="/#features"
              >
                Features
              </Link>
              <Link
                className="animate-gradient-green-y font-semibold text-sm tracking-wide"
                href="/#security"
              >
                Security
              </Link>
              <Link
                className="animate-gradient-green-y font-semibold text-sm tracking-wide"
                href="/#testimonials"
              >
                Testimonials
              </Link>
              {session ? (
                <Link
                  className="animate-gradient-rainbow font-semibold text-sm tracking-wide"
                  href={dashboardHref}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  className="animate-gradient-rainbow font-semibold text-sm tracking-wide"
                  href="/auth/login/"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
