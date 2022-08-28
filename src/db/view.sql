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

alter table v_mint_coin
    owner to archivarius;

grant select on v_mint_coin to archive_guest;

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

alter table v_mint_coin_all
    owner to archivarius;

grant select on v_mint_coin_all to archive_guest;

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

alter table v_transactions
    owner to archivarius;

grant select on v_transactions to archive_guest;

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

alter table v_transfer_coin
    owner to archivarius;

grant select on v_transfer_coin to archive_guest;

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

alter table v_transfer_coin_all
    owner to archivarius;

grant select on v_transfer_coin_all to archive_guest;

