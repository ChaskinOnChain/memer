import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLensContext } from "@/context/LensContext";
import { createContentMetadata } from "@/constants/lensConstants";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import lensContract from "../constants/contractConstants";
import { useDebounce } from "usehooks-ts";
import LensClient, { polygon } from "@lens-protocol/client";
import "tailwindcss/tailwind.css";
import classNames from "classnames";

const lensClient = new LensClient({
  environment: polygon,
});

const PINATA_PIN_ENDPOINT_JSON =
  "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const PINATA_PIN_ENDPOINT_FILE =
  "https://api.pinata.cloud/pinning/pinFileToIPFS";

interface Metadata {
  version: string;
  metadata_id: string;
  description: string;
  name: string;
  mainContentFocus: string;
  attributes: any[];
  locale: string;
  appId: string;
  image: string;
  imageMimeType: string;
}

async function createMemeImage(
  selectedImage: string,
  topText: string,
  bottomText: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = selectedImage;
  await new Promise((resolve) => (img.onload = resolve));
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  ctx.font = "bold 40px Arial"; // Increased font size and added bold weight
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.fillText(topText, img.width / 2, 40);
  ctx.strokeText(topText, img.width / 2, 40);
  ctx.fillText(bottomText, img.width / 2, img.height - 20);
  ctx.strokeText(bottomText, img.width / 2, img.height - 20);

  return await new Promise<Blob>((resolve) =>
    canvas.toBlob(resolve, "image/png", 0.95)
  );
}

async function pinImageToPinata(
  memeImage: Blob,
  pinataApiKey: string,
  pinataApiSecret: string
): Promise<string> {
  console.log("pinning image to pinata...");
  const formData = new FormData();
  formData.append("file", memeImage, "meme.png");

  const response = await fetch(PINATA_PIN_ENDPOINT_FILE, {
    method: "POST",
    headers: {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    },
    body: formData,
  });

  if (!response.ok) {
    console.error(await response.text());
    throw new Error("Error pinning image to Pinata");
  }

  const ipfsHash = (await response.json()).IpfsHash;
  console.log(`Stored meme image with ${ipfsHash}`);
  return `ipfs://${ipfsHash}`;
}

async function pinMetadataToPinata(
  metadata: Metadata,
  contentName: string,
  pinataApiKey: string,
  pinataApiSecret: string
): Promise<string> {
  console.log("pinning metadata to pinata...");
  const data = JSON.stringify({
    pinataMetadata: { name: contentName },
    pinataContent: metadata,
  });
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    },
    body: data,
  };
  const response = await fetch(PINATA_PIN_ENDPOINT_JSON, config);
  const ipfsHash = (await response.json()).IpfsHash;
  console.log(`Stored content metadata with ${ipfsHash}`);
  return ipfsHash;
}

function PostForm() {
  const { profileId, token } = useLensContext();
  const { register, handleSubmit, watch, errors, formState, reset } = useForm({
    mode: "onChange",
  });
  const [selectedImage, setSelectedImage] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [transactionArgs, setTransactionArgs] = useState(null);
  const debouncedTransactionArgs = useDebounce(transactionArgs, 500);
  const { config } = usePrepareContractWrite({
    address: lensContract.address as `0x${string}`,
    abi: lensContract.abi,
    functionName: "post",
    args: debouncedTransactionArgs,
  });
  const { write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction();

  const defaultImages = [];
  for (let i = 0; i < 12; i++) {
    defaultImages.push(`/crypto-memes/image${i}.png`);
  }

  const publishMeme = async ({ memeName }) => {
    let fullContentURI;
    const pinataApiKey = "e376349afcfece39b493";
    const pinataApiSecret =
      "82d79ddd3f9112980f58479bc2482652af1e30e983320ceab49af6daae61b099";
    const memeBlob = await createMemeImage(selectedImage, topText, bottomText);
    const imageUri = await pinImageToPinata(
      memeBlob,
      pinataApiKey,
      pinataApiSecret
    );
    const contentMetaData = createContentMetadata(memeName, imageUri);
    console.log("Conetent Metadata is ", contentMetaData);
    const validateResult = await lensClient.publication.validateMetadata(
      contentMetaData
    );
    console.log("Is result validated: ", validateResult);
    if (!validateResult.valid) {
      throw new Error(`Metadata is not valid.`);
    }
    const metadataIpfsHash = await pinMetadataToPinata(
      contentMetaData,
      memeName,
      pinataApiKey,
      pinataApiSecret
    );
    fullContentURI = `ipfs://${metadataIpfsHash}`;
    const transactionParameters = [
      [
        profileId,
        fullContentURI,
        "0x23b9467334bEb345aAa6fd1545538F3d54436e96",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x17317F96f0C7a845FFe78c60B10aB15789b57Aaa",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ],
    ];
    setTransactionArgs(transactionParameters);
    console.log("Transaction args are: ", debouncedTransactionArgs);
    write?.(...debouncedTransactionArgs);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <form onSubmit={handleSubmit(publishMeme)} className="space-y-4">
      <div>
        <label className="block font-medium text-lg text-blue-600">
          Select an image:
        </label>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {defaultImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`crypto-meme-${index}`}
              className={classNames(
                "default-image w-1/3 md:w-1/4 lg:w-1/5 object-cover cursor-pointer border-4 rounded shadow-sm transform hover:scale-105 transition-all duration-300",
                {
                  "border-blue-500": selectedImage === image,
                  "border-gray-300": selectedImage !== image,
                }
              )}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium text-lg text-blue-600">
          Or upload your own image:
        </label>
        <input
          type="file"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-300"
        />
      </div>
      <input
        placeholder="Meme Title"
        name="memeName"
        {...register("memeName", {
          maxLength: 100,
          minLength: 1,
          required: true,
        })}
        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-300"
      />

      {selectedImage && (
        <div>
          <label className="block font-medium text-lg text-blue-600">
            Top Text:
          </label>
          <input
            placeholder="Top Text"
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-300"
          />

          <label className="block font-medium text-lg text-blue-600">
            Bottom Text:
          </label>
          <input
            placeholder="Bottom Text"
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-300"
          />

          <div className="relative mt-4">
            <img src={selectedImage} alt="Selected Meme" />
            <div className="absolute top-0 left-0 w-full text-center text-white font-bold text-7xl">
              {topText}
            </div>
            <div className="absolute bottom-0 left-0 w-full text-center text-white font-bold text-7xl">
              {bottomText}
            </div>
          </div>
        </div>
      )}
      {errors ? <div> {errors.content?.message}</div> : <div></div>}
      {profileId && token ? (
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 transition-colors duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:ring-opacity-50"
          disabled={!selectedImage || !formState.isValid}
        >
          Submit Meme
        </button>
      ) : (
        <div>You need to sign in or get a lens handle</div>
      )}
    </form>
  );
}

export default function MakeMeme(props) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-semibold mb-6 text-blue-700">
        Create a Meme
      </h1>
      <PostForm />
    </div>
  );
}
