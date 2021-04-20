#if !FA2_ACTIONS
#define FA2_ACTIONS
#include "fa2_interfaces.ligo"

type fa2_utils_entry_points is 
| Mint of mint_params
| Burn of burn_params
| SetOperatorsContracts of set_operator_contract_params
| SetContractAccount of operator_param

type fa2_entry_points is
  Transfer                of transfer_params
| Balance_of              of balance_of_params
| Update_operators        of update_operator_params
// | Token_metadata_registry of token_metadata_registry_params
// | Permissions_descriptor  of permissions_descriptor_params

// | Is_operator             of is_operator_params


type fa2_hooks_entry_points is 
| Transferhook of hook_transfert_param
| Nil of address

type closed_parameter is
| Fa2              of fa2_entry_points
| Asset            of fa2_utils_entry_points
| Hooks            of fa2_hooks_entry_points



#endif