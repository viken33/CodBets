/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Tabs, Row, Col, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SecurityScanTwoTone, SyncOutlined } from "@ant-design/icons";
import {
  Address,
  Balance,
  AcceptChallenge,
  PlaceChallenge,
  UserChallenges,
  ActLogin,
  UserReceivedChallenges,
} from "../components";
import { BigNumber } from "@ethersproject/bignumber";
import { parseEther, parseUnits, formatEther } from "@ethersproject/units";
import { Transactor } from "../helpers";

export default function ExampleUI({
  address,
  mainnetProvider,
  userProvider,
  localProvider,
  yourLocalBalance,
  price,
  gasPrice,
  tx,
  readContracts,
  writeContracts,
}) {
  const { TabPane } = Tabs;

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h2>CodBets Challenges</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Tabs defaultActiveKey="1" centered>
            <TabPane tab="Activision Login" key="1">
              <div style={{ margin: "auto", marginBottom: 20 }}>Input your Activision account and CoD MW gamertag</div>
              <ActLogin />
            </TabPane>
            <TabPane tab="Your Challenges" key="2">
              {readContracts && writeContracts ? (
                <PlaceChallenge
                  readContracts={readContracts}
                  writeContracts={writeContracts}
                  tx={tx}
                  provider={userProvider}
                  gasPrice={gasPrice}
                />
              ) : null}
              {readContracts && writeContracts ? (
                <UserChallenges
                  readContracts={readContracts}
                  writeContracts={writeContracts}
                  tx={tx}
                  provider={userProvider}
                  gasPrice={gasPrice}
                  address={address}
                />
              ) : null}
            </TabPane>
            <TabPane tab="Incoming Challenges" key="3">
              {readContracts && writeContracts ? (
                <AcceptChallenge
                  readContracts={readContracts}
                  writeContracts={writeContracts}
                  tx={tx}
                  provider={userProvider}
                  gasPrice={gasPrice}
                />
              ) : null}
              {readContracts && writeContracts ? (
                <UserReceivedChallenges
                  readContracts={readContracts}
                  writeContracts={writeContracts}
                  tx={tx}
                  provider={userProvider}
                  gasPrice={gasPrice}
                  address={address}
                />
              ) : null}
            </TabPane>
          </Tabs>
        </div>
        <Divider />
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        {/* <List
          bordered
          dataSource={setPurposeEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + item.sender + "_" + item.purpose}>
                <Address address={item[0]} ensProvider={mainnetProvider} fontSize={16} /> =>
                {item[1]}
              </List.Item>
            );
          }}
        /> */}
      </div>
    </div>
  );
}
