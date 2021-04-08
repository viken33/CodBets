/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { Alert, Divider, Tooltip, Button } from "antd";
import { Transactor } from "../helpers";
import FunctionForm from "./Contract/FunctionForm";
import { parseEther, parseUnits, formatEther } from "@ethersproject/units";
import { useContractLoader } from "../hooks";
import DisplayVariable from "./Contract/DisplayVariable";

export default function AcceptChallenge({ tx, readContracts, writeContracts, userProvider, provider, gasPrice }) {
  const [refreshRequired, triggerRefresh] = useState(false);

  return (
    <div>
      <FunctionForm
        key={"FF" + "acceptChallenge"}
        contractFunction={writeContracts.CodBets["acceptChallenge"]}
        functionInfo={writeContracts.CodBets.interface.getFunction("acceptChallenge")}
        provider={provider}
        gasPrice={gasPrice}
        triggerRefresh={triggerRefresh}
        writeContracts={writeContracts}
      />
      {/* <Divider /> */}
      <Alert
        message="Accept a Challenge!"
        description="Input the challenge Id, transaction value must be equal to Bet Amount"
        type="info"
        showIcon
      />
      <Divider />
    </div>
  );
}
