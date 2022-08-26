create table archive_status
(
    version   bigint    default 0                 not null,
    timestamp timestamp default CURRENT_TIMESTAMP not null
);

create table transactions
(
    id                    bigserial
        constraint transactions_pk
            primary key,
    hash                  varchar                               not null,
    type                  trans_type default 'user'::trans_type not null,
    version               bigint                                not null,
    status                boolean                               not null,
    status_message        varchar,
    timestamp             timestamp                             not null,
    gas_used              bigint     default 0                  not null,
    state_root_hash       varchar,
    event_root_hash       varchar,
    accumulator_root_hash varchar,
    inserted_at           timestamp  default CURRENT_TIMESTAMP  not null
);

create table counters
(
    counter_type  varchar,
    counter_value bigint default 0 not null
);

create table user_transactions
(
    id                        bigint    default 0                 not null,
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

create table meta_transactions
(
    id                      bigint                              not null
        constraint meta_transactions_pk
            primary key,
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

create table state_transactions
(
    id bigint default 0 not null
        constraint state_transactions_pk
            primary key
);

create table payloads
(
    id             bigint  not null,
    function       varchar not null,
    type_arguments jsonb,
    arguments      jsonb,
    type           varchar
);

create table changes
(
    id             bigint,
    address        varchar,
    state_key_hash varchar,
    type           varchar,
    data           jsonb
);

create table events
(
    id              bigint,
    key             varchar,
    sequence_number bigint,
    type            varchar,
    data            jsonb
);

create table ledger
(
    chain_id     bigint    default 0 not null,
    version      bigint    default 0,
    epoch        bigint    default 0,
    timestamp    timestamp default CURRENT_TIMESTAMP,
    block_height bigint    default 0 not null
);

create table addresses
(
    id      bigint       default 0 not null
        constraint addresses_pk
            primary key,
    address varchar                not null,
    type    address_type default 'user'::address_type
);

create table gas_used
(
    function varchar          not null,
    gas      bigint default 0 not null
);

create table coin_counters
(
    function   varchar                             not null,
    coin_total bigint    default 0                 not null,
    coin_max   bigint    default 0                 not null,
    coin_min   bigint    default 0                 not null,
    coin_avg   bigint    default 0                 not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null
);


create sequence transactions_id_seq;
alter sequence transactions_id_seq owned by transactions.id;
