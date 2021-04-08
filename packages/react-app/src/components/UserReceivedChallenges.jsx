/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect, useCallback } from "react";
import { Table, Space, Spin } from "antd";
import { BigNumber } from "@ethersproject/bignumber";

const UserReceivedChallenges = ({ tx, readContracts, address, writeContracts, userProvider, provider, gasPrice }) => {
  const [refreshRequired, triggerRefresh] = useState(false);
  const [dataSource, setdataSource] = useState([]);

  const readcon = useCallback(async () => {
    try {
      const challenges = await readContracts.CodBets.viewReceivedChallenges(address);

      challenges.forEach((el, key) => {
        readContracts.CodBets.challenges(el).then(e => {
          dataSource[key] = {
            key: `${key + 1}`,
            challengeid: BigNumber.from(el).toString(),
            usertag1: e.gamertag1,
            amount: BigNumber.from(e.amount).toString(),
            accepted: e.accepted ? "Yes" : "Not Yet",
            settled: e.winner,
          };
        });
      });

      setdataSource([...dataSource].reverse());
    } catch (e) {
      console.log(e);
    }
  }, [setdataSource, triggerRefresh]);

  useEffect(() => {
    readcon();
  }, [readcon, refreshRequired, provider, tx]);

  const columns = [
    {
      title: "Challenge Id",
      dataIndex: "challengeid",
      key: "challengeid",
    },
    {
      title: "Opponent",
      dataIndex: "usertag1",
      key: "usertag1",
    },
    {
      title: "Bet Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Accepted",
      dataIndex: "accepted",
      key: "accepted",
    },
    {
      title: "Winner",
      dataIndex: "settled",
      key: "settled",
    },
  ];

  return !dataSource.length ? (
    <Spin size="large" />
  ) : (
    <div>
      <Table dataSource={dataSource} columns={columns} />
    </div>
  );
};

export default UserReceivedChallenges;
