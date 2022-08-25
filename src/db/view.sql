create view v_transfer_coin(id, sender, receiver, amount, timestamp) as
SELECT pl.id,
       ut.sender,
       replace(pl.arguments[0]::text, '"'::text, ''::text) AS receiver,
       replace(pl.arguments[1]::text, '"'::text, ''::text) AS amount,
       ut."timestamp"
FROM payloads pl
         LEFT JOIN user_transactions ut ON ut.id = pl.id
         LEFT JOIN transactions t ON pl.id = t.id
WHERE pl.function::text ~~ '%::coin::transfer'::text
  AND t.success = true;

create view v_transfer_coin_all(id, sender, receiver, amount, timestamp) as
SELECT pl.id,
       ut.sender,
       replace(pl.arguments[0]::text, '"'::text, ''::text) AS receiver,
       replace(pl.arguments[1]::text, '"'::text, ''::text) AS amount,
       ut."timestamp"
FROM payloads pl
         LEFT JOIN user_transactions ut ON ut.id = pl.id
         LEFT JOIN transactions t ON pl.id = t.id
WHERE pl.function::text ~~ '%::coin::transfer'::text;

create view v_transactions
            (id, type, version, hash, success, vm_status, timestamp, gas_used, payload, events, changes) as
SELECT t.id,
       t.type,
       t.version,
       t.hash,
       t.success,
       t.vm_status,
       t."timestamp",
       t.gas_used,
       t.payload,
       t.events,
       t.changes
FROM transactions t;

create view v_mint_coin(id, sender, receiver, amount, timestamp) as
SELECT pl.id,
       ut.sender,
       replace(pl.arguments[0]::text, '"'::text, ''::text) AS receiver,
       replace(pl.arguments[1]::text, '"'::text, ''::text) AS amount,
       ut."timestamp"
FROM payloads pl
         LEFT JOIN user_transactions ut ON ut.id = pl.id
         LEFT JOIN transactions t ON pl.id = t.id
WHERE pl.function::text ~~ '0x1::aptos_coin::mint'::text
AND t.success = true;

create view v_mint_coin_all(id, sender, receiver, amount, timestamp) as
SELECT pl.id,
       ut.sender,
       replace(pl.arguments[0]::text, '"'::text, ''::text) AS receiver,
       replace(pl.arguments[1]::text, '"'::text, ''::text) AS amount,
       ut."timestamp"
FROM payloads pl
         LEFT JOIN user_transactions ut ON ut.id = pl.id
         LEFT JOIN transactions t ON pl.id = t.id
WHERE pl.function::text ~~ '0x1::aptos_coin::mint'::text;


