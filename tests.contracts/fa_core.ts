import { assert } from "chai";
import { getSignerFactory } from "../src/services/taquito.services/signers";
import { getContractAddressFromBuild } from "../src/services/taquito.services/contracts";
import { TezosToolkit } from "@taquito/taquito";
import { MichelsonMap } from "@taquito/taquito";
import { encode_to_bytes_hex_format } from "./../ts-helper/encode_to_bytes_hex_format";
const accounts = require("../scripts/sandbox/accounts");
const rpc = "http://localhost:20000";
let alice_account: TezosToolkit,
  bob_account: TezosToolkit,
  mallory_account: TezosToolkit,
  trent_account: TezosToolkit,
  stella_account: TezosToolkit;
let FA2_CONTRACT_ADDR: string;

before(async function () {
  alice_account = await getSignerFactory(rpc, accounts.alice.sk);
  alice_account.setProvider({
    config: { confirmationPollingIntervalSecond: 1 },
  });

  bob_account = await getSignerFactory(rpc, accounts.bob.sk);
  bob_account.setProvider({ config: { confirmationPollingIntervalSecond: 1 } });

  mallory_account = await getSignerFactory(rpc, accounts.mallory.sk);
  mallory_account.setProvider({
    config: { confirmationPollingIntervalSecond: 1 },
  });

  trent_account = await getSignerFactory(rpc, accounts.trent.sk);
  trent_account.setProvider({
    config: { confirmationPollingIntervalSecond: 1 },
  });
  stella_account = await getSignerFactory(rpc, accounts.stella.sk);
  stella_account.setProvider({
    config: { confirmationPollingIntervalSecond: 1 },
  });

  FA2_CONTRACT_ADDR = getContractAddressFromBuild("FA2_multi_assets");
  console.log(`@FA2 : ${FA2_CONTRACT_ADDR} `);

  console.log(
    await (await alice_account.contract.at(FA2_CONTRACT_ADDR)).methods
  );
  const operation = await alice_account.wallet
    .batch()
    .withTransfer({
      to: await mallory_account.signer.publicKeyHash(),
      amount: 5,
    })
    .withTransfer({
      to: await trent_account.signer.publicKeyHash(),
      amount: 5,
    })
    .send();
  await operation.confirmation(1);
});

