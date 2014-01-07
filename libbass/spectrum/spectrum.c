/*
	BASS spectrum analyser example
	Copyright (c) 2002-2012 Un4seen Developments Ltd.
*/

#include <gtk/gtk.h>
#include <string.h>
#include <regex.h>
#include <math.h>
#include "bass.h"

#define SPECWIDTH 368	// display width (should be multiple of 4)
#define SPECHEIGHT 127	// height (changing requires palette adjustments too)

#pragma pack(1)
typedef struct {
	BYTE rgbRed,rgbGreen,rgbBlue;
} RGB;
#pragma pack()

GtkWidget *win=0;

DWORD chan;

GtkWidget *speci;
GdkPixbuf *specpb;
RGB palette[256];

int specmode=0,specpos=0; // spectrum mode (and marker pos for 2nd mode)

// display error messages
void Error(const char *es)
{
	GtkWidget *dialog=gtk_message_dialog_new(GTK_WINDOW(win),GTK_DIALOG_DESTROY_WITH_PARENT,
		GTK_MESSAGE_ERROR,GTK_BUTTONS_OK,"%s\n(error code: %d)",es,BASS_ErrorGetCode());
	gtk_dialog_run(GTK_DIALOG(dialog));
	gtk_widget_destroy(dialog);
}

void WindowDestroy(GtkObject *obj, gpointer data)
{
	gtk_main_quit();
}

void WindowButtonRelease(GtkWidget *obj, GdkEventButton *event, gpointer data)
{
	if (event->type==GDK_BUTTON_RELEASE) {
		RGB *specbuf=(RGB*)gdk_pixbuf_get_pixels(specpb);
		specmode=(specmode+1)%4; // next spectrum mode
		memset(specbuf,0,SPECWIDTH*SPECHEIGHT*sizeof(*specbuf)); // clear display
	}
}

gboolean FileExtensionFilter(const GtkFileFilterInfo *info, gpointer data)
{
	return !regexec((regex_t*)data,info->filename,0,NULL,0);
}

// select a file to play, and play it
BOOL PlayFile()
{
	BOOL ret=FALSE;
	regex_t fregex;
	GtkWidget *filesel; // file selector
	GtkFileFilter *filter;
	filesel=gtk_file_chooser_dialog_new("Open File",GTK_WINDOW(win),GTK_FILE_CHOOSER_ACTION_OPEN,
		GTK_STOCK_CANCEL,GTK_RESPONSE_CANCEL,GTK_STOCK_OPEN,GTK_RESPONSE_ACCEPT,NULL);
	filter=gtk_file_filter_new();
	gtk_file_filter_set_name(filter,"Playable files");
	regcomp(&fregex,"\\.(mo3|xm|mod|s3m|it|umx|mp[1-3]|ogg|wav|aif)$",REG_ICASE|REG_NOSUB|REG_EXTENDED);
	gtk_file_filter_add_custom(filter,GTK_FILE_FILTER_FILENAME,FileExtensionFilter,&fregex,NULL);
	gtk_file_chooser_add_filter(GTK_FILE_CHOOSER(filesel),filter);
	filter=gtk_file_filter_new();
	gtk_file_filter_set_name(filter,"All files");
	gtk_file_filter_add_pattern(filter,"*");
	gtk_file_chooser_add_filter(GTK_FILE_CHOOSER(filesel),filter);
	if (gtk_dialog_run(GTK_DIALOG(filesel))==GTK_RESPONSE_ACCEPT) {
		char *file=gtk_file_chooser_get_filename(GTK_FILE_CHOOSER(filesel));
		gtk_widget_hide(filesel);
		if (!(chan=BASS_StreamCreateFile(FALSE,file,0,0,BASS_SAMPLE_LOOP))
			&& !(chan=BASS_MusicLoad(FALSE,file,0,0,BASS_MUSIC_RAMP|BASS_SAMPLE_LOOP,1))) {
			Error("Can't play file");
		} else {
			BASS_ChannelPlay(chan,FALSE);
			ret=TRUE;
		}
		g_free(file);
	}
	gtk_widget_destroy(filesel);
	return ret;
}

