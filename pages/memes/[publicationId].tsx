import { getMeme } from "@/constants/lensConstants";
import { useQuery } from "@apollo/client";
import MemeItem from "@/components/IndividualMeme";

export async function getStaticPaths() {
  const paths = [{ params: { posts: "posts", publicationId: "0x4d85-0x04" } }];
  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { publicationId } = params;
  return {
    props: {
      publicationId,
    },
  };
}

export default function ViewMeme(props) {
  const { publicationId } = props;
  const {
    loading,
    error,
    data: publication,
  } = useQuery(getMeme, {
    variables: { request: { publicationId } },
  });

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg sm:rounded-3xl">
          {publication && publicationId && !loading ? (
            <MemeItem meme={publication.publication} />
          ) : loading ? (
            <div className="text-center text-xl font-semibold text-gray-600 py-10">
              Loading...
            </div>
          ) : (
            <div className="text-center text-xl font-semibold text-gray-600 py-10">
              Post not found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
