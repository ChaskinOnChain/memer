import Link from "next/link";

export default function MemeFeed({ memes }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {memes
        ? memes.map((meme) => <MemeItem meme={meme} key={meme.id} />)
        : null}
    </div>
  );
}

function MemeItem({ meme }) {
  let imageURL;

  if (meme.metadata.image) {
    imageURL = meme.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return (
    <div className="rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105">
      <Link href={`/memes/${meme.id}`}>
        <div>
          <div className="relative w-full h-0 pb-[100%]">
            <img
              src={imageURL}
              alt="meme"
              className="absolute top-0 left-0 w-full h-full object-contain object-center"
            />
          </div>
          <div className="bg-white p-4">
            <h2 className="text-md font-semibold text-gray-700">
              {meme.metadata.name}
            </h2>
          </div>
        </div>
      </Link>
    </div>
  );
}
