/**************************************************************************************************
 * Internals of Wyliodrin: typedefs, logs, errors, etc.
 *************************************************************************************************/

#ifndef _INTERNALS
#define _INTERNALS

/* Data types */
typedef signed char    int8_t;
typedef short int      int16_t;
typedef int            int32_t;
typedef unsigned char  uint8_t;
typedef unsigned short int uint16_t;
typedef unsigned int   uint32_t;

#define LOG_FILE stdout
#define ERR_FILE stderr

/* Wylidrin log used when execution enters and leaves a function */
#ifdef LOG
  #define wlog(msg, ...) fprintf(LOG_FILE, "[wlog in %s:%d] " msg "\n", __FILE__, __LINE__, ##__VA_ARGS__);
#else
  #define wlog(msg, ...) /* Do nothing */
#endif

/* Wylidrin err used when execution is inside a function */
#ifdef ERR
  #define werr(msg, ...) fprintf(ERR_FILE, "[werr in %s:%d] " msg "\n", __FILE__, __LINE__, ##__VA_ARGS__);
#else
  #define werr(msg, ...) /* Do nothing */
#endif

#endif // _INTERNALS 