// update the spectrum display - the interesting bit :)
gboolean UpdateSpectrum(gpointer data)
{
	int x,y,y1;
	RGB *specbuf=(RGB*)gdk_pixbuf_get_pixels(specpb);

	if (specmode==3) { // waveform
		int c;
		float *buf;
		BASS_CHANNELINFO ci;
		memset(specbuf,0,SPECWIDTH*SPECHEIGHT*sizeof(*specbuf));
		BASS_ChannelGetInfo(chan,&ci); // get number of channels
		buf=alloca(ci.chans*SPECWIDTH*sizeof(float)); // allocate buffer for data
		BASS_ChannelGetData(chan,buf,(ci.chans*SPECWIDTH*sizeof(float))|BASS_DATA_FLOAT); // get the sample data (floating-point to avoid 8 & 16 bit processing)
		for (c=0;c<ci.chans;c++) {
			for (x=0;x<SPECWIDTH;x++) {
				int v=(1-buf[x*ci.chans+c])*SPECHEIGHT/2; // invert and scale to fit display
				if (v<0) v=0;
				else if (v>=SPECHEIGHT) v=SPECHEIGHT-1;
				if (!x) y=v;
				do { // draw line from previous sample...
					if (y<v) y++;
					else if (y>v) y--;
					specbuf[y*SPECWIDTH+x]=palette[c&1?127:1]; // left=green, right=red (could add more colours to palette for more chans)
				} while (y!=v);
			}
		}
	} else {
		float fft[1024];
		BASS_ChannelGetData(chan,fft,BASS_DATA_FFT2048); // get the FFT data

		if (!specmode) { // "normal" FFT
			memset(specbuf,0,SPECWIDTH*SPECHEIGHT*sizeof(*specbuf));
			for (x=0;x<SPECWIDTH/2;x++) {
#if 1
				y=sqrt(fft[x+1])*3*SPECHEIGHT-4; // scale it (sqrt to make low values more visible)
#else
				y=fft[x+1]*10*SPECHEIGHT; // scale it (linearly)
#endif
				if (y>SPECHEIGHT) y=SPECHEIGHT; // cap it
				if (x && (y1=(y+y1)/2)) // interpolate from previous to make the display smoother
					while (--y1>=0) specbuf[(SPECHEIGHT-1-y1)*SPECWIDTH+x*2-1]=palette[y1+1];
				y1=y;
				while (--y>=0) specbuf[(SPECHEIGHT-1-y)*SPECWIDTH+x*2]=palette[y+1]; // draw level
			}
		} else if (specmode==1) { // logarithmic, acumulate & average bins
			int b0=0;
			memset(specbuf,0,SPECWIDTH*SPECHEIGHT*sizeof(*specbuf));
#define BANDS 28
			for (x=0;x<BANDS;x++) {
				float peak=0;
				int b1=pow(2,x*10.0/(BANDS-1));
				if (b1>1023) b1=1023;
				if (b1<=b0) b1=b0+1; // make sure it uses at least 1 FFT bin
				for (;b0<b1;b0++)
					if (peak<fft[1+b0]) peak=fft[1+b0];
				y=sqrt(peak)*3*SPECHEIGHT-4; // scale it (sqrt to make low values more visible)
				if (y>SPECHEIGHT) y=SPECHEIGHT; // cap it
				while (--y>=0)
					for (y1=0;y1<SPECWIDTH/BANDS-2;y1++)
						specbuf[(SPECHEIGHT-1-y)*SPECWIDTH+x*(SPECWIDTH/BANDS)+y1]=palette[y+1]; // draw bar
			}
		} else { // "3D"
			for (x=0;x<SPECHEIGHT;x++) {
				y=sqrt(fft[x+1])*3*127; // scale it (sqrt to make low values more visible)
				if (y>127) y=127; // cap it
				specbuf[(SPECHEIGHT-1-x)*SPECWIDTH+specpos]=palette[128+y]; // plot it
			}
			// move marker onto next position
			specpos=(specpos+1)%SPECWIDTH;
			for (x=0;x<SPECHEIGHT;x++) specbuf[x*SPECWIDTH+specpos]=palette[255];
		}
	}

	gtk_image_set_from_pixbuf(GTK_IMAGE(speci),specpb); // update the display

	return TRUE;
}

int main(int argc, char* argv[])
{
	gtk_init(&argc,&argv);

	// check the correct BASS was loaded
	if (HIWORD(BASS_GetVersion())!=BASSVERSION) {
		Error("An incorrect version of BASS was loaded");
		return 0;
	}

	// initialize BASS
	if (!BASS_Init(-1,44100,0,NULL,NULL)) {
		Error("Can't initialize device");
		return 0;
	}

	if (!PlayFile()) { // start a file playing
		BASS_Free();
		return 0;
	}

	// create the window
	win=gtk_window_new(GTK_WINDOW_TOPLEVEL);
	gtk_window_set_position(GTK_WINDOW(win),GTK_WIN_POS_CENTER);
	gtk_window_set_resizable(GTK_WINDOW(win),FALSE);
	gtk_window_set_title(GTK_WINDOW(win),"BASS spectrum example (click to toggle mode)");
	g_signal_connect(win,"destroy",GTK_SIGNAL_FUNC(WindowDestroy),NULL);

	GtkWidget *ebox=gtk_event_box_new();
	gtk_container_add(GTK_CONTAINER(win),ebox);
	g_signal_connect(ebox,"button-release-event",GTK_SIGNAL_FUNC(WindowButtonRelease),NULL);

	// create the bitmap
	specpb=gdk_pixbuf_new(GDK_COLORSPACE_RGB,FALSE,8,SPECWIDTH,SPECHEIGHT);
	speci=gtk_image_new_from_pixbuf(specpb);
	gtk_container_add(GTK_CONTAINER(ebox),speci);

	{ // setup palette
		RGB *pal=palette;
		int a;
		memset(palette,0,sizeof(palette));
		for (a=1;a<128;a++) {
			pal[a].rgbGreen=256-2*a;
			pal[a].rgbRed=2*a;
		}
		for (a=0;a<32;a++) {
			pal[128+a].rgbBlue=8*a;
			pal[128+32+a].rgbBlue=255;
			pal[128+32+a].rgbRed=8*a;
			pal[128+64+a].rgbRed=255;
			pal[128+64+a].rgbBlue=8*(31-a);
			pal[128+64+a].rgbGreen=8*a;
			pal[128+96+a].rgbRed=255;
			pal[128+96+a].rgbGreen=255;
			pal[128+96+a].rgbBlue=8*a;
		}
	}

	// setup update timer (40hz)
	g_timeout_add(25,UpdateSpectrum,NULL);

	gtk_widget_show_all(win);
	gtk_main();

	gdk_pixbuf_unref(specpb);

	BASS_Free();

	return 0;
}
