import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";

const API_URL = "https://api.lens.dev";

export const apolloClient = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
});

export const challenge = gql`
  query Challenge($address: EthereumAddress!) {
    challenge(request: { address: $address }) {
      text
    }
  }
`;

export const authenticate = gql`
  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {
    authenticate(request: { address: $address, signature: $signature }) {
      accessToken
      refreshToken
    }
  }
`;

export const getDefaultProfile = gql`
  query Query($request: DefaultProfileRequest!) {
    defaultProfile(request: $request) {
      id
    }
  }
`;

export const getFollowing = gql`
  query Following($request: FollowingRequest!) {
    following(request: $request) {
      items {
        profile {
          id
        }
      }
    }
  }
`;

export const getMemes = gql`
  query Query($request: PublicationsQueryRequest!) {
    publications(request: $request) {
      items {
        ... on Post {
          id
          onChainContentURI
          profile {
            name
          }
          metadata {
            image
            name
          }
          appId
        }
      }
    }
  }
`;

export const getMemesVariables = function (profileIds: string[]) {
  return {
    request: {
      limit: 30,
      publicationTypes: "POST",
      metadata: {
        mainContentFocus: "IMAGE",
      },
      profileIds: profileIds,
    },
  };
};

export const getMeme = gql`
  query Publication($request: PublicationQueryRequest!) {
    publication(request: $request) {
      ... on Post {
        metadata {
          image
          name
        }
        profile {
          name
        }
      }
    }
  }
`;

export const createContentMetadata = function (contentName, imageUri) {
  return {
    version: "2.0.0",
    metadata_id: uuidv4(),
    description: "Created from memer",
    media: [{ item: imageUri, type: "image/png" }],
    name: contentName,
    mainContentFocus: "IMAGE",
    attributes: [],
    locale: "en-US",
    appId: "memer",
    image: imageUri,
    imageMimeType: "image/png",
  };
};
