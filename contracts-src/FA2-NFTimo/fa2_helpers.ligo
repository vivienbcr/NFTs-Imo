#if !FA2_HELPERS
#define FA2_HELPERS
#include "fa2_interfaces.ligo"

const default_token_id : token_id = 0n;

type amt is nat
function fail_on( const condition : bool; const message : string) : unit is if condition then failwith (message) else unit

function merge_operations
  ( const fst : list (operation)
  ; const snd : list (operation)
  ) : list (operation) is List.fold
    ( function
      ( const operations : list (operation)
      ; const operation  : operation
      ) : list (operation) is operation # operations
    , fst
    , snd
    )
function verifyContractOwner(const addr : address;const store : storage):unit is if not Set.mem(addr, store.owner) then failwith("FA2_not_owner") else unit;

(* Helper function to get account *)
function getAccount (const addr : address; const s : storage) : account is
  block {
    var acct : account := Map.empty;
    case s.ledger[addr] of
      None -> skip
    | Some(instance) -> acct := instance
    end;
  } with acct

(* HELPER getSubAccount - return existing subaccount attached to token id,return empty account if given token id have not entry in main account*)
function getSubAccount(const token_id : nat; const acct : account): sub_account is

  block{
    const empty_set : set(address) = Set.empty;
    var sub_acct : sub_account := record [
      balance = 0n;
      operators = empty_set
    ];
    case Map.find_opt(token_id, acct) of
        None -> skip
      | Some(subacct)-> sub_acct:= subacct
      end;
  } with sub_acct

function is_valid_operator( const external_sub_acct : sub_account ; const external_account_address : address ):unit is
  block{
    if Tezos.source = external_account_address then skip else block{
        if Set.mem(Tezos.source,external_sub_acct.operators) then skip else failwith("FA2_NOT_OPERATOR");
    };
  }with unit

function is_contract_operator(const contract_address : address; const store: storage):unit is
block{
  if not Set.mem(contract_address,store.operators_contracts) then failwith("FA2_NOT_CONTRACT_OPERATOR") else skip;
}with unit;

function make_transfer( var acc : storage; const transferParam : transfer_param) : storage is 
block { 
  function transfer_tokens( const accumulator : storage; const destination : transfer_destination) : storage is 
  block { 
    validate_token_type_exist (destination.1.0, accumulator.token_ids);

    const token_amt : amt = destination.1.1;
    const token_id_param : token_id = destination.1.0;

    var from_account : account := getAccount(transferParam.0, accumulator);
    var to_account : account := getAccount(destination.0, accumulator);

    var from_sub_acct : sub_account := getSubAccount(destination.1.0,from_account);
    is_valid_operator(from_sub_acct,transferParam.0);
    var to_sub_acct : sub_account := getSubAccount(destination.1.0, to_account );

    if from_sub_acct.balance < token_amt then failwith("FA2_INSUFFICIENT_BALANCE") else skip;

    if token_id_param = default_token_id then

      block{  

        const n_from_sub_acct : sub_account = from_sub_acct with record [balance = abs(from_sub_acct.balance - token_amt)];
        const n_to_sub_acct : sub_account = to_sub_acct with record [balance = to_sub_acct.balance + token_amt];

        from_account := Map.update((token_id_param),Some(n_from_sub_acct),from_account);
        to_account := Map.update((token_id_param), Some(n_to_sub_acct), to_account);
      }
    else 
      block{        

        const n_from_sub_acct : sub_account = from_sub_acct with record [balance = 0n];
        const n_to_sub_acct : sub_account = to_sub_acct with record [balance = 1n];
        from_account := Map.update((token_id_param),Some(n_from_sub_acct),from_account);
        to_account := Map.update((token_id_param), Some(n_to_sub_acct), to_account);
      };

    var  updated_ledger : ledger := Big_map.update((transferParam.0), Some(from_account), accumulator.ledger);
    updated_ledger := Big_map.update((destination.0), Some(to_account), updated_ledger);  

  } with accumulator with record [ ledger =  updated_ledger ];
  const txs : list (transfer_destination) = transferParam.1;
  const ups : storage = List.fold(transfer_tokens, txs, acc);
} with (ups)
#endif