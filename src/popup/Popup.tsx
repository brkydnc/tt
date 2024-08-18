import React from "react";
import { Tureng, TurengAPI } from "../api/tureng";
import { Dictionary } from "../api/types";

const tureng = new Tureng() as TurengAPI;
tureng.search("aaaaa", Dictionary.Turkish)
  .then(console.log)
  .catch(console.log);

export default function Popup(): JSX.Element {
  return (
    <p>Hello world</p>
  );
}