import { Abi, Address, GetContractReturnType, PublicClient, WalletClient, getContract as viemGetContract, } from "viem"
import { defaultChainId } from './wagmi'
import { viemClients } from "./viem"
import { ethers } from "ethers";
import {hasFunctionInAbi} from "@/utils/ethersTools";

export const getContract = <TAbi extends Abi | readonly unknown[], TWalletClient extends WalletClient>({
  abi,
  address,
  chainId = defaultChainId,
  signer,
}: {
  abi: TAbi | readonly unknown[]
  address: Address
  chainId?: number
  signer?: TWalletClient | ethers.Signer
}) => {

  // @ts-ignore
  const _contract = new ethers.Contract(address, abi, signer as ethers.Signer)

  const readProxy = new Proxy({}, {
    get(_, functionName: string) {
      return async (...args: any[]) => {
        try {
          // 展平参数数组
          const flatArgs = args.flat();

          // 检查函数是否在 ABI 中定义
          const hasFunction = hasFunctionInAbi(abi as any[], functionName);

          if (hasFunction) {
            // 直接调用合约函数
            const result = await _contract[functionName](...flatArgs);
            return result;
          } else {
            // 如果是访问映射或数组，可能需要特殊处理
            // 尝试直接访问
            if (functionName in _contract) {
              const result = await _contract[functionName](...flatArgs);
              return result;
            }

            throw new Error(`Function ${functionName} not found in contract ABI`);
          }
        } catch (error) {
          console.error(`Error calling function ${functionName}:`, error);
          throw error;
        }
      };
    }
  });

  const writeProxy = new Proxy({}, {
    get(_, functionName: string) {
      return (...args: any[]) => {
        try {
          // 处理 viem 和 ethers 的参数差异
          const [params = [], overrides = {}] = args;

          // 如果有 value 参数，需要特殊处理
          if (overrides.value) {
            return _contract[functionName](...params, {
              value: overrides.value[0] // viem 使用数组，ethers 使用单个值
            });
          }

          return _contract[functionName](...params);
        } catch (error) {
          console.error(`Error calling write function ${functionName}:`, error);
          throw error;
        }
      };
    }
  });


  return {

    read: readProxy,

    write: writeProxy,
  }
  // const c = viemGetContract({
  //   abi,
  //   address,
  //   client: {
  //     public: viemClients(chainId),
  //     wallet: signer,
  //   },
  // }) as unknown as GetContractReturnType<TAbi, PublicClient, Address>
  //
  // return {
  //   ...c,
  //   account: signer?.account,
  //   chain: signer?.chain,
  // }
}