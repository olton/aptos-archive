create table addresses
(
    id      bigserial
        constraint addresses_pk
            primary key,
    address varchar not null,
    type    address_type default 'user'::address_type
);

alter table addresses
    owner to archivarius;

create unique index ui_addresses_value
    on addresses (address);

grant select on addresses to archive_guest;

create table archive_status
(
    version   bigint    default 0                 not null,
    timestamp timestamp default CURRENT_TIMESTAMP not null
);

alter table archive_status
    owner to archivarius;

grant select on archive_status to archive_guest;

create table changes
(
    id             bigint
        constraint fk_changes_transaction
            references transactions
            on update cascade on delete cascade,
    address        varchar,
    state_key_hash varchar,
    type           varchar,
    data           jsonb
);

alter table changes
    owner to archivarius;

create index idx_changes_address
    on changes (address);

create index idx_changes_id
    on changes (id);

create index idx_changes_type
    on changes (type);

grant select on changes to archive_guest;

create table coin_counters
(
    function   varchar                             not null,
    coin_total bigint    default 0                 not null,
    coin_max   bigint    default 0                 not null,
    coin_min   bigint    default 0                 not null,
    coin_avg   bigint    default 0                 not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null
);

alter table coin_counters
    owner to archivarius;

grant select on coin_counters to archive_guest;

create table collections
(
    id          bigserial
        primary key,
    name        varchar           not null,
    address     varchar           not null,
    description varchar,
    size        varchar default 0 not null,
    uri         varchar,
    fk_id       bigint  default 0 not null
);

alter table collections
    owner to archivarius;

create unique index ui_collections_name
    on collections (address, name);

create index fk_collections_transaction_id
    on collections (fk_id);

grant select on collections to archive_guest;

create table counters
(
    counter_type  varchar,
    counter_value bigint default 0 not null
);

alter table counters
    owner to archivarius;

grant select on counters to archive_guest;

create table events
(
    id              bigint
        constraint fk_events_transaction
            references transactions
            on update cascade on delete cascade,
    key             varchar,
    sequence_number bigint,
    type            varchar,
    data            jsonb
);

alter table events
    owner to archivarius;

create index idx_events_id
    on events (id);

create index idx_events_key
    on events (key);

create index idx_events_sn
    on events (sequence_number);

create index idx_events_type
    on events (type);

grant select on events to archive_guest;

create table gas_used
(
    function varchar
        unique,
    gas      bigint default 0 not null
);

alter table gas_used
    owner to archivarius;

grant select on gas_used to archive_guest;

create table ledger
(
    chain_id     bigint    default 0 not null,
    version      bigint    default 0,
    epoch        bigint    default 0,
    timestamp    timestamp default CURRENT_TIMESTAMP,
    block_height bigint    default 0 not null
);

alter table ledger
    owner to archivarius;

grant select on ledger to archive_guest;

create table meta_transactions
(
    id                      bigint                              not null
        constraint fk_meta_transactions_transaction
            references transactions
            on update cascade on delete cascade,
    tr_id                   varchar                             not null,
    epoch                   bigint    default 0                 not null,
    round                   bigint    default 0                 not null,
    proposer                varchar                             not null,
    timestamp               timestamp                           not null,
    changes                 jsonb,
    events                  jsonb,
    previous_block_votes    jsonb,
    failed_proposer_indices jsonb,
    inserted_at             timestamp default CURRENT_TIMESTAMP not null
);

alter table meta_transactions
    owner to archivarius;

create index idx_meta_transactions_epoch
    on meta_transactions (epoch);

create index idx_meta_transactions_proposer
    on meta_transactions (proposer);

create index idx_meta_transactions_round
    on meta_transactions (round);

create index idx_meta_transactions_timestamp
    on meta_transactions (timestamp);

create index idx_meta_transactions_tr_id
    on meta_transactions (tr_id);

create unique index ui_meta_transactions_id
    on meta_transactions (id);

grant select on meta_transactions to archive_guest;

create table payloads
(
    id             bigint not null
        constraint fk_payloads_transaction
            references transactions
            on update cascade on delete cascade,
    function       varchar,
    type_arguments jsonb,
    arguments      jsonb,
    type           varchar
);

