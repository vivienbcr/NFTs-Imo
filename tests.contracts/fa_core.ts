import { assert } from "chai";
import { getSignerFactory } from "../src/services/taquito.services/signers";
import { getContractAddressFromBuild } from "../src/services/taquito.services/contracts";
import { TezosToolkit } from "@taquito/taquito";
const accounts = require("../scripts/sandbox/accounts");
const rpc = "http://localhost:20000";
let alice_account: TezosToolkit, bob_account: TezosToolkit;
let FA2_ADDR: string;

before(async function () {


  alice_account = await getSignerFactory(rpc, accounts.alice.sk);
  alice_account.setProvider({
    config: { confirmationPollingIntervalSecond: 1 },
  });
  
  bob_account = await getSignerFactory(rpc, accounts.bob.sk);
  bob_account.setProvider({ config: { confirmationPollingIntervalSecond: 1 } }); 
  
  FA2_ADDR = getContractAddressFromBuild("FA2_multi_assets");
  console.log(`@FA2 : ${FA2_ADDR} `);


});


describe("TestFA2", async () => {
    it("Check Alice is owner", async () => {
      let FA2_storage: any = await (
        await alice_account.contract.at(FA2_ADDR)
      ).storage();
      assert.equal(
        await FA2_storage.owner.includes(
          await alice_account.signer.publicKeyHash()
        ),
        true,
        "Alice is not FA2 owner"
      );
    });
})