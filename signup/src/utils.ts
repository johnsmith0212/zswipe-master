import { ethers } from "ethers";
import votingAbi from "../public/Vote.json";
import { groth16 } from "snarkjs";
import { BigNumberish, AnonAadhaarPCD } from "anon-aadhaar-pcd";

export const getTotalVotes = async (): Promise<number> => {
  const provider = ethers.getDefaultProvider(
    `https://rpc.ankr.com/scroll_sepolia_testnet`
  );
  const voteContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    votingAbi.abi,
    provider
  );

  const proposalCount = await voteContract.getProposalCount();

  // Initialize a variable to store the total vote count
  let totalVoteCount = 0;

  // Iterate through the proposals and sum their vote counts
  for (let i = 0; i < proposalCount; i++) {
    const voteCount = await voteContract.getProposal(i);
    totalVoteCount += Number(voteCount[1]);
  }

  return totalVoteCount;
};

export const hasVoted = async (userAddress: string): Promise<boolean> => {
  const provider = ethers.getDefaultProvider(
    `https://rpc.ankr.com/scroll_sepolia_testnet`
  );
  const voteContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    votingAbi.abi,
    provider
  );

  return await voteContract.checkVoted(userAddress);
};

/**
 * Turn a PCD into a call data format to use it as a transaction input.
 * @param _pcd The PCD you want to verify on-chain.
 * @returns {a, b, c, Input} which are the input needed to verify a proof in the Verifier smart contract.
 */
export async function exportCallDataGroth16FromPCD(
  _pcd: AnonAadhaarPCD
): Promise<{
  a: [BigNumberish, BigNumberish];
  b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
  c: [BigNumberish, BigNumberish];
  Input: BigNumberish[];
}> {
  const calldata = await groth16.exportSolidityCallData(_pcd.proof.proof, [
    _pcd.proof.nullifier.toString(),
    _pcd.proof.modulus.toString(),
    _pcd.proof.app_id.toString(),
  ]);

  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map((x: string) => BigInt(x).toString());

  const a: [BigNumberish, BigNumberish] = [argv[0], argv[1]];
  const b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]] = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c: [BigNumberish, BigNumberish] = [argv[6], argv[7]];
  const Input = [];

  for (let i = 8; i < argv.length; i++) {
    Input.push(argv[i]);
  }
  return { a, b, c, Input };
}
