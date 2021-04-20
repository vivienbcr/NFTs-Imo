const { MichelsonMap } = require("@taquito/taquito");
const FA2contract = artifacts.require("contracts/FA2_multi_asset");
const accounts = require("../scripts/sandbox/accounts");
const { encode_to_bytes_hex_format } = require("./../js-helper/encode_to_bytes_hex_format")

const tabbie_sub_account = {
  balance: 100,
  operators: [accounts.alice.pkh],
};

const alice_subAccount_fungible = { balance: 1000, operators: [] };
const alice_subAccount_unfungible_spendable = {
  balance: 1,
  operators: [],
};

const tabbie_account = MichelsonMap.fromLiteral({ 0: tabbie_sub_account });
const alice_account = MichelsonMap.fromLiteral({
  0: alice_subAccount_fungible,
  1: alice_subAccount_unfungible_spendable,
});

const ledger = MichelsonMap.fromLiteral({
  [accounts.alice.pkh]: alice_account,
  [accounts.tabbie.pkh]: tabbie_account,
});

// const token_0_meta = "https://tezos-contract-metas.s3-eu-west-1.amazonaws.com/token_0_metadata.json";
const token_0_meta = require("./../metadatas/token_0_metadata.json")
const token_0_meta_ex = encode_to_bytes_hex_format(JSON.stringify(token_0_meta))
const token_infos_ = MichelsonMap.fromLiteral({"aze" :token_0_meta_ex})

// const token_1_meta = "https://tezos-contract-metas.s3-eu-west-1.amazonaws.com/token_1_metadata.json";
const token_1_meta = require("./../metadatas/token_1_metadata.json")
const token_1_meta_ex = encode_to_bytes_hex_format(JSON.stringify(token_1_meta))
const token_infos_1 = MichelsonMap.fromLiteral({"aze" :token_1_meta_ex})

const token_meta = MichelsonMap.fromLiteral({
  0: { token_id: 0n, token_info: token_infos_ },
  1: {token_id:1n,token_info:token_infos_1}
});
const meta = "https://tezos-contract-metas.s3-eu-west-1.amazonaws.com/metadata.json"
const metahex = encode_to_bytes_hex_format(meta)

const metadata_ = MichelsonMap.fromLiteral({
  "aze":metahex
});

const store = {
  ledger: ledger,
  owner: [accounts.alice.pkh],
  token_ids: [0, 1],
  token_metadata: token_meta,
  metadata: metadata_,
  operators_contracts:[]
};
module.exports = (deployer) => {
  deployer.deploy(FA2contract, store);
};