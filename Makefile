init: init.c wyliodrin_json/wyliodrin_json.c wyliodrin_json/wyliodrin_json.h
	gcc -Wall -g -DLOG -DERR wyliodrin_json/wyliodrin_json.c init.c -o init -ljansson
.PHONY: init

clean:
	rm -f init
.PHONY: clean
