import { BigNumber } from "ethers"
import { ethers } from "ethers"
import React from "react"
import { ChangeEvent } from "react"
import { useWeb3Contract } from "react-moralis"

import { Button, Input } from "@web3uikit/core"

import { RGStakingABI, RGTokenABI } from "@/constants/"

interface Props {
  amountOfAssets: string
  assetsToTokenPrice: BigNumber
  rGStakingAddress: string
  rGTokenAddress: string
  allowance: BigNumber
  handleTransactionSuccess: (tx: any, message: string) => void
  handleFailedTransactionSubmission: (tx: any) => void
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const AssetManagement = ({
  amountOfAssets,
  assetsToTokenPrice,
  rGStakingAddress,
  rGTokenAddress,
  allowance,
  handleTransactionSuccess,
  handleFailedTransactionSubmission,
  onChange,
}: Props) => {
  const { runContractFunction: approve } = useWeb3Contract({
    abi: RGTokenABI,
    contractAddress: rGTokenAddress!,
    functionName: "approve",
    params: { spender: rGStakingAddress, amount: assetsToTokenPrice },
  })

  const {
    runContractFunction: buyAssets,
    isFetching: buyAssetsFetching,
    isLoading: buyAssetsLoading,
  } = useWeb3Contract({
    abi: RGStakingABI,
    contractAddress: rGStakingAddress!,
    functionName: "buyAssets",
    params: { amountOfAssets: amountOfAssets },
  })

  const {
    runContractFunction: redeemAssets,
    isFetching: redeemAssetsFetching,
    isLoading: redeemAssetsLoading,
  } = useWeb3Contract({
    abi: RGStakingABI,
    contractAddress: rGStakingAddress!,
    functionName: "redeemAssets",
    params: { amountOfAssets: amountOfAssets },
  })

  async function handleTokensApprovalSuccess(tx: any) {
    handleTransactionSuccess(tx, "Tokens Approval Success!")
    callBuyAssets()
  }

  async function handleAssetsBoughtSuccess(tx: any) {
    handleTransactionSuccess(tx, "Assets purchased successfully!")
  }

  async function handleRedeemAssetsSuccess(tx: any) {
    handleTransactionSuccess(tx, "Assets redeemed successfully!")
  }

  function callBuyAssets() {
    buyAssets({
      onSuccess: handleAssetsBoughtSuccess,
      onError: handleFailedTransactionSubmission,
    })
  }

  function callRedeemAssets() {
    if (!amountOfAssets) return

    redeemAssets({
      onSuccess: handleRedeemAssetsSuccess,
      onError: handleFailedTransactionSubmission,
    })
  }

  function callApproveAndBuyAssets() {
    if (!amountOfAssets) return

    if (allowance.lt(assetsToTokenPrice)) {
      approve({
        onSuccess: handleTokensApprovalSuccess,
        onError: handleFailedTransactionSubmission,
      })
    } else {
      callBuyAssets()
    }
  }

  return (
    <>
      <div className="mt-20">
        <Input
          validation={{
            required: true,
            numberMin: 1,
          }}
          value={amountOfAssets}
          width="100%"
          label="Number of Assets to Buy/Redeem"
          name="numberOfAssets"
          type="number"
          description={`You will Pay/Receive ${ethers.utils.formatUnits(assetsToTokenPrice, 18)} RGT (10 RGT/Asset).`}
          onChange={onChange}
        />
      </div>
      <div className="my-6 flex space-x-4 justify-center items-center">
        <Button
          color="blue"
          onClick={callApproveAndBuyAssets}
          text={`Buy Assets`}
          theme="colored"
          isLoading={buyAssetsFetching || buyAssetsLoading}
        />
        <Button
          color="red"
          onClick={callRedeemAssets}
          text={`Redeem Assets`}
          theme="colored"
          isLoading={redeemAssetsFetching || redeemAssetsLoading}
        />
      </div>
    </>
  )
}

export default AssetManagement
