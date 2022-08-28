create function addresses_reset_trigger() returns trigger
    language plpgsql
as
$$
BEGIN
    EXECUTE 'truncate table addresses restart identity cascade';
    return null;
END
$$;

alter function addresses_reset_trigger() owner to archivarius;

grant execute on function addresses_reset_trigger() to archive_guest;

create function addresses_update_trigger() returns trigger
    language plpgsql
as
$$
BEGIN
    EXECUTE 'insert into addresses (address, type) ' ||
            'values ($1, $2) '
        using NEW.sender, 'user'::address_type;
    return null;
exception when unique_violation then
    -- do nothing
    return null;
END
$$;

alter function addresses_update_trigger() owner to archivarius;

grant execute on function addresses_update_trigger() to archive_guest;

create function coin_counter_reset_trigger() returns trigger
    language plpgsql
as
$$
BEGIN
    EXECUTE 'update coin_counters ' ||
            'set coin_total = 0, coin_max = 0, coin_min = 0, coin_avg = 0 ' ||
            'where true';
    return null;
END
$$;

alter function coin_counter_reset_trigger() owner to archivarius;

grant execute on function coin_counter_reset_trigger() to archive_guest;

create function coin_counter_update_trigger() returns trigger
    language plpgsql
as
$$
-- payloads
declare
    amount text;
    function TEXT;
    version text;
BEGIN
    IF TG_OP = 'INSERT' THEN

        amount = replace(NEW.arguments[1]::text, '"', '');
        if (NEW.function = '0x1::coin::transfer') then
            function = 'transfer';
            execute 'update coin_counters ' ||
                    'set  coin_total = coin_total::bigint + $1::bigint, ' ||
                    'coin_max = greatest(coin_max::bigint, $1::bigint), ' ||
                    'coin_min = least(coin_min::bigint, $1::bigint),    ' ||
                    'coin_avg = (coin_min::bigint + $1::bigint) / 2     ' ||
                    'where function = $2 '
                using amount::bigint, function;
        end if;

        if (NEW.function = '0x1::aptos_coin::mint') then
            function = 'mint';
            execute 'update coin_counters ' ||
                    'set  coin_total = coin_total::bigint + $1::bigint, ' ||
                    'coin_max = greatest(coin_max::bigint, $1::bigint), ' ||
                    'coin_min = least(coin_min::bigint, $1::bigint),    ' ||
                    'coin_avg = (coin_min::bigint + $1::bigint) / 2     ' ||
                    'where function = $2 '
                using amount::bigint, function;
        end if;

        RETURN NEW;
    END IF;

EXCEPTION WHEN OTHERS
    THEN
        select version into version  from transactions where id = NEW.id;
        RAISE NOTICE 'ERROR CODE: %. MESSAGE TEXT: %, VERSION: %', SQLSTATE, SQLERRM, version;

END
$$;

alter function coin_counter_update_trigger() owner to archivarius;

grant execute on function coin_counter_update_trigger() to archive_guest;

create function collection_reset_trigger() returns trigger
    language plpgsql
as
$$
BEGIN
    EXECUTE 'truncate table collections restart identity cascade';
    return null;
END
$$;

alter function collection_reset_trigger() owner to archivarius;

grant execute on function collection_reset_trigger() to archive_guest;

create function collection_update_trigger() returns trigger
    language plpgsql
as
$$
declare
    function TEXT;
    success boolean;
    sender text;
