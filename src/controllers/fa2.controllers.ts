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

export const emulateProposal = async (req: Request, res: Response) => {
  try {
    const accounts = require("./../../scripts/sandbox/accounts");

    let alice_account = await getSignerFactory(RPC_ADDR, accounts.alice.sk);
    let stella_account = await getSignerFactory(RPC_ADDR, accounts.stella.sk);
    let mallory_account = await getSignerFactory(RPC_ADDR, accounts.mallory.sk);
    let bob_account = await getSignerFactory(RPC_ADDR, accounts.bob.sk);
    let tz_acct = await getSignerFactory(RPC_ADDR, OWNER_PK);
    const contract = await tz_acct.contract.at(FA2_CONTRACT_ADDR);

    const params_add_op: any = [
      {
        add_operator: {
          owner: await tz_acct.signer.publicKeyHash(),
          operator: {
            operator: await bob_account.signer.publicKeyHash(),
            token_id: 2,
          },
        },
      },
      {
        add_operator: {
          owner: await tz_acct.signer.publicKeyHash(),
          operator: {
            operator: await mallory_account.signer.publicKeyHash(),
            token_id: 2,
          },
        },
      },
    ];
    const operation_add_op = await contract.methods
      .update_operators(params_add_op)
      .send()
      .catch((err) => {
        console.error("add operator err err ", err);
        throw err;
      });
    const add_op_hash = await operation_add_op.confirmation(1);

    const params: any = {
      token_id: 2,
      to_: await stella_account.signer.publicKeyHash(),
      from_: await tz_acct.signer.publicKeyHash(),
      nb_signer: 3,
    };
    const operation_creat_pro = await contract.methods
      .createProposal(
        params.token_id,
        params.to_,
        params.from_,
        params.nb_signer
      )
      .send()
      .catch((err) => {
        console.error("createPropal err ", err);
        throw err;
      });
    const creat_pro_op_hash = await operation_creat_pro.confirmation(1);
    res.status(200).send({
      op_add_operator: add_op_hash,
      op_create_proposal: creat_pro_op_hash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};

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
