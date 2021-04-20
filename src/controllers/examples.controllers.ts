import { Request, Response } from "express";
import { getSignerFactory } from "./../services/taquito.services/signers"
import { TezosToolkit } from "@taquito/taquito";

export const exampleController = async (req:Request, res:Response) => {
  console.log("Welcome to the wa ", req.body);
  try {
    const accounts = require("./../scripts/sandbox/accounts");
    const rpc = "http://flex-tesa:20000";
  
    let alice_account: TezosToolkit;
    alice_account = await getSignerFactory(rpc, accounts.alice.sk);
    console.log(await alice_account.rpc.getBalance(await alice_account.signer.publicKeyHash()))
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};
