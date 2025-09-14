// hooks/useStakeContractWagmi.ts
import { useReadContract, useWriteContract } from "wagmi";
import { StakeContractAddress } from "../utils/env";
import { stakeAbi } from '../assets/abis/stake';
import { Address } from "viem";

// 读取 hooks
export const useUser = (pid: number, userAddress: Address) => {
    return useReadContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: 'user',
        args: [BigInt(pid), userAddress],
        query: {
            enabled: !!userAddress
        }
    });
};

export const useStakingBalance = (pid: number, userAddress: Address) => {
    return useReadContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: 'stakingBalance',
        args: [BigInt(pid), userAddress],
        query: {
            enabled: !!userAddress
        }
    });
};

export const useWithdrawAmount = (pid: number, userAddress: Address) => {
    return useReadContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: 'withdrawAmount',
        args: [BigInt(pid), userAddress],
        query: {
            enabled: !!userAddress
        }
    });
};

export const usePool = (pid: number) => {
    return useReadContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: 'pool',
        args: [BigInt(pid)]
    });
};

export const useMetaNode = () => {
    return useReadContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: 'MetaNode'
    });
};

// 写入 hook
export const useStakeContractWrite = () => {
    const { writeContractAsync, isPending, isError, error, writeContract } = useWriteContract();
    const useDepositETH = async (amount: bigint) => {
       return writeContractAsync({
           address: StakeContractAddress,
           abi: stakeAbi,
           functionName: 'depositETH',
           args: [],
           value: amount
       });
    }
    const useClaim = async (pid: number) => {
        return writeContract({
            address: StakeContractAddress,
            abi: stakeAbi,
            functionName: 'claim',
            args: [BigInt(pid)]
        });
    }
    const useWithdraw = async (pid: number) => {
        return writeContract({
            address: StakeContractAddress,
            abi: stakeAbi,
            functionName: 'withdraw',
            args: [BigInt(pid)]
        });
    }
    const useUnstake = async (pid: number, amount: bigint) => {
        return writeContract({
            address: StakeContractAddress,
            abi: stakeAbi,
            functionName: 'unstake',
            args: [BigInt(pid), amount]
        });
    }
    return {
        writeContractAsync,
        isPending,
        isError,
        error,
        useDepositETH,
        useClaim,
        useWithdraw,
        useUnstake
    };
};
