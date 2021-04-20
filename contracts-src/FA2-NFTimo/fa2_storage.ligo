#if !FA2_STORAGE
#define FA2_STORAGE

type token_id is nat

type operators_ is set(address)

type sub_account is record [
  balance : nat;
  operators : operators_
]
(*custom ledger *)
type account is map(token_id,sub_account)

type ledger is big_map(address,account)
type info_map is map(string,bytes)
type token_info is record[
  token_id : nat;
  token_info : info_map
]

type storage is record [
  ledger              : ledger;
  owner               : set(address);
  token_ids           : set(token_id);
  token_metadata      : big_map(nat,token_info);
  metadata            : big_map(string,bytes);
  operators_contracts :  set(address);
]
type entrypoint is list (operation) * storage;
#endif