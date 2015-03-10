/**************************************************************************************************
 * Initialization stuff
 *************************************************************************************************/

#include <stdio.h>   /* printf */
#include <jansson.h> /* json_t stuff */
#include <string.h>  /* strcmp */
#include <unistd.h>  /* sleep */

#include "wyliodrin_json/wyliodrin_json.h"

#define SLEEP_NO_CONFIG 10 * 60 /* 10 minutes of sleep in case of no config file */

/**
 * Init wyliodrin client
 */
void init() {
	/* Decode settings JSON */
	json_t *settings = decode_json_text(SETTINGS_PATH); /* Settings JSON */
	if(settings == NULL) {
		perror("[werr] Decode settings");
		return;
	}

	/* Check whether config_file exists or not */
	json_t *config_file = json_object_get(settings, "config_file"); /* config_file object */
	if(!json_is_string(config_file)) {
		perror("[werr] Settings file should contain config_file");
		json_decref(settings);
		return;
	}
	const char *config_file_txt = json_string_value(config_file); /* config_file text */
	if(strcmp(config_file_txt, "") == 0) {
		perror("[werr] No config file");
		json_decref(settings);

		/* Sleep and try again */
		sleep(SLEEP_NO_CONFIG);
		return init();
	}

	/* Decode config JSON */
	json_t *config = decode_json_text(config_file_txt); /* config_file JSON */
	if(config == NULL) {
		perror("[werr] Decode config");
		json_decref(settings);
		return;
	}

	/* Do stuff */
	printf("Owner: %s\n", json_string_value(json_object_get(config, "owner")));

	/* Cleaning */
	json_decref(settings);
	json_decref(config);
}

int main(int argc, char *argv[]) {
	init();

	return 0;
}
