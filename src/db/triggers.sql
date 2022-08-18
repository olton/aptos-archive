create constraint trigger counter_update_trigger
    after insert
    on transactions
    deferrable initially deferred
    for each row
execute procedure counter_update_trigger();

create trigger counter_reset_trigger
    after truncate
    on transactions
execute procedure counter_reset_trigger();

