#if !STD_HELPERS
#define STD_HELPERS

const noOperations : list (operation) = nil;
function fail_on (const condition : bool; const message : string) : unit is if condition then failwith (message) else unit;

#endif