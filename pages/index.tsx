import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  apolloClient,
  getFollowing,
  getMemes,
  getMemesVariables,
} from "@/constants/lensConstants";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import MemeFeed from "@/components/MemeFeed";
import Link from "next/link";

interface FollowingItem {
  profile: {
    id: string;
  };
}

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [memes, setMemes] = useState(null);

  const getMemesList = async () => {
    let followers;
    let followingsIds = [];
    followers = await apolloClient.query({
      query: getFollowing,
      variables: {
        request: { address },
      },
    });
    followingsIds = followers.data.following.items.map(
      (f: FollowingItem) => f.profile.id
    );
    let profileIdList = ["0x3912"]; // Initialize with the default value

    if (followingsIds.length > 0) {
      // Update profileIdList if there are any followers
      profileIdList = followingsIds;
    }
    const memesResult = await apolloClient.query({
      query: getMemes,
      variables: getMemesVariables(profileIdList),
    });

    return memesResult;
  };

  useEffect(() => {
    if (address) {
      getMemesList().then((memes) => {
        console.log(memes);

        setMemes(memes.data.publications.items);
      });
    }
  }, [address]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white mb-4">
          memer
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-600 mb-8">
          Click an image to join a chat room{" "}
          <span className="text-white">powered by streamr</span> or click{" "}
          <Link href="/create-meme">
            <span className="text-white cursor-pointer underline">here</span>
          </Link>{" "}
          to create a meme
        </h2>
      </div>
      {!memes ? (
        <div className="text-center text-xl font-medium text-gray-600">
          Loading...
        </div>
      ) : (
        <MemeFeed memes={memes} />
      )}
    </div>
  );
}
