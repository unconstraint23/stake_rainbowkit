// hooks/useRewards.ts
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import {
  useUser,
  useStakingBalance,
  usePool,
  useMetaNode,
  useWithdrawAmount
} from '../utils/useStakeContractWagmi';
import { Pid } from '../utils';

export type RewardsData = {
  pendingReward: string;
  stakedAmount: string;
  lastUpdate: number;
};

type UserData = [bigint, bigint, bigint]; // [stAmount, finishedMetaNode, pendingMetaNode]
type WithdrawData = [bigint, bigint]; // [requestAmount, pendingWithdrawAmount]
type PoolData = [string, bigint, bigint, bigint, bigint, bigint, bigint];

const useRewards = () => {
  const { address, isConnected } = useAccount();

  // 使用 wagmi hooks 获取数据
  const { data: userData, isError: isUserError, error: userError,refetch: refetchUserData } = useUser(Pid, address);
  const { data: stakedAmount,refetch: refetchStakedAmount } = useStakingBalance(Pid, address);
  const { data: poolInfo,refetch: refetchPoolInfo } = usePool(Pid);
  const { data: metaNodeAddr,isError: isMetaNodeError, error: metaNodeError,refetch: refetchMetaNodeAddr } = useMetaNode();
  const { data: withdrawData,refetch: refetchWithdrawData } = useWithdrawAmount(Pid, address);

  // 处理奖励数据
  const rewardsData = useMemo(() => {
    console.log('userData', userData);
    if (!userData) {
      return {
        pendingReward: '0',
        stakedAmount: '0',
        lastUpdate: 0
      };
    }

    return {
      pendingReward: formatUnits((userData as UserData)[2], 18),
      stakedAmount: stakedAmount ? formatUnits(stakedAmount as bigint, 18) : '0',
      lastUpdate: Date.now()
    };
  }, [userData, stakedAmount]);

  // 处理池数据
  const poolData = useMemo(() => {
    if (!poolInfo) {
      return {
        poolWeight: '0',
        lastRewardBlock: '0',
        accMetaNodePerShare: '0',
        stTokenAmount: '0',
        minDepositAmount: '0',
        unstakeLockedBlocks: '0',
        stTokenAddress: ''
      };
    }

    const pool = poolInfo as PoolData;
    return {
      poolWeight: formatUnits(pool[1] || BigInt(0), 18),
      lastRewardBlock: formatUnits(pool[2] || BigInt(0), 18),
      accMetaNodePerShare: formatUnits(pool[3] || BigInt(0), 18),
      stTokenAmount: formatUnits(pool[4] || BigInt(0), 18),
      minDepositAmount: formatUnits(pool[5] || BigInt(0), 18),
      unstakeLockedBlocks: formatUnits(pool[6] || BigInt(0), 18),
      stTokenAddress: pool[0]
    };
  }, [poolInfo]);

  // 处理 MetaNode 地址
  const metaNodeAddress = useMemo(() => {
    return metaNodeAddr ? metaNodeAddr as string : '';
  }, [metaNodeAddr]);

  // 计算是否可以领取奖励
  const canClaim = useMemo(() => {
    if (!userData) return false;
    return ((userData as UserData)[2] as bigint) > BigInt(0);
  }, [userData]);

  // 刷新函数（在 wagmi 中通常不需要手动刷新，数据会自动更新）
  const refresh = () => {
    // 在 wagmi 中，数据通常会根据依赖项自动更新
    refetchUserData();
    refetchStakedAmount();
    refetchPoolInfo();
    refetchMetaNodeAddr();
    refetchWithdrawData();

  };

  return {
    rewardsData,
    poolData,
    metaNodeAddress,
    canClaim,
    refresh,
    isLoading: !userData && !isUserError, // 简单的加载状态判断
    isError: isUserError,
    error: userError
  };
};

export default useRewards;
