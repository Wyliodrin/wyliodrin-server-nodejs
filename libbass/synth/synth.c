/*
	BASS simple synth
	Copyright (c) 2001-2012 Un4seen Developments Ltd.
*/

#include <gtk/gtk.h>
#include <gdk/gdkkeysyms.h>
#include <glade/glade.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "bass.h"

// path to glade file
#ifndef GLADE_PATH
#define GLADE_PATH ""
#endif

GladeXML *glade;
GtkWidget *win=0;

BASS_INFO info;
HSTREAM stream;		// the stream

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

#define KEYS 20
const guint keys[KEYS]={
	'Q','2','W','3','E','R','5','T','6','Y','7','U',
	'I','9','O','0','P', GDK_bracketleft, GDK_equal, GDK_bracketright
};
#define MAXVOL 0.22
#define DECAY (MAXVOL/4000)
float vol[KEYS]={0},pos[KEYS]; // keys' volume and pos

const DWORD fxtype[5]={BASS_FX_DX8_CHORUS,BASS_FX_DX8_DISTORTION,BASS_FX_DX8_ECHO,BASS_FX_DX8_FLANGER,BASS_FX_DX8_REVERB};
HFX fx[5]={0}; // effect handles

// display error messages
void Error(const char *es)
{
	GtkWidget *dialog=gtk_message_dialog_new(GTK_WINDOW(win),GTK_DIALOG_DESTROY_WITH_PARENT,
		GTK_MESSAGE_ERROR,GTK_BUTTONS_OK,"%s\n(error code: %d)",es,BASS_ErrorGetCode());
	gtk_dialog_run(GTK_DIALOG(dialog));
	gtk_widget_destroy(dialog);
}

#define GetWidget(id) glade_xml_get_widget(glade,id)

void WindowDestroy(GtkObject *obj, gpointer data)
{
	gtk_main_quit();
}

DWORD CALLBACK WriteStream(HSTREAM handle, float *buffer, DWORD length, void *user)
{
	int k,c;
	float omega,s;
	memset(buffer,0,length);
	for (k=0;k<KEYS;k++) {
		if (!vol[k]) continue;
		omega=2*M_PI*pow(2.0,(k+3)/12.0)*440.0/info.freq;
		for (c=0;c<length/sizeof(float);c+=2) {
			buffer[c]+=sin(pos[k])*vol[k];
			buffer[c+1]=buffer[c]; // left and right channels are the same
			pos[k]+=omega;
			if (vol[k]<MAXVOL) {
				vol[k]-=DECAY;
				if (vol[k]<=0) { // faded-out
					vol[k]=0;
					break;
				}
			}
		}
		pos[k]=fmod(pos[k],2*M_PI);
	}
	return length;
}

void BufferChanged(GtkRange *range, gpointer data)
{
	// update buffer length
	BASS_SetConfig(BASS_CONFIG_BUFFER,10+info.minbuf+pow(2,gtk_range_get_value(range)/10.f)-1);
	// recreate stream with new buffer length
	BASS_StreamFree(stream);
	stream=BASS_StreamCreate(info.freq,2,BASS_SAMPLE_FLOAT,(STREAMPROC*)WriteStream,0);
	if (GTK_TOGGLE_BUTTON(GetWidget("nobuffer"))->active)
		BASS_ChannelSetAttribute(stream,BASS_ATTRIB_NOBUFFER,1); // re-apply NOBUFFER
	{ // re-apply effects
		int a;
		for (a=0;a<5;a++)
			if (fx[a]) fx[a]=BASS_ChannelSetFX(stream,fxtype[a],0);
	}
	BASS_ChannelPlay(stream,0);
	{
		char text[20];
		sprintf(text,"%dms",BASS_GetConfig(BASS_CONFIG_BUFFER));
		gtk_label_set_text(GTK_LABEL(GetWidget("bufferlen")),text);
	}
}

void NoBufferToggled(GtkToggleButton *obj, gpointer data)
{
	DWORD on=obj->active;
	BASS_ChannelSetAttribute(stream,BASS_ATTRIB_NOBUFFER,on);
	BASS_SetConfig(BASS_CONFIG_UPDATETHREADS,on?0:1); // no need for an update thread when NOBUFFER is enabled
}

void FXToggled(GtkToggleButton *obj, gpointer data)
{ // toggle effects
	const gchar *objname=gtk_widget_get_name(GTK_WIDGET(obj));
	int n=atoi(objname+2);
	if (fx[n]) {
		BASS_ChannelRemoveFX(stream,fx[n]);
		fx[n]=0;
	} else
		fx[n]=BASS_ChannelSetFX(stream,fxtype[n],0);
}

gboolean KeyHandler(GtkWidget *grab_widget, GdkEventKey *event, gpointer data)
{
	int key,kv=event->keyval;
	if (kv>='a' && kv<='z') kv-=0x20;
	for (key=0;key<KEYS;key++) {
		if (kv==keys[key]) {
			if (event->type==GDK_KEY_PRESS && vol[key]<MAXVOL) {
				pos[key]=0;
				vol[key]=MAXVOL+DECAY/2; // start key (setting "vol" slightly higher than MAXVOL to cover any rounding-down)
			} else if (event->type==GDK_KEY_RELEASE && vol[key])
				vol[key]-=DECAY; // trigger key fadeout
			break;
		}
	}
	return FALSE;
}

int main(int argc, char* argv[])
{
	gtk_init(&argc,&argv);

	// check the correct BASS was loaded
	if (HIWORD(BASS_GetVersion())!=BASSVERSION) {
		Error("An incorrect version of BASS was loaded");
		return 0;
	}

	// 10ms update period
	BASS_SetConfig(BASS_CONFIG_UPDATEPERIOD,10);

	// initialize default output device
	if (!BASS_Init(-1,44100,BASS_DEVICE_LATENCY,NULL,NULL)) {
		Error("Can't initialize device");
		return 0;
	}

	// initialize GUI
	glade=glade_xml_new(GLADE_PATH"synth.glade",NULL,NULL);
	if (!glade) return 0;
	win=GetWidget("window1");
	if (!win) return 0;
	glade_xml_signal_autoconnect(glade);

	BASS_GetInfo(&info);
	// default buffer size = update period + 'minbuf'
	BASS_SetConfig(BASS_CONFIG_BUFFER,10+info.minbuf);
	// create a stream, stereo so that effects sound nice
	stream=BASS_StreamCreate(info.freq,2,BASS_SAMPLE_FLOAT,(STREAMPROC*)WriteStream,0);
	BASS_ChannelPlay(stream,FALSE);

	{
		char text[64];
		sprintf(text,"device latency: %dms\ndevice minbuf: %dms",info.latency,info.minbuf);
		gtk_label_set_text(GTK_LABEL(GetWidget("latency")),text);
		sprintf(text,"%dms",BASS_GetConfig(BASS_CONFIG_BUFFER));
		gtk_label_set_text(GTK_LABEL(GetWidget("bufferlen")),text);
	}

	g_signal_connect(win,"key-press-event",G_CALLBACK(KeyHandler),NULL);
	g_signal_connect(win,"key-release-event",G_CALLBACK(KeyHandler),NULL);

	gtk_main();

	BASS_Free();

    return 0;
}