BEGIN
    IF TG_OP = 'INSERT' THEN
        select t.success into success from transactions t where t.id = NEW.id;
        select t.sender into sender from user_transactions t where t.id = NEW.id;

        if (NEW.function = '0x3::token::create_collection_script' and success) then
            EXECUTE 'insert into collections(name, description, uri, size, address, fk_id) ' ||
                    'values($1, $2, $3, $4, $5, $6)'
                USING
                    replace(NEW.arguments[0]::text, '"', ''),
                    replace(NEW.arguments[1]::text, '"', ''),
                    replace(NEW.arguments[2]::text, '"', ''),
                    replace(NEW.arguments[3]::text, '"', ''),
                    sender,
                    NEW.id;
        end if;

        if (NEW.function = '0x3::token::create_token_script' and success) then
            EXECUTE 'insert into tokens(collection, name, description, deploy, size, uri, address, fk_id) ' ||
                    'values($1, $2, $3, $4, $5, $6, $7, $8)'
                USING
                    replace(NEW.arguments[0]::text, '"', ''),
                    replace(NEW.arguments[1]::text, '"', ''),
                    replace(NEW.arguments[2]::text, '"', ''),
                    replace(NEW.arguments[3]::text, '"', ''),
                    replace(NEW.arguments[4]::text, '"', ''),
                    replace(NEW.arguments[5]::text, '"', ''),
                    sender,
                    NEW.id;
        end if;

        RETURN NEW;
    END IF;
END
$$;

alter function collection_update_trigger() owner to archivarius;

grant execute on function collection_update_trigger() to archive_guest;

create function counter_reset_trigger() returns trigger
    language plpgsql
as
$$
BEGIN
    EXECUTE 'update counters set counter_value = 0 where true';
    return null;
END
$$;

alter function counter_reset_trigger() owner to archivarius;

grant execute on function counter_reset_trigger() to archive_guest;

create function counter_update_trigger() returns trigger
    language plpgsql
as
$$
declare
    function TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        EXECUTE 'update counters set counter_value = counter_value + 1 where counter_type::text = $1::text'
            USING 'total';

        if (NEW.type = 'genesis' or NEW.type = 'user' or NEW.type = 'meta' or NEW.type = 'state') then
            EXECUTE 'update counters set counter_value = counter_value + 1 where counter_type::text = $1::text'
                USING NEW.type;
        end if;

        if (NEW.success = true) then
            EXECUTE 'update counters set counter_value = counter_value + 1 where counter_type::text = $1::text'
                USING 'success';
        elseif (NEW.success = false) then
            EXECUTE 'update counters set counter_value = counter_value + 1 where counter_type::text = $1::text'
                USING 'failed';
        end if;

        if (NEW.type = 'user' and NEW.gas_used::bigint > 0) then
            function = 'gas';
            execute 'update coin_counters ' ||
                    'set  coin_total = coin_total::bigint + $1::bigint, ' ||
                    'coin_max = greatest(coin_max::bigint, $1::bigint), ' ||
                    'coin_min = least(coin_min::bigint, $1::bigint),    ' ||
                    'coin_avg = (coin_min::bigint + $1::bigint) / 2     ' ||
                    'where function = $2 '
                using NEW.gas_used::bigint, function;
        end if;

        if (NEW.gas_used::bigint > 0) then
            execute 'insert into gas_used(function, gas) values($1, $2) ' ||
                    'on conflict (function) do update ' ||
                    'set gas = gas_used.gas + $2 '
                using NEW.payload->>'function', NEW.gas_used;
        end if;

        RETURN NEW;
    END IF;
END
$$;

alter function counter_update_trigger() owner to archivarius;

grant execute on function counter_update_trigger() to archive_guest;

create function iif(condition boolean, true_result text, false_result text) returns text
    language plpgsql
as
$$
BEGIN
    IF condition THEN
        RETURN true_result;
    ELSE
        RETURN false_result;
    END IF;
END
$$;

alter function iif(boolean, text, text) owner to archivarius;

grant execute on function iif(boolean, text, text) to archive_guest;

create function isnumeric(text) returns boolean
    immutable
    strict
    language plpgsql
as
$$
DECLARE x NUMERIC;
BEGIN
    x = $1::NUMERIC;
    RETURN TRUE;
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;
$$;

alter function isnumeric(text) owner to archivarius;

grant execute on function isnumeric(text) to archive_guest;

