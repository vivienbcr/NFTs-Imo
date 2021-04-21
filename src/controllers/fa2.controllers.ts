import { Request, Response } from "express";
import { getSignerFactory } from "./../services/taquito.services/signers";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";

import { encode_to_bytes_hex_format } from "./../../ts-helper/encode_to_bytes_hex_format";
const RPC_ADDR: string = process.env.RPC_TEZOS
  ? process.env.RPC_TEZOS
  : "http://flex-tesa:20000";
const FA2_CONTRACT_ADDR: string = process.env.FA2_ADDR
  ? process.env.FA2_ADDR
  : "KT1FA71Md3ZAZ8bh7KZtoSfRpvHfeu8y7ShJ";
const OWNER_PK: string = process.env.CONTRACT_OWNER_PK
  ? process.env.CONTRACT_OWNER_PK
  : "";
export const postMint = async (req: Request, res: Response) => {
  console.log("Min token on contract ", FA2_CONTRACT_ADDR);
  try {
    if (typeof req.body === "undefined") {
      throw new Error("body is empty");
    }
    if (typeof req.body.to_ !== "string") {
      throw new Error("to_ parameter is not defined");
    }
    if (typeof req.body.token_id !== "number") {
      throw new Error("token_id parameter is not defined");
    }
    if (typeof req.body.amount !== "number") {
      throw new Error("amount parameter is not defined");
    }
    if (typeof req.body.token_meta !== "object") {
      throw new Error("token_meta parameter is not defined");
    }
    let encodedAttributes: any = {};
    if (req.body.token_id !== 0) {
      const tokenMetaKeys = Object.keys(req.body.token_meta);
      if (!tokenMetaKeys.includes("decimals")) {
        throw new Error("token_meta.decimals parameter is not defined");
      }
      if (!tokenMetaKeys.includes("name")) {
        throw new Error("token_meta.name parameter is not defined");
      }
      if (!tokenMetaKeys.includes("symbol")) {
        throw new Error("token_meta.symbol parameter is not defined");
      }
      if (!tokenMetaKeys.includes("thumbnailUri")) {
        throw new Error(
          "token_meta.thumbnailUri parameter is not defined, use DEFAULT to set default thumbnailUri"
        );
      }
      if (
        !tokenMetaKeys.includes(
          "attributes" || !Array.isArray(req.body.token_meta.attributes)
        )
      ) {
        throw new Error(
          'token_meta.attributes parameter is not defined or is not valid array at format \
        [{"name": "Base", "value": "Starfish"},{"name": "Eyes", "value": "Big"},]'
        );
      }
      tokenMetaKeys.forEach((key) => {
        if (key === "attributes") {
          encodedAttributes[key] = encode_to_bytes_hex_format(
            JSON.stringify(req.body.token_meta[key])
          );
        } else {
          encodedAttributes[key] = encode_to_bytes_hex_format(
            req.body.token_meta[key].toString()
          );
        }
      });
    }

    let tz_acct: TezosToolkit;
    tz_acct = await getSignerFactory(RPC_ADDR, OWNER_PK);
    const contract = await tz_acct.contract.at(FA2_CONTRACT_ADDR);
    const params: any = [
      {
        to_: req.body.to_,
        amount: req.body.amount,
        token_id: req.body.token_id,
        token_meta: MichelsonMap.fromLiteral(encodedAttributes),
      },
    ];
    const operation = await contract.methods.mint(params).send();
    const opHash = await operation
      .confirmation(1)
      .then(() => {
        return operation.hash;
      })
      .catch((err) => {
        console.error("PostMint contract call error ", err);
        throw Error(err.message);
      });
    // console.log(opHash);
    res.status(200).json({ op_hash: opHash });
  } catch (err) {
    console.error(err);
    res.status(500).send("Critical Error " + err.message);
  }
};
