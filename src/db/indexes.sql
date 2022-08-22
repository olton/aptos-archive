-- Transactions
create unique index ui_transactions_hash on transactions (hash);
create unique index ui_transactions_version on transactions (version);
create index idx_changes_address on changes (address);
create index idx_changes_trans_id on changes (id);
create index idx_changes_type on changes (type);
create index idx_transactions_gas_used on transactions (gas_used);
create index idx_transactions_status on transactions (status);
create index idx_transactions_timestamp on transactions (timestamp);
create index idx_transactions_type on transactions (type);

-- User Transactions
alter table user_transactions
    add constraint fk_user_transactions_transaction
        foreign key (id) references transactions
            on update cascade on delete cascade;

create index idx_user_transactions_expiration on user_transactions (expiration_timestamp_secs);
create index idx_user_transactions_sender on user_transactions (sender);
create index idx_user_transactions_sequence_number on user_transactions (sequence_number);
create index idx_user_transactions_timestamp on user_transactions (timestamp);
create unique index ui_user_transactions_id on user_transactions (id);

-- Meta Transactions
alter table meta_transactions
    add constraint fk_meta_transactions_transaction
        foreign key (id) references transactions
            on update cascade on delete cascade;

create index idx_meta_transactions_epoch on meta_transactions (epoch);
create index idx_meta_transactions_proposer on meta_transactions (proposer);
create index idx_meta_transactions_round on meta_transactions (round);
create index idx_meta_transactions_timestamp on meta_transactions (timestamp);
create index idx_meta_transactions_tr_id on meta_transactions (tr_id);
create unique index ui_meta_transactions_id on meta_transactions (id);

-- Changes
alter table changes
    add constraint fk_changes_transaction
        foreign key (id) references transactions
            on update cascade on delete cascade;

create index idx_changes_address on changes (address);
create index idx_changes_id on changes (id);
create index idx_changes_type on changes (type);

-- Events
create index idx_events_id on events (id);
create index idx_events_key on events (key);
create index idx_events_sn on events (sequence_number);
create index idx_events_type on events (type);

alter table events
    add constraint fk_events_transaction
        foreign key (id) references transactions
            on update cascade on delete cascade;

-- Payloads
create index idx_payloads_function on payloads (function);
create index idx_payloads_id on payloads (id);
create index idx_payloads_type on payloads (type);

alter table payloads
    add constraint fk_payloads_transaction
        foreign key (id) references transactions
            on update cascade on delete cascade;

