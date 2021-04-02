/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { Row, Col, Input, InputGroup, Divider, Tooltip, Button } from "antd";
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
    </div>
  );
}
