import React from "react";
import { PageHeader, Tag } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/viken33/CodBets" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🎮️💰️ Cod Bets!"
        subTitle="Challenge your friends on Call of Duty MW for crypto!"
        style={{ cursor: "pointer" }}
        tags={<Tag color="yellow">Demo</Tag>}
      />
    </a>
  );
}