describe("TestFA2", async () => {
  it("Check Alice is owner", async () => {
    let FA2_storage: any = await (
      await alice_account.contract.at(FA2_CONTRACT_ADDR)
    ).storage();
    assert.equal(
      await FA2_storage.owner.includes(
        await alice_account.signer.publicKeyHash()
      ),
      true,
      "Alice is not FA2 owner"
    );
  });
  it("Mint Bob housse", async () => {
    const contract = await alice_account.contract.at(FA2_CONTRACT_ADDR);
    const token_infos_666 = {
      decimals: encode_to_bytes_hex_format("0"),
      name: encode_to_bytes_hex_format("Ma Maison"),
      symbol: encode_to_bytes_hex_format("HOME"),
      thumbnailUri: encode_to_bytes_hex_format(
        "https://imostz.s3.eu-west-3.amazonaws.com/logo_square.png"
      ),
      attributes: encode_to_bytes_hex_format(
        '[{"name": "Base", "value": "Starfish"},{"name": "Eyes", "value": "Big"},]'
      ),
    };
    const params: any = [
      {
        to_: await bob_account.signer.publicKeyHash(),
        amount: 1,
        token_id: 666,
        token_meta: MichelsonMap.fromLiteral(token_infos_666),
      },
    ];
    const operation = await contract.methods.mint(params).send();
    await operation.confirmation(1);
    let FA2_storage: any = await (
      await alice_account.contract.at(FA2_CONTRACT_ADDR)
    ).storage();
    const n_bob_ledger = await FA2_storage.ledger.get(
      await bob_account.signer.publicKeyHash()
    );
    assert.equal(
      Number(await n_bob_ledger.get("666").balance),
      1,
      "Bob account not credited"
    );
  });
  it("ERROR Bob try to send without approuval", async () => {
    const contract = await bob_account.contract.at(FA2_CONTRACT_ADDR);
    const params = [
      {
        from_: await bob_account.signer.publicKeyHash(),
        txs: [
          {
            to_: await stella_account.signer.publicKeyHash(),
            token_id: 666,
            amount: 1,
          },
        ],
      },
    ];
    const err = await contract.methods
      .transfer(params)
      .send()
      .catch((err) => {
        return err.message;
      });
    assert.equal(err, "FA2_TRANSFER_NO_PROPOSAL", "Incorrect error message");
    const FA2_storage: any = await contract.storage();
    const n_bob_ledger = await FA2_storage.ledger.get(
      await bob_account.signer.publicKeyHash()
    );
    assert.equal(
      Number(await n_bob_ledger.get("666").balance),
      1,
      "Bob account not debited"
    );
    const n_stella_ledger = await FA2_storage.ledger.get(
      await stella_account.signer.publicKeyHash()
    );
    assert.equal(
      typeof n_stella_ledger === "undefined",
      true,
      "Stella account not credited"
    );
  });
  it("Bob try to edit metadata", async () => {
    const contract = await bob_account.contract.at(FA2_CONTRACT_ADDR);

    const attributes = [
      { name: "surface", value: 280 },
      { name: "pieces", value: 9 },
      { name: "dpe", value: 207 },
      { name: "ges", value: 6 },
      { name: "price", value: 183000 },
    ];
    const params = {
      token_id: 666,
      from_: await bob_account.signer.publicKeyHash(),
      attributes: encode_to_bytes_hex_format(JSON.stringify(attributes)),
    };
    const operation = await contract.methods
      .updateMetadata(params.token_id, params.from_, params.attributes)
      .send();

    await operation.confirmation(1);

    const FA2_storage: any = await contract.storage();
    const tokenmeta = await FA2_storage.token_metadata.get("666");
    const str: string = await tokenmeta.token_info.get("attributes");
    const decoded = JSON.parse(Buffer.from(str, "hex").toString());
    assert.equal(decoded[0].name, attributes[0].name, "Wrong attributes");
    assert.equal(decoded[0].value, attributes[0].value, "Wrong attributes");
    assert.equal(decoded[1].name, attributes[1].name, "Wrong attributes");
    assert.equal(decoded[1].value, attributes[1].value, "Wrong attributes");
    assert.equal(decoded[2].name, attributes[2].name, "Wrong attributes");
    assert.equal(decoded[2].value, attributes[2].value, "Wrong attributes");
    assert.equal(decoded[3].name, attributes[3].name, "Wrong attributes");
    assert.equal(decoded[3].value, attributes[3].value, "Wrong attributes");
  });

  it("Bob Set operators", async () => {
    const contract = await bob_account.contract.at(FA2_CONTRACT_ADDR);
    let FA2_storage: any = await (
      await bob_account.contract.at(FA2_CONTRACT_ADDR)
    ).storage();
    const bob_ledger = await FA2_storage.ledger.get(
      await bob_account.signer.publicKeyHash()
    );
    assert.equal(
      (await bob_ledger.get("666").operators.length) === 0,
      true,
      "Bob operators is not emptuy"
    );
    const params: any = [
      {
        add_operator: {
          owner: await bob_account.signer.publicKeyHash(),
          operator: {
            operator: await mallory_account.signer.publicKeyHash(),
            token_id: 666,
          },
        },
      },
      {
        add_operator: {
          owner: await bob_account.signer.publicKeyHash(),
          operator: {
            operator: await trent_account.signer.publicKeyHash(),
            token_id: 666,
          },
        },
      },
    ];
    const operation = await contract.methods.update_operators(params).send();
    await operation.confirmation(1);
    FA2_storage = await (
      await bob_account.contract.at(FA2_CONTRACT_ADDR)
    ).storage();
    const n_bob_ledger = await FA2_storage.ledger.get(
      await bob_account.signer.publicKeyHash()
    );
    assert.equal(
      await n_bob_ledger
        .get("666")
        .operators.includes(await mallory_account.signer.publicKeyHash()),
      true,
      "Mallory is not bob operator"
    );
    assert.equal(
      await n_bob_ledger
        .get("666")
        .operators.includes(await trent_account.signer.publicKeyHash()),
      true,
      "Trent is not bob operator"
    );
  });
  it("Bob Create proposal for nft 666", async () => {
    const contract = await bob_account.contract.at(FA2_CONTRACT_ADDR);

    const params: any = {
      token_id: 666,
      to_: await stella_account.signer.publicKeyHash(),
      from_: await bob_account.signer.publicKeyHash(),
      nb_signer: 2,
    };
    const operation = await contract.methods
      .createProposal(
        params.token_id,
        params.to_,
        params.from_,
        params.nb_signer
      )
      .send();
    await operation.confirmation(1);
    let FA2_storage: any = await (
      await bob_account.contract.at(FA2_CONTRACT_ADDR)
    ).storage();
    const proposals_token_666 = await FA2_storage.proposals.get("666");
    assert.equal(
      proposals_token_666.from_,
      await bob_account.signer.publicKeyHash(),
      "Proposal was not emite by bob"
    );
    assert.equal(
      proposals_token_666.to_,
      await stella_account.signer.publicKeyHash(),
      "Proposal is not destinate to stella"
    );
    assert.equal(
      proposals_token_666.signers.includes(
        await bob_account.signer.publicKeyHash()
      ),
      true,
      "Bob was not added to proposal signers"
    );
  });
  it("Mallory and Trent sign proposal", async () => {
    const contract_mallory = await mallory_account.contract.at(
      FA2_CONTRACT_ADDR
    );
    const contract_trent = await trent_account.contract.at(FA2_CONTRACT_ADDR);

    const params: any = {
      token_id: 666,
      from_: await bob_account.signer.publicKeyHash(),
    };
    const operation_1 = await contract_mallory.methods
      .signProposal(params.token_id, params.from_)
      .send();
    await operation_1.confirmation(1);
    const operation_2 = await contract_trent.methods
      .signProposal(params.token_id, params.from_)
      .send();
    await operation_2.confirmation(1);
    let FA2_storage: any = await (
      await bob_account.contract.at(FA2_CONTRACT_ADDR)
    ).storage();

    const proposals_token_666 = await FA2_storage.proposals.get("666");

    assert.equal(
      proposals_token_666.signers.includes(
        await mallory_account.signer.publicKeyHash()
      ),
      true,
      "mallory_account was not added to proposal signers"
    );
    assert.equal(
      proposals_token_666.signers.includes(
        await trent_account.signer.publicKeyHash()
      ),
      true,
      "trent_account was not added to proposal signers"
    );
  });
  it("Bob transfer token with approuved proposal", async () => {
    const contract = await bob_account.contract.at(FA2_CONTRACT_ADDR);
    const params = [
      {
        from_: await bob_account.signer.publicKeyHash(),
        txs: [
          {
            to_: await stella_account.signer.publicKeyHash(),
            token_id: 666,
            amount: 1,
          },
        ],
      },
    ];
    const operation = await contract.methods.transfer(params).send();
    await operation.confirmation(1);

    const FA2_storage: any = await contract.storage();
    const n_bob_ledger = await FA2_storage.ledger.get(
      await bob_account.signer.publicKeyHash()
    );
    assert.equal(
      Number(await n_bob_ledger.get("666").balance),
      0,
      "Bob account not debited"
    );
    const n_stella_ledger = await FA2_storage.ledger.get(
      await stella_account.signer.publicKeyHash()
    );
    assert.equal(
      Number(await n_stella_ledger.get("666").balance),
      1,
      "Stella account not credited"
    );
  });
});
