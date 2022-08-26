insert into counters(counter_type, counter_value) values('user_transaction', 0);
insert into counters(counter_type, counter_value) values('block_metadata_transaction', 0);
insert into counters(counter_type, counter_value) values('genesis_transaction', 0);
insert into counters(counter_type, counter_value) values('state_checkpoint_transaction', 0);
insert into counters(counter_type, counter_value) values('failed_transaction', 0);
insert into counters(counter_type, counter_value) values('success_transaction', 0);

insert into archive_status(version, timestamp) values(1, CURRENT_TIMESTAMP);

insert into coin_counters(function, coin_total, coin_max, coin_min, coin_avg) values('transfer', 0, 0, 100, 0);
insert into coin_counters(function, coin_total, coin_max, coin_min, coin_avg) values('mint', 0, 0, 100, 0);