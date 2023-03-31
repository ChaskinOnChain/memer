export default function MemeItem({ meme }) {
  let imageURL;

  if (meme) {
    imageURL = meme.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 lg:w-3/5 h-full overflow-auto flex flex-col justify-center items-center md:items-start">
          <h2 className="text-center md:text-left text-lg font-semibold mt-4 mb-2">
            {meme.metadata.name}
          </h2>
          <img src={imageURL} alt="meme" className="w-full md:max-w-3xl mb-4" />
        </div>
        <div className="md:w-1/2 lg:w-2/5 h-full overflow-auto">
          <iframe
            src="http://localhost:5173"
            title="chat"
            width="100%"
            height="100%"
            className="border-0"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
