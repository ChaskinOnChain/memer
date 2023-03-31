import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <ul className="flex items-center">
            <li>
              <Link href="/">
                <span className="cursor-pointer text-white font-semibold hover:text-gray-100 ml-4 mr-8">
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link href="/create-meme">
                <span className="cursor-pointer text-white font-semibold hover:text-gray-100 mr-8">
                  Create Meme
                </span>
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <ConnectButton className="text-white font-semibold hover:text-gray-100 mr-4" />
        </div>
      </div>
    </nav>
  );
}
