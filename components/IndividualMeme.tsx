export default function MemeItem({ meme }) {
  let imageURL;

  if (meme) {
    imageURL = meme.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  console.log(meme);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden ">
        <div className="md:w-1/2 lg:w-3/5 h-full overflow-auto flex flex-col justify-center items-center md:items-start bg-white p-8 shadow-md rounded-lg bg-gradient-to-br from-blue-400 to-purple-600">
          <h2 className="text-center md:text-left text-4xl font-semibold mt-4 mb-8 text-white">
            {meme.metadata.name} | shared by {meme.profile.name}
          </h2>
          <img
            src={imageURL}
            alt="meme"
            className="w-full md:max-w-4xl mb-4 rounded shadow-lg"
          />
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