alter table payloads
    owner to archivarius;

create index idx_payloads_function
    on payloads (function);

create index idx_payloads_id
    on payloads (id);

create index idx_payloads_type
    on payloads (type);

create constraint trigger coin_counter_update_trigger
    after insert
    on payloads
    deferrable initially deferred
    for each row
execute procedure coin_counter_update_trigger();

create trigger coin_counter_reset_trigger
    after truncate
    on payloads
execute procedure coin_counter_reset_trigger();

create trigger collection_reset_trigger
    after truncate
    on payloads
execute procedure collection_reset_trigger();

create constraint trigger collection_update_trigger
    after insert
    on payloads
    deferrable initially deferred
    for each row
execute procedure collection_update_trigger();

grant select on payloads to archive_guest;

create table state_transactions
(
    id bigint default 0 not null
);

alter table state_transactions
    owner to archivarius;

grant select on state_transactions to archive_guest;

create table tokens
(
    id          bigserial
        primary key,
    address     varchar           not null,
    collection  varchar           not null,
    name        varchar           not null,
    description varchar,
    deploy      varchar default 0 not null,
    size        varchar default 0 not null,
    fk_id       bigint,
    uri         varchar
);

alter table tokens
    owner to archivarius;

create index idx_tokens_transaction_id
    on tokens (fk_id);

create unique index ui_tokens_name
    on tokens (address, collection, name);

grant select on tokens to archive_guest;

create table transactions
(
    id                    bigserial
        constraint transactions_pk
            primary key,
    hash                  varchar                              not null,
    type                  trans_type default 'user'::trans_type,
    version               bigint                               not null,
    success               boolean                              not null,
    vm_status             varchar,
    timestamp             timestamp,
    gas_used              bigint     default 0                 not null,
    state_root_hash       varchar,
    event_root_hash       varchar,
    accumulator_root_hash varchar,
    inserted_at           timestamp  default CURRENT_TIMESTAMP not null,
    payload               jsonb,
    events                jsonb,
    changes               jsonb
);

alter table transactions
    owner to archivarius;

create index idx_transactions_gas_used
    on transactions (gas_used);

create index idx_transactions_status
    on transactions (success);

create index idx_transactions_timestamp
    on transactions (timestamp);

create index idx_transactions_type
    on transactions (type);

create unique index ui_transactions_hash
    on transactions (hash);

create unique index ui_transactions_version
    on transactions (version);

create trigger counter_reset_trigger
    after truncate
    on transactions
execute procedure counter_reset_trigger();

create constraint trigger counter_update_trigger
    after insert
    on transactions
    deferrable initially deferred
    for each row
execute procedure counter_update_trigger();

grant select on transactions to archive_guest;

create table user_transactions
(
    id                        bigint    default 0                 not null
        constraint fk_user_transactions_transaction
            references transactions
            on update cascade on delete cascade,
    changes                   json,
    sender                    varchar                             not null,
    sequence_number           bigint    default 0,
    max_gas_amount            bigint    default 0,
    gas_unit_price            bigint    default 0,
    expiration_timestamp_secs bigint,
    payload                   jsonb,
    signature                 jsonb,
    events                    jsonb,
    inserted_at               timestamp default CURRENT_TIMESTAMP not null,
    timestamp                 timestamp
);

alter table user_transactions
    owner to archivarius;

create index idx_user_transactions_expiration
    on user_transactions (expiration_timestamp_secs);

create index idx_user_transactions_sender
    on user_transactions (sender);

create index idx_user_transactions_sequence_number
    on user_transactions (sequence_number);

create index idx_user_transactions_timestamp
    on user_transactions (timestamp);

create unique index ui_user_transactions_id
    on user_transactions (id);

create trigger addresses_reset_trigger
    after truncate
    on user_transactions
execute procedure addresses_reset_trigger();

create constraint trigger addresses_update_trigger
    after insert
    on user_transactions
    deferrable initially deferred
    for each row
execute procedure addresses_update_trigger();

grant select on user_transactions to archive_guest;

