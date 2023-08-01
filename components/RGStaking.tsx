import { BigNumber, ethers } from "ethers"
import React, { ChangeEvent, useCallback, useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"

import { Button, Loading, Typography, notifyType, useNotification } from "@web3uikit/core"

import { RGStakingABI, RGStakingAddresses, RGTokenABI, RGTokenAddresses } from "@/constants/"

import AssetManagement from "./AssetManagement"
import ContractInfo from "./ContractInfo"

interface contractAddressesInterface {
  [key: string]: string[]
}

const RGStaking = () => {
  const [amountOfAssets, setAmountOfAssets] = useState("1")
  const assetsToTokenPrice = amountOfAssets
    ? ethers.utils.parseUnits(amountOfAssets.toString(), 18).mul(10)
    : ethers.constants.Zero

  const [userTokenBalance, setUserTokenBalance] = useState("")
  const [totalRewardPool, setTotalRewardPool] = useState("")
  const [currentRewardsClaimable, setCurrentRewardsClaimable] = useState("")
  const [assetBalance, setAssetBalance] = useState("")
  const [allowance, setAllowance] = useState(BigNumber.from(0))

  const [loading, setLoading] = useState(true)

  const { chainId: hexChainId, isWeb3Enabled, account } = useMoralis()
  const chainId = parseInt(hexChainId!).toString()

  const rGStakingAddresses: contractAddressesInterface = RGStakingAddresses
  const rGStakingAddress = chainId in rGStakingAddresses ? rGStakingAddresses[chainId].at(-1) : null

  const rGTokenAddresses: contractAddressesInterface = RGTokenAddresses
  const rGTokenAddress = chainId in rGTokenAddresses ? rGTokenAddresses[chainId].at(-1) : null

  const dispatch = useNotification()

  const { runContractFunction: getAllowance } = useWeb3Contract({
    abi: RGTokenABI,
    contractAddress: rGTokenAddress!,
    functionName: "allowance",
    params: { owner: account, spender: rGStakingAddress },
  })

  const { runContractFunction: balanceOf } = useWeb3Contract({
    abi: RGTokenABI,
    contractAddress: rGTokenAddress!,
    functionName: "balanceOf",
    params: { account },
  })

  const {
    runContractFunction: claimRewards,
    isFetching: claimRewardsFetching,
    isLoading: claimRewardsLoading,
  } = useWeb3Contract({
    abi: RGStakingABI,
    contractAddress: rGStakingAddress!,
    functionName: "claimRewards",
    params: {},
  })

  const { runContractFunction: getCurrentRewardsClaimable } = useWeb3Contract({
    abi: RGStakingABI,
    contractAddress: rGStakingAddress!,
    functionName: "currentRewardsClaimable",
    params: { account },
  })

  const { runContractFunction: getAssetBalance } = useWeb3Contract({
    abi: RGStakingABI,
    contractAddress: rGStakingAddress!,
    functionName: "assetBalance",
    params: { account },
  })

  const { runContractFunction: getTotalRewardPool } = useWeb3Contract({
    abi: RGStakingABI,
    contractAddress: rGStakingAddress!,
    functionName: "totalRewardPool",
    params: {},
  })

  function handleNotification(message: string, type: notifyType) {
    dispatch({
      type,
      message,
      title: type === "error" ? "Transaction Error" : "Transaction Notification",
      position: "topR",
    })
  }

  const updateState = useCallback(async () => {
    const assetBalance = ((await getAssetBalance()) as BigNumber).toString()
    setAssetBalance(assetBalance)

    const currentRewardsClaimable = ((await getCurrentRewardsClaimable()) as BigNumber).toString()
    setCurrentRewardsClaimable(ethers.utils.formatUnits(currentRewardsClaimable, 18))

    const totalRewardPool = ((await getTotalRewardPool()) as BigNumber).toString()
    setTotalRewardPool(ethers.utils.formatUnits(totalRewardPool, 18))

    const userTokenBalance = ((await balanceOf()) as BigNumber).toString()
    setUserTokenBalance(ethers.utils.formatUnits(userTokenBalance, 18))

    const allowance = (await getAllowance()) as BigNumber
    setAllowance(allowance)

    setLoading(false)
  }, [balanceOf, getAllowance, getCurrentRewardsClaimable, getTotalRewardPool, getAssetBalance])

  useEffect(() => {
    if (account && isWeb3Enabled && rGStakingAddress && rGTokenAddress) {
      updateState()
    }
  }, [account, isWeb3Enabled, rGStakingAddress, rGTokenAddress, updateState])

  async function handleClaimRewardsSuccess(tx: any) {
    handleTransactionSuccess(tx, "Rewards claimed successfully!")
  }

  async function handleTransactionSuccess(tx: any, message: string) {
    handleTransactionSubmitted()

    await tx.wait(1)
    handleNotification(message, "success")

    updateState()
  }

  function handleTransactionSubmitted() {
    handleNotification("Transaction submitted, please wait for confirmation.", "info")
  }

  function handleFailedTransactionSubmission(tx: any) {
    const error = tx.data ? tx.data.message : tx.message
    handleNotification(error, "error")

    updateState()
  }

  function callClaimRewards() {
    claimRewards({
      onSuccess: handleClaimRewardsSuccess,
      onError: handleFailedTransactionSubmission,
    })
  }

  return (
    <div className="zoom m-8 block justify-center items-center mx-auto max-w-lg">
      {!account ? (
        <Typography>Please connect your Wallet to continue.</Typography>
      ) : !(rGStakingAddress && rGTokenAddress) ? (
        <Typography>Please switch to the Avalanche Fuji Test network to continue.</Typography>
      ) : loading ? (
        <div
          className="flex mt-20 justify-center items-center mx-auto max-w-lg"
          style={{
            backgroundColor: "#FFF",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <Loading size={100} spinnerColor="#2E7DAF" />
        </div>
      ) : (
        <div>
          <ContractInfo
            assetBalance={assetBalance}
            currentRewardsClaimable={currentRewardsClaimable}
            totalRewardPool={totalRewardPool}
            userTokenBalance={userTokenBalance}
          />
          <AssetManagement
            amountOfAssets={amountOfAssets}
            assetsToTokenPrice={assetsToTokenPrice}
            rGStakingAddress={rGStakingAddress}
            rGTokenAddress={rGTokenAddress}
            allowance={allowance}
            handleTransactionSuccess={handleTransactionSuccess}
            handleFailedTransactionSubmission={handleFailedTransactionSubmission}
            handleTransactionSubmitted={handleTransactionSubmitted}
            handleNotification={handleNotification}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setAmountOfAssets(event.currentTarget.value)
            }}
          />

          <div className="my-20">
            <Button
              isFullWidth
              color="green"
              onClick={callClaimRewards}
              text={`Claim Rewards`}
              theme="colored"
              isLoading={claimRewardsFetching || claimRewardsLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default RGStaking
