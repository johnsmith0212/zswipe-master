/* eslint-disable react/no-unescaped-entities */
import { useAnonAadhaar } from "anon-aadhaar-react";
import { AnonAadhaarPCD, exportCallDataGroth16FromPCD } from "anon-aadhaar-pcd";
import { useEffect, useState, SetStateAction, Dispatch } from "react";
import { Ratings } from "@/components/Ratings";
import { Stepper } from "@/components/Stepper";
import { Loader } from "@/components/Loader";
import { useRouter } from "next/router";
import { useAccount, useContractWrite } from "wagmi";
import voteABI from "../../public/Vote.json";
import { UserStatus } from "@/interface";
import { Web3NetworkSwitch, Web3Button } from "@web3modal/react";
import { hasVoted } from "@/utils";

type VoteProps = {
  setUserStatus: Dispatch<SetStateAction<UserStatus>>;
};

export default function Vote({ setUserStatus }: VoteProps) {
  // Use the Country Identity hook to get the status of the user.
  const [anonAadhaar] = useAnonAadhaar();
  const [voted, setVoted] = useState(false);
  const [pcd, setPcd] = useState<AnonAadhaarPCD>();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [rating, setRating] = useState<string>();
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""}`,
    abi: voteABI.abi,
    functionName: "voteForProposal",
  });

  const sendVote = async (rating: string, _pcd: AnonAadhaarPCD) => {
    const { a, b, c, Input } = await exportCallDataGroth16FromPCD(_pcd);
    write({
      args: [rating, a, b, c, Input],
    });
  };

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") setPcd(anonAadhaar.pcd);
  }, [anonAadhaar]);

  useEffect(() => {
    address
      ? hasVoted(address.toString()).then((response) => setVoted(response))
      : null;
  }, [address]);

  useEffect(() => {
    isConnected
      ? setUserStatus(UserStatus.WALLET_CONNECTED)
      : setUserStatus(UserStatus.WALLET_NOT_CONNECTED);
  }, [isConnected, setUserStatus]);

  return (
    <>
      <main className="flex flex-col min-h-[75vh] mx-auto rounded-2xl w-full sm:max-w-screen-sm p-2 sm:p-8 justify-between">
        <h1 className="font-bold text-sm sm:text-2xl">
          ZeroSwipes: Matching Preferences
        </h1>
        <div className="text-sm sm:text-lg">
          Submit details.
        </div>

        <div className="flex w-full place-content-center gap-8">
          <Web3Button />
          {isConnected && <Web3NetworkSwitch />}
        </div>

        <div className="flex flex-col items-center gap-5">
          {voted ? (
            <>
              Profile created.
            </>
          ) : (
            <>
              <div className="text-sm sm:text-lg font-medium">
                What are your Gender preferences.
              </div>
              <Ratings setRating={setRating} />
              {isConnected ? (
                isSuccess ? (
                  <>
                    <button
                      disabled={true}
                      type="button"
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                    >
                      Vote sent ✅
                    </button>
                    <div className="font-bold">
                      You can check your transaction{" "}
                      <a
                        href={`https://sepolia.scrollscan.dev/tx/${data?.hash}`}
                        target="_blank"
                        className="text-blue-500"
                      >
                        here
                      </a>
                    </div>
                  </>
                ) : isLoading ? (
                  <Loader />
                ) : (
                  <button
                    disabled={rating === undefined || pcd === undefined}
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      if (rating !== undefined && pcd !== undefined)
                        sendVote(rating, pcd);
                    }}
                  >
                    Create profile.
                  </button>
                )
              ) : (
                <button
                  disabled={true}
                  type="button"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                >
                  You need to connect your wallet first
                </button>
              )}
            </>
          )}
        </div>

        <Stepper
          step={2}
          onPrevClick={() => {
            router.push("/");
          }}
        />
      </main>
    </>
  );
}
