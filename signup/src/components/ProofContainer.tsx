import { AnonAadhaarPCD } from "anon-aadhaar-pcd";
import { FunctionComponent } from "react";

const truncate = (str: string, max: number) => {
  return str.length > max ? str.substring(0, max) + "..." : str;
};

type RatingProps = {
  pcd: AnonAadhaarPCD;
};

export const ProofContainer: FunctionComponent<RatingProps> = ({ pcd }) => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 flex w-full border-black rounded-lg border p-8 bg-white">
      <div className="inline-flex flex-col gap-y-2 max-w-full">
        <p className="truncate min-w-0">
          Modulus: {pcd.proof.modulus.toString()}
        </p>
        <p className="truncate min-w-0">
          Pi_a: {pcd.proof.proof.pi_a.toString()}
        </p>
        <p className="truncate min-w-0">
          Pi_b: {pcd.proof.proof.pi_b.toString()}
        </p>
        <p className="truncate min-w-0">
          Pi_c: {pcd.proof.proof.pi_c.toString()}
        </p>
      </div>
    </div>
  );
};
