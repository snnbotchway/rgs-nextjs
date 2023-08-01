import React from "react"

import { Typography } from "@web3uikit/core"

interface Props {
  totalRewardPool: string
  userTokenBalance: string
  currentRewardsClaimable: string
  assetBalance: string
}

const ContractInfo = ({ totalRewardPool, userTokenBalance, currentRewardsClaimable, assetBalance }: Props) => {
  return (
    <>
      <Typography className="block">
        Total Reward Pool: <strong>{totalRewardPool} RGT</strong>
      </Typography>

      <Typography className="block">
        Your RGT Balance: <strong>{userTokenBalance} RGT</strong>
      </Typography>

      <Typography className="block">
        Current Rewards Claimable: <strong>{currentRewardsClaimable}</strong>
      </Typography>

      <Typography className="block">
        Assets you own: <strong>{assetBalance}</strong>
      </Typography>
    </>
  )
}

export default ContractInfo
