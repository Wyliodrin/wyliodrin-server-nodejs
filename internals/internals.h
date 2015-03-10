/**************************************************************************************************
 * Internals of Wyliodrin: logs, etc.
 *************************************************************************************************/

#ifndef _INTERNALS
#define _INTERNALS

#define LOG_OUT stdout

/* Wylidrin log */
#ifdef LOG
  #define wlog(msg, ...) fprintf(LOG_OUT, "[wlog in %s:%d] " msg "\n", __FILE__, __LINE__, ##__VA_ARGS__);
#else
  #define wlog(msg, ...) /* Do nothing */
#endif

#endif // _INTERNALS 
