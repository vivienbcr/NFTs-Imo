#if !FA2_HOOKS
#define FA2_HOOKS
#include "fa2_interfaces.ligo"
#include "fa2_helpers.ligo"
(* Hook - Transfer  
| Resolve list of transfer from contract with callback
| Restricted to operators contract *)
function transfer_hook(const params : hook_transfert_param; var store : storage):entrypoint is
block{
  
  is_contract_operator(Tezos.sender,store);
  //FIXME function is same as make transfer but cannot be deploy without error
  function fixme_make_transfer( var acc : storage; const transferParam : transfer_param) : storage is 
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
} with (ups);
  const tx_list : transfer_params = params.0;
  const call_back_contract:hook_transfer_callback_contract = params.1;
  store := List.fold (fixme_make_transfer, tx_list, store);
  const transfer_operation : operation = Tezos.transaction (tx_list, 0mutez, call_back_contract);
}with (list [transfer_operation],store)



#endif