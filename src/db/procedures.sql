create function counter_reset_trigger() returns trigger
    language plpgsql
as
$$
BEGIN
	EXECUTE 'update counters set counter_value = 0';
END
$$;

create function counter_update_trigger() returns trigger
    language plpgsql
as
$$
BEGIN
	IF TG_OP = 'INSERT' THEN
	    EXECUTE 'update counters set counter_value = counter_value + 1 where type = $1'
        USING NEW.type;

        if (NEW.success = true) then
            EXECUTE 'update counters set counter_value = counter_value + 1 where type = $1'
            USING 'success_transaction';
        elseif (NEW.success = false) then
            EXECUTE 'update counters set counter_value = counter_value + 1 where type = $1'
            USING 'failed_transaction';
        end if;

	    if (NEW.gas_used::bigint > 0) then
            execute 'insert into gas_used(function, gas) values($1, $2)'
	        using NEW.payload->>'function', NEW.gas_used;
        end if;
		RETURN NEW;
	END IF;
END
$$;

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

CREATE FUNCTION isnumeric(text) RETURNS BOOLEAN AS $$
DECLARE x NUMERIC;
BEGIN
    x = $1::NUMERIC;
    RETURN TRUE;
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;
$$
STRICT
LANGUAGE plpgsql IMMUTABLE;
