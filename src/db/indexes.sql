create unique index transactions_hash_uindex
    on transactions (hash);

create unique index transactions_version_uindex
    on transactions (version);
