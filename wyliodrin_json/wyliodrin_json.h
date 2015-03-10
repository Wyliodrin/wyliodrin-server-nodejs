/**************************************************************************************************
 * Working with JSONs
 *************************************************************************************************/

#ifndef _WYLIODRIN_JSON
#define _WYLIODRIN_JSON

#define BUFFER_SIZE (1 * 1024) /* 1 KB */

#define SETTINGS_PATH  "./etc/settings.json"  /* Settings file path */

/**
 * Open <filename>, read the JSON buffer, convert it to json_t and return it.
 *
 * PARAMETERS:
 * 		filename - filename where json data in buffer format is
 *
 * RETURN:
 * 		pointer to converted json_t or NULL in case of errors  
 */
json_t* decode_json_text(const char *filename);

#endif // _WYLIODRIN_JSON 
