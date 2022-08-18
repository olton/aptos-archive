create function counter_reset_trigger() returns trigger
    language plpgsql
as
$$
DECLARE
	tableCounters text;
BEGIN
	tableCounters := 'counters';

	EXECUTE 'update ' || tableCounters || ' set counter_value = 0';
END
$$;

create function counter_update_trigger() returns trigger
    language plpgsql
as
$$
DECLARE
	tableCounters text;
BEGIN
	tableCounters := 'counters';

	IF TG_OP = 'INSERT' THEN
	    EXECUTE 'update ' || tableCounters || ' set counter_value = counter_value + 1 where type = $1'
        USING NEW.type;

        if (NEW.success = true) then
            EXECUTE 'update ' || tableCounters || ' set counter_value = counter_value + 1 where type = $1'
            USING 'success_transaction';
        elseif (NEW.success = false) then
            EXECUTE 'update ' || tableCounters || ' set counter_value = counter_value + 1 where type = $1'
            USING 'failed_transaction';
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

