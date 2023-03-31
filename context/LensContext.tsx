import { useState, createContext, useContext, useEffect, useRef } from "react";
import {
  challenge,
  apolloClient,
  authenticate,
  getDefaultProfile,
} from "../constants/lensConstants";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

interface LensContextProviderProps {
  children: React.ReactNode;
}

interface LensContextType {
  profileId: string | null;
  token: string | null;
}

export const LensContext = createContext<LensContextType | null>(null);

export const useLensContext = () => useContext(LensContext);

const useProfileId = (address: string | undefined, token: string | null) => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileIdFetched, setProfileIdFetched] = useState<boolean>(false);

  useEffect(() => {
    if (address && token && !profileIdFetched) {
      setProfileIdFetched(true);
      apolloClient
        .query({
          query: getDefaultProfile,
          variables: {
            request: {
              ethereumAddress: address,
            },
          },
        })
        .then((result) => {
          if (result.data.defaultProfile) {
            setProfileId(result.data.defaultProfile.id);
          }
          setProfileIdFetched(false);
        });
    }
  }, [address, token]);

  return profileId;
};

export function LensContextProvider({ children }: LensContextProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const { address, isConnecting, isDisconnected } = useAccount();
  const signInCalled = useRef(false);
  const profileId = useProfileId(address, token);

  const signIn = async () => {
    try {
      const challengeInfo = await apolloClient.query({
        query: challenge,
        variables: { address },
      });
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as ethers.providers.ExternalProvider
      );
      const signer = provider.getSigner();
      const signature = await signer.signMessage(
        challengeInfo.data.challenge.text
      );
      const authData = await apolloClient.mutate({
        mutation: authenticate,
        variables: {
          address,
          signature,
        },
      });
      const {
        data: {
          authenticate: { accessToken },
        },
      } = authData;
      setToken(accessToken);
      console.log(accessToken);
    } catch (error) {
      console.log("Error signing in: ", error);
    }
  };

  useEffect(() => {
    const readToken = window.localStorage.getItem("lensToken");
    if (readToken) {
      setToken(readToken);
    }
    if (
      address &&
      !token &&
      !readToken &&
      !isConnecting &&
      !signInCalled.current
    ) {
      signInCalled.current = true;
      signIn();
    }
    if (!address) {
      window.localStorage.removeItem("lensToken");
      signInCalled.current = false;
    }
  }, [address]);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("lensToken", token);
    }
  }, [token]);

  return (
    <LensContext.Provider value={{ profileId, token }}>
      {children}
    </LensContext.Provider>
  );
}
