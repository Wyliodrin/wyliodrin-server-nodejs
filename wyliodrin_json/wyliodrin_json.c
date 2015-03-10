/**************************************************************************************************
 * Working with JSONs
 *************************************************************************************************/

#include <fcntl.h>   /* open */
#include <unistd.h>  /* read, close */
#include <jansson.h> /* json_t stuff */

#include "wyliodrin_json.h"

json_t* decode_json_text(const char *filename) {
	char *buffer;       /* JSON text */
	json_t *root;       /* Main json_t object */ 
  json_error_t error; /* Error information */
  int fd;             /* File descriptor with JSON text */
  int ret_read;       /* Read return value */

  /* Allocate memory for buffer */
	buffer = (char*) calloc(BUFFER_SIZE, 1);
	if(buffer == NULL) {
		perror("[werr] Allocate memory for buffer");
		return NULL;
	}

	/* Open file with with JSON text */
	fd = open(filename, O_RDONLY);
	if(fd < 0) {
		perror("[werr] Open file with JSON text");
		free(buffer);
		return NULL;
	}

	/* Read JSON buffer */
	ret_read = read(fd, buffer, BUFFER_SIZE);
	if(ret_read < 0) {
		perror("[werr] Read JSON buffer");
		free(buffer);
		close(fd);
		return NULL;
	}

	/* Convert JSON buffer */
	root = json_loads(buffer, 0, &error);
	if(root == NULL) {
		perror("[werr] Convert JSON buffer");
		free(buffer);
		close(fd);
		return NULL;
	}

	/* Check if root is object */
	if(!json_is_object(root)) {
		perror("[werr] root must be object");
		free(buffer);
		close(fd);
		return NULL;	
	}

	/* Cleaning */
	free(buffer);
	close(fd);

	return root;
}
