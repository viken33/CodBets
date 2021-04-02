/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect, useCallback } from "react";
import { Table } from "antd";
import { BigNumber } from "@ethersproject/bignumber";

const UserReceivedChallenges = ({ tx, readContracts, address, writeContracts, userProvider, provider, gasPrice }) => {
  const [refreshRequired, triggerRefresh] = useState(false);
  const [dataSource, setdataSource] = useState([]);

  const readcon = useCallback(async () => {
    const challenges = await readContracts.CodBets.viewReceivedChallenges(address);

    challenges.forEach((el, key) => {
      readContracts.CodBets.challenges(el).then(e => {
        dataSource[key] = {
          key: `${key + 1}`,
          challengeid: BigNumber.from(el).toString(),
          usertag1: e.gamertag1,
          amount: BigNumber.from(e.amount).toString(),
          accepted: e.accepted ? "Yes" : "No",
          settled: e.settled ? "Yes" : "No",
        };
      });
    });

    setdataSource([...dataSource]);
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
      title: "Usertag1",
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
      title: "Settled",
      dataIndex: "settled",
      key: "settled",
    },
  ];

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} />
    </div>
  );
};
export default UserReceivedChallenges;
