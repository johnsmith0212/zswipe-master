/* eslint-disable react/no-unescaped-entities */
import { LogInWithAnonAadhaar, useAnonAadhaar } from "anon-aadhaar-react";
import { Dispatch, useEffect, useState, SetStateAction } from "react";
import { Stepper } from "../components/Stepper";
import { ProofContainer } from "@/components/ProofContainer";
import { useRouter } from "next/router";
import { UserStatus } from "@/interface";
import { TestFiles } from "@/components/TestFiles";

type HomeProps = {
  setUserStatus: Dispatch<SetStateAction<UserStatus>>;
};

export default function Home({ setUserStatus }: HomeProps) {
  // Use the Country Identity hook to get the status of the user.
  const [anonAadhaar] = useAnonAadhaar();
  const [withCert, setWithCert] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    anonAadhaar.status === "logged-in"
      ? setUserStatus(UserStatus.LOGGED_IN)
      : setUserStatus(UserStatus.LOGGED_OUT);
  }, [anonAadhaar, setUserStatus]);

  return (
    <>
      <main className="flex flex-col min-h-[75vh] mx-auto rounded-2xl w-full sm:max-w-screen-sm p-4 sm:p-8 justify-between">
        <h1 className="font-bold text-sm sm:text-2xl">
          ZeroSwipes Signup
        </h1>
        <div className="text-sm sm:text-lg">
          Verify your identity anonymously using your Aadhaar card.
        </div>

        {/* Import the Connect Button component */}
        <div className="flex w-full place-content-center">
          <LogInWithAnonAadhaar />
        </div>

        {anonAadhaar.status === "logged-in" ? (
          <>
            <ProofContainer pcd={anonAadhaar.pcd} />
            <Stepper
              step={1}
              onNextClick={() => {
                router.push("/vote");
              }}
            />
          </>
        ) : (
          <>
            <TestFiles />
            <Stepper step={1} />
          </>
        )}
      </main>
    </>
  );
}
