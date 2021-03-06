/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { Alert, Divider } from "antd";
import { Transactor } from "../helpers";
import FunctionForm from "./Contract/FunctionForm";
import { parseEther, parseUnits, formatEther } from "@ethersproject/units";
import { useContractLoader } from "../hooks";
import DisplayVariable from "./Contract/DisplayVariable";

export default function PlaceChallenge({ tx, readContracts, writeContracts, userProvider, provider, gasPrice }) {
  const [refreshRequired, triggerRefresh] = useState(false);

  return (
    <div>
      <FunctionForm
        key={"FF" + "placeChallenge"}
        contractFunction={writeContracts.CodBets["placeChallenge"]}
        functionInfo={writeContracts.CodBets.interface.getFunction("placeChallenge")}
        provider={provider}
        gasPrice={gasPrice}
        triggerRefresh={triggerRefresh}
        writeContracts={writeContracts}
      />
      {/* <Divider /> */}
      <Alert
        message="Create a Challenge!"
        description="Gamertags are as they appear on the game without the hashtag.
        (if is shown as 'player#123456' , just input 'player'). 
        Include your opponents Address.
        Bet amout must be equal to transaction value"
        type="info"
        showIcon
      />
      <Divider />
    </div>
  );
}
